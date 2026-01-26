import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useStats, useCves, useRansomware, useRefreshData } from "@/lib/api";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Shield, Skull, Activity, Lock, ExternalLink, RefreshCw, Globe, Link2, AlertTriangle } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const chartData = [
  { name: 'Mon', attacks: 140, patched: 90 },
  { name: 'Tue', attacks: 205, patched: 120 },
  { name: 'Wed', attacks: 180, patched: 150 },
  { name: 'Thu', attacks: 260, patched: 110 },
  { name: 'Fri', attacks: 290, patched: 180 },
  { name: 'Sat', attacks: 150, patched: 190 },
  { name: 'Sun', attacks: 170, patched: 200 },
];

export default function Dashboard() {
  useDocumentTitle("Threat Intelligence Dashboard | STB Cybersecurity");
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: cvesData, isLoading: cvesLoading } = useCves(5);
  const { data: ransomwareData, isLoading: ransomwareLoading } = useRansomware(5);
  const refreshMutation = useRefreshData();

  const cves = cvesData?.data || [];
  const ransomware = ransomwareData?.data || [];

  return (
    <Layout>
      <div className="space-y-8 page-transition">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-card h-64 flex items-center">
          <div className="absolute inset-0 z-0">
            <img src="/hero-bg.png" alt="Cybersecurity threat intelligence network visualization" className="w-full h-full object-cover opacity-40 mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"></div>
          </div>
          
          <div className="relative z-10 p-8 max-w-2xl">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/50 hover:bg-primary/30" data-testid="badge-threat-level">
              <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              LIVE THREAT LEVEL: ELEVATED
            </Badge>
            <h1 className="text-4xl font-display font-bold text-white mb-2 tracking-wide">
              FRONTLINE THREAT <span className="text-primary">INTELLIGENCE</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              Real-time monitoring powered by frontline Incident Response, Ransomware Recovery, and Threat Hunting experts.
            </p>
            <div className="flex gap-4">
              <Button 
                className="bg-primary hover:bg-primary/90 text-white font-bold" 
                data-testid="button-view-incidents"
                onClick={() => window.location.href = '/ransomware'}
              >
                VIEW LATEST INCIDENTS
              </Button>
              <Button 
                variant="outline" 
                className="border-primary/30 text-primary hover:bg-primary/10"
                onClick={() => refreshMutation.mutate()}
                disabled={refreshMutation.isPending}
                data-testid="button-refresh-data"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
                REFRESH DATA
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
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
              <Card key={i} className={`border-white/5 bg-card/50 backdrop-blur-sm hover:border-primary/30 card-hover animate-fade-in stagger-${Math.min(i + 1, 5)}`} data-testid={`card-stat-${i}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className={`p-1.5 rounded-lg bg-background border border-white/5 ${stat.color}`}>
                      <stat.icon className="h-4 w-4" />
                    </div>
                    <Badge variant="outline" className="bg-background/50 border-white/10 text-[10px] px-1.5">
                      {stat.change}
                    </Badge>
                  </div>
                  <div className="space-y-0.5">
                    <h3 className="text-2xl font-display font-bold text-white" data-testid={`text-stat-value-${i}`}>{stat.value}</h3>
                    <p className="text-xs text-muted-foreground font-medium">{stat.title}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Main Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-2 border-white/5 bg-card/50">
            <CardHeader>
              <CardTitle className="font-display">Threat Velocity</CardTitle>
              <CardDescription>Attack frequency vs Patching rate (Last 7 Days)</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAttacks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPatched" x1="0" y1="0" x2="0" y2="1">
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
                    dataKey="attacks" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorAttacks)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="patched" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorPatched)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="col-span-1 border-white/5 bg-card/50">
            <CardHeader>
              <CardTitle className="font-display">Top Active Exploits</CardTitle>
              <CardDescription>Most critical vulnerabilities actively targeted.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <div key={cve.id} className="group flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-white/10 hover:bg-white/5 transition-all" data-testid={`card-cve-${cve.cveId}`}>
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
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No CVEs loaded yet. Click refresh to fetch data.</p>
              )}
              <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-primary" onClick={() => window.location.href = '/exploits'}>
                VIEW ALL EXPLOITS
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Ransomware Feed */}
        <Card className="border-white/5 bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-display">Recent Ransomware Incidents</CardTitle>
              <CardDescription>Live feed from dark web monitoring and victim sites.</CardDescription>
            </div>
            <Button 
              variant="outline" 
              className="border-white/10 hover:bg-white/5 text-xs" 
              data-testid="button-export-csv"
              onClick={() => alert('CSV export coming soon! This feature will be available in the Pro tier.')}
            >
              <ExternalLink className="h-3 w-3 mr-2" />
              EXPORT CSV
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
                    {ransomware.map((incident) => (
                      <tr key={incident.id} className="border-b border-white/5 hover:bg-white/5 transition-colors" data-testid={`row-ransomware-${incident.id}`}>
                        <td className="px-6 py-4 font-mono text-xs">{incident.discoveredAt ? new Date(incident.discoveredAt).toLocaleDateString() : 'N/A'}</td>
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
                <p className="text-sm text-muted-foreground text-center py-8">No ransomware incidents loaded. Click refresh to fetch data.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Footer />
      </div>
    </Layout>
  );
}
