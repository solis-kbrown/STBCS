import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useGroupProfile, useRansomwareAnalytics, type ThreatActor } from "@/lib/api";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, Shield, Globe, Calendar, Users, Target, AlertTriangle, 
  ExternalLink, Skull, FileText, Lock, Eye, TrendingUp, MapPin, 
  Building2, DollarSign, Wrench, Link2, Download, Share2, Copy, QrCode
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useParams, useLocation } from "wouter";
import { useMemo, useEffect, useCallback } from "react";
import { getActorTechniques, getTacticBreakdown, MITRE_TACTICS, TACTIC_COLORS } from "@shared/mitre-attack";
import AnimatedSection from "@/components/animated-section";
import { toSlug } from "@shared/schema";

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "Unknown";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch { return "Unknown"; }
}

function parseListField(field: string | null | undefined): string[] {
  if (!field) return [];
  return field.split(/[|,]/).map(s => s.trim()).filter(Boolean);
}

function StatusBadge({ status, active }: { status: string | null; active: boolean | null }) {
  if (status?.toLowerCase().includes("seized")) {
    return <Badge className="bg-red-700 text-white" data-testid="badge-status"><Lock className="h-3 w-3 mr-1" /> Seized by Law Enforcement</Badge>;
  }
  if (active === false || status?.toLowerCase().includes("inactive")) {
    return <Badge className="bg-zinc-600 text-white" data-testid="badge-status">Inactive</Badge>;
  }
  return <Badge className="bg-green-700 text-white" data-testid="badge-status"><Eye className="h-3 w-3 mr-1" /> Active</Badge>;
}

