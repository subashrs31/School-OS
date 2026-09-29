import passport from 'passport';
import env from './appConfig';

if (env?.OAUTH_PROVIDERS?.length) {
  const activeProviders = require('./oauthConfig').default as Record<string, {
    strategy: string;
    credentials: Record<string, string>;
    callbackURL: string;
    scope?: string[];
    profileFields?: string[];
    profileMap: (profile: Record<string, unknown>) => unknown;
  }>;

  Object.entries(activeProviders).forEach(([providerName, config]) => {
    const { Strategy } = require(config.strategy) as { Strategy: new (opts: object, cb: Function) => unknown };

    const options = {
      ...config.credentials,
      callbackURL: config.callbackURL,
      ...(config.scope && { scope: config.scope }),
      ...(config.profileFields && { profileFields: config.profileFields }),
    };

    passport.use(
      providerName,
      new Strategy(options, (_accessToken: string, _refreshToken: string, profile: Record<string, unknown>, done: Function) => {
        try {
          done(null, { provider: providerName, profile: config.profileMap(profile) });
        } catch (err) {
          done(err, null);
        }
      }) as passport.Strategy
    );
  });
}

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user as Express.User));

export default passport;
