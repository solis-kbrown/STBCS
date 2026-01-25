import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Heart, Shield, Users, Zap, Check, Coffee, Rocket, Building2, ExternalLink, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

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
    color: "from-blue-500/20 to-blue-600/10",
    borderColor: "border-blue-500/30",
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
    color: "from-primary/20 to-primary/10",
    borderColor: "border-primary/50",
  },
  {
    name: "Enterprise",
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
    color: "from-purple-500/20 to-purple-600/10",
    borderColor: "border-purple-500/30",
  },
];

export default function SupportPage() {
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
    <div className="space-y-8">
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
        <div className="inline-flex items-center justify-center gap-2 text-primary">
          <Heart className="h-8 w-8 fill-current" />
        </div>
        <h1 className="text-4xl font-display font-bold tracking-tight">Support STBCS</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          STB Cybersecurity is dedicated to making threat intelligence accessible to everyone. 
          Your support helps us maintain free security tools, develop new services, 
          and strengthen the global cybersecurity community.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 py-6">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6 text-center space-y-2">
            <Shield className="h-10 w-10 mx-auto text-primary" />
            <h3 className="font-bold">Free Security Tools</h3>
            <p className="text-sm text-muted-foreground">
              Your support keeps our security tools free for researchers, students, and small businesses worldwide.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6 text-center space-y-2">
            <Users className="h-10 w-10 mx-auto text-blue-400" />
            <h3 className="font-bold">Community Building</h3>
            <p className="text-sm text-muted-foreground">
              We're building a network of security professionals sharing knowledge to protect everyone.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6 text-center space-y-2">
            <Zap className="h-10 w-10 mx-auto text-yellow-400" />
            <h3 className="font-bold">New Development</h3>
            <p className="text-sm text-muted-foreground">
              Funding goes directly toward developing new threat intelligence features and integrations.
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="donate" className="space-y-6">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
          <TabsTrigger value="donate" data-testid="tab-donate">One-Time Donation</TabsTrigger>
          <TabsTrigger value="membership" data-testid="tab-membership">Monthly Membership</TabsTrigger>
        </TabsList>

        <TabsContent value="donate" className="space-y-6">
          <Card className="max-w-xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Make a Donation
              </CardTitle>
              <CardDescription>
                Every contribution helps us maintain and improve our free cybersecurity services.
                No payment information is stored on our servers - all transactions are securely processed by Stripe.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Select an amount</Label>
                <div className="grid grid-cols-5 gap-2">
                  {donationAmounts.map((d) => (
                    <Button
                      key={d.amount}
                      variant={selectedAmount === d.amount && !customAmount ? "default" : "outline"}
                      onClick={() => {
                        setSelectedAmount(d.amount);
                        setCustomAmount("");
                      }}
                      className="font-bold"
                      data-testid={`button-amount-${d.amount}`}
                    >
                      {d.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-amount">Or enter a custom amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="custom-amount"
                    type="number"
                    min="1"
                    max="1000"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="pl-8"
                    data-testid="input-custom-amount"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="donor-name">Name (optional)</Label>
                  <Input
                    id="donor-name"
                    placeholder="Your name"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    data-testid="input-donor-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="donor-email">Email (optional)</Label>
                  <Input
                    id="donor-email"
                    type="email"
                    placeholder="your@email.com"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    data-testid="input-donor-email"
                  />
                </div>
              </div>

              <Button 
                className="w-full font-bold text-lg py-6" 
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

              <p className="text-xs text-center text-muted-foreground">
                Payments are processed securely by Stripe. We never store your payment information.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="membership" className="space-y-6">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl font-bold mb-2">Choose Your Membership</h2>
            <p className="text-muted-foreground">
              Become a member to support our work and unlock powerful security features.
              Cancel anytime - all recurring payments are managed securely through Stripe.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {membershipTiers.map((tier) => (
              <Card 
                key={tier.name} 
                className={`relative bg-gradient-to-b ${tier.color} ${tier.borderColor} ${tier.popular ? 'ring-2 ring-primary' : ''}`}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-2">
                  <tier.icon className="h-12 w-12 mx-auto mb-2 text-primary" />
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground">/{tier.interval}</span>
                  </div>
                  <CardDescription className="mt-2">{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full font-bold"
                    variant={tier.popular ? "default" : "outline"}
                    onClick={() => handleSubscribe(tier.name)}
                    disabled={checkoutMutation.isPending}
                    data-testid={`button-subscribe-${tier.name.toLowerCase()}`}
                  >
                    {checkoutMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <ExternalLink className="h-4 w-4 mr-2" />
                    )}
                    Subscribe
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-xs text-center text-muted-foreground max-w-xl mx-auto">
            All subscriptions are billed monthly through Stripe. You can cancel anytime from your account settings.
            We never store credit card or bank account information - Stripe handles all payment security.
          </p>
        </TabsContent>
      </Tabs>

      <Card className="bg-gradient-to-r from-primary/5 to-blue-500/5 border-primary/20">
        <CardContent className="py-8 text-center space-y-4">
          <h3 className="text-2xl font-bold">A Message From the Founder</h3>
          <blockquote className="text-muted-foreground max-w-3xl mx-auto italic leading-relaxed">
            "STBCS was born from a simple belief: everyone deserves access to quality threat intelligence.
            Whether you're a seasoned security professional or just starting your journey, our tools are here for you.
            Your support - whether through donations, subscriptions, or simply spreading the word - 
            helps us continue this mission. Together, we're building a safer digital world."
          </blockquote>
          <p className="font-bold text-primary">- Kevin Brown, Founder</p>
        </CardContent>
      </Card>

      <div className="text-center space-y-2 text-sm text-muted-foreground pb-8">
        <p>Questions about payments or memberships?</p>
        <p>Contact us at <a href="mailto:billing@stoptbcs.com" className="text-primary hover:underline">billing@stoptbcs.com</a></p>
      </div>
    </div>
  );
}
