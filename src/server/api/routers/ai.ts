import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
});

export const aiRouter = createTRPCRouter({
  chat: protectedProcedure
    .input(
      z.object({
        messages: z.array(messageSchema),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const response = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: "gpt-3.5-turbo",
              messages: [
                {
                  role: "system",
                  content: "You are a helpful financial assistant.",
                },
                ...input.messages,
              ],
            }),
          },
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(`OpenAI API error: ${JSON.stringify(error)}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error in AI chat:", error);
        throw error;
      }
    }),
});
