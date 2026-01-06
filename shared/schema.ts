import { pgTable, serial, text, boolean, timestamp, integer, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { users } from "./models/auth";

export * from "./models/auth";
export * from "./models/chat";

export const sprints = pgTable("sprints", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Foreign key to auth.users.id
  title: text("title").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status", { enum: ["active", "completed"] }).default("active").notNull(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  sprintId: integer("sprint_id").references(() => sprints.id),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type", { enum: ["daily", "weekly"] }).notNull(),
  status: text("status", { enum: ["not_started", "in_progress", "completed"] }).default("not_started").notNull(),
  progress: integer("progress").default(0).notNull(),
  date: timestamp("date"), // For daily goals
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").references(() => goals.id),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", { enum: ["todo", "in_progress", "done", "blocked"] }).default("todo").notNull(),
  progress: integer("progress").default(0).notNull(),
  priority: text("priority", { enum: ["low", "medium", "high"] }).default("medium").notNull(),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const retrospectives = pgTable("retrospectives", {
  id: serial("id").primaryKey(),
  sprintId: integer("sprint_id").references(() => sprints.id),
  userId: text("user_id").notNull(),
  summary: text("summary").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const sprintsRelations = relations(sprints, ({ many }) => ({
  goals: many(goals),
  retrospectives: many(retrospectives),
}));

export const goalsRelations = relations(goals, ({ one, many }) => ({
  sprint: one(sprints, {
    fields: [goals.sprintId],
    references: [sprints.id],
  }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  goal: one(goals, {
    fields: [tasks.goalId],
    references: [goals.id],
  }),
}));

export const retrospectivesRelations = relations(retrospectives, ({ one }) => ({
  sprint: one(sprints, {
    fields: [retrospectives.sprintId],
    references: [sprints.id],
  }),
}));

// Schemas
export const insertSprintSchema = createInsertSchema(sprints).omit({ id: true });
export const insertGoalSchema = createInsertSchema(goals).omit({ id: true, createdAt: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true });
export const insertRetrospectiveSchema = createInsertSchema(retrospectives).omit({ id: true, createdAt: true });

// Types
export type Sprint = typeof sprints.$inferSelect;
export type InsertSprint = z.infer<typeof insertSprintSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Retrospective = typeof retrospectives.$inferSelect;
export type InsertRetrospective = z.infer<typeof insertRetrospectiveSchema>;

// API Types
export type CreateSprintRequest = InsertSprint;
export type UpdateSprintRequest = Partial<InsertSprint>;
export type CreateGoalRequest = InsertGoal;
export type UpdateGoalRequest = Partial<InsertGoal>;
export type CreateTaskRequest = InsertTask;
export type UpdateTaskRequest = Partial<InsertTask>;
export type CreateRetrospectiveRequest = InsertRetrospective;
