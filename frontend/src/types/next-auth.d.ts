import { DefaultSession, DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

type FhirType = {
  patient?: string;
  practitioner?: string;
};

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    accessTokenExpires?: number;
    refreshToken?: string;
    idToken?: string;
    roles?: string[];
    fhir?: FhirType;
    error?: typeof REFRESH_TOKEN_ERROR | typeof TOKEN_ERROR;
  }
}

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    error?: typeof REFRESH_TOKEN_ERROR | typeof TOKEN_ERROR;
    user: DefaultSession['user'] & {
      fhir?: FhirType;
      roles?: string[];
    };
  }
}
