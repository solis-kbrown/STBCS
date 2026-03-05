import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDocumentTitle } from "@/lib/use-document-title";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Copy,
  Mail,
  Code,
  MessageSquare,
  Shield,
  ChevronDown,
  ChevronUp,
  Lock,
  Crown,
  Clock,
  Target,
  FileText,
  BarChart3,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

function ThreatLevelBar({ count }: { count: number }) {
  const level = count > 500 ? "CRITICAL" : count > 200 ? "HIGH" : count > 50 ? "MODERATE" : "LOW";
  const colors: Record<string, string> = {
    CRITICAL: "bg-red-500",
    HIGH: "bg-orange-500",
    MODERATE: "bg-yellow-500",
    LOW: "bg-green-500",
  };
  const textColors: Record<string, string> = {
    CRITICAL: "text-red-400",
    HIGH: "text-orange-400",
    MODERATE: "text-yellow-400",
    LOW: "text-green-400",
  };
  const widths: Record<string, string> = {
    CRITICAL: "w-full",
    HIGH: "w-3/4",
    MODERATE: "w-1/2",
    LOW: "w-1/4",
  };

  return (
    <div className="flex items-center gap-3" data-testid="threat-level-bar">
      <span className={`text-xs font-bold tracking-wider ${textColors[level]}`}>{level}</span>
      <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full ${colors[level]} ${widths[level]} rounded-full transition-all duration-500`} />
      </div>
      <span className="text-xs text-zinc-500">{count.toLocaleString()} threats</span>
    </div>
  );
}

function BrandBadge({ name, count }: { name: string; count: number }) {
  const brandColors: Record<string, string> = {
    "Microsoft 365": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "Google": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    "Apple": "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
    "Amazon": "bg-amber-500/20 text-amber-400 border-amber-500/30",
    "PayPal": "bg-blue-600/20 text-blue-300 border-blue-600/30",
    "Netflix": "bg-red-500/20 text-red-400 border-red-500/30",
    "Facebook / Meta": "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  };
  const color = brandColors[name] || "bg-orange-500/20 text-orange-400 border-orange-500/30";
  return (
    <Badge className={`${color} text-xs`} data-testid={`badge-brand-${name.toLowerCase().replace(/\s+/g, "-")}`}>
      <Target className="h-3 w-3 mr-1" aria-hidden="true" />
      {name} ({count})
    </Badge>
  );
}

export default function AwarenessPage() {
  useDocumentTitle("Do Not Click — Phishing Awareness Feeds | STB Cybersecurity");
  const { isPro } = useAuth();
  const { toast } = useToast();
  const [expandedBulletin, setExpandedBulletin] = useState<string | null>(null);
  const [archivePage, setArchivePage] = useState(1);

  const { data: latestData, isLoading } = useQuery({
    queryKey: ["awareness-latest"],
    queryFn: async () => {
      const res = await fetch("/api/awareness/latest");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: statsData } = useQuery({
    queryKey: ["awareness-stats"],
    queryFn: async () => {
      const res = await fetch("/api/awareness/stats");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: archiveData, isLoading: archiveLoading } = useQuery({
    queryKey: ["awareness-archive", archivePage],
    queryFn: async () => {
      const res = await fetch(`/api/awareness/bulletins?page=${archivePage}&limit=10`, {
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 403) return { locked: true };
        throw new Error("Failed to fetch");
      }
      return res.json();
    },
    enabled: isPro,
  });

  const bulletin = latestData?.bulletin;
  const topBrands: { name: string; count: number }[] = bulletin?.topBrands || [];
  const metadata = bulletin?.metadata || {};

  const copyToClipboard = async (format: "text" | "html" | "markdown") => {
    if (!bulletin) return;
    const content = format === "html" ? bulletin.contentHtml : format === "markdown" ? bulletin.contentMarkdown : bulletin.content;
    if (!content) {
      toast({ title: "No content available", variant: "destructive" });
      return;
    }
    try {
      if (format === "html") {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([content], { type: "text/html" }),
            "text/plain": new Blob([bulletin.content || ""], { type: "text/plain" }),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(content);
      }
      const labels = { text: "plain text (email)", html: "HTML (rich email)", markdown: "Markdown (Slack/Teams)" };
      toast({ title: `Copied as ${labels[format]}`, description: "Paste into your email client or messaging app" });
    } catch {
      toast({ title: "Copy failed", description: "Try selecting the text manually", variant: "destructive" });
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="relative overflow-hidden rounded-xl border border-red-500/30 bg-gradient-to-br from-red-950/40 via-zinc-900 to-zinc-900 p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-lg px-3 py-1.5">
                <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
                <span className="text-red-400 font-bold text-sm tracking-wide">PHISHING ALERT</span>
              </div>
              <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 text-xs">
                <Clock className="h-3 w-3 mr-1" aria-hidden="true" />
                {bulletin?.date ? format(new Date(bulletin.date), "MMM d, yyyy") : "Loading..."}
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white" data-testid="heading-awareness">
              Do Not Click
            </h1>
            <p className="text-zinc-400 max-w-2xl text-sm sm:text-base">
              Automated phishing awareness bulletins generated from real-time threat intelligence.
              Copy and send to your team in under 60 seconds.
            </p>
            {bulletin && <ThreatLevelBar count={bulletin.totalThreats} />}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Phishing URLs Tracked", value: statsData?.phishingUrlsTracked?.toLocaleString() || "...", icon: Target },
            { label: "Brands Monitored", value: statsData?.brandsMonitored || "40+", icon: Shield },
            { label: "Bulletins Generated", value: statsData?.totalBulletins?.toLocaleString() || "...", icon: FileText },
            { label: "Output Formats", value: statsData?.formatsAvailable || "3", icon: BarChart3 },
          ].map((stat, i) => (
            <Card key={i} className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-4 text-center">
                <stat.icon className="h-5 w-5 text-orange-400 mx-auto mb-2" aria-hidden="true" />
                <p className="text-xl font-bold text-white" data-testid={`stat-value-${i}`}>{stat.value}</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {isLoading ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
            </CardContent>
          </Card>
        ) : bulletin ? (
          <Card className="bg-zinc-900 border-zinc-800 overflow-hidden" data-testid="card-latest-bulletin">
            <CardHeader className="border-b border-zinc-800 bg-zinc-900/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Mail className="h-5 w-5 text-orange-400" aria-hidden="true" />
                    Latest {bulletin.period === "weekly" ? "Weekly" : "Daily"} Bulletin
                  </CardTitle>
                  <p className="text-zinc-500 text-xs mt-1">
                    {format(new Date(bulletin.date), "EEEE, MMMM d, yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-zinc-600 text-zinc-300 hover:text-orange-400 hover:border-orange-500/50 text-xs"
                    onClick={() => copyToClipboard("text")}
                    data-testid="button-copy-text"
                  >
                    <Copy className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                    Copy as Email
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-zinc-600 text-zinc-300 hover:text-orange-400 hover:border-orange-500/50 text-xs"
                    onClick={() => copyToClipboard("html")}
                    data-testid="button-copy-html"
                  >
                    <Code className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                    Copy as HTML
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-zinc-600 text-zinc-300 hover:text-orange-400 hover:border-orange-500/50 text-xs"
                    onClick={() => copyToClipboard("markdown")}
                    data-testid="button-copy-markdown"
                  >
                    <MessageSquare className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                    Copy for Slack
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {metadata?.suggestedSubject && (
                <div className="bg-zinc-800/60 border border-zinc-700 rounded-lg p-4">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 font-semibold">Suggested Email Subject</p>
                  <div className="flex items-start gap-2">
                    <p className="text-white text-sm font-medium flex-1" data-testid="text-suggested-subject">
                      {metadata.suggestedSubject}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="shrink-0 h-7 px-2 text-zinc-400 hover:text-orange-400"
                      onClick={() => {
                        navigator.clipboard.writeText(metadata.suggestedSubject);
                        toast({ title: "Subject line copied" });
                      }}
                      data-testid="button-copy-subject"
                    >
                      <Copy className="h-3 w-3" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              )}

              {topBrands.length > 0 && (
                <div>
                  <p className="text-[10px] text-red-400 uppercase tracking-wider mb-2 font-semibold">Top Targeted Brands</p>
                  <div className="flex flex-wrap gap-2" data-testid="brands-list">
                    {topBrands.map((b: { name: string; count: number }) => (
                      <BrandBadge key={b.name} name={b.name} count={b.count} />
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2 font-semibold">Full Bulletin</p>
                <Tabs defaultValue="plaintext" className="w-full">
                  <TabsList className="bg-zinc-800 border border-zinc-700 mb-3">
                    <TabsTrigger value="plaintext" className="text-xs" data-testid="tab-plaintext">Plain Text</TabsTrigger>
                    <TabsTrigger value="html" className="text-xs" data-testid="tab-html">HTML Preview</TabsTrigger>
                    <TabsTrigger value="markdown" className="text-xs" data-testid="tab-markdown">Markdown</TabsTrigger>
                  </TabsList>
                  <TabsContent value="plaintext">
                    <div
                      className="bg-zinc-950 border border-zinc-800 rounded-lg p-5 font-mono text-xs text-zinc-300 whitespace-pre-wrap overflow-x-auto max-h-[600px] overflow-y-auto leading-relaxed"
                      data-testid="bulletin-content-text"
                    >
                      {bulletin.content}
                    </div>
                  </TabsContent>
                  <TabsContent value="html">
                    <div
                      className="bg-white rounded-lg overflow-hidden max-h-[600px] overflow-y-auto border border-zinc-700"
                      data-testid="bulletin-content-html"
                    >
                      <iframe
                        srcDoc={bulletin.contentHtml || ""}
                        className="w-full min-h-[500px] border-0"
                        title="Bulletin HTML Preview"
                        sandbox="allow-same-origin"
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="markdown">
                    <div
                      className="bg-zinc-950 border border-zinc-800 rounded-lg p-5 font-mono text-xs text-zinc-300 whitespace-pre-wrap overflow-x-auto max-h-[600px] overflow-y-auto leading-relaxed"
                      data-testid="bulletin-content-markdown"
                    >
                      {bulletin.contentMarkdown}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="text-center py-16 space-y-3">
              <AlertTriangle className="h-10 w-10 text-zinc-600 mx-auto" aria-hidden="true" />
              <p className="text-zinc-400">No bulletins generated yet. Check back shortly.</p>
              <p className="text-zinc-600 text-xs">Bulletins are generated daily at 07:00 UTC from live threat data.</p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-zinc-900 border-zinc-800" data-testid="card-archive">
          <CardHeader className="border-b border-zinc-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-400" aria-hidden="true" />
                Bulletin Archive
              </CardTitle>
              {!isPro && (
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                  <Crown className="h-3 w-3 mr-1" aria-hidden="true" />
                  PRO
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {!isPro ? (
              <div className="text-center py-8 space-y-3">
                <Lock className="h-8 w-8 text-zinc-600 mx-auto" aria-hidden="true" />
                <p className="text-zinc-400 text-sm">Upgrade to PRO to access the full bulletin archive</p>
                <p className="text-zinc-600 text-xs">Browse all daily and weekly bulletins with full history</p>
                <Button
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-white mt-2"
                  onClick={() => window.location.href = "/pricing"}
                  data-testid="button-upgrade-archive"
                >
                  <Crown className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
                  Upgrade to PRO
                </Button>
              </div>
            ) : archiveLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
              </div>
            ) : archiveData?.bulletins?.length > 0 ? (
              <div className="space-y-3">
                {archiveData.bulletins.map((b: any) => (
                  <div
                    key={b.id}
                    className="border border-zinc-800 rounded-lg overflow-hidden"
                    data-testid={`archive-bulletin-${b.id}`}
                  >
                    <button
                      className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors text-left"
                      onClick={() => setExpandedBulletin(expandedBulletin === b.id ? null : b.id)}
                      data-testid={`button-expand-${b.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <Badge className={b.period === "weekly" ? "bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px]" : "bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]"}>
                          {b.period === "weekly" ? "Weekly" : "Daily"}
                        </Badge>
                        <span className="text-white text-sm font-medium">
                          {format(new Date(b.date), "MMM d, yyyy")}
                        </span>
                        <span className="text-zinc-500 text-xs">
                          {b.totalThreats.toLocaleString()} threats
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="hidden sm:flex gap-1">
                          {(b.topBrands || []).slice(0, 3).map((brand: any) => (
                            <Badge key={brand.name} className="bg-zinc-800 text-zinc-400 border-zinc-700 text-[10px]">
                              {brand.name}
                            </Badge>
                          ))}
                        </div>
                        {expandedBulletin === b.id
                          ? <ChevronUp className="h-4 w-4 text-zinc-500" aria-hidden="true" />
                          : <ChevronDown className="h-4 w-4 text-zinc-500" aria-hidden="true" />
                        }
                      </div>
                    </button>
                    {expandedBulletin === b.id && (
                      <ExpandedBulletin id={b.id} />
                    )}
                  </div>
                ))}
                {archiveData.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-zinc-700 text-zinc-400"
                      disabled={archivePage <= 1}
                      onClick={() => setArchivePage(p => p - 1)}
                      data-testid="button-archive-prev"
                    >
                      Previous
                    </Button>
                    <span className="text-zinc-500 text-xs px-2">
                      Page {archivePage} of {archiveData.totalPages}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-zinc-700 text-zinc-400"
                      disabled={archivePage >= archiveData.totalPages}
                      onClick={() => setArchivePage(p => p + 1)}
                      data-testid="button-archive-next"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-zinc-500 text-sm text-center py-8">No archived bulletins yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </Layout>
  );
}

