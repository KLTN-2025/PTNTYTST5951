import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { IdentitiesModule } from './identities/identities.module';
import { FhirModule } from './fhir/fhir.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PatientsModule } from './patients/patients.module';
import { PractitionersModule } from './practitioners/practitioners.module';
import { AdminsModule } from './admins/admins.module';
import { ObservationsModule } from './observations/observations.module';
import { MedicalRecordsModule } from './medical_records/medical_records.module';
@Module({
  imports: [
    AuthModule,
    IdentitiesModule,
    FhirModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PatientsModule,
    PractitionersModule,
    AdminsModule,
    ObservationsModule,
    MedicalRecordsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
