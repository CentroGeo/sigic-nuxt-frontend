import { NuxtAuthHandler } from '#auth';
import KeycloakProvider from 'next-auth/providers/keycloak';

// Función para comprobar si el token ha expirado
function isTokenExpired(expiresAt?: number): boolean {
  // console.log('expira en:', expiresAt, 'ahora:', Date.now());
  if (!expiresAt) return true;
  return Date.now() >= expiresAt - 40;
}

export default NuxtAuthHandler({
  secret: process.env.NUXT_AUTH_SECRET,

  providers: [
    // @ts-expect-error Use .default here for it to work during SSR.
    KeycloakProvider.default({
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      issuer: process.env.KEYCLOAK_ISSUER,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
    }),
  ],

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        // console.log('cuenta accestoken', token);
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expires_at = Date.now() + ((account.expires_in as number) ?? 0) * 1000;
      }

      if (isTokenExpired(token.expires_at as number)) {
        // console.log('ya expiró', token, account);
        try {
          const response = await fetch(
            `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                client_id: process.env.KEYCLOAK_CLIENT_ID ?? '',
                client_secret: process.env.KEYCLOAK_CLIENT_SECRET ?? '',
                grant_type: 'refresh_token',
                refresh_token: token.refreshToken as string,
              }),
            }
          );

          const refreshed = await response.json();

          if (!response.ok) throw refreshed;

          token.accessToken = refreshed.access_token;
          token.refreshToken = refreshed.refresh_token || token.refreshToken;
          token.expires_at = Date.now() + refreshed.expires_in * 1000;
          //console.log('Refrescando token:', response, "token.expires_at:", token.expires_at)
        } catch (err) {
          console.error('Error refrescando token:', err);
          token.error = 'RefreshAccessTokenError';
        }
        console.log('Nuevo tkn: ', token.refreshToken);
      }

      return token;
    },

    async session({ session }) {
      return session;
    },
  },
});
