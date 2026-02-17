import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function Terms() {
  useDocumentTitle("Terms of Service | STB Cybersecurity", "Terms of Service for STB Cybersecurity threat intelligence platform, security tools, and cybersecurity consulting services.");

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-display font-bold text-white">Terms of Service</h1>
        </div>

        <Card className="border-white/5 bg-card/50">
          <CardContent className="prose prose-invert max-w-none p-8">
            <p className="text-muted-foreground text-sm mb-6">Effective Date: February 17, 2026 | Last Updated: February 17, 2026</p>

            <p className="text-muted-foreground mb-6">
              These Terms of Service ("Terms") govern your access to and use of the services provided by STB Cybersecurity, LLC ("STBCS," "we," "our," or "us") through our website stbcybersecurity.com ("Site") and related services. By accessing or using our services, you agree to be bound by these Terms. If you do not agree, do not use our services.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">1. Eligibility</h2>
            <p className="text-muted-foreground mb-4">
              You must be at least 18 years of age to use our services. By creating an account or using our services, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into these Terms. Our services are not intended for children under 13, in compliance with the Children's Online Privacy Protection Act (COPPA).
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">2. Description of Services</h2>
            <p className="text-muted-foreground mb-4">
              STBCS provides cybersecurity consulting, incident response, threat intelligence aggregation, and related security services. Our platform aggregates publicly available threat data from government and security research sources and provides tools for security analysis. Services are offered in tiered subscription plans as described on our Site.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">3. User Accounts</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>You are responsible for maintaining the confidentiality of your account credentials</li>
              <li>You agree to provide accurate, current, and complete information during registration</li>
              <li>You agree to notify us immediately of any unauthorized use of your account at <a href="mailto:support@stbcybersecurity.com" className="text-primary hover:underline">support@stbcybersecurity.com</a></li>
              <li>You are responsible for all activities that occur under your account</li>
              <li>We reserve the right to suspend or terminate accounts that violate these Terms</li>
            </ul>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">4. Acceptable Use Policy</h2>
            <p className="text-muted-foreground mb-2">You agree not to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Use our services for any unlawful purpose or in violation of any applicable law</li>
              <li>Attempt to gain unauthorized access to our systems, networks, or other users' accounts</li>
              <li>Use our security tools to scan, probe, or test systems you do not own or have explicit written permission to test</li>
              <li>Interfere with, disrupt, or place an undue burden on our services or infrastructure</li>
              <li>Share your account credentials with third parties or allow unauthorized access</li>
              <li>Resell, sublicense, or redistribute our services or data without prior written authorization</li>
              <li>Use automated tools (bots, scrapers) to access our services beyond provided API rate limits</li>
              <li>Transmit malware, viruses, or other harmful code through our platform</li>
              <li>Use threat intelligence data from our platform to engage in illegal activities, harassment, or vigilantism</li>
              <li>Circumvent or attempt to circumvent rate limits, access controls, or security measures</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              Violation of this Acceptable Use Policy may result in immediate account suspension or termination and, where applicable, referral to law enforcement authorities.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">5. Subscription, Billing, and Payments</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Paid subscriptions are billed on a recurring monthly or annual basis through Stripe, Inc.</li>
              <li>All prices are listed in United States Dollars (USD) and are subject to applicable taxes</li>
              <li>You authorize us to charge your payment method on file for recurring subscription fees</li>
              <li>You may cancel your subscription at any time through your account settings or Stripe customer portal</li>
              <li>Cancellation takes effect at the end of the current billing period; no prorated refunds will be issued for partial periods</li>
              <li>We reserve the right to change subscription pricing with 30 days' advance notice to existing subscribers</li>
              <li>Promotional pricing and coupon codes are subject to specific terms and expiration dates</li>
              <li>Refunds for annual subscriptions may be requested within 14 days of purchase by contacting <a href="mailto:support@stbcybersecurity.com" className="text-primary hover:underline">support@stbcybersecurity.com</a></li>
            </ul>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">6. Intellectual Property</h2>
            <p className="text-muted-foreground mb-4">
              All content, features, functionality, trademarks, service marks, and trade names displayed on our Site are owned by STBCS or our licensors and are protected by United States and international intellectual property laws. You may not copy, modify, distribute, sell, or create derivative works based on our proprietary content without prior written permission.
            </p>
            <p className="text-muted-foreground mb-4">
              Publicly available threat intelligence data aggregated on our platform (e.g., CVE entries, CISA advisories) remains subject to its original licensing and attribution requirements.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">7. Digital Millennium Copyright Act (DMCA)</h2>
            <p className="text-muted-foreground mb-4">
              We respect the intellectual property rights of others. If you believe content on our Site infringes your copyright, you may submit a DMCA takedown notice to our designated agent:
            </p>
            <ul className="list-none text-muted-foreground space-y-1 mb-4">
              <li>Email: <a href="mailto:legal@stbcybersecurity.com" className="text-primary hover:underline">legal@stbcybersecurity.com</a></li>
              <li>Subject Line: "DMCA Takedown Notice"</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              Your notice must include: identification of the copyrighted work, the infringing material and its location, your contact information, a statement of good faith belief, and a statement under penalty of perjury that the information is accurate and you are the copyright owner or authorized to act on their behalf.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">8. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground mb-4">
              OUR SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Our services will be uninterrupted, timely, secure, or error-free</li>
              <li>Threat intelligence data is complete, accurate, or current at all times</li>
              <li>Security tools will detect all threats or vulnerabilities</li>
              <li>Our platform will meet your specific security requirements</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              Security tools and threat data are provided for informational and defensive purposes only. They do not constitute professional security advice for your specific situation.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">9. Limitation of Liability</h2>
            <p className="text-muted-foreground mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL STBCS, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING FROM OR RELATED TO YOUR USE OF OUR SERVICES, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), OR ANY OTHER LEGAL THEORY.
            </p>
            <p className="text-muted-foreground mb-4">
              OUR TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS ARISING FROM OR RELATED TO THESE TERMS OR YOUR USE OF OUR SERVICES SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNTS PAID BY YOU TO STBCS IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED DOLLARS ($100).
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">10. Indemnification</h2>
            <p className="text-muted-foreground mb-4">
              You agree to indemnify, defend, and hold harmless STBCS and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including reasonable attorneys' fees) arising from: (a) your use of our services; (b) your violation of these Terms; (c) your violation of any third-party rights; or (d) your use of security tools against systems you are not authorized to test.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">11. SMS/Text Messaging</h2>
            <p className="text-muted-foreground mb-4">
              STBCS offers SMS text messaging services through our toll-free number <a href="tel:+18557821987" className="text-primary hover:underline">(855) STB-1987</a>. By opting in to receive SMS messages, you agree to the following:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>You expressly consent to receive recurring automated text messages from STBCS at the phone number you provide, including threat alerts, incident response communications, and service notifications</li>
              <li>Your consent to receive SMS messages is not a condition of purchasing any goods or services</li>
              <li>Message and data rates may apply as determined by your wireless carrier</li>
              <li>Message frequency varies based on your alert configuration and threat activity</li>
              <li>You may opt out at any time by replying <strong className="text-orange-400">STOP</strong> to any message, disabling SMS in your account settings, or contacting us</li>
              <li>For help, reply <strong className="text-orange-400">HELP</strong> to any message or contact <a href="mailto:support@stbcybersecurity.com" className="text-primary hover:underline">support@stbcybersecurity.com</a></li>
              <li>Carriers are not liable for delayed or undelivered messages</li>
              <li>We do not sell, rent, or share your phone number or SMS opt-in data with third parties for marketing purposes</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              Our SMS program complies with the Telephone Consumer Protection Act (TCPA), CTIA Messaging Principles, and applicable FCC regulations. For complete SMS program details, see our <a href="/sms-terms" className="text-primary hover:underline">SMS Terms &amp; Conditions</a>.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">12. Emergency Services</h2>
            <p className="text-muted-foreground mb-4">
              Our emergency hotline <a href="tel:+18557821987" className="text-primary hover:underline">(855) STB-1987</a> is available 24/7 for incident response inquiries. Response times and service levels depend on your subscription tier and incident severity. Emergency response services are subject to separate engagement agreements and are not guaranteed by these Terms alone.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">13. Governing Law and Jurisdiction</h2>
            <p className="text-muted-foreground mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the United States and the State in which STBCS is organized, without regard to conflict of law principles. Any dispute arising from or relating to these Terms or our services shall be subject to the exclusive jurisdiction of the federal and state courts located in the State in which STBCS maintains its principal place of business.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">14. Dispute Resolution</h2>
            <p className="text-muted-foreground mb-4">
              Before initiating formal legal proceedings, you agree to first contact us at <a href="mailto:legal@stbcybersecurity.com" className="text-primary hover:underline">legal@stbcybersecurity.com</a> to attempt to resolve the dispute informally within 30 days. If informal resolution is unsuccessful, either party may pursue resolution through binding arbitration administered by the American Arbitration Association (AAA) under its Commercial Arbitration Rules, or through the courts as described in Section 12.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong className="text-white">Class Action Waiver:</strong> You agree that any dispute resolution proceedings will be conducted on an individual basis and not as a class, consolidated, or representative action.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">15. Data Processing</h2>
            <p className="text-muted-foreground mb-4">
              By using our services, you acknowledge that we process data as described in our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>. For business and enterprise subscribers using our services to process data on behalf of their organizations, additional data processing terms may apply. Contact <a href="mailto:legal@stbcybersecurity.com" className="text-primary hover:underline">legal@stbcybersecurity.com</a> for a Data Processing Agreement (DPA) if required.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">16. Export Compliance</h2>
            <p className="text-muted-foreground mb-4">
              You agree to comply with all applicable United States export control laws and regulations, including the Export Administration Regulations (EAR) and sanctions administered by the Office of Foreign Assets Control (OFAC). You represent that you are not located in, under the control of, or a national or resident of any country subject to United States sanctions.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">17. Termination</h2>
            <p className="text-muted-foreground mb-4">
              We may suspend or terminate your access to our services at any time, with or without cause, upon notice to you. Upon termination: (a) your right to use our services ceases immediately; (b) we may delete your account data after 30 days; and (c) all provisions of these Terms that by their nature should survive termination shall survive, including intellectual property, limitation of liability, indemnification, and dispute resolution.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">18. Severability</h2>
            <p className="text-muted-foreground mb-4">
              If any provision of these Terms is held to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">19. Entire Agreement</h2>
            <p className="text-muted-foreground mb-4">
              These Terms, together with our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> and <a href="/sms-terms" className="text-primary hover:underline">SMS Terms &amp; Conditions</a>, constitute the entire agreement between you and STBCS regarding your use of our services and supersede all prior agreements and understandings, whether written or oral.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">20. Modifications</h2>
            <p className="text-muted-foreground mb-4">
              We reserve the right to modify these Terms at any time. Material changes will be communicated via email and/or a prominent notice on our Site at least 30 days before taking effect. Your continued use of our services after the effective date constitutes acceptance of the modified Terms. If you do not agree with the changes, you must stop using our services and cancel your subscription.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">21. Contact</h2>
            <p className="text-muted-foreground mb-4">
              For questions about these Terms of Service, please contact us:
            </p>
            <ul className="list-none text-muted-foreground space-y-1">
              <li>Legal: <a href="mailto:legal@stbcybersecurity.com" className="text-primary hover:underline">legal@stbcybersecurity.com</a></li>
              <li>Support: <a href="mailto:support@stbcybersecurity.com" className="text-primary hover:underline">support@stbcybersecurity.com</a></li>
              <li>Phone: <a href="tel:+18557821987" className="text-primary hover:underline">(855) STB-1987</a></li>
            </ul>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </Layout>
  );
}
