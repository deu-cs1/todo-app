import { getMember } from "@/lib/mock-data";

export function MemberAvatar({ userId, profile }: { userId: string; profile?: { name?: string; email?: string } | null }) {
  const member = getMember(userId);
  const name = profile?.name ?? member?.name ?? "Unknown user";
  const initials =
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";
  return (
    <span
      title={name}
      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white bg-foreground text-[10px] font-bold text-white shadow-line"
    >
      {initials}
    </span>
  );
}
