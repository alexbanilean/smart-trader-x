import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const commentRouter = createTRPCRouter({
  getByPost: publicProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.comment.findMany({
        where: { postId: input.postId },
        include: { user: true },
        orderBy: { createdAt: "asc" },
      });
    }),

  create: protectedProcedure
    .input(z.object({ postId: z.string(), content: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.db.comment.create({
        data: {
          postId: input.postId,
          userId: ctx.session.user.id,
          content: input.content,
        },
        include: { user: true },
      });
      // Update commentsCount
      const count = await ctx.db.comment.count({
        where: { postId: input.postId },
      });
      await ctx.db.post.update({
        where: { id: input.postId },
        data: { commentsCount: count },
      });
      return comment;
    }),
});
