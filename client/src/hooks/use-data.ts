import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { 
  type CreateSprintRequest, 
  type UpdateSprintRequest,
  type CreateGoalRequest,
  type UpdateGoalRequest,
  type CreateTaskRequest,
  type UpdateTaskRequest,
  type CreateRetrospectiveRequest
} from "@shared/schema";

// ================= SPRINTS =================
export function useSprints() {
  return useQuery({
    queryKey: [api.sprints.list.path],
    queryFn: async () => {
      const res = await fetch(api.sprints.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch sprints");
      return api.sprints.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateSprint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateSprintRequest) => {
      const res = await fetch(api.sprints.create.path, {
        method: api.sprints.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create sprint");
      return api.sprints.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.sprints.list.path] }),
  });
}

export function useUpdateSprint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & UpdateSprintRequest) => {
      const url = buildUrl(api.sprints.update.path, { id });
      const res = await fetch(url, {
        method: api.sprints.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update sprint");
      return api.sprints.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.sprints.list.path] }),
  });
}

// ================= GOALS =================
export function useGoals(filters?: { type?: 'daily' | 'weekly'; sprintId?: number; date?: string }) {
  return useQuery({
    queryKey: [api.goals.list.path, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.sprintId) params.append('sprintId', filters.sprintId.toString());
      if (filters?.date) params.append('date', filters.date);
      
      const res = await fetch(`${api.goals.list.path}?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch goals");
      return api.goals.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateGoalRequest) => {
      const res = await fetch(api.goals.create.path, {
        method: api.goals.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create goal");
      return api.goals.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.goals.list.path] }),
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & UpdateGoalRequest) => {
      const url = buildUrl(api.goals.update.path, { id });
      const res = await fetch(url, {
        method: api.goals.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update goal");
      return api.goals.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.goals.list.path] }),
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.goals.delete.path, { id });
      const res = await fetch(url, { method: api.goals.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete goal");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.goals.list.path] }),
  });
}

// ================= TASKS =================
export function useTasks(filters?: { goalId?: number; status?: 'todo' | 'in_progress' | 'done' | 'blocked' }) {
  return useQuery({
    queryKey: [api.tasks.list.path, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.goalId) params.append('goalId', filters.goalId.toString());
      if (filters?.status) params.append('status', filters.status);
      
      const res = await fetch(`${api.tasks.list.path}?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return api.tasks.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateTaskRequest) => {
      const res = await fetch(api.tasks.create.path, {
        method: api.tasks.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create task");
      return api.tasks.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.tasks.list.path] }),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & UpdateTaskRequest) => {
      const url = buildUrl(api.tasks.update.path, { id });
      const res = await fetch(url, {
        method: api.tasks.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update task");
      return api.tasks.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.tasks.list.path] }),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.tasks.delete.path, { id });
      const res = await fetch(url, { method: api.tasks.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete task");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.tasks.list.path] }),
  });
}

// ================= RETROSPECTIVES =================
export function useRetrospectives(sprintId?: number) {
  return useQuery({
    queryKey: [api.retrospectives.list.path, sprintId],
    enabled: !!sprintId,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (sprintId) params.append('sprintId', sprintId.toString());
      
      const res = await fetch(`${api.retrospectives.list.path}?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch retrospectives");
      return api.retrospectives.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateRetrospective() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateRetrospectiveRequest) => {
      const res = await fetch(api.retrospectives.create.path, {
        method: api.retrospectives.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create retrospective");
      return api.retrospectives.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.retrospectives.list.path] }),
  });
}
