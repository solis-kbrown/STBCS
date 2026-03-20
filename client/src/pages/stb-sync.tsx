import { useState } from "react";
import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Shield, Copy, Check, Trash2, Loader2, Crown, RefreshCw,
  Globe, Server, Lock, ChevronDown, ChevronUp, ExternalLink,
  Zap, Clock, Activity, AlertTriangle, Radio
} from "lucide-react";

function timeAgo(date: string | Date | null): string {
  if (!date) return "Never";
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

const listTypeLabels: Record<string, { label: string; desc: string; icon: any }> = {
  ips: { label: "IP Addresses", desc: "Block malicious IPs at the perimeter", icon: Server },
  domains: { label: "Domains", desc: "Block malicious domains and C2 servers", icon: Globe },
  combined: { label: "Combined", desc: "IPs + domains in a single list", icon: Shield },
};

const firewallGuides = [
  {
    name: "Palo Alto Networks",
    steps: [
      "Navigate to Objects → External Dynamic Lists",
      "Click Add and set Type to \"IP List\" or \"Domain List\"",
      "Paste your STB-Sync URL into the Source field",
      "Set Repeat to \"Every 5 minutes\" and click OK",
      "Reference the EDL in a Security Policy rule to block traffic",
    ],
  },
  {
    name: "pfSense / OPNsense",
    steps: [
      "Go to Firewall → Aliases → URLs",
      "Create a new alias with Type \"URL Table (IPs)\"",
      "Paste your STB-Sync URL and set the update frequency",
      "Create a firewall rule using this alias as the source/destination",
      "Apply the changes",
    ],
  },
  {
    name: "Fortinet FortiGate",
    steps: [
      "Navigate to Security Fabric → External Connectors",
      "Select \"Threat Feeds → IP Address\" or \"Domain Name\"",
      "Paste your STB-Sync URL and set the refresh rate",
      "Reference the connector in a firewall policy to deny traffic",
    ],
  },
  {
    name: "SonicWall",
    steps: [
      "Go to Security Services → Botnet Filter → Dynamic List",
      "Click Add and enter a name for the list",
      "Paste your STB-Sync URL in the URL field",
      "Set the download interval and enable the rule",
    ],
  },
];

function STBSyncPage() {
  useDocumentTitle("STB-Sync | Dynamic Firewall Block Lists");
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTokenName, setNewTokenName] = useState("");
  const [newTokenType, setNewTokenType] = useState("ips");
  const [newTokenMaxEntries, setNewTokenMaxEntries] = useState(10000);
  const [newTokenMetadata, setNewTokenMetadata] = useState(false);

  const isBizTier = user && ["business", "enterprise", "unlimited"].includes(user.tier);

  const { data: tokens, isLoading: tokensLoading } = useQuery({
    queryKey: ["/api/sync/tokens"],
    enabled: !!isBizTier,
  });

  const { data: syncStats } = useQuery({
    queryKey: ["/api/sync/stats"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; listType: string; maxEntries: number; includeMetadata: boolean }) => {
      const res = await fetch("/api/sync/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create token");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sync/tokens"] });
      setShowCreateForm(false);
      setNewTokenName("");
      setNewTokenType("ips");
      setNewTokenMaxEntries(10000);
      setNewTokenMetadata(false);
      toast({ title: "Sync token created", description: "Your EDL endpoint is ready to use." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/sync/tokens/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to revoke token");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sync/tokens"] });
      toast({ title: "Token revoked", description: "The sync endpoint has been deactivated." });
    },
  });

  function copyUrl(token: string, type: string) {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/api/sync/${token}/${type}.txt`;
    navigator.clipboard.writeText(url);
    setCopiedId(`${token}-${type}`);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "URL copied", description: "Paste this into your firewall's EDL configuration." });
  }

  const activeTokens = Array.isArray(tokens) ? tokens.filter((t: any) => t.status === "active") : [];
  const revokedTokens = Array.isArray(tokens) ? tokens.filter((t: any) => t.status === "revoked") : [];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="relative overflow-hidden border-b border-zinc-800/50">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-500/5" />
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(251,146,60,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(239,68,68,0.04) 0%, transparent 50%)" }} />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <Radio className="h-6 w-6 text-orange-400" />
              </div>
              <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-xs" data-testid="badge-biz-feature">BIZ TIER</Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight" data-testid="text-page-title">
              STB-Sync
            </h1>
            <p className="text-lg text-zinc-400 max-w-2xl mb-6" data-testid="text-page-description">
              Dynamic Firewall Block Lists — automatically defend your perimeter with real-time threat intelligence from 160+ feeds.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
              {[
                { label: "Threat IPs", value: syncStats?.totalIps?.toLocaleString() || "—", icon: Server },
                { label: "Malicious Domains", value: syncStats?.totalDomains?.toLocaleString() || "—", icon: Globe },
                { label: "Update Frequency", value: "5 min", icon: RefreshCw },
                { label: "Feed Sources", value: "160+", icon: Activity },
              ].map((stat) => (
                <div key={stat.label} className="bg-zinc-900/60 border border-zinc-800/50 rounded-lg p-3 text-center" data-testid={`stat-${stat.label.toLowerCase().replace(/\s/g, "-")}`}>
                  <stat.icon className="h-4 w-4 text-orange-400 mx-auto mb-1.5" />
                  <div className="text-lg font-bold text-white">{stat.value}</div>
                  <div className="text-[11px] text-zinc-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {!user && (
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-8 text-center">
                <Lock className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Sign in Required</h3>
                <p className="text-zinc-400 mb-4">Log in to your account to access STB-Sync features.</p>
                <Button onClick={() => navigate("/account")} className="bg-orange-600 hover:bg-orange-700" data-testid="button-login">
                  Sign In
                </Button>
              </CardContent>
            </Card>
          )}

          {user && !isBizTier && (
            <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-900/50 border-orange-500/20" data-testid="card-upgrade-prompt">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 shrink-0">
                    <Crown className="h-8 w-8 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Upgrade to Business Tier</h3>
                    <p className="text-zinc-400 mb-4 max-w-xl">
                      STB-Sync is available exclusively for Business tier subscribers. Generate authenticated URLs that your firewalls can consume directly — no agents, no hardware changes.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-3 mb-6">
                      {[
                        { icon: Zap, text: "Auto-updating block lists from 160+ threat feeds" },
                        { icon: Shield, text: "Compatible with Palo Alto, pfSense, Fortinet, SonicWall" },
                        { icon: Clock, text: "5-minute refresh intervals for real-time protection" },
                      ].map((feature) => (
                        <div key={feature.text} className="flex items-start gap-2 text-sm text-zinc-300">
                          <feature.icon className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                          <span>{feature.text}</span>
                        </div>
                      ))}
                    </div>
                    <Button onClick={() => navigate("/pricing")} className="bg-orange-600 hover:bg-orange-700" data-testid="button-upgrade">
                      View Pricing
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isBizTier && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white" data-testid="text-tokens-heading">Your Sync Endpoints</h2>
                  <p className="text-sm text-zinc-500 mt-1">
                    {activeTokens.length}/10 active tokens
                  </p>
                </div>
                <Button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="bg-orange-600 hover:bg-orange-700"
                  disabled={activeTokens.length >= 10}
                  data-testid="button-create-token"
                >
                  {showCreateForm ? "Cancel" : "New Sync Token"}
                </Button>
              </div>

              {showCreateForm && (
                <Card className="bg-zinc-900/50 border-orange-500/20" data-testid="card-create-form">
                  <CardHeader>
                    <CardTitle className="text-lg text-white">Create Sync Token</CardTitle>
                    <CardDescription>Configure a new EDL endpoint for your firewall</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-300">Token Name</Label>
                      <Input
                        value={newTokenName}
                        onChange={(e) => setNewTokenName(e.target.value)}
                        placeholder="e.g., Main Firewall, Branch Office, DR Site"
                        className="bg-zinc-800/50 border-zinc-700"
                        maxLength={64}
                        data-testid="input-token-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-zinc-300">List Type</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {Object.entries(listTypeLabels).map(([key, val]) => (
                          <button
                            key={key}
                            onClick={() => setNewTokenType(key)}
                            className={`p-3 rounded-lg border text-left transition-all ${
                              newTokenType === key
                                ? "bg-orange-500/10 border-orange-500/40 text-white"
                                : "bg-zinc-800/30 border-zinc-700/50 text-zinc-400 hover:border-zinc-600"
                            }`}
                            data-testid={`button-type-${key}`}
                          >
                            <val.icon className={`h-4 w-4 mb-1.5 ${newTokenType === key ? "text-orange-400" : "text-zinc-500"}`} />
                            <div className="text-sm font-medium">{val.label}</div>
                            <div className="text-[11px] text-zinc-500 mt-0.5">{val.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-zinc-300">Max Entries: {newTokenMaxEntries.toLocaleString()}</Label>
                      <input
                        type="range"
                        min={1000}
                        max={10000}
                        step={1000}
                        value={newTokenMaxEntries}
                        onChange={(e) => setNewTokenMaxEntries(parseInt(e.target.value))}
                        className="w-full accent-orange-500"
                        data-testid="input-max-entries"
                      />
                      <div className="flex justify-between text-[11px] text-zinc-600">
                        <span>1,000</span>
                        <span>10,000</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Switch
                        checked={newTokenMetadata}
                        onCheckedChange={setNewTokenMetadata}
                        data-testid="switch-metadata"
                      />
                      <div>
                        <Label className="text-zinc-300">Include metadata comments</Label>
                        <p className="text-[11px] text-zinc-500">Add threat type and risk score as comments above each entry</p>
                      </div>
                    </div>

                    <Button
                      onClick={() => createMutation.mutate({
                        name: newTokenName,
                        listType: newTokenType,
                        maxEntries: newTokenMaxEntries,
                        includeMetadata: newTokenMetadata,
                      })}
                      disabled={!newTokenName.trim() || createMutation.isPending}
                      className="bg-orange-600 hover:bg-orange-700 w-full"
                      data-testid="button-submit-token"
                    >
                      {createMutation.isPending ? (
                        <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating...</>
                      ) : (
                        "Create Sync Token"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {tokensLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
                </div>
              )}

              {activeTokens.length > 0 && (
                <div className="space-y-4">
                  {activeTokens.map((token: any) => {
                    const TypeIcon = listTypeLabels[token.listType]?.icon || Shield;
                    return (
                      <Card key={token.id} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors" data-testid={`card-token-${token.id}`}>
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                                <TypeIcon className="h-4 w-4 text-green-400" />
                              </div>
                              <div>
                                <h3 className="text-white font-medium" data-testid={`text-token-name-${token.id}`}>{token.name}</h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px]">Active</Badge>
                                  <span className="text-[11px] text-zinc-500">
                                    {listTypeLabels[token.listType]?.label || token.listType} · Up to {token.maxEntries?.toLocaleString()} entries
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => revokeMutation.mutate(token.id)}
                              className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                              data-testid={`button-revoke-${token.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid sm:grid-cols-3 gap-2 mb-4">
                            {(["ips", "domains", "combined"] as const).map((type) => {
                              const isCopied = copiedId === `${token.token}-${type}`;
                              return (
                                <button
                                  key={type}
                                  onClick={() => copyUrl(token.token, type)}
                                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-xs text-zinc-400 hover:text-orange-400 hover:border-orange-500/30 transition-all group"
                                  data-testid={`button-copy-${type}-${token.id}`}
                                >
                                  {isCopied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5 group-hover:text-orange-400" />}
                                  <span className="truncate font-mono">{type}.txt</span>
                                </button>
                              );
                            })}
                          </div>

                          <div className="flex items-center gap-4 text-[11px] text-zinc-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Last polled: {timeAgo(token.lastPolledAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Activity className="h-3 w-3" />
                              {token.pollCount || 0} total polls
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Created: {timeAgo(token.createdAt)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {!tokensLoading && activeTokens.length === 0 && !showCreateForm && (
                <Card className="bg-zinc-900/30 border-zinc-800/50 border-dashed" data-testid="card-empty-state">
                  <CardContent className="p-12 text-center">
                    <Radio className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-zinc-400 mb-1">No sync tokens yet</h3>
                    <p className="text-sm text-zinc-600 mb-4">Create your first token to generate EDL URLs for your firewalls.</p>
                    <Button onClick={() => setShowCreateForm(true)} className="bg-orange-600 hover:bg-orange-700" data-testid="button-create-first">
                      Create First Token
                    </Button>
                  </CardContent>
                </Card>
              )}

              {revokedTokens.length > 0 && (
                <details className="group">
                  <summary className="cursor-pointer text-sm text-zinc-500 hover:text-zinc-400 transition-colors" data-testid="toggle-revoked">
                    {revokedTokens.length} revoked token{revokedTokens.length > 1 ? "s" : ""}
                  </summary>
                  <div className="mt-3 space-y-2">
                    {revokedTokens.map((token: any) => (
                      <div key={token.id} className="flex items-center gap-3 px-4 py-2 rounded-lg bg-zinc-900/30 border border-zinc-800/30 opacity-60">
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]">Revoked</Badge>
                        <span className="text-sm text-zinc-500">{token.name}</span>
                        <span className="text-[11px] text-zinc-600 ml-auto">{timeAgo(token.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </>
          )}

          <div>
            <h2 className="text-xl font-semibold text-white mb-2" data-testid="text-how-it-works">How It Works</h2>
            <p className="text-sm text-zinc-500 mb-6">STB-Sync turns STBCS threat intelligence into firewall-consumable block lists that update automatically.</p>

            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {[
                {
                  step: "1",
                  title: "Generate a Token",
                  desc: "Create a unique sync token and choose your list type — IPs, domains, or combined.",
                  icon: Lock,
                },
                {
                  step: "2",
                  title: "Copy the EDL URL",
                  desc: "Each token generates an authenticated URL that serves a plain-text block list.",
                  icon: Copy,
                },
                {
                  step: "3",
                  title: "Paste into Your Firewall",
                  desc: "Add the URL as an External Dynamic List. Your firewall polls it automatically.",
                  icon: Shield,
                },
              ].map((item) => (
                <Card key={item.step} className="bg-zinc-900/50 border-zinc-800">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-7 w-7 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-sm font-bold text-orange-400">
                        {item.step}
                      </div>
                      <item.icon className="h-4 w-4 text-zinc-500" />
                    </div>
                    <h3 className="text-white font-medium mb-1">{item.title}</h3>
                    <p className="text-sm text-zinc-500">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2" data-testid="text-setup-guides">Firewall Setup Guides</h2>
            <p className="text-sm text-zinc-500 mb-4">Quick setup instructions for popular enterprise firewalls.</p>

            <div className="space-y-3">
              {firewallGuides.map((guide) => (
                <Card key={guide.name} className="bg-zinc-900/50 border-zinc-800" data-testid={`card-guide-${guide.name.toLowerCase().replace(/\s+/g, "-")}`}>
                  <button
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-800/30 transition-colors rounded-lg"
                    onClick={() => setExpandedGuide(expandedGuide === guide.name ? null : guide.name)}
                    data-testid={`button-guide-${guide.name.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-zinc-800 border border-zinc-700">
                        <Server className="h-4 w-4 text-zinc-400" />
                      </div>
                      <span className="text-white font-medium">{guide.name}</span>
                    </div>
                    {expandedGuide === guide.name ? (
                      <ChevronUp className="h-4 w-4 text-zinc-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-zinc-500" />
                    )}
                  </button>
                  {expandedGuide === guide.name && (
                    <div className="px-4 pb-4">
                      <ol className="space-y-2 ml-11">
                        {guide.steps.map((step, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                            <span className="text-orange-400 font-mono text-xs mt-0.5 shrink-0">{i + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          <Card className="bg-zinc-900/30 border-zinc-800/50" data-testid="card-info">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
                <div className="text-sm text-zinc-400 space-y-1">
                  <p className="text-zinc-300 font-medium">Important Notes</p>
                  <p>Block lists are cached for 5 minutes on the server side. Configure your firewall to poll every 5-60 minutes for optimal balance between freshness and performance.</p>
                  <p>Each token is limited to 30 requests per hour. The token in the URL is your authentication — treat it like a password and do not share it publicly.</p>
                  <p>Lists are served as plain text with one indicator per line, compatible with all major firewall EDL formats.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </Layout>
  );
}

export default STBSyncPage;
