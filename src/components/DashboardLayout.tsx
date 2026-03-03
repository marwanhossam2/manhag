"use client";

import { Sidebar } from "@/components/Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "STUDENT" | "TEACHER";
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar role={role} />
      <main className="flex-1 lg:ml-0">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
