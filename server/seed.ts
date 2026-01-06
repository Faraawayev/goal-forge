import { db } from "./db";
import { goals, tasks, sprints, retrospectives } from "@shared/schema";
import { users } from "@shared/models/auth";

import { storage } from "./storage";
import { db } from "./db";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");
  const userId = process.env.SAMPLE_USER_ID || "demo-user";

  const existing = await db.select().from(users).where(eq(users.id, userId));
  if (existing.length === 0) {
    await db.insert(users).values({ id: userId, email: "demo@example.com", firstName: "Demo", lastName: "User" });
    console.log(`Created demo user ${userId}`);
  }

  const g1 = await storage.createGoal({ title: 'Read 30 pages', type: 'daily', userId, progress: 0 });
  const g2 = await storage.createGoal({ title: 'Launch MVP', type: 'weekly', userId, progress: 10 });

  await storage.createTask({ title: 'Buy book', userId, goalId: g1.id });
  await storage.createTask({ title: 'Write README', userId, goalId: g2.id });

  console.log('Seed complete');
}

seed().catch(console.error);
