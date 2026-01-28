import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Heart, Shield, Users, Zap, Check, Coffee, Rocket, Building2, ExternalLink, Loader2, CreditCard, Lock } from "lucide-react";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
    price: "$9.99",
    interval: "month",
    description: "Support our mission and the cybersecurity community",
    icon: Coffee,
    features: [
      "Access to supporter-only updates",
      "Name listed on supporters page",
      "Early access to new features",
      "Supporting free security tools",
    ],
    color: "from-zinc-800/50 to-zinc-900/50",
    borderColor: "border-zinc-700",
  },
  {
    name: "Pro",
    price: "$29.99",
    interval: "month",
    description: "Full access to all STBCS Pro features",
    icon: Rocket,
    popular: true,
    features: [
      "Unlimited API access",
      "Real-time threat alerts",
      "Custom watchlists & notifications",
      "Advanced search filters",
      "Export capabilities",
      "Priority email support",
    ],
    color: "from-orange-500/20 to-orange-600/10",
    borderColor: "border-orange-500/50",
  },
  {
    name: "Business",
    price: "$99.99",
    interval: "month",
    description: "Enterprise-grade threat intelligence",
    icon: Building2,
    features: [
      "Everything in Pro",
      "Dedicated account manager",
      "Custom API integrations",
      "Team collaboration features",
      "SLA guarantees",
      "Custom data feeds",
      "On-call support",
    ],
    color: "from-zinc-800/50 to-zinc-900/50",
    borderColor: "border-zinc-700",
  },
];

