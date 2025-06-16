import { NuxtAuthHandler } from "#auth";
import KeycloakProvider from "next-auth/providers/keycloak";
export default NuxtAuthHandler({
  providers: [
    // @ts-expect-error Use .default here for it to work during SSR.
    KeycloakProvider.default({
      clientId: process.env.NUXT_OAUTH_CLIENT_ID,
      issuer: process.env.NUXT_OAUTH_ISSUER_BASE_URL,
    }),
  ],
});
