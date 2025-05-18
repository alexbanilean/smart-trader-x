import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

export const marketRouter = createTRPCRouter({
    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.db.market.findUnique({
                select: {
                    id: true,
                    shortName: true,
                    fullName: true,
                    tendency: true,
                    marketData: {
                        select: {
                            date: true,
                            value: true
                        },
                        orderBy: {
                            date: "asc"
                        }
                    },
                },
                where: {
                    id: input.id
                }
            });
        }),
    searchByPrefix: publicProcedure
        .input(z.object({ prefix: z.string().min(1) }))
        .query(async ({ ctx, input }) => {
            return ctx.db.market.findMany({
                select: {
                    id: true,
                    shortName: true,
                    fullName: true,
                    tendency: true,
                },
                where: {
                    fullName: { startsWith: input.prefix }
                },
                take: 10
            });
        }),
    getDashboard: protectedProcedure
        .query(async ({ ctx }) => {
            return ctx.db.dashboardMarkets.findMany({
                select: {
                    market: {
                        select: {
                            id: true,
                            shortName: true,
                            tendency: true,
                            marketData: {
                                select: {
                                    date: true,
                                    value: true
                                },
                                orderBy: {
                                    date: "asc"
                                }
                            }
                        }
                    }
                },
                where: {
                    userId: ctx.session.user.id
                },
                orderBy: {
                    index: "asc"
                }
            });
        }),
    addMarketToDashboard: protectedProcedure
        .input(z.object({ marketId: z.string() }))
        .mutation(async ({ctx, input}) => {
            return ctx.db.$transaction(async (tx) => {
                const marketCount = await tx.dashboardMarkets.count({
                    where: {
                        userId: ctx.session.user.id
                    }
                });
                return await tx.dashboardMarkets.create({
                    data: {
                        userId: ctx.session.user.id,
                        marketId: input.marketId,
                        index: marketCount
                    }
                });
            });
        }),
    updateMarketsInDashboard: protectedProcedure
        .input(z.array(z.string()))
        .mutation(async ({ctx, input}) => {
            return ctx.db.$transaction(async (tx) => {
                await tx.dashboardMarkets.deleteMany({
                    where: {
                        userId: ctx.session.user.id
                    }
                });
                return await tx.dashboardMarkets.createMany({
                    data: input.map((marketId, index) => {
                        return {
                            marketId: marketId,
                            userId: ctx.session.user.id,
                            index: index,
                        };
                    })
                });
            });
        }),
    removeMarketFromDashboard: protectedProcedure
        .input(z.object({ marketId: z.string() }))
        .mutation(async ({ctx, input}) => {
            return ctx.db.$transaction(async (tx) => {
                await tx.dashboardMarkets.deleteMany({
                    where: {
                        userId: ctx.session.user.id,
                        marketId: input.marketId
                    }
                });

                const markets = await tx.dashboardMarkets.findMany({
                    select: {
                        marketId: true
                    },
                    where: {
                        userId: ctx.session.user.id
                    },
                    orderBy: {
                        index: "asc"
                    }
                });
                await tx.dashboardMarkets.deleteMany({
                    where: {
                        userId: ctx.session.user.id
                    }
                });

                return await tx.dashboardMarkets.createMany({
                    data: markets.map((market, index) => { return {
                        marketId: market.marketId,
                        userId: ctx.session.user.id,
                        index: index
                    }})
                });
            });
        })
});