export default function SupportPage() {
  useDocumentTitle("Support & Membership | STB Cybersecurity");
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const success = searchParams.get('success') === 'true';
  const donated = searchParams.get('donated') === 'true';
  const canceled = searchParams.get('canceled') === 'true';

  const [selectedAmount, setSelectedAmount] = useState(2500);
  const [customAmount, setCustomAmount] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorName, setDonorName] = useState("");

  const donateMutation = useMutation({
    mutationFn: async (data: { amount: number; customerEmail?: string; donorName?: string }) => {
      const res = await fetch("/api/stripe/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create donation session");
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async (data: { priceId: string; customerEmail?: string; mode: 'subscription' }) => {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create checkout session");
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
  });

  const { data: productsData } = useQuery({
    queryKey: ["stripe-products"],
    queryFn: async () => {
      const res = await fetch("/api/stripe/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });

  const handleDonate = () => {
    const amount = customAmount ? Math.round(parseFloat(customAmount) * 100) : selectedAmount;
    if (amount < 100 || amount > 100000) return;
    
    donateMutation.mutate({
      amount,
      customerEmail: donorEmail || undefined,
      donorName: donorName || undefined,
    });
  };

  const handleSubscribe = (tierName: string) => {
    const products = productsData?.products || [];
    const product = products.find((p: any) => p.name?.includes(tierName));
    
    // Find monthly price (prefer monthly over yearly)
    const monthlyPrice = product?.prices?.find((p: any) => 
      p.recurring?.interval === 'month'
    );
    const price = monthlyPrice || product?.prices?.[0];
    
    if (price?.id) {
      checkoutMutation.mutate({
        priceId: price.id,
        customerEmail: donorEmail || undefined,
        mode: 'subscription',
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500">
        {(success || donated) && (
          <Card className="bg-green-500/10 border-green-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-green-400">
                <Check className="h-6 w-6" />
                <div>
                  <p className="font-bold text-lg">Thank you for your support!</p>
                  <p className="text-sm text-green-400/80">
                    {donated 
                      ? "Your donation has been received. You're helping strengthen the cybersecurity community!"
                      : "Your subscription is now active. Welcome to the STBCS family!"
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {canceled && (
          <Card className="bg-yellow-500/10 border-yellow-500/30">
            <CardContent className="pt-6">
              <p className="text-yellow-400">
                Payment was canceled. Feel free to try again whenever you're ready.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center gap-2">
            <div className="p-3 bg-orange-500/10 rounded-xl">
              <Heart className="h-8 w-8 text-orange-400 fill-orange-400/30" />
            </div>
          </div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-white">Support STBCS</h1>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
            STB Cybersecurity is dedicated to making threat intelligence accessible to everyone. 
            Your support helps us maintain free security tools, develop new services, 
            and strengthen the global cybersecurity community.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 py-6">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="pt-6 text-center space-y-2">
              <Shield className="h-10 w-10 mx-auto text-orange-400" />
              <h3 className="font-bold text-white">Free Security Tools</h3>
              <p className="text-sm text-zinc-400">
                Your support keeps our security tools free for researchers, students, and small businesses worldwide.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="pt-6 text-center space-y-2">
              <Users className="h-10 w-10 mx-auto text-blue-400" />
              <h3 className="font-bold text-white">Community Building</h3>
              <p className="text-sm text-zinc-400">
                We're building a network of security professionals sharing knowledge to protect everyone.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="pt-6 text-center space-y-2">
              <Zap className="h-10 w-10 mx-auto text-yellow-400" />
              <h3 className="font-bold text-white">New Development</h3>
              <p className="text-sm text-zinc-400">
                Funding goes directly toward developing new threat intelligence features and integrations.
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
                <Heart className="h-5 w-5 text-orange-400" />
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
                    type="number"
                    min="1"
                    max="1000"
                    placeholder="Enter amount"
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
                    placeholder="Your name"
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
                    type="email"
                    placeholder="your@email.com"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    data-testid="input-donor-email"
                  />
                </div>
              </div>

              <Button 
                className="w-full font-bold text-lg py-6 bg-orange-500 hover:bg-orange-600 text-white" 
                onClick={handleDonate}
                disabled={donateMutation.isPending}
                data-testid="button-donate"
              >
                {donateMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Heart className="h-5 w-5 mr-2" />
                )}
                Donate {customAmount ? `$${customAmount}` : `$${(selectedAmount / 100).toFixed(2)}`}
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
                <Lock className="h-3 w-3" />
                <span>Payments are processed securely by Stripe. We never store your payment information.</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="membership" className="space-y-6">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl font-bold mb-2 text-white">Choose Your Membership</h2>
            <p className="text-zinc-400">
              Become a member to support our work and unlock powerful security features.
              Cancel anytime - all recurring payments are managed securely through Stripe.
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
                <CardHeader className="text-center pb-2">
                  <tier.icon className={`h-12 w-12 mx-auto mb-2 ${tier.popular ? 'text-orange-400' : 'text-zinc-400'}`} />
                  <CardTitle className="text-xl text-white">{tier.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-white">{tier.price}</span>
                    <span className="text-zinc-500">/{tier.interval}</span>
                  </div>
                  <CardDescription className="mt-2 text-zinc-400">{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                        <Check className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full font-bold ${tier.popular ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'}`}
                    variant={tier.popular ? "default" : "outline"}
                    onClick={() => handleSubscribe(tier.name)}
                    disabled={checkoutMutation.isPending}
                    data-testid={`button-subscribe-${tier.name.toLowerCase()}`}
                  >
                    {checkoutMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <CreditCard className="h-4 w-4 mr-2" />
                    )}
                    Subscribe
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
            <Lock className="h-3 w-3" />
            <span>All subscriptions are billed monthly through Stripe. You can cancel anytime. We never store your payment information.</span>
          </div>
        </TabsContent>
        </Tabs>

        <Card className="bg-gradient-to-r from-orange-500/5 to-zinc-900/50 border-orange-500/20">
          <CardContent className="py-8 text-center space-y-4">
            <h3 className="text-2xl font-bold text-white">A Message From the Founder</h3>
            <blockquote className="text-zinc-400 max-w-3xl mx-auto italic leading-relaxed">
              "At STBCS, we don't just track and monitor cybersecurity threats - we live it on the front lines every single day.
              Our team of professional Cybersecurity Consultants, Recovery Engineers, and Threat Hunters handle real 
              Incident Response cases and Ransomware Recovery for small to medium-sized businesses.
              We've seen firsthand the devastation that cyberattacks cause, which is why we built this platform - 
              to help organizations stay ahead of threats before they become disasters.
              Your support helps us continue serving the community that needs it most."
            </blockquote>
            <p className="font-bold text-orange-400">- The STBCS Team</p>
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
