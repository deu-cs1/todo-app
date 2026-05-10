"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/ui/empty-state";
import { TaskRow } from "@/components/tasks/task-row";
import { TaskDetailDrawer } from "@/components/tasks/task-detail-drawer";

export function TaskList({ tasks, currentUserId, currentUserRole }: { tasks: any[]; currentUserId?: string; currentUserRole?: "owner" | "admin" | "member" }) {
  const searchParams = useSearchParams();
  const selectedTaskId = searchParams.get("task");
  const selectedTask = useMemo(() => tasks.find((task) => task._id === selectedTaskId), [selectedTaskId, tasks]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    setIsDetailOpen(Boolean(selectedTask));
  }, [selectedTask]);

  if (tasks.length === 0) {
    return <EmptyState title="No tasks here" description="Tasks appear here as soon as they match this view." />;
  }

  return (
    <>
      <LayoutGroup>
        <motion.div className="space-y-3" layout>
          <AnimatePresence initial={false}>
            {tasks.map((task, index) => (
              <TaskRow key={task._id ?? task.id} task={task} index={index} currentUserId={currentUserId} currentUserRole={currentUserRole} isSelected={task._id === selectedTaskId} />
            ))}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
      {selectedTask && <TaskDetailDrawer task={selectedTask} open={isDetailOpen} onOpenChange={setIsDetailOpen} hideTrigger />}
    </>
  );
}
