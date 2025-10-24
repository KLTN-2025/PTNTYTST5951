import { Module } from '@nestjs/common';
import { PractitionersService } from './practitioners.service';
import { PractitionersController } from './practitioners.controller';

@Module({
  controllers: [PractitionersController],
  providers: [PractitionersService],
})
export class PractitionersModule {}
