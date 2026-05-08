import { Calendar } from "lucide-react";
import { formatDueDate } from "@/lib/time";

export function DueDateBadge({ date }: { date?: Date | number }) {
  if (!date) return null;
  const value = typeof date === "number" ? new Date(date) : date;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
      {formatDueDate(value)}
    </span>
  );
}
