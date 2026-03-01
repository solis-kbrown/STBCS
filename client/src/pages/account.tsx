import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useDocumentTitle } from "@/lib/use-document-title";
import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { User, Crown, CreditCard, Calendar, Shield, ExternalLink, Loader2, ArrowRight, Bell, Mail, Key, Copy, Trash2, Eye, EyeOff, Plus } from "lucide-react";
import { format } from "date-fns";
import { useLocation } from "wouter";
import { useState } from "react";

const tierColors: Record<string, string> = {
  free: "bg-zinc-700 text-zinc-300",
  supporter: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  pro: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  business: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  unlimited: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const tierLabels: Record<string, string> = {
  free: "Free Tier",
  supporter: "STBCS Supporter",
  pro: "STBCS Pro",
  business: "STBCS Business",
  unlimited: "STBCS Unlimited Everything",
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

  const queryClient = useQueryClient();
  const [newKeyName, setNewKeyName] = useState("");
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const account = accountData?.user;
  const subscription = accountData?.subscription;
  const tier = account?.tier || user?.tier || "free";
  const isPaid = tier !== "free";
  const hasPaidApi = tier === "pro" || tier === "business" || tier === "unlimited";

  const { data: apiKeysData, isLoading: keysLoading } = useQuery({
    queryKey: ["api-keys"],
    queryFn: async () => {
      const res = await fetch("/api/account/api-keys", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: isAuthenticated && hasPaidApi,
  });

  const createKeyMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/account/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create API key");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setRevealedKey(data.key);
      setNewKeyName("");
      setShowCreateForm(false);
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast({ title: "API Key Created", description: "Copy your key now — you won't be able to see it again." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const revokeKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/account/api-keys/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to revoke key");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast({ title: "API Key Revoked", description: "The key has been deactivated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

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

        {hasPaidApi && (
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Key className="h-5 w-5 text-orange-400" />
                API Keys
              </CardTitle>
              <CardDescription>
                Access the STBCS Threat Intelligence API programmatically. {tier === "pro" ? "1 key allowed." : tier === "unlimited" ? "Up to 10 keys." : "Up to 5 keys."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {revealedKey && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 space-y-2" data-testid="container-new-key">
                  <p className="text-sm font-medium text-green-400">Your new API key (copy it now):</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-zinc-800 px-3 py-2 rounded text-sm text-green-300 font-mono break-all" data-testid="text-new-api-key">{revealedKey}</code>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                      onClick={() => { navigator.clipboard.writeText(revealedKey); toast({ title: "Copied!" }); }}
                      data-testid="button-copy-key"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-zinc-500">This key will not be shown again. Store it securely.</p>
                  <Button size="sm" variant="ghost" className="text-zinc-400" onClick={() => setRevealedKey(null)} data-testid="button-dismiss-key">
                    Dismiss
                  </Button>
                </div>
              )}

              {keysLoading ? (
                <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-orange-400" /></div>
              ) : apiKeysData?.keys?.length > 0 ? (
                <div className="space-y-3">
                  {apiKeysData.keys.map((key: any) => (
                    <div key={key.id} className={`flex items-center justify-between p-3 rounded-lg border ${key.status === "active" ? "border-zinc-700 bg-zinc-800/50" : "border-zinc-800 bg-zinc-900/30 opacity-60"}`} data-testid={`api-key-${key.id}`}>
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium text-sm">{key.name}</span>
                          <Badge className={key.status === "active" ? "bg-green-500/20 text-green-400 text-[10px]" : "bg-red-500/20 text-red-400 text-[10px]"}>
                            {key.status}
                          </Badge>
                          <Badge className="bg-zinc-700 text-zinc-300 text-[10px]">{key.tier}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-500">
                          <code className="font-mono">{key.prefix}...****</code>
                          <span>Today: {key.todayUsage?.requests || 0}/{key.dailyQuota} requests</span>
                          {key.lastUsedAt && <span>Last used: {format(new Date(key.lastUsedAt), "MMM d, HH:mm")}</span>}
                        </div>
                      </div>
                      {key.status === "active" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:bg-red-500/10 ml-2"
                          onClick={() => { if (confirm("Revoke this API key? This cannot be undone.")) revokeKeyMutation.mutate(key.id); }}
                          disabled={revokeKeyMutation.isPending}
                          data-testid={`button-revoke-key-${key.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 text-center py-2">No API keys yet. Create one to get started.</p>
              )}

              {showCreateForm ? (
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Key name (e.g., 'Production Server')"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white"
                    data-testid="input-key-name"
                  />
                  <Button
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white whitespace-nowrap"
                    onClick={() => newKeyName.trim() && createKeyMutation.mutate(newKeyName.trim())}
                    disabled={createKeyMutation.isPending || !newKeyName.trim()}
                    data-testid="button-create-key-submit"
                  >
                    {createKeyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-zinc-400" onClick={() => { setShowCreateForm(false); setNewKeyName(""); }} data-testid="button-cancel-create">
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 w-full"
                  onClick={() => setShowCreateForm(true)}
                  data-testid="button-create-api-key"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New API Key
                </Button>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <span className="text-xs text-zinc-500">
                  {apiKeysData?.tierLimits ? `${apiKeysData.keys?.filter((k: any) => k.status === "active").length || 0}/${apiKeysData.tierLimits.maxKeys} active keys` : ""}
                </span>
                <Button
                  variant="link"
                  className="text-orange-400 text-xs p-0 h-auto"
                  onClick={() => setLocation("/api-docs")}
                  data-testid="button-view-api-docs"
                >
                  View API Documentation <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
                onClick={() => setLocation("/monitors?tab=alerts")}
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
              <a href="/contact?category=support&subject=Account%20Support" className="w-full">
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
