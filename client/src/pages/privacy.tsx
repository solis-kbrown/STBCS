import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function Privacy() {
  useDocumentTitle("Privacy Policy | STB Cybersecurity");

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-display font-bold text-white">Privacy Policy</h1>
        </div>

        <Card className="border-white/5 bg-card/50">
          <CardContent className="prose prose-invert max-w-none p-8">
            <p className="text-muted-foreground text-sm mb-6">Last updated: February 2026</p>

            <h2 className="text-xl font-bold text-white mt-6 mb-3">1. Information We Collect</h2>
            <p className="text-muted-foreground mb-4">
              STB Cybersecurity ("STBCS", "we", "our", or "us") collects information you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Account information (email address, name, phone number)</li>
              <li>Payment information (processed securely through Stripe)</li>
              <li>Communications you send to us</li>
              <li>Usage data and analytics</li>
            </ul>

            <h2 className="text-xl font-bold text-white mt-6 mb-3">2. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">We use the information we collect to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Send security alerts and notifications</li>
              <li>Process transactions and send related information</li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Send you technical notices and support messages</li>
            </ul>

            <h2 className="text-xl font-bold text-white mt-6 mb-3">3. Data Security</h2>
            <p className="text-muted-foreground mb-4">
              We implement industry-standard security measures to protect your personal information. All data is encrypted in transit using TLS and at rest using AES-256 encryption. Payment information is processed securely through Stripe and never stored on our servers.
            </p>

            <h2 className="text-xl font-bold text-white mt-6 mb-3">4. Data Retention</h2>
            <p className="text-muted-foreground mb-4">
              We retain your personal information for as long as your account is active or as needed to provide you services. Threat intelligence data is retained for up to 2 years for historical analysis purposes.
            </p>

            <h2 className="text-xl font-bold text-white mt-6 mb-3">5. Your Rights</h2>
            <p className="text-muted-foreground mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Access and receive a copy of your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Withdraw consent at any time</li>
            </ul>

            <h2 className="text-xl font-bold text-white mt-6 mb-3">6. Cookies</h2>
            <p className="text-muted-foreground mb-4">
              We use essential cookies for authentication and session management. We do not use tracking cookies or share data with third-party advertisers.
            </p>

            <h2 className="text-xl font-bold text-white mt-6 mb-3">7. Third-Party Services</h2>
            <p className="text-muted-foreground mb-4">
              We use trusted third-party services including Stripe for payment processing. These services have their own privacy policies governing their use of your information.
            </p>

            <h2 className="text-xl font-bold text-white mt-6 mb-3">8. Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <ul className="list-none text-muted-foreground space-y-1">
              <li>Email: <a href="mailto:privacy@stbcybersecurity.com" className="text-primary hover:underline">privacy@stbcybersecurity.com</a></li>
              <li>Phone: <a href="tel:+18557821987" className="text-primary hover:underline">(855) STB-1987</a></li>
            </ul>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </Layout>
  );
}
