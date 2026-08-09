"use client";

import { useState } from "react";
import { LogOut, Receipt } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/services/auth.service";

interface DashboardHeaderProps {
  role: "ADMIN" | "CLIENT";
}

export default function DashboardHeader({
  role,
}: DashboardHeaderProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [loggingOut, setLoggingOut] =
    useState(false);

  async function handleLogout() {
    if (loggingOut) return;

    try {
      setLoggingOut(true);

      await logout();

      toast.success("Logged out successfully");

      router.replace("/login");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to logout"
      );

      setLoggingOut(false);
    }
  }

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Receipt className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">
              Nexus Billing Portal
            </p>

            <p className="text-xs text-slate-500">
              {role === "ADMIN"
                ? "Administration"
                : "Client Portal"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-slate-900">
              {user?.name ?? "User"}
            </p>

            <p className="text-xs text-slate-500">
              {user?.email ?? ""}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={loggingOut}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />

            {loggingOut
              ? "Logging out..."
              : "Logout"}
          </button>
        </div>
      </div>
    </header>
  );
}