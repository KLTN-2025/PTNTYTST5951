import { Controller, Get } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { AuthUser } from 'src/commons/decorators/user.decorator';
import { Roles } from 'nest-keycloak-connect';

@Controller('admins')
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get('me')
  @Roles({ roles: ['Admin'] })
  getMe(@AuthUser() userAuth: AuthUser) {
    return userAuth;
  }
}
