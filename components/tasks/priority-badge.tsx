import { Badge } from "@/components/ui/badge";
import { type Priority } from "@/lib/mock-data";

const label: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

const classes: Record<Priority, string> = {
  low: "border-slate-200 bg-slate-50 text-slate-600",
  medium: "border-blue-200 bg-blue-50 text-blue-700",
  high: "border-orange-200 bg-orange-50 text-orange-700",
  urgent: "border-red-200 bg-red-50 text-red-700",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <Badge className={classes[priority]}>{label[priority]}</Badge>;
}
