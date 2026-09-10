export interface EmailAttachment {
  id: string;
  filename: string;
  content_type: string;
  size?: number;
  download_url?: string;
}

export interface Email {
  id: string;
  resend_id: string | null;
  direction: 'inbound' | 'outbound';
  from_address: string;
  from_name: string;
  to_addresses: string[]; // parsed array
  cc_addresses?: string[];
  bcc_addresses?: string[];
  reply_to?: string | null;
  subject: string;
  snippet: string;
  html_body: string | null;
  text_body: string | null;
  folder: 'inbox' | 'sent' | 'drafts' | 'trash' | 'archive' | 'all';
  is_read: boolean;
  is_starred: boolean;
  created_at: string;
  raw_download_url?: string | null;
  attachments?: EmailAttachment[];
  headers?: Record<string, string>;
  matched_alias?: string | null; // e.g., "work@achinta.me"
}

export interface EmailDbRow {
  id: string;
  resend_id: string | null;
  direction: 'inbound' | 'outbound';
  from_address: string;
  from_name: string;
  to_addresses: string; // JSON string
  cc_addresses: string | null; // JSON string
  bcc_addresses: string | null; // JSON string
  reply_to: string | null;
  subject: string;
  snippet: string;
  html_body: string | null;
  text_body: string | null;
  folder: string;
  is_read: number;
  is_starred: number;
  created_at: string;
  raw_download_url: string | null;
  attachments: string | null; // JSON string
  headers: string | null; // JSON string
  matched_alias: string | null;
}

export interface SendEmailPayload {
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html?: string;
  text?: string;
  reply_to?: string;
  attachments?: string[];
}

export interface MailboxStats {
  inboxCount: number;
  unreadCount: number;
  sentCount: number;
  starredCount: number;
  trashCount: number;
  allCount?: number;
  aliases: { alias: string; count: number; unreadCount: number }[];
}
