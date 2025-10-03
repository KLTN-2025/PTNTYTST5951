import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { IdentitiesService } from './identities.service';
import { InitIdentitiesInfoDto } from './dtos/identities-info.dto';
import { User } from 'src/commons/decorators/user.decorator';
import { UserRole } from 'src/commons/enums/role.enum';

@Controller('identities')
export class IdentitiesController {
  constructor(private readonly identitiesService: IdentitiesService) {}

  @Get()
  getIdentities() {
    return { status: 'ok' };
  }

  @Patch()
  patchIdentities() {}

  @Post(':role')
  async createNewUser(
    @User() user: User,
    @Param('role') role: UserRole,
    @Body() body: InitIdentitiesInfoDto,
  ) {
    if (role !== UserRole.PATIENT && role !== UserRole.PRACTITIONER) {
      throw new NotFoundException('Role not found');
    }
    return await this.identitiesService.createNewUser(user, body, role);
  }
}