export default function GroupProfile() {
  const params = useParams<{ name: string }>();
  const groupSlug = decodeURIComponent(params.name || "");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: profile, isLoading } = useGroupProfile(groupSlug || undefined);
  
  const actor = profile?.actor;
  const incidents = profile?.incidents || [];
  const stats = profile?.stats;
  const groupName = actor?.name || incidents[0]?.groupName || groupSlug;

  useDocumentTitle(`${groupName} Ransomware Group Profile | STB Cybersecurity`, `Detailed threat intelligence profile for ${groupName} ransomware group including TTPs, targeted sectors, victim countries, attack timeline, and MITRE ATT&CK mapping.`);

  const ttps = useMemo(() => {
    if (!actor?.ttps) return [];
    return actor.ttps.split(" | ").map(t => {
      const [category, ...tools] = t.split(": ");
      return { category: category?.trim(), tools: tools.join(": ").trim() };
    }).filter(t => t.category && t.tools);
  }, [actor?.ttps]);

  const profileLinks = useMemo(() => {
    if (!actor?.affiliations) return [];
    return actor.affiliations.split(" | ").filter(Boolean).map(link => {
      const mdMatch = link.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (mdMatch) return { label: mdMatch[1], url: mdMatch[2] };
      if (link.startsWith("http")) return { label: new URL(link).hostname, url: link };
      return { label: link, url: "" };
    });
  }, [actor?.affiliations]);

  const govAdvisories = useMemo(() => parseListField(actor?.governmentAdvisories), [actor?.governmentAdvisories]);

  const mitreTechniques = useMemo(() => getActorTechniques(groupName), [groupName]);
  const tacticBreakdown = useMemo(() => getTacticBreakdown(mitreTechniques), [mitreTechniques]);

  const knownCves = useMemo(() => {
    if (!actor?.knownCves) return [];
    return actor.knownCves.split(/[|,\s]+/).map(s => s.trim()).filter(s => /^CVE-\d{4}-\d{4,}$/i.test(s));
  }, [actor?.knownCves]);

  const malwareFamilies = useMemo(() => parseListField(actor?.malwareFamilies), [actor?.malwareFamilies]);
  const attackVectors = useMemo(() => parseListField(actor?.attackVectors), [actor?.attackVectors]);
  const negotiationTactics = useMemo(() => {
    if (!actor?.negotiationTactics) return [];
    return actor.negotiationTactics.split("|").map(s => s.trim()).filter(Boolean);
  }, [actor?.negotiationTactics]);

  const hasFinancialData = !!(actor?.totalRansomCollected || actor?.averageRansom || actor?.negotiationTactics);

  useEffect(() => {
    if (!groupName || groupName === groupSlug) return;
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": groupName,
      "description": actor?.description || `Threat intelligence profile for ${groupName}`,
      "url": window.location.href,
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, [groupName, actor?.description, groupSlug]);

  const handleDownloadDossier = useCallback(() => {
    const dossier = {
      groupName,
      exportedAt: new Date().toISOString(),
      actor: actor || null,
      stats: stats || null,
      incidents: incidents.slice(0, 100),
      mitreTechniques: mitreTechniques.map(t => ({ id: t.id, name: t.name, tactic: t.tactic, url: t.url })),
      knownCves,
      malwareFamilies,
      attackVectors,
    };
    const blob = new Blob([JSON.stringify(dossier, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${toSlug(groupName)}-dossier-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, [groupName, actor, stats, incidents, mitreTechniques, knownCves, malwareFamilies, attackVectors]);

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6 animate-in fade-in duration-500">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-64" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!actor && incidents.length === 0) {
    return (
      <Layout>
        <div className="space-y-6 animate-in fade-in duration-500">
          <Button variant="ghost" onClick={() => setLocation("/ransomware")} className="text-muted-foreground hover:text-white" data-testid="button-back">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Ransomware Tracker
          </Button>
          <Card className="border-white/5 bg-card/50">
            <CardContent className="p-12 text-center">
              <Skull className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Group Not Found</h2>
              <p className="text-muted-foreground">No intelligence data available for "{groupName}".</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <AnimatedSection animation="fade-down">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setLocation("/ransomware")} className="text-muted-foreground hover:text-white" data-testid="button-back" aria-label="Back to ransomware">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-display font-bold text-white" data-testid="text-group-name">{groupName}</h1>
                  <StatusBadge status={actor?.statusMessage || null} active={actor?.active ?? null} />
                </div>
                <p className="text-muted-foreground text-sm mt-1">
                  Threat Actor Intelligence Dossier
                  {actor?.type && <span className="text-orange-400"> &middot; {actor.type}</span>}
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {actor?.ransomwareAsService && <Badge className="bg-purple-700/50 text-purple-300 border-purple-500/30">RaaS</Badge>}
              {actor?.doubleExtortion && <Badge className="bg-red-700/50 text-red-300 border-red-500/30">Double Extortion</Badge>}
              {actor?.dataExfiltration && <Badge className="bg-yellow-700/50 text-yellow-300 border-yellow-500/30">Data Exfiltration</Badge>}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-zinc-500 text-zinc-400 hover:text-white" data-testid="button-share-group">
                    <Share2 className="h-4 w-4 mr-2" /> Share
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800">
                  <DropdownMenuItem onClick={() => {
                    const url = window.location.href;
                    navigator.clipboard.writeText(url);
                    toast({ title: "Link copied", description: `Profile link for ${groupName}`, action: <button className="text-xs text-orange-400 hover:underline whitespace-nowrap" onClick={() => window.open(url, "_blank")}>Open in new tab</button> });
                  }} data-testid="button-share-copy-group">
                    <Copy className="h-4 w-4 mr-2" /> Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={async () => {
                    try {
                      const QRCodeLib = (await import("qrcode")).default;
                      const url = window.location.href;
                      const qrUrl = await QRCodeLib.toDataURL(url, { width: 256, margin: 2, color: { dark: "#ea580c", light: "#18181b" } });
                      const link = document.createElement("a");
                      link.download = `${toSlug(groupName)}-qr.png`;
                      link.href = qrUrl;
                      link.click();
                      toast({ title: "QR code downloaded", description: `QR for ${groupName} profile` });
                    } catch {
                      toast({ title: "Failed to generate QR", variant: "destructive" });
                    }
                  }} data-testid="button-share-qr-group">
                    <QrCode className="h-4 w-4 mr-2" /> QR Code
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" onClick={handleDownloadDossier} className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10" data-testid="button-download-dossier">
                <Download className="h-4 w-4 mr-2" /> Download Dossier
              </Button>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" stagger={1}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-white/5 bg-card/50">
              <CardContent className="p-4 text-center">
                <Users className="h-5 w-5 text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white" data-testid="text-total-victims">{stats?.totalVictims || 0}</div>
                <div className="text-xs text-muted-foreground">Known Victims</div>
              </CardContent>
            </Card>
            <Card className="border-white/5 bg-card/50">
              <CardContent className="p-4 text-center">
                <Calendar className="h-5 w-5 text-orange-400 mx-auto mb-2" />
                <div className="text-sm font-bold text-white">{formatDate(actor?.firstSeen)}</div>
                <div className="text-xs text-muted-foreground">First Seen</div>
              </CardContent>
            </Card>
            <Card className="border-white/5 bg-card/50">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-5 w-5 text-orange-400 mx-auto mb-2" />
                <div className="text-sm font-bold text-white">{formatDate(actor?.lastActive || stats?.recentActivity)}</div>
                <div className="text-xs text-muted-foreground">Last Active</div>
              </CardContent>
            </Card>
            <Card className="border-white/5 bg-card/50">
              <CardContent className="p-4 text-center">
                <Target className="h-5 w-5 text-orange-400 mx-auto mb-2" />
                <div className="text-sm font-bold text-white">{stats?.sectors?.length || 0}</div>
                <div className="text-xs text-muted-foreground">Sectors Targeted</div>
              </CardContent>
            </Card>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {actor?.description && (
              <AnimatedSection animation="fade-up" stagger={2}>
                <Card className="border-white/5 bg-card/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-orange-400" /> Intelligence Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line" data-testid="text-description">{actor.description}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}

            {ttps.length > 0 && (
              <AnimatedSection animation="fade-up" stagger={3}>
                <Card className="border-white/5 bg-card/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-orange-400" /> Tools, Techniques & Procedures (TTPs)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {ttps.map((ttp, i) => (
                        <div key={i} className="flex flex-col gap-1">
                          <span className="text-xs font-mono text-orange-400 uppercase tracking-wider">{ttp.category}</span>
                          <div className="flex flex-wrap gap-1.5">
                            {ttp.tools.split(", ").map((tool, j) => (
                              <Badge key={j} variant="outline" className="bg-white/5 border-white/10 text-zinc-300 text-xs font-mono">
                                {tool}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}

            <AnimatedSection animation="fade-up" stagger={4}>
              <Card className="border-white/5 bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-400" /> MITRE ATT&CK Mapping
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {mitreTechniques.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-4" data-testid="text-no-mitre">No ATT&CK mapping available</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3" data-testid="mitre-grid">
                      {MITRE_TACTICS.filter(tactic => tacticBreakdown[tactic]).map((tactic) => (
                        <div
                          key={tactic}
                          className="rounded-lg border border-white/10 bg-zinc-950/50 overflow-hidden"
                          style={{ borderLeftWidth: "3px", borderLeftColor: TACTIC_COLORS[tactic] }}
                          data-testid={`mitre-tactic-${toSlug(tactic)}`}
                        >
                          <div className="px-3 py-2 border-b border-white/5" style={{ backgroundColor: `${TACTIC_COLORS[tactic]}15` }}>
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: TACTIC_COLORS[tactic] }}>
                              {tactic}
                            </span>
                            <span className="text-[10px] text-muted-foreground ml-2">({tacticBreakdown[tactic].length})</span>
                          </div>
                          <div className="p-2 flex flex-wrap gap-1">
                            {tacticBreakdown[tactic].map((tech) => (
                              <a
                                key={tech.id}
                                href={tech.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-zinc-300 hover:bg-orange-500/20 hover:border-orange-500/30 hover:text-orange-300 transition-colors"
                                data-testid={`mitre-technique-${tech.id}`}
                                title={`${tech.id}: ${tech.name}`}
                              >
                                <span className="text-orange-400/70">{tech.id}</span>
                                <span className="hidden sm:inline">{tech.name}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedSection>

            {actor?.lawEnforcementActions && (
              <AnimatedSection animation="fade-up">
                <Card className="border-red-500/20 bg-red-950/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 text-red-400">
                      <Shield className="h-5 w-5" /> Law Enforcement Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-zinc-300" data-testid="text-law-enforcement">{actor.lawEnforcementActions}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}

            <AnimatedSection animation="fade-up">
              <Card className="border-white/5 bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-400" /> Recent Victims ({incidents.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {incidents.slice(0, 50).map((inc) => (
                      <div key={inc.id} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors" data-testid={`card-victim-${inc.id}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-white">{inc.victim}</span>
                            <Badge variant="outline" className={`text-[10px] h-5 ${inc.status === 'Published' ? 'border-red-500/30 text-red-400' : 'border-zinc-500/30 text-zinc-400'}`}>
                              {inc.status}
                            </Badge>
                            {inc.ransomAmount && (
                              <Badge className="bg-green-900/40 text-green-400 border-green-500/20 text-[10px] h-5" data-testid={`badge-ransom-${inc.id}`}>
                                <DollarSign className="h-2.5 w-2.5 mr-0.5" />{inc.ransomAmount}
                              </Badge>
                            )}
                            {inc.paymentStatus && (
                              <Badge className={`text-[10px] h-5 ${inc.paymentStatus.toLowerCase().includes('paid') ? 'bg-red-900/40 text-red-400 border-red-500/20' : 'bg-zinc-800 text-zinc-400 border-zinc-600/20'}`} data-testid={`badge-payment-${inc.id}`}>
                                {inc.paymentStatus}
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground font-mono flex-shrink-0">{formatDate(inc.discoveredAt as any)}</span>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-muted-foreground">
                          {inc.sector && (
                            <button onClick={() => setLocation(`/ransomware?sector=${encodeURIComponent(inc.sector!)}`)} className="flex items-center gap-1 hover:text-orange-400 transition-colors cursor-pointer" data-testid={`link-sector-${inc.id}`}>
                              <Building2 className="h-3 w-3" />{inc.sector}
                            </button>
                          )}
                          {inc.country && (
                            <button onClick={() => setLocation(`/ransomware?country=${encodeURIComponent(inc.country!)}`)} className="flex items-center gap-1 hover:text-orange-400 transition-colors cursor-pointer" data-testid={`link-country-${inc.id}`}>
                              <MapPin className="h-3 w-3" />{inc.country}
                            </button>
                          )}
                          {inc.attackVector && <span className="flex items-center gap-1"><Shield className="h-3 w-3" />{inc.attackVector}</span>}
                          {inc.dataSize && <span>Data: {inc.dataSize}</span>}
                          {inc.victimRevenue && <span><DollarSign className="h-3 w-3 inline" />{inc.victimRevenue}</span>}
                          {inc.employeeCount && <span><Users className="h-3 w-3 inline mr-0.5" />{inc.employeeCount} employees</span>}
                        </div>
                        {(inc.postUrl || inc.proofUrl || inc.screenshotUrl) && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {inc.postUrl && (
                              <a href={inc.postUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/20 transition-colors" data-testid={`link-post-${inc.id}`}>
                                <ExternalLink className="h-2.5 w-2.5" /> View Post
                              </a>
                            )}
                            {inc.proofUrl && (
                              <a href={inc.proofUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors" data-testid={`link-proof-${inc.id}`}>
                                <Eye className="h-2.5 w-2.5" /> View Proof
                              </a>
                            )}
                            {inc.screenshotUrl && (
                              <a href={inc.screenshotUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 transition-colors" data-testid={`link-screenshot-${inc.id}`}>
                                <FileText className="h-2.5 w-2.5" /> View Screenshot
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    {incidents.length === 0 && (
                      <p className="text-muted-foreground text-sm text-center py-4">No victim data available for this group.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>

          <div className="space-y-6">
            {hasFinancialData && (
              <AnimatedSection animation="fade-left" stagger={1}>
                <Card className="border-green-500/20 bg-green-950/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-green-400">
                      <DollarSign className="h-4 w-4" /> Financial & Ransom Intelligence
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {actor?.totalRansomCollected && (
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Ransom Collected</span>
                          <p className="text-sm font-bold text-green-400" data-testid="text-total-ransom">{actor.totalRansomCollected}</p>
                        </div>
                      )}
                      {actor?.averageRansom && (
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Average Ransom</span>
                          <p className="text-sm font-bold text-green-400" data-testid="text-avg-ransom">{actor.averageRansom}</p>
                        </div>
                      )}
                      {negotiationTactics.length > 0 && (
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Negotiation Tactics</span>
                          <ul className="mt-1 space-y-1">
                            {negotiationTactics.map((tactic, i) => (
                              <li key={i} className="text-xs text-zinc-300 flex items-start gap-1.5">
                                <span className="text-green-400 mt-0.5">•</span>
                                {tactic}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}

            {attackVectors.length > 0 && (
              <AnimatedSection animation="fade-left" stagger={2}>
                <Card className="border-white/5 bg-card/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="h-4 w-4 text-orange-400" /> Attack Vectors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {attackVectors.map((vector, i) => (
                        <Badge key={i} variant="outline" className="bg-orange-500/10 border-orange-500/20 text-orange-300 text-xs" data-testid={`badge-vector-${i}`}>
                          {vector}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}

            {knownCves.length > 0 && (
              <AnimatedSection animation="fade-left" stagger={3}>
                <Card className="border-yellow-500/20 bg-yellow-950/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-yellow-400">
                      <AlertTriangle className="h-4 w-4" /> Known CVEs ({knownCves.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {knownCves.map((cve, i) => (
                        <button
                          key={i}
                          onClick={() => setLocation(`/exploits?search=${encodeURIComponent(cve)}`)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 hover:bg-yellow-500/20 hover:text-yellow-200 transition-colors cursor-pointer"
                          data-testid={`link-cve-${cve}`}
                        >
                          <AlertTriangle className="h-2.5 w-2.5" />
                          {cve}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}

            {malwareFamilies.length > 0 && (
              <AnimatedSection animation="fade-left" stagger={4}>
                <Card className="border-purple-500/20 bg-purple-950/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-purple-400">
                      <Skull className="h-4 w-4" /> Malware Families ({malwareFamilies.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {malwareFamilies.map((family, i) => (
                        <button
                          key={i}
                          onClick={() => setLocation(`/search?q=${encodeURIComponent(family)}`)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 hover:text-purple-200 transition-colors cursor-pointer"
                          data-testid={`link-malware-${i}`}
                        >
                          <Skull className="h-3 w-3" />
                          {family}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}

            {(stats?.sectors?.length ?? 0) > 0 && (
              <AnimatedSection animation="fade-left" stagger={5}>
                <Card className="border-white/5 bg-card/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Target className="h-4 w-4 text-orange-400" /> Targeted Sectors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stats!.sectors.slice(0, 10).map((s, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-sm text-zinc-300 truncate flex-1">{s.name}</span>
                          <div className="flex items-center gap-2 ml-2">
                            <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.min(100, (s.count / (stats!.sectors[0]?.count || 1)) * 100)}%` }} />
                            </div>
                            <span className="text-xs text-muted-foreground font-mono w-6 text-right">{s.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}

            {(stats?.countries?.length ?? 0) > 0 && (
              <AnimatedSection animation="fade-left">
                <Card className="border-white/5 bg-card/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Globe className="h-4 w-4 text-orange-400" /> Targeted Countries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {stats!.countries.slice(0, 10).map((c, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-sm text-zinc-300 truncate flex-1">{c.name}</span>
                          <div className="flex items-center gap-2 ml-2">
                            <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.min(100, (c.count / (stats!.countries[0]?.count || 1)) * 100)}%` }} />
                            </div>
                            <span className="text-xs text-muted-foreground font-mono w-6 text-right">{c.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}

            {(stats?.timeline?.length ?? 0) > 0 && (
              <AnimatedSection animation="fade-left">
                <Card className="border-white/5 bg-card/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-orange-400" /> Activity Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1.5">
                      {stats!.timeline.slice(-12).map((t, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground font-mono">{t.month}</span>
                          <div className="flex items-center gap-2 ml-2">
                            <div className="w-24 h-1.5 rounded-full bg-white/10 overflow-hidden">
                              <div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.min(100, (t.count / Math.max(...stats!.timeline.map(x => x.count), 1)) * 100)}%` }} />
                            </div>
                            <span className="text-muted-foreground font-mono w-6 text-right">{t.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}

            {profileLinks.length > 0 && (
              <AnimatedSection animation="fade-left">
                <Card className="border-white/5 bg-card/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-orange-400" /> Intelligence Reports
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {profileLinks.slice(0, 15).map((link, i) => (
                        <div key={i}>
                          {link.url ? (
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-orange-400 hover:text-orange-300 hover:underline flex items-center gap-1 truncate" data-testid={`link-report-${i}`}>
                              <ExternalLink className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{link.label}</span>
                            </a>
                          ) : (
                            <span className="text-xs text-zinc-400">{link.label}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}

            {govAdvisories.length > 0 && (
              <AnimatedSection animation="fade-left">
                <Card className="border-blue-500/20 bg-blue-950/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-blue-400">
                      <Shield className="h-4 w-4" /> Government Advisories
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {govAdvisories.map((adv, i) => {
                        const urlMatch = adv.match(/\[([^\]]+)\]\(([^)]+)\)/);
                        return (
                          <div key={i}>
                            {urlMatch ? (
                              <a href={urlMatch[2]} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1" data-testid={`link-advisory-${i}`}>
                                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{urlMatch[1]}</span>
                              </a>
                            ) : adv.startsWith("http") ? (
                              <a href={adv} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1" data-testid={`link-advisory-${i}`}>
                                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{adv}</span>
                              </a>
                            ) : (
                              <span className="text-xs text-zinc-400">{adv}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}

            {actor?.encryptionMethod && (
              <AnimatedSection animation="fade-left">
                <Card className="border-white/5 bg-card/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Lock className="h-4 w-4 text-orange-400" /> Encryption Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-zinc-300">{actor.encryptionMethod}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </Layout>
  );
}