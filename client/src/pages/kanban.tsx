import { PageLayout } from "@/components/layout-sidebar";
import { KanbanBoard } from "@/components/kanban-board";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useCreateTask, useGoals } from "@/hooks/use-data";
import { useAuth } from "@/hooks/use-auth";

export default function KanbanPage() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const createTask = useCreateTask();
  const { data: goals } = useGoals({ type: 'weekly' }); // To link tasks to goals
  
  const [newTask, setNewTask] = useState({
    title: "",
    goalId: "",
    priority: "medium",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    createTask.mutate({
      title: newTask.title,
      userId: user.id,
      goalId: newTask.goalId ? parseInt(newTask.goalId) : undefined,
      priority: newTask.priority as "low" | "medium" | "high",
      status: "todo",
      progress: 0
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setNewTask({ title: "", goalId: "", priority: "medium" });
      }
    });
  };

  return (
    <PageLayout 
      title="Task Board" 
      action={
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Task Title</label>
                <Input 
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  placeholder="What needs to be done?"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Related Goal (Optional)</label>
                  <Select 
                    value={newTask.goalId}
                    onValueChange={val => setNewTask({...newTask, goalId: val})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select goal..." />
                    </SelectTrigger>
                    <SelectContent>
                      {goals?.map(g => (
                        <SelectItem key={g.id} value={g.id.toString()}>
                          {g.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select 
                    value={newTask.priority}
                    onValueChange={val => setNewTask({...newTask, priority: val})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={createTask.isPending}>
                  Create Task
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="h-[calc(100vh-14rem)]">
        <KanbanBoard />
      </div>
    </PageLayout>
  );
}
