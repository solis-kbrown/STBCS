import { useState, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useDocumentTitle } from "@/lib/use-document-title";
import AnimatedSection from "@/components/animated-section";
import { AuthModal } from "@/components/auth-modal";
import Layout from "@/components/layout";
import Footer from "@/components/footer";
import RelatedResources, { getRelatedLinks } from "@/components/related-resources";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Check, X, Minus, Crown, Coffee, Rocket, Building2, Shield, Zap,
  CreditCard, Lock, ArrowRight, Users, Eye, Wrench,
  FileText, Network, Terminal, MonitorCheck, ChevronDown,
  ChevronUp, HelpCircle, MessageSquare, ScanSearch
} from "lucide-react";

const FREE_FEATURES = {
  icon: Shield,
  name: "Free",
  tagline: "Essential security tools for everyone",
  monthlyPrice: "$0",
  monthlyOriginal: null,
  yearlyPrice: "$0",
  yearlyOriginal: null,
  discount: null,
  color: "from-zinc-800/50 to-zinc-900/50",
  borderColor: "border-zinc-500",
  accentColor: "text-zinc-400",
  buttonClass: "border-zinc-500 text-zinc-300 hover:bg-zinc-800",
  buttonVariant: "outline" as const,
  cta: "Get Started Free",
  stripeName: null,
};

const PAID_TIERS = [
  {
    icon: Coffee,
    name: "Supporter",
    tagline: "Back our mission and unlock monitoring",
    monthlyPrice: "$14.99",
    monthlyOriginal: null,
    yearlyPrice: "$149.90",
    yearlyOriginal: null,
    discount: null,
    color: "from-zinc-800/50 to-zinc-900/50",
    borderColor: "border-zinc-500",
    accentColor: "text-blue-400",
    buttonClass: "border-zinc-500 text-zinc-300 hover:bg-zinc-800",
    buttonVariant: "outline" as const,
    cta: "Start Supporter Plan",
    stripeName: "Supporter",
  },
  {
    icon: Rocket,
    name: "Pro",
    tagline: "Full threat intelligence for security professionals",
    monthlyPrice: "$49.99",
    monthlyOriginal: null,
    yearlyPrice: "$499.90",
    yearlyOriginal: null,
    discount: null,
    popular: true,
    color: "from-orange-500/20 to-orange-600/10",
    borderColor: "border-orange-500/50",
    accentColor: "text-orange-400",
    buttonClass: "bg-orange-500 hover:bg-orange-600 text-white",
    buttonVariant: "default" as const,
    cta: "Start Pro Plan",
    stripeName: "Pro",
  },
  {
    icon: Building2,
    name: "Business",
    tagline: "Enterprise-grade security for teams and MSPs",
    monthlyPrice: "$199.99",
    monthlyOriginal: null,
    yearlyPrice: "$1,999.90",
    yearlyOriginal: null,
    discount: null,
    color: "from-purple-500/10 to-zinc-900/50",
    borderColor: "border-purple-500/30",
    accentColor: "text-purple-400",
    buttonClass: "border-purple-500/50 text-purple-300 hover:bg-purple-500/20",
    buttonVariant: "outline" as const,
    cta: "Start Business Plan",
    stripeName: "Business",
  },
  {
    icon: Crown,
    name: "Unlimited",
    tagline: "No limits, no restrictions, full platform access",
    monthlyPrice: "$499.99",
    monthlyOriginal: null,
    yearlyPrice: "$4,999.90",
    yearlyOriginal: null,
    discount: null,
    color: "from-yellow-500/10 to-amber-600/5",
    borderColor: "border-yellow-500/40",
    accentColor: "text-yellow-400",
    buttonClass: "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black font-bold",
    buttonVariant: "default" as const,
    cta: "Go Unlimited",
    stripeName: "Unlimited Everything",
  },
];

type FeatureValue = boolean | string | number;

interface FeatureRow {
  label: string;
  tooltip?: string;
  free: FeatureValue;
  supporter: FeatureValue;
  pro: FeatureValue;
  business: FeatureValue;
  unlimited: FeatureValue;
}

interface StripePrice {
  id: string;
  recurring?: { interval: string };
}

interface StripeProduct {
  name?: string;
  prices?: StripePrice[];
}

