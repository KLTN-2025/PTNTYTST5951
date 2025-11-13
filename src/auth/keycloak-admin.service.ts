/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import KcAdminClient from '@keycloak/keycloak-admin-client';

@Injectable()
export class KeycloakAdminService {
  private readonly logger = new Logger(KeycloakAdminService.name);

  // ENV
  private readonly realm = process.env.KEYCLOAK_REALM!;
  private readonly clientId = process.env.KEYCLOAK_CLIENT_ID!;
  private readonly clientSecret = process.env.KEYCLOAK_CLIENT_SECRET!;
  private readonly clientBaseUrl = process.env.KEYCLOAK_BASE_URL!;

  // Keycloak admin client (dùng singleton)
  private readonly kc: KcAdminClient;

  // Token cache
  private accessTokenExpiresAt = 0;
  private authPromise: Promise<void> | null = null;
  private readonly expirySkewMs = 15_000;
  private readonly defaultTokenTtlMs = 60_000;

  constructor() {
    this.kc = new KcAdminClient({
      baseUrl: this.clientBaseUrl,
      realmName: this.realm,
    });
  }
  private async ensureAuth(force = false): Promise<void> {
    const now = Date.now();
    if (!force && now < this.accessTokenExpiresAt - this.expirySkewMs) {
      return;
    }
    if (!this.authPromise) {
      this.authPromise = (async () => {
        await this.kc.auth({
          grantType: 'client_credentials',
          clientId: this.clientId,
          clientSecret: this.clientSecret,
        });
        this.kc.setConfig({ realmName: this.realm });

        const expSec = this.getAccessTokenExp(this.kc.accessToken);
        this.accessTokenExpiresAt = expSec
          ? expSec * 1000
          : now + this.defaultTokenTtlMs;

        this.logger.debug(
          `Authenticated. accessTokenExpiresAt=${new Date(
            this.accessTokenExpiresAt,
          ).toISOString()}`,
        );
      })().finally(() => {
        this.authPromise = null;
      });
    }
    await this.authPromise;
  }
  private async withAuthRetry<T>(fn: () => Promise<T>): Promise<T> {
    await this.ensureAuth();
    try {
      return await fn();
    } catch (err: any) {
      if (this.isAuthError(err)) {
        this.logger.warn(
          'Auth error detected. Re-authenticating and retrying once...',
        );
        this.accessTokenExpiresAt = 0; // buộc re-auth
        await this.ensureAuth(true);
        return await fn();
      }
      throw err;
    }
  }

  private isAuthError(err: any): boolean {
    const status = err?.response?.status ?? err?.status;
    return status === 401 || status === 403;
  }

  private getAccessTokenExp(token?: string): number | null {
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payloadB64Url = parts[1];
      const payloadJson = Buffer.from(
        this.base64UrlToBase64(payloadB64Url),
        'base64',
      ).toString('utf8');
      const payload = JSON.parse(payloadJson);
      const exp = payload?.exp;
      return typeof exp === 'number' ? exp : null;
    } catch {
      return null;
    }
  }

  private base64UrlToBase64(b64url: string): string {
    let out = b64url.replace(/-/g, '+').replace(/_/g, '/');
    while (out.length % 4) out += '=';
    return out;
  }

  // ================== Service ==================

  async setBeetaminIdForUser(
    userId: string,
    beetaminId: string,
    resourceType: 'Patient' | 'Practitioner',
  ) {
    const patch: Record<string, string[]> =
      resourceType === 'Patient'
        ? { patientId: [beetaminId] }
        : { practitionerId: [beetaminId] };

    return this.withAuthRetry(async () => {
      const currentUser = await this.kc.users.findOne({ id: userId });
      const currentAttrs: Record<string, string[]> =
        (currentUser?.attributes as any) ?? {};

      const mergedAttrs: Record<string, string[]> = {
        ...currentAttrs,
        ...patch,
      };
      await this.kc.users.update(
        { id: userId },
        {
          ...currentUser,
          attributes: mergedAttrs,
        },
      );

      this.logger.log(`Đã set beetamin-id="${beetaminId}" cho user ${userId}`);
      return { success: true };
    });
  }

  async assignUserToGroup(userId: string, groupName: string) {
    return this.withAuthRetry(async () => {
      const groups = await this.kc.groups.find({ search: groupName });
      const group = groups.find((g) => g.name === groupName);
      if (!group || !group.id) {
        throw new Error(`Group "${groupName}" không tồn tại`);
      }

      await this.kc.users.addToGroup({
        id: userId,
        groupId: group.id,
      });

      this.logger.log(`Đã thêm user ${userId} vào group "${groupName}"`);
      return { success: true };
    });
  }
}
