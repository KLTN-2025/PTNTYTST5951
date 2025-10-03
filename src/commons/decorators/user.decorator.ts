import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRole } from '../enums/role.enum';

export interface User {
  id?: string;
  beetaminId: string;
}

interface RequestWithUser {
  user: {
    sub: string; // Keycloak user ID
    patient_id?: string; // Custom attribute for patient ID
    practitioner_id?: string; // Custom attribute for practitioner ID
    // Add other user properties if needed
  };
}

export const User = createParamDecorator(
  (data: { role: UserRole }, ctx: ExecutionContext) => {
    const request: RequestWithUser = ctx.switchToHttp().getRequest();
    if (!request.user.sub)
      throw new UnauthorizedException('User not authenticated');
    if (data.role === UserRole.PRACTITIONER) {
      return {
        id: request.user.practitioner_id,
        beetaminId: request.user.sub,
      };
    } else if (data.role === UserRole.PATIENT) {
      return {
        id: request.user.patient_id,
        beetaminId: request.user.sub,
      };
    }
    return { beetaminId: request.user.sub };
  },
);
