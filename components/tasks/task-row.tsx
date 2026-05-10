"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";
import { CheckCircle2, Circle, Clock3, Trash2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { DueDateBadge } from "@/components/tasks/due-date-badge";
import { MemberAvatar } from "@/components/tasks/member-avatar";
import { PriorityBadge } from "@/components/tasks/priority-badge";
import { StatusChip } from "@/components/tasks/status-chip";
import { deriveTaskStatus, type AssignmentStatus } from "@/lib/task-utils";
import { cn } from "@/lib/utils";

const statusGlow: Record<AssignmentStatus, string> = {
  todo: "from-slate-300/0 via-slate-300/0 to-slate-300/0",
  in_progress: "from-amber-300/35 via-amber-100/40 to-transparent",
  completed: "from-emerald-300/40 via-emerald-100/45 to-transparent",
};

const iconTone: Record<AssignmentStatus, string> = {
  todo: "text-muted-foreground",
  in_progress: "text-warning",
  completed: "text-success",
};

const statusPulse: Record<AssignmentStatus, string> = {
  todo: "bg-slate-400",
  in_progress: "bg-warning",
  completed: "bg-success",
};

const assignmentSummaryLabels: Record<AssignmentStatus, string> = {
  todo: "Not started",
  in_progress: "Doing",
  completed: "Done",
};

const assignmentSummaryClasses: Record<AssignmentStatus, string> = {
  todo: "border-slate-200 bg-slate-50 text-slate-600",
  in_progress: "border-amber-200 bg-amber-50 text-amber-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const deleteAnimationMs = 450;

export function TaskRow({
  task,
  currentUserId,
  currentUserRole,
  isSelected = false,
}: {
  task: any;
  index?: number;
  currentUserId?: string;
  currentUserRole?: "owner" | "admin" | "member";
  isSelected?: boolean;
}) {
  const updateStatus = useMutation(api.tasks.updateMyAssignmentStatus);
  const deleteTask = useMutation(api.tasks.deleteTask);
  const [isDeleting, setIsDeleting] = useState(false);
  const dragX = useMotionValue(0);
  const dangerBackground = useTransform(dragX, [0, 120], ["hsl(var(--surface))", "rgb(254 226 226)"]);
  const dangerOpacity = useTransform(dragX, [16, 84], [0, 1]);
  const myAssignment = currentUserId ? task.assignments.find((assignment: any) => assignment.userId === currentUserId) : undefined;
  const overall = deriveTaskStatus(task.assignments);
  const activeStatus = (myAssignment?.status ?? overall) as AssignmentStatus;
  const Icon = myAssignment?.status === "completed" ? CheckCircle2 : myAssignment?.status === "in_progress" ? Clock3 : Circle;
  const nextStatus = myAssignment?.status === "todo" ? "in_progress" : myAssignment?.status === "in_progress" ? "completed" : "todo";
  const canDelete = currentUserRole === "owner";
  const assignmentGroups = groupAssignmentsByStatus(task.assignments);
  const showAssignmentBreakdown = task.assignments.length > 1;

  async function handleDelete() {
    if (!canDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      await Promise.all([
        animate(dragX, 132, { duration: deleteAnimationMs / 1000, ease: "easeOut" }),
        new Promise((resolve) => window.setTimeout(resolve, deleteAnimationMs)),
      ]);
      await deleteTask({ taskId: task._id });
    } catch {
      setIsDeleting(false);
      animate(dragX, 0, { type: "spring", stiffness: 520, damping: 34 });
    }
  }

  return (
    <motion.div
      layout
      exit={{ opacity: 0, x: 72, scale: 0.98 }}
      transition={{
        layout: { type: "spring", stiffness: 420, damping: 32, mass: 0.8 },
        opacity: { duration: 0.42, ease: "easeOut" },
        x: { duration: 0.42, ease: "easeOut" },
        scale: { duration: 0.42, ease: "easeOut" },
      }}
      className="relative overflow-hidden rounded-xl"
      style={{ backgroundColor: dangerBackground }}
    >
      {canDelete && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 flex items-center gap-2 px-5 text-red-700"
          style={{ opacity: dangerOpacity }}
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-red-100 ring-1 ring-red-200">
            <Trash2 className="h-5 w-5" />
          </span>
          <span className="text-sm font-bold">Delete</span>
        </motion.div>
      )}
      <motion.article
        layout
        drag={canDelete ? "x" : false}
        dragConstraints={{ left: 0, right: 132 }}
        dragElastic={0.12}
        dragMomentum={false}
        style={{ x: dragX }}
        onDragEnd={(_, info) => {
          if (canDelete && info.offset.x > 104) {
            void handleDelete();
            return;
          }
          animate(dragX, 0, { type: "spring", stiffness: 520, damping: 34 });
        }}
        animate={{
          opacity: isDeleting ? 0 : 1,
          scale: isDeleting ? 0.98 : activeStatus === "todo" ? 1 : [1, 1.012, 1],
          borderColor:
            activeStatus === "completed"
              ? "rgba(16, 185, 129, 0.36)"
              : activeStatus === "in_progress"
                ? "rgba(245, 158, 11, 0.38)"
                : "hsl(var(--border))",
        }}
        transition={{
          layout: { type: "spring", stiffness: 420, damping: 32, mass: 0.8 },
          opacity: { duration: deleteAnimationMs / 1000, ease: "easeOut" },
          scale: { duration: isDeleting ? deleteAnimationMs / 1000 : 0.28, ease: "easeOut" },
          borderColor: { duration: 0.2, ease: "easeOut" },
        }}
        className={cn(
          "group relative overflow-hidden rounded-xl border border-border bg-surface p-4 shadow-line transition-shadow duration-200 hover:shadow-soft",
          isSelected && "border-red-300 ring-2 ring-red-100",
          isDeleting && "pointer-events-none opacity-70",
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStatus}
            aria-hidden="true"
            className={cn("pointer-events-none absolute inset-0 bg-gradient-to-r", statusGlow[activeStatus])}
            initial={{ opacity: 0, x: "-18%" }}
            animate={{ opacity: activeStatus === "todo" ? 0 : [0, 1, 0], x: "18%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.72, ease: "easeOut" }}
          />
        </AnimatePresence>
        <div className="flex gap-4">
          <Button
            variant="ghost"
            size="icon"
            aria-label={myAssignment ? "Update my status" : "View task status"}
            onClick={() => {
              if (myAssignment) {
                void updateStatus({ taskId: task._id, status: nextStatus });
              }
            }}
            className={cn("relative mt-0.5 shrink-0 rounded-full", iconTone[activeStatus])}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={activeStatus}
                className="absolute inset-0 grid place-items-center"
                initial={{ opacity: 0, rotate: -35, scale: 0.65 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 35, scale: 0.65 }}
                transition={{ type: "spring", stiffness: 520, damping: 28 }}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </motion.span>
            </AnimatePresence>
            <motion.span
              aria-hidden="true"
              className={cn("absolute inset-2 rounded-full opacity-20 blur-sm", statusPulse[activeStatus])}
              animate={{ scale: activeStatus === "todo" ? 0 : [0.55, 1.5, 0.7], opacity: activeStatus === "todo" ? 0 : [0, 0.32, 0] }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <h3 className="font-semibold leading-6 text-foreground">{task.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{task.description}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {canDelete && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete task: ${task.title}`}
                    title="Delete task"
                    disabled={isDeleting}
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleDelete();
                    }}
                    className="h-11 w-11 rounded-full text-red-700 hover:bg-red-50 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                )}
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={overall}
                    initial={{ opacity: 0, y: 6, scale: 0.92 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.92 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <StatusChip status={overall} />
                  </motion.div>
                </AnimatePresence>
                <PriorityBadge priority={task.priority} />
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{task.project?.name ?? task.projectName}</span>
                <DueDateBadge date={task.dueDate} />
                <span>{task.assignments.length} assignees</span>
              </div>
              <div className="flex -space-x-2">
                {task.assignments.map((assignment: any) => (
                  <MemberAvatar key={assignment.userId} userId={assignment.userId} profile={assignment.profile} />
                ))}
              </div>
            </div>
            {showAssignmentBreakdown && (
              <div className="mt-4 grid gap-2 md:grid-cols-3">
                {(["in_progress", "completed", "todo"] as AssignmentStatus[]).map((status) => (
                  <AssignmentStatusGroup key={status} status={status} assignments={assignmentGroups[status]} />
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
}

function AssignmentStatusGroup({ status, assignments }: { status: AssignmentStatus; assignments: any[] }) {
  return (
    <div className={cn("min-w-0 rounded-lg border px-3 py-2", assignmentSummaryClasses[status])}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wide">{assignmentSummaryLabels[status]}</span>
        <span className="text-xs font-bold">{assignments.length}</span>
      </div>
      <p className="mt-1 truncate text-xs font-medium" title={assignments.map(getAssignmentName).join(", ") || "None"}>
        {assignments.length > 0 ? assignments.map(getAssignmentName).join(", ") : "None"}
      </p>
    </div>
  );
}

function groupAssignmentsByStatus(assignments: any[]) {
  return assignments.reduce<Record<AssignmentStatus, any[]>>(
    (groups, assignment) => {
      groups[assignment.status as AssignmentStatus].push(assignment);
      return groups;
    },
    { todo: [], in_progress: [], completed: [] },
  );
}

function getAssignmentName(assignment: any) {
  return assignment.profile?.name ?? assignment.profile?.email ?? "Unknown member";
}
