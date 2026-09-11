"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  PenSquare,
  Settings,
  Moon,
  Sun,
  Radio,
  RefreshCw,
  PanelLeftOpen,
  LogOut,
} from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useUiStore } from "@/stores/useUiStore";
import { useComposeStore } from "@/stores/useComposeStore";
import { useAuth } from "@/context/AuthContext";

interface NavRailProps {
  onSync: () => void;
  isSyncing: boolean;
  sseConnected: boolean;
  onOpenSettings: () => void;
}

export function NavRail({
  onSync,
  isSyncing,
  sseConnected,
  onOpenSettings,
}: NavRailProps) {
  const theme = useUiStore((s) => s.theme);
  const setTheme = useUiStore((s) => s.setTheme);
  const isSidebarCollapsed = useUiStore((s) => s.isSidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const openCompose = useComposeStore((s) => s.openCompose);
  const { logout } = useAuth();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <Tooltip.Provider delayDuration={200}>
      <div className="w-14 h-full flex-shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-3 justify-between z-20">
        {/* Top actions */}
        <div className="flex flex-col items-center gap-3 w-full">
          {/* Logo or Toggle Sidebar */}
          {isSidebarCollapsed ? (
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  onClick={toggleSidebar}
                  aria-label="Expand sidebar"
                  className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors mb-1"
                >
                  <PanelLeftOpen className="size-4" />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  side="right"
                  sideOffset={8}
                  className="rounded-md bg-popover px-2.5 py-1 text-xs font-medium text-popover-foreground shadow-md border border-border"
                >
                  Show sidebar
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          ) : (
            <div className="size-9 rounded-xl overflow-hidden flex items-center justify-center mb-1 p-0.5 shadow-xs border border-border/40 bg-card/60">
              <Image
                src="/logo.png"
                alt="WebMail Logo"
                width={36}
                height={36}
                priority
                className="size-full object-contain"
              />
            </div>
          )}

          {/* Compose button */}
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                type="button"
                onClick={() => openCompose()}
                aria-label="Compose New Mail"
                className="size-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center shadow-sm"
              >
                <PenSquare className="size-4" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="right"
                sideOffset={8}
                className="rounded-md bg-popover px-2.5 py-1 text-xs font-medium text-popover-foreground shadow-md border border-border"
              >
                Compose Message
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>

          {/* Sync Trigger */}
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                type="button"
                onClick={onSync}
                disabled={isSyncing}
                aria-label="Sync emails from Resend"
                className="size-10 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground active:scale-95 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`size-4 ${isSyncing ? "animate-spin text-primary" : ""}`} />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="right"
                sideOffset={8}
                className="rounded-md bg-popover px-2.5 py-1 text-xs font-medium text-popover-foreground shadow-md border border-border"
              >
                {isSyncing ? "Syncing emails..." : "Sync from Resend"}
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </div>

        {/* Bottom actions */}
        <div className="flex flex-col items-center gap-2.5 w-full">
          {/* Live SSE Connection Indicator */}
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <div
                className={`size-8 rounded-lg flex items-center justify-center cursor-default ${
                  sseConnected
                    ? "text-emerald-500 hover:bg-emerald-500/10"
                    : "text-amber-500 hover:bg-amber-500/10"
                }`}
              >
                <span className="relative flex size-2.5">
                  {sseConnected && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  )}
                  <span
                    className={`relative inline-flex rounded-full size-2.5 ${
                      sseConnected ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                  />
                </span>
              </div>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="right"
                sideOffset={8}
                className="rounded-md bg-popover px-2.5 py-1 text-xs font-medium text-popover-foreground shadow-md border border-border"
              >
                {sseConnected ? "Realtime SSE Connected" : "Connecting to Live Stream..."}
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>

          {/* Theme toggle */}
          {mounted && (
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="size-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
                >
                  {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  side="right"
                  sideOffset={8}
                  className="rounded-md bg-popover px-2.5 py-1 text-xs font-medium text-popover-foreground shadow-md border border-border"
                >
                  Switch Theme
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          )}

          {/* Settings */}
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                type="button"
                onClick={onOpenSettings}
                className="size-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
              >
                <Settings className="size-4" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="right"
                sideOffset={8}
                className="rounded-md bg-popover px-2.5 py-1 text-xs font-medium text-popover-foreground shadow-md border border-border"
              >
                Settings & API Status
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>

          {/* Logout */}
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <button
                type="button"
                onClick={logout}
                aria-label="Sign out"
                className="size-9 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <LogOut className="size-4" />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="right"
                sideOffset={8}
                className="rounded-md bg-popover px-2.5 py-1 text-xs font-medium text-popover-foreground shadow-md border border-border"
              >
                Sign out
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </div>
      </div>
    </Tooltip.Provider>
  );
}
