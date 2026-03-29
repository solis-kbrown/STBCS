import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Heart, Shield, Users, Zap, Check, Coffee, Rocket, Building2, ExternalLink, CreditCard, Lock, ArrowRight, Crown } from "lucide-react";
import AnimatedSection, { AnimatedList } from "@/components/animated-section";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout";
import Footer from "@/components/footer";
import RelatedResources, { getRelatedLinks } from "@/components/related-resources";

const donationAmounts = [
  { amount: 500, label: "$5" },
  { amount: 1000, label: "$10" },
  { amount: 2500, label: "$25" },
  { amount: 5000, label: "$50" },
  { amount: 10000, label: "$100" },
];

const membershipTiers = [
  {
    name: "Supporter",
    monthlyOriginal: null,
    monthlyPrice: "$14.99",
    yearlyOriginal: null,
    yearlyPrice: "$149.90",
    discount: null,
    description: "Back our mission and keep free security tools available for everyone",
    icon: Coffee,
    stripeName: "Supporter",
    features: [
      "Supporter-only platform updates",
      "Your name on our supporters wall",
      "Early access to new tools and features",
      "Help keep free security tools running",
      "5 uptime & dark web monitors included",
    ],
    color: "from-zinc-800/50 to-zinc-900/50",
    borderColor: "border-zinc-500",
  },
  {
    name: "Pro",
    monthlyOriginal: null,
    monthlyPrice: "$49.99",
    yearlyOriginal: null,
    yearlyPrice: "$499.90",
    discount: null,
    description: "Everything you need to monitor threats targeting your business",
    icon: Rocket,
    popular: true,
    stripeName: "Pro",
    features: [
      "Unlimited threat intelligence API calls",
      "Real-time email and SMS alerts when threats match your watchlist",
      "Custom watchlists for companies, CVEs, and threat actors",
      "5 uptime monitors with SSL certificate tracking",
      "5 dark web monitors across 5 intel sources",
      "Attack Surface Discovery — map exposed assets for any domain",
      "On-demand Threat Intelligence Reports with executive summaries",
      "Advanced search with severity, date, and vendor filters",
      "Export threat data to CSV for your reports",
      "Priority email support from our security team",
    ],
    color: "from-orange-500/20 to-orange-600/10",
    borderColor: "border-orange-500/50",
  },
  {
    name: "Business",
    monthlyOriginal: null,
    monthlyPrice: "$199.99",
    yearlyOriginal: null,
    yearlyPrice: "$1,999.90",
    discount: null,
    description: "Threat intelligence built for security teams and managed service providers",
    icon: Building2,
    stripeName: "Business",
    features: [
      "Everything in Pro, plus:",
      "25 uptime monitors with deep SSL inspection",
      "25 dark web monitors across 12 intel sources",
      "A dedicated account manager who knows your environment",
      "Custom API integrations tailored to your stack",
      "Team accounts with shared watchlists and alerts",
      "Automated weekly/monthly Threat Reports delivered to your account",
      "SLA-backed uptime and response time guarantees",
      "Custom threat feeds filtered to your industry",
      "On-call support for active incidents",
    ],
    color: "from-zinc-800/50 to-zinc-900/50",
    borderColor: "border-zinc-500",
  },
  {
    name: "Unlimited Everything",
    monthlyOriginal: null,
    monthlyPrice: "$499.99",
    yearlyOriginal: null,
    yearlyPrice: "$4,999.90",
    discount: null,
    description: "Full unlimited access to the entire STBCS platform — no limits, no restrictions",
    icon: Crown,
    stripeName: "Unlimited Everything",
    features: [
      "Everything in Business, plus:",
      "Unlimited uptime monitors — no cap",
      "Unlimited dark web monitors across all intel sources",
      "Unlimited API keys with no daily quota cap",
      "Unlimited threat intelligence report generation",
      "White-label reports with your company branding",
      "Direct Slack/Teams integration for alerts",
      "Priority incident response queue — your tickets come first",
      "Custom threat feed curation by our analysts",
      "Quarterly executive threat briefing calls",
      "Early access to every new feature before public release",
    ],
    color: "from-yellow-500/20 to-amber-600/10",
    borderColor: "border-yellow-500/50",
  },
];

