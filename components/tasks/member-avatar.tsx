"use client";

import { useState } from "react";

export function MemberAvatar({
  userId: _userId,
  profile,
  size = "sm",
}: {
  userId: string;
  profile?: { name?: string; email?: string; avatarUrl?: string } | null;
  size?: "sm" | "md";
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const name = profile?.name ?? profile?.email ?? "Unknown user";
  const avatarUrl = profile?.avatarUrl?.trim();
  const initials =
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";
  const sizeClass = size === "md" ? "h-10 w-10 text-sm" : "h-7 w-7 text-[10px]";

  if (avatarUrl && !imageFailed) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        title={name}
        onError={() => setImageFailed(true)}
        className={`${sizeClass} inline-flex shrink-0 rounded-full border border-white bg-muted object-cover shadow-line`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <span
      title={name}
      className={`${sizeClass} inline-flex shrink-0 items-center justify-center rounded-full border border-white bg-foreground font-bold text-white shadow-line`}
    >
      {initials}
    </span>
  );
}
