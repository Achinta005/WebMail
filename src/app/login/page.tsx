"use client";

import React, { Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ShieldCheck, AlertCircle, Mail } from "lucide-react";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const handleGoogleLogin = () => {
    const backendUrl =
      process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";
    const targetUrl = `${backendUrl.replace(/\/$/, "")}/api/webmail/auth/google`;
    window.location.href = targetUrl;
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card border border-border/70 rounded-2xl shadow-2xl p-8 flex flex-col items-center text-center space-y-6 animate-in fade-in-50 zoom-in-95 duration-200">
        {/* Brand Logo */}
        <div className="size-16 rounded-2xl overflow-hidden p-1.5 shadow-md border border-border/50 bg-card flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="Achinta WebMail Logo"
            width={56}
            height={56}
            priority
            className="size-full object-contain"
          />
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Achinta WebMail
          </h1>
          <p className="text-xs text-muted-foreground">
            Secure administrative mailbox access for <span className="font-mono text-primary font-medium">@achinta.me</span>
          </p>
        </div>

        {/* Error Alert if unauthorized email or failed OAuth */}
        {error && (
          <div className="w-full p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3 text-left">
            <AlertCircle className="size-4 text-destructive flex-shrink-0 mt-0.5" />
            <div className="text-xs text-destructive leading-relaxed">
              {error}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="w-full p-3 bg-muted/40 border border-border/40 rounded-xl flex items-center gap-2.5 text-xs text-muted-foreground text-left">
          <ShieldCheck className="size-4 text-primary flex-shrink-0" />
          <span>
            Access is strictly restricted to authorized administrator Google accounts.
          </span>
        </div>

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted/80 text-foreground text-sm font-semibold transition-all shadow-xs hover:shadow active:scale-[0.99]"
        >
          <svg className="size-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24Z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27A7.17 7.17 0 0 1 4.9 12c0-.79.14-1.57.38-2.27V6.58H1.25A11.96 11.96 0 0 0 0 12c0 1.92.45 3.74 1.25 5.42l4.03-3.15Z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
            />
          </svg>
          <span>Sign in with Google</span>
        </button>

        <div className="pt-2 text-[11px] text-muted-foreground/60 flex items-center gap-1.5">
          <Mail className="size-3" />
          <span>Ficxus Mail Engine & Resend Cloud</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-background text-xs text-muted-foreground">
          Loading...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
