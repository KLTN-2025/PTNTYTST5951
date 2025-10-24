import { Module } from '@nestjs/common';
import { IdentitiesService } from './identities.service';
import { IdentitiesController } from './identities.controller';
import { FhirModule } from 'src/fhir/fhir.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [FhirModule, AuthModule],
  controllers: [IdentitiesController],
  providers: [IdentitiesService],
  exports: [IdentitiesService],
})
export class IdentitiesModule {}
