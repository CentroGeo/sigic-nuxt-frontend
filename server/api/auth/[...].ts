import { NuxtAuthHandler } from "#auth";
import KeycloakProvider from "next-auth/providers/keycloak";
export default NuxtAuthHandler({
  providers: [
    // @ts-expect-error Use .default here for it to work during SSR.
    KeycloakProvider.default({
      clientId: process.env.KEY_CLOAK_CLIENT_ID,
      issuer: process.env.KEY_CLOAK_ISSUER,
      secret: process.env.KEY_CLOAK_CLIENT_SECRET,
    }),
  ],
});
