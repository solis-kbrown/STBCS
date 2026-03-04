import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import {
  Calculator,
  DollarSign,
  Clock,
  Shield,
  AlertTriangle,
  TrendingUp,
  Building2,
  Users,
  Lock,
  ChevronRight,
  ArrowRight,
  BarChart3,
  Target,
  FileWarning,
  ShieldAlert,
  Crown,
} from "lucide-react";

const INDUSTRIES = [
  { value: "healthcare", label: "Healthcare", multiplier: 1.8, downtimeHours: 336, recordCost: 429 },
  { value: "financial", label: "Financial Services", multiplier: 1.6, downtimeHours: 240, recordCost: 352 },
  { value: "manufacturing", label: "Manufacturing", multiplier: 1.3, downtimeHours: 480, recordCost: 198 },
  { value: "technology", label: "Technology", multiplier: 1.4, downtimeHours: 168, recordCost: 275 },
  { value: "education", label: "Education", multiplier: 1.1, downtimeHours: 288, recordCost: 164 },
  { value: "government", label: "Government", multiplier: 1.2, downtimeHours: 360, recordCost: 245 },
  { value: "retail", label: "Retail / E-Commerce", multiplier: 1.2, downtimeHours: 192, recordCost: 180 },
  { value: "legal", label: "Legal Services", multiplier: 1.5, downtimeHours: 264, recordCost: 310 },
  { value: "energy", label: "Energy / Utilities", multiplier: 1.7, downtimeHours: 504, recordCost: 285 },
  { value: "construction", label: "Construction", multiplier: 1.0, downtimeHours: 216, recordCost: 155 },
  { value: "transportation", label: "Transportation / Logistics", multiplier: 1.1, downtimeHours: 312, recordCost: 178 },
  { value: "hospitality", label: "Hospitality", multiplier: 0.9, downtimeHours: 168, recordCost: 142 },
  { value: "other", label: "Other", multiplier: 1.0, downtimeHours: 240, recordCost: 185 },
];

const COMPANY_SIZES = [
  { value: "1-10", label: "1-10 employees", employees: 5, records: 500 },
  { value: "11-50", label: "11-50 employees", employees: 30, records: 5000 },
  { value: "51-200", label: "51-200 employees", employees: 125, records: 25000 },
  { value: "201-500", label: "201-500 employees", employees: 350, records: 100000 },
  { value: "501-1000", label: "501-1,000 employees", employees: 750, records: 500000 },
  { value: "1001+", label: "1,000+ employees", employees: 2000, records: 2000000 },
];

const REVENUE_RANGES = [
  { value: "under-1m", label: "Under $1M", revenue: 500000, hourlyLoss: 57 },
  { value: "1m-5m", label: "$1M - $5M", revenue: 3000000, hourlyLoss: 342 },
  { value: "5m-25m", label: "$5M - $25M", revenue: 15000000, hourlyLoss: 1712 },
  { value: "25m-100m", label: "$25M - $100M", revenue: 62500000, hourlyLoss: 7134 },
  { value: "100m-500m", label: "$100M - $500M", revenue: 300000000, hourlyLoss: 34247 },
  { value: "500m+", label: "$500M+", revenue: 750000000, hourlyLoss: 85616 },
];

