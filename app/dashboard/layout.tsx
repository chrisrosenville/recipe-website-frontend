"use client";

import Header from "@/components/Header";
import RoleGuard from "@/components/dashboard/RoleGuard";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <RoleGuard>
        <div className="flex gap-0 pt-24 sm:pt-28">
          <DashboardSidebar />
          <main className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full">
            {children}
          </main>
        </div>
      </RoleGuard>
    </div>
  );
}
