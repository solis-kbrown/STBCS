import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useStats, useCves, useRansomware, useRefreshData, useTrends, useLastRefresh } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { getHeroBackground } from "@/components/hero-backgrounds";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Shield, Skull, Activity, Lock, ExternalLink, RefreshCw, Globe, Link2, AlertTriangle, Wrench, Scan, ShieldCheck, Users, Database, Factory, ChevronRight, Search, FileSearch, BarChart3, Radio, TrendingUp, Zap, Eye, Clock, MonitorCheck, CheckCircle2, XCircle } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, ResponsiveContainer, Tooltip, BarChart, Bar, Cell, RadialBarChart, RadialBar, PieChart, Pie } from "recharts";

import { useMemo, useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import AnimatedMap from "@/components/animated-map";
import HeroParticles from "@/components/hero-particles";
import AnimatedSection, { AnimatedList } from "@/components/animated-section";
import { useInView, useCountUp } from "@/hooks/use-in-view";

const iconColorMap: Record<string, string> = {
  "text-primary": "icon-primary",
  "text-destructive": "icon-destructive",
  "text-secondary": "icon-secondary",
  "text-green-500": "icon-green",
  "text-orange-500": "icon-orange",
  "text-yellow-500": "icon-yellow",
  "text-red-400": "icon-red",
};

function CountUpStat({ value, label, icon: Icon, color, change, index }: {
  value: number; label: string; icon: any; color: string; change: string; index: number;
}) {
  const { ref, isInView } = useInView();
  const { count, start } = useCountUp(value, 1200, true);

  useEffect(() => {
    if (isInView) start();
  }, [isInView, start]);

  const iconBgClass = iconColorMap[color] || "icon-primary";

  return (
    <div ref={ref}>
      <Card className={`border-white/5 bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-sm card-interactive card-3d anim-fade-up stagger-${Math.min(index + 1, 7)} ${isInView ? "in-view" : ""}`} data-testid={`card-stat-${index}`}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div className={`p-2.5 rounded-lg bg-background/80 border border-white/5 ${color} stat-icon-bg ${iconBgClass} icon-bounce`}>
              <Icon className="h-4 w-4 relative z-10" />
            </div>
            <Badge variant="outline" className="bg-background/50 border-white/10 text-[10px] px-1.5 badge-shimmer">
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

function TypingText({ text, className }: { text: string; className?: string }) {
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [displayed, setDisplayed] = useState(prefersReduced ? text : "");
  const [done, setDone] = useState(prefersReduced);
  useEffect(() => {
    if (prefersReduced) return;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        setDone(true);
      }
    }, 50);
    return () => clearInterval(timer);
  }, [text, prefersReduced]);
  return (
    <span className={className}>
      {displayed}
      {!done && <span className="animate-pulse text-primary">|</span>}
    </span>
  );
}

