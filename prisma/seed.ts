import { ExperienceLevel, PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Clearing database...");

  // Clear existing data in the correct order to respect foreign key constraints
  await prisma.reaction.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  await prisma.$executeRaw` TRUNCATE TABLE "User" RESTART IDENTITY CASCADE`;

  console.log("Seeding database...");

  // Create users

  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "admin@gmail.com",
      password: bcrypt.hashSync("admin", 10),
      role: "ADMIN",
    },
  });

  const client = await prisma.user.create({
    data: {
      name: "Client",
      email: "client@gmail.com",
      password: bcrypt.hashSync("client", 10),
      role: "CLIENT",
    },
  });

  // Social Feed Mock Data
  const john = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john@mock.com",
      password: bcrypt.hashSync("password", 10),
      role: "CLIENT",
      experienceLevel: ExperienceLevel.BEGINNER,
    },
  });
  const jack = await prisma.user.create({
    data: {
      name: "Jack Sparrow",
      email: "jack@mock.com",
      password: bcrypt.hashSync("password", 10),
      role: "CLIENT",
      experienceLevel: ExperienceLevel.EXPERIENCED,
    },
  });
  const mike = await prisma.user.create({
    data: {
      name: "Mike Dough",
      email: "mike@mock.com",
      password: bcrypt.hashSync("password", 10),
      role: "CLIENT",
      experienceLevel: ExperienceLevel.INTERMEDIATE,
    },
  });

  // Create posts
  const post1 = await prisma.post.create({
    data: {
      userId: john.id,
      content:
        "Just made my first trade on SmartTraderX! A bit nervous, but the AI assistant really helped me understand the risks. Still a long way to go, but I'm excited to learn and grow. Any tips from experienced traders?",
      image: "/mock1.svg",
      label: ExperienceLevel.BEGINNER,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      reactionsCount: 12,
      commentsCount: 2,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      userId: jack.id,
      content:
        "Closed a solid position today with +22% return thanks to market sentiment alerts and volume spikes flagged by SmartTraderX. Love how the community here keeps evolving — shared knowledge is real power. Let's keep pushing the limits.",
      image: "/mock2.svg",
      label: ExperienceLevel.EXPERIENCED,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      reactionsCount: 18,
      commentsCount: 5,
    },
  });

  const post3 = await prisma.post.create({
    data: {
      userId: mike.id,
      content:
        "Backtesting a new swing trading strategy using the AI insights. Results look promising so far — +12% on simulated trades over the past month. Anyone else combining technical indicators with SmartTraderX predictions?",
      image: "/mock3.svg",
      label: ExperienceLevel.INTERMEDIATE,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      reactionsCount: 7,
      commentsCount: 3,
    },
  });

  // Additional posts
  const post4 = await prisma.post.create({
    data: {
      userId: john.id,
      content:
        "Day 3 of my trading journey! Today I learned about stop-loss orders and risk management. The SmartTraderX AI suggested some good entry points, but I'm still trying to understand the technical analysis. Any beginners want to study together?",
      label: ExperienceLevel.BEGINNER,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36), // 36 hours ago
      reactionsCount: 8,
      commentsCount: 4,
    },
  });

  const post5 = await prisma.post.create({
    data: {
      userId: jack.id,
      content:
        "Just completed a 3-month analysis of my trading patterns using SmartTraderX analytics. The AI identified some interesting correlations between my successful trades and market volatility. Sharing my findings in the attached chart. Thoughts?",
      image: "/mock2.svg",
      label: ExperienceLevel.EXPERIENCED,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 48 hours ago
      reactionsCount: 25,
      commentsCount: 7,
    },
  });

  const post6 = await prisma.post.create({
    data: {
      userId: mike.id,
      content:
        "Made my first profitable trade using the SmartTraderX AI recommendations! Started with a small position as suggested, and it worked out well. The risk management features are really helpful for someone at my level.",
      label: ExperienceLevel.INTERMEDIATE,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18), // 18 hours ago
      reactionsCount: 15,
      commentsCount: 3,
    },
  });

  const post7 = await prisma.post.create({
    data: {
      userId: john.id,
      content:
        "Quick question: How do you all use the AI predictions in your trading strategy? I'm trying to find the right balance between following the AI suggestions and developing my own analysis skills.",
      label: ExperienceLevel.BEGINNER,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72), // 72 hours ago
      reactionsCount: 10,
      commentsCount: 6,
    },
  });

  const post8 = await prisma.post.create({
    data: {
      userId: jack.id,
      content:
        "Market volatility is high today, but the SmartTraderX AI has been spot on with its predictions. Just closed three positions with an average return of 15%. The real-time alerts feature is a game-changer!",
      image: "/mock2.svg",
      label: ExperienceLevel.EXPERIENCED,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 24 hours ago
      reactionsCount: 30,
      commentsCount: 8,
    },
  });

  const post9 = await prisma.post.create({
    data: {
      userId: mike.id,
      content:
        "Started using the new portfolio analytics feature. The AI's insights on my trading patterns are eye-opening. It suggested I might be overtrading during high volatility periods. Anyone else using this feature?",
      label: ExperienceLevel.INTERMEDIATE,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 42), // 42 hours ago
      reactionsCount: 14,
      commentsCount: 5,
    },
  });

  const post10 = await prisma.post.create({
    data: {
      userId: john.id,
      content:
        "Just completed the beginner's tutorial on SmartTraderX! The step-by-step guidance was really helpful. Now I understand basic concepts like leverage and margin. Ready to start with paper trading!",
      image: "/mock1.svg",
      label: ExperienceLevel.BEGINNER,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 60), // 60 hours ago
      reactionsCount: 9,
      commentsCount: 2,
    },
  });

  // Create comments
  await prisma.comment.createMany({
    data: [
      {
        postId: post1.id,
        userId: john.id,
        content: "Nice gains! Which indicators did you use?",
        createdAt: new Date(Date.now() - 1000 * 60 * 5),
      },
      {
        postId: post1.id,
        userId: mike.id,
        content: "I'm testing RSI + AI too. Great combo!",
        createdAt: new Date(Date.now() - 1000 * 60 * 2),
      },
      {
        postId: post2.id,
        userId: jack.id,
        content: "Congrats! What was your entry signal?",
        createdAt: new Date(Date.now() - 1000 * 60 * 20),
      },
      {
        postId: post3.id,
        userId: mike.id,
        content: "Anyone else using volume spikes?",
        createdAt: new Date(Date.now() - 1000 * 60 * 8),
      },
    ],
  });

  console.log("Admin:", admin);
  console.log("Client:", client);

  console.log("Seeding completed!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
