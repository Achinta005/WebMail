import { create } from "zustand";

export interface ComposeAttachment {
  id: string;
  filename: string;
  contentType: string;
  size: number;
}

export interface ComposeState {
  isOpen: boolean;
  mode: "new" | "reply" | "forward";
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
  quotedHeader?: {
    from: string;
    date: string;
    subject: string;
    snippet: string;
  } | null;
  showCc: boolean;
  showBcc: boolean;
  fromAddress: string;
  attachments: ComposeAttachment[];

  openCompose: (from?: string) => void;
  openReply: (params: {
    to: string;
    subject: string;
    from?: string;
    originalEmail: {
      fromName?: string;
      fromAddress: string;
      date: string;
      subject: string;
      snippet: string;
    };
    replyAll?: boolean;
  }) => void;
  openForward: (params: {
    subject: string;
    from?: string;
    originalEmail: {
      fromName?: string;
      fromAddress: string;
      toAddresses: string[];
      date: string;
      subject: string;
      snippet: string;
    };
  }) => void;
  closeCompose: () => void;
  setField: (field: "to" | "cc" | "bcc" | "subject" | "body" | "fromAddress", value: string) => void;
  setShowCc: (show: boolean) => void;
  setShowBcc: (show: boolean) => void;
  addAttachments: (atts: ComposeAttachment[]) => void;
  removeAttachment: (id: string) => void;
  reset: () => void;
}

export const useComposeStore = create<ComposeState>((set) => ({
  isOpen: false,
  mode: "new",
  to: "",
  cc: "",
  bcc: "",
  subject: "",
  body: "",
  quotedHeader: null,
  showCc: false,
  showBcc: false,
  fromAddress: "work@achinta.me",
  attachments: [],

  openCompose: (from) =>
    set((state) => ({
      isOpen: true,
      mode: "new",
      to: "",
      cc: "",
      bcc: "",
      subject: "",
      body: "",
      quotedHeader: null,
      showCc: false,
      showBcc: false,
      fromAddress: from || state.fromAddress,
      attachments: [],
    })),

  openReply: ({ to, subject, originalEmail, from }) =>
    set((state) => ({
      isOpen: true,
      mode: "reply",
      to,
      cc: "",
      bcc: "",
      subject: subject.startsWith("Re:") ? subject : `Re: ${subject}`,
      body: "",
      quotedHeader: {
        from: `${originalEmail.fromName || originalEmail.fromAddress} <${originalEmail.fromAddress}>`,
        date: originalEmail.date,
        subject: originalEmail.subject,
        snippet: originalEmail.snippet,
      },
      showCc: false,
      showBcc: false,
      fromAddress: from || state.fromAddress,
      attachments: [],
    })),

  openForward: ({ subject, originalEmail, from }) =>
    set((state) => ({
      isOpen: true,
      mode: "forward",
      to: "",
      cc: "",
      bcc: "",
      subject: subject.startsWith("Fwd:") ? subject : `Fwd: ${subject}`,
      body: "",
      quotedHeader: {
        from: `${originalEmail.fromName || originalEmail.fromAddress} <${originalEmail.fromAddress}>`,
        date: originalEmail.date,
        subject: originalEmail.subject,
        snippet: originalEmail.snippet,
      },
      showCc: false,
      showBcc: false,
      fromAddress: from || state.fromAddress,
      attachments: [],
    })),

  closeCompose: () => set({ isOpen: false }),

  setField: (field, value) => set({ [field]: value }),

  setShowCc: (showCc) => set({ showCc }),
  setShowBcc: (showBcc) => set({ showBcc }),

  addAttachments: (atts) =>
    set((state) => ({ attachments: [...state.attachments, ...atts] })),

  removeAttachment: (id) =>
    set((state) => ({
      attachments: state.attachments.filter((a) => a.id !== id),
    })),

  reset: () =>
    set({
      isOpen: false,
      mode: "new",
      to: "",
      cc: "",
      bcc: "",
      subject: "",
      body: "",
      showCc: false,
      showBcc: false,
      attachments: [],
    }),
}));
