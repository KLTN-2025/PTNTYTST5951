import { Injectable } from '@nestjs/common';
import {
  HumanName,
  ContactPoint,
  Identifier,
  CodeSystem,
  CodeSystemConcept,
  Bundle,
} from 'fhir/r4';
import { FhirService } from './fhir.service';
export type BasicCodeSystem = {
  system: string;
  code: string;
  display: string;
  children?: BasicCodeSystem[];
};

@Injectable()
export class FhirHelperService {
  constructor(private readonly fhirService: FhirService) {}
  humanNameConverter(name: string): HumanName[] {
    const parts = name.split(' ');
    return [
      {
        use: 'official',
        text: name,
        family: parts.pop() || '',
        given: parts.map(
          (part) => part.charAt(0).toUpperCase() + part.slice(1),
        ),
      },
    ];
  }
  contactPointConverter({
    phone,
    email,
    url,
    use,
  }: {
    phone?: string;
    email?: string;
    url?: string;
    use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
  }): ContactPoint[] {
    const contactPoints: ContactPoint[] = [];
    if (phone) {
      contactPoints.push({
        system: 'phone',
        value: phone,
        use: use,
      });
    }
    if (email) {
      contactPoints.push({
        system: 'email',
        value: email,
        use: use,
      });
    }
    if (url) {
      contactPoints.push({
        system: 'url',
        value: url,
        use: use,
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
    url?: string;
  } {
    const result: {
      phone?: string;
      email?: string;
      url?: string;
    } = {};
    contactPoints?.forEach((cp) => {
      if (cp.system === 'phone') {
        result.phone = cp.value;
      } else if (cp.system === 'email') {
        result.email = cp.value;
      } else if (cp.system === 'url') {
        result.url = cp.value;
      }
    });
    return result;
  }
  identifierToString(identifiers: Identifier[]): {
    citizenIdentification?: string;
    userId?: string;
  } {
    const result: {
      citizenIdentification?: string;
      userId?: string;
    } = {};
    identifiers.forEach((id) => {
      if (id.system === 'https://beetamin.hivevn.net/fhir/sid/vn-national-id') {
        result.citizenIdentification = id.value;
      } else if (id.system === 'https://id.hivevn.net/identifier') {
        result.userId = id.value;
      }
    });
    return result;
  }
  convertCodeSystem(codeSystem: CodeSystem): BasicCodeSystem[] {
    const system = codeSystem.url ?? '';

    function convertConcept(concept: CodeSystemConcept): BasicCodeSystem {
      const node: BasicCodeSystem = {
        system,
        code: concept.code,
        display: concept.display ?? concept.code ?? '',
      };

      if (concept.concept && concept.concept.length > 0) {
        node.children = concept.concept.map((c) => convertConcept(c));
      }

      return node;
    }

    return (codeSystem.concept ?? []).map((c) => convertConcept(c));
  }
  async findCodeSystemByUrl(url: string): Promise<BasicCodeSystem[]> {
    const documentTypes: BasicCodeSystem[] = [];
    const documentTypesBundle: Bundle<CodeSystem> =
      await this.fhirService.search('CodeSystem', {
        url,
      });
    if (documentTypesBundle.entry && documentTypesBundle.entry.length > 0) {
      const codeSystem = documentTypesBundle.entry[0].resource;
      if (codeSystem) {
        const convertConcept = this.convertCodeSystem(codeSystem);
        documentTypes.push(...convertConcept);
      }
    }
    return documentTypes;
  }
}
