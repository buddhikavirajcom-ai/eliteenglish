import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { requireAuth } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireAuth();

  return (
    <div className="min-h-screen bg-dashboard-grid bg-[size:30px_30px] md:grid md:grid-cols-[300px_1fr]">
      <Sidebar role={user.role} name={user.name ?? "User"} />
      <main className="page-shell relative">{children}</main>
    </div>
  );
}

