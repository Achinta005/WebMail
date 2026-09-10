"use client";

import React, { memo } from "react";
import { Star, Paperclip } from "lucide-react";
import type { Email } from "@/types/email";
import { format, isToday } from "date-fns";

interface MessageListItemProps {
  email: Email;
  isSelected: boolean;
  density: "compact" | "comfortable";
  onClick: () => void;
  onToggleStar: (e: React.MouseEvent) => void;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isToday(d)) {
      return format(d, "h:mm a");
    }
    return format(d, "MMM d");
  } catch {
    return "";
  }
}

function getAvatarColor(name: string): string {
  const colors = [
    "bg-amber-600/20 text-amber-500 border-amber-500/30",
    "bg-emerald-600/20 text-emerald-500 border-emerald-500/30",
    "bg-sky-600/20 text-sky-500 border-sky-500/30",
    "bg-rose-600/20 text-rose-500 border-rose-500/30",
    "bg-purple-600/20 text-purple-500 border-purple-500/30",
    "bg-indigo-600/20 text-indigo-500 border-indigo-500/30",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export const MessageListItem = memo(function MessageListItem({
  email,
  isSelected,
  density,
  onClick,
  onToggleStar,
}: MessageListItemProps) {
  const isUnread = !email.is_read;
  const isStarred = email.is_starred;
  const senderName = email.from_name || email.from_address;
  const dateDisplay = formatDate(email.created_at);
  const avatarClass = getAvatarColor(senderName);
  const initials = getInitials(senderName);

  if (density === "compact") {
    return (
      <div
        id={`email-row-${email.id}`}
        onClick={onClick}
        className={`group relative flex items-center gap-3 px-4 py-2.5 cursor-pointer border-b border-border/40 transition-colors hover:shadow-xs ${
          isSelected
            ? "bg-accent text-accent-foreground"
            : isUnread
            ? "bg-primary/5 hover:bg-accent/40 font-semibold"
            : "hover:bg-accent/30 text-muted-foreground"
        }`}
      >
        {/* Left unread indicator bar */}
        {isUnread && (
          <div className="absolute left-0 inset-y-0 w-1 bg-primary" />
        )}

        <button
          type="button"
          onClick={onToggleStar}
          className={`flex-shrink-0 p-0.5 rounded transition-colors ${
            isStarred
              ? "text-amber-500"
              : "text-muted-foreground/40 group-hover:text-muted-foreground hover:text-amber-500"
          }`}
        >
          <Star className="size-4" fill={isStarred ? "currentColor" : "none"} />
        </button>

        <div className={`w-44 sm:w-56 flex-shrink-0 truncate text-xs ${isUnread ? "font-bold text-foreground" : "font-medium text-foreground/85"}`}>
          {senderName}
        </div>

        <div className="flex-1 min-w-0 flex items-center gap-2 text-xs truncate">
          <span
            className={`truncate ${
              isUnread ? "font-bold text-foreground" : "text-foreground/90 font-medium"
            }`}
          >
            {email.subject || "(No Subject)"}
          </span>
          <span className="text-muted-foreground/60 text-xs truncate hidden sm:inline">
            — {email.snippet}
          </span>
        </div>

        {email.attachments && email.attachments.length > 0 && (
          <Paperclip className="size-3.5 text-muted-foreground/60 flex-shrink-0 ml-1" />
        )}

        <div className="text-[11px] text-muted-foreground flex-shrink-0 whitespace-nowrap pl-2 text-right">
          {dateDisplay}
        </div>
      </div>
    );
  }

  // Comfortable density (default)
  return (
    <div
      id={`email-row-${email.id}`}
      onClick={onClick}
      className={`group relative flex items-start gap-3 p-3.5 cursor-pointer border-b border-border/40 transition-colors ${
        isSelected
          ? "bg-accent/90 text-accent-foreground shadow-xs"
          : isUnread
          ? "bg-primary/5 hover:bg-accent/40"
          : "hover:bg-accent/30"
      }`}
    >
      {/* Left indicator bar */}
      {isUnread && (
        <div className="absolute left-0 inset-y-0 w-1 bg-primary rounded-r" />
      )}

      {/* Avatar Initials */}
      <div
        className={`size-8 rounded-full border flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5 ${avatarClass}`}
      >
        {initials}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`text-xs truncate ${
                isUnread ? "font-bold text-foreground" : "font-medium text-foreground/85"
              }`}
            >
              {senderName}
            </span>
            {email.matched_alias && (
              <span className="text-[10px] px-1 py-0.2 rounded bg-muted text-muted-foreground font-mono flex-shrink-0">
                {email.matched_alias.split("@")[0]}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[11px] text-muted-foreground/70">
              {dateDisplay}
            </span>
            <button
              type="button"
              onClick={onToggleStar}
              className={`p-0.5 rounded transition-colors ${
                isStarred
                  ? "text-amber-500"
                  : "text-muted-foreground/30 group-hover:text-muted-foreground/70 hover:text-amber-500"
              }`}
            >
              <Star className="size-3.5" fill={isStarred ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        <div className="text-xs font-medium text-foreground truncate">
          {email.subject || "(No Subject)"}
        </div>

        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
          {email.snippet || "No preview text available."}
        </p>

        {email.attachments && email.attachments.length > 0 && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70 pt-0.5">
            <Paperclip className="size-3" />
            <span>{email.attachments.length} attachment{email.attachments.length > 1 ? "s" : ""}</span>
          </div>
        )}
      </div>
    </div>
  );
});
