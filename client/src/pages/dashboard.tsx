import Layout from "@/components/layout";
import { recentRansomware, topExploits } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Shield, Skull, Activity, Lock, ExternalLink } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: 'Mon', attacks: 140, patched: 90 },
  { name: 'Tue', attacks: 205, patched: 120 },
  { name: 'Wed', attacks: 180, patched: 150 },
  { name: 'Thu', attacks: 260, patched: 110 },
  { name: 'Fri', attacks: 290, patched: 180 },
  { name: 'Sat', attacks: 150, patched: 190 },
  { name: 'Sun', attacks: 170, patched: 200 },
];

export default function Dashboard() {
  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-card h-64 flex items-center">
          <div className="absolute inset-0 z-0">
            <img src="/hero-bg.png" alt="Cyber Background" className="w-full h-full object-cover opacity-40 mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"></div>
          </div>
          
          <div className="relative z-10 p-8 max-w-2xl">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/50 hover:bg-primary/30">
              <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              LIVE THREAT LEVEL: ELEVATED
            </Badge>
            <h1 className="text-4xl font-display font-bold text-white mb-2 tracking-wide">
              GLOBAL THREAT <span className="text-primary">INTELLIGENCE</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              Real-time monitoring of ransomware incidents, zero-day exploits, and emerging cyber threats.
            </p>
            <div className="flex gap-4">
              <Button className="bg-primary hover:bg-primary/90 text-white font-bold">
                VIEW LATEST INCIDENTS
              </Button>
              <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
                CONFIGURE ALERTS
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Active Ransomware Groups", value: "42", change: "+12%", icon: Skull, color: "text-primary" },
            { title: "Critical CVEs (24h)", value: "8", change: "+3", icon: Shield, color: "text-destructive" },
            { title: "Exploits in Wild", value: "156", change: "+5%", icon: Activity, color: "text-secondary" },
            { title: "Protected Assets", value: "1,240", change: "100%", icon: Lock, color: "text-green-500" },
          ].map((stat, i) => (
            <Card key={i} className="border-white/5 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg bg-background border border-white/5 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="bg-background/50 border-white/10 text-xs">
                    {stat.change}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-display font-bold text-white">{stat.value}</h3>
                  <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
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
                <AreaChart data={data}>
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
              {topExploits.slice(0, 4).map((exploit) => (
                <div key={exploit.id} className="group flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-white/10 hover:bg-white/5 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white group-hover:text-secondary transition-colors">{exploit.cve}</span>
                      <Badge variant="destructive" className="text-[10px] h-5 px-1">{exploit.score}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate max-w-[180px]">{exploit.name}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white">
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="ghost" className="w-full text-xs text-muted-foreground hover:text-primary">
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
            <Button variant="outline" className="border-white/10 hover:bg-white/5 text-xs">
              <ExternalLink className="h-3 w-3 mr-2" />
              EXPORT CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-x-auto">
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
                  {recentRansomware.map((incident) => (
                    <tr key={incident.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs">{new Date(incident.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-medium text-white">{incident.victim}</td>
                      <td className="px-6 py-4 text-primary font-bold">{incident.group}</td>
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
            </div>
          </CardContent>
        </Card>

      </div>
    </Layout>
  );
}