function InfraStatusWidget() {
  const { data, isLoading } = useQuery<any[]>({
    queryKey: ["/api/tools/service-status"],
    queryFn: async () => {
      const res = await fetch("/api/tools/service-status");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 60000,
    refetchInterval: 120000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {Array(8).fill(0).map((_, i) => (
          <div key={i} className="h-8 bg-zinc-800 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  const services = data || [];
  const stbcs = services.filter((s: any) => s.category === "stbcs");
  const external = services.filter((s: any) => s.category !== "stbcs");
  const opCount = services.filter((s: any) => s.status === "operational").length;
  const degradedCount = services.filter((s: any) => s.status === "degraded").length;
  const outageCount = services.filter((s: any) => s.status === "outage").length;

  const categoryLabels: Record<string, string> = {
    cloud: "Cloud", cdn_dns: "CDN/DNS", security: "Security", communication: "Comms",
    development: "DevOps", hosting: "Hosting", infrastructure: "Infra",
  };

  const categoryStats = Object.entries(categoryLabels).map(([key, label]) => {
    const items = external.filter((s: any) => s.category === key);
    const allOp = items.length > 0 && items.every((s: any) => s.status === "operational");
    const hasOutage = items.some((s: any) => s.status === "outage");
    return { key, label, count: items.length, allOp, hasOutage };
  }).filter(c => c.count > 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 mb-1">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${outageCount > 0 ? "bg-red-500" : degradedCount > 0 ? "bg-yellow-500" : "bg-green-500"}`} />
          <span className="text-xs text-zinc-300 font-medium">
            {outageCount > 0 ? `${outageCount} outage${outageCount > 1 ? "s" : ""}` : degradedCount > 0 ? `${degradedCount} degraded` : "All systems operational"}
          </span>
        </div>
        <span className="text-[10px] text-zinc-600">{opCount}/{services.length} services up</span>
      </div>

      <div className="space-y-1.5">
        <div className="text-[10px] text-zinc-500 font-display tracking-wider uppercase">STBCS Services</div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5">
          {stbcs.map((s: any) => (
            <div key={s.name} className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-[11px] border ${
              s.status === "operational" ? "border-green-500/20 bg-green-500/5 text-green-400" :
              s.status === "degraded" ? "border-yellow-500/20 bg-yellow-500/5 text-yellow-400" :
              "border-red-500/20 bg-red-500/5 text-red-400"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                s.status === "operational" ? "bg-green-500" : s.status === "degraded" ? "bg-yellow-500" : "bg-red-500"
              }`} />
              <span className="truncate">{s.name.replace("STBCS ", "")}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="text-[10px] text-zinc-500 font-display tracking-wider uppercase">External Infrastructure</div>
        <div className="grid grid-cols-3 md:grid-cols-7 gap-1.5">
          {categoryStats.map(cat => (
            <div key={cat.key} className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-[11px] border ${
              cat.hasOutage ? "border-red-500/20 bg-red-500/5 text-red-400" :
              cat.allOp ? "border-green-500/20 bg-green-500/5 text-green-400" :
              "border-yellow-500/20 bg-yellow-500/5 text-yellow-400"
            }`}>
              {cat.allOp ? <CheckCircle2 className="h-3 w-3 flex-shrink-0" /> : cat.hasOutage ? <XCircle className="h-3 w-3 flex-shrink-0" /> : <AlertTriangle className="h-3 w-3 flex-shrink-0" />}
              <span className="truncate">{cat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickActionsBar() {
  const actions = [
    { href: "/search?tab=ioc", icon: Search, label: "IOC Lookup" },
    { href: "/risk-score", icon: BarChart3, label: "Risk Score" },
    { href: "/tools", icon: Wrench, label: "Tools" },
    { href: "/exploits", icon: FileSearch, label: "CVE Search" },
    { href: "/intel", icon: Radio, label: "Live Intel" },
  ];
  return (
    <div className="flex items-center justify-center gap-2 flex-wrap" data-testid="bar-quick-actions">
      {actions.map((a) => (
        <a key={a.href} href={a.href}>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-white/10 bg-card/60 backdrop-blur-sm hover:border-primary/30 hover:bg-primary/10 hover:text-primary transition-all duration-300 gap-2 btn-press"
            data-testid={`button-quick-${a.label.toLowerCase().replace(/\s/g, '-')}`}
          >
            <a.icon className="h-3.5 w-3.5" />
            <span className="text-xs">{a.label}</span>
          </Button>
        </a>
      ))}
    </div>
  );
}

export default function Dashboard() {
  useDocumentTitle("STB Cybersecurity | Real-Time Threat Intelligence for SMBs", "Track ransomware, CVEs, and malicious IPs across 70+ live feeds. Get 24/7 incident response, ransomware recovery, and threat hunting for your business.");
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: cvesData, isLoading: cvesLoading } = useCves(5);
  const { data: ransomwareData, isLoading: ransomwareLoading } = useRansomware(5);
  const { data: trends, isLoading: trendsLoading } = useTrends(14);
  const { data: refreshInfo } = useLastRefresh();
  const refreshMutation = useRefreshData();
  const { data: heroBgData } = useQuery({
    queryKey: ["/api/site-settings/hero-bg"],
    queryFn: () => fetch("/api/site-settings/hero-bg").then(r => r.json()).catch(() => ({ value: "threat-map" })),
  });
  const heroBgId = heroBgData?.value || "threat-map";

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
      <div className="space-y-10 page-transition">
        
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-card h-72 flex items-center hero-scan-line animated-border">
          <div className="absolute inset-0 z-0">
            {heroBgId === "threat-map" ? <AnimatedMap /> : getHeroBackground(heroBgId)}
            <div className="absolute inset-0 z-[1]">
              <HeroParticles />
            </div>
            <div className="absolute inset-0 z-[2] bg-gradient-to-r from-background via-background/85 to-transparent"></div>
          </div>
          
          <div className="relative z-10 p-8 max-w-2xl">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/50 hover:bg-primary/30 glow-pulse" data-testid="badge-threat-level">
              <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse motion-reduce:animate-none"></span>
              <TypingText text="LIVE THREAT LEVEL: ELEVATED" />
            </Badge>
            <h1 className="text-4xl font-display font-bold text-white mb-2 tracking-wide">
              KNOW THE THREAT <span className="text-primary text-shimmer">BEFORE IT HITS</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              70+ live threat feeds. Ransomware tracking. CVE monitoring. When your business faces an attack, our incident response team is one call away.
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

        <QuickActionsBar />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
          {statsLoading ? (
            Array(7).fill(0).map((_, i) => (
              <Card key={i} className="border-white/5 bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="skeleton-shimmer h-8 w-8 rounded-lg mb-3" />
                  <div className="skeleton-shimmer h-6 w-14 mb-1.5" />
                  <div className="skeleton-shimmer h-3 w-20" />
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
            <Card className="relative border-white/5 bg-card/50 chart-card border-glow overflow-hidden">
              <CardHeader>
                <CardTitle className="font-display">Threat Velocity</CardTitle>
                <CardDescription>How fast new vulnerabilities and ransomware attacks are emerging</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {trendsLoading ? (
                  <div className="flex flex-col gap-3 h-full justify-end pb-4">
                    <div className="flex-1 flex items-end gap-2 px-4">
                      {Array(10).fill(0).map((_, i) => (
                        <div key={i} className="skeleton-shimmer flex-1" style={{ height: `${30 + Math.random() * 60}%` }} />
                      ))}
                    </div>
                    <div className="skeleton-shimmer h-3 w-full" />
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
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-white/5">
                        <div className="space-y-2">
                          <div className="skeleton-shimmer h-4 w-24" />
                          <div className="skeleton-shimmer h-3 w-32" />
                        </div>
                        <div className="skeleton-shimmer h-8 w-8 rounded" />
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
                  <div className="space-y-3 p-4">
                    <div className="flex gap-4 pb-3 border-b border-white/5">
                      {["w-24", "w-40", "w-28", "w-20", "w-20 ml-auto"].map((w, i) => (
                        <div key={i} className={`skeleton-shimmer h-3 ${w}`} />
                      ))}
                    </div>
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className="flex gap-4 py-2">
                        <div className={`skeleton-shimmer h-4 w-24`} />
                        <div className={`skeleton-shimmer h-4 w-40`} />
                        <div className={`skeleton-shimmer h-4 w-28`} />
                        <div className={`skeleton-shimmer h-4 w-20`} />
                        <div className={`skeleton-shimmer h-4 w-20 ml-auto`} />
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
                        <th scope="col" className="px-6 py-3 font-mono text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ransomware.map((incident, idx) => (
                        <tr 
                          key={incident.id} 
                          className={`border-b border-white/5 hover:bg-white/5 transition-all duration-200 border-l-2 ${
                            incident.status === "Published" ? "border-l-red-500/60" :
                            incident.status === "Negotiating" ? "border-l-yellow-500/60" :
                            "border-l-zinc-700/40"
                          }`}
                          style={{ animation: `fadeInLeft 0.4s ease-out ${idx * 80}ms both` }}
                          data-testid={`row-ransomware-${incident.id}`}
                        >
                          <td className="px-6 py-4 font-mono text-xs tabular-nums">{incident.discoveredAt ? new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(incident.discoveredAt)) : 'N/A'}</td>
                          <td className="px-6 py-4 font-medium text-white">{incident.victim}</td>
                          <td className="px-6 py-4 text-primary font-bold">{incident.groupName}</td>
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
              { href: "/search?tab=ioc", label: "IOC Lookup", icon: Scan, desc: "Search 70+ threat feeds" },
              { href: "/risk-score", label: "Risk Score", icon: ShieldCheck, desc: "Free cyber risk assessment" },
              { href: "/groups", label: "Threat Actors", icon: Users, desc: "Ransomware & APT profiles" },
              { href: "/breaches", label: "Breach Database", icon: Database, desc: "Known data breaches" },
              { href: "/ics-advisories", label: "ICS Advisories", icon: Factory, desc: "CISA ICS-CERT alerts" },
              { href: "/intel", label: "Intel & Feeds", icon: AlertTriangle, desc: "News & live threat data" },
            ].map((item, i) => (
              <a key={item.href} href={item.href} className={`group anim-fade-up stagger-${Math.min(i + 1, 7)}`} data-testid={`card-quicklink-${item.href.slice(1)}`}>
                <Card className="border-white/5 bg-card/50 hover:border-orange-500/30 hover:bg-orange-500/5 card-3d transition-all duration-300 h-full">
                  <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                    <div className="p-2 rounded-lg bg-zinc-800/50 border border-white/5 group-hover:border-orange-500/20 group-hover:bg-orange-500/10 transition-all duration-300">
                      <item.icon className="h-5 w-5 text-zinc-500 group-hover:text-orange-400 transition-colors duration-300" />
                    </div>
                    <span className="text-sm font-medium text-white group-hover:text-orange-400 transition-colors duration-300">{item.label}</span>
                    <span className="text-[11px] text-zinc-500 leading-tight">{item.desc}</span>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fade-up">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-zinc-900/50 border-zinc-800">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-display text-white flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-orange-400" />
                    14-Day Threat Activity
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px] border-orange-500/30 text-orange-400">Live Data</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="dashCveGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="dashRansGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', fontSize: '12px' }}
                        labelStyle={{ color: '#d4d4d8' }}
                      />
                      <Area type="monotone" dataKey="cves" name="CVEs" stroke="#f97316" strokeWidth={2} fill="url(#dashCveGrad)" />
                      <Area type="monotone" dataKey="ransomware" name="Ransomware" stroke="#ef4444" strokeWidth={2} fill="url(#dashRansGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-4 mt-3 text-[11px] text-zinc-500">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" />CVE Disclosures</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />Ransomware Attacks</span>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="pt-5 pb-4">
                  <div className="text-xs text-zinc-500 mb-3 font-display tracking-wider uppercase">Threat Severity Breakdown</div>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Critical', value: stats?.criticalCves || 42, fill: '#ef4444' },
                        { name: 'High', value: stats?.highCves || 128, fill: '#f97316' },
                        { name: 'Medium', value: stats?.mediumCves || 315, fill: '#eab308' },
                        { name: 'Low', value: stats?.lowCves || 89, fill: '#22c55e' },
                      ]} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {[
                            { fill: '#ef4444' },
                            { fill: '#f97316' },
                            { fill: '#eab308' },
                            { fill: '#22c55e' },
                          ].map((entry, i) => (
                            <Cell key={i} fill={entry.fill} fillOpacity={0.8} />
                          ))}
                        </Bar>
                        <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px', fontSize: '12px' }}
                          cursor={{ fill: 'rgba(249,115,22,0.1)' }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="pt-5 pb-4">
                  <div className="text-xs text-zinc-500 mb-2 font-display tracking-wider uppercase">Platform Coverage</div>
                  <div className="space-y-2">
                    {[
                      { label: "Threat Feeds Active", value: 73, max: 80, color: "bg-orange-500" },
                      { label: "CVE Database", value: 95, max: 100, color: "bg-red-500" },
                      { label: "IOC Coverage", value: 88, max: 100, color: "bg-yellow-500" },
                    ].map((bar) => (
                      <div key={bar.label}>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-zinc-400">{bar.label}</span>
                          <span className="text-zinc-500">{bar.value}%</span>
                        </div>
                        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div className={`h-full ${bar.color} rounded-full transition-all duration-1000`} style={{ width: `${(bar.value / bar.max) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fade-up">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="py-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-display font-bold text-white tracking-wider uppercase flex items-center gap-2">
                  <MonitorCheck className="h-4 w-4 text-orange-400" />
                  Infrastructure Status
                </h3>
                <a href="/service-status">
                  <Button variant="ghost" size="sm" className="text-orange-400 hover:text-orange-300 text-xs h-7 px-2">
                    View All <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </a>
              </div>
              <InfraStatusWidget />
            </CardContent>
          </Card>
        </AnimatedSection>

        <AnimatedSection animation="fade-up">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                    <Eye className="h-5 w-5 text-orange-400" />
                    Why Threat Intelligence Matters
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Every 39 seconds, a new cyberattack is launched somewhere in the world. Ransomware alone cost
                    businesses over $20 billion last year, and 60% of small businesses that suffer a major breach
                    close within 6 months. The difference between companies that survive and those that don't
                    usually comes down to one thing: visibility.
                  </p>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    STBCS gives you that visibility. Our platform monitors over 70 threat intelligence feeds in real-time,
                    tracking everything from zero-day CVEs to active ransomware campaigns, malicious infrastructure,
                    and dark web activity — so you can see threats before they reach your network.
                  </p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
                    <Zap className="h-5 w-5 text-orange-400" />
                    Built for Speed, Designed for Action
                  </h3>
                  <div className="space-y-3">
                    {[
                      { icon: Clock, text: "15-minute refresh cycles across all 70+ threat feeds", highlight: "15 min" },
                      { icon: Shield, text: "Automated IOC correlation across multiple intelligence sources", highlight: "70+" },
                      { icon: AlertTriangle, text: "Real-time alerts for critical vulnerabilities affecting your stack", highlight: "Real-time" },
                      { icon: Globe, text: "Dark web monitoring for leaked credentials and data exposure", highlight: "24/7" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="p-1.5 rounded bg-orange-500/10 flex-shrink-0 mt-0.5">
                          <item.icon className="h-3.5 w-3.5 text-orange-400" />
                        </div>
                        <p className="text-sm text-zinc-400">
                          <span className="text-orange-400 font-semibold">{item.highlight}</span>{" "}
                          — {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 via-zinc-900/80 to-zinc-900/50" data-testid="card-expert-consulting">
          <CardContent className="py-5">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                <div className="flex-1 space-y-2">
                  <h2 className="text-lg font-display font-bold text-white tracking-wider">Need Expert Guidance?</h2>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Our team has handled 1,000+ ransomware cases with a 98% recovery rate.
                    We offer hands-on consulting, guided recovery, and direct access to seasoned experts.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 flex-shrink-0">
                  <a href="/about" data-testid="link-learn-more">
                    <Button variant="outline" size="sm" className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10">
                      Learn More
                    </Button>
                  </a>
                  <a href="/contact?category=consulting" data-testid="link-talk-to-expert">
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-500 text-white font-display tracking-wider">
                      Talk to an Expert
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Footer />
      </div>
    </Layout>
  );
}
