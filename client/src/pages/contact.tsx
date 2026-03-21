import { useState, useEffect } from "react";
import { useDocumentTitle } from "@/lib/use-document-title";
import { useLocation } from "wouter";
import Layout from "@/components/layout";
import Footer from "@/components/footer";
import RelatedResources, { getRelatedLinks } from "@/components/related-resources";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Mail, Phone, MessageSquare, Shield, Clock, MapPin, Send,
  Loader2, CheckCircle, AlertTriangle, Building2, Headphones,
  FileText, Bug, HelpCircle, Zap
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import AnimatedSection from "@/components/animated-section";

const categories = [
  { value: "general", label: "General Inquiry", icon: HelpCircle },
  { value: "incident", label: "Active Incident / Emergency", icon: AlertTriangle },
  { value: "consulting", label: "Security Consulting", icon: Shield },
  { value: "sales", label: "Plans & Pricing", icon: Building2 },
  { value: "support", label: "Technical Support", icon: Headphones },
  { value: "vulnerability", label: "Report a Vulnerability", icon: Bug },
  { value: "partnership", label: "Partnership / Media", icon: FileText },
  { value: "billing", label: "Billing & Payments", icon: Building2 },
  { value: "feedback", label: "Feedback", icon: MessageSquare },
];

export default function ContactPage() {
  useDocumentTitle(
    "Contact Us | STB Cybersecurity",
    "Get in touch with STB Cybersecurity for incident response, security consulting, or general inquiries. 24/7 emergency hotline available."
  );

  const params = new URLSearchParams(window.location.search);
  const initialCategory = categories.find(c => c.value === params.get("category"))?.value || "general";
  const initialSubject = params.get("subject") || "";

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: initialSubject,
    category: initialCategory,
    message: "",
  });

  useEffect(() => {
    if (initialCategory !== "general" || initialSubject) {
      const formEl = document.getElementById("contact-form");
      if (formEl) {
        setTimeout(() => formEl.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
      }
    }
  }, []);

  const submitMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to send message");
      }
      return res.json();
    },
    onSuccess: () => {
      setForm({ name: "", email: "", subject: "", category: "general", message: "" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(form);
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Layout>
      <div className="space-y-8 page-transition" data-testid="contact-page">
        <AnimatedSection animation="fade-down" className="text-center space-y-4">
          <img
            src="/brand/logo-main.png"
            alt="STB Cybersecurity"
            className="h-24 w-auto mx-auto drop-shadow-[0_0_14px_rgba(239,68,68,0.3)] icon-float"
            data-testid="img-contact-logo"
          />
          <h1 className="text-4xl font-display font-bold tracking-tight text-white" data-testid="text-contact-title">
            Get in Touch
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Whether you're dealing with an active breach or want to strengthen your defenses,
            our team is ready to help. Choose how you'd like to reach us.
          </p>
        </AnimatedSection>

        <AnimatedSection animation="scale">
          <Card className="border-red-500/30 bg-gradient-to-r from-red-500/10 to-zinc-900/50 glow-pulse" data-testid="card-emergency">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/20 rounded-full animate-pulse">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Active Cyber Incident?</h2>
                  <p className="text-sm text-zinc-400">Our incident response team is available 24/7. Don't wait.</p>
                </div>
              </div>
              <a
                href="tel:+18557821987"
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors text-lg"
                data-testid="link-emergency-phone"
              >
                <Phone className="h-5 w-5" />
                (855) STB-1987
              </a>
            </div>
          </CardContent>
        </Card>
        </AnimatedSection>

        <div className="grid lg:grid-cols-3 gap-6">
          <AnimatedSection animation="fade-left" className="lg:col-span-2 space-y-6">
            <Card id="contact-form" className="bg-zinc-900/50 border-zinc-800 card-interactive" data-testid="card-contact-form">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Send className="h-5 w-5 text-orange-400" />
                  Send Us a Message
                </h2>

                {submitMutation.isSuccess ? (
                  <div className="text-center py-12 space-y-4" data-testid="contact-success">
                    <CheckCircle className="h-16 w-16 text-green-400 mx-auto" />
                    <h3 className="text-xl font-bold text-white">Message Sent!</h3>
                    <p className="text-zinc-400 max-w-md mx-auto">
                      We've received your message and will respond within 24 hours.
                      For emergencies, call us directly at (855) STB-1987.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => submitMutation.reset()}
                      data-testid="button-send-another"
                    >
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5" data-testid="form-contact">
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-zinc-300 mb-2">
                        What can we help with?
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2" data-testid="category-selector">
                        {categories.map((cat) => (
                          <button
                            key={cat.value}
                            type="button"
                            onClick={() => updateField("category", cat.value)}
                            className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs font-medium transition-all ${
                              form.category === cat.value
                                ? "border-orange-500 bg-orange-500/10 text-orange-400"
                                : "border-zinc-500 bg-zinc-800/50 text-zinc-400 hover:border-zinc-400 hover:text-zinc-300"
                            }`}
                            data-testid={`button-category-${cat.value}`}
                          >
                            <cat.icon className="h-4 w-4" />
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1.5">
                          Your Name
                        </label>
                        <input
                          id="name"
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => updateField("name", e.target.value)}
                          placeholder="John Smith"
                          className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-500 rounded-lg text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30"
                          data-testid="input-contact-name"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1.5">
                          Email Address
                        </label>
                        <input
                          id="email"
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => updateField("email", e.target.value)}
                          placeholder="john@company.com"
                          className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-500 rounded-lg text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30"
                          data-testid="input-contact-email"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-zinc-300 mb-1.5">
                        Subject
                      </label>
                      <input
                        id="subject"
                        type="text"
                        required
                        value={form.subject}
                        onChange={(e) => updateField("subject", e.target.value)}
                        placeholder="Brief description of your inquiry"
                        className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-500 rounded-lg text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30"
                        data-testid="input-contact-subject"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-zinc-300 mb-1.5">
                        Message
                      </label>
                      <textarea
                        id="message"
                        required
                        rows={5}
                        value={form.message}
                        onChange={(e) => updateField("message", e.target.value)}
                        placeholder="Tell us about your situation, what you need, or how we can help..."
                        className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-500 rounded-lg text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 resize-none"
                        data-testid="input-contact-message"
                      />
                    </div>

                    {submitMutation.isError && (
                      <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3" data-testid="contact-error">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                        {(submitMutation.error as Error).message}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={submitMutation.isPending || !form.name || !form.email || !form.subject || !form.message}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5"
                      data-testid="button-submit-contact"
                    >
                      {submitMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>

                    <p className="text-[11px] text-zinc-500 text-center">
                      By submitting, you agree to our{" "}
                      <a href="/privacy" className="text-orange-400/70 hover:underline">Privacy Policy</a>.
                      We'll respond within 24 hours.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection animation="fade-right" className="space-y-4">
            <Card className="bg-zinc-900/50 border-zinc-800 card-interactive" data-testid="card-contact-info">
              <CardContent className="pt-6 space-y-5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-orange-400" />
                  Contact Information
                </h3>

                <div className="space-y-4">
                  <a href="tel:+18557821987" className="flex items-start gap-3 group" data-testid="link-contact-phone">
                    <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                      <Phone className="h-4 w-4 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-orange-400 transition-colors">(855) STB-1987</p>
                      <p className="text-xs text-zinc-500">24/7 Emergency Hotline</p>
                    </div>
                  </a>

                  <a href="mailto:info@stbcybersecurity.com" className="flex items-start gap-3 group" data-testid="link-contact-email">
                    <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                      <Mail className="h-4 w-4 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-orange-400 transition-colors">info@stbcybersecurity.com</p>
                      <p className="text-xs text-zinc-500">General Inquiries</p>
                    </div>
                  </a>

                  <a href="mailto:sales@stbcybersecurity.com" className="flex items-start gap-3 group" data-testid="link-contact-sales">
                    <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                      <Mail className="h-4 w-4 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-orange-400 transition-colors">sales@stbcybersecurity.com</p>
                      <p className="text-xs text-zinc-500">Plans & Enterprise</p>
                    </div>
                  </a>

                  <a href="mailto:support@stbcybersecurity.com" className="flex items-start gap-3 group" data-testid="link-contact-support">
                    <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                      <Headphones className="h-4 w-4 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-orange-400 transition-colors">support@stbcybersecurity.com</p>
                      <p className="text-xs text-zinc-500">Technical Support</p>
                    </div>
                  </a>

                  <a href="sms:+18557821987" className="flex items-start gap-3 group" data-testid="link-contact-sms">
                    <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                      <MessageSquare className="h-4 w-4 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-orange-400 transition-colors">Text Us</p>
                      <p className="text-xs text-zinc-500">SMS: (855) STB-1987</p>
                    </div>
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800" data-testid="card-response-times">
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-400" />
                  Response Times
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Active Incidents</span>
                    <span className="text-sm font-bold text-red-400 flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5" /> Immediate
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Consulting</span>
                    <span className="text-sm font-medium text-orange-400">Within 4 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">General Inquiries</span>
                    <span className="text-sm font-medium text-zinc-300">Within 24 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Technical Support</span>
                    <span className="text-sm font-medium text-zinc-300">Within 12 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800" data-testid="card-business-hours">
              <CardContent className="pt-6 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-400" />
                  Availability
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Emergency Response</span>
                    <span className="text-green-400 font-medium">24/7/365</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Business Hours</span>
                    <span className="text-zinc-300">Mon-Fri 8am-6pm ET</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Weekend Support</span>
                    <span className="text-zinc-300">On-call available</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-zinc-800">
                  <p className="text-xs text-zinc-500">
                    Serving clients across the United States with remote and on-site support capabilities.
                  </p>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>

                <RelatedResources links={getRelatedLinks("/contact")} testIdPrefix="contact" />
<Footer />
      </div>
    </Layout>
  );
}