interface FeatureCategory {
  name: string;
  icon: typeof Shield;
  rows: FeatureRow[];
}

const FEATURE_CATEGORIES: FeatureCategory[] = [
  {
    name: "Threat Intelligence",
    icon: Eye,
    rows: [
      { label: "Real-time threat dashboard", free: true, supporter: true, pro: true, business: true, unlimited: true },
      { label: "160+ threat intelligence feeds", free: true, supporter: true, pro: true, business: true, unlimited: true },
      { label: "Ransomware group tracker", free: true, supporter: true, pro: true, business: true, unlimited: true },
      { label: "CVE & exploit database", free: true, supporter: true, pro: true, business: true, unlimited: true },
      { label: "Data breach database", free: true, supporter: true, pro: true, business: true, unlimited: true },
      { label: "ICS-CERT advisories", free: true, supporter: true, pro: true, business: true, unlimited: true },
      { label: "Threat actor profiles", free: true, supporter: true, pro: true, business: true, unlimited: true },
      { label: "Incident response playbooks", free: true, supporter: true, pro: true, business: true, unlimited: true },
      { label: "Cyber risk score calculator", free: true, supporter: true, pro: true, business: true, unlimited: true },
      { label: "Custom watchlists & alerts", tooltip: "Track specific CVEs, threat actors, and companies", free: false, supporter: false, pro: true, business: true, unlimited: true },
      { label: "Custom threat feeds by industry", free: false, supporter: false, pro: false, business: true, unlimited: true },
      { label: "Executive threat briefings", tooltip: "Quarterly calls with our analysts", free: false, supporter: false, pro: false, business: false, unlimited: "Quarterly" },
    ],
  },
  {
    name: "Security Tools",
    icon: Wrench,
    rows: [
      { label: "IP & Domain WHOIS lookup", free: true, supporter: true, pro: true, business: true, unlimited: true },
      { label: "Port scanner", free: true, supporter: true, pro: true, business: true, unlimited: true },
      { label: "Threat database check", free: true, supporter: true, pro: true, business: true, unlimited: true },
      { label: "Password strength checker", free: true, supporter: true, pro: true, business: true, unlimited: true },
      { label: "Hash analyzer", free: true, supporter: true, pro: true, business: true, unlimited: true },
      { label: "Subnet/CIDR calculator", free: true, supporter: true, pro: true, business: true, unlimited: true },
      { label: "Base64/URL encoder-decoder", free: true, supporter: true, pro: true, business: true, unlimited: true },
      { label: "HTTP security headers scanner", free: true, supporter: true, pro: true, business: true, unlimited: true },
      { label: "Tool usage rate limit", tooltip: "Requests per minute for security tools", free: "10/min", supporter: "60/min", pro: "60/min", business: "120/min", unlimited: "120/min" },
    ],
  },
  {
    name: "Advanced Pro Tools",
    icon: ScanSearch,
    rows: [
      { label: "Email header analyzer", tooltip: "Deep inspection of email headers for spoofing and routing", free: false, supporter: true, pro: true, business: true, unlimited: true },
      { label: "SSL certificate checker", tooltip: "Full chain analysis with expiration and vulnerability checks", free: false, supporter: true, pro: true, business: true, unlimited: true },
      { label: "Web fingerprinting", tooltip: "Identify server software, frameworks, and technologies", free: false, supporter: true, pro: true, business: true, unlimited: true },
      { label: "DNS security analyzer", tooltip: "Check DMARC, SPF, DKIM, DNSSEC, and DNS misconfigurations", free: false, supporter: true, pro: true, business: true, unlimited: true },
      { label: "Exchange server checker", tooltip: "Identify vulnerable and misconfigured Exchange servers", free: false, supporter: true, pro: true, business: true, unlimited: true },
      { label: "Nmap port scanner", tooltip: "Advanced network scanning with service detection", free: false, supporter: true, pro: true, business: true, unlimited: true },
      { label: "File scanner", tooltip: "Upload and scan files against threat intelligence databases", free: false, supporter: true, pro: true, business: true, unlimited: true },
      { label: "Breach credential check", tooltip: "Check if emails or domains appear in known breaches", free: false, supporter: true, pro: true, business: true, unlimited: true },
      { label: "Telnet client", free: false, supporter: true, pro: true, business: true, unlimited: true },
      { label: "Attack surface discovery", tooltip: "Map exposed assets, subdomains, and open ports for any domain", free: false, supporter: true, pro: true, business: true, unlimited: true },
    ],
  },
  {
    name: "Business-Grade Tools",
    icon: Terminal,
    rows: [
      { label: "SFTP file transfer client", free: false, supporter: false, pro: false, business: true, unlimited: true },
      { label: "SSH terminal", free: false, supporter: false, pro: false, business: true, unlimited: true },
      { label: "Remote desktop (RDP)", free: false, supporter: false, pro: false, business: true, unlimited: true },
      { label: "Two-way SMS messaging", tooltip: "Send and receive business text messages through the platform", free: false, supporter: false, pro: false, business: true, unlimited: true },
    ],
  },
  {
    name: "Monitoring & Alerts",
    icon: MonitorCheck,
    rows: [
      { label: "Uptime monitors", tooltip: "HTTP, HTTPS, and TCP endpoint monitoring with response time tracking", free: "0", supporter: "5", pro: "5", business: "25", unlimited: "Unlimited" },
      { label: "Dark web monitors", tooltip: "Monitor dark web sources for mentions of your domains or emails", free: "0", supporter: "5", pro: "5", business: "25", unlimited: "Unlimited" },
      { label: "Dark web intel sources", free: "0", supporter: "5", pro: "5", business: "12", unlimited: "All" },
      { label: "SSL certificate expiration tracking", free: false, supporter: true, pro: true, business: true, unlimited: true },
      { label: "Email alerts", free: false, supporter: true, pro: true, business: true, unlimited: true },
      { label: "SMS alerts", tooltip: "Real-time text message notifications for critical incidents", free: false, supporter: false, pro: false, business: true, unlimited: true },
      { label: "Slack/Teams integration", tooltip: "Push alerts directly to your team channels", free: false, supporter: false, pro: false, business: false, unlimited: true },
      { label: "30-day response time history", free: false, supporter: true, pro: true, business: true, unlimited: true },
      { label: "Service status dashboard", tooltip: "Monitor 37+ services across 8 infrastructure categories", free: true, supporter: true, pro: true, business: true, unlimited: true },
    ],
  },
  {
    name: "Exports & Reports",
    icon: FileText,
    rows: [
      { label: "CSV export", free: false, supporter: true, pro: true, business: true, unlimited: true },
      { label: "JSON export", free: false, supporter: true, pro: true, business: true, unlimited: true },
      { label: "STIX format export", tooltip: "Structured Threat Information Expression — industry standard", free: false, supporter: true, pro: true, business: true, unlimited: true },
      { label: "On-demand threat reports", tooltip: "Generate executive summary reports with threat analysis", free: false, supporter: false, pro: true, business: true, unlimited: true },
      { label: "Automated scheduled reports", tooltip: "Weekly and monthly reports delivered automatically", free: false, supporter: false, pro: false, business: true, unlimited: true },
      { label: "White-label reports", tooltip: "Custom-branded reports with your company logo", free: false, supporter: false, pro: false, business: false, unlimited: true },
      { label: "Report generation limit", free: "0", supporter: "0", pro: "10/mo", business: "50/mo", unlimited: "Unlimited" },
    ],
  },
  {
    name: "API Access",
    icon: Network,
    rows: [
      { label: "REST API access", free: false, supporter: false, pro: true, business: true, unlimited: true },
      { label: "API keys", free: "0", supporter: "0", pro: "1", business: "5", unlimited: "10" },
      { label: "Daily API calls", free: "0", supporter: "0", pro: "1,000", business: "10,000", unlimited: "100,000" },
      { label: "Rate limit (req/min)", free: "—", supporter: "—", pro: "60", business: "120", unlimited: "300" },
      { label: "Live threat lookups/day", tooltip: "Real-time queries against live threat intelligence sources", free: "0", supporter: "0", pro: "50", business: "200", unlimited: "1,000" },
    ],
  },
  {
    name: "Knowledge Base & Community",
    icon: MessageSquare,
    rows: [
      { label: "Read published articles", free: true, supporter: true, pro: true, business: true, unlimited: true },
      { label: "Submit posts & articles", tooltip: "Paid members can contribute to the community knowledge base", free: false, supporter: true, pro: true, business: true, unlimited: true },
      { label: "Comment & discuss", free: false, supporter: true, pro: true, business: true, unlimited: true },
      { label: "Vote on content", free: false, supporter: true, pro: true, business: true, unlimited: true },
      { label: "Earn reputation & ranks", tooltip: "Recruit → Analyst → Specialist → Expert → Elite → Legend", free: false, supporter: true, pro: true, business: true, unlimited: true },
      { label: "Trusted contributor status", tooltip: "Posts bypass moderation after earning community trust", free: false, supporter: "Earn via votes", pro: "Earn via votes", business: "Earn via votes", unlimited: "Earn via votes" },
    ],
  },
  {
    name: "Support & Account",
    icon: Users,
    rows: [
      { label: "Community support", free: true, supporter: true, pro: true, business: true, unlimited: true },
      { label: "Email support", free: false, supporter: true, pro: true, business: true, unlimited: true },
      { label: "Priority email support", free: false, supporter: false, pro: true, business: true, unlimited: true },
      { label: "Dedicated account manager", free: false, supporter: false, pro: false, business: true, unlimited: true },
      { label: "SLA guarantees", tooltip: "Contractual uptime and response time commitments", free: false, supporter: false, pro: false, business: true, unlimited: true },
      { label: "On-call incident support", tooltip: "Direct line to our team during active security incidents", free: false, supporter: false, pro: false, business: true, unlimited: true },
      { label: "Team accounts & shared watchlists", free: false, supporter: false, pro: false, business: true, unlimited: true },
      { label: "Priority incident response queue", free: false, supporter: false, pro: false, business: false, unlimited: true },
      { label: "Early access to new features", free: false, supporter: true, pro: true, business: true, unlimited: true },
      { label: "Supporters wall recognition", free: false, supporter: true, pro: true, business: true, unlimited: true },
    ],
  },
];

