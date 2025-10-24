import { Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { IdentitiesModule } from 'src/identities/identities.module';

@Module({
  controllers: [PatientsController],
  providers: [PatientsService],
  imports: [IdentitiesModule],
})
export class PatientsModule {}
