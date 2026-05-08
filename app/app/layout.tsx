import { Sidebar } from "@/components/app-shell/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background lg:flex">
      <Sidebar />
      {children}
    </div>
  );
}
