import * as bcrypt from "bcrypt";
import type { DefaultSession, NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { User } from "@auth/core/types";
import type { Role } from "@prisma/client";
import { db } from "~/server/db";
import { z } from "zod";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email: string;
      emailVerified: Date | null;
      // ...other properties
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
  }
}

/**
 * For the adaptor user object
 * Here add any other fields you have in user table that are not part of the default schema.
 *
 * @see https://github.com/nextauthjs/next-auth/issues/9253
 */
declare module "@auth/core/adapters" {
  interface AdapterUser extends User {
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    userEmail: string;
    userEmailVerified: Date | null;
    userRole: Role;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  providers: [
    Credentials({
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "example@gmail.com",
        },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(4) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;

          const user = await db.user.findUnique({
            where: { email: email },
          });

          if (!user) {
            return null;
          }

          console.log("COMPARE PASSWORDS:", password, user.password);
          const isValid = bcrypt.compareSync(password, user.password);
          console.log("EQUAL", isValid);

          if (!isValid) {
            return null;
          }

          console.log("User authenticated", user);

          return user;
        }

        console.error("Invalid credentials", parsedCredentials.error);
        return null;
      },
    }),
  ],
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  callbacks: {
    jwt: ({ token, user }: { token: JWT; user: any }) => {
      if (user) {
        token.userId = user.id;
        token.userEmail = user.email;
        token.userEmailVerified = user.emailVerified;
        token.userRole = user.role;
      }

      console.log("JWT", token);

      return token;
    },
    session: ({ session, token }) => {
      if (token) {
        session.user = {
          ...session.user,
          id: token.userId,
          email: token.userEmail,
          emailVerified: token.userEmailVerified,
          role: token.userRole,
        };
      }

      console.log("SESSION", session);

      return session;
    },
  },
} satisfies NextAuthConfig;
