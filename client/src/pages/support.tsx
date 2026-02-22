import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Heart, Shield, Users, Zap, Check, Coffee, Rocket, Building2, ExternalLink, CreditCard, Lock, ArrowRight } from "lucide-react";
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
    originalPrice: "$9.99",
    price: "$4.99",
    interval: "month",
    discount: "50% OFF",
    description: "Back our mission and keep free security tools available for everyone",
    icon: Coffee,
    features: [
      "Supporter-only platform updates",
      "Your name on our supporters wall",
      "Early access to new tools and features",
      "Help keep free security tools running",
    ],
    color: "from-zinc-800/50 to-zinc-900/50",
    borderColor: "border-zinc-700",
  },
  {
    name: "Pro",
    originalPrice: "$29.99",
    price: "$14.99",
    interval: "month",
    discount: "50% OFF",
    description: "Everything you need to monitor threats targeting your business",
    icon: Rocket,
    popular: true,
    features: [
      "Unlimited threat intelligence API calls",
      "Real-time email and SMS alerts when threats match your watchlist",
      "Custom watchlists for companies, CVEs, and threat actors",
      "Advanced search with severity, date, and vendor filters",
      "Export threat data to CSV for your reports",
      "Priority email support from our security team",
    ],
    color: "from-orange-500/20 to-orange-600/10",
    borderColor: "border-orange-500/50",
  },
  {
    name: "Business",
    originalPrice: "$99.99",
    price: "$49.99",
    interval: "month",
    discount: "50% OFF",
    description: "Threat intelligence built for security teams and managed service providers",
    icon: Building2,
    features: [
      "Everything in Pro, plus:",
      "A dedicated account manager who knows your environment",
      "Custom API integrations tailored to your stack",
      "Team accounts with shared watchlists and alerts",
      "SLA-backed uptime and response time guarantees",
      "Custom threat feeds filtered to your industry",
      "On-call support for active incidents",
    ],
    color: "from-zinc-800/50 to-zinc-900/50",
    borderColor: "border-zinc-700",
  },
];

