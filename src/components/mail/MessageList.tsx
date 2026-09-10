"use client";

import React from "react";
import {
  Search,
  SlidersHorizontal,
  Mail,
  Inbox,
  LayoutList,
  Rows,
  Loader2,
} from "lucide-react";
import { useUiStore } from "@/stores/useUiStore";
import { MessageListItem } from "./MessageListItem";
import type { Email } from "@/types/email";

interface MessageListProps {
  emails: Email[];
  loading: boolean;
  onToggleStar: (e: React.MouseEvent, id: string, currentStarred: boolean) => void;
}

export function MessageList({
  emails,
  loading,
  onToggleStar,
}: MessageListProps) {
  const activeFolder = useUiStore((s) => s.activeFolder);
  const selectedAlias = useUiStore((s) => s.selectedAlias);
  const selectedEmailId = useUiStore((s) => s.selectedEmailId);
  const selectEmail = useUiStore((s) => s.selectEmail);
  const searchQuery = useUiStore((s) => s.searchQuery);
  const setSearchQuery = useUiStore((s) => s.setSearchQuery);
  const activeFilter = useUiStore((s) => s.activeFilter);
  const setActiveFilter = useUiStore((s) => s.setActiveFilter);
  const density = useUiStore((s) => s.density);
  const setDensity = useUiStore((s) => s.setDensity);

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const lastOpenedEmailIdRef = React.useRef<string | null>(null);

  // Track the most recently clicked/opened email
  React.useEffect(() => {
    if (selectedEmailId) {
      lastOpenedEmailIdRef.current = selectedEmailId;
    }
  }, [selectedEmailId]);

  // When returning to list (selectedEmailId becomes null), scroll to the last viewed email
  React.useEffect(() => {
    if (!selectedEmailId && lastOpenedEmailIdRef.current) {
      const emailIdToRestore = lastOpenedEmailIdRef.current;
      // Slight timeout to ensure layout has painted visible
      const timer = setTimeout(() => {
        const el = document.getElementById(`email-row-${emailIdToRestore}`);
        if (el) {
          el.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [selectedEmailId]);

  const title =
    selectedAlias !== "all"
      ? selectedAlias
      : activeFolder.charAt(0).toUpperCase() + activeFolder.slice(1);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Top Header & Search Bar */}
      <div className="p-3 border-b border-border/60 space-y-2.5 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground tracking-tight capitalize">
              {title}
            </h2>
            <div className="text-[11px] text-muted-foreground">
              {emails.length} message{emails.length === 1 ? "" : "s"}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Density toggle */}
            <button
              type="button"
              onClick={() => setDensity(density === "comfortable" ? "compact" : "comfortable")}
              title={`Switch to ${density === "comfortable" ? "compact" : "comfortable"} view`}
              className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {density === "comfortable" ? (
                <Rows className="size-3.5" />
              ) : (
                <LayoutList className="size-3.5" />
              )}
            </button>

            {/* Filter pills */}
            <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/40 text-[11px]">
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  activeFilter === "all"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("unread")}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  activeFilter === "unread"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Unread
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter("starred")}
                className={`px-2 py-0.5 rounded font-medium transition-colors ${
                  activeFilter === "starred"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Starred
              </button>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="size-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search sender, subject, body..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-md bg-muted/40 border border-border/60 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
      </div>

      {/* Messages List */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto min-h-0 divide-y divide-border/20"
      >
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3">
            <div className="size-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
              <Loader2 className="size-5 animate-spin" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-semibold text-foreground">Syncing messages...</div>
              <p className="text-[11px] text-muted-foreground">Fetching your latest emails</p>
            </div>
          </div>
        ) : emails.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground space-y-2">
            <div className="size-10 rounded-xl bg-muted/50 border border-border/60 flex items-center justify-center text-muted-foreground/60">
              <Inbox className="size-5" />
            </div>
            <div className="text-xs font-medium text-foreground">No messages here</div>
            <p className="text-[11px] max-w-[200px] text-muted-foreground/80 leading-relaxed">
              Emails matching this mailbox or filter will show up in real time.
            </p>
          </div>
        ) : (
          emails.map((email) => (
            <MessageListItem
              key={email.id}
              email={email}
              isSelected={email.id === selectedEmailId}
              density={density}
              onClick={() => selectEmail(email.id)}
              onToggleStar={(e) => onToggleStar(e, email.id, email.is_starred)}
            />
          ))
        )}
      </div>
    </div>
  );
}
