import { AppShell } from "@/components/app-shell/app-shell";
import { InviteMemberDialog } from "@/components/members/invite-member-dialog";
import { MemberList } from "@/components/members/member-list";

export default function MembersPage() {
  return (
    <AppShell title="Members" eyebrow="Launch Team" action={<InviteMemberDialog />}>
      <MemberList />
    </AppShell>
  );
}
