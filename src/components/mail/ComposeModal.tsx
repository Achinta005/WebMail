'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Paperclip,
  ChevronDown,
  Minimize2,
  Maximize2,
  AlertCircle,
  Bold,
  Italic,
  List,
  Link as LinkIcon,
} from 'lucide-react';
import type { SendEmailPayload } from '@/types/email';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (payload: SendEmailPayload) => Promise<boolean>;
  initialData?: {
    to?: string[];
    subject?: string;
    body?: string;
    from?: string;
  };
  primaryDomain?: string;
}

export const ComposeModal: React.FC<ComposeModalProps> = ({
  isOpen,
  onClose,
  onSend,
  initialData,
  primaryDomain = 'achinta.me',
}) => {
  const [configuredAliases, setConfiguredAliases] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/emails?action=aliases')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Array<{ alias: string }>) => {
        if (Array.isArray(data) && data.length > 0) {
          setConfiguredAliases(data.map((d) => d.alias));
        }
      })
      .catch(() => {});
  }, [isOpen]);

  const defaultAliases = Array.from(
    new Set([
      `work@${primaryDomain}`,
      `info@${primaryDomain}`,
      `achinta@${primaryDomain}`,
      `hello@${primaryDomain}`,
      ...configuredAliases,
    ])
  );

  const [fromAddress, setFromAddress] = useState(defaultAliases[0]);
  const [customFrom, setCustomFrom] = useState('');
  const [isCustomSender, setIsCustomSender] = useState(false);

  const [toInput, setToInput] = useState('');
  const [ccInput, setCcInput] = useState('');
  const [bccInput, setBccInput] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      if (initialData.to) setToInput(initialData.to.join(', '));
      if (initialData.subject) setSubject(initialData.subject);
      if (initialData.body) setBody(initialData.body);
      if (initialData.from) {
        if (defaultAliases.includes(initialData.from)) {
          setFromAddress(initialData.from);
          setIsCustomSender(false);
        } else {
          setIsCustomSender(true);
          setCustomFrom(initialData.from.split('@')[0]);
        }
      }
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const toAddresses = toInput
      .split(/[,;]/)
      .map((addr) => addr.trim())
      .filter(Boolean);

    if (toAddresses.length === 0) {
      setErrorMsg('Please enter at least one recipient in "To".');
      return;
    }

    if (!subject.trim()) {
      setErrorMsg('Please enter an email subject.');
      return;
    }

    const finalFrom = isCustomSender
      ? `${customFrom.trim()}@${primaryDomain}`
      : fromAddress;

    setSending(true);

    const payload: SendEmailPayload = {
      from: finalFrom,
      to: toAddresses,
      cc: showCc && ccInput ? ccInput.split(/[,;]/).map((a) => a.trim()).filter(Boolean) : undefined,
      bcc: showBcc && bccInput ? bccInput.split(/[,;]/).map((a) => a.trim()).filter(Boolean) : undefined,
      subject,
      text: body,
      html: `<div style="font-family: sans-serif; line-height: 1.6; color: #111;">${body
        .split('\n')
        .map((line) => line ? `<p>${line}</p>` : '<br/>')
        .join('')}</div>`,
    };

    const ok = await onSend(payload);
    setSending(false);

    if (ok) {
      onClose();
      // Reset state
      setToInput('');
      setCcInput('');
      setBccInput('');
      setSubject('');
      setBody('');
      setErrorMsg(null);
    } else {
      setErrorMsg('Failed to send email. Check your Resend API configuration in Settings.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <h3 className="font-semibold text-sm text-white">New Message</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSend} className="flex-1 flex flex-col overflow-y-auto">
          {errorMsg && (
            <div className="m-4 mb-0 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="p-4 space-y-3">
            {/* "From" Address Selector */}
            <div className="flex items-center gap-3 text-xs border-b border-slate-800/80 pb-2.5">
              <span className="text-slate-400 w-12 font-medium">From:</span>
              <div className="flex-1 flex items-center gap-2">
                {!isCustomSender ? (
                  <select
                    value={fromAddress}
                    onChange={(e) => {
                      if (e.target.value === 'custom') {
                        setIsCustomSender(true);
                      } else {
                        setFromAddress(e.target.value);
                      }
                    }}
                    className="bg-slate-800/80 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {defaultAliases.map((alias) => (
                      <option key={alias} value={alias}>
                        {alias}
                      </option>
                    ))}
                    <option value="custom">+ Custom Alias (@{primaryDomain})</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-1.5 flex-1">
                    <input
                      type="text"
                      placeholder="e.g. support or billing"
                      value={customFrom}
                      onChange={(e) => setCustomFrom(e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500 w-36"
                    />
                    <span className="text-slate-400 text-xs">@{primaryDomain}</span>
                    <button
                      type="button"
                      onClick={() => setIsCustomSender(false)}
                      className="text-indigo-400 hover:underline text-[11px] ml-2"
                    >
                      Use standard alias
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* "To" Recipient */}
            <div className="flex items-center gap-3 text-xs border-b border-slate-800/80 pb-2.5">
              <span className="text-slate-400 w-12 font-medium">To:</span>
              <input
                type="text"
                placeholder="recipient@example.com (separate multiple with commas)"
                value={toInput}
                onChange={(e) => setToInput(e.target.value)}
                className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                required
              />
              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                {!showCc && (
                  <button
                    type="button"
                    onClick={() => setShowCc(true)}
                    className="hover:text-white"
                  >
                    Cc
                  </button>
                )}
                {!showBcc && (
                  <button
                    type="button"
                    onClick={() => setShowBcc(true)}
                    className="hover:text-white"
                  >
                    Bcc
                  </button>
                )}
              </div>
            </div>

            {/* Optional CC */}
            {showCc && (
              <div className="flex items-center gap-3 text-xs border-b border-slate-800/80 pb-2.5">
                <span className="text-slate-400 w-12 font-medium">Cc:</span>
                <input
                  type="text"
                  placeholder="cc@example.com"
                  value={ccInput}
                  onChange={(e) => setCcInput(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            )}

            {/* Optional BCC */}
            {showBcc && (
              <div className="flex items-center gap-3 text-xs border-b border-slate-800/80 pb-2.5">
                <span className="text-slate-400 w-12 font-medium">Bcc:</span>
                <input
                  type="text"
                  placeholder="bcc@example.com"
                  value={bccInput}
                  onChange={(e) => setBccInput(e.target.value)}
                  className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            )}

            {/* Subject */}
            <div className="flex items-center gap-3 text-xs border-b border-slate-800/80 pb-2.5">
              <span className="text-slate-400 w-12 font-medium">Subject:</span>
              <input
                type="text"
                placeholder="Email Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 font-medium focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Email Body TextArea */}
          <div className="flex-1 p-4 pt-0">
            <textarea
              placeholder="Write your email here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full h-64 bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/70 resize-none font-sans leading-relaxed"
              required
            />
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-900/90 flex items-center justify-between">
            <div className="text-[11px] text-slate-400">
              Sending via Resend on <strong className="text-slate-300">{primaryDomain}</strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={sending}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Discard
              </button>

              <button
                type="submit"
                disabled={sending}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-4 py-2 rounded-xl shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {sending ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
