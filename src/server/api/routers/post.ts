import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { type Prisma, ExperienceLevel } from "@prisma/client";
import fs from "fs";
import path from "path";

// Helper function to delete file if it exists
const deleteFileIfExists = (filePath: string): void => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err: unknown) {
    // Log error but don't throw - we don't want to prevent post deletion if file deletion fails
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    console.error("Error deleting file:", errorMessage);
  }
};

export const postRouter = createTRPCRouter({
  // Infinite feed with search, filter, sort
  getFeed: publicProcedure
    .input(
      z.object({
        cursor: z.string().nullish(),
        limit: z.number().min(1).max(20).default(10),
        search: z.string().optional(),
        label: z.nativeEnum(ExperienceLevel).optional(),
        sort: z.enum(["date", "comments", "reactions"]).default("date"),
        order: z.enum(["asc", "desc"]).default("desc"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit, search, label, sort, order } = input;
      const where: Prisma.PostWhereInput = {
        ...(search
          ? { content: { contains: search, mode: "insensitive" } }
          : {}),
        ...(label ? { label } : {}),
      };
      const orderBy =
        sort === "date"
          ? { createdAt: order }
          : sort === "comments"
            ? { commentsCount: order }
            : { reactionsCount: order };
      const posts = await ctx.db.post.findMany({
        where,
        orderBy,
        take: Number(limit) + 1,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        include: {
          user: true,
          reactions: true,
        },
      });
      let nextCursor: string | null = null;
      if (posts.length > limit) {
        nextCursor = posts[limit]?.id ?? null;
        posts.pop();
      }
      return { posts, nextCursor };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.post.findUnique({
        where: { id: input.id },
        include: {
          user: true,
          reactions: true,
          comments: {
            include: { user: true },
            orderBy: { createdAt: "asc" },
          },
        },
      });
    }),

  uploadImage: protectedProcedure
    .input(
      z.object({
        file: z.string(), // base64 string
        fileName: z.string(), // original file name for extension
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Extract extension
      const ext = path.extname(input.fileName) || ".png";
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "posts");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      // Generate unique file name
      const fileName = `${ctx.session.user.id}_${Date.now()}${ext}`;
      const filePath = path.join(uploadsDir, fileName);

      // Remove base64 header if present
      const base64Data = input.file.replace(/^data:image\/\w+;base64,/, "");
      fs.writeFileSync(filePath, base64Data, { encoding: "base64" });

      return { url: `/uploads/posts/${fileName}` };
    }),

  create: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1),
        image: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get user's experience level
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { experienceLevel: true },
      });

      // Use the user's experience level or default to BEGINNER
      const label = user?.experienceLevel ?? ExperienceLevel.BEGINNER;

      // Create post with image path
      return ctx.db.post.create({
        data: {
          userId: ctx.session.user.id,
          content: input.content,
          image: input.image, // This is now just the path to the image
          label,
        },
      });
    }),

  react: protectedProcedure
    .input(z.object({ postId: z.string(), type: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Upsert reaction
      await ctx.db.reaction.upsert({
        where: {
          userId_postId_type: {
            postId: input.postId,
            userId: ctx.session.user.id,
            type: input.type,
          },
        },
        update: {},
        create: {
          postId: input.postId,
          userId: ctx.session.user.id,
          type: input.type,
        },
      });
      // Update reactionsCount
      const count = await ctx.db.reaction.count({
        where: { postId: input.postId },
      });
      await ctx.db.post.update({
        where: { id: input.postId },
        data: { reactionsCount: count },
      });
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user owns the post and get image path
      const post = await ctx.db.post.findUnique({
        where: { id: input.postId },
        select: { userId: true, image: true },
      });

      if (!post) {
        throw new Error("Post not found");
      }

      if (post.userId !== ctx.session.user.id) {
        throw new Error("Not authorized to delete this post");
      }

      // Delete the image file if it exists
      if (post.image) {
        const imagePath = path.join(
          process.cwd(),
          "public",
          post.image as string,
        );
        deleteFileIfExists(imagePath);
      }

      // Delete the post
      await ctx.db.post.delete({
        where: { id: input.postId },
      });

      return { success: true };
    }),
});
