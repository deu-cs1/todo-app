"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { EmptyState } from "@/components/ui/empty-state";
import { TaskRow } from "@/components/tasks/task-row";

export function TaskList({ tasks, currentUserId, currentUserRole }: { tasks: any[]; currentUserId?: string; currentUserRole?: "owner" | "admin" | "member" }) {
  if (tasks.length === 0) {
    return <EmptyState title="No tasks here" description="Tasks appear here as soon as they match this view." />;
  }

  return (
    <LayoutGroup>
      <motion.div className="space-y-3" layout>
        <AnimatePresence initial={false}>
          {tasks.map((task, index) => (
            <TaskRow key={task._id ?? task.id} task={task} index={index} currentUserId={currentUserId} currentUserRole={currentUserRole} />
          ))}
        </AnimatePresence>
      </motion.div>
    </LayoutGroup>
  );
}
