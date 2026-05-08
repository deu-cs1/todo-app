import { Badge } from "@/components/ui/badge";
import { type AssignmentStatus } from "@/lib/mock-data";

const labels: Record<AssignmentStatus, string> = {
  todo: "Todo",
  in_progress: "Doing",
  completed: "Done",
};

const classes: Record<AssignmentStatus, string> = {
  todo: "border-slate-200 bg-slate-50 text-slate-600",
  in_progress: "border-amber-200 bg-amber-50 text-amber-700",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function StatusChip({ status }: { status: AssignmentStatus }) {
  return <Badge className={classes[status]}>{labels[status]}</Badge>;
}
