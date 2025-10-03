import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  KeycloakConnectModule,
  AuthGuard,
  KeycloakConnectOptions,
} from 'nest-keycloak-connect';
import { APP_GUARD } from '@nestjs/core';
import { KeycloakAdminService } from './keycloak-admin.service';

@Module({
  imports: [
    KeycloakConnectModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): KeycloakConnectOptions => {
        const protocol = config.get<string>('KEYCLOAK_PROTOCOL');
        const host = config.get<string>('KEYCLOAK_HOST');
        const port = config.get<number>('KEYCLOAK_PORT');
        const realm = config.get<string>('KEYCLOAK_REALM');
        const clientId = config.get<string>('KEYCLOAK_CLIENT_ID');
        const secret = config.get<string>('KEYCLOAK_CLIENT_SECRET');

        if (!protocol || !host || !port || !realm || !clientId || !secret) {
          throw new Error(
            'Keycloak environment variables must be defined in env',
          );
        }
        return {
          authServerUrl: `${protocol}://${host}:${port}`,
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
  ],
  exports: [KeycloakAdminService],
})
export class AuthModule {}
