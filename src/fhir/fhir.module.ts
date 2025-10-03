import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FhirService } from './fhir.service';
import { FhirHelperService } from './fhir-helper.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.get<string>('HAPI_FHIR_URL'),
        timeout: 8000,
        headers: {
          'Content-Type': 'application/fhir+json',
          Accept: 'application/fhir+json',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [FhirService, FhirHelperService],
  exports: [FhirService, FhirHelperService],
})
export class FhirModule {}
