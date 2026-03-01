import { useState } from "react";
import { Mail, Globe, Shield, Phone, MessageSquare, Send, Loader2, CheckCircle, Lock, ShieldCheck, CreditCard } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [newsletterConsent, setNewsletterConsent] = useState(false);

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || newsletterStatus === "loading" || !newsletterConsent) return;
    
    setNewsletterStatus("loading");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to subscribe");
      setNewsletterStatus("success");
      setNewsletterMessage("Subscribed! Check your inbox.");
      setNewsletterEmail("");
      setNewsletterConsent(false);
      setTimeout(() => setNewsletterStatus("idle"), 5000);
    } catch (err: any) {
      setNewsletterStatus("error");
      setNewsletterMessage(err.message || "Something went wrong");
      setTimeout(() => setNewsletterStatus("idle"), 4000);
    }
  };

  return (
    <footer className="relative mt-10">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="bg-card/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src="/brand/icon-shield.png" alt="STBCS" className="h-10 w-10 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                <span className="font-display font-bold text-lg text-primary tracking-wider">STB Cybersecurity</span>
              </div>
              <p className="text-sm text-muted-foreground mb-5 max-w-md leading-relaxed">
                Your trusted partner in cybersecurity. We help small to medium-sized businesses stay ahead of threats with proactive security consulting and rapid incident response when it matters most.
              </p>
              
              <div className="relative bg-primary/10 border border-primary/20 rounded-lg p-4 mb-5 max-w-md overflow-hidden group hover:border-primary/40 transition-colors duration-300">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <p className="relative text-xs text-primary font-bold mb-1.5 flex items-center gap-1.5 uppercase tracking-widest">
                  <Phone aria-hidden="true" className="h-3 w-3" /> Emergency Hotline
                </p>
                <a 
                  href="tel:+18557821987" 
                  className="relative text-lg font-display font-bold text-white hover:text-primary transition-colors duration-200"
                  data-testid="link-phone-footer"
                >
                  (855) STB-1987
                </a>
                <p className="relative text-xs text-muted-foreground mt-1">24/7 Incident Response</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Globe aria-hidden="true" className="h-3 w-3" />
                <span>stbcybersecurity.com</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-display font-bold text-white text-sm mb-4 tracking-wider uppercase">Threat Intelligence</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><a href="/exploits" className="inline-flex items-center gap-1 hover:text-primary hover:translate-x-1 transition-all duration-200" data-testid="link-footer-cves">CVE Database</a></li>
                <li><a href="/ransomware" className="inline-flex items-center gap-1 hover:text-primary hover:translate-x-1 transition-all duration-200" data-testid="link-footer-ransomware">Ransomware Tracker</a></li>
                <li><a href="/groups" className="inline-flex items-center gap-1 hover:text-primary hover:translate-x-1 transition-all duration-200" data-testid="link-footer-groups">Threat Actors</a></li>
                <li><a href="/breaches" className="inline-flex items-center gap-1 hover:text-primary hover:translate-x-1 transition-all duration-200" data-testid="link-footer-breaches">Breach Database</a></li>
                <li><a href="/ics-advisories" className="inline-flex items-center gap-1 hover:text-primary hover:translate-x-1 transition-all duration-200" data-testid="link-footer-ics">ICS-CERT Advisories</a></li>
                <li><a href="/intel" className="inline-flex items-center gap-1 hover:text-primary hover:translate-x-1 transition-all duration-200" data-testid="link-footer-intel">Intel & Feeds</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-display font-bold text-white text-sm mb-4 tracking-wider uppercase">Tools & Services</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><a href="/tools" className="inline-flex items-center gap-1 hover:text-primary hover:translate-x-1 transition-all duration-200" data-testid="link-footer-tools">Security Tools</a></li>
                <li><a href="/search" className="inline-flex items-center gap-1 hover:text-primary hover:translate-x-1 transition-all duration-200" data-testid="link-footer-search">Search & IOC Lookup</a></li>
                <li><a href="/risk-score" className="inline-flex items-center gap-1 hover:text-primary hover:translate-x-1 transition-all duration-200" data-testid="link-footer-risk">Cyber Risk Score</a></li>
                <li><a href="/monitors" className="inline-flex items-center gap-1 hover:text-primary hover:translate-x-1 transition-all duration-200" data-testid="link-footer-monitors">Monitoring & Alerts</a></li>
                <li><a href="/api-docs" className="inline-flex items-center gap-1 hover:text-primary hover:translate-x-1 transition-all duration-200" data-testid="link-footer-api">API Documentation</a></li>
                <li><a href="/support" className="inline-flex items-center gap-1 hover:text-primary hover:translate-x-1 transition-all duration-200" data-testid="link-footer-pricing">Plans & Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-display font-bold text-white text-sm mb-4 tracking-wider uppercase">Contact</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href="tel:+18557821987" className="text-muted-foreground hover:text-primary flex items-center gap-2 hover:translate-x-1 transition-all duration-200" data-testid="link-call-footer">
                    <Phone aria-hidden="true" className="h-3 w-3 shrink-0" /> (855) STB-1987
                  </a>
                </li>
                <li>
                  <a href="sms:+18557821987" className="text-muted-foreground hover:text-primary flex items-center gap-2 hover:translate-x-1 transition-all duration-200" data-testid="link-sms-footer">
                    <MessageSquare aria-hidden="true" className="h-3 w-3 shrink-0" /> Text Us
                  </a>
                </li>
                <li>
                  <a href="/contact?category=general" className="text-muted-foreground hover:text-primary flex items-center gap-2 hover:translate-x-1 transition-all duration-200" data-testid="link-email-info">
                    <Mail aria-hidden="true" className="h-3 w-3 shrink-0" /> General Inquiries
                  </a>
                </li>
                <li>
                  <a href="/contact?category=sales" className="text-muted-foreground hover:text-primary flex items-center gap-2 hover:translate-x-1 transition-all duration-200" data-testid="link-email-sales">
                    <Mail aria-hidden="true" className="h-3 w-3 shrink-0" /> Sales & Pricing
                  </a>
                </li>
                <li>
                  <a href="/contact?category=support" className="text-muted-foreground hover:text-primary flex items-center gap-2 hover:translate-x-1 transition-all duration-200" data-testid="link-email-support">
                    <Mail aria-hidden="true" className="h-3 w-3 shrink-0" /> Technical Support
                  </a>
                </li>
                <li className="pt-2">
                  <a href="/contact" className="text-primary hover:text-orange-300 font-medium flex items-center gap-2 hover:translate-x-1 transition-all duration-200" data-testid="link-footer-contact-page">
                    <Send aria-hidden="true" className="h-3 w-3 shrink-0" /> Contact Form
                  </a>
                </li>
                <li>
                  <a href="/about" className="text-muted-foreground hover:text-primary flex items-center gap-2 hover:translate-x-1 transition-all duration-200" data-testid="link-footer-about">
                    <Shield aria-hidden="true" className="h-3 w-3 shrink-0" /> About Us
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="relative mt-10 pt-8">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex-1">
                <h4 className="font-display font-bold text-white text-sm mb-1.5 tracking-wider uppercase flex items-center gap-2">
                  <Mail aria-hidden="true" className="h-4 w-4 text-primary" />
                  Threat Intelligence Newsletter
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">Get weekly security digests, CVE alerts, and ransomware updates delivered to your inbox.</p>
              </div>
              <form onSubmit={handleNewsletterSubscribe} className="w-full md:w-auto space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 md:w-64">
                    <Mail aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="Enter your email…"
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      required
                      name="email"
                      autoComplete="email"
                      spellCheck={false}
                      className="w-full pl-9 pr-3 py-2.5 bg-zinc-900/80 border border-zinc-700/50 rounded-lg text-sm text-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/30 transition-all duration-200"
                      data-testid="input-newsletter-email"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={newsletterStatus === "loading" || !newsletterEmail || !newsletterConsent}
                    className="px-5 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 hover:shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                    data-testid="button-newsletter-subscribe"
                  >
                    {newsletterStatus === "loading" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : newsletterStatus === "success" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {newsletterStatus === "success" ? "Done" : "Subscribe"}
                  </button>
                </div>
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="newsletter-consent"
                    checked={newsletterConsent}
                    onChange={(e) => setNewsletterConsent(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 rounded border-zinc-600 bg-zinc-800 accent-orange-500"
                    data-testid="checkbox-newsletter-consent"
                  />
                  <label htmlFor="newsletter-consent" className="text-[10px] text-zinc-500 leading-snug">
                    I agree to the{" "}
                    <a href="/privacy" className="text-primary/70 hover:text-primary hover:underline transition-colors duration-200">Privacy Policy</a>
                    {" "}and consent to receive security digests and threat alerts via email. Unsubscribe anytime.
                  </label>
                </div>
              </form>
            </div>
            {newsletterStatus !== "idle" && (
              <p className={`text-xs mt-2 text-center md:text-right ${newsletterStatus === "success" ? "text-green-400" : "text-red-400"}`}>
                {newsletterMessage}
              </p>
            )}
          </div>

          <div className="relative mt-8 pt-6 space-y-5">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3">
              {[
                { icon: Lock, label: "SSL/TLS Encrypted", color: "text-emerald-400" },
                { icon: CreditCard, label: "Payments by Stripe", color: "text-emerald-400" },
                { icon: ShieldCheck, label: "HTTPS Enforced", color: "text-emerald-400" },
                { icon: Shield, label: "Data Protected", color: "text-emerald-400" },
              ].map(({ icon: Icon, label, color }) => (
                <span key={label} className="flex items-center gap-2 text-[11px] text-zinc-400 bg-white/[0.02] border border-white/[0.04] rounded-full px-3.5 py-1.5 hover:border-white/10 transition-colors duration-200">
                  <Icon aria-hidden="true" className={`h-3.5 w-3.5 ${color}`} />
                  <span>{label}</span>
                </span>
              ))}
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-2">
              <p className="text-xs text-muted-foreground">
                &copy; {currentYear} STB Cybersecurity. All rights reserved.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <a href="/about" className="hover:text-primary transition-colors duration-200">About</a>
                <a href="/contact" className="hover:text-primary transition-colors duration-200">Contact</a>
                <a href="/support" className="hover:text-primary transition-colors duration-200">Pricing</a>
                <a href="/api-docs" className="hover:text-primary transition-colors duration-200">API</a>
                <span className="text-zinc-700">|</span>
                <a href="/privacy" className="hover:text-primary transition-colors duration-200">Privacy Policy</a>
                <a href="/terms" className="hover:text-primary transition-colors duration-200">Terms of Service</a>
                <a href="/sms-terms" className="hover:text-primary transition-colors duration-200">SMS Terms</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
