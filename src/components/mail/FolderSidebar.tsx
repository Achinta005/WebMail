'use client';

import React from 'react';
import {
  Inbox,
  Send,
  Star,
  Trash2,
  Plus,
  Settings,
  RefreshCw,
  AtSign,
  Layers,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import type { MailboxStats } from '@/types/email';

interface FolderSidebarProps {
  currentFolder: string;
  selectedAlias: string;
  stats: MailboxStats | null;
  onSelectFolder: (folder: string) => void;
  onSelectAlias: (alias: string) => void;
  onOpenCompose: () => void;
  onOpenSettings: () => void;
  onSync: () => void;
  isSyncing: boolean;
  resendConnected: boolean;
  sseConnected?: boolean;
}

export const FolderSidebar: React.FC<FolderSidebarProps> = ({
  currentFolder,
  selectedAlias,
  stats,
  onSelectFolder,
  onSelectAlias,
  onOpenCompose,
  onOpenSettings,
  onSync,
  isSyncing,
  resendConnected,
  sseConnected = false,
}) => {
  const folders = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, count: stats?.inboxCount, unread: stats?.unreadCount },
    { id: 'sent', label: 'Sent', icon: Send, count: stats?.sentCount },
    { id: 'starred', label: 'Starred', icon: Star, count: stats?.starredCount },
    { id: 'trash', label: 'Trash', icon: Trash2, count: stats?.trashCount },
  ];

  // Combine known aliases (work@, info@) with any discovered ones from stats
  const knownAliases = ['work@achinta.me', 'info@achinta.me'];
  const discoveredAliases = stats?.aliases.map((a) => a.alias) || [];
  const allAliases = Array.from(new Set([...knownAliases, ...discoveredAliases]));

  return (
    <aside className="w-64 bg-slate-900/80 border-r border-slate-800/80 flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/20">
            A
          </div>
          <div>
            <div className="font-semibold text-sm tracking-tight text-white flex items-center gap-1.5">
              achinta.me
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-medium px-1.5 py-0.5 rounded border border-indigo-500/30">
                Mail
              </span>
              {sseConnected && (
                <span
                  title="Real-time SSE Connected"
                  className="flex items-center gap-1 text-[9px] bg-emerald-500/15 text-emerald-400 font-medium px-1.5 py-0.5 rounded-full border border-emerald-500/30 animate-pulse"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Live
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  resendConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-amber-400'
                }`}
              />
              {resendConnected ? 'Resend Connected' : 'Resend Setup Needed'}
            </div>
          </div>
        </div>

        <button
          onClick={onSync}
          disabled={isSyncing}
          title="Sync Emails with Resend"
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
        </button>
      </div>

      {/* Compose Button */}
      <div className="p-3">
        <button
          onClick={onOpenCompose}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2.5 px-4 rounded-xl shadow-md shadow-indigo-600/25 transition-all active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>New Message</span>
        </button>
      </div>

      {/* Scrollable Navigation */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-4">
        {/* Core Folders */}
        <div className="space-y-0.5">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1">
            Mailboxes
          </div>
          {folders.map((folder) => {
            const Icon = folder.icon;
            const isActive = currentFolder === folder.id && selectedAlias === 'all';
            return (
              <button
                key={folder.id}
                onClick={() => {
                  onSelectFolder(folder.id);
                  onSelectAlias('all');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white font-medium shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{folder.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {folder.unread && folder.unread > 0 ? (
                    <span className="text-xs bg-indigo-500 text-white px-1.5 py-0.2 rounded-full font-semibold">
                      {folder.unread}
                    </span>
                  ) : null}
                  {folder.count !== undefined && folder.count > 0 && !folder.unread ? (
                    <span className="text-xs text-slate-500">{folder.count}</span>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        {/* Inboxes & Aliases Filter */}
        <div className="space-y-0.5">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1 flex items-center justify-between">
            <span>Domain Aliases</span>
            <span className="text-[10px] text-slate-400 font-normal">Catch-All</span>
          </div>

          <button
            onClick={() => onSelectAlias('all')}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
              selectedAlias === 'all'
                ? 'bg-slate-800 text-indigo-300 font-medium'
                : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" />
              <span>All Inboxes (*@achinta.me)</span>
            </div>
            {stats?.inboxCount ? (
              <span className="text-[11px] text-slate-500">{stats.inboxCount}</span>
            ) : null}
          </button>

          {allAliases.map((alias) => {
            const isAliasActive = selectedAlias.toLowerCase() === alias.toLowerCase();
            const aliasStat = stats?.aliases.find(
              (a) => a.alias.toLowerCase() === alias.toLowerCase()
            );

            return (
              <button
                key={alias}
                onClick={() => {
                  onSelectFolder('inbox');
                  onSelectAlias(alias);
                }}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-colors ${
                  isAliasActive
                    ? 'bg-slate-800 text-indigo-300 font-medium'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <AtSign className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                  <span className="truncate">{alias}</span>
                </div>
                {aliasStat && aliasStat.count > 0 ? (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      aliasStat.unreadCount > 0
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'text-slate-500'
                    }`}
                  >
                    {aliasStat.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer / Settings */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/30">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings & Resend</span>
          </div>
          {resendConnected ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400" />
          )}
        </button>
      </div>
    </aside>
  );
};
