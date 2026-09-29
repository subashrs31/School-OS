import env from './appConfig';
import { OAuthProfile } from '../types';

interface OAuthProviderConfig {
  strategy: string;
  credentials: { clientID?: string; clientSecret?: string };
  callbackURL?: string;
  scope: string[];
  profileFields?: string[];
  profileMap: (profile: Record<string, unknown>) => OAuthProfile;
}

type ProviderMap = Record<string, OAuthProviderConfig>;

const PROVIDER_MAP: ProviderMap = {
  google: {
    strategy: 'passport-google-oauth20',
    credentials: { clientID: env?.GOOGLE_CLIENT_ID, clientSecret: env?.GOOGLE_CLIENT_SECRET },
    callbackURL: env?.GOOGLE_CALLBACK_URL,
    scope: ['profile', 'email'],
    profileMap: (profile) => ({
      oauthId: profile.id as string,
      email: (profile.emails as Array<{ value: string }>)?.[0]?.value ?? '',
      name: (profile.displayName as string) || ((profile.emails as Array<{ value: string }>)?.[0]?.value?.split('@')[0] ?? ''),
    }),
  },
  microsoft: {
    strategy: 'passport-microsoft',
    credentials: { clientID: env?.MICROSOFT_CLIENT_ID, clientSecret: env?.MICROSOFT_CLIENT_SECRET },
    callbackURL: env?.MICROSOFT_CALLBACK_URL,
    scope: ['user.read'],
    profileMap: (profile) => {
      const json = profile._json as Record<string, string> | undefined;
      const emails = profile.emails as Array<{ value: string }> | undefined;
      const name = profile.name as { givenName?: string; familyName?: string } | undefined;
      return {
        oauthId: profile.id as string,
        email: emails?.[0]?.value ?? json?.mail ?? json?.userPrincipalName ?? '',
        name: (profile.displayName as string) || `${name?.givenName ?? ''} ${name?.familyName ?? ''}`.trim(),
      };
    },
  },
};

const activeProviders = (env?.OAUTH_PROVIDERS ?? []).reduce<ProviderMap>((acc, name) => {
  const config = PROVIDER_MAP[name];
  if (!config) {
    console.warn(`[OAuth] "${name}" is listed in OAUTH_PROVIDERS but has no configuration defined.`);
    return acc;
  }
  const { clientID, clientSecret } = config.credentials;
  const missing = [
    !clientID && `${name.toUpperCase()}_CLIENT_ID`,
    !clientSecret && `${name.toUpperCase()}_CLIENT_SECRET`,
    !config.callbackURL && `${name.toUpperCase()}_CALLBACK_URL`,
  ].filter(Boolean);

  if (missing.length) {
    console.error(`[OAuth] "${name}" missing .env keys: ${missing.join(', ')} — skipping.`);
    return acc;
  }
  console.log(`[OAuth] "${name}" configured successfully.`);
  acc[name] = config;
  return acc;
}, {});

export type { OAuthProviderConfig };
export default activeProviders;
