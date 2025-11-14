import { Injectable } from '@nestjs/common';
import { HumanName, ContactPoint, Identifier } from 'fhir/r4';

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
    userId,
  }: {
    citizenIdentification: string;
    userId: string;
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
    if (userId) {
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
        system: 'https://id.hivevn.net/identifier',
        value: userId,
      });
    }
    return identifiers;
  }
  humanNameToString(humanName?: HumanName[]): string {
    if (!humanName || humanName.length === 0) return '';
    const name = humanName[0];
    let fullName = '';
    if (name.given && name.given.length > 0) {
      fullName += name.given.join(' ') + ' ';
    }
    if (name.family) {
      fullName += name.family;
    }
    return fullName.trim();
  }
  contactPointToString(contactPoints?: ContactPoint[]): {
    phone?: string;
    email?: string;
  } {
    const result: { phone?: string; email?: string } = {};
    contactPoints?.forEach((cp) => {
      if (cp.system === 'phone') {
        result.phone = cp.value;
      } else if (cp.system === 'email') {
        result.email = cp.value;
      }
    });
    return result;
  }
}
