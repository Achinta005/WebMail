"use client";

import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  ShieldCheck,
  Radio,
  ExternalLink,
} from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  statusData: {
    configured: boolean;
    domainVerified: boolean;
    domainName: string;
    maskedKey: string | null;
    defaultFrom: string;
    webhookUrl: string;
    error?: string;
  } | null;
  onSync: () => void;
  isSyncing: boolean;
}

export function SettingsModal({
  isOpen,
  onClose,
  statusData,
  onSync,
  isSyncing,
}: SettingsModalProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs animate-in fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
          {/* Header */}
          <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/40">
            <div className="flex items-center gap-2">
              <Server className="size-4 text-primary" />
              <span className="font-semibold text-sm text-foreground">Backend & Mail Settings</span>
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

          {/* Content */}
          <div className="p-5 space-y-5 text-xs">
            {/* Backend connection */}
            <div className="p-3.5 rounded-lg border border-border/80 bg-muted/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Ficxus NestJS Server</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Persistent storage connected on PostgreSQL (DB: <span className="font-mono text-foreground">ficxus</span>). Secrets loaded directly via Doppler.
              </p>
            </div>

            {/* Resend Provider status */}
            <div className="p-3.5 rounded-lg border border-border/80 bg-muted/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Resend Email Provider</span>
                {statusData?.configured ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500">
                    <CheckCircle2 className="size-3" />
                    Configured
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-500">
                    <AlertTriangle className="size-3" />
                    Unconfigured
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div>
                  <span className="text-muted-foreground">Primary Domain:</span>
                  <div className="font-mono text-foreground font-medium mt-0.5">
                    {statusData?.domainName || "achinta.me"}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">API Key:</span>
                  <div className="font-mono text-foreground font-medium mt-0.5">
                    {statusData?.maskedKey || "Configured in Doppler"}
                  </div>
                </div>
              </div>
            </div>

            {/* Webhook URL */}
            <div className="space-y-1.5">
              <span className="font-medium text-foreground">Resend Inbound Webhook:</span>
              <div className="p-2.5 bg-muted rounded-md border border-border font-mono text-[11px] text-muted-foreground break-all select-all">
                {statusData?.webhookUrl || "http://localhost:3001/api/webmail/webhook"}
              </div>
              <p className="text-[10px] text-muted-foreground">
                Resend triggers this webhook instantly upon receiving an inbound email, and Ficxus streams it via SSE to this webmail client.
              </p>
            </div>

            {/* Resend Manual Sync */}
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                Fetch historical inbound emails from Resend Receiving API
              </span>
              <button
                type="button"
                onClick={onSync}
                disabled={isSyncing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium text-xs transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`size-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                <span>{isSyncing ? "Syncing..." : "Sync Emails"}</span>
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
