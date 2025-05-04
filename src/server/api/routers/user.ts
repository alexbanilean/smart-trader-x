import { z } from "zod";
import * as bcrypt from "bcrypt";
import { Role } from "@prisma/client";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().min(1),
        password: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const hashedPassword = bcrypt.hashSync(input.password, 10);

      return await ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
          role: Role.ADMIN,
        },
      });
    }),

  get: protectedProcedure.query(async ({ ctx }) => {
    const users = await ctx.db.user.findMany();
    return users;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.user.findUnique({
        where: {
          id: input.id,
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().min(1),
        role: z.custom<Role>(),
        password: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const hashedPassword = bcrypt.hashSync(input.password, 10);

      return await ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          role: input.role,
          password: hashedPassword,
          emailVerified: new Date(),
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        email: z.string().min(1),
        role: z.custom<Role>(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.user.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          email: input.email,
          role: input.role,
        },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.user.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
