import { Module } from '@nestjs/common';
import { IdentitiesModule } from './identities/identities.module';
import { FhirModule } from './fhir/fhir.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PatientsModule } from './patients/patients.module';
import { PractitionersModule } from './practitioners/practitioners.module';
import { AdminsModule } from './admins/admins.module';
import { ObservationsModule } from './observations/observations.module';
import { MedicalRecordsModule } from './medical_records/medical_records.module';
import { QuestionnairesModule } from './questionnaires/questionnaires.module';
import { S3Module } from './s3/s3.module';
import { AssetsModule } from './assets/assets.module';
import { OrganizationsModule } from './organizations/organizations.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    IdentitiesModule,
    FhirModule,
    PatientsModule,
    PractitionersModule,
    AdminsModule,
    ObservationsModule,
    MedicalRecordsModule,
    QuestionnairesModule,
    S3Module,
    AssetsModule,
    OrganizationsModule,
  ],
})
export class AppModule {}
