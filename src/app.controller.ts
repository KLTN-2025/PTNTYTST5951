import { Controller, Get } from '@nestjs/common';
import { AuthenticatedUser, Unprotected } from 'nest-keycloak-connect';

@Controller()
export class AppController {
  @Get('public')
  @Unprotected()
  health() {
    return { ok: true };
  }

  @Get('me')
  me(@AuthenticatedUser() user: unknown) {
    return { message: 'You are authenticated', user: user };
  }
}
