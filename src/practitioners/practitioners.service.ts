import { Injectable } from '@nestjs/common';
import { Practitioner } from 'fhir/r4';
import { FhirHelperService } from 'src/fhir/fhir-helper.service';
import { FhirService } from 'src/fhir/fhir.service';

@Injectable()
export class PractitionersService {
  constructor(
    private readonly fhirService: FhirService,
    private readonly fhirHelper: FhirHelperService,
  ) {}

  async getPractitioner(id: string): Promise<Practitioner> {
    const practitioner: Practitioner =
      await this.fhirService.read<Practitioner>('Practitioner', id);
    return practitioner;
  }
}
