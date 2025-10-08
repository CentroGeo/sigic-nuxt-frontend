import { NuxtAuthHandler } from '#auth';
import KeycloakProvider from 'next-auth/providers/keycloak';
const isDev = process.env.NODE_ENV !== 'production';

function isTokenExpired(expiresAt?: number, offset = 60_000): boolean {
  if (!expiresAt) return true;
  return Date.now() >= expiresAt - offset;
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

  cookies: {
    state: {
      name: 'next-auth.state',
      options: {
        httpOnly: true,
        sameSite: isDev ? 'lax' : 'none',
        secure: !isDev,
      },
    },
  },

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.idToken = account.id_token;
        token.expires_at = Date.now() + ((account.expires_in as number) ?? 0) * 1000;
      }

      if (isTokenExpired(token.expires_at as number)) {
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
          // AQUI MANDAR UN HTTP POST A API DE IA AVISANDO QUE EL USUARIO ACTUALIZÓ SU TOKEN
          // Y MANDAR SOLO EL accessToken Y ALGO QUE IDENTIFIQUE AL USUARIO (POR EJEMPLO SUB O EMAIL)
          // PARA QUE LA API DE IA LO GUARDE EN MEMORIA O DONDE SEA Y LO USE PARA SUS PETICIONES
          // A GEONODE
          // fetch(`${process.env.NUXT_PUBLIC_IA_BACKEND_URL}/auth/update-token`, {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({
          //     accessToken: token.accessToken,
          //     sub: token.sub, // o email, dependiendo de lo que quieras usar
          //   }),
          // });
        } catch (err) {
          console.error('Error refrescando token:', err);
          token.error = 'RefreshAccessTokenError';
        }
      }

      return token;
    },

    async session({ session, token }) {
      // @ts-expect-error extendiendo Session con campos propios
      session.accessToken = token.accessToken;
      // @ts-expect-error extendiendo Session con campos propios
      session.error = token.error;
      return session;
    },
  },
});
