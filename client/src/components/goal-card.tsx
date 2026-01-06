import { Goal } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, MoreVertical, Trash2 } from "lucide-react";
import { useUpdateGoal, useDeleteGoal } from "@/hooks/use-data";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function GoalCard({ goal }: { goal: Goal }) {
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();

  const handleStatusToggle = () => {
    const nextStatus = goal.status === 'completed' ? 'not_started' : 'completed';
    const nextProgress = nextStatus === 'completed' ? 100 : 0;
    updateGoal.mutate({ id: goal.id, status: nextStatus, progress: nextProgress });
  };

  const isCompleted = goal.status === 'completed';

  return (
    <Card className={cn(
      "transition-all duration-300 border-border/60 hover:border-primary/50 hover:shadow-lg",
      isCompleted && "bg-accent/20 opacity-80"
    )}>
      <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
        <div className="flex-1 gap-2 flex items-start">
          <button 
            onClick={handleStatusToggle}
            className={cn(
              "mt-1 transition-colors duration-200",
              isCompleted ? "text-primary" : "text-muted-foreground hover:text-primary"
            )}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>
          <div>
            <CardTitle className={cn(
              "text-lg font-semibold leading-tight",
              isCompleted && "line-through text-muted-foreground"
            )}>
              {goal.title}
            </CardTitle>
            {goal.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {goal.description}
              </p>
            )}
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={() => deleteGoal.mutate(goal.id)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Goal
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Progress</span>
          <span>{goal.progress}%</span>
        </div>
        <Progress value={goal.progress} className="h-2" />
      </CardContent>
      
      <CardFooter className="pt-0 text-xs text-muted-foreground flex justify-between">
        <span className="capitalize bg-accent px-2 py-1 rounded-md">{goal.type} Goal</span>
        {goal.date && (
          <span>{new Date(goal.date).toLocaleDateString()}</span>
        )}
      </CardFooter>
    </Card>
  );
}
