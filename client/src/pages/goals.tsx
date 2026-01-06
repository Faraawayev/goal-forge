import { PageLayout } from "@/components/layout-sidebar";
import { useGoals, useCreateGoal } from "@/hooks/use-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GoalCard } from "@/components/goal-card";
import { Plus, Target, CalendarDays, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGoalSchema, type CreateGoalRequest } from "@shared/schema";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";

const formSchema = insertGoalSchema.extend({
  userId: z.string().optional(), // We'll inject this
});

export default function Goals() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: dailyGoals, isLoading: loadingDaily } = useGoals({ type: 'daily', date: new Date().toISOString().split('T')[0] });
  const { data: weeklyGoals, isLoading: loadingWeekly } = useGoals({ type: 'weekly' });
  const createGoal = useCreateGoal();

  const form = useForm<CreateGoalRequest>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "daily",
      userId: user?.id || "demo",
      date: new Date(),
    }
  });

  const onSubmit = (data: CreateGoalRequest) => {
    if (!user) return;
    createGoal.mutate({ ...data, userId: user.id }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        form.reset();
      }
    });
  };

  return (
    <PageLayout 
      title="Goals"
      action={
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set a New Goal</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Goal Title</label>
                <Input {...form.register("title")} placeholder="e.g., Read 30 pages" />
                {form.formState.errors.title && <p className="text-red-500 text-xs">{form.formState.errors.title.message}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select 
                  onValueChange={(val) => form.setValue("type", val as "daily" | "weekly")}
                  defaultValue="daily"
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily Goal</SelectItem>
                    <SelectItem value="weekly">Weekly Sprint Goal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description (Optional)</label>
                <Textarea {...form.register("description")} placeholder="Add specific details..." />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={createGoal.isPending}>
                  {createGoal.isPending ? "Creating..." : "Create Goal"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <Tabs defaultValue="daily" className="space-y-6">
        <TabsList className="bg-card border p-1 rounded-xl">
          <TabsTrigger value="daily" className="rounded-lg px-6">Daily Focus</TabsTrigger>
          <TabsTrigger value="weekly" className="rounded-lg px-6">Weekly Sprint</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4 animate-in slide-in-from-left-4 duration-300">
          <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 text-primary rounded-xl">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Today's Priorities</h3>
                <p className="text-muted-foreground text-sm">Focus on completing 1 major goal today.</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{dailyGoals?.filter(g => g.status === 'completed').length || 0}/{dailyGoals?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingDaily ? (
              <Loader2 className="w-8 h-8 animate-spin mx-auto col-span-full" />
            ) : dailyGoals?.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
            
            {dailyGoals?.length === 0 && (
              <div className="col-span-full text-center py-12 border-2 border-dashed border-border rounded-xl">
                <Target className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <h3 className="text-lg font-medium">No goals set for today</h3>
                <p className="text-muted-foreground text-sm mb-4">Start by adding your most important task.</p>
                <Button variant="outline" onClick={() => setIsDialogOpen(true)}>Set Daily Goal</Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4 animate-in slide-in-from-right-4 duration-300">
          <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 p-6 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-xl">
                <CalendarDays className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Weekly Objectives</h3>
                <p className="text-muted-foreground text-sm">Aim for 2-4 key achievements per sprint.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {loadingWeekly ? (
              <Loader2 className="w-8 h-8 animate-spin mx-auto col-span-full" />
            ) : weeklyGoals?.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
