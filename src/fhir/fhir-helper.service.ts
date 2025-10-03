import { Injectable } from '@nestjs/common';
import { HumanName, ContactPoint, Identifier } from 'fhir/r5';

@Injectable()
export class FhirHelperService {
  constructor() {}
  humanNameConverter(name: string): HumanName {
    const parts = name.split(' ');
    return {
      use: 'official',
      text: name,
      family: parts.pop() || '',
      given: parts.map((part) => part.charAt(0).toUpperCase() + part.slice(1)),
    };
  }
  contactPointConverter({
    phone,
    email,
  }: {
    phone?: string;
    email?: string;
  }): ContactPoint[] {
    const contactPoints: ContactPoint[] = [];
    if (phone) {
      contactPoints.push({
        system: 'phone',
        value: phone,
      });
    }
    if (email) {
      contactPoints.push({
        system: 'email',
        value: email,
      });
    }
    return contactPoints;
  }

  identifierConverter({
    citizenIdentification,
    beetaminId,
  }: {
    citizenIdentification: string;
    beetaminId: string;
  }): Identifier[] {
    const identifiers: Identifier[] = [];
    if (citizenIdentification) {
      identifiers.push({
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
              code: 'NNVNM',
              display: 'National Person Identifier (Vietnam)',
            },
          ],
        },
        system: 'https://beetamin.hivevn.net/fhir/sid/vn-national-id',
        value: citizenIdentification,
      });
    }
    if (beetaminId) {
      identifiers.push({
        use: 'official',
        type: {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
              code: 'PI',
              display: 'Patient Internal Identifier',
            },
          ],
        },
        system: 'https://beetamin.hivevn.net/fhir/sid/beetamin-id',
        value: beetaminId,
      });
    }
    return identifiers;
  }
}
