"use client";

import { DashboardLayout } from "@/components/DashboardLayout";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout role="STUDENT">{children}</DashboardLayout>;
}