export default function SupportPage() {
  useDocumentTitle("Plans & Pricing | STB Cybersecurity", "Get real-time threat alerts, custom watchlists, and priority incident response. Plans start at $4.99/mo. 50% off during our grand opening.");
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const [selectedAmount, setSelectedAmount] = useState(2500);
  const [customAmount, setCustomAmount] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donationAgreed, setDonationAgreed] = useState(false);
  const [subscriptionAgreed, setSubscriptionAgreed] = useState(false);

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

  const handleSubscribe = (tierName: string) => {
    if (!subscriptionAgreed) {
      toast({ title: "Please agree to the Terms of Service, Privacy Policy, and recurring billing to proceed", variant: "destructive" });
      return;
    }

    const products = productsData?.products || [];
    const product = products.find((p: any) => p.name?.includes(tierName));
    
    if (!product) {
      toast({ title: "Error", description: "Membership plan not found. Please refresh and try again.", variant: "destructive" });
      return;
    }

    const monthlyPrice = product?.prices?.find((p: any) => 
      p.recurring?.interval === 'month'
    );
    const price = monthlyPrice || product?.prices?.[0];
    
    if (!price?.id) {
      toast({ title: "Error", description: "Price not available. Please refresh and try again.", variant: "destructive" });
      return;
    }

    navigate(`/checkout?type=subscription&priceId=${encodeURIComponent(price.id)}&tier=${encodeURIComponent(tierName)}`);
  };

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500">

        <div className="bg-gradient-to-r from-green-500/20 via-green-600/30 to-green-500/20 border border-green-500/50 rounded-xl p-4 mb-6 text-center">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Badge className="bg-green-500 text-white text-sm px-3 py-1 animate-pulse">
              GRAND OPENING SALE
            </Badge>
            <span className="text-white font-bold text-lg">50% OFF All Memberships!</span>
            <span className="text-green-300 text-sm">Limited time offer</span>
          </div>
        </div>

        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center gap-2">
            <div className="p-3 bg-orange-500/10 rounded-xl">
              <Heart className="h-8 w-8 text-orange-400 fill-orange-400/30" aria-hidden="true" />
            </div>
          </div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-white">Stay Ahead of the Threats That Target Your Business</h1>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
            Real-time alerts when ransomware groups hit your industry. Custom watchlists for the CVEs and threat actors that matter to you. Pick a plan and start monitoring in minutes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 py-6">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="pt-6 text-center space-y-2">
              <Shield className="h-10 w-10 mx-auto text-orange-400" aria-hidden="true" />
              <h3 className="font-bold text-white">Free Tools, No Strings</h3>
              <p className="text-sm text-zinc-400">
                IP lookups, port scans, threat checks, and more. Free for researchers, students, and small businesses.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="pt-6 text-center space-y-2">
              <Users className="h-10 w-10 mx-auto text-blue-400" aria-hidden="true" />
              <h3 className="font-bold text-white">Built by Practitioners</h3>
              <p className="text-sm text-zinc-400">
                Our team handles real incident response and ransomware recovery cases. This platform is built from the front lines.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="pt-6 text-center space-y-2">
              <Zap className="h-10 w-10 mx-auto text-yellow-400" aria-hidden="true" />
              <h3 className="font-bold text-white">Your Money, Put to Work</h3>
              <p className="text-sm text-zinc-400">
                Every dollar funds API calls, data feeds, hosting, and new features. No investors, no ads, no data selling.
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="membership" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-zinc-900 border border-zinc-800 p-1">
            <TabsTrigger value="membership" className="data-[state=active]:!bg-orange-500 data-[state=active]:!text-white data-[state=active]:!shadow-none text-zinc-400" data-testid="tab-membership">Monthly Membership</TabsTrigger>
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
                      className={`font-bold ${selectedAmount === d.amount && !customAmount ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'}`}
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
                    className="pl-8 bg-zinc-800 border-zinc-700 text-white"
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
                    className="bg-zinc-800 border-zinc-700 text-white"
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
                    className="bg-zinc-800 border-zinc-700 text-white"
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
              From community supporter to full enterprise coverage. Cancel anytime, no long-term contracts.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {membershipTiers.map((tier) => (
              <Card 
                key={tier.name} 
                className={`relative bg-gradient-to-b ${tier.color} ${tier.borderColor} ${tier.popular ? 'ring-2 ring-orange-500' : ''}`}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white">
                    Most Popular
                  </Badge>
                )}
                {tier.discount && (
                  <Badge className="absolute -top-3 right-3 bg-green-500 text-white animate-pulse">
                    {tier.discount}
                  </Badge>
                )}
                <CardHeader className="text-center pb-2">
                  <tier.icon className={`h-12 w-12 mx-auto mb-2 ${tier.popular ? 'text-orange-400' : 'text-zinc-400'}`} />
                  <CardTitle className="text-xl text-white">{tier.name}</CardTitle>
                  <div className="mt-2">
                    {tier.originalPrice && (
                      <span className="text-lg text-zinc-500 line-through mr-2">{tier.originalPrice}</span>
                    )}
                    <span className="text-3xl font-bold text-green-400">{tier.price}</span>
                    <span className="text-zinc-500">/{tier.interval}</span>
                  </div>
                  <CardDescription className="mt-2 text-zinc-400">{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                        <Check className="h-4 w-4 text-green-400 shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full font-bold ${tier.popular ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'}`}
                    variant={tier.popular ? "default" : "outline"}
                    onClick={() => handleSubscribe(tier.name)}
                    disabled={!subscriptionAgreed}
                    data-testid={`button-subscribe-${tier.name.toLowerCase()}`}
                  >
                    <CreditCard className="h-4 w-4 mr-2" aria-hidden="true" />
                    Start {tier.name} Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
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
            <span>All subscriptions are billed monthly through Stripe. You can cancel anytime. We never store your payment information.</span>
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
                Memberships, donations, and partnerships fund the hosting, the 45+ data feeds, the development, and the research. That's it.
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
                Start a Supporter plan at $4.99/month and your name appears here.
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
            <a href="mailto:partnerships@stbcybersecurity.com" className="text-orange-400 hover:underline">
              partnerships@stbcybersecurity.com
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
              <a href="mailto:info@stbcybersecurity.com" className="flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <span className="text-orange-400">General Inquiries</span>
                <span className="text-zinc-500 text-xs">info@stbcybersecurity.com</span>
              </a>
              <a href="mailto:support@stbcybersecurity.com" className="flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <span className="text-orange-400">Technical Support</span>
                <span className="text-zinc-500 text-xs">support@stbcybersecurity.com</span>
              </a>
              <a href="mailto:feedback@stbcybersecurity.com" className="flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <span className="text-orange-400">Feedback & Stories</span>
                <span className="text-zinc-500 text-xs">feedback@stbcybersecurity.com</span>
              </a>
              <a href="tel:+18557821987" className="flex items-center gap-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <span className="text-orange-400">Emergency Hotline</span>
                <span className="text-zinc-500 text-xs">(855) STB-1987</span>
              </a>
            </div>
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-zinc-500 mb-3">Connect with us</p>
              <div className="flex flex-wrap gap-3">
                <a href="https://twitter.com/stbcybersecurity" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded bg-white/5 text-zinc-400 hover:text-orange-400 hover:bg-white/10 text-xs transition-colors">Twitter/X</a>
                <a href="https://linkedin.com/company/stbcybersecurity" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded bg-white/5 text-zinc-400 hover:text-orange-400 hover:bg-white/10 text-xs transition-colors">LinkedIn</a>
                <a href="https://facebook.com/stbcybersecurity" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded bg-white/5 text-zinc-400 hover:text-orange-400 hover:bg-white/10 text-xs transition-colors">Facebook</a>
                <a href="https://youtube.com/@stbcybersecurity" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded bg-white/5 text-zinc-400 hover:text-orange-400 hover:bg-white/10 text-xs transition-colors">YouTube</a>
                <a href="https://github.com/stbcybersecurity" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded bg-white/5 text-zinc-400 hover:text-orange-400 hover:bg-white/10 text-xs transition-colors">GitHub</a>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-2 text-sm text-zinc-500 pb-8">
          <p>Questions about payments or memberships?</p>
          <p>Contact us at <a href="mailto:billing@stbcybersecurity.com" className="text-orange-400 hover:underline">billing@stbcybersecurity.com</a></p>
        </div>
      </div>
      <Footer />
    </Layout>
  );
}
