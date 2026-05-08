import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function MemberList({ members }: { members: any[] }) {
  return (
    <div className="rounded-xl border border-border bg-surface">
      {members.map((member, index) => (
        <div key={member._id} className="flex flex-col gap-3 border-b border-border p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-sm font-bold text-white">
              {getInitials(member.profile?.name ?? member.userId)}
            </span>
            <div>
              <p className="font-semibold">{member.profile?.name ?? member.userId}</p>
              <p className="text-sm text-muted-foreground">{member.profile?.email ?? "No email"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="border-border bg-background text-muted-foreground">{member.role}</Badge>
            {index > 0 && <Button variant="ghost" size="sm">Remove</Button>}
          </div>
        </div>
      ))}
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
