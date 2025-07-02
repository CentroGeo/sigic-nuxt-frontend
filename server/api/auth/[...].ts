import { NuxtAuthHandler } from "#auth";
import KeycloakProvider from "next-auth/providers/keycloak";

export default NuxtAuthHandler({
  // your authentication configuration here!
  providers: [
    // @ts-expect-error Use .default here for it to work during SSR.
    KeycloakProvider.default({
      clientId: process.env.KEYCLOAK_CLIENT_ID,
      issuer: process.env.KEYCLOAK_ISSUER,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
    }),
  ],
  // Sin esta parte no podemos acceder al token
  // (creo que porque no podemos usar las callbacks jwt)
  //session: {
  //  strategy: "jwt",
  //},
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },

    async session({ session, token }) {
      // @ts-ignore
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
});