const DATA_SENSITIVITY = [
  { value: "low", label: "Low (public info, non-sensitive)", factor: 0.5 },
  { value: "medium", label: "Medium (business data, employee PII)", factor: 1.0 },
  { value: "high", label: "High (financial, health, legal records)", factor: 1.8 },
  { value: "critical", label: "Critical (regulated data, classified)", factor: 2.5 },
];

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export default function RansomwareCalculator() {
  useDocumentTitle(
    "Ransomware Cost Estimator | STB Cybersecurity",
    "Estimate the potential financial impact of a ransomware attack on your business. Get sector-specific threat data and actionable protection recommendations."
  );

  const { isAuthenticated, isPro } = useAuth();
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [revenue, setRevenue] = useState("");
  const [sensitivity, setSensitivity] = useState("");
  const [showResults, setShowResults] = useState(false);

  const { data: analyticsData } = useQuery({
    queryKey: ["/api/ransomware/analytics"],
    queryFn: async () => {
      const res = await fetch("/api/ransomware/analytics");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const canCalculate = industry && companySize && revenue && sensitivity;

  const selectedIndustry = INDUSTRIES.find((i) => i.value === industry);
  const selectedSize = COMPANY_SIZES.find((s) => s.value === companySize);
  const selectedRevenue = REVENUE_RANGES.find((r) => r.value === revenue);
  const selectedSensitivity = DATA_SENSITIVITY.find((d) => d.value === sensitivity);

  const results = useMemo(() => {
    if (!selectedIndustry || !selectedSize || !selectedRevenue || !selectedSensitivity) return null;

    const baseRansom = selectedRevenue.revenue * 0.013;
    const adjustedRansom = baseRansom * selectedIndustry.multiplier * selectedSensitivity.factor;
    const ransomLow = adjustedRansom * 0.4;
    const ransomMid = adjustedRansom;
    const ransomHigh = adjustedRansom * 2.2;

    const downtimeCost = selectedRevenue.hourlyLoss * selectedIndustry.downtimeHours;

    const notificationCost = selectedSize.records * selectedIndustry.recordCost * selectedSensitivity.factor * 0.01;

    const recoveryBasePercent = 0.02;
    const recoveryCost = selectedRevenue.revenue * recoveryBasePercent * selectedIndustry.multiplier;

    const reputationCost = selectedRevenue.revenue * 0.05 * selectedSensitivity.factor;

    const totalLow = ransomLow + downtimeCost * 0.6 + notificationCost * 0.5 + recoveryCost * 0.5;
    const totalMid = ransomMid + downtimeCost + notificationCost + recoveryCost + reputationCost * 0.5;
    const totalHigh = ransomHigh + downtimeCost * 1.5 + notificationCost * 1.3 + recoveryCost * 1.5 + reputationCost;

    return {
      ransomDemand: { low: ransomLow, mid: ransomMid, high: ransomHigh },
      downtimeCost,
      downtimeHours: selectedIndustry.downtimeHours,
      notificationCost,
      recoveryCost,
      reputationCost,
      totalImpact: { low: totalLow, mid: totalMid, high: totalHigh },
      recordsAtRisk: selectedSize.records,
    };
  }, [selectedIndustry, selectedSize, selectedRevenue, selectedSensitivity]);

  const sectorData = useMemo(() => {
    if (!analyticsData || !selectedIndustry) return null;

    const sectorName = selectedIndustry.label.toLowerCase();
    const topSectors: { name: string; count: number }[] = analyticsData.topSectors || [];
    const matchedSector = topSectors.find(
      (s) => s.name.toLowerCase().includes(sectorName) || sectorName.includes(s.name.toLowerCase())
    );

    const topGroups: { name: string; victims: number }[] = (analyticsData.topGroups || []).slice(0, 5);
    const totalVictims: number = analyticsData.totalVictims || 0;

    return {
      sectorIncidents: matchedSector?.count || 0,
      topGroups,
      totalVictims,
      totalGroups: analyticsData.totalGroups || 0,
    };
  }, [analyticsData, selectedIndustry]);

  const handleCalculate = () => {
    if (canCalculate) setShowResults(true);
  };

  const handleReset = () => {
    setIndustry("");
    setCompanySize("");
    setRevenue("");
    setSensitivity("");
    setShowResults(false);
  };

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="relative overflow-hidden rounded-xl border border-red-500/20 bg-gradient-to-br from-red-950/30 via-zinc-900 to-orange-950/20 p-6 md:p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <Calculator className="h-6 w-6 text-red-400" />
              </div>
              <Badge variant="outline" className="border-red-500/30 text-red-400 text-xs">
                Free Tool
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-2" data-testid="text-calculator-title">
              Ransomware Cost Estimator
            </h1>
            <p className="text-muted-foreground max-w-2xl" data-testid="text-calculator-description">
              Estimate the potential financial impact of a ransomware attack on your business. Based on real-world incident
              data, industry averages, and sector-specific threat intelligence from our platform.
            </p>
          </div>
        </div>

        {!showResults ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-white/10 bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-zinc-300">
                    <Building2 className="h-4 w-4 text-orange-400" /> Industry / Sector
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger className="bg-zinc-900/50 border-zinc-500" data-testid="select-industry">
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((ind) => (
                        <SelectItem key={ind.value} value={ind.value}>
                          {ind.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-zinc-300">
                    <Users className="h-4 w-4 text-orange-400" /> Company Size
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={companySize} onValueChange={setCompanySize}>
                    <SelectTrigger className="bg-zinc-900/50 border-zinc-500" data-testid="select-company-size">
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_SIZES.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-zinc-300">
                    <DollarSign className="h-4 w-4 text-orange-400" /> Annual Revenue Range
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={revenue} onValueChange={setRevenue}>
                    <SelectTrigger className="bg-zinc-900/50 border-zinc-500" data-testid="select-revenue">
                      <SelectValue placeholder="Select revenue range" />
                    </SelectTrigger>
                    <SelectContent>
                      {REVENUE_RANGES.map((rev) => (
                        <SelectItem key={rev.value} value={rev.value}>
                          {rev.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-zinc-300">
                    <Lock className="h-4 w-4 text-orange-400" /> Data Sensitivity Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={sensitivity} onValueChange={setSensitivity}>
                    <SelectTrigger className="bg-zinc-900/50 border-zinc-500" data-testid="select-sensitivity">
                      <SelectValue placeholder="Select data sensitivity" />
                    </SelectTrigger>
                    <SelectContent>
                      {DATA_SENSITIVITY.map((ds) => (
                        <SelectItem key={ds.value} value={ds.value}>
                          {ds.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-center">
              <Button
                size="lg"
                className="bg-red-600 hover:bg-red-700 text-white px-8 font-bold"
                onClick={handleCalculate}
                disabled={!canCalculate}
                data-testid="button-calculate"
              >
                <Calculator className="h-5 w-5 mr-2" /> Calculate Ransomware Impact
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: "Based on Real Data", desc: "Calculations use actual ransomware incident data from our threat intelligence platform.", icon: BarChart3 },
                { title: "Sector-Specific", desc: "Industry-adjusted estimates reflecting real-world targeting patterns and costs.", icon: Target },
                { title: "100% Free", desc: "No sign-up required for the headline estimate. Supporter+ gets full breakdown.", icon: Shield },
              ].map((item) => (
                <Card key={item.title} className="border-white/5 bg-card/30">
                  <CardContent className="p-4 text-center">
                    <item.icon className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                    <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : results ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold text-white" data-testid="text-results-title">
                Estimated Ransomware Impact
              </h2>
              <Button variant="outline" size="sm" onClick={handleReset} data-testid="button-recalculate">
                Recalculate
              </Button>
            </div>

            <Card className="border-red-500/30 bg-gradient-to-br from-red-950/20 to-zinc-900">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground mb-1">Total Estimated Impact</p>
                  <div className="flex items-center justify-center gap-4 flex-wrap">
                    <div>
                      <p className="text-xs text-zinc-500">Low</p>
                      <p className="text-2xl font-bold text-yellow-400" data-testid="text-total-low">
                        {formatCurrency(results.totalImpact.low)}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-zinc-600 hidden sm:block" />
                    <div>
                      <p className="text-xs text-zinc-500">Most Likely</p>
                      <p className="text-4xl font-bold text-red-400" data-testid="text-total-mid">
                        {formatCurrency(results.totalImpact.mid)}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-zinc-600 hidden sm:block" />
                    <div>
                      <p className="text-xs text-zinc-500">Worst Case</p>
                      <p className="text-2xl font-bold text-red-600" data-testid="text-total-high">
                        {formatCurrency(results.totalImpact.high)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-3 mt-2">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-yellow-500 via-red-500 to-red-700 transition-all duration-1000"
                    style={{ width: "100%" }}
                  />
                </div>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  For a {selectedSize?.label} {selectedIndustry?.label} company with {selectedRevenue?.label} revenue
                </p>
              </CardContent>
            </Card>

            {isPro ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-white/10 bg-card/50" data-testid="card-ransom-demand">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="h-5 w-5 text-red-400" />
                      <h3 className="font-semibold text-white text-sm">Estimated Ransom Demand</h3>
                    </div>
                    <p className="text-2xl font-bold text-red-400">{formatCurrency(results.ransomDemand.mid)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Range: {formatCurrency(results.ransomDemand.low)} – {formatCurrency(results.ransomDemand.high)}
                    </p>
                    <p className="text-xs text-zinc-500 mt-2">
                      Based on average ransom demands for {selectedIndustry?.label} organizations of similar size.
                      Actual demands vary widely based on perceived ability to pay.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-white/10 bg-card/50" data-testid="card-downtime-cost">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-5 w-5 text-orange-400" />
                      <h3 className="font-semibold text-white text-sm">Downtime Cost</h3>
                    </div>
                    <p className="text-2xl font-bold text-orange-400">{formatCurrency(results.downtimeCost)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ~{results.downtimeHours} hours estimated recovery time
                    </p>
                    <p className="text-xs text-zinc-500 mt-2">
                      At ~{formatCurrency(selectedRevenue?.hourlyLoss || 0)}/hour in lost productivity and revenue.
                      {selectedIndustry?.label} companies average{" "}
                      {Math.round(results.downtimeHours / 24)} days of disruption.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-white/10 bg-card/50" data-testid="card-notification-cost">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <FileWarning className="h-5 w-5 text-yellow-400" />
                      <h3 className="font-semibold text-white text-sm">Data Breach Notification</h3>
                    </div>
                    <p className="text-2xl font-bold text-yellow-400">{formatCurrency(results.notificationCost)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ~{results.recordsAtRisk.toLocaleString()} records at risk
                    </p>
                    <p className="text-xs text-zinc-500 mt-2">
                      Includes legal compliance, credit monitoring, notification mailing, and regulatory fines.
                      Cost per record: ~${selectedIndustry?.recordCost} in {selectedIndustry?.label}.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-white/10 bg-card/50" data-testid="card-recovery-cost">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldAlert className="h-5 w-5 text-blue-400" />
                      <h3 className="font-semibold text-white text-sm">Recovery & Remediation</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-400">{formatCurrency(results.recoveryCost)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      + {formatCurrency(results.reputationCost)} in reputational damage
                    </p>
                    <p className="text-xs text-zinc-500 mt-2">
                      Incident response, forensics, system rebuild, security improvements, and customer churn.
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-orange-500/30 bg-gradient-to-br from-orange-950/20 to-zinc-900">
                <CardContent className="p-6 text-center">
                  <Crown className="h-8 w-8 text-orange-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">Unlock Detailed Breakdown</h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                    Supporter+ members get the full cost breakdown including ransom demand estimates, downtime costs,
                    notification expenses, and recovery projections.
                  </p>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white" asChild>
                    <a href="/pricing" data-testid="link-upgrade-detailed">
                      <Crown className="h-4 w-4 mr-2" /> Upgrade for Full Report
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}

            {sectorData && (
              <Card className="border-white/10 bg-card/50" data-testid="card-sector-intel">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-orange-400">
                    <TrendingUp className="h-4 w-4" /> Sector-Specific Threat Intelligence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-zinc-900/50 rounded-lg border border-white/5">
                      <p className="text-2xl font-bold text-red-400" data-testid="text-sector-incidents">
                        {sectorData.sectorIncidents || "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedIndustry?.label} incidents tracked
                      </p>
                    </div>
                    <div className="text-center p-3 bg-zinc-900/50 rounded-lg border border-white/5">
                      <p className="text-2xl font-bold text-orange-400" data-testid="text-total-victims">
                        {sectorData.totalVictims.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Total ransomware victims tracked</p>
                    </div>
                    <div className="text-center p-3 bg-zinc-900/50 rounded-lg border border-white/5">
                      <p className="text-2xl font-bold text-yellow-400" data-testid="text-active-groups">
                        {sectorData.totalGroups}
                      </p>
                      <p className="text-xs text-muted-foreground">Active ransomware groups</p>
                    </div>
                  </div>

                  {sectorData.topGroups.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-zinc-300 mb-2">
                        Most Active Ransomware Groups
                      </p>
                      <div className="space-y-2">
                        {sectorData.topGroups.map((group, idx) => (
                          <a
                            key={group.name}
                            href={`/group/${encodeURIComponent(group.name.toLowerCase().replace(/\s+/g, "-"))}`}
                            className="flex items-center justify-between p-2 bg-zinc-900/50 rounded border border-white/5 hover:border-orange-500/30 transition-colors"
                            data-testid={`link-group-${idx}`}
                          >
                            <span className="text-sm text-white flex items-center gap-2">
                              <span className="text-xs text-zinc-500 w-5">#{idx + 1}</span>
                              {group.name}
                            </span>
                            <Badge variant="outline" className="text-red-400 border-red-500/30 text-xs">
                              {group.victims} victims
                            </Badge>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card className="border-green-500/20 bg-green-950/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-green-400">
                  <Shield className="h-4 w-4" /> Protect Your Business
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      title: "Set Up Watchlist Alerts",
                      desc: "Get notified instantly when ransomware groups target your sector",
                      href: "/monitors",
                      cta: "Configure Alerts",
                    },
                    {
                      title: "Monitor Your Attack Surface",
                      desc: "Continuously scan your domains and IPs for vulnerabilities",
                      href: "/attack-surface",
                      cta: "Start Scanning",
                    },
                    {
                      title: "Review Incident Playbooks",
                      desc: "Be prepared with step-by-step response procedures",
                      href: "/playbooks",
                      cta: "View Playbooks",
                    },
                    {
                      title: "Complete Risk Assessment",
                      desc: "Get your full cybersecurity risk score with recommendations",
                      href: "/risk-score",
                      cta: "Take Assessment",
                    },
                  ].map((action) => (
                    <a
                      key={action.href}
                      href={action.href}
                      className="flex items-center justify-between p-3 bg-green-500/5 rounded-lg border border-green-500/10 hover:border-green-500/30 transition-colors group"
                      data-testid={`link-protect-${action.href.replace("/", "")}`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">{action.title}</p>
                        <p className="text-xs text-muted-foreground">{action.desc}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-400 group-hover:text-green-300 shrink-0"
                        tabIndex={-1}
                      >
                        {action.cta} <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-orange-500/20 bg-orange-950/10">
              <CardContent className="p-5 text-center">
                <AlertTriangle className="h-8 w-8 text-orange-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-white mb-2">Don't Wait Until It's Too Late</h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-lg mx-auto">
                  The average SMB that suffers a ransomware attack takes 23 days to fully recover.
                  40% of small businesses never recover. Start protecting your organization today.
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white" asChild>
                    <a href="/pricing" data-testid="link-upgrade-cta">
                      Upgrade to Pro <Crown className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/contact" data-testid="link-contact-cta">
                      Get a Free Consultation
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <p className="text-xs text-zinc-600 max-w-2xl mx-auto">
                <strong>Disclaimer:</strong> These estimates are based on industry averages, publicly available ransomware
                incident data, and statistical models. Actual costs may vary significantly. This tool is for educational
                and planning purposes only and does not constitute financial or legal advice.
              </p>
            </div>
          </div>
        ) : null}
      </div>
      <Footer />
    </Layout>
  );
}
