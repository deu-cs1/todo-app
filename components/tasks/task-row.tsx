"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DueDateBadge } from "@/components/tasks/due-date-badge";
import { MemberAvatar } from "@/components/tasks/member-avatar";
import { PriorityBadge } from "@/components/tasks/priority-badge";
import { StatusChip } from "@/components/tasks/status-chip";
import { currentUserId, deriveTaskStatus, type Task } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function TaskRow({ task, index = 0 }: { task: Task; index?: number }) {
  const myAssignment = task.assignments.find((assignment) => assignment.userId === currentUserId);
  const overall = deriveTaskStatus(task.assignments);
  const Icon = myAssignment?.status === "completed" ? CheckCircle2 : myAssignment?.status === "in_progress" ? Clock3 : Circle;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.035 }}
      className="group rounded-xl border border-border bg-surface p-4 shadow-line transition duration-200 hover:-translate-y-0.5 hover:shadow-soft"
    >
      <div className="flex gap-4">
        <Button
          variant="ghost"
          size="icon"
          aria-label={myAssignment ? "Update my status" : "View task status"}
          className={cn("mt-0.5 shrink-0 rounded-full", myAssignment?.status === "completed" && "text-success")}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <h3 className="font-semibold leading-6 text-foreground">{task.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{task.description}</p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <StatusChip status={overall} />
              <PriorityBadge priority={task.priority} />
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{task.projectName}</span>
              <DueDateBadge date={task.dueDate} />
              <span>{task.assignments.length} assignees</span>
            </div>
            <div className="flex -space-x-2">
              {task.assignments.map((assignment) => (
                <MemberAvatar key={assignment.userId} userId={assignment.userId} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
