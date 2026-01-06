import { useState } from 'react';
import { useTasks, useUpdateTask } from '@/hooks/use-data';
import { 
  DndContext, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@shared/schema';
import { cn } from '@/lib/utils';
import { GripVertical, MoreHorizontal, Calendar, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';

const COLUMNS = {
  todo: 'To Do',
  in_progress: 'In Progress',
  blocked: 'Blocked',
  done: 'Done'
} as const;

type ColumnId = keyof typeof COLUMNS;

export function KanbanBoard() {
  const { data: tasks = [] } = useTasks();
  const updateTask = useUpdateTask();
  const [activeId, setActiveId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(Number(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTask = tasks.find(t => t.id === Number(active.id));
    const overId = over.id;
    
    // If dropped on a column container
    if (Object.keys(COLUMNS).includes(String(overId))) {
      const newStatus = overId as ColumnId;
      if (activeTask && activeTask.status !== newStatus) {
        updateTask.mutate({ id: activeTask.id, status: newStatus });
      }
      return;
    }

    // If dropped on another task
    const overTask = tasks.find(t => t.id === Number(overId));
    if (activeTask && overTask && activeTask.status !== overTask.status) {
      updateTask.mutate({ id: activeTask.id, status: overTask.status as any });
    }
  };

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 h-full min-h-[500px]">
        {(Object.keys(COLUMNS) as ColumnId[]).map((columnId) => (
          <KanbanColumn
            key={columnId}
            id={columnId}
            title={COLUMNS[columnId]}
            tasks={tasks.filter(t => t.status === columnId)}
          />
        ))}
      </div>
      
      <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }) }}>
        {activeTask ? <TaskCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumn({ id, title, tasks }: { id: ColumnId, title: string, tasks: Task[] }) {
  const { setNodeRef } = useSortable({ id });

  const getBadgeColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
      case 'in_progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'blocked': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      case 'done': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-slate-100';
    }
  };

  return (
    <div ref={setNodeRef} className="flex flex-col h-full bg-accent/30 rounded-xl p-4 border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">{title}</h3>
        <Badge variant="outline" className={cn("rounded-full px-2", getBadgeColor(id))}>
          {tasks.length}
        </Badge>
      </div>
      
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-3">
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

function SortableTaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn("touch-none", isDragging && "opacity-50")}
    >
      <TaskCard task={task} />
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  const priorityColor = {
    low: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    medium: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
    high: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
  }[task.priority];

  return (
    <div className="bg-card p-4 rounded-xl shadow-sm border border-border/50 hover:shadow-md hover:border-primary/50 transition-all cursor-grab active:cursor-grabbing group">
      <div className="flex items-start justify-between mb-2">
        <Badge variant="secondary" className={cn("text-[10px] uppercase font-bold tracking-wider", priorityColor)}>
          {task.priority}
        </Badge>
        <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      
      <h4 className="font-medium text-sm mb-1 leading-snug">{task.title}</h4>
      
      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {task.dueDate && (
            <div className={cn("flex items-center gap-1", new Date(task.dueDate) < new Date() && "text-destructive")}>
              <Clock className="w-3 h-3" />
              <span>{format(new Date(task.dueDate), 'MMM d')}</span>
            </div>
          )}
        </div>
        
        {/* Mock assignee avatar */}
        <div className="flex -space-x-2">
          <div className="w-6 h-6 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center border-2 border-background">
            ME
          </div>
        </div>
      </div>
    </div>
  );
}