const FAQ_ITEMS = [
  {
    q: "Can I upgrade or downgrade my plan at any time?",
    a: "Yes. You can upgrade or downgrade through your account settings at any time. When you upgrade, you'll get immediate access to the new features and only pay the prorated difference. When you downgrade, the change takes effect at the end of your current billing period.",
  },
  {
    q: "What happens to my monitors if I downgrade?",
    a: "Your monitors remain configured but will pause if they exceed your new plan's limit. If you upgrade again, they'll resume automatically. We never delete your monitoring data.",
  },
  {
    q: "Is there a free trial?",
    a: "We don't offer traditional free trials because our Free tier already gives you access to 20+ security tools, the full threat intelligence dashboard, and 160+ data feeds — permanently, no credit card required. Upgrade when you're ready for monitoring, exports, and advanced tools.",
  },
  {
    q: "How does annual billing work?",
    a: "Annual billing saves you the equivalent of 2 months compared to monthly billing. You pay once for the full year upfront, and your plan renews annually. You can switch between monthly and annual billing through the Stripe billing portal.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. There are no long-term contracts. Cancel through your account settings and you'll retain access until the end of your current billing period. No cancellation fees, no hassle.",
  },
  {
    q: "Is my payment information secure?",
    a: "All payments are processed by Stripe, a PCI DSS Level 1 certified payment processor. Your card details never touch our servers. We only store a Stripe customer ID to manage your subscription.",
  },
  {
    q: "Do you offer discounts for nonprofits or educational institutions?",
    a: "Yes. Contact our team at info@stbcybersecurity.com with details about your organization. We offer special pricing for verified nonprofits, educational institutions, and government agencies.",
  },
  {
    q: "Do you offer volume or team discounts?",
    a: "Yes. Contact our sales team for custom pricing on multi-seat deployments, MSP partnerships, and enterprise agreements. We also offer special pricing for verified nonprofits, educational institutions, and government agencies.",
  },
];


