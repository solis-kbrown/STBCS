import { useState, useEffect, useRef, useCallback } from "react";
import { Mail, Globe, Shield, Phone, MessageSquare, Send, Loader2, CheckCircle, Lock, ShieldCheck, CreditCard, Award, Zap, Server, Users } from "lucide-react";

const socialLinks = [
  {
    name: "Twitter/X",
    href: "https://twitter.com/stbcybersecurity",
    testId: "link-social-twitter",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/company/stbcybersecurity",
    testId: "link-social-linkedin",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://facebook.com/stbcybersecurity",
    testId: "link-social-facebook",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://youtube.com/@stbcybersecurity",
    testId: "link-social-youtube",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: "GitHub",
    href: "https://github.com/stbcybersecurity",
    testId: "link-social-github",
    icon: (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
  },
];

function ConfettiParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    size: number; color: string; alpha: number; rotation: number; rotSpeed: number;
  }>>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.parentElement?.getBoundingClientRect();
    canvas.width = rect?.width || 300;
    canvas.height = rect?.height || 80;

    const colors = ["#22c55e", "#10b981", "#34d399", "#06b6d4", "#f59e0b", "#ef4444"];
    particlesRef.current = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width,
      y: canvas.height + 10,
      vx: (Math.random() - 0.5) * 4,
      vy: -(Math.random() * 4 + 2),
      size: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      particlesRef.current.forEach((p) => {
        if (p.alpha <= 0) return;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.alpha -= 0.015;
        p.rotation += p.rotSpeed;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });
      if (alive) animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10"
      style={{ width: "100%", height: "100%" }}
    />
  );
}

