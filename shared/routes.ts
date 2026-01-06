import { z } from 'zod';
import { insertGoalSchema, insertTaskSchema, insertSprintSchema, insertRetrospectiveSchema, goals, tasks, sprints, retrospectives } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  sprints: {
    list: {
      method: 'GET' as const,
      path: '/api/sprints',
      responses: {
        200: z.array(z.custom<typeof sprints.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/sprints',
      input: insertSprintSchema,
      responses: {
        201: z.custom<typeof sprints.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/sprints/:id',
      input: insertSprintSchema.partial(),
      responses: {
        200: z.custom<typeof sprints.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  goals: {
    list: {
      method: 'GET' as const,
      path: '/api/goals',
      input: z.object({
        type: z.enum(['daily', 'weekly']).optional(),
        sprintId: z.coerce.number().optional(),
        date: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof goals.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/goals',
      input: insertGoalSchema,
      responses: {
        201: z.custom<typeof goals.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/goals/:id',
      input: insertGoalSchema.partial(),
      responses: {
        200: z.custom<typeof goals.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/goals/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  tasks: {
    list: {
      method: 'GET' as const,
      path: '/api/tasks',
      input: z.object({
        goalId: z.coerce.number().optional(),
        status: z.enum(['todo', 'in_progress', 'done', 'blocked']).optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof tasks.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/tasks',
      input: insertTaskSchema,
      responses: {
        201: z.custom<typeof tasks.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/tasks/:id',
      input: insertTaskSchema.partial(),
      responses: {
        200: z.custom<typeof tasks.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/tasks/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  retrospectives: {
    create: {
      method: 'POST' as const,
      path: '/api/retrospectives',
      input: insertRetrospectiveSchema,
      responses: {
        201: z.custom<typeof retrospectives.$inferSelect>(),
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/retrospectives',
      input: z.object({ sprintId: z.coerce.number().optional() }).optional(),
      responses: {
        200: z.array(z.custom<typeof retrospectives.$inferSelect>()),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
