import { z } from "zod";
import * as bcrypt from "bcrypt";
import { ExperienceLevel, Role } from "@prisma/client";
import fs from "fs";
import path from "path";

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

  getProfile: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        nickName: true,
        gender: true,
        country: true,
        language: true,
        timeZone: true,
        preferredAsset: true,
        riskTolerance: true,
        tradingFrequency: true,
        experienceLevel: true,
        additionalEmails: true,
      },
    });
  }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        fullName: z.string().optional(),
        nickName: z.string().optional(),
        gender: z.string().optional(),
        country: z.string().optional(),
        language: z.string().optional(),
        timeZone: z.string().optional(),
        preferredAsset: z.string().optional(),
        riskTolerance: z.string().optional(),
        tradingFrequency: z.string().optional(),
        experienceLevel: z.nativeEnum(ExperienceLevel),
        emails: z.array(z.string().email()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { emails, ...rest } = input;
      const [primaryEmail, ...additionalEmails] = emails ?? [];

      return await ctx.db.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          name: rest.fullName,
          email: primaryEmail,
          additionalEmails,
          nickName: rest.nickName,
          gender: rest.gender,
          country: rest.country,
          language: rest.language,
          timeZone: rest.timeZone,
          preferredAsset: rest.preferredAsset,
          riskTolerance: rest.riskTolerance,
          tradingFrequency: rest.tradingFrequency,
          experienceLevel: rest.experienceLevel,
        },
      });
    }),

  uploadProfilePhoto: protectedProcedure
    .input(
      z.object({
        file: z.string(), // base64 string
        fileName: z.string(), // original file name for extension
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Extract extension
      const ext = path.extname(input.fileName) || ".png";
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      // Generate unique file name
      const fileName = `${ctx.session.user.id}_${Date.now()}${ext}`;
      const filePath = path.join(uploadsDir, fileName);

      // Remove base64 header if present
      const base64Data = input.file.replace(/^data:image\/\w+;base64,/, "");
      fs.writeFileSync(filePath, base64Data, { encoding: "base64" });

      const fileUrl = `/uploads/${fileName}`;
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
      });
      if (!user) {
        throw new Error("User not found in database.");
      }
      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { image: fileUrl },
      });

      return { url: fileUrl };
    }),

  deleteProfilePhoto: protectedProcedure.mutation(async ({ ctx }) => {
    await ctx.db.user.update({
      where: { id: ctx.session.user.id },
      data: { image: null },
    });
    return { success: true };
  }),
});