export default function SupportPage() {
  useDocumentTitle("Plans & Pricing | STB Cybersecurity", "Get real-time threat alerts, custom watchlists, and priority incident response. Plans start at $14.99/mo.");
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const [selectedAmount, setSelectedAmount] = useState(2500);
  const [customAmount, setCustomAmount] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donationAgreed, setDonationAgreed] = useState(false);
  const [subscriptionAgreed, setSubscriptionAgreed] = useState(false);
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");

  const { data: productsData } = useQuery({
    queryKey: ["stripe-products"],
    queryFn: async () => {
      const res = await fetch("/api/stripe/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });

  const handleDonate = () => {
    if (!donationAgreed) {
      toast({ title: "Please agree to the Terms of Service and Privacy Policy to proceed", variant: "destructive" });
      return;
    }
    const amount = customAmount ? Math.round(parseFloat(customAmount) * 100) : selectedAmount;
    if (amount < 100 || amount > 100000) return;
    
    sessionStorage.setItem("stbcs_checkout", JSON.stringify({
      email: donorEmail || undefined,
      donorName: donorName || undefined,
    }));
    
    navigate(`/checkout?type=donation&amount=${amount}`);
  };

  const handleSubscribe = (tierStripeName: string) => {
    if (!subscriptionAgreed) {
      toast({ title: "Please agree to the Terms of Service, Privacy Policy, and recurring billing to proceed", variant: "destructive" });
      return;
    }

    const products = productsData?.products || [];
    const product = products.find((p: any) => p.name?.includes(tierStripeName));
    
    if (!product) {
      toast({ title: "Error", description: "Membership plan not found. Please refresh and try again.", variant: "destructive" });
      return;
    }

    const matchedPrice = product?.prices?.find((p: any) => 
      p.recurring?.interval === billingInterval
    );
    const price = matchedPrice || product?.prices?.[0];
    
    if (!price?.id) {
      toast({ title: "Error", description: "Price not available. Please refresh and try again.", variant: "destructive" });
      return;
    }

    navigate(`/checkout?type=subscription&priceId=${encodeURIComponent(price.id)}&tier=${encodeURIComponent(tierStripeName)}`);
  };

  return (
    <Layout>
      <div className="space-y-8 page-transition">

        <AnimatedSection animation="fade-down">
          <div className="text-center space-y-4">
            <img src="/brand/logo-main.png" alt="STB Cybersecurity support portal logo" className="h-28 w-auto mx-auto drop-shadow-[0_0_14px_rgba(239,68,68,0.3)]" data-testid="img-support-logo" />
            <h1 className="text-4xl font-display font-bold tracking-tight text-white">Stay Ahead of the Threats That Target Your Business</h1>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
              Real-time alerts when ransomware groups hit your industry. Custom watchlists for the CVEs and threat actors that matter to you. Pick a plan and start monitoring in minutes.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-6 py-6">
          <AnimatedSection animation="fade-up" stagger={1}>
            <Card className="bg-zinc-900/50 border-zinc-800 card-interactive">
              <CardContent className="pt-6 text-center space-y-2">
                <Shield className="h-10 w-10 mx-auto text-orange-400 icon-hover" aria-hidden="true" />
                <h3 className="font-bold text-white">Free Tools, No Strings</h3>
                <p className="text-sm text-zinc-400">
                  IP lookups, port scans, threat checks, and more. Free for researchers, students, and small businesses.
                </p>
              </CardContent>
            </Card>
          </AnimatedSection>
          <AnimatedSection animation="fade-up" stagger={2}>
            <Card className="bg-zinc-900/50 border-zinc-800 card-interactive">
              <CardContent className="pt-6 text-center space-y-2">
                <Users className="h-10 w-10 mx-auto text-blue-400 icon-hover" aria-hidden="true" />
                <h3 className="font-bold text-white">Built by Practitioners</h3>
                <p className="text-sm text-zinc-400">
                  Our team handles real incident response and ransomware recovery cases. This platform is built from the front lines.
                </p>
              </CardContent>
            </Card>
          </AnimatedSection>
          <AnimatedSection animation="fade-up" stagger={3}>
            <Card className="bg-zinc-900/50 border-zinc-800 card-interactive">
              <CardContent className="pt-6 text-center space-y-2">
                <Zap className="h-10 w-10 mx-auto text-yellow-400 icon-hover" aria-hidden="true" />
                <h3 className="font-bold text-white">Your Money, Put to Work</h3>
                <p className="text-sm text-zinc-400">
                  Every dollar funds API calls, data feeds, hosting, and new features. No investors, no ads, no data selling.
                </p>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>

        <Tabs defaultValue="membership" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-zinc-900 border border-zinc-800 p-1">
            <TabsTrigger value="membership" className="data-[state=active]:!bg-orange-500 data-[state=active]:!text-white data-[state=active]:!shadow-none text-zinc-400" data-testid="tab-membership">Membership Plans</TabsTrigger>
            <TabsTrigger value="donate" className="data-[state=active]:!bg-orange-500 data-[state=active]:!text-white data-[state=active]:!shadow-none text-zinc-400" data-testid="tab-donate">One-Time Donation</TabsTrigger>
          </TabsList>

        <TabsContent value="donate" className="space-y-6">
          <Card className="max-w-xl mx-auto bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Heart className="h-5 w-5 text-orange-400" aria-hidden="true" />
                Make a Donation
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Every contribution helps us maintain and improve our free cybersecurity services.
                No payment information is stored on our servers - all transactions are securely processed by Stripe.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-zinc-300">Select an amount</Label>
                <div className="grid grid-cols-5 gap-2">
                  {donationAmounts.map((d) => (
                    <Button
                      key={d.amount}
                      variant={selectedAmount === d.amount && !customAmount ? "default" : "outline"}
                      onClick={() => {
                        setSelectedAmount(d.amount);
                        setCustomAmount("");
                      }}
                      className={`font-bold ${selectedAmount === d.amount && !customAmount ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border-zinc-500 text-zinc-300 hover:bg-zinc-800'}`}
                      data-testid={`button-amount-${d.amount}`}
                    >
                      {d.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-amount" className="text-zinc-300">Or enter a custom amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                  <Input
                    id="custom-amount"
                    name="custom-amount"
                    type="number"
                    min="1"
                    max="1000"
                    placeholder="Enter amount…"
                    autoComplete="off"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="pl-8 bg-zinc-800 border-zinc-500 text-white"
                    data-testid="input-custom-amount"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="donor-name" className="text-zinc-300">Name (optional)</Label>
                  <Input
                    id="donor-name"
                    name="donor-name"
                    placeholder="Your name…"
                    autoComplete="name"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="bg-zinc-800 border-zinc-500 text-white"
                    data-testid="input-donor-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="donor-email" className="text-zinc-300">Email (optional)</Label>
                  <Input
                    id="donor-email"
                    name="donor-email"
                    type="email"
                    placeholder="Enter your email…"
                    autoComplete="email"
                    spellCheck={false}
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    className="bg-zinc-800 border-zinc-500 text-white"
                    data-testid="input-donor-email"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="donation-agree"
                  checked={donationAgreed}
                  onChange={(e) => setDonationAgreed(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-orange-500 accent-orange-500"
                  data-testid="checkbox-donation-agree"
                />
                <label htmlFor="donation-agree" className="text-xs text-zinc-400 leading-relaxed">
                  I agree to the{" "}
                  <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Terms of Service</a>
                  {" "}and{" "}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Privacy Policy</a>
                  . I understand this is a one-time, non-refundable donation processed securely by Stripe.
                </label>
              </div>

              <Button 
                className="w-full font-bold text-lg py-6 bg-orange-500 hover:bg-orange-600 text-white" 
                onClick={handleDonate}
                disabled={!donationAgreed}
                data-testid="button-donate"
              >
                <Heart className="h-5 w-5 mr-2" aria-hidden="true" />
                Donate {customAmount ? `$${customAmount}` : `$${(selectedAmount / 100).toFixed(2)}`}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
                <Lock className="h-3 w-3" aria-hidden="true" />
                <span>Payments are processed securely by Stripe. We never store your payment information.</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="membership" className="space-y-6">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl font-bold mb-2 text-white">Pick the Plan That Fits Your Threat Profile</h2>
            <p className="text-zinc-400">
              From community supporter to full unlimited coverage. Cancel anytime, no long-term contracts.
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={() => setBillingInterval("month")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${billingInterval === "month" ? "bg-orange-500 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
              data-testid="toggle-monthly"
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval("year")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors relative ${billingInterval === "year" ? "bg-orange-500 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
              data-testid="toggle-annual"
            >
              Annual
              <Badge className="absolute -top-2.5 -right-14 bg-green-500 text-white text-[10px] px-1.5 py-0.5 whitespace-nowrap">
                Save 2 months
              </Badge>
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {membershipTiers.map((tier, index) => {
              const displayPrice = billingInterval === "month" ? tier.monthlyPrice : tier.yearlyPrice;
              const displayOriginal = billingInterval === "month" ? tier.monthlyOriginal : tier.yearlyOriginal;
              const intervalLabel = billingInterval === "month" ? "mo" : "yr";
              const isUnlimited = tier.name === "Unlimited Everything";

              return (
              <AnimatedSection key={tier.name} animation="fade-up" stagger={((index % 3) + 1) as 1 | 2 | 3}>
              <Card 
                className={`relative bg-gradient-to-b ${tier.color} ${tier.borderColor} ${tier.popular ? 'ring-2 ring-orange-500 glow-pulse' : ''} ${isUnlimited ? 'ring-2 ring-yellow-500/70' : ''} card-interactive h-full flex flex-col`}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white">
                    Most Popular
                  </Badge>
                )}
                {isUnlimited && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold">
                    Ultimate Plan
                  </Badge>
                )}
                {tier.discount && (
                  <Badge className="absolute -top-3 right-3 bg-green-500 text-white animate-pulse">
                    {tier.discount}
                  </Badge>
                )}
                <CardHeader className="text-center pb-2">
                  <tier.icon className={`h-12 w-12 mx-auto mb-2 icon-hover ${tier.popular ? 'text-orange-400' : isUnlimited ? 'text-yellow-400' : 'text-zinc-400'}`} />
                  <CardTitle className="text-xl text-white">{tier.name}</CardTitle>
                  <div className="mt-2">
                    {displayOriginal && (
                      <span className="text-lg text-zinc-500 line-through mr-2">{displayOriginal}</span>
                    )}
                    <span className={`text-3xl font-bold ${isUnlimited ? 'text-yellow-400' : 'text-green-400'}`}>{displayPrice}</span>
                    <span className="text-zinc-500">/{intervalLabel}</span>
                  </div>
                  {billingInterval === "year" && (
                    <span className="text-xs text-green-400 mt-1 block">2 months free vs monthly</span>
                  )}
                  <CardDescription className="mt-2 text-zinc-400">{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex-1 flex flex-col">
                  <ul className="space-y-2 flex-1">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                        <Check className={`h-4 w-4 ${isUnlimited ? 'text-yellow-400' : 'text-green-400'} shrink-0 mt-0.5`} aria-hidden="true" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full font-bold ${tier.popular ? 'bg-orange-500 hover:bg-orange-600 text-white' : isUnlimited ? 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black' : 'border-zinc-500 text-zinc-300 hover:bg-zinc-800'}`}
                    variant={tier.popular || isUnlimited ? "default" : "outline"}
                    onClick={() => handleSubscribe(tier.stripeName)}
                    disabled={!subscriptionAgreed}
                    data-testid={`button-subscribe-${tier.name.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <CreditCard className="h-4 w-4 mr-2" aria-hidden="true" />
                    Start {tier.name} Plan
                  </Button>
                </CardContent>
              </Card>
              </AnimatedSection>
              );
            })}
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="flex items-start gap-2 mb-4">
              <input
                type="checkbox"
                id="subscription-agree"
                checked={subscriptionAgreed}
                onChange={(e) => setSubscriptionAgreed(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-orange-500 accent-orange-500"
                data-testid="checkbox-subscription-agree"
              />
              <label htmlFor="subscription-agree" className="text-xs text-zinc-400 leading-relaxed">
                I agree to the{" "}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Terms of Service</a>
                {" "}and{" "}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Privacy Policy</a>
                . I authorize recurring billing at the selected plan rate until I cancel. I understand I can cancel anytime through my account settings.
              </label>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
            <Lock className="h-3 w-3" aria-hidden="true" />
            <span>All subscriptions are billed {billingInterval === "month" ? "monthly" : "annually"} through Stripe. You can cancel anytime. We never store your payment information.</span>
          </div>
        </TabsContent>
        </Tabs>

        <Card className="bg-gradient-to-r from-orange-500/5 to-zinc-900/50 border-orange-500/20">
          <CardContent className="py-8 text-center space-y-4">
            <h3 className="text-2xl font-bold text-white">Why We Built This</h3>
            <blockquote className="text-zinc-400 max-w-3xl mx-auto italic leading-relaxed">
              "We respond to ransomware attacks, recover encrypted systems, and hunt threats inside compromised networks. That's our day job.
              We built STBCS because the businesses we help needed a way to see threats coming before they hit.
              Most SMBs can't afford a dedicated threat intel team. This platform changes that.
              Your support keeps the tools free, the data flowing, and the lights on."
            </blockquote>
            <p className="font-bold text-orange-400">- The STBCS Team</p>
          </CardContent>
        </Card>

        <Card className="border-orange-500/20 bg-zinc-900/50">
          <CardContent className="py-6">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h3 className="text-lg font-bold text-white">100% Community Funded. Zero Ads. Zero Data Selling.</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Every IP lookup, every threat scan, every API call costs real money to run. There are no investors, no ad revenue, and no data harvesting.
                Memberships, donations, and partnerships fund the hosting, the 160+ data feeds, the development, and the research. That's it.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-xs text-zinc-500 pt-2">
                <span className="flex items-center gap-1"><Check className="h-3 w-3 text-orange-400" aria-hidden="true" /> Hosting & Infrastructure</span>
                <span className="flex items-center gap-1"><Check className="h-3 w-3 text-orange-400" aria-hidden="true" /> API & Data Feeds</span>
                <span className="flex items-center gap-1"><Check className="h-3 w-3 text-orange-400" aria-hidden="true" /> Development & Research</span>
                <span className="flex items-center gap-1"><Check className="h-3 w-3 text-orange-400" aria-hidden="true" /> Security Operations</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-card/50">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-400" aria-hidden="true" />
              Our Supporters
            </CardTitle>
            <CardDescription>Thank you to everyone who helps keep STBCS running</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 space-y-3">
              <p className="text-zinc-300 text-sm">
                Be one of the first names on the wall. Early supporters get permanent recognition.
              </p>
              <p className="text-xs text-zinc-500">
                Start a Supporter plan at $14.99/month and your name appears here.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg text-white">Business Partnerships</CardTitle>
            <CardDescription>Put your brand in front of security professionals and decision-makers</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-zinc-400">
            <p className="mb-3">
              Limited sponsorship spots for cybersecurity vendors, training providers, and security-focused businesses.
              Our audience includes IT managers, security analysts, and business owners actively researching threats.
            </p>
            <a href="/contact?category=partnership&subject=Partnership%20Inquiry" className="text-orange-400 hover:underline">
              Contact our partnerships team
            </a>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg text-white">We Want to Hear From You</CardTitle>
            <CardDescription>Feedback, questions, or just want to share your story? Reach out anytime.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-zinc-400">
              We love hearing from our community. Whether it's feedback on the platform, a success story, 
              or just a question - we're here. Please don't abuse these channels, but know they're always open.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <a href="/contact?category=general" className="flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <span className="text-orange-400">General Inquiries</span>
                <span className="text-zinc-500 text-xs">Send us a message</span>
              </a>
              <a href="/contact?category=support" className="flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <span className="text-orange-400">Technical Support</span>
                <span className="text-zinc-500 text-xs">Get help from our team</span>
              </a>
              <a href="/contact?category=feedback" className="flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <span className="text-orange-400">Feedback & Stories</span>
                <span className="text-zinc-500 text-xs">Share your experience</span>
              </a>
              <a href="tel:+18557821987" className="flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <span className="text-orange-400">Emergency Hotline</span>
                <span className="text-zinc-500 text-xs">(855) STB-1987</span>
              </a>
            </div>
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-zinc-500 mb-3">Connect with us</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "Twitter/X", testId: "link-support-social-twitter", href: "https://twitter.com/stbcybersecurity", icon: <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> },
                  { name: "LinkedIn", testId: "link-support-social-linkedin", href: "https://linkedin.com/company/stbcybersecurity", icon: <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg> },
                  { name: "Facebook", testId: "link-support-social-facebook", href: "https://facebook.com/stbcybersecurity", icon: <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg> },
                  { name: "YouTube", testId: "link-support-social-youtube", href: "https://youtube.com/@stbcybersecurity", icon: <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg> },
                  { name: "GitHub", testId: "link-support-social-github", href: "https://github.com/stbcybersecurity", icon: <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg> },
                ].map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow us on ${social.name}`}
                    data-testid={social.testId}
                    className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/[0.06] text-zinc-400 hover:text-orange-400 hover:bg-white/10 hover:border-orange-500/20 text-xs transition-all duration-300"
                  >
                    <span className="group-hover:drop-shadow-[0_0_6px_rgba(251,146,60,0.5)] transition-all duration-300">{social.icon}</span>
                    {social.name}
                  </a>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-2 text-sm text-zinc-500 pb-8">
          <p>Questions about payments or memberships?</p>
          <p><a href="/contact?category=billing&subject=Billing%20Question" className="text-orange-400 hover:underline">Contact us about billing</a></p>
        </div>
      </div>
              <RelatedResources links={getRelatedLinks("/support")} testIdPrefix="support" />
<Footer />
    </Layout>
  );
}
