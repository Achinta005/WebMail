import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy - Achinta WebMail",
  description: "Privacy Policy for Achinta Services and WebMail",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-card border border-border/70 rounded-2xl shadow-xl p-8 sm:p-10 space-y-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to Login
        </Link>

        <div>
          <span className="inline-block px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-primary bg-primary/10 border border-primary/20 rounded-full mb-2">
            Legal
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-muted-foreground mt-1 border-b border-border pb-4">
            Last updated: September 11, 2026
          </p>
        </div>

        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            This Privacy Policy explains how our personal server infrastructure and services, including{" "}
            <strong className="text-foreground">WebMail</strong> and the{" "}
            <strong className="text-foreground">Ficxus Platform</strong>, collect, use, and protect your information when you access or use our applications.
          </p>

          <h2 className="text-lg font-semibold text-foreground pt-3">1. Information We Collect</h2>
          <p>We practice minimal data collection and respect complete data sovereignty:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong className="text-foreground">Authentication Information:</strong> When signing in with Google OAuth, we receive your email address, display name, and unique OAuth identifier strictly to authenticate and verify access permissions.
            </li>
            <li>
              <strong className="text-foreground">Email Content & Metadata:</strong> When using WebMail, messages, recipient/sender addresses, subject lines, attachments, and timestamps are processed to enable message delivery, parsing, and synchronization.
            </li>
            <li>
              <strong className="text-foreground">Technical Logs:</strong> Server access logs may record IP addresses, user agent strings, and request timestamps strictly for monitoring, error diagnosis, and security prevention.
            </li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground pt-3">2. How We Use Information</h2>
          <p>Your data is used solely for the following purposes:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Authenticating your identity and verifying administrative access authorization.</li>
            <li>Sending, receiving, and displaying emails via authorized mail services (such as Resend and IMAP/SMTP).</li>
            <li>Maintaining system performance, security, and preventing abuse.</li>
          </ul>
          <p>
            We <strong className="text-foreground">never</strong> sell, rent, monetize, or share your personal information or email data with any third-party advertisers or data brokers.
          </p>

          <h2 className="text-lg font-semibold text-foreground pt-3">3. Third-Party Services</h2>
          <p>The Service connects with trusted infrastructure providers:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong className="text-foreground">Google Identity Services:</strong> Used strictly for secure administrative authentication via OAuth 2.0.
            </li>
            <li>
              <strong className="text-foreground">Resend / Email Gateways:</strong> Used for transactional email delivery and inbound webhook processing.
            </li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground pt-3">4. Data Security and Retention</h2>
          <p>
            We implement standard security safeguards including TLS/SSL encryption for data in transit, token-based session management, and restricted firewall policies. Email data and logs are retained only as long as necessary to operate the service or fulfill administrative needs.
          </p>

          <h2 className="text-lg font-semibold text-foreground pt-3">5. Your Rights</h2>
          <p>
            You have the right to request access to, correction of, or deletion of your personal data stored within our system. Account deletion requests can be initiated directly with the service administrator.
          </p>

          <h2 className="text-lg font-semibold text-foreground pt-3">6. Contact</h2>
          <p>
            For questions regarding this Privacy Policy, please contact the administrator at{" "}
            <a
              href="mailto:achintahazra8515@gmail.com"
              className="text-primary hover:underline underline-offset-4"
            >
              achintahazra8515@gmail.com
            </a>
            .
          </p>
        </div>

        <div className="pt-6 border-t border-border flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-3">
          <span>&copy; 2026 Achinta. All rights reserved.</span>
          <Link
            href="/terms-conditions"
            className="text-primary hover:underline underline-offset-4"
          >
            Terms &amp; Conditions
          </Link>
        </div>
      </div>
    </div>
  );
}
