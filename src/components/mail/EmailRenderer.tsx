"use client";

import React, { useRef, useEffect } from "react";
import sanitizeHtml from "sanitize-html";

interface EmailRendererProps {
  html: string | null;
  text: string | null;
  blockRemoteResources?: boolean;
  theme?: "light" | "dark" | "system";
}

export function hasRemoteResources(html: string | null): boolean {
  if (!html) return false;
  return /(?:src|srcset)\s*=\s*["'](?:https?:)?\/\//i.test(html) || /url\(\s*["']?(?:https?:)?\/\//i.test(html);
}

function sanitizeAndBlock(rawHtml: string, blockRemote: boolean): string {
  const sanitized = sanitizeHtml(rawHtml, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "img", "style", "table", "tbody", "thead", "tr", "td", "th", "div", "span", "hr", "br", "p", "a"
    ]),
    allowedAttributes: {
      "*": ["style", "class", "align", "valign", "bgcolor", "width", "height", "border", "cellpadding", "cellspacing"],
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
    },
    transformTags: {
      a: (tagName, attribs) => ({
        tagName: "a",
        attribs: {
          ...attribs,
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
    },
  });

  if (!blockRemote) return sanitized;

  // Replace remote image src with placeholder
  return sanitized.replace(
    /(<img\b[^>]*?\bsrc\s*=\s*)(["'])((?:https?:)?\/\/[^"']*?)\2/gi,
    '$1$2data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="24"><text y="16" fill="%23888" font-size="11">Image Blocked</text></svg>$2'
  );
}

export function EmailRenderer({
  html,
  text,
  blockRemoteResources = false,
  theme = "dark",
}: EmailRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    const isDark = theme === "dark";
    const fgColor = isDark ? "#f1f5f9" : "#1e293b";
    const mutedColor = isDark ? "#94a3b8" : "#64748b";
    const preBg = isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.05)";

    const content = html
      ? sanitizeAndBlock(html, blockRemoteResources)
      : `<pre style="font-family: inherit; white-space: pre-wrap; margin: 0; line-height: 1.6; color: ${fgColor};">${text || ""}</pre>`;

    const styledHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              font-size: 13.5px;
              line-height: 1.65;
              color: ${fgColor};
              background-color: transparent;
              margin: 0;
              padding: 16px;
              word-wrap: break-word;
            }
            a { color: #f97316; text-decoration: underline; text-underline-offset: 2px; }
            img { max-width: 100%; height: auto; border-radius: 4px; }
            blockquote {
              border-left: 3px solid #f97316;
              padding-left: 12px;
              margin: 8px 0;
              color: ${mutedColor};
            }
            pre, code {
              background: ${preBg};
              border-radius: 4px;
              padding: 2px 4px;
              font-size: 85%;
              font-family: monospace;
              color: ${fgColor};
            }
            table { border-collapse: collapse; width: 100%; }
            th, td { padding: 6px; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `;

    doc.open();
    doc.write(styledHtml);
    doc.close();

    // Auto-adjust height
    const updateHeight = () => {
      if (iframe && iframe.contentWindow?.document.body) {
        iframe.style.height = `${iframe.contentWindow.document.body.scrollHeight + 32}px`;
      }
    };

    updateHeight();
    const timeout = setTimeout(updateHeight, 300);
    return () => clearTimeout(timeout);
  }, [html, text, blockRemoteResources, theme]);

  return (
    <div className="w-full">
      <iframe
        ref={iframeRef}
        title="Email Body"
        sandbox="allow-same-origin allow-popups"
        className="w-full border-0 min-h-[300px]"
      />
    </div>
  );
}
