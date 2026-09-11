"use client";

import React, { useState } from "react";
import {
  Reply,
  ReplyAll,
  Forward,
  Trash2,
  Star,
  Download,
  Mail,
  RotateCcw,
  Paperclip,
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import { useUiStore } from "@/stores/useUiStore";
import { useComposeStore } from "@/stores/useComposeStore";
import { EmailRenderer, hasRemoteResources } from "./EmailRenderer";
import type { Email } from "@/types/email";

interface ReadingPaneProps {
  email: Email | null;
  activeFolder?: string;
  onDelete: (id: string) => void;
  onToggleStar: (id: string, currentStarred: boolean) => void;
  onRestore: (id: string) => void;
  onBack?: () => void;
}

export function ReadingPane({
  email,
  activeFolder = "inbox",
  onDelete,
  onToggleStar,
  onRestore,
  onBack,
}: ReadingPaneProps) {
  const blockRemote = useUiStore((s) => s.blockRemoteResources);
  const setBlockRemote = useUiStore((s) => s.setBlockRemoteResources);
  const theme = useUiStore((s) => s.theme);
  const [showFullHeaders, setShowFullHeaders] = useState<boolean>(false);
  const openReply = useComposeStore((s) => s.openReply);
  const openForward = useComposeStore((s) => s.openForward);

  if (!email) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 select-none bg-background">
        <div className="size-14 rounded-2xl bg-muted/40 border border-border flex items-center justify-center text-muted-foreground mb-3">
          <Mail className="size-7" />
        </div>
        <div className="text-sm font-medium text-foreground mb-1">No Message Selected</div>
        <p className="text-xs text-muted-foreground max-w-xs text-center leading-relaxed">
          Select an email from the list to read its message, reply, or download attachments.
        </p>
      </div>
    );
  }

  const hasRemote = hasRemoteResources(email.html_body);

  const formattedDate = (() => {
    try {
      return format(new Date(email.created_at), "EEEE, MMMM d, yyyy 'at' h:mm a");
    } catch {
      return email.created_at;
    }
  })();

  const cleanSnippet = (email.text_body || email.snippet || "").trim();

  const handleReplyClick = (replyAll = false) => {
    openReply({
      to: email.from_address,
      subject: email.subject,
      from: email.matched_alias || undefined,
      originalEmail: {
        fromName: email.from_name,
        fromAddress: email.from_address,
        date: formattedDate,
        subject: email.subject,
        snippet: cleanSnippet,
      },
      replyAll,
    });
  };

  const handleForwardClick = () => {
    openForward({
      subject: email.subject,
      from: email.matched_alias || undefined,
      originalEmail: {
        fromName: email.from_name,
        fromAddress: email.from_address,
        toAddresses: email.to_addresses,
        date: formattedDate,
        subject: email.subject,
        snippet: cleanSnippet,
      },
    });
  };

  const isTrash = activeFolder === "trash";

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Top Action Toolbar */}
      <div className="p-2 sm:p-2.5 border-b border-border/60 bg-card/40 flex items-center justify-between flex-shrink-0 gap-1 overflow-x-auto">
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors mr-0.5 sm:mr-1 border border-border/50"
              title="Back to email list"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleReplyClick(false)}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
          >
            <Reply className="size-3.5" />
            <span>Reply</span>
          </button>
          <button
            type="button"
            onClick={() => handleReplyClick(true)}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-md text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            <ReplyAll className="size-3.5" />
            <span className="hidden sm:inline">Reply All</span>
          </button>
          <button
            type="button"
            onClick={handleForwardClick}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-md text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            <Forward className="size-3.5" />
            <span className="hidden sm:inline">Forward</span>
          </button>

          {isTrash && (
            <button
              type="button"
              onClick={() => onRestore(email.id)}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-md text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors ml-1"
              title="Restore to Inbox"
            >
              <RotateCcw className="size-3.5" />
              <span className="hidden sm:inline">Restore to Inbox</span>
              <span className="sm:hidden">Restore</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={() => onToggleStar(email.id, email.is_starred)}
            className={`p-1.5 rounded-md transition-colors ${
              email.is_starred ? "text-amber-500" : "text-muted-foreground hover:text-foreground"
            }`}
            title={email.is_starred ? "Unstar message" : "Star message"}
          >
            <Star className="size-4" fill={email.is_starred ? "currentColor" : "none"} />
          </button>

          {email.raw_download_url && (
            <a
              href={email.raw_download_url}
              download={`${email.id}.eml`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Download raw email (.eml)"
            >
              <Download className="size-4" />
            </a>
          )}

          <button
            type="button"
            onClick={() => onDelete(email.id)}
            className={`p-1.5 rounded-md transition-colors ${
              isTrash
                ? "text-destructive hover:bg-destructive/20"
                : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            }`}
            title={isTrash ? "Delete permanently" : "Move to trash"}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      {/* Security / Remote resource warning banner */}
      {hasRemote && blockRemote && (
        <div className="px-3 sm:px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-xs text-amber-500 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldAlert className="size-4 flex-shrink-0" />
            <span className="truncate sm:overflow-visible sm:whitespace-normal">
              Remote images and fonts are blocked.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setBlockRemote(false)}
            className="underline font-medium hover:text-amber-400 flex-shrink-0 whitespace-nowrap"
          >
            Load Images
          </button>
        </div>
      )}

      {/* Main Email Scroll Container */}
      <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-border/40">
        {/* Email Header */}
        <div className="p-3.5 sm:p-5 space-y-2.5 sm:space-y-3">
          <h1 className="text-base sm:text-lg font-bold text-foreground tracking-tight leading-snug break-words">
            {email.subject || "(No Subject)"}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
            <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
              <div className="size-8 sm:size-9 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center font-bold text-[11px] sm:text-xs flex-shrink-0 mt-0.5">
                {(email.from_name || email.from_address).slice(0, 2).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
                  <span className="font-semibold text-xs text-foreground truncate max-w-[200px] sm:max-w-none">
                    {email.from_name || email.from_address}
                  </span>
                  <span className="text-[11px] sm:text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-none">
                    &lt;{email.from_address}&gt;
                  </span>
                </div>

                <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 flex-wrap">
                  <span>to:</span>
                  <span className="text-foreground/90 font-mono break-all">
                    {email.to_addresses.join(", ")}
                  </span>
                  {email.matched_alias && (
                    <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.2 rounded font-mono font-medium whitespace-nowrap">
                      via {email.matched_alias}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-[10px] sm:text-[11px] text-muted-foreground/80 flex items-center justify-between sm:flex-col sm:items-end sm:flex-shrink-0 border-t border-border/30 pt-1.5 sm:border-0 sm:pt-0">
              <div>{formattedDate}</div>
              <button
                type="button"
                onClick={() => setShowFullHeaders(!showFullHeaders)}
                className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground mt-0 sm:mt-0.5"
              >
                <span>{showFullHeaders ? "Hide headers" : "Details"}</span>
                {showFullHeaders ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
              </button>
            </div>
          </div>

          {/* Collapsible Full Headers */}
          {showFullHeaders && email.headers && (
            <div className="mt-3 p-3 bg-muted/40 rounded-lg text-[10px] font-mono space-y-1 text-muted-foreground overflow-x-auto max-h-40">
              {Object.entries(email.headers).map(([key, val]) => (
                <div key={key}>
                  <span className="text-foreground font-semibold">{key}: </span>
                  <span>{val}</span>
                </div>
              ))}
            </div>
          )}

          {/* Attachments pills */}
          {email.attachments && email.attachments.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-2">
              {email.attachments.map((att) => {
                const downloadHref =
                  att.download_url || (att.id ? `/api/attachments?id=${att.id}` : "#");

                return (
                  <a
                    key={att.id || att.filename}
                    href={downloadHref}
                    download={att.filename}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/50 hover:bg-muted text-xs font-medium text-foreground transition-colors cursor-pointer"
                  >
                    <Paperclip className="size-3.5 text-primary" />
                    <span>{att.filename}</span>
                    {att.size && (
                      <span className="text-[10px] text-muted-foreground">
                        ({Math.round(att.size / 1024)} KB)
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Email Rendered Body */}
        <div className="p-3 sm:p-5">
          <EmailRenderer
            html={email.html_body}
            text={email.text_body}
            blockRemoteResources={blockRemote}
            theme={theme}
          />
        </div>
      </div>
    </div>
  );
}
