import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  KeycloakConnectModule,
  AuthGuard,
  KeycloakConnectOptions,
  RoleGuard,
  ResourceGuard,
} from 'nest-keycloak-connect';
import { APP_GUARD } from '@nestjs/core';
import { KeycloakAdminService } from './keycloak-admin.service';

@Module({
  imports: [
    KeycloakConnectModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): KeycloakConnectOptions => {
        const keycloakBaseUrl = config.get<string>('KEYCLOAK_BASE_URL');
        const realm = config.get<string>('KEYCLOAK_REALM');
        const clientId = config.get<string>('KEYCLOAK_CLIENT_ID');
        const secret = config.get<string>('KEYCLOAK_CLIENT_SECRET');

        if (!keycloakBaseUrl || !realm || !clientId || !secret) {
          throw new Error(
            'Keycloak environment variables must be defined in env',
          );
        }
        return {
          authServerUrl: keycloakBaseUrl,
          realm,
          clientId,
          secret,
          bearerOnly: true,
        };
      },
    }),
  ],
  providers: [
    KeycloakAdminService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ResourceGuard,
    },
  ],
  exports: [KeycloakAdminService],
})
export class AuthModule {}
