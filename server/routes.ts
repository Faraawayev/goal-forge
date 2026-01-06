import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth and Integrations
  await setupAuth(app);
  registerAuthRoutes(app);
  registerChatRoutes(app);
  registerImageRoutes(app);

  // Protected middleware for API routes
  const protectedApi = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Goals
  app.get(api.goals.list.path, protectedApi, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const filters = {
      type: req.query.type as string,
      sprintId: req.query.sprintId ? Number(req.query.sprintId) : undefined,
      date: req.query.date ? new Date(req.query.date as string) : undefined,
    };
    const goals = await storage.getGoals(userId, filters);
    res.json(goals);
  });

  app.post(api.goals.create.path, protectedApi, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.goals.create.input.parse({ ...req.body, userId });
      const goal = await storage.createGoal(input);
      res.status(201).json(goal);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.put(api.goals.update.path, protectedApi, async (req, res) => {
    try {
      const input = api.goals.update.input.parse(req.body);
      const goal = await storage.updateGoal(Number(req.params.id), input);
      res.json(goal);
    } catch (err) {
      res.status(400).json({ message: "Validation error" });
    }
  });

  app.delete(api.goals.delete.path, protectedApi, async (req, res) => {
    await storage.deleteGoal(Number(req.params.id));
    res.status(204).send();
  });

  // Tasks
  app.get(api.tasks.list.path, protectedApi, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const filters = {
      goalId: req.query.goalId ? Number(req.query.goalId) : undefined,
      status: req.query.status as string,
    };
    const tasks = await storage.getTasks(userId, filters);
    res.json(tasks);
  });

  app.post(api.tasks.create.path, protectedApi, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.tasks.create.input.parse({ ...req.body, userId });
      const task = await storage.createTask(input);
      res.status(201).json(task);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.put(api.tasks.update.path, protectedApi, async (req, res) => {
    try {
      const input = api.tasks.update.input.parse(req.body);
      const task = await storage.updateTask(Number(req.params.id), input);
      res.json(task);
    } catch (err) {
      res.status(400).json({ message: "Validation error" });
    }
  });

  app.delete(api.tasks.delete.path, protectedApi, async (req, res) => {
    await storage.deleteTask(Number(req.params.id));
    res.status(204).send();
  });

  // Sprints
  app.get(api.sprints.list.path, protectedApi, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const sprints = await storage.getSprints(userId);
    res.json(sprints);
  });

  app.post(api.sprints.create.path, protectedApi, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.sprints.create.input.parse({ ...req.body, userId });
      const sprint = await storage.createSprint(input);
      res.status(201).json(sprint);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.put(api.sprints.update.path, protectedApi, async (req, res) => {
    try {
      const input = api.sprints.update.input.parse(req.body);
      const sprint = await storage.updateSprint(Number(req.params.id), input);
      res.json(sprint);
    } catch (err) {
      res.status(400).json({ message: "Validation error" });
    }
  });

  // Retrospectives
  app.get(api.retrospectives.list.path, protectedApi, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const sprintId = req.query.sprintId ? Number(req.query.sprintId) : undefined;
    const retros = await storage.getRetrospectives(userId, sprintId);
    res.json(retros);
  });

  app.post(api.retrospectives.create.path, protectedApi, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.retrospectives.create.input.parse({ ...req.body, userId });
      const retro = await storage.createRetrospective(input);
      res.status(201).json(retro);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  return httpServer;
}
