import KcAdminClient, { NetworkError } from '@keycloak/keycloak-admin-client';
import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type UserRepresentation from '@keycloak/keycloak-admin-client/lib/defs/userRepresentation';
import { UserRole } from 'src/commons/enums/role.enum';

type Attrs = Record<string, string[]>;

@Injectable()
export class KeycloakAdminService implements OnModuleInit {
  private readonly logger = new Logger(KeycloakAdminService.name);

  private kc: KcAdminClient | null = null;
  private initPromise: Promise<void> | null = null;

  // Cache groupName -> groupId
  private groupIdCache = new Map<string, string>();
  private readonly groupCacheTTLms = 5 * 60 * 1000;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    await this.init();
  }

  // ========= Internal =========

  private get baseUrl(): string {
    const val = this.config.get<string>('KEYCLOAK_BASE_URL');
    if (val) return val;
    throw new Error('Missing KEYCLOAK_BASE_URL');
  }

  private get realm(): string {
    const val = this.config.get<string>('KEYCLOAK_REALM');
    if (val) return val;
    throw new Error('Missing KEYCLOAK_REALM');
  }

  private get clientId(): string {
    const val = this.config.get<string>('KEYCLOAK_CLIENT_ID');
    if (val) return val;
    throw new Error('Missing KEYCLOAK_CLIENT_ID');
  }

  private get clientSecret(): string {
    const val = this.config.get<string>('KEYCLOAK_CLIENT_SECRET');
    if (val) return val;
    throw new Error('Missing KEYCLOAK_CLIENT_SECRET');
  }

  //* Khởi tạo client + authenticate (idempotent)
  private async init(): Promise<void> {
    if (this.kc) return;
    if (!this.initPromise) {
      this.initPromise = (async () => {
        const kc = new KcAdminClient({
          baseUrl: this.baseUrl,
          realmName: this.realm,
        });

        await kc.auth({
          grantType: 'client_credentials',
          clientId: this.clientId,
          clientSecret: this.clientSecret,
        });

        kc.setConfig({ realmName: this.realm });
        this.kc = kc;
        this.logger.log(
          `Keycloak authenticated (realm=${this.realm}, baseUrl=${this.baseUrl}).`,
        );
      })().catch((err) => {
        this.initPromise = null;
        throw err;
      });
    }
    await this.initPromise;
  }
  private async kcClient(): Promise<KcAdminClient> {
    await this.init();
    if (!this.kc) throw new Error('Keycloak client not initialized');
    return this.kc;
  }

  // New: wrapper to auto re-authenticate once on 401 and retry
  private isUnauthorizedError(err: NetworkError): boolean {
    if (!err) return false;
    const status = err.response?.status;
    return status === 401 || status === 403;
  }

  private async request<T>(fn: (kc: KcAdminClient) => Promise<T>): Promise<T> {
    try {
      const kc = await this.kcClient();
      return await fn(kc);
    } catch (err) {
      if (err instanceof NetworkError && this.isUnauthorizedError(err)) {
        this.logger.warn(
          'Keycloak request unauthorized. Re-authenticating and retrying...',
        );
        this.kc = null;
        await this.init();
        const kc = await this.kcClient();
        return await fn(kc);
      }
      throw err;
    }
  }

  //* Lấy groupId từ groupName
  private async getGroupIdByName(groupName: string): Promise<string | null> {
    const cached = this.groupIdCache.get(groupName);
    if (cached) return cached;

    const groups = await this.request((kc) =>
      kc.groups.find({
        search: groupName,
        briefRepresentation: true,
      }),
    );

    const match = groups?.find((g) => g.name === groupName);
    const id = match?.id ?? null;

    if (id) this.groupIdCache.set(groupName, id);
    return id;
  }

  //* Gán user vào group theo role và set roleUserId vào attributes
  async assignUser(
    userId: string,
    userIdByRole: string,
    roleType: UserRole,
  ): Promise<void> {
    const groupName =
      roleType === UserRole.ADMIN
        ? 'Admins'
        : roleType === UserRole.PATIENT
          ? 'Patients'
          : roleType === UserRole.PRACTITIONER
            ? 'Practitioners'
            : undefined;

    if (!groupName) {
      throw new BadRequestException(`Unsupported role type: ${roleType}`);
    }
    await this.addUserToGroup(userId, groupName);
    await this.mergeUserAttributes(userId, {
      [`${roleType}Id`]: [userIdByRole],
    });
  }

  /** Thêm user vào group (tạo group nếu chưa có) */
  async addUserToGroup(userId: string, groupName: string): Promise<void> {
    const groupId = await this.getGroupIdByName(groupName);
    if (!groupId) {
      throw new Error(`Group not found: ${groupName}`);
    }
    await this.request((kc) => kc.users.addToGroup({ id: userId, groupId }));
    this.logger.log(
      `Added user ${userId} to group "${groupName}" (${groupId})`,
    );
  }

  //** Gỡ user khỏi group (nếu có)
  async removeUserFromGroup(userId: string, groupName: string): Promise<void> {
    const groupId = await this.getGroupIdByName(groupName);
    if (!groupId) {
      throw new Error(`Group not found: ${groupName}`);
    }
    await this.request((kc) => kc.users.delFromGroup({ id: userId, groupId }));
    this.logger.log(
      `Removed user ${userId} from group "${groupName}" (${groupId})`,
    );
  }

  //* Merge attributes
  async mergeUserAttributes(
    userId: string,
    incoming: Record<string, string[]>,
  ): Promise<void> {
    const user = await this.request((kc) => kc.users.findOne({ id: userId }));
    if (!user) throw new Error(`User not found: ${userId}`);

    const attrs = user.attributes ?? {};

    const mergedAttrs: Attrs = { ...attrs };
    for (const [key, values] of Object.entries(incoming)) {
      if (mergedAttrs[key]) {
        const existingSet = new Set(mergedAttrs[key]);
        for (const v of values) {
          existingSet.add(v);
        }
        mergedAttrs[key] = Array.from(existingSet);
      } else {
        mergedAttrs[key] = values;
      }
    }
    await this.request((kc) =>
      kc.users.update({ id: userId }, {
        ...user,
        attributes: mergedAttrs,
      } as UserRepresentation),
    );
    this.logger.log(`Updated attributes for user ${userId}`);
  }
}
