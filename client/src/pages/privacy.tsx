import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function Privacy() {
  useDocumentTitle("Privacy Policy | STB Cybersecurity", "Privacy policy for STB Cybersecurity. Learn how we collect, use, and protect your data across our threat intelligence platform and security services.");

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-display font-bold text-white">Privacy Policy</h1>
        </div>

        <Card className="border-white/5 bg-card/50">
          <CardContent className="prose prose-invert max-w-none p-8">
            <p className="text-muted-foreground text-sm mb-6">Effective Date: February 17, 2026 | Last Updated: February 17, 2026</p>

            <p className="text-muted-foreground mb-6">
              STB Cybersecurity, LLC ("STBCS," "we," "our," or "us") is committed to protecting the privacy of our users. This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you visit our website stbcybersecurity.com ("Site") and use our services. This policy complies with applicable United States federal and state privacy laws, including the California Consumer Privacy Act (CCPA/CPRA), CAN-SPAM Act, and the Children's Online Privacy Protection Act (COPPA).
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">1. Information We Collect</h2>
            
            <h3 className="text-lg font-semibold text-white mt-4 mb-2">1.1 Information You Provide</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li><strong className="text-white">Account Information:</strong> Username, email address, and hashed password when you create an account</li>
              <li><strong className="text-white">Phone Number:</strong> If you opt in to SMS alerts or two-way messaging (Business tier), we collect your mobile phone number</li>
              <li><strong className="text-white">Payment Information:</strong> Processed securely through Stripe, Inc. We never store credit card numbers, CVVs, or full card details on our servers</li>
              <li><strong className="text-white">Communications:</strong> Information you provide when contacting us via email, phone, SMS, or support channels</li>
              <li><strong className="text-white">Newsletter Subscriptions:</strong> Email address and content preferences</li>
              <li><strong className="text-white">Watchlist Data:</strong> Threat indicators (IPs, domains, CVEs) you choose to monitor</li>
              <li><strong className="text-white">SMS Consent Records:</strong> Records of your opt-in and opt-out choices for SMS messaging</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mt-4 mb-2">1.2 Information Collected Automatically</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li><strong className="text-white">Log Data:</strong> IP address (hashed for privacy), browser type, pages visited, and timestamps</li>
              <li><strong className="text-white">Device Information:</strong> Browser user agent string used for visitor analytics</li>
              <li><strong className="text-white">Cookies:</strong> Essential session cookies for authentication (httpOnly, secure) and a visitor tracking cookie. We do not use advertising or third-party tracking cookies</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mt-4 mb-2">1.3 Information We Do NOT Collect</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Social Security numbers or government-issued identification</li>
              <li>Biometric data</li>
              <li>Precise geolocation data</li>
              <li>Financial account details (handled entirely by Stripe)</li>
            </ul>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">2. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-2">We use collected information for the following purposes:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>To provide, operate, and maintain our cybersecurity services</li>
              <li>To process transactions and manage your subscription</li>
              <li>To send security alerts, threat notifications, and watchlist matches</li>
              <li>To send newsletters and security digests (only with your consent)</li>
              <li>To respond to your inquiries and provide customer support</li>
              <li>To detect, prevent, and address security incidents and abuse</li>
              <li>To comply with legal obligations and enforce our Terms of Service</li>
              <li>To analyze usage patterns and improve our platform (aggregated, non-identifying data only)</li>
            </ul>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">3. Legal Basis for Processing</h2>
            <p className="text-muted-foreground mb-4">We process your information based on:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li><strong className="text-white">Contract Performance:</strong> To fulfill our service obligations to you</li>
              <li><strong className="text-white">Consent:</strong> For newsletter subscriptions and optional notifications</li>
              <li><strong className="text-white">Legitimate Interest:</strong> For security, fraud prevention, and service improvement</li>
              <li><strong className="text-white">Legal Compliance:</strong> To meet regulatory requirements</li>
            </ul>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">4. Data Security</h2>
            <p className="text-muted-foreground mb-4">
              We implement industry-standard security measures to protect your personal information, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li><strong className="text-white">Encryption in Transit:</strong> All data transmitted via TLS/HTTPS with HSTS enforcement</li>
              <li><strong className="text-white">Password Security:</strong> Passwords are salted and hashed using bcrypt (12 rounds) and never stored in plaintext</li>
              <li><strong className="text-white">Session Security:</strong> Cryptographically random 256-bit session tokens, httpOnly and secure cookies</li>
              <li><strong className="text-white">Access Controls:</strong> Role-based access, rate limiting, and input validation on all endpoints</li>
              <li><strong className="text-white">Security Headers:</strong> Content Security Policy, HSTS, X-Frame-Options, and other protective headers</li>
              <li><strong className="text-white">Payment Security:</strong> All payment processing is handled by Stripe (PCI DSS Level 1 certified). No card data touches our servers</li>
              <li><strong className="text-white">Monitoring:</strong> Automated error reporting and critical incident alerting</li>
            </ul>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">5. Data Sharing and Disclosure</h2>
            <p className="text-muted-foreground mb-4">We do not sell, rent, or trade your personal information. We may share data only in the following circumstances:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li><strong className="text-white">Service Providers:</strong> Stripe (payment processing), Resend (email delivery), and OpenPhone (SMS/phone services) — each bound by their own privacy policies and data protection agreements</li>
              <li><strong className="text-white">Legal Requirements:</strong> When required by law, court order, subpoena, or to comply with legal process</li>
              <li><strong className="text-white">Safety:</strong> To protect the rights, property, or safety of STBCS, our users, or the public</li>
              <li><strong className="text-white">Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets, with prior notice to affected users</li>
            </ul>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">6. Data Retention</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li><strong className="text-white">Account Data:</strong> Retained for as long as your account is active, plus 30 days after deletion request</li>
              <li><strong className="text-white">Session Data:</strong> Automatically expired and cleaned up after 30 days of inactivity</li>
              <li><strong className="text-white">Threat Intelligence Data:</strong> Public threat data retained for up to 2 years for historical analysis; CVEs and ransomware data retained indefinitely for security research</li>
              <li><strong className="text-white">Payment Records:</strong> Retained as required by tax and financial regulations (typically 7 years)</li>
              <li><strong className="text-white">Server Logs:</strong> Rotated and purged regularly; visitor analytics data retained for up to 2 years</li>
            </ul>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">7. Your Rights Under United States Law</h2>

            <h3 className="text-lg font-semibold text-white mt-4 mb-2">7.1 All Users</h3>
            <p className="text-muted-foreground mb-2">All users have the right to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Access and receive a copy of your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data (subject to legal retention requirements)</li>
              <li>Opt out of marketing communications at any time</li>
              <li>Withdraw consent for data processing where consent was the basis</li>
            </ul>

            <h3 className="text-lg font-semibold text-white mt-4 mb-2">7.2 California Residents (CCPA/CPRA)</h3>
            <p className="text-muted-foreground mb-2">If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA) as amended by the California Privacy Rights Act (CPRA):</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li><strong className="text-white">Right to Know:</strong> You may request details about the categories and specific pieces of personal information we collect, the purposes for collection, and with whom we share it</li>
              <li><strong className="text-white">Right to Delete:</strong> You may request deletion of your personal information, subject to certain exceptions</li>
              <li><strong className="text-white">Right to Correct:</strong> You may request correction of inaccurate personal information</li>
              <li><strong className="text-white">Right to Opt Out of Sale/Sharing:</strong> We do not sell or share your personal information for cross-context behavioral advertising. No opt-out is required because no sale or sharing occurs</li>
              <li><strong className="text-white">Right to Limit Use of Sensitive Information:</strong> We only use sensitive personal information (e.g., account credentials) as necessary to provide our services</li>
              <li><strong className="text-white">Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your CCPA/CPRA rights</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              To exercise these rights, contact us at <a href="mailto:privacy@stbcybersecurity.com" className="text-primary hover:underline">privacy@stbcybersecurity.com</a>. We will verify your identity and respond within 45 days as required by law. You may designate an authorized agent to submit requests on your behalf.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong className="text-white">Categories of Information Collected (past 12 months):</strong> Identifiers (email, username, hashed IP), commercial information (subscription tier, payment history via Stripe), internet activity (pages visited, search queries on our platform), and inferences (subscription tier classification).
            </p>

            <h3 className="text-lg font-semibold text-white mt-4 mb-2">7.3 Other State Privacy Laws</h3>
            <p className="text-muted-foreground mb-4">
              Residents of Virginia (VCDPA), Colorado (CPA), Connecticut (CTDPA), Utah (UCPA), and other states with consumer privacy laws may have similar rights to access, delete, correct, and opt out. Please contact us to exercise your rights, and we will respond in accordance with applicable law.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">8. Children's Privacy (COPPA)</h2>
            <p className="text-muted-foreground mb-4">
              Our services are not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13. If we discover that a child under 13 has provided us with personal information, we will promptly delete such information. If you are a parent or guardian and believe your child has provided us with personal information, please contact us at <a href="mailto:privacy@stbcybersecurity.com" className="text-primary hover:underline">privacy@stbcybersecurity.com</a>.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">9. Do Not Track Disclosure</h2>
            <p className="text-muted-foreground mb-4">
              Our Site does not respond to "Do Not Track" (DNT) browser signals. However, we do not engage in cross-site tracking, third-party behavioral advertising, or sale of personal information, so the practical effect is equivalent to honoring DNT signals.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">10. Cookies and Tracking Technologies</h2>
            <p className="text-muted-foreground mb-4">We use only essential cookies required for our platform to function:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li><strong className="text-white">session_token:</strong> Authentication session cookie (httpOnly, secure, 30-day expiration)</li>
              <li><strong className="text-white">stbcs_v:</strong> Anonymous visitor tracking cookie (httpOnly, secure, 1-year expiration)</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              We do not use advertising cookies, analytics trackers (such as Google Analytics), social media pixels, or any third-party tracking technologies.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">11. Email Communications (CAN-SPAM Compliance)</h2>
            <p className="text-muted-foreground mb-4">
              We comply with the CAN-SPAM Act. All marketing and newsletter emails include clear identification of the sender, our physical address, and a one-click unsubscribe mechanism. You may opt out of non-essential emails at any time. Transactional emails (account confirmations, security alerts, incident response) may still be sent as necessary for service operation.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">12. SMS/Text Messaging</h2>
            <p className="text-muted-foreground mb-4">
              If you opt in to SMS services, the following applies to your phone number and messaging data:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li><strong className="text-white">Phone Number Use:</strong> Your phone number is used solely to deliver threat alerts, incident response communications, and service notifications via SMS through our toll-free number (855) STB-1987</li>
              <li><strong className="text-white">No Sharing:</strong> We do not sell, rent, lease, or share your phone number or SMS opt-in data with third parties for their marketing purposes. Phone numbers are shared only with our telecommunications service provider for the sole purpose of delivering messages</li>
              <li><strong className="text-white">Message Logs:</strong> SMS message content and metadata are retained for service operation, compliance, and quality assurance purposes</li>
              <li><strong className="text-white">Opt-Out Data:</strong> If you opt out, we retain your phone number solely to honor your opt-out request and prevent future messages</li>
              <li><strong className="text-white">Data Retention:</strong> SMS message logs are retained for up to 2 years. Phone numbers are removed from active messaging lists within 24 hours of an opt-out request</li>
              <li><strong className="text-white">TCPA Compliance:</strong> We obtain express written consent before sending automated SMS messages and comply with the Telephone Consumer Protection Act (TCPA) and all applicable FCC regulations</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              For complete SMS program details, including opt-out instructions and message frequency, see our <a href="/sms-terms" className="text-primary hover:underline">SMS Terms &amp; Conditions</a>.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">13. Data Breach Notification</h2>

            <p className="text-muted-foreground mb-4">
              In the event of a data breach that compromises your personal information, we will notify affected users within 72 hours of discovery, in accordance with applicable state breach notification laws (including California Civil Code §1798.82 and equivalent statutes). Notification will include a description of the incident, the types of information involved, steps we are taking, and recommendations for protecting yourself.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">14. International Data</h2>
            <p className="text-muted-foreground mb-4">
              Our services are operated in the United States. If you access our Site from outside the United States, your information may be transferred to and processed in the United States, where data protection laws may differ from those in your jurisdiction. By using our services, you consent to such transfer.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">15. Third-Party Services</h2>
            <p className="text-muted-foreground mb-4">Our platform integrates with the following third-party services, each governed by their own privacy policies:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li><strong className="text-white">Stripe, Inc.:</strong> Payment processing — <a href="https://stripe.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">stripe.com/privacy</a></li>
              <li><strong className="text-white">Resend:</strong> Email delivery services</li>
              <li><strong className="text-white">OpenPhone:</strong> SMS and phone communications</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              We also aggregate publicly available threat intelligence data from government and security research sources (NVD, CISA, etc.) which does not involve personal information.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">16. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground mb-4">
              We may update this Privacy Policy from time to time. Material changes will be communicated via email to registered users and/or a prominent notice on our Site at least 30 days before the changes take effect. Your continued use of our services after the effective date constitutes acceptance of the revised policy.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">17. Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have questions about this Privacy Policy or wish to exercise your privacy rights, please contact us:
            </p>
            <ul className="list-none text-muted-foreground space-y-1">
              <li>Email: <a href="mailto:privacy@stbcybersecurity.com" className="text-primary hover:underline">privacy@stbcybersecurity.com</a></li>
              <li>General: <a href="mailto:info@stbcybersecurity.com" className="text-primary hover:underline">info@stbcybersecurity.com</a></li>
              <li>Phone: <a href="tel:+18557821987" className="text-primary hover:underline">(855) STB-1987</a></li>
            </ul>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </Layout>
  );
}
