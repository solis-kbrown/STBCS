import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Download, Shield, Zap, BarChart3, Bell, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";

interface UpgradeBannerProps {
  context?: "data" | "tools" | "search" | "general";
}

const contextMessages = {
  data: {
    title: "Unlock Full Threat Intelligence",
    description: "Export data to CSV/JSON/STIX, access advanced analytics, breach database searches, and real-time monitoring alerts.",
    features: [
      { icon: Download, text: "Export CSV, JSON & STIX" },
      { icon: BarChart3, text: "Advanced Analytics" },
      { icon: Bell, text: "Real-Time Alerts" },
      { icon: Shield, text: "Breach Database Access" },
    ],
  },
  tools: {
    title: "Supercharge Your Security Toolkit",
    description: "Get 6x rate limits, Nmap scanning, data exports, priority API access, and custom monitoring alerts.",
    features: [
      { icon: Zap, text: "6x Rate Limits" },
      { icon: Shield, text: "Nmap Deep Scanning" },
      { icon: Download, text: "Export All Results" },
      { icon: Bell, text: "Custom Alert Rules" },
    ],
  },
  search: {
    title: "Advanced Search & Intelligence",
    description: "Filter by severity, source, and date range. Export search results and get priority access to threat feed data.",
    features: [
      { icon: BarChart3, text: "Advanced Filters" },
      { icon: Download, text: "Export Results" },
      { icon: Shield, text: "Priority Feed Access" },
      { icon: Zap, text: "Higher API Quotas" },
    ],
  },
  general: {
    title: "Go Pro for Full Access",
    description: "Unlock exports, advanced tools, real-time monitoring, breach database, and priority support.",
    features: [
      { icon: Download, text: "Data Exports" },
      { icon: Shield, text: "Advanced Tools" },
      { icon: Bell, text: "Monitoring & Alerts" },
      { icon: Zap, text: "Priority Support" },
    ],
  },
};

export default function UpgradeBanner({ context = "general" }: UpgradeBannerProps) {
  const { isPro, isBusiness, isUnlimited } = useAuth();
  
  if (isPro || isBusiness || isUnlimited) return null;

  const msg = contextMessages[context];

  return (
    <div className="relative rounded-lg p-[1px] overflow-hidden upgrade-banner-border" data-testid="card-upgrade-banner">
      <Card className="relative border-0 bg-gradient-to-r from-orange-500/5 via-zinc-900/80 to-amber-500/5 overflow-hidden">
        <CardContent className="py-6">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-500/20 rounded-lg shadow-[0_0_12px_rgba(249,115,22,0.15)]">
                  <Crown className="h-5 w-5 text-orange-400" />
                </div>
                <h3 className="text-lg font-bold text-white">{msg.title}</h3>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">{msg.description}</p>
              <div className="grid grid-cols-2 gap-2">
                {msg.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                    <f.icon className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-6 shadow-[0_0_20px_rgba(249,115,22,0.25)] hover:shadow-[0_0_28px_rgba(249,115,22,0.35)] transition-shadow duration-300" asChild data-testid="button-upgrade-banner">
                <a href="/support#pricing">
                  <Crown className="h-4 w-4 mr-2" /> View Pro Plans
                </a>
              </Button>
              <p className="text-[10px] text-zinc-500 text-center">Starting at $7.49/month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