function AnimatedCheckmark({ delay = 0 }: { delay?: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <span
      className={`inline-flex items-center justify-center h-5 w-5 rounded-full transition-all duration-500 ${
        visible
          ? "bg-emerald-500/20 scale-100 opacity-100"
          : "bg-emerald-500/0 scale-50 opacity-0"
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CheckCircle
        className={`h-3.5 w-3.5 text-emerald-400 transition-all duration-300 ${
          visible ? "scale-100" : "scale-0"
        }`}
        style={{ filter: visible ? "drop-shadow(0 0 6px rgba(34, 197, 94, 0.5))" : "none" }}
      />
    </span>
  );
}

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const footerRef = useRef<HTMLElement>(null);
  const [scrollOffset, setScrollOffset] = useState(0);

  const handleScroll = useCallback(() => {
    if (!footerRef.current) return;
    const rect = footerRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    if (rect.top < windowHeight && rect.bottom > 0) {
      const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
      setScrollOffset(progress * 30);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

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

  const trustBadges = [
    { icon: Lock, label: "SSL/TLS Encrypted", color: "text-emerald-400" },
    { icon: CreditCard, label: "Payments by Stripe", color: "text-emerald-400" },
    { icon: ShieldCheck, label: "HTTPS Enforced", color: "text-emerald-400" },
    { icon: Shield, label: "Data Protected", color: "text-emerald-400" },
    { icon: Award, label: "SOC 2 Compliant", color: "text-emerald-400" },
  ];

  const partnerLogos = [
    { icon: Server, name: "Enterprise Ready" },
    { icon: Users, name: "500+ Clients" },
    { icon: Zap, name: "99.9% Uptime" },
    { icon: Shield, name: "24/7 SOC" },
  ];

  return (
    <footer ref={footerRef} className="relative mt-10 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 20% 100%, hsl(var(--primary) / 0.06) 0%, transparent 60%),
              radial-gradient(ellipse 60% 40% at 80% 80%, hsl(var(--secondary) / 0.04) 0%, transparent 60%),
              radial-gradient(ellipse 40% 30% at 50% 90%, hsl(var(--primary) / 0.03) 0%, transparent 50%)
            `,
            transform: `translateY(${-scrollOffset}px)`,
            transition: "transform 0.1s linear",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--primary) / 0.15) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.15) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            transform: `translateY(${-scrollOffset * 0.5}px)`,
          }}
        />
      </div>

      <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="relative bg-card/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/brand/icon-shield.png"
                  alt="STBCS"
                  className="h-10 w-10 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)] icon-float"
                />
                <span className="font-display font-bold text-lg text-primary tracking-wider">
                  STB Cybersecurity
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-5 max-w-md leading-relaxed">
                Your trusted partner in cybersecurity. We help small to medium-sized businesses stay ahead of threats with proactive security consulting and rapid incident response when it matters most.
              </p>

              <div className="relative bg-primary/10 border border-primary/30 rounded-lg p-4 mb-5 max-w-md overflow-hidden group hover:border-primary/50 transition-colors duration-300 glow-pulse emergency-banner">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="emergency-scan-line" />
                </div>
                <div className="absolute inset-0 rounded-lg border border-primary/20 emergency-border-pulse pointer-events-none" />
                <p className="relative text-xs text-primary font-bold mb-1.5 flex items-center gap-1.5 uppercase tracking-widest">
                  <Phone aria-hidden="true" className="h-3 w-3 animate-pulse" /> Emergency Hotline
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
                <li><a href="/exploits" className="link-underline inline-flex items-center gap-1 hover:text-primary transition-all duration-200" data-testid="link-footer-cves">CVE Database</a></li>
                <li><a href="/ransomware" className="link-underline inline-flex items-center gap-1 hover:text-primary transition-all duration-200" data-testid="link-footer-ransomware">Ransomware Tracker</a></li>
                <li><a href="/groups" className="link-underline inline-flex items-center gap-1 hover:text-primary transition-all duration-200" data-testid="link-footer-groups">Threat Actors</a></li>
                <li><a href="/breaches" className="link-underline inline-flex items-center gap-1 hover:text-primary transition-all duration-200" data-testid="link-footer-breaches">Breach Database</a></li>
                <li><a href="/ics-advisories" className="link-underline inline-flex items-center gap-1 hover:text-primary transition-all duration-200" data-testid="link-footer-ics">ICS-CERT Advisories</a></li>
                <li><a href="/intel" className="link-underline inline-flex items-center gap-1 hover:text-primary transition-all duration-200" data-testid="link-footer-intel">Intel & Feeds</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-display font-bold text-white text-sm mb-4 tracking-wider uppercase">Tools & Services</h4>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li><a href="/tools" className="link-underline inline-flex items-center gap-1 hover:text-primary transition-all duration-200" data-testid="link-footer-tools">Security Tools</a></li>
                <li><a href="/search" className="link-underline inline-flex items-center gap-1 hover:text-primary transition-all duration-200" data-testid="link-footer-search">Search & IOC Lookup</a></li>
                <li><a href="/risk-score" className="link-underline inline-flex items-center gap-1 hover:text-primary transition-all duration-200" data-testid="link-footer-risk">Cyber Risk Score</a></li>
                <li><a href="/monitors" className="link-underline inline-flex items-center gap-1 hover:text-primary transition-all duration-200" data-testid="link-footer-monitors">Monitoring & Alerts</a></li>
                <li><a href="/api-docs" className="link-underline inline-flex items-center gap-1 hover:text-primary transition-all duration-200" data-testid="link-footer-api">API Documentation</a></li>
                <li><a href="/stb-sync" className="link-underline inline-flex items-center gap-1 hover:text-primary transition-all duration-200" data-testid="link-footer-stb-sync">STB-Sync Block Lists</a></li>
                <li><a href="/pricing" className="link-underline inline-flex items-center gap-1 hover:text-primary transition-all duration-200" data-testid="link-footer-pricing">Plans & Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-display font-bold text-white text-sm mb-4 tracking-wider uppercase">Contact</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href="tel:+18557821987" className="link-underline text-muted-foreground hover:text-primary flex items-center gap-2 transition-all duration-200" data-testid="link-call-footer">
                    <Phone aria-hidden="true" className="h-3 w-3 shrink-0" /> (855) STB-1987
                  </a>
                </li>
                <li>
                  <a href="sms:+18557821987" className="link-underline text-muted-foreground hover:text-primary flex items-center gap-2 transition-all duration-200" data-testid="link-sms-footer">
                    <MessageSquare aria-hidden="true" className="h-3 w-3 shrink-0" /> Text Us
                  </a>
                </li>
                <li>
                  <a href="/contact?category=general" className="link-underline text-muted-foreground hover:text-primary flex items-center gap-2 transition-all duration-200" data-testid="link-email-info">
                    <Mail aria-hidden="true" className="h-3 w-3 shrink-0" /> General Inquiries
                  </a>
                </li>
                <li>
                  <a href="/contact?category=sales" className="link-underline text-muted-foreground hover:text-primary flex items-center gap-2 transition-all duration-200" data-testid="link-email-sales">
                    <Mail aria-hidden="true" className="h-3 w-3 shrink-0" /> Sales & Pricing
                  </a>
                </li>
                <li>
                  <a href="/contact?category=support" className="link-underline text-muted-foreground hover:text-primary flex items-center gap-2 transition-all duration-200" data-testid="link-email-support">
                    <Mail aria-hidden="true" className="h-3 w-3 shrink-0" /> Technical Support
                  </a>
                </li>
                <li className="pt-2">
                  <a href="/contact" className="text-primary hover:text-orange-300 font-medium flex items-center gap-2 hover:translate-x-1 transition-all duration-200" data-testid="link-footer-contact-page">
                    <Send aria-hidden="true" className="h-3 w-3 shrink-0" /> Contact Form
                  </a>
                </li>
                <li>
                  <a href="/about" className="link-underline text-muted-foreground hover:text-primary flex items-center gap-2 transition-all duration-200" data-testid="link-footer-about">
                    <Shield aria-hidden="true" className="h-3 w-3 shrink-0" /> About Us
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="relative mt-10 pt-8">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="relative glass-panel rounded-xl p-6 border border-white/[0.06]">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/[0.03] via-transparent to-secondary/[0.02] pointer-events-none" />
              <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex-1">
                  <h4 className="font-display font-bold text-white text-sm mb-1.5 tracking-wider uppercase flex items-center gap-2">
                    <Mail aria-hidden="true" className="h-4 w-4 text-primary" />
                    Threat Intelligence Newsletter
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">Get weekly security digests, CVE alerts, and ransomware updates delivered to your inbox.</p>
                </div>
                <form onSubmit={handleNewsletterSubscribe} className="relative w-full md:w-auto space-y-2.5">
                  {newsletterStatus === "success" && <ConfettiParticles />}
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
                        className="w-full pl-9 pr-3 py-2.5 bg-zinc-900/80 border border-zinc-700/50 rounded-lg text-sm text-white placeholder:text-zinc-500 focus-visible:outline-none focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:shadow-[0_0_16px_-4px_hsl(var(--primary)/0.25)] transition-all duration-300"
                        data-testid="input-newsletter-email"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={newsletterStatus === "loading" || !newsletterEmail || !newsletterConsent}
                      className="px-5 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] btn-press"
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
          </div>

          <div className="relative mt-8 pt-6">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="mb-6">
              <p className="text-center text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-display mb-4">
                Trusted by Security Teams Worldwide
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                {partnerLogos.map(({ icon: Icon, name }) => (
                  <div
                    key={name}
                    className="flex items-center gap-2.5 px-5 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.1] hover:bg-white/[0.04] transition-all duration-300 group"
                    data-testid={`trust-partner-${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                  >
                    <Icon className="h-4 w-4 text-zinc-500 group-hover:text-primary transition-colors duration-300" />
                    <span className="text-xs text-zinc-400 font-medium group-hover:text-zinc-300 transition-colors duration-300">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative mt-4 pt-6 space-y-5">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
              {trustBadges.map(({ icon: Icon, label, color }, i) => (
                <span
                  key={label}
                  className="group flex items-center gap-2 text-[11px] text-zinc-400 bg-white/[0.02] border border-white/[0.04] rounded-full px-3.5 py-1.5 hover:border-emerald-500/20 hover:bg-emerald-500/[0.03] transition-all duration-300"
                  data-testid={`trust-badge-${label.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                >
                  <AnimatedCheckmark delay={i * 150} />
                  <Icon aria-hidden="true" className={`h-3.5 w-3.5 ${color} group-hover:drop-shadow-[0_0_6px_rgba(34,197,94,0.4)] transition-all duration-300`} />
                  <span>{label}</span>
                </span>
              ))}
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-2">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <p className="text-xs text-muted-foreground">
                  &copy; {currentYear} STB Cybersecurity. All rights reserved.
                </p>
                <div className="flex items-center gap-1">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Follow us on ${social.name}`}
                      data-testid={social.testId}
                      className="group relative p-2 rounded-lg text-zinc-500 hover:text-orange-400 transition-all duration-300 hover:bg-white/[0.04]"
                    >
                      <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-orange-500/[0.06] to-transparent pointer-events-none" />
                      <span className="relative block group-hover:drop-shadow-[0_0_8px_rgba(251,146,60,0.5)] transition-all duration-300 group-hover:scale-110">
                        {social.icon}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <a href="/about" className="link-underline hover:text-primary transition-colors duration-200">About</a>
                <a href="/contact" className="link-underline hover:text-primary transition-colors duration-200">Contact</a>
                <a href="/pricing" className="link-underline hover:text-primary transition-colors duration-200">Pricing</a>
                <a href="/api-docs" className="link-underline hover:text-primary transition-colors duration-200">API</a>
                <span className="text-zinc-700">|</span>
                <a href="/privacy" className="link-underline hover:text-primary transition-colors duration-200">Privacy Policy</a>
                <a href="/terms" className="link-underline hover:text-primary transition-colors duration-200">Terms of Service</a>
                <a href="/sms-terms" className="link-underline hover:text-primary transition-colors duration-200">SMS Terms</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
