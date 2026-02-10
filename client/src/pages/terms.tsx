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
            <p className="text-muted-foreground text-sm mb-6">Last updated: February 2026</p>

            <h2 className="text-xl font-bold text-white mt-6 mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground mb-4">
              By accessing or using STB Cybersecurity ("STBCS") services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>

            <h2 className="text-xl font-bold text-white mt-6 mb-3">2. Description of Services</h2>
            <p className="text-muted-foreground mb-4">
              STBCS provides cybersecurity consulting, incident response, threat intelligence, and related security services. Our platform aggregates threat data from public sources and provides tools for security analysis.
            </p>

            <h2 className="text-xl font-bold text-white mt-6 mb-3">3. User Accounts</h2>
            <p className="text-muted-foreground mb-4">
              You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.
            </p>

            <h2 className="text-xl font-bold text-white mt-6 mb-3">4. Acceptable Use</h2>
            <p className="text-muted-foreground mb-4">You agree not to:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Use our services for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt our services</li>
              <li>Scan or probe systems you do not own or have permission to test</li>
              <li>Share your account credentials with third parties</li>
              <li>Resell or redistribute our services without authorization</li>
            </ul>

            <h2 className="text-xl font-bold text-white mt-6 mb-3">5. Subscription and Billing</h2>
            <p className="text-muted-foreground mb-4">
              Paid subscriptions are billed on a recurring basis. You may cancel your subscription at any time. Refunds are provided in accordance with our refund policy. All payments are processed securely through Stripe.
            </p>

            <h2 className="text-xl font-bold text-white mt-6 mb-3">6. Intellectual Property</h2>
            <p className="text-muted-foreground mb-4">
              All content, features, and functionality of our services are owned by STBCS and are protected by intellectual property laws. You may not copy, modify, or distribute our content without permission.
            </p>

            <h2 className="text-xl font-bold text-white mt-6 mb-3">7. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground mb-4">
              Our services are provided "as is" without warranties of any kind. We do not guarantee that threat intelligence data is complete or error-free. Security tools are provided for informational purposes only.
            </p>

            <h2 className="text-xl font-bold text-white mt-6 mb-3">8. Limitation of Liability</h2>
            <p className="text-muted-foreground mb-4">
              STBCS shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services. Our total liability shall not exceed the amount paid by you in the preceding 12 months.
            </p>

            <h2 className="text-xl font-bold text-white mt-6 mb-3">9. Emergency Services</h2>
            <p className="text-muted-foreground mb-4">
              Our emergency hotline (855) STB-1987 is available 24/7 for incident response. Response times depend on your subscription tier and incident severity.
            </p>

            <h2 className="text-xl font-bold text-white mt-6 mb-3">10. Modifications</h2>
            <p className="text-muted-foreground mb-4">
              We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the modified terms.
            </p>

            <h2 className="text-xl font-bold text-white mt-6 mb-3">11. Contact</h2>
            <p className="text-muted-foreground mb-4">
              For questions about these Terms of Service, contact us at:
            </p>
            <ul className="list-none text-muted-foreground space-y-1">
              <li>Email: <a href="mailto:legal@stbcybersecurity.com" className="text-primary hover:underline">legal@stbcybersecurity.com</a></li>
              <li>Phone: <a href="tel:+18557821987" className="text-primary hover:underline">(855) STB-1987</a></li>
            </ul>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </Layout>
  );
}
