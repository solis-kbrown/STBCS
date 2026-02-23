import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useStats, useCves, useRansomware, useRefreshData, useTrends, useLastRefresh } from "@/lib/api";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Shield, Skull, Activity, Lock, ExternalLink, RefreshCw, Globe, Link2, AlertTriangle, Wrench, Scan, ShieldCheck, Users, Database, Factory, ChevronRight } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo, useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import AnimatedMap from "@/components/animated-map";
import AnimatedSection, { AnimatedList } from "@/components/animated-section";
import { useInView, useCountUp } from "@/hooks/use-in-view";

function CountUpStat({ value, label, icon: Icon, color, change, index }: {
  value: number; label: string; icon: any; color: string; change: string; index: number;
}) {
  const { ref, isInView } = useInView();
  const { count, start } = useCountUp(value, 1000, true);

  useEffect(() => {
    if (isInView) start();
  }, [isInView, start]);

  return (
    <div ref={ref}>
      <Card className={`border-white/5 bg-card/50 backdrop-blur-sm card-interactive anim-fade-up stagger-${Math.min(index + 1, 7)} ${isInView ? "in-view" : ""}`} data-testid={`card-stat-${index}`}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className={`p-1.5 rounded-lg bg-background border border-white/5 ${color} icon-hover`}>
              <Icon className="h-4 w-4" />
            </div>
            <Badge variant="outline" className="bg-background/50 border-white/10 text-[10px] px-1.5">
              {change}
            </Badge>
          </div>
          <div className="space-y-0.5">
            <h3 className="text-2xl font-display font-bold text-white stat-value" data-testid={`text-stat-value-${index}`}>
              {isInView ? count.toLocaleString() : "0"}
            </h3>
            <p className="text-xs text-muted-foreground font-medium">{label}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Dashboard() {
  useDocumentTitle("STB Cybersecurity | Real-Time Threat Intelligence for SMBs", "Track ransomware, CVEs, and malicious IPs across 45+ live feeds. Get 24/7 incident response, ransomware recovery, and threat hunting for your business.");
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: cvesData, isLoading: cvesLoading } = useCves(5);
  const { data: ransomwareData, isLoading: ransomwareLoading } = useRansomware(5);
  const { data: trends, isLoading: trendsLoading } = useTrends(14);
  const { data: refreshInfo } = useLastRefresh();
  const refreshMutation = useRefreshData();

  const cves = cvesData?.data || [];
  const ransomware = ransomwareData?.data || [];

  const chartData = useMemo(() => {
    if (!trends) return [];
    const dateMap = new Map<string, { name: string; cves: number; ransomware: number }>();
    trends.cvesByDay.forEach(d => {
      const label = format(parseISO(d.date), "MMM d");
      dateMap.set(d.date, { name: label, cves: d.count, ransomware: 0 });
    });
    trends.ransomwareByDay.forEach(d => {
      const existing = dateMap.get(d.date);
      if (existing) {
        existing.ransomware = d.count;
      } else {
        const label = format(parseISO(d.date), "MMM d");
        dateMap.set(d.date, { name: label, cves: 0, ransomware: d.count });
      }
    });
    return Array.from(dateMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v);
  }, [trends]);

  return (
    <Layout>
      <div className="space-y-8 page-transition">
        
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-card h-64 flex items-center">
          <div className="absolute inset-0 z-0">
            <AnimatedMap />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"></div>
          </div>
          
          <div className="relative z-10 p-8 max-w-2xl">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/50 hover:bg-primary/30 glow-pulse" data-testid="badge-threat-level">
              <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse motion-reduce:animate-none"></span>
              LIVE THREAT LEVEL: ELEVATED
            </Badge>
            <h1 className="text-4xl font-display font-bold text-white mb-2 tracking-wide">
              KNOW THE THREAT <span className="text-primary">BEFORE IT HITS</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              45+ live threat feeds. Ransomware tracking. CVE monitoring. When your business faces an attack, our incident response team is one call away.
            </p>
            <div className="flex gap-4">
              <Button className="bg-primary hover:bg-primary/90 text-white font-bold btn-press" data-testid="button-view-incidents" asChild>
                <a href="/ransomware">SEE ACTIVE THREATS</a>
              </Button>
              <Button 
                variant="outline" 
                className="border-primary/30 text-primary hover:bg-primary/10 btn-press"
                onClick={() => refreshMutation.mutate()}
                disabled={refreshMutation.isPending}
                data-testid="button-refresh-data"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? 'animate-spin motion-reduce:animate-none' : ''}`} />
                REFRESH DATA
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          {statsLoading ? (
            Array(7).fill(0).map((_, i) => (
              <Card key={i} className="border-white/5 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-6 rounded-lg mb-3" />
                  <Skeleton className="h-6 w-12 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))
          ) : (
            [
              { title: "Ransomware Groups", value: stats?.activeGroups || 0, change: "Live", icon: Skull, color: "text-primary" },
              { title: "Critical CVEs", value: stats?.criticalCves || 0, change: "High", icon: Shield, color: "text-destructive" },
              { title: "Active Exploits", value: stats?.activeExploits || 0, change: "Active", icon: Activity, color: "text-secondary" },
              { title: "Incidents", value: stats?.totalIncidents || 0, change: "Total", icon: Lock, color: "text-green-500" },
              { title: "Malicious IPs", value: stats?.maliciousIps || 0, change: "Tracked", icon: Globe, color: "text-orange-500" },
              { title: "Malicious URLs", value: stats?.maliciousUrls || 0, change: "Active", icon: Link2, color: "text-yellow-500" },
              { title: "CISA KEV", value: stats?.cisaKevCount || 0, change: "Exploited", icon: AlertTriangle, color: "text-red-400" },
            ].map((stat, i) => (
              <CountUpStat key={i} value={stat.value} label={stat.title} icon={stat.icon} color={stat.color} change={stat.change} index={i} />
            ))
          )}
        </div>

        {refreshInfo?.lastRefresh && (
          <div className="flex items-center justify-end gap-2 text-xs text-zinc-500" data-testid="text-last-refresh">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse motion-reduce:animate-none"></span>
            Feeds updated {(() => {
              const diff = Date.now() - (refreshInfo.timestamp || 0);
              const mins = Math.floor(diff / 60000);
              if (mins < 1) return "just now";
              if (mins < 60) return `${mins}m ago`;
              return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
            })()}
            <span className="text-zinc-600">|</span>
            Next refresh in {(() => {
              const ms = refreshInfo.nextRefreshIn || 0;
              const mins = Math.max(0, Math.ceil(ms / 60000));
              return mins <= 0 ? "soon" : `${mins}m`;
            })()}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AnimatedSection animation="fade-up" className="col-span-2">
            <Card className="border-white/5 bg-card/50 border-glow">
              <CardHeader>
                <CardTitle className="font-display">Threat Velocity</CardTitle>
                <CardDescription>How fast new vulnerabilities and ransomware attacks are emerging</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {trendsLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Skeleton className="w-full h-full rounded-lg" />
                  </div>
                ) : chartData.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    No trend data available yet
                  </div>
                ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorCves" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRansomware" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="cves" 
                      name="New CVEs"
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorCves)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="ransomware" 
                      name="Ransomware Incidents"
                      stroke="hsl(var(--secondary))" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorRansomware)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection animation="fade-right" stagger={2}>
            <Card className="col-span-1 border-white/5 bg-card/50">
              <CardHeader>
                <CardTitle className="font-display">Top Active Exploits</CardTitle>
                <CardDescription>Vulnerabilities attackers are targeting right now</CardDescription>
              </CardHeader>
              <CardContent>
                <AnimatedList className="space-y-4">
                  {cvesLoading ? (
                    Array(4).fill(0).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-3">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-8 w-8 rounded" />
                      </div>
                    ))
                  ) : cves.length > 0 ? (
                    cves.slice(0, 4).map((cve) => (
                      <div key={cve.id} className="group flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-white/10 hover:bg-white/5 transition-all duration-200" data-testid={`card-cve-${cve.cveId}`}>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white group-hover:text-secondary transition-colors">{cve.cveId}</span>
                            <Badge variant="destructive" className="text-[10px] h-5 px-1">{cve.score?.toFixed(1)}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate max-w-[180px]">{cve.platform}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-white"
                          onClick={() => window.open(`https://nvd.nist.gov/vuln/detail/${cve.cveId}`, '_blank')}
                          aria-label="View CVE details"
                        >
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">Vulnerability data loading. Hit Refresh to pull the latest.</p>
                  )}
                </AnimatedList>
                <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-primary mt-4" asChild>
                  <a href="/exploits">VIEW ALL EXPLOITS</a>
                </Button>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>

        <AnimatedSection animation="fade-up">
          <Card className="border-white/5 bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-display">Recent Ransomware Incidents</CardTitle>
                <CardDescription>Live feed tracking new victims claimed by ransomware groups</CardDescription>
              </div>
              <Button variant="outline" className="border-white/10 hover:bg-white/5 text-xs btn-press" data-testid="button-export-csv" asChild>
                <a href="/support"><ExternalLink className="h-3 w-3 mr-2" aria-hidden="true" />EXPORT CSV (PRO)</a>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                {ransomwareLoading ? (
                  <div className="space-y-4 p-4">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className="flex gap-4">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-20 ml-auto" />
                      </div>
                    ))}
                  </div>
                ) : ransomware.length > 0 ? (
                  <table className="w-full text-sm text-left rtl:text-right text-gray-400">
                    <thead className="text-xs uppercase bg-white/5 text-gray-300">
                      <tr>
                        <th scope="col" className="px-6 py-3 font-mono">Date</th>
                        <th scope="col" className="px-6 py-3 font-mono">Victim</th>
                        <th scope="col" className="px-6 py-3 font-mono">Group</th>
                        <th scope="col" className="px-6 py-3 font-mono">Sector</th>
                        <th scope="col" className="px-6 py-3 font-mono text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ransomware.map((incident, idx) => (
                        <tr 
                          key={incident.id} 
                          className="border-b border-white/5 hover:bg-white/5 transition-all duration-200"
                          style={{ animation: `fadeInLeft 0.4s ease-out ${idx * 80}ms both` }}
                          data-testid={`row-ransomware-${incident.id}`}
                        >
                          <td className="px-6 py-4 font-mono text-xs">{incident.discoveredAt ? new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(incident.discoveredAt)) : 'N/A'}</td>
                          <td className="px-6 py-4 font-medium text-white">{incident.victim}</td>
                          <td className="px-6 py-4 text-primary font-bold">{incident.groupName}</td>
                          <td className="px-6 py-4">{incident.sector}</td>
                          <td className="px-6 py-4 text-right">
                            <Badge variant="outline" className={
                              incident.status === "Published" ? "border-destructive text-destructive bg-destructive/10" :
                              incident.status === "Negotiating" ? "border-yellow-500 text-yellow-500 bg-yellow-500/10" :
                              "border-muted text-muted-foreground"
                            }>
                              {incident.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Incident data loading. Hit Refresh to pull the latest.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        <AnimatedSection animation="fade-up">
          <h2 className="text-xl font-display font-bold text-white mb-4">Explore the Platform</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { href: "/tools", label: "Security Tools", icon: Wrench, desc: "IP lookup, port scan & more" },
              { href: "/ioc-search", label: "IOC Search", icon: Scan, desc: "Search 40+ threat feeds" },
              { href: "/risk-score", label: "Risk Score", icon: ShieldCheck, desc: "Free cyber risk assessment" },
              { href: "/groups", label: "Threat Groups", icon: Users, desc: "Ransomware & APT profiles" },
              { href: "/breaches", label: "Breach Database", icon: Database, desc: "Known data breaches" },
              { href: "/ics-advisories", label: "ICS Advisories", icon: Factory, desc: "CISA ICS-CERT alerts" },
              { href: "/ransomware-payments", label: "Ransom Payments", icon: AlertTriangle, desc: "Payment tracking dashboard" },
            ].map((item) => (
              <a key={item.href} href={item.href} className="group" data-testid={`card-quicklink-${item.href.slice(1)}`}>
                <Card className="border-white/5 bg-card/50 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all duration-200 h-full">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <item.icon className="h-6 w-6 text-zinc-500 group-hover:text-orange-400 transition-colors" />
                    <span className="text-sm font-medium text-white group-hover:text-orange-400 transition-colors">{item.label}</span>
                    <span className="text-[11px] text-zinc-500">{item.desc}</span>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </AnimatedSection>

        <Footer />
      </div>
    </Layout>
  );
}