function ExpandedBulletin({ id }: { id: string }) {
  const { toast } = useToast();
  const { data, isLoading } = useQuery({
    queryKey: ["awareness-bulletin", id],
    queryFn: async () => {
      const res = await fetch(`/api/awareness/bulletins/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="border-t border-zinc-800 p-6 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-orange-400" />
      </div>
    );
  }

  const b = data?.bulletin;
  if (!b) return null;

  return (
    <div className="border-t border-zinc-800 p-4 space-y-3 bg-zinc-950/50">
      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant="outline"
          className="border-zinc-700 text-zinc-400 hover:text-orange-400 text-xs h-7"
          onClick={() => {
            navigator.clipboard.writeText(b.content || "");
            toast({ title: "Plain text copied" });
          }}
          data-testid={`button-copy-archive-text-${id}`}
        >
          <Copy className="h-3 w-3 mr-1" aria-hidden="true" /> Email
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-zinc-700 text-zinc-400 hover:text-orange-400 text-xs h-7"
          onClick={() => {
            navigator.clipboard.writeText(b.contentMarkdown || "");
            toast({ title: "Markdown copied" });
          }}
          data-testid={`button-copy-archive-md-${id}`}
        >
          <Copy className="h-3 w-3 mr-1" aria-hidden="true" /> Slack
        </Button>
      </div>
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-[11px] text-zinc-400 whitespace-pre-wrap overflow-x-auto max-h-[400px] overflow-y-auto leading-relaxed">
        {b.content}
      </div>
    </div>
  );
}
