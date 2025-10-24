import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '../enums/role.enum';
import { Request } from 'express';

export interface KeycloakUser {
  exp: number;
  iat: number;
  auth_time: number;
  jti: string;
  iss: string;
  aud: string;
  sub: string;
  typ: string;
  azp: string;
  sid: string;
  acr: string;
  'allowed-origins': string[];
  realm_access: {
    roles: string[];
  };
  resource_access: Record<string, { roles: string[] }>;
  scope: string;
  email_verified: boolean;
  name: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  email: string;
  beetaminId?: string;
}

export interface User {
  id: string;
  beetaminId?: string;
  roles?: string[];
}

export const User = createParamDecorator(
  (data: { role: UserRole }, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    const user = request.user as KeycloakUser;
    return {
      id: user.sub,
      beetaminId: user.beetaminId,
      roles: user.realm_access.roles,
    };
  },
);
