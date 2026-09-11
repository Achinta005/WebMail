import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms and Conditions - Achinta WebMail",
  description: "Terms and Conditions for Achinta Services and WebMail",
};

export default function TermsConditionsPage() {
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Terms and Conditions</h1>
          <p className="text-xs text-muted-foreground mt-1 border-b border-border pb-4">
            Last updated: September 11, 2026
          </p>
        </div>

        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            Welcome to the <strong className="text-foreground">Achinta Services &amp; WebMail Platform</strong> (&quot;the Service&quot;). By accessing or using this service, you agree to comply with and be bound by the following Terms and Conditions.
          </p>

          <h2 className="text-lg font-semibold text-foreground pt-3">1. Authorized Use &amp; Access Control</h2>
          <p>
            This service provides administrative email management, personal infrastructure APIs, and developer tools. Access to authenticated sections (including WebMail) is strictly restricted to authorized user accounts explicitly permitted by the administrator.
          </p>

          <h2 className="text-lg font-semibold text-foreground pt-3">2. Prohibited Activities</h2>
          <p>Users and visitors agree NOT to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Use the service to transmit spam, bulk unsolicited communications, or abusive material.</li>
            <li>Attempt unauthorized access to private mailboxes, APIs, or server processes.</li>
            <li>Perform denial-of-service (DoS) attacks, vulnerability scanning, or abuse server bandwidth and computing resources.</li>
            <li>Transmit malicious code, viruses, or illegal content through any service endpoint.</li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground pt-3">3. Disclaimer of Warranties</h2>
          <p>
            The Service is provided on an <strong className="text-foreground">&quot;AS IS&quot;</strong> and <strong className="text-foreground">&quot;AS AVAILABLE&quot;</strong> basis without warranties of any kind, either express or implied. While we strive for high uptime and data integrity, we do not guarantee uninterrupted or error-free operation.
          </p>

          <h2 className="text-lg font-semibold text-foreground pt-3">4. Limitation of Liability</h2>
          <p>
            Under no circumstances shall the operator or administrator be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use this service, email delivery delays, or server maintenance.
          </p>

          <h2 className="text-lg font-semibold text-foreground pt-3">5. Modifications</h2>
          <p>
            We reserve the right to modify these Terms and Conditions at any time. Continued use of the service signifies acceptance of any updated terms.
          </p>

          <h2 className="text-lg font-semibold text-foreground pt-3">6. Contact</h2>
          <p>
            If you have any questions about these Terms, please contact the administrator at{" "}
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
            href="/privacy-policy"
            className="text-primary hover:underline underline-offset-4"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
