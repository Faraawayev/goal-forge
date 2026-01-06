import { db } from "./db";
import {
  goals, tasks, sprints, retrospectives,
  type InsertGoal, type UpdateGoalRequest, type Goal,
  type InsertTask, type UpdateTaskRequest, type Task,
  type InsertSprint, type UpdateSprintRequest, type Sprint,
  type InsertRetrospective, type Retrospective
} from "@shared/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Goals
  getGoals(userId: string, filters?: { type?: string; sprintId?: number; date?: Date }): Promise<Goal[]>;
  getGoal(id: number): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, updates: UpdateGoalRequest): Promise<Goal>;
  deleteGoal(id: number): Promise<void>;

  // Tasks
  getTasks(userId: string, filters?: { goalId?: number; status?: string }): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, updates: UpdateTaskRequest): Promise<Task>;
  deleteTask(id: number): Promise<void>;

  // Sprints
  getSprints(userId: string): Promise<Sprint[]>;
  getSprint(id: number): Promise<Sprint | undefined>;
  createSprint(sprint: InsertSprint): Promise<Sprint>;
  updateSprint(id: number, updates: UpdateSprintRequest): Promise<Sprint>;
  getActiveSprint(userId: string): Promise<Sprint | undefined>;

  // Retrospectives
  getRetrospectives(userId: string, sprintId?: number): Promise<Retrospective[]>;
  createRetrospective(retro: InsertRetrospective): Promise<Retrospective>;
}

export class DatabaseStorage implements IStorage {
  // Goals
  async getGoals(userId: string, filters?: { type?: string; sprintId?: number; date?: Date }): Promise<Goal[]> {
    let query = db.select().from(goals).where(eq(goals.userId, userId));
    
    if (filters?.type) {
      query = query.where(eq(goals.type, filters.type as "daily" | "weekly"));
    }
    if (filters?.sprintId) {
      query = query.where(eq(goals.sprintId, filters.sprintId));
    }
    // Date filtering logic would go here if needed strictly
    
    return await query.orderBy(desc(goals.createdAt));
  }

  async getGoal(id: number): Promise<Goal | undefined> {
    const [goal] = await db.select().from(goals).where(eq(goals.id, id));
    return goal;
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const [newGoal] = await db.insert(goals).values(goal).returning();
    return newGoal;
  }

  async updateGoal(id: number, updates: UpdateGoalRequest): Promise<Goal> {
    const [updated] = await db.update(goals).set(updates).where(eq(goals.id, id)).returning();
    return updated;
  }

  async deleteGoal(id: number): Promise<void> {
    await db.delete(goals).where(eq(goals.id, id));
  }

  // Tasks
  async getTasks(userId: string, filters?: { goalId?: number; status?: string }): Promise<Task[]> {
    let query = db.select().from(tasks).where(eq(tasks.userId, userId));

    if (filters?.goalId) {
      query = query.where(eq(tasks.goalId, filters.goalId));
    }
    if (filters?.status) {
      query = query.where(eq(tasks.status, filters.status as any));
    }

    return await query.orderBy(desc(tasks.priority), desc(tasks.createdAt));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: number, updates: UpdateTaskRequest): Promise<Task> {
    const [updated] = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
    return updated;
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // Sprints
  async getSprints(userId: string): Promise<Sprint[]> {
    return await db.select().from(sprints).where(eq(sprints.userId, userId)).orderBy(desc(sprints.startDate));
  }

  async getSprint(id: number): Promise<Sprint | undefined> {
    const [sprint] = await db.select().from(sprints).where(eq(sprints.id, id));
    return sprint;
  }

  async createSprint(sprint: InsertSprint): Promise<Sprint> {
    const [newSprint] = await db.insert(sprints).values(sprint).returning();
    return newSprint;
  }

  async updateSprint(id: number, updates: UpdateSprintRequest): Promise<Sprint> {
    const [updated] = await db.update(sprints).set(updates).where(eq(sprints.id, id)).returning();
    return updated;
  }

  async getActiveSprint(userId: string): Promise<Sprint | undefined> {
    const now = new Date();
    const [sprint] = await db.select().from(sprints)
      .where(and(
        eq(sprints.userId, userId),
        eq(sprints.status, "active"),
        lte(sprints.startDate, now),
        gte(sprints.endDate, now)
      ))
      .limit(1);
    return sprint;
  }

  // Retrospectives
  async getRetrospectives(userId: string, sprintId?: number): Promise<Retrospective[]> {
    let query = db.select().from(retrospectives).where(eq(retrospectives.userId, userId));
    if (sprintId) {
      query = query.where(eq(retrospectives.sprintId, sprintId));
    }
    return await query.orderBy(desc(retrospectives.createdAt));
  }

  async createRetrospective(retro: InsertRetrospective): Promise<Retrospective> {
    const [newRetro] = await db.insert(retrospectives).values(retro).returning();
    return newRetro;
  }
}

export const storage = new DatabaseStorage();
