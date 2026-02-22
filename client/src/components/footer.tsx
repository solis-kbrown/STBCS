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
    <footer className="border-t border-white/5 bg-card/30 mt-8">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Shield aria-hidden="true" className="h-5 w-5 text-primary" />
              <span className="font-display font-bold text-lg text-primary">STBCS</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              Your trusted partner in cybersecurity. We help small to medium-sized businesses stay ahead of threats with proactive security consulting and rapid incident response when it matters most. Whether you're strengthening defenses or navigating a crisis, our experts are here for you.
            </p>
            
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 mb-4 max-w-md">
              <p className="text-xs text-primary font-bold mb-1 flex items-center gap-1">
                <Phone aria-hidden="true" className="h-3 w-3" /> EMERGENCY HOTLINE
              </p>
              <a 
                href="tel:+18557821987" 
                className="text-lg font-display font-bold text-white hover:text-primary transition-colors"
                data-testid="link-phone-footer"
              >
                (855) STB-1987
              </a>
              <p className="text-xs text-muted-foreground mt-1">24/7 Incident Response</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe aria-hidden="true" className="h-3 w-3" />
              <span>stbcybersecurity.com</span>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-white text-sm mb-3">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="tel:+18557821987" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2" data-testid="link-call-footer">
                  <Phone aria-hidden="true" className="h-3 w-3" /> (855) STB-1987
                </a>
              </li>
              <li>
                <a href="sms:+18557821987" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2" data-testid="link-sms-footer">
                  <MessageSquare aria-hidden="true" className="h-3 w-3" /> Text Us
                </a>
              </li>
              <li>
                <a href="mailto:info@stbcybersecurity.com" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2" data-testid="link-email-info">
                  <Mail aria-hidden="true" className="h-3 w-3" /> info@stbcybersecurity.com
                </a>
              </li>
              <li>
                <a href="mailto:sales@stbcybersecurity.com" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2" data-testid="link-email-sales">
                  <Mail aria-hidden="true" className="h-3 w-3" /> sales@stbcybersecurity.com
                </a>
              </li>
              <li>
                <a href="mailto:support@stbcybersecurity.com" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2" data-testid="link-email-support">
                  <Mail aria-hidden="true" className="h-3 w-3" /> support@stbcybersecurity.com
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-white text-sm mb-3">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/tools" className="hover:text-primary transition-colors">Security Tools</a></li>
              <li><a href="/exploits" className="hover:text-primary transition-colors">CVE Database</a></li>
              <li><a href="/ransomware" className="hover:text-primary transition-colors">Ransomware Tracker</a></li>
              <li><a href="/threat-feeds" className="hover:text-primary transition-colors">Threat Feeds</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/5 mt-8 pt-6 pb-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <h4 className="font-bold text-white text-sm mb-1">Threat Intelligence Newsletter</h4>
              <p className="text-xs text-muted-foreground">Get weekly security digests, CVE alerts, and ransomware updates delivered to your inbox.</p>
            </div>
            <form onSubmit={handleNewsletterSubscribe} className="w-full md:w-auto space-y-2">
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
                    className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:border-orange-500/50 focus-visible:ring-1 focus-visible:ring-orange-500/30"
                    data-testid="input-newsletter-email"
                  />
                </div>
                <button
                  type="submit"
                  disabled={newsletterStatus === "loading" || !newsletterEmail || !newsletterConsent}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
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
                  <a href="/privacy" className="text-orange-400/70 hover:underline">Privacy Policy</a>
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

        <div className="border-t border-white/5 mt-4 pt-6 space-y-4">
          <div className="flex flex-wrap justify-center gap-6 text-[11px] text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Lock aria-hidden="true" className="h-3.5 w-3.5 text-green-500" />
              <span>SSL/TLS Encrypted</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CreditCard aria-hidden="true" className="h-3.5 w-3.5 text-green-500" />
              <span>Payments by Stripe</span>
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5 text-green-500" />
              <span>HTTPS Enforced</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Shield aria-hidden="true" className="h-3.5 w-3.5 text-green-500" />
              <span>Data Protected</span>
            </span>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {currentYear} STB Cybersecurity. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <a href="/about" className="hover:text-primary transition-colors">About</a>
              <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="/sms-terms" className="hover:text-primary transition-colors">SMS Terms</a>
              <a href="/api-docs" className="hover:text-primary transition-colors">API Documentation</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
