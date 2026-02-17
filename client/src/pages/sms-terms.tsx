import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function SmsTerms() {
  useDocumentTitle("SMS Terms & Conditions | STB Cybersecurity", "SMS and text messaging terms and conditions for STB Cybersecurity. TCPA compliance, opt-in/opt-out, message frequency, and data rates disclosure.");

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <MessageSquare className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-display font-bold text-white">SMS Terms &amp; Conditions</h1>
        </div>

        <Card className="border-white/5 bg-card/50">
          <CardContent className="prose prose-invert max-w-none p-8">
            <p className="text-muted-foreground text-sm mb-6">Effective Date: February 17, 2026 | Last Updated: February 17, 2026</p>

            <p className="text-muted-foreground mb-6">
              By opting in to receive SMS text messages from STB Cybersecurity, LLC ("STBCS," "we," "our," or "us"), you agree to the following terms and conditions. These SMS Terms supplement our <a href="/terms" className="text-primary hover:underline">Terms of Service</a> and <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">1. Program Description</h2>
            <p className="text-muted-foreground mb-4">
              STBCS offers SMS text messaging services through our toll-free number <a href="tel:+18557821987" className="text-primary hover:underline">(855) STB-1987</a> for the following purposes:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li><strong className="text-white">Threat Alerts:</strong> Real-time notifications for critical CVEs (CVSS 9.0+), ransomware incidents, and watchlist matches (Business tier subscribers)</li>
              <li><strong className="text-white">Incident Response Communications:</strong> Two-way messaging for active incident response engagements and cybersecurity consulting</li>
              <li><strong className="text-white">Service Notifications:</strong> Important account and subscription-related updates</li>
            </ul>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">2. Consent and Opt-In</h2>
            <p className="text-muted-foreground mb-4">
              By providing your phone number and enabling SMS alerts on our platform, you expressly consent to receive recurring automated text messages from STBCS at the phone number you provided. Your consent is not a condition of purchasing any goods or services.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>You must be at least 18 years of age to opt in to SMS messaging</li>
              <li>You must be the account holder or authorized user of the phone number provided</li>
              <li>By opting in, you confirm that you have the authority to receive text messages at the provided number</li>
              <li>Consent to receive marketing text messages is not required as a condition of purchasing any product or service</li>
            </ul>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">3. Message Frequency</h2>
            <p className="text-muted-foreground mb-4">
              Message frequency varies based on your alert configuration and threat activity:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li><strong className="text-white">Threat Alerts:</strong> Frequency depends on the number of watchlist items configured and the volume of matching threats. Typically 0–10 messages per day, but may increase during periods of high threat activity</li>
              <li><strong className="text-white">Incident Response:</strong> Message frequency varies based on active incident engagement. Conversations are initiated by you or by our incident response team as needed</li>
              <li><strong className="text-white">Service Notifications:</strong> Infrequent; sent only for critical account updates</li>
            </ul>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">4. Opt-Out Instructions</h2>
            <p className="text-muted-foreground mb-4">
              You may opt out of receiving SMS messages at any time by any of the following methods:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li><strong className="text-white">Reply STOP:</strong> Text <strong className="text-orange-400">STOP</strong> to <strong className="text-orange-400">(855) STB-1987</strong> to immediately unsubscribe from all SMS messages</li>
              <li><strong className="text-white">Account Settings:</strong> Disable SMS alerts in your watchlist settings on our platform by toggling off SMS notifications for individual items or disabling SMS alerts entirely</li>
              <li><strong className="text-white">Contact Us:</strong> Email <a href="mailto:support@stbcybersecurity.com" className="text-primary hover:underline">support@stbcybersecurity.com</a> or call <a href="tel:+18557821987" className="text-primary hover:underline">(855) STB-1987</a> to request removal from SMS messaging</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              After opting out, you will receive a one-time confirmation message. No additional messages will be sent unless you re-opt in.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">5. Help and Support</h2>
            <p className="text-muted-foreground mb-4">
              For help with our SMS program, you may:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Text <strong className="text-orange-400">HELP</strong> to <strong className="text-orange-400">(855) STB-1987</strong> for assistance</li>
              <li>Email <a href="mailto:support@stbcybersecurity.com" className="text-primary hover:underline">support@stbcybersecurity.com</a></li>
              <li>Call <a href="tel:+18557821987" className="text-primary hover:underline">(855) STB-1987</a></li>
            </ul>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">6. Message and Data Rates</h2>
            <p className="text-muted-foreground mb-4">
              <strong className="text-white">Message and data rates may apply.</strong> Standard messaging rates from your wireless carrier apply to all SMS messages sent and received. STBCS does not charge any additional fees for SMS messages. Check with your wireless carrier for details on your messaging plan.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">7. Supported Carriers</h2>
            <p className="text-muted-foreground mb-4">
              Our SMS services are compatible with most major US wireless carriers, including AT&T, Verizon, T-Mobile, Sprint, and others. Carriers are not liable for delayed or undelivered messages.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">8. Privacy and Data Use</h2>
            <p className="text-muted-foreground mb-4">
              Your phone number and SMS data are handled in accordance with our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>. Specifically:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Your phone number is stored securely and used solely for the purposes described in this agreement</li>
              <li>We do not sell, rent, or share your phone number with third parties for marketing purposes</li>
              <li>SMS message logs are retained for service operation and may be reviewed for quality and compliance purposes</li>
              <li>Phone numbers of users who opt out are retained only as necessary to honor the opt-out request</li>
              <li>SMS communications are facilitated through our telecommunications provider and are subject to their security measures</li>
            </ul>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">9. Disclaimer of Liability</h2>
            <p className="text-muted-foreground mb-4">
              STBCS, its affiliates, and wireless carriers are not responsible for:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Delayed, lost, or undelivered messages due to network conditions, carrier issues, or device compatibility</li>
              <li>Charges incurred from your wireless carrier for receiving SMS messages</li>
              <li>Any actions taken or not taken based on information received via SMS</li>
              <li>T-Mobile is not liable for delayed or undelivered messages</li>
            </ul>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">10. Compliance</h2>
            <p className="text-muted-foreground mb-4">
              Our SMS program operates in compliance with:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li><strong className="text-white">Telephone Consumer Protection Act (TCPA):</strong> We obtain express written consent before sending automated text messages and honor all opt-out requests promptly</li>
              <li><strong className="text-white">CTIA Messaging Principles and Best Practices:</strong> Our program follows industry guidelines for commercial messaging</li>
              <li><strong className="text-white">Cellular Telecommunications Industry Association (CTIA) Short Code Monitoring:</strong> We adhere to carrier-mandated compliance requirements for toll-free messaging</li>
              <li><strong className="text-white">FCC Regulations:</strong> We comply with all applicable Federal Communications Commission rules governing text messaging</li>
            </ul>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">11. Changes to SMS Terms</h2>
            <p className="text-muted-foreground mb-4">
              We may update these SMS Terms from time to time. Material changes will be communicated via SMS or email to opted-in users. Your continued participation in our SMS program after changes are communicated constitutes acceptance of the updated terms.
            </p>

            <h2 className="text-xl font-bold text-white mt-8 mb-3">12. Contact Information</h2>
            <p className="text-muted-foreground mb-4">
              For questions about our SMS program:
            </p>
            <ul className="list-none text-muted-foreground space-y-1">
              <li>Email: <a href="mailto:support@stbcybersecurity.com" className="text-primary hover:underline">support@stbcybersecurity.com</a></li>
              <li>Phone: <a href="tel:+18557821987" className="text-primary hover:underline">(855) STB-1987</a></li>
              <li>Text HELP to <span className="text-orange-400">(855) STB-1987</span></li>
              <li>Text STOP to <span className="text-orange-400">(855) STB-1987</span> to opt out</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </Layout>
  );
}