function FeatureCell({ value }: { value: FeatureValue }) {
  if (value === true) return <Check className="h-5 w-5 text-green-400 mx-auto" aria-label="Included" />;
  if (value === false) return <X className="h-4 w-4 text-zinc-600 mx-auto" aria-label="Not included" />;
  if (value === "0" || value === "—") return <Minus className="h-4 w-4 text-zinc-600 mx-auto" aria-label="Not available" />;
  return <span className="text-sm font-medium text-zinc-200">{value}</span>;
}

export default function PricingPage() {
  useDocumentTitle(
    "Plans & Pricing | STB Cybersecurity — Threat Intelligence for Every Budget",
    "Compare Free, Supporter, Pro, Business, and Unlimited plans. Uptime monitoring, dark web scans, API access, advanced security tools, and more."
  );
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isPro, isBusiness, isUnlimited } = useAuth();

  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(FEATURE_CATEGORIES.map(c => c.name)));
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const { data: productsData } = useQuery({
    queryKey: ["stripe-products"],
    queryFn: async () => {
      const res = await fetch("/api/stripe/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });

  const toggleCategory = (name: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const currentTierIndex = (() => {
    if (!user) return -1;
    const t = user.tier;
    if (t === "unlimited") return 4;
    if (t === "business" || t === "enterprise") return 3;
    if (t === "pro") return 2;
    if (t === "supporter") return 1;
    return 0;
  })();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const pendingCheckoutRef = useRef<string | null>(null);

  const openSignupForFree = useCallback(() => {
    pendingCheckoutRef.current = null;
    setShowAuthModal(true);
  }, []);

  const openSignupForPlan = useCallback((checkoutUrl: string) => {
    pendingCheckoutRef.current = checkoutUrl;
    setShowAuthModal(true);
  }, []);

  const handleAuthSuccess = useCallback(() => {
    const pending = pendingCheckoutRef.current;
    pendingCheckoutRef.current = null;
    if (pending) {
      navigate(pending);
    }
  }, [navigate]);

  const handleSelectPlan = (tier: typeof PAID_TIERS[0]) => {
    if (!isAuthenticated) {
      const products = productsData?.products || [];
      const product = products.find((p: StripeProduct) => p.name?.includes(tier.stripeName));
      if (product) {
        const matchedPrice = product?.prices?.find((p: StripePrice) => p.recurring?.interval === billingInterval);
        const price = matchedPrice || product?.prices?.[0];
        if (price?.id) {
          openSignupForPlan(`/checkout?type=subscription&priceId=${encodeURIComponent(price.id)}&tier=${encodeURIComponent(tier.stripeName!)}`);
          return;
        }
      }
      openSignupForFree();
      return;
    }

    if (currentTierIndex > 0 && user?.tier !== "free") {
      fetch("/api/stripe/portal", { method: "POST", credentials: "include" })
        .then(r => r.json())
        .then(data => { if (data.url) window.location.href = data.url; })
        .catch(() => toast({ title: "Error", description: "Failed to open billing portal. Please try again.", variant: "destructive" }));
      return;
    }

    const products = productsData?.products || [];
    const product = products.find((p: StripeProduct) => p.name?.includes(tier.stripeName));
    if (!product) {
      toast({ title: "Plan not found", description: "Please try again or visit our support page.", variant: "destructive" });
      return;
    }
    const matchedPrice = product?.prices?.find((p: StripePrice) => p.recurring?.interval === billingInterval);
    const price = matchedPrice || product?.prices?.[0];
    if (!price?.id) {
      toast({ title: "Price not available", description: "Please refresh and try again.", variant: "destructive" });
      return;
    }
    navigate(`/checkout?type=subscription&priceId=${encodeURIComponent(price.id)}&tier=${encodeURIComponent(tier.stripeName!)}`);
  };

  const getTierButtonLabel = (tierIdx: number, tierName: string) => {
    if (!isAuthenticated) return tierName === "Free" ? "Sign Up Free" : `Start ${tierName} Plan`;
    if (tierIdx === currentTierIndex) return "Current Plan";
    if (currentTierIndex > 0 && tierIdx > 0 && tierIdx !== currentTierIndex) return tierIdx > currentTierIndex ? "Upgrade" : "Downgrade";
    if (tierIdx === 0) return "Current Plan";
    return `Start ${tierName} Plan`;
  };

  const allTiers = [FREE_FEATURES, ...PAID_TIERS];

  return (
    <Layout>
      <div className="space-y-12 page-transition pb-12">

        <AnimatedSection animation="fade-down">
          <div className="text-center space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-white" data-testid="text-pricing-title">
              Security Intelligence Built for Your Budget
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed max-w-3xl mx-auto">
              From free threat feeds to unlimited enterprise coverage. Every plan includes access to our real-time threat intelligence dashboard and 160+ data feeds. Upgrade when you need monitoring, exports, and advanced tools.
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fade-up">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setBillingInterval("month")}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors ${billingInterval === "month" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
              data-testid="toggle-monthly"
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval("year")}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors relative ${billingInterval === "year" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
              data-testid="toggle-annual"
            >
              Annual
              <Badge className="absolute -top-2.5 -right-16 bg-green-500 text-white text-[10px] px-1.5 py-0.5 whitespace-nowrap">
                Save 2 months
              </Badge>
            </button>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {allTiers.map((tier, idx) => {
            const displayPrice = billingInterval === "month" ? tier.monthlyPrice : tier.yearlyPrice;
            const displayOriginal = billingInterval === "month" ? tier.monthlyOriginal : tier.yearlyOriginal;
            const intervalLabel = billingInterval === "month" ? "mo" : "yr";
            const isCurrentPlan = isAuthenticated && idx === currentTierIndex;
            const isPopular = 'popular' in tier && tier.popular;
            const isUnlimitedTier = tier.name === "Unlimited";

            return (
              <AnimatedSection key={tier.name} animation="fade-up" stagger={Math.min(idx + 1, 3) as 1 | 2 | 3}>
                <Card className={`relative bg-gradient-to-b ${tier.color} ${tier.borderColor} ${isPopular ? 'ring-2 ring-orange-500 glow-pulse' : ''} ${isUnlimitedTier ? 'ring-2 ring-yellow-500/70' : ''} ${isCurrentPlan ? 'ring-2 ring-green-500/70' : ''} card-interactive h-full flex flex-col`}>
                  {isPopular && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white z-10" data-testid="badge-popular">
                      Most Popular
                    </Badge>
                  )}
                  {isCurrentPlan && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white z-10" data-testid="badge-current">
                      Your Plan
                    </Badge>
                  )}
                  <CardHeader className="text-center pb-2 pt-6">
                    <tier.icon className={`h-10 w-10 mx-auto mb-2 ${tier.accentColor}`} aria-hidden="true" />
                    <CardTitle className="text-lg text-white">{tier.name}</CardTitle>
                    <div className="mt-2">
                      <span className={`text-2xl font-bold ${isUnlimitedTier ? 'text-yellow-400' : tier.name === "Free" ? 'text-green-400' : 'text-white'}`}>
                        {displayPrice}
                      </span>
                      {tier.name !== "Free" && <span className="text-zinc-500 text-sm">/{intervalLabel}</span>}
                    </div>
                    {billingInterval === "year" && tier.name !== "Free" && (
                      <span className="text-xs text-green-400 mt-1 block">2 months free vs monthly</span>
                    )}
                    <CardDescription className="mt-2 text-zinc-400 text-xs">{tier.tagline}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 mt-auto">
                    <Button
                      className={`w-full font-semibold ${isCurrentPlan ? 'bg-green-500/20 text-green-400 border-green-500/50 cursor-default' : tier.buttonClass}`}
                      variant={isCurrentPlan ? "outline" : tier.buttonVariant}
                      onClick={() => {
                        if (isCurrentPlan) return;
                        if (tier.name === "Free") {
                          if (!isAuthenticated) { openSignupForFree(); } else { navigate("/account"); }
                          return;
                        }
                        handleSelectPlan(tier as typeof PAID_TIERS[0]);
                      }}
                      disabled={isCurrentPlan}
                      data-testid={`button-select-${tier.name.toLowerCase()}`}
                    >
                      {isCurrentPlan ? (
                        <><Check className="h-4 w-4 mr-1" /> Current Plan</>
                      ) : (
                        <><CreditCard className="h-4 w-4 mr-1" /> {getTierButtonLabel(idx, tier.name)}</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </AnimatedSection>
            );
          })}
        </div>

        {isAuthenticated && currentTierIndex > 0 && (
          <AnimatedSection animation="fade-up">
            <div className="text-center">
              <p className="text-sm text-zinc-400 mb-2">Want to change your plan?</p>
              <Button
                variant="outline"
                className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                onClick={() => {
                  fetch("/api/stripe/portal", { method: "POST", credentials: "include" })
                    .then(r => r.json())
                    .then(data => { if (data.url) window.location.href = data.url; })
                    .catch(() => toast({ title: "Error", description: "Failed to open billing portal.", variant: "destructive" }));
                }}
                data-testid="button-manage-subscription"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Manage Subscription via Stripe
              </Button>
            </div>
          </AnimatedSection>
        )}

        <AnimatedSection animation="fade-up">
          <div className="space-y-2">
            <h2 className="text-3xl font-display font-bold text-white text-center" data-testid="text-comparison-title">
              Complete Feature Comparison
            </h2>
            <p className="text-zinc-400 text-center max-w-2xl mx-auto">
              Every feature, every limit, every tier — side by side. No hidden costs, no surprise restrictions.
            </p>
          </div>
        </AnimatedSection>

        <div className="overflow-x-auto -mx-4 px-4">
          <div className="min-w-[800px]">
            <div className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800 rounded-t-lg">
              <div className="grid grid-cols-[minmax(220px,2fr)_repeat(5,1fr)] items-center py-3 px-4">
                <div className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Feature</div>
                {allTiers.map(tier => (
                  <div key={tier.name} className="text-center">
                    <span className={`text-sm font-bold ${tier.accentColor}`}>{tier.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {FEATURE_CATEGORIES.map((category) => {
              const isExpanded = expandedCategories.has(category.name);
              return (
                <div key={category.name} className="border-b border-zinc-800/50">
                  <button
                    onClick={() => toggleCategory(category.name)}
                    aria-expanded={isExpanded}
                    className="w-full grid grid-cols-[minmax(220px,2fr)_repeat(5,1fr)] items-center py-3 px-4 bg-zinc-900/50 hover:bg-zinc-900/80 transition-colors cursor-pointer"
                    data-testid={`toggle-category-${category.name.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <div className="flex items-center gap-2 text-left">
                      <category.icon className="h-4 w-4 text-orange-400 shrink-0" aria-hidden="true" />
                      <span className="text-sm font-bold text-white">{category.name}</span>
                      <span className="text-xs text-zinc-500">({category.rows.length})</span>
                      {isExpanded ? <ChevronUp className="h-3.5 w-3.5 text-zinc-500" /> : <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />}
                    </div>
                    <div className="col-span-5" />
                  </button>

                  {isExpanded && category.rows.map((row, ri) => (
                    <div
                      key={ri}
                      className={`grid grid-cols-[minmax(220px,2fr)_repeat(5,1fr)] items-center py-2.5 px-4 ${ri % 2 === 0 ? 'bg-zinc-950/30' : 'bg-zinc-900/20'} hover:bg-zinc-800/30 transition-colors`}
                      data-testid={`row-feature-${row.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-zinc-300">{row.label}</span>
                        {row.tooltip && (
                          <span className="group relative">
                            <HelpCircle className="h-3.5 w-3.5 text-zinc-600 cursor-help" />
                            <span className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300 w-56 text-center opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity shadow-xl">
                              {row.tooltip}
                            </span>
                          </span>
                        )}
                      </div>
                      <div className="text-center"><FeatureCell value={row.free} /></div>
                      <div className="text-center"><FeatureCell value={row.supporter} /></div>
                      <div className="text-center"><FeatureCell value={row.pro} /></div>
                      <div className="text-center"><FeatureCell value={row.business} /></div>
                      <div className="text-center"><FeatureCell value={row.unlimited} /></div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        <AnimatedSection animation="fade-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-zinc-900/50 border-zinc-800 card-interactive">
              <CardContent className="pt-6 text-center space-y-3">
                <Shield className="h-10 w-10 mx-auto text-orange-400" aria-hidden="true" />
                <h3 className="font-bold text-white">No Credit Card for Free Tier</h3>
                <p className="text-sm text-zinc-400">
                  Sign up and start using 20+ security tools, the threat dashboard, and all 160+ data feeds immediately. No payment info required.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900/50 border-zinc-800 card-interactive">
              <CardContent className="pt-6 text-center space-y-3">
                <Zap className="h-10 w-10 mx-auto text-yellow-400" aria-hidden="true" />
                <h3 className="font-bold text-white">Instant Upgrade, Instant Access</h3>
                <p className="text-sm text-zinc-400">
                  Upgrade from any plan and your new features activate immediately. Billing is prorated automatically — you only pay the difference.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900/50 border-zinc-800 card-interactive">
              <CardContent className="pt-6 text-center space-y-3">
                <Lock className="h-10 w-10 mx-auto text-green-400" aria-hidden="true" />
                <h3 className="font-bold text-white">Cancel Anytime, Keep Your Data</h3>
                <p className="text-sm text-zinc-400">
                  No contracts, no cancellation fees. Your data and configurations stay safe. Reactivate any time to pick up where you left off.
                </p>
              </CardContent>
            </Card>
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fade-up">
          <Card className="bg-gradient-to-r from-orange-500/5 to-zinc-900/50 border-orange-500/20 cta-shimmer">
            <CardContent className="py-8 text-center space-y-4">
              <h3 className="text-2xl font-bold text-white">Why We Built This Platform</h3>
              <blockquote className="text-zinc-400 max-w-3xl mx-auto italic leading-relaxed">
                "We respond to ransomware attacks, recover encrypted systems, and hunt threats inside compromised networks. That's our day job.
                Most SMBs can't afford a dedicated threat intel team. This platform changes that.
                Your membership keeps the tools free, the data flowing, and the lights on."
              </blockquote>
              <p className="font-bold text-orange-400">— The STBCS Team</p>
            </CardContent>
          </Card>
        </AnimatedSection>

        <AnimatedSection animation="fade-up">
          <div className="space-y-4">
            <h2 className="text-2xl font-display font-bold text-white text-center" data-testid="text-faq-title">
              Frequently Asked Questions
            </h2>
            <div className="max-w-3xl mx-auto space-y-2">
              {FAQ_ITEMS.map((item, i) => (
                <Card
                  key={i}
                  className={`bg-zinc-900/50 border-zinc-800 cursor-pointer transition-colors hover:border-zinc-500 ${expandedFaq === i ? 'border-orange-500/30' : ''}`}
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  data-testid={`faq-item-${i}`}
                >
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-semibold text-white text-sm">{item.q}</h4>
                      {expandedFaq === i ? <ChevronUp className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" /> : <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />}
                    </div>
                    {expandedFaq === i && (
                      <p className="text-sm text-zinc-400 mt-3 leading-relaxed">{item.a}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fade-up">
          <Card className="border-white/5 bg-zinc-900/50">
            <CardContent className="py-6">
              <div className="max-w-3xl mx-auto text-center space-y-4">
                <h3 className="text-lg font-bold text-white">100% Community Funded — Zero Ads, Zero Data Selling</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Every scan, every API call, every threat feed costs real money. There are no investors, no ad revenue, and no data harvesting.
                  Memberships, donations, and partnerships fund everything — hosting, 160+ data feeds, development, and research.
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-xs text-zinc-500 pt-2">
                  <span className="flex items-center gap-1"><Check className="h-3 w-3 text-orange-400" /> Hosting & Infrastructure</span>
                  <span className="flex items-center gap-1"><Check className="h-3 w-3 text-orange-400" /> API & Data Feeds</span>
                  <span className="flex items-center gap-1"><Check className="h-3 w-3 text-orange-400" /> Development & Research</span>
                  <span className="flex items-center gap-1"><Check className="h-3 w-3 text-orange-400" /> Security Operations</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        <AnimatedSection animation="fade-up">
          <div className="text-center space-y-3">
            <h3 className="text-xl font-bold text-white">Need a Custom Plan or Volume Pricing?</h3>
            <p className="text-zinc-400 text-sm">Enterprise deployments, reseller programs, and custom integrations available.</p>
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10" asChild>
                <a href="/contact?category=partnership&subject=Enterprise%20Pricing" data-testid="link-enterprise-contact">
                  Contact Sales
                </a>
              </Button>
              <Button variant="outline" className="border-zinc-500 text-zinc-300 hover:bg-zinc-800" asChild>
                <a href="/support" data-testid="link-support-page">
                  Donate & Support
                </a>
              </Button>
            </div>
          </div>
        </AnimatedSection>

        <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
          <Lock className="h-3 w-3" aria-hidden="true" />
          <span>All payments processed securely by Stripe. We never store your payment information. Prices shown in USD.</span>
        </div>

      </div>
              <RelatedResources links={getRelatedLinks("/pricing")} testIdPrefix="pricing" />
<Footer />
      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        defaultTab="signup"
        onSuccess={handleAuthSuccess}
      />
    </Layout>
  );
}