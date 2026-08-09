"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import DashboardHeader from "@/components/layout/DashboardHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const {
    user,
    hydrated,
  } = useAuth();

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "ADMIN") {
      router.replace("/forbidden");
    }
  }, [
    hydrated,
    user,
    router,
  ]);

  if (
    !hydrated ||
    !user ||
    user.role !== "ADMIN"
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          Loading...
        </p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader role="ADMIN" />

      {children}
    </div>
  );
}