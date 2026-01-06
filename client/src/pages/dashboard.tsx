import { PageLayout } from "@/components/layout-sidebar";
import { useGoals, useTasks, useSprints } from "@/hooks/use-data";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GoalCard } from "@/components/goal-card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, Target, CheckCircle2, TrendingUp, Calendar } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user } = useAuth();
  
  // Fetch active sprint
  const { data: sprints } = useSprints();
  const activeSprint = sprints?.find(s => s.status === 'active');
  
  // Fetch today's daily goal
  const { data: dailyGoals, isLoading: loadingGoals } = useGoals({ 
    type: 'daily',
    date: new Date().toISOString().split('T')[0] 
  });

  // Fetch all active weekly goals
  const { data: weeklyGoals } = useGoals({ 
    type: 'weekly',
    sprintId: activeSprint?.id 
  });

  // Fetch pending tasks
  const { data: tasks, isLoading: loadingTasks } = useTasks({ status: 'todo' });

  // Calculate stats
  const completedWeeklyGoals = weeklyGoals?.filter(g => g.status === 'completed').length || 0;
  const totalWeeklyGoals = weeklyGoals?.length || 0;
  const weeklyProgress = totalWeeklyGoals ? (completedWeeklyGoals / totalWeeklyGoals) * 100 : 0;

  return (
    <PageLayout 
      title={`Welcome back, ${user?.firstName || 'Productivity Master'}`}
      action={
        <div className="flex gap-2">
          <Link href="/goals">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Goal
            </Button>
          </Link>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Stats Area */}
        <div className="md:col-span-2 space-y-6">
          {/* Top Daily Focus */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Today's Focus
              </h2>
              <span className="text-sm text-muted-foreground">{format(new Date(), 'EEEE, MMMM do')}</span>
            </div>
            
            {loadingGoals ? (
              <Skeleton className="h-32 w-full rounded-xl" />
            ) : dailyGoals && dailyGoals.length > 0 ? (
              <div className="space-y-4">
                {dailyGoals.slice(0, 1).map(goal => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-2">
                <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                  <Target className="w-12 h-12 text-muted-foreground/30 mb-3" />
                  <h3 className="font-semibold text-lg">No focus set for today</h3>
                  <p className="text-sm text-muted-foreground mb-4">Set a top priority to stay aligned.</p>
                  <Link href="/goals">
                    <Button variant="outline">Set Daily Goal</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Active Tasks Overview */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Recent Tasks
              </h2>
              <Link href="/kanban" className="text-sm text-primary hover:underline flex items-center">
                View Board <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {loadingTasks ? (
                <>
                  <Skeleton className="h-24 rounded-xl" />
                  <Skeleton className="h-24 rounded-xl" />
                </>
              ) : tasks && tasks.length > 0 ? (
                tasks.slice(0, 4).map(task => (
                  <Card key={task.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="p-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-sm font-medium leading-tight">
                          {task.title}
                        </CardTitle>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          task.priority === 'high' ? 'bg-red-100 text-red-700' : 
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      {task.dueDate && (
                        <CardDescription className="text-xs mt-2 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(task.dueDate), 'MMM d')}
                        </CardDescription>
                      )}
                    </CardHeader>
                  </Card>
                ))
              ) : (
                <p className="text-muted-foreground col-span-2 text-center py-8">
                  No pending tasks. You're all caught up!
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Weekly Progress */}
          <Card className="bg-gradient-to-br from-primary/5 to-accent/50 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Weekly Velocity
              </CardTitle>
              <CardDescription>Goal completion rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">{Math.round(weeklyProgress)}%</div>
              <Progress value={weeklyProgress} className="h-2 mb-4" />
              <p className="text-xs text-muted-foreground">
                {completedWeeklyGoals} of {totalWeeklyGoals} weekly goals completed
              </p>
            </CardContent>
          </Card>

          {/* AI Insight Teaser */}
          <Card className="overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 pointer-events-none" />
            <CardHeader>
              <CardTitle className="text-lg">AI Coach Insight</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                "Based on your recent activity, you're crushing high-priority tasks in the morning. Keep that rhythm!"
              </p>
              <Link href="/chat">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-blue-500/20">
                  Chat with Coach
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
