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
  Building2, DollarSign, Wrench, Link2
} from "lucide-react";
import { useParams, useLocation } from "wouter";
import { useMemo } from "react";

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/ransomware")} className="text-muted-foreground hover:text-white" data-testid="button-back">
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
          <div className="flex gap-2">
            {actor?.ransomwareAsService && <Badge className="bg-purple-700/50 text-purple-300 border-purple-500/30">RaaS</Badge>}
            {actor?.doubleExtortion && <Badge className="bg-red-700/50 text-red-300 border-red-500/30">Double Extortion</Badge>}
            {actor?.dataExfiltration && <Badge className="bg-yellow-700/50 text-yellow-300 border-yellow-500/30">Data Exfiltration</Badge>}
          </div>
        </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {actor?.description && (
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
            )}

            {ttps.length > 0 && (
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
            )}

            {actor?.lawEnforcementActions && (
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
            )}

            <Card className="border-white/5 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-400" /> Recent Victims ({incidents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {incidents.slice(0, 50).map((inc) => (
                    <div key={inc.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors" data-testid={`card-victim-${inc.id}`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{inc.victim}</span>
                          <Badge variant="outline" className={`text-[10px] h-5 ${inc.status === 'Published' ? 'border-red-500/30 text-red-400' : 'border-zinc-500/30 text-zinc-400'}`}>
                            {inc.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                          {inc.sector && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{inc.sector}</span>}
                          {inc.country && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{inc.country}</span>}
                          {inc.dataSize && <span>Data: {inc.dataSize}</span>}
                          {inc.victimRevenue && <span><DollarSign className="h-3 w-3 inline" />{inc.victimRevenue}</span>}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">{formatDate(inc.discoveredAt as any)}</span>
                    </div>
                  ))}
                  {incidents.length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-4">No victim data available for this group.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {(stats?.sectors?.length ?? 0) > 0 && (
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
            )}

            {(stats?.countries?.length ?? 0) > 0 && (
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
            )}

            {(stats?.timeline?.length ?? 0) > 0 && (
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
            )}

            {profileLinks.length > 0 && (
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
            )}

            {govAdvisories.length > 0 && (
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
            )}

            {actor?.encryptionMethod && (
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
            )}
          </div>
        </div>

        <Footer />
      </div>
    </Layout>
  );
}
