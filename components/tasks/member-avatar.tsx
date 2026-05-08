export function MemberAvatar({ userId, profile }: { userId: string; profile?: { name?: string; email?: string } | null }) {
  const name = profile?.name ?? profile?.email ?? "Unknown user";
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
