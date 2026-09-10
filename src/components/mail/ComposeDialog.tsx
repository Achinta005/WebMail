import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  Send,
  Paperclip,
  ChevronDown,
  ChevronUp,
  CornerDownRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useComposeStore } from "@/stores/useComposeStore";
import type { SendEmailPayload } from "@/types/email";
import type { ChangeEvent } from "react";

interface AttachmentMeta {
  id: string;
  filename: string;
  content_type: string;
  size: number;
  content_id: string | null;
}

interface ComposeDialogProps {
  primaryDomain: string;
  onSend: (payload: SendEmailPayload) => Promise<boolean>;
}

export function ComposeDialog({ primaryDomain, onSend }: ComposeDialogProps) {
  const isOpen = useComposeStore((s) => s.isOpen);
  const closeCompose = useComposeStore((s) => s.closeCompose);
  const to = useComposeStore((s) => s.to);
  const cc = useComposeStore((s) => s.cc);
  const bcc = useComposeStore((s) => s.bcc);
  const subject = useComposeStore((s) => s.subject);
  const body = useComposeStore((s) => s.body);
  const quotedHeader = useComposeStore((s) => s.quotedHeader);
  const showCc = useComposeStore((s) => s.showCc);
  const showBcc = useComposeStore((s) => s.showBcc);
  const fromAddress = useComposeStore((s) => s.fromAddress);
  const setField = useComposeStore((s) => s.setField);
  const setShowCc = useComposeStore((s) => s.setShowCc);
  const setShowBcc = useComposeStore((s) => s.setShowBcc);

  const [sending, setSending] = useState(false);
  const [showQuoted, setShowQuoted] = useState(true);
  const [customFrom, setCustomFrom] = useState("");
  const [isCustomSender, setIsCustomSender] = useState(false);
  const [configuredAliases, setConfiguredAliases] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<AttachmentMeta[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/emails?action=aliases")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Array<{ alias: string }>) => {
        if (Array.isArray(data) && data.length > 0) {
          setConfiguredAliases(data.map((d) => d.alias));
        }
      })
      .catch(() => {});
  }, [isOpen]);

  const fallbackAliases = [
    `work@${primaryDomain || "achinta.me"}`,
    `info@${primaryDomain || "achinta.me"}`,
    `achinta@${primaryDomain || "achinta.me"}`,
    `support@${primaryDomain || "achinta.me"}`,
  ];

  const aliases = Array.from(new Set([...fallbackAliases, ...configuredAliases]));

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newMetas: AttachmentMeta[] = [];
    for (let i = 0; i < files.length; i++) {
      const form = new FormData();
      form.append("file", files[i]);
      const res = await fetch("/api/attachments", { method: "POST", body: form });
      if (res.ok) {
        const meta: AttachmentMeta = await res.json();
        newMetas.push(meta);
      } else {
        toast.error("Failed to upload attachment");
      }
    }
    setAttachments((prev) => [...prev, ...newMetas]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const recipients = to
      .split(/[,;]/)
      .map((r) => r.trim())
      .filter(Boolean);

    if (recipients.length === 0) {
      toast.error("Please add at least one recipient.");
      return;
    }

    if (!subject.trim()) {
      toast.error("Subject cannot be empty.");
      return;
    }

    setSending(true);

    const finalFrom = isCustomSender
      ? `${customFrom.trim()}@${primaryDomain || "achinta.me"}`
      : fromAddress || aliases[0];

    // Build plain text and rich HTML message including quoted message if replying/forwarding
    let fullText = body;
    let fullHtml = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; font-size: 14px;">${body
      .split("\n")
      .map((line) => (line ? `<p style="margin: 0 0 8px 0;">${line}</p>` : "<br/>"))
      .join("")}</div>`;

    if (quotedHeader) {
      fullText += `\n\n--- On ${quotedHeader.date}, ${quotedHeader.from} wrote ---\n${quotedHeader.snippet}`;
      fullHtml += `
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
          <div style="font-size: 12px; color: #64748b; margin-bottom: 8px;">
            <b>On ${quotedHeader.date}, ${quotedHeader.from} wrote:</b>
          </div>
          <blockquote style="margin: 0; padding-left: 12px; border-left: 2px solid #ea580c; color: #475569; font-size: 13px; line-height: 1.5; white-space: pre-wrap;">
            ${quotedHeader.snippet}
          </blockquote>
        </div>
      `;
    }

    const payload: SendEmailPayload = {
      from: finalFrom,
      to: recipients,
      cc: showCc && cc ? cc.split(/[,;]/).map((a) => a.trim()).filter(Boolean) : undefined,
      bcc: showBcc && bcc ? bcc.split(/[,;]/).map((a) => a.trim()).filter(Boolean) : undefined,
      subject,
      text: fullText,
      html: fullHtml,
      attachments: attachments.map((a) => a.id),
    };

    const ok = await onSend(payload);
    setSending(false);

    if (ok) {
      toast.success("Email sent successfully!");
      closeCompose();
    } else {
      toast.error("Failed to send email. Check Resend configuration.");
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && closeCompose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-4xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col h-[85vh] max-h-[850px] animate-in zoom-in-95">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/40">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">New Message</span>
              <span className="text-[11px] text-muted-foreground">via Resend</span>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="size-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            {/* From Address Selector */}
            <div className="flex items-center gap-3 px-4 py-2 border-b border-border/60 text-xs">
              <span className="text-muted-foreground w-12 flex-shrink-0">From:</span>
              <div className="flex-1 flex items-center gap-2">
                {!isCustomSender ? (
                  <select
                    value={fromAddress}
                    onChange={(e) => {
                      if (e.target.value === "__custom__") {
                        setIsCustomSender(true);
                      } else {
                        setField("fromAddress", e.target.value);
                      }
                    }}
                    className="bg-muted/60 border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring font-mono"
                  >
                    {aliases.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                    <option value="__custom__">+ Custom Alias...</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      placeholder="alias"
                      value={customFrom}
                      onChange={(e) => setCustomFrom(e.target.value)}
                      className="bg-muted/60 border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none font-mono w-28"
                    />
                    <span className="text-muted-foreground font-mono">@{primaryDomain}</span>
                    <button
                      type="button"
                      onClick={() => setIsCustomSender(false)}
                      className="text-[11px] text-primary underline ml-2"
                    >
                      Use preset
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* To Recipient */}
            <div className="flex items-center gap-3 px-4 py-2 border-b border-border/60 text-xs">
              <span className="text-muted-foreground w-12 flex-shrink-0">To:</span>
              <input
                type="text"
                placeholder="recipient@example.com"
                value={to}
                onChange={(e) => setField("to", e.target.value)}
                className="flex-1 bg-transparent border-0 text-foreground placeholder:text-muted-foreground focus:outline-none text-xs"
              />
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {!showCc && (
                  <button
                    type="button"
                    onClick={() => setShowCc(true)}
                    className="hover:text-foreground transition-colors"
                  >
                    Cc
                  </button>
                )}
                {!showBcc && (
                  <button
                    type="button"
                    onClick={() => setShowBcc(true)}
                    className="hover:text-foreground transition-colors"
                  >
                    Bcc
                  </button>
                )}
              </div>
            </div>

            {/* Cc / Bcc Expandable */}
            {showCc && (
              <div className="flex items-center gap-3 px-4 py-2 border-b border-border/60 text-xs">
                <span className="text-muted-foreground w-12 flex-shrink-0">Cc:</span>
                <input
                  type="text"
                  placeholder="comma separated recipients"
                  value={cc}
                  onChange={(e) => setField("cc", e.target.value)}
                  className="flex-1 bg-transparent border-0 text-foreground placeholder:text-muted-foreground focus:outline-none text-xs"
                />
              </div>
            )}
            {showBcc && (
              <div className="flex items-center gap-3 px-4 py-2 border-b border-border/60 text-xs">
                <span className="text-muted-foreground w-12 flex-shrink-0">Bcc:</span>
                <input
                  type="text"
                  placeholder="comma separated recipients"
                  value={bcc}
                  onChange={(e) => setField("bcc", e.target.value)}
                  className="flex-1 bg-transparent border-0 text-foreground placeholder:text-muted-foreground focus:outline-none text-xs"
                />
              </div>
            )}

            {/* Subject */}
            <div className="flex items-center gap-3 px-4 py-2 border-b border-border/60 text-xs">
              <span className="text-muted-foreground w-12 flex-shrink-0">Subject:</span>
              <input
                type="text"
                placeholder="Email Subject"
                value={subject}
                onChange={(e) => setField("subject", e.target.value)}
                className="flex-1 bg-transparent border-0 text-foreground placeholder:text-muted-foreground focus:outline-none text-xs font-medium"
              />
            </div>

            {/* Body */}
            <div className="flex-1 p-5 min-h-[340px] overflow-y-auto flex flex-col gap-4">
              <textarea
                placeholder="Write your email here..."
                value={body}
                onChange={(e) => setField("body", e.target.value)}
                autoFocus
                className="w-full flex-1 min-h-[260px] bg-transparent border-0 text-foreground placeholder:text-muted-foreground focus:outline-none text-sm leading-relaxed resize-none font-sans"
              />

              {/* Quoted Message Preview for Replies / Forwards */}
              {quotedHeader && (
                <div className="rounded-lg border border-border/70 bg-muted/30 overflow-hidden text-xs">
                  <div
                    onClick={() => setShowQuoted(!showQuoted)}
                    className="px-3 py-2 bg-muted/60 flex items-center justify-between cursor-pointer select-none hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-muted-foreground font-medium">
                      <CornerDownRight className="size-3.5 text-primary" />
                      <span>
                        Quoted message from <span className="text-foreground">{quotedHeader.from}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <span>{showQuoted ? "Collapse" : "Expand"}</span>
                      {showQuoted ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                    </div>
                  </div>

                  {showQuoted && (
                    <div className="p-3 space-y-1.5 border-t border-border/50 text-[11px] text-muted-foreground bg-background/50">
                      <div className="grid grid-cols-[50px_1fr] gap-1">
                        <span className="font-semibold text-foreground/80">From:</span>
                        <span className="text-foreground">{quotedHeader.from}</span>
                        <span className="font-semibold text-foreground/80">Date:</span>
                        <span>{quotedHeader.date}</span>
                        <span className="font-semibold text-foreground/80">Subject:</span>
                        <span className="text-foreground">{quotedHeader.subject}</span>
                      </div>
                      <div className="pt-2 mt-2 border-t border-border/40 pl-2.5 border-l-2 border-primary/50 text-foreground/90 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto font-sans">
                        {quotedHeader.snippet}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Footer */}
            <div className="p-3 border-t border-border bg-muted/40 flex flex-col gap-2">
              {/* Attachment UI */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="attachment-input"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <Paperclip className="size-3.5" />
                  Attach files
                </label>
                <input
                  type="file"
                  multiple
                  id="attachment-input"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {attachments.map((a) => (
                    <span
                      key={a.id}
                      className="inline-flex items-center gap-1 bg-muted rounded px-2 py-0.5 text-xs text-foreground"
                    >
                      {a.filename}
                      <button
                        type="button"
                        onClick={() =>
                          setAttachments((prev) => prev.filter((x) => x.id !== a.id))
                        }
                        className="text-muted-foreground hover:text-foreground ml-1"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="text-[11px] text-muted-foreground">
                  Outgoing mail processed through Resend API
                </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeCompose}
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  Discard
                </button>

                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50"
                >
                  {sending ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="size-3.5" />
                      <span>Send</span>
                    </>
                  )}
                </button>
              </div>
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
