import { useState } from "react";
import { 
  LayoutDashboard, Search, Wrench, Bell, Skull, ShieldAlert, Globe, Newspaper, Heart,
  Shield, Target, Radar, Zap, Bug, Terminal, Lock, Eye, Radio, Wifi, Server, Database,
  Binary, Cpu, Network, Scan, AlertTriangle, Activity, Crosshair, Fingerprint, KeyRound,
  ScanLine, ShieldCheck, ShieldOff, Siren, Flame, Atom, CircuitBoard, MonitorDot,
  Biohazard, Bomb, FileWarning, HardDrive, Layers, MonitorSmartphone, Router, Satellite,
  Sparkles, TrendingUp, Unplug, Webhook, Boxes, BrainCircuit, GalleryVerticalEnd
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const iconStyles = [
  {
    id: "current",
    name: "Current Style",
    description: "Simple, clean icons with red accents",
    icons: [
      { label: "Dashboard", icon: LayoutDashboard },
      { label: "Search", icon: Search },
      { label: "Tools", icon: Wrench },
      { label: "Alerts", icon: Bell, isPro: true },
      { label: "Ransomware", icon: Skull },
      { label: "Exploits", icon: ShieldAlert },
      { label: "Threat Feeds", icon: Globe },
      { label: "News", icon: Newspaper },
      { label: "Support", icon: Heart },
    ],
    activeStyle: "bg-primary text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]",
    inactiveStyle: "text-muted-foreground hover:bg-zinc-800 hover:text-white",
    iconActiveStyle: "text-white",
    iconInactiveStyle: "text-muted-foreground group-hover:text-primary",
  },
  {
    id: "tactical",
    name: "Tactical Ops",
    description: "Military-inspired with targeting and radar icons",
    icons: [
      { label: "Command Center", icon: MonitorDot },
      { label: "Recon", icon: Radar },
      { label: "Arsenal", icon: Crosshair },
      { label: "Intel Alerts", icon: Siren, isPro: true },
      { label: "Threat Actors", icon: Target },
      { label: "Vulnerabilities", icon: AlertTriangle },
      { label: "Signal Intel", icon: Radio },
      { label: "Briefings", icon: FileWarning },
      { label: "Support Ops", icon: Shield },
    ],
    activeStyle: "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]",
    inactiveStyle: "text-zinc-400 hover:bg-emerald-900/30 hover:text-emerald-400 border border-transparent hover:border-emerald-500/30",
    iconActiveStyle: "text-white",
    iconInactiveStyle: "text-emerald-500/70 group-hover:text-emerald-400",
  },
  {
    id: "matrix",
    name: "Matrix Cyber",
    description: "Hacker aesthetic with terminal and code icons",
    icons: [
      { label: "Terminal", icon: Terminal },
      { label: "Scan", icon: ScanLine },
      { label: "Exploits", icon: Bug },
      { label: "Intrusion", icon: Zap, isPro: true },
      { label: "Malware", icon: Biohazard },
      { label: "Zero-Days", icon: Bomb },
      { label: "Data Streams", icon: Binary },
      { label: "Intel Feed", icon: Activity },
      { label: "Access", icon: KeyRound },
    ],
    activeStyle: "bg-green-500/20 text-green-400 border border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)]",
    inactiveStyle: "text-green-600/60 hover:bg-green-900/20 hover:text-green-400 border border-transparent hover:border-green-500/30",
    iconActiveStyle: "text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]",
    iconInactiveStyle: "text-green-600/60 group-hover:text-green-400",
  },
  {
    id: "enterprise",
    name: "Enterprise Shield",
    description: "Professional blue theme with security focus",
    icons: [
      { label: "Overview", icon: Layers },
      { label: "Discovery", icon: Search },
      { label: "Security Tools", icon: ShieldCheck },
      { label: "Threat Alerts", icon: Bell, isPro: true },
      { label: "Threat Intel", icon: Eye },
      { label: "Vulnerability DB", icon: Database },
      { label: "Global Feeds", icon: Network },
      { label: "Security News", icon: Newspaper },
      { label: "Support", icon: Heart },
    ],
    activeStyle: "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]",
    inactiveStyle: "text-slate-400 hover:bg-blue-900/30 hover:text-blue-300 border border-transparent hover:border-blue-500/30",
    iconActiveStyle: "text-white",
    iconInactiveStyle: "text-blue-400/60 group-hover:text-blue-400",
  },
  {
    id: "neon",
    name: "Neon Cyber",
    description: "Vibrant cyberpunk with glowing effects",
    icons: [
      { label: "Hub", icon: CircuitBoard },
      { label: "Scan", icon: Fingerprint },
      { label: "Toolkit", icon: Cpu },
      { label: "Alerts", icon: Zap, isPro: true },
      { label: "Ransomware", icon: Flame },
      { label: "Exploits", icon: Atom },
      { label: "Networks", icon: Wifi },
      { label: "Intel", icon: BrainCircuit },
      { label: "Connect", icon: Sparkles },
    ],
    activeStyle: "bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 text-white shadow-[0_0_25px_rgba(168,85,247,0.5)]",
    inactiveStyle: "text-purple-300/60 hover:bg-purple-900/30 hover:text-pink-300 border border-transparent hover:border-purple-500/40",
    iconActiveStyle: "text-white drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]",
    iconInactiveStyle: "text-purple-400/60 group-hover:text-pink-400",
  },
  {
    id: "stealth",
    name: "Stealth Mode",
    description: "Dark, minimal with subtle orange accents",
    icons: [
      { label: "Dashboard", icon: GalleryVerticalEnd },
      { label: "Locate", icon: Scan },
      { label: "Tools", icon: Wrench },
      { label: "Monitoring", icon: Activity, isPro: true },
      { label: "Threats", icon: ShieldOff },
      { label: "CVEs", icon: Bug },
      { label: "Intel", icon: Satellite },
      { label: "Reports", icon: TrendingUp },
      { label: "Help", icon: Heart },
    ],
    activeStyle: "bg-orange-500/15 text-orange-400 border-l-2 border-orange-500",
    inactiveStyle: "text-zinc-500 hover:bg-zinc-800/50 hover:text-orange-300 border-l-2 border-transparent hover:border-orange-500/50",
    iconActiveStyle: "text-orange-400",
    iconInactiveStyle: "text-zinc-600 group-hover:text-orange-400/80",
  },
  {
    id: "soc",
    name: "SOC Analyst",
    description: "Security Operations Center inspired",
    icons: [
      { label: "SOC Dashboard", icon: MonitorSmartphone },
      { label: "Hunt", icon: Crosshair },
      { label: "Forensics", icon: Fingerprint },
      { label: "SIEM Alerts", icon: Siren, isPro: true },
      { label: "Threat Actors", icon: Target },
      { label: "MITRE ATT&CK", icon: Boxes },
      { label: "Threat Feeds", icon: Router },
      { label: "Intel Briefs", icon: FileWarning },
      { label: "Escalation", icon: Unplug },
    ],
    activeStyle: "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]",
    inactiveStyle: "text-amber-600/50 hover:bg-amber-900/20 hover:text-amber-400 border border-transparent hover:border-amber-500/30",
    iconActiveStyle: "text-amber-400",
    iconInactiveStyle: "text-amber-600/50 group-hover:text-amber-400",
  },
  {
    id: "infrared",
    name: "Infrared Vision",
    description: "Red-spectrum thermal imaging inspired",
    icons: [
      { label: "Control", icon: Server },
      { label: "Detect", icon: Eye },
      { label: "Analyze", icon: HardDrive },
      { label: "Heat Map", icon: Flame, isPro: true },
      { label: "Threats", icon: Skull },
      { label: "Vectors", icon: Webhook },
      { label: "Streams", icon: Activity },
      { label: "Reports", icon: Newspaper },
      { label: "Support", icon: Lock },
    ],
    activeStyle: "bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]",
    inactiveStyle: "text-red-400/50 hover:bg-red-900/20 hover:text-orange-300 border border-transparent hover:border-red-500/30",
    iconActiveStyle: "text-white drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]",
    iconInactiveStyle: "text-red-500/50 group-hover:text-orange-400",
  },
];

export default function StylePreviewPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-display font-bold text-primary">Navigation Style Preview</h1>
          <p className="text-muted-foreground">Review different icon and styling options for your sidebar navigation</p>
        </div>

        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="compare">Side by Side</TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {iconStyles.map((style) => (
                <Card 
                  key={style.id} 
                  className={`bg-zinc-900/80 border-zinc-800 transition-all duration-300 cursor-pointer ${
                    selectedStyle === style.id ? 'ring-2 ring-primary shadow-lg shadow-primary/20' : 'hover:border-zinc-700'
                  }`}
                  onClick={() => setSelectedStyle(style.id === selectedStyle ? null : style.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-display">{style.name}</CardTitle>
                      {style.id === "current" && (
                        <Badge variant="outline" className="text-xs border-primary/50 text-primary">Current</Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs">{style.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-1.5">
                    {style.icons.map((item, idx) => {
                      const isActive = idx === activeIndex;
                      return (
                        <div
                          key={item.label}
                          className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group ${
                            isActive ? style.activeStyle : style.inactiveStyle
                          }`}
                          onMouseEnter={() => setActiveIndex(idx)}
                        >
                          <item.icon className={`h-4 w-4 transition-colors ${
                            isActive ? style.iconActiveStyle : style.iconInactiveStyle
                          }`} />
                          <span className="text-sm font-medium truncate">{item.label}</span>
                          {'isPro' in item && item.isPro && (
                            <span className="ml-auto text-[9px] font-bold bg-primary/20 text-primary px-1 py-0.5 rounded">PRO</span>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="compare" className="mt-6">
            <div className="flex flex-wrap gap-6 justify-center">
              {iconStyles.slice(0, 4).map((style) => (
                <div key={style.id} className="w-64">
                  <Card className="bg-zinc-900/80 border-zinc-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-display">{style.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      {style.icons.map((item, idx) => {
                        const isActive = idx === 0 || idx === 4;
                        return (
                          <div
                            key={item.label}
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md transition-all duration-200 group ${
                              isActive ? style.activeStyle : style.inactiveStyle
                            }`}
                          >
                            <item.icon className={`h-3.5 w-3.5 transition-colors ${
                              isActive ? style.iconActiveStyle : style.iconInactiveStyle
                            }`} />
                            <span className="text-xs font-medium truncate">{item.label}</span>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-6 justify-center mt-6">
              {iconStyles.slice(4).map((style) => (
                <div key={style.id} className="w-64">
                  <Card className="bg-zinc-900/80 border-zinc-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-display">{style.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1">
                      {style.icons.map((item, idx) => {
                        const isActive = idx === 0 || idx === 4;
                        return (
                          <div
                            key={item.label}
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md transition-all duration-200 group ${
                              isActive ? style.activeStyle : style.inactiveStyle
                            }`}
                          >
                            <item.icon className={`h-3.5 w-3.5 transition-colors ${
                              isActive ? style.iconActiveStyle : style.iconInactiveStyle
                            }`} />
                            <span className="text-xs font-medium truncate">{item.label}</span>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="text-center pt-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Hover over menu items to see the active state. Click a card to select your preferred style.
          </p>
          {selectedStyle && (
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-primary font-medium">
                Selected: <span className="font-bold">{iconStyles.find(s => s.id === selectedStyle)?.name}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Let me know if you'd like to apply this style to your navigation!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
