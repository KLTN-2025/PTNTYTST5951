import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Request } from 'express';
import { Bundle, Patient, Practitioner } from 'fhir/r4';

export type AuthUser = {
  userId: string;
  roles: string[];
  patientId?: string;
  practitionerId?: string;
};
type RequestWithUser = Request & {
  user: {
    sub: string;
    realm_access: {
      roles: string[];
    };
  };
};

const findUserByResourceIdentifier = async (
  hiveId: string,
  resourceType: 'Patient' | 'Practitioner',
) => {
  const response = await fetch(
    `http://localhost:8080/fhir/${resourceType}?identifier=https://id.hivevn.net/identifier|${hiveId}`,
  );
  if (!response.ok) {
    throw new ServiceUnavailableException(
      `Failed to fetch ${resourceType} in FHIR server`,
    );
  }
  const data = (await response.json()) as Bundle<Patient | Practitioner>;
  if (data.total === 0 || !data.entry) {
    return null;
  }
  return data.entry[0].resource;
};

const findUserByResourceId = async (
  resourceId: string,
  resourceType: 'Patient' | 'Practitioner',
): Promise<Patient | Practitioner | null> => {
  const response = await fetch(
    `http://localhost:8080/fhir/${resourceType}/${resourceId}`,
  );
  if (!response.ok) {
    if (response.status === 404 || response.status === 410) {
      return null;
    } else {
      throw new ServiceUnavailableException(
        `Failed to fetch resource ${resourceId} in FHIR server`,
      );
    }
  }
  const data = (await response.json()) as Patient | Practitioner;
  if (data.resourceType === 'Patient' || data.resourceType === 'Practitioner') {
    return data;
  }
  return null;
};

const getUserFromRequest = async (ctx: ExecutionContext): Promise<AuthUser> => {
  const request: RequestWithUser = ctx.switchToHttp().getRequest();
  const patientId = request.header('X-Patient-ID');
  const practitionerId = request.header('X-Practitioner-ID');
  const { sub, realm_access } = request.user;
  const user: AuthUser = {
    userId: sub,
    roles: realm_access.roles,
  };
  const patient = patientId
    ? await findUserByResourceId(patientId, 'Patient')
    : (await findUserByResourceIdentifier(sub, 'Patient')) || null;
  if (patient && patient.id) {
    // check patient.identifier to match hiveId
    const hiveId = patient.identifier?.find(
      (id) => id.system === 'https://id.hivevn.net/identifier',
    )?.value;
    if (hiveId !== sub) {
      return user;
    }
    user.patientId = patient.id;
  }
  const practitioner = practitionerId
    ? await findUserByResourceId(practitionerId, 'Practitioner')
    : (await findUserByResourceIdentifier(sub, 'Practitioner')) || null;
  if (practitioner && practitioner.id) {
    user.practitionerId = practitioner.id;
  }
  return user;
};

export const AuthUser = createParamDecorator(
  async (_: unknown, ctx: ExecutionContext) => {
    const user = await getUserFromRequest(ctx);
    return user;
  },
);

export type PatientUser = {
  userId: string;
  patientId: string;
};

export const PatientUser = createParamDecorator(
  async (_data: unknown, ctx: ExecutionContext) => {
    const user = await getUserFromRequest(ctx);
    if (!user.patientId) {
      throw new ForbiddenException('User does not have a patient resource');
    }
    return {
      userId: user.userId,
      patientId: user.patientId,
    } as PatientUser;
  },
);

export type PractitionerUser = {
  userId: string;
  practitionerId: string;
};

export const PractitionerUser = createParamDecorator(
  async (_data: unknown, ctx: ExecutionContext) => {
    const user = await getUserFromRequest(ctx);
    if (!user.practitionerId) {
      throw new ForbiddenException(
        'User does not have a practitioner resource',
      );
    }
    return {
      userId: user.userId,
      practitionerId: user.practitionerId,
    } as PractitionerUser;
  },
);
