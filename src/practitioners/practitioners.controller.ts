import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { PractitionersService } from './practitioners.service';
import { PractitionerUser } from 'src/commons/decorators/user.decorator';
import { PractitionerDto } from './dtos/pratitioner.dto';
import { UpdatePatientQualificationDto } from './dtos/qualification.dto';
import {
  PractitionerQualificationDto,
  PractitionerQualificationTypeDto,
} from './dtos/qualification.dto';
import { RegisterOrganizationDto } from 'src/organizations/dtos/register-organization.dto';
import { PractitionerOrganizationDto } from 'src/organizations/dtos/practitioner-organization.dto';

@Controller('practitioners')
export class PractitionersController {
  constructor(private readonly practitionersService: PractitionersService) {}

  @Get('me')
  getMyPractitioner(@PractitionerUser() user: PractitionerUser) {
    console.log('PractitionerUser', user.practitionerId);
    return this.practitionersService.getPractitionerInfo(user.practitionerId);
  }

  @Put('me')
  updateMyPractitioner(
    @PractitionerUser() user: PractitionerUser,
    @Body() updateData: PractitionerDto,
  ) {
    console.log('PractitionerUser', user.practitionerId);
    return this.practitionersService.updatePractitionerInfo(
      user.userId,
      user.practitionerId,
      updateData,
    );
  }

  @Get('qualification/document-types')
  async getPractitionerQualificationDocumentType(): Promise<
    PractitionerQualificationTypeDto[]
  > {
    return await this.practitionersService.getPractitionerDocumentType();
  }

  @Post('qualification')
  async addPractitionerQualification(
    @PractitionerUser() user: PractitionerUser,
    @Body() body: UpdatePatientQualificationDto,
  ) {
    return await this.practitionersService.updatePractitionerQualification({
      practitionerId: user.practitionerId,
      type: 'ADD',
      data: body,
    });
  }

  @Put('qualification')
  async updatePractitionerQualification(
    @PractitionerUser() user: PractitionerUser,
    @Body() body: UpdatePatientQualificationDto,
  ) {
    return await this.practitionersService.updatePractitionerQualification({
      practitionerId: user.practitionerId,
      type: 'UPDATE',
      data: body,
    });
  }

  @Get('qualifications')
  async getMyPractitionerQualifications(
    @PractitionerUser() user: PractitionerUser,
  ): Promise<PractitionerQualificationDto[]> {
    return await this.practitionersService.getPractitionerQualifications(user);
  }

  @Delete('qualification/:id')
  async deletePractitionerQualification(
    @PractitionerUser() user: PractitionerUser,
    @Param('id') id: string,
  ) {
    console.log('PractitionerUser', user.practitionerId);
    console.log('Delete qualification id', id);
    return await this.practitionersService.deletePractitionerQualification(
      user.practitionerId,
      id,
    );
  }

  @Post('register-organization')
  async registerOrganization(
    @PractitionerUser() user: PractitionerUser,
    @Body() body: RegisterOrganizationDto,
  ) {
    await this.practitionersService.registerOrganization(
      user.practitionerId,
      body,
    );
    return { message: 'Organization registration submitted successfully' };
  }

  @Get('organizations')
  async getMyOrganizations(
    @PractitionerUser() user: PractitionerUser,
  ): Promise<PractitionerOrganizationDto[]> {
    return await this.practitionersService.getMyOrganizations(
      user.practitionerId,
    );
  }
}
