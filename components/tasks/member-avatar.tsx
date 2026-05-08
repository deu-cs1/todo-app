import { getMember } from "@/lib/mock-data";

export function MemberAvatar({ userId }: { userId: string }) {
  const member = getMember(userId);
  return (
    <span
      title={member?.name ?? "Unknown user"}
      className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white bg-foreground text-[10px] font-bold text-white shadow-line"
    >
      {member?.initials ?? "?"}
    </span>
  );
}
