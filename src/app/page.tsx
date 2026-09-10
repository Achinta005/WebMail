"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Toaster, toast } from "sonner";
import { NavRail } from "@/components/shared/NavRail";
import { ThreePanelLayout } from "@/components/shared/ThreePanelLayout";
import { FolderTree } from "@/components/mail/FolderTree";
import { MessageList } from "@/components/mail/MessageList";
import { ReadingPane } from "@/components/mail/ReadingPane";
import { ComposeDialog } from "@/components/mail/ComposeDialog";
import { SettingsModal } from "@/components/mail/SettingsModal";
import { useUiStore } from "@/stores/useUiStore";
import type { Email, MailboxStats, SendEmailPayload } from "@/types/email";

export default function MailboxPage() {
  const activeFolder = useUiStore((s) => s.activeFolder);
  const selectedAlias = useUiStore((s) => s.selectedAlias);
  const selectedEmailId = useUiStore((s) => s.selectedEmailId);
  const selectEmail = useUiStore((s) => s.selectEmail);
  const searchQuery = useUiStore((s) => s.searchQuery);
  const activeFilter = useUiStore((s) => s.activeFilter);
  const viewMode = useUiStore((s) => s.viewMode);
  const setViewMode = useUiStore((s) => s.setViewMode);

  const [emails, setEmails] = useState<Email[]>([]);
  const [stats, setStats] = useState<MailboxStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isSseConnected, setIsSseConnected] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [statusData, setStatusData] = useState<{
    configured: boolean;
    domainVerified: boolean;
    domainName: string;
    maskedKey: string | null;
    defaultFrom: string;
    webhookUrl: string;
    error?: string;
  } | null>(null);

  // Fetch status info
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setStatusData(data);
      }
    } catch (err) {
      console.error("Error fetching status:", err);
    }
  }, []);

  // Fetch emails from API
  const fetchEmails = useCallback(
    async (showLoading = true) => {
      if (showLoading) setLoading(true);
      try {
        const state = useUiStore.getState();
        const currentFolder = state.activeFolder;
        const currentAlias = state.selectedAlias;
        const currentFilter = state.activeFilter;
        const currentSearch = state.searchQuery;

        const params = new URLSearchParams();
        const isStarredView = currentFolder === "starred" || currentFilter === "starred";

        if (isStarredView) {
          params.set("starred", "true");
        } else {
          params.set("folder", currentFolder);
        }

        if (currentAlias !== "all") params.set("alias", currentAlias);
        if (currentSearch.trim()) params.set("q", currentSearch.trim());

        const res = await fetch(`/api/emails?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          let list = data.emails as Email[];
          if (currentFilter === "unread") {
            list = list.filter((e) => !e.is_read);
          }
          setEmails(list);
          if (data.stats) setStats(data.stats);

          // Only ensure selectedEmailId remains valid if one was already active
          const curId = useUiStore.getState().selectedEmailId;
          if (curId && !list.find((e) => e.id === curId)) {
            selectEmail(null);
          }
        }
      } catch (err) {
        console.error("Error fetching emails:", err);
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [selectEmail]
  );

  // Initial load: initialize persisted settings first, then fetch
  useEffect(() => {
    useUiStore.getState().initSettings();
    fetchStatus();
    fetchEmails();
  }, [fetchStatus, fetchEmails]);

  // Re-fetch emails whenever activeFolder, selectedAlias, searchQuery, or activeFilter changes
  useEffect(() => {
    fetchEmails();
  }, [activeFolder, selectedAlias, searchQuery, activeFilter, fetchEmails]);

  // Automatically mark email as read when opened
  useEffect(() => {
    if (!selectedEmailId) return;
    const target = emails.find((e) => e.id === selectedEmailId);
    if (target && !target.is_read) {
      // Optimistically update read status locally
      setEmails((prev) =>
        prev.map((e) => (e.id === selectedEmailId ? { ...e, is_read: true } : e))
      );
      // Update unread count badge in stats
      setStats((prev) =>
        prev ? { ...prev, unreadCount: Math.max(0, prev.unreadCount - 1) } : prev
      );
      // Persist to server
      fetch(`/api/emails/${selectedEmailId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_read: true }),
      }).catch((err) => console.error("Error auto-marking email as read:", err));
    }
  }, [selectedEmailId, emails]);

  // Real-time SSE Streaming
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connectSse = () => {
      try {
        eventSource = new EventSource("/api/emails/events");

        eventSource.onopen = () => {
          setIsSseConnected(true);
        };

        eventSource.onmessage = (event) => {
          if (!event.data) return;
          try {
            const data = JSON.parse(event.data);

            if (data.type === "new_email" && data.email) {
              const newEmail = data.email as Email;

              setEmails((prev) => {
                if (prev.some((e) => e.id === newEmail.id)) return prev;

                const matchesFolder = activeFolder === "all" || newEmail.folder === activeFolder;
                const matchesAlias =
                  selectedAlias === "all" ||
                  newEmail.matched_alias === selectedAlias ||
                  newEmail.to_addresses.includes(selectedAlias);

                if (matchesFolder && matchesAlias) {
                  return [newEmail, ...prev];
                }
                return prev;
              });

            } else if (data.type === "alias_created" || data.type === "alias_deleted") {
              if (data.stats) setStats(data.stats);
            } else if (data.type === "stats_update") {
              if (data.stats) setStats(data.stats);
              fetchEmails(false);
            } else if (data.type === "email_updated" && data.email) {
              const updated = data.email as Email;
              setEmails((prev) =>
                prev.map((e) => (e.id === updated.id ? { ...e, ...updated } : e))
              );
              if (data.stats) setStats(data.stats);
            } else if (data.type === "email_deleted" && data.id) {
              setEmails((prev) => prev.filter((e) => e.id !== data.id));
              if (data.stats) setStats(data.stats);
            }
          } catch {
            // keepalive ping
          }
        };

        eventSource.onerror = () => {
          setIsSseConnected(false);
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          reconnectTimeout = setTimeout(connectSse, 5000);
        };
      } catch (err) {
        console.error("SSE error:", err);
        reconnectTimeout = setTimeout(connectSse, 5000);
      }
    };

    connectSse();

    return () => {
      if (eventSource) eventSource.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [activeFolder, selectedAlias]);

  // Sync with Resend
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/emails/sync", { method: "POST" });
      if (res.ok) {
        await fetchEmails(false);
        await fetchStatus();
        toast.success("Mailbox synchronized with Resend!");
      }
    } catch (err) {
      console.error("Sync error:", err);
      toast.error("Failed to sync emails.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Toggle star
  const handleToggleStar = async (
    e: React.MouseEvent | null,
    id: string,
    currentStarred: boolean
  ) => {
    if (e) e.stopPropagation();
    const nextStarred = !currentStarred;

    const isStarredView = activeFolder === "starred" || activeFilter === "starred";

    setEmails((prev) => {
      if (isStarredView && !nextStarred) {
        // If unstarring while in Starred view, remove from current list
        return prev.filter((m) => m.id !== id);
      }
      return prev.map((m) =>
        m.id === id ? { ...m, is_starred: nextStarred } : m
      );
    });

    setStats((prev) =>
      prev
        ? {
            ...prev,
            starredCount: Math.max(0, prev.starredCount + (nextStarred ? 1 : -1)),
          }
        : prev
    );

    try {
      const res = await fetch(`/api/emails/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_starred: nextStarred }),
      });
      if (res.ok) {
        toast.success(nextStarred ? "Starred" : "Unstarred");
      }
    } catch (err) {
      console.error("Error toggling star:", err);
    }
  };

  // Toggle read/unread
  const handleToggleRead = async (id: string, currentRead: boolean) => {
    const nextRead = !currentRead;
    setEmails((prev) =>
      prev.map((m) => (m.id === id ? { ...m, is_read: nextRead } : m))
    );

    try {
      await fetch(`/api/emails/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_read: nextRead }),
      });
      toast.success(nextRead ? "Marked as read." : "Marked as unread.");
    } catch (err) {
      console.error("Error toggling read status:", err);
    }
  };

  // Restore from trash
  const handleRestore = async (id: string) => {
    setEmails((prev) => prev.filter((m) => m.id !== id));
    if (selectedEmailId === id) selectEmail(null);

    try {
      await fetch(`/api/emails/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "inbox" }),
      });
      toast.success("Message restored to Inbox.");
      fetchEmails(false);
    } catch (err) {
      console.error("Error restoring email:", err);
      toast.error("Failed to restore email.");
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    const isTrash = activeFolder === "trash";
    setEmails((prev) => prev.filter((m) => m.id !== id));
    if (selectedEmailId === id) selectEmail(null);

    try {
      await fetch(`/api/emails/${id}${isTrash ? "?permanent=true" : ""}`, {
        method: "DELETE",
      });
      fetchEmails(false);
      toast.success(isTrash ? "Permanently deleted email." : "Moved email to trash.");
    } catch (err) {
      console.error("Error deleting:", err);
      toast.error("Failed to delete email.");
    }
  };

  // Send Email
  const handleSendEmail = async (payload: SendEmailPayload): Promise<boolean> => {
    try {
      const res = await fetch("/api/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) return false;
      await fetchEmails(false);
      return true;
    } catch (err) {
      console.error("Send failed:", err);
      return false;
    }
  };

  const selectedEmail = emails.find((e) => e.id === selectedEmailId) || null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background font-sans text-foreground">
      <Toaster position="bottom-right" richColors />

      {/* NavRail - Leftmost vertical icon bar */}
      <NavRail
        onSync={handleSync}
        isSyncing={isSyncing}
        sseConnected={isSseConnected}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Three Panel Layout */}
      <div className="flex-1 min-w-0 h-full overflow-hidden">
        <ThreePanelLayout
          sidebar={
            <FolderTree
              stats={stats}
              domainName={statusData?.domainName || "achinta.me"}
              onRefresh={() => fetchEmails(false)}
            />
          }
          messageList={
            <MessageList
              emails={emails}
              loading={loading}
              onToggleStar={handleToggleStar}
            />
          }
          readingPane={
            <ReadingPane
              email={selectedEmail}
              activeFolder={activeFolder}
              onDelete={handleDelete}
              onToggleStar={(id, cur) => handleToggleStar(null, id, cur)}
              onRestore={handleRestore}
              onBack={() => selectEmail(null)}
            />
          }
        />
      </div>

      {/* Compose Dialog Modal */}
      <ComposeDialog
        primaryDomain={statusData?.domainName || "achinta.me"}
        onSend={handleSendEmail}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        statusData={statusData}
        onSync={handleSync}
        isSyncing={isSyncing}
      />
    </div>
  );
}
