import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { IdentitiesService } from './identities.service';
import { InitIdentitiesInfoDto } from './dtos/identities-info.dto';
import { AuthUser } from 'src/commons/decorators/user.decorator';
import { UserRole } from 'src/commons/enums/role.enum';

@Controller('identities')
export class IdentitiesController {
  constructor(private readonly identitiesService: IdentitiesService) {}

  @Post(':role')
  async createIdentity(
    @AuthUser() user: AuthUser,
    @Body() identityInfo: InitIdentitiesInfoDto,
    @Param('role') role: string,
  ): Promise<any> {
    let clientRole: UserRole;
    if (role === 'patient') {
      clientRole = UserRole.PATIENT;
    } else if (role === 'practitioner') {
      clientRole = UserRole.PRACTITIONER;
    } else {
      throw new NotFoundException('Role not found');
    }
    const identity = await this.identitiesService.createNewUser(
      user,
      identityInfo,
      clientRole,
    );
    return identity;
  }
}
