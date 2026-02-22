import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useDocumentTitle } from "@/lib/use-document-title";
import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User, Crown, CreditCard, Calendar, Shield, ExternalLink, Loader2, ArrowRight, Bell, Mail } from "lucide-react";
import { format } from "date-fns";
import { useLocation } from "wouter";

const tierColors: Record<string, string> = {
  free: "bg-zinc-700 text-zinc-300",
  supporter: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  pro: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  business: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const tierLabels: Record<string, string> = {
  free: "Free Tier",
  supporter: "STBCS Supporter",
  pro: "STBCS Pro",
  business: "STBCS Business",
};

export default function AccountPage() {
  useDocumentTitle("My Account | STB Cybersecurity");
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: accountData, isLoading } = useQuery({
    queryKey: ["account"],
    queryFn: async () => {
      const res = await fetch("/api/account", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch account");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const portalMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to open billing portal");
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
        </div>
        <Footer />
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="max-w-lg mx-auto text-center py-20 space-y-4">
          <img src="/brand/icon-shield.png" alt="STBCS" className="h-20 w-20 mx-auto drop-shadow-[0_0_10px_rgba(239,68,68,0.3)] opacity-70" />
          <h1 className="text-2xl font-bold text-white">Sign in to view your account</h1>
          <p className="text-zinc-400">You need to be logged in to access your account settings and subscription details.</p>
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={() => setLocation("/")}
            data-testid="button-go-home"
          >
            Go to Homepage
          </Button>
        </div>
        <Footer />
      </Layout>
    );
  }

  const account = accountData?.user;
  const subscription = accountData?.subscription;
  const tier = account?.tier || user?.tier || "free";
  const isPaid = tier !== "free";

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-white" data-testid="text-account-title">My Account</h1>
          <p className="text-zinc-400">Manage your account, subscription, and preferences.</p>
        </div>

        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <User className="h-5 w-5 text-orange-400" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Username</p>
                <p className="text-white font-medium" data-testid="text-account-username">{account?.username || user?.username}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Email</p>
                <p className="text-white font-medium" data-testid="text-account-email">{account?.email || user?.email || "Not set"}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Membership</p>
                <Badge className={`${tierColors[tier] || tierColors.free}`} data-testid="badge-account-tier">
                  {isPaid && <Crown className="h-3 w-3 mr-1" />}
                  {tierLabels[tier] || tier}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Member Since</p>
                <p className="text-white font-medium flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                  {account?.createdAt ? format(new Date(account.createdAt), "MMMM d, yyyy") : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-orange-400" />
              Subscription & Billing
            </CardTitle>
            <CardDescription>
              {isPaid
                ? "Manage your subscription, update payment methods, or view invoices."
                : "Upgrade to a paid plan to unlock advanced features."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Status</p>
                    <Badge className={subscription.status === "active" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"} data-testid="badge-subscription-status">
                      {subscription.status === "active" ? "Active" : subscription.status}
                    </Badge>
                    {subscription.cancelAtPeriodEnd && (
                      <p className="text-xs text-yellow-400 mt-1">Cancels at end of billing period</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Current Period</p>
                    <p className="text-white text-sm">
                      {subscription.currentPeriodStart && format(new Date(subscription.currentPeriodStart * 1000), "MMM d")}
                      {" - "}
                      {subscription.currentPeriodEnd && format(new Date(subscription.currentPeriodEnd * 1000), "MMM d, yyyy")}
                    </p>
                  </div>
                  {subscription.currentPeriodEnd && (
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                        {subscription.cancelAtPeriodEnd ? "Access Until" : "Next Renewal"}
                      </p>
                      <p className="text-white text-sm">
                        {format(new Date(subscription.currentPeriodEnd * 1000), "MMMM d, yyyy")}
                      </p>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                  onClick={() => portalMutation.mutate()}
                  disabled={portalMutation.isPending}
                  data-testid="button-manage-subscription"
                >
                  {portalMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ExternalLink className="h-4 w-4 mr-2" />
                  )}
                  Manage Subscription
                </Button>
                <p className="text-[11px] text-zinc-500">
                  Update payment method, view invoices, or cancel your subscription through Stripe's secure billing portal.
                </p>
              </>
            ) : isPaid && account?.hasStripeCustomer ? (
              <>
                <p className="text-sm text-zinc-400">Your subscription is being set up. If this persists, please contact support.</p>
                <Button
                  variant="outline"
                  className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                  onClick={() => portalMutation.mutate()}
                  disabled={portalMutation.isPending}
                  data-testid="button-manage-billing"
                >
                  {portalMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ExternalLink className="h-4 w-4 mr-2" />}
                  View Billing
                </Button>
              </>
            ) : (
              <div className="text-center py-4 space-y-3">
                <p className="text-zinc-400 text-sm">You're currently on the free tier.</p>
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => setLocation("/support")}
                  data-testid="button-upgrade"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade Your Plan
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-400" />
              Quick Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="justify-start border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                onClick={() => setLocation("/alerts")}
                data-testid="button-go-alerts"
              >
                <Bell className="h-4 w-4 mr-2 text-orange-400" />
                Alert Preferences
              </Button>
              <Button
                variant="outline"
                className="justify-start border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                onClick={() => setLocation("/support")}
                data-testid="button-go-support"
              >
                <CreditCard className="h-4 w-4 mr-2 text-orange-400" />
                Support & Membership
              </Button>
              <a href="mailto:support@stbcybersecurity.com" className="w-full">
                <Button
                  variant="outline"
                  className="w-full justify-start border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  data-testid="button-contact-support"
                >
                  <Mail className="h-4 w-4 mr-2 text-orange-400" />
                  Contact Support
                </Button>
              </a>
              <Button
                variant="outline"
                className="justify-start border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                onClick={() => setLocation("/api-docs")}
                data-testid="button-go-api-docs"
              >
                <ExternalLink className="h-4 w-4 mr-2 text-orange-400" />
                API Documentation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </Layout>
  );
}
