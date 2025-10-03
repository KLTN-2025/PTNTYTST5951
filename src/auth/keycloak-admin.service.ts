import KeycloakAdminClient from '@keycloak/keycloak-admin-client';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from 'src/commons/enums/role.enum';

@Injectable()
export class KeycloakAdminService implements OnModuleInit {
  private readonly logger = new Logger(KeycloakAdminService.name);
  private kc: KeycloakAdminClient;
  private loaded = false;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    await this.ensureClientLoaded();
    await this.authenticate();
  }

  private get baseUrl() {
    return this.config.get<string>(
      'KEYCLOAK_BASE_URL',
      'http://localhost:8181',
    );
  }

  private get realmName() {
    return this.config.get<string>('KEYCLOAK_REALM', 'beetamin');
  }

  private async ensureClientLoaded() {
    if (this.loaded && this.kc) return;
    const { default: KcAdminClient } = await import(
      '@keycloak/keycloak-admin-client'
    );
    this.kc = new KcAdminClient({
      baseUrl: this.baseUrl,
      realmName: this.realmName,
    });
    this.loaded = true;
  }

  private async authenticate() {
    await this.ensureClientLoaded();

    await this.kc.auth({
      grantType: 'client_credentials',
      clientId: this.config.get<string>(
        'KEYCLOAK_ADMIN_CLIENT_ID',
        'admin-nestjs-client',
      ),
      clientSecret: this.config.get<string>('KEYCLOAK_ADMIN_CLIENT_SECRET'),
    });
  }

  // ====== Expose Keycloak Admin API ======
  private async findGroupByName(name: string) {
    const results = await this.kc.groups.find({
      realm: this.realmName,
      search: name,
    });
    return results.find((g) => g.name === name) || results[0];
  }
  private async setUserAttribute(userId: string, key: string, value: string) {
    const user = await this.kc.users.findOne({
      id: userId,
      realm: this.realmName,
    });
    const attrs: Record<string, any> = user?.attributes
      ? { ...user.attributes }
      : {};
    attrs[key] = [String(value)];
    await this.kc.users.update(
      { realm: this.realmName, id: userId },
      { attributes: attrs },
    );
  }
  private async addUserToGroup(
    userId: string,
    groupName: string,
  ): Promise<void> {
    const group = await this.findGroupByName(groupName);
    if (!group?.id) throw new Error(`Group '${groupName}' not found`);

    await this.kc.users.addToGroup({
      realm: this.realmName,
      id: userId,
      groupId: group.id,
    });
  }
  private async removeUserFromGroup(
    userId: string,
    groupName: string,
  ): Promise<void> {
    const group = await this.findGroupByName(groupName);
    if (!group?.id) throw new Error(`Group '${groupName}' not found`);
    await this.kc.users.delFromGroup({
      realm: this.realmName,
      id: userId,
      groupId: group.id,
    });
  }

  public async assignUser(
    beetaminId: string,
    userRoleId: string,
    roleType: UserRole,
  ): Promise<void> {
    await this.addUserToGroup(beetaminId, roleType);
    await this.setUserAttribute(beetaminId, `${roleType}_id`, userRoleId);
  }
}
