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
    rememberMe?: boolean;
  }

  interface User {
    role: Role;
    rememberMe?: boolean;
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
    rememberMe?: boolean;
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
        rememberMe: { label: "Remember Me", type: "boolean" },
      },
      authorize: async (credentials) => {
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(4),
            rememberMe: z.union([
              z.boolean(),
              z.string().transform((val) => val === "true"),
              z.undefined().transform(() => false),
            ]),
          })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          console.error("Invalid credentials", parsedCredentials.error);
          return null;
        }

        const { email, password, rememberMe } = parsedCredentials.data;
        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return null;
        }

        return {
          ...user,
          rememberMe: rememberMe ?? false,
        };
      },
    }),
  ],
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    jwt: ({ token, user }: { token: JWT; user: any }) => {
      if (user) {
        token.userId = user.id;
        token.userEmail = user.email;
        token.userEmailVerified = user.emailVerified;
        token.userRole = user.role;
        token.rememberMe = user.rememberMe;
      }

      // If rememberMe is true, extend the token expiration
      if (token.rememberMe) {
        token.exp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days
      } else {
        // Default session duration (e.g., 24 hours)
        token.exp = Math.floor(Date.now() / 1000) + 24 * 60 * 60;
      }

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
        session.rememberMe = token.rememberMe;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
} satisfies NextAuthConfig;
