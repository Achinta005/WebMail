"use client";

import React from "react";
import {
  Inbox,
  Send,
  FileText,
  Trash2,
  Star,
  Mail,
  AtSign,
  ChevronDown,
  ChevronRight,
  Archive,
  PanelLeftClose,
  Plus,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useUiStore } from "@/stores/useUiStore";
import type { MailboxStats } from "@/types/email";

interface FolderTreeProps {
  stats: MailboxStats | null;
  domainName: string;
  onRefresh?: () => void;
}

export function FolderTree({ stats, domainName, onRefresh }: FolderTreeProps) {
  const activeFolder = useUiStore((s) => s.activeFolder);
  const selectedAlias = useUiStore((s) => s.selectedAlias);
  const setActiveFolder = useUiStore((s) => s.setActiveFolder);
  const setSelectedAlias = useUiStore((s) => s.setSelectedAlias);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  const [aliasesOpen, setAliasesOpen] = React.useState(true);
  const [isAddingAlias, setIsAddingAlias] = React.useState(false);
  const [newAliasInput, setNewAliasInput] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const cleanDomain = domainName || "achinta.me";

  const handleCreateAlias = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newAliasInput.trim().toLowerCase();
    if (!trimmed) {
      setIsAddingAlias(false);
      return;
    }

    const fullAlias = trimmed.includes("@") ? trimmed : `${trimmed}@${cleanDomain}`;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_alias",
          alias: fullAlias,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        toast.error(data.error || "Failed to create alias");
        return;
      }

      toast.success(`Alias ${fullAlias} created!`);
      setSelectedAlias(fullAlias);
      setNewAliasInput("");
      setIsAddingAlias(false);
      setAliasesOpen(true);
      if (onRefresh) onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating alias";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const primaryFolders = [
    { id: "inbox", name: "Inbox", icon: Inbox, count: stats?.inboxCount, unread: stats?.unreadCount },
    { id: "all", name: "All Mail", icon: Mail, count: stats?.allCount },
    { id: "sent", name: "Sent", icon: Send, count: stats?.sentCount },
    { id: "starred", name: "Starred", icon: Star, count: stats?.starredCount },
    { id: "drafts", name: "Drafts", icon: FileText },
    { id: "trash", name: "Trash", icon: Trash2, count: stats?.trashCount },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto select-none p-2 space-y-4">
      {/* Domain Brand Header */}
      <div className="px-2 pt-1 pb-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs font-semibold text-foreground truncate">
              Domain: <span className="font-bold text-primary">{domainName || "achinta.me"}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={toggleSidebar}
            title="Collapse sidebar"
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors flex-shrink-0"
          >
            <PanelLeftClose className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Folders Section */}
      <div className="space-y-0.5">
        <div className="px-2 pb-1 text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider">
          Mailboxes
        </div>
        {primaryFolders.map((f) => {
          const Icon = f.icon;
          const isActive = activeFolder === f.id && selectedAlias === "all";

          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFolder(f.id)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-xs"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`size-3.5 flex-shrink-0 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <span className="truncate">{f.name}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {f.unread != null && f.unread > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">
                    {f.unread}
                  </span>
                )}
                {f.count != null && (!f.unread || f.unread === 0) && f.count > 0 && (
                  <span className="text-[11px] text-muted-foreground/70">
                    {f.count}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Domain Aliases Section */}
      <div className="space-y-0.5">
        <div className="flex items-center justify-between px-2 pb-1 group">
          <button
            type="button"
            onClick={() => setAliasesOpen(!aliasesOpen)}
            className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider hover:text-foreground transition-colors"
          >
            <span>Catch-all Aliases</span>
            {aliasesOpen ? (
              <ChevronDown className="size-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="size-3 text-muted-foreground" />
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsAddingAlias(!isAddingAlias);
              if (!aliasesOpen) setAliasesOpen(true);
            }}
            title="Add new alias"
            className="p-1 rounded hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="size-3.5" />
          </button>
        </div>

        {/* Inline Add Alias Form */}
        {isAddingAlias && (
          <form
            onSubmit={handleCreateAlias}
            className="p-1.5 mx-1 mb-1 rounded-md border border-primary/30 bg-card shadow-xs flex flex-col gap-1.5"
          >
            <div className="flex items-center gap-1">
              <input
                type="text"
                autoFocus
                disabled={isSubmitting}
                value={newAliasInput}
                onChange={(e) => setNewAliasInput(e.target.value)}
                placeholder="e.g. dev or dev@achinta.me"
                className="w-full text-xs px-2 py-1 bg-muted/60 border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              />
              <button
                type="submit"
                disabled={isSubmitting || !newAliasInput.trim()}
                className="p-1.5 rounded bg-primary text-primary-foreground disabled:opacity-50 hover:bg-primary/90 flex-shrink-0"
                title="Save alias"
              >
                {isSubmitting ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Check className="size-3" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingAlias(false);
                  setNewAliasInput("");
                }}
                disabled={isSubmitting}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground flex-shrink-0"
                title="Cancel"
              >
                <X className="size-3" />
              </button>
            </div>
            <div className="text-[10px] text-muted-foreground/80 px-0.5">
              Domain: <span className="font-mono text-primary">@{cleanDomain}</span>
            </div>
          </form>
        )}

        {aliasesOpen && (
          <div className="space-y-0.5 pt-0.5">
            <button
              type="button"
              onClick={() => setSelectedAlias("all")}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                selectedAlias === "all" && activeFolder === "inbox"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <AtSign className="size-3.5 text-muted-foreground" />
                <span className="truncate">All Aliases</span>
              </div>
            </button>

            {stats?.aliases?.map((a) => {
              const isActive = selectedAlias === a.alias;
              const displayLabel = a.alias.includes("@")
                ? a.alias.split("@")[0]
                : a.alias;

              return (
                <button
                  key={a.alias}
                  type="button"
                  onClick={() => setSelectedAlias(a.alias)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="size-1.5 rounded-full bg-primary/70 flex-shrink-0" />
                    <span className="truncate" title={a.alias}>
                      {displayLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {a.unreadCount > 0 ? (
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">
                        {a.unreadCount}
                      </span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground/60">
                        {a.count}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
