import Layout from "@/components/layout";
import Footer from "@/components/footer";
import RelatedResources, { getRelatedLinks } from "@/components/related-resources";
import ToolPageHeader from "@/components/tool-page-header";
import { useDocumentTitle } from "@/lib/use-document-title";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  MinusCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
  Download,
  Lock,
  Crown,
  FileText,
  ExternalLink,
} from "lucide-react";
import { useState, useMemo } from "react";

interface ComplianceControl {
  id: string;
  name: string;
  description: string;
  stbcsMapping: string;
  checkType: string;
}

interface ComplianceCategory {
  id: string;
  name: string;
  controls: ComplianceControl[];
}

interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  description: string;
  categories: ComplianceCategory[];
  totalControls?: number;
}

interface PostureData {
  hasWatchlist: boolean;
  hasUptimeMonitors: boolean;
  hasDarkWebMonitors: boolean;
  hasDigestOptIn: boolean;
  hasEmail: boolean;
  emailVerified: boolean;
}

type ControlStatus = "addressed" | "partial" | "not_addressed";

function getControlStatus(control: ComplianceControl, posture: PostureData | null): ControlStatus {
  if (!posture) return "not_addressed";

  switch (control.checkType) {
    case "watchlist":
      return posture.hasWatchlist ? "addressed" : "not_addressed";
    case "uptime":
      return posture.hasUptimeMonitors ? "addressed" : "not_addressed";
    case "darkweb":
      return posture.hasDarkWebMonitors ? "addressed" : "not_addressed";
    case "risk":
      return "partial";
    case "digest":
      return posture.hasDigestOptIn ? "addressed" : "not_addressed";
    case "ssl":
      return posture.hasUptimeMonitors ? "partial" : "not_addressed";
    case "attack_surface":
      return "partial";
    case "playbook":
      return "partial";
    case "export":
      return "partial";
    case "tool_usage":
      return "partial";
    case "manual":
      return "addressed";
    default:
      return "not_addressed";
  }
}

function StatusIcon({ status }: { status: ControlStatus }) {
  switch (status) {
    case "addressed":
      return <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />;
    case "partial":
      return <MinusCircle className="h-4 w-4 text-amber-400 shrink-0" />;
    case "not_addressed":
      return <XCircle className="h-4 w-4 text-zinc-500 shrink-0" />;
  }
}

function StatusBadge({ status }: { status: ControlStatus }) {
  switch (status) {
    case "addressed":
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px]">Addressed</Badge>;
    case "partial":
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">Partial</Badge>;
    case "not_addressed":
      return <Badge className="bg-zinc-700/50 text-zinc-400 border-zinc-600/30 text-[10px]">Not Addressed</Badge>;
  }
}

function CategorySection({
  category,
  posture,
  isAuthenticated,
}: {
  category: ComplianceCategory;
  posture: PostureData | null;
  isAuthenticated: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const stats = useMemo(() => {
    let addressed = 0, partial = 0, notAddressed = 0;
    for (const control of category.controls) {
      const status = isAuthenticated ? getControlStatus(control, posture) : "not_addressed";
      if (status === "addressed") addressed++;
      else if (status === "partial") partial++;
      else notAddressed++;
    }
    const total = category.controls.length;
    const coverage = total > 0 ? Math.round(((addressed + partial * 0.5) / total) * 100) : 0;
    return { addressed, partial, notAddressed, total, coverage };
  }, [category, posture, isAuthenticated]);

  return (
    <Card className="border-white/5 bg-card/50" data-testid={`card-category-${category.id}`}>
      <button
        className="w-full text-left"
        onClick={() => setExpanded(!expanded)}
        data-testid={`button-toggle-${category.id}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {expanded ? (
                <ChevronDown className="h-4 w-4 text-zinc-400 shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 text-zinc-400 shrink-0" />
              )}
              <CardTitle className="text-sm font-semibold text-white truncate">
                {category.name}
              </CardTitle>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-2">
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <span className="text-green-400">{stats.addressed}</span>
                <span>/</span>
                <span className="text-amber-400">{stats.partial}</span>
                <span>/</span>
                <span className="text-zinc-500">{stats.notAddressed}</span>
              </div>
              <div className="w-16">
                <Progress value={stats.coverage} className="h-1.5" />
              </div>
              <span className={`text-xs font-bold w-10 text-right ${
                stats.coverage >= 70 ? "text-green-400" :
                stats.coverage >= 40 ? "text-amber-400" : "text-zinc-500"
              }`}>
                {stats.coverage}%
              </span>
            </div>
          </div>
        </CardHeader>
      </button>
      {expanded && (
        <CardContent className="pt-0 pb-4">
          <div className="space-y-2">
            {category.controls.map((control) => {
              const status = isAuthenticated ? getControlStatus(control, posture) : "not_addressed";
              return (
                <div
                  key={control.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-zinc-900/50 border border-white/5"
                  data-testid={`control-${control.id}`}
                >
                  <StatusIcon status={status} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-mono text-orange-400">{control.id}</span>
                      <span className="text-sm font-medium text-white">{control.name}</span>
                      <StatusBadge status={status} />
                    </div>
                    <p className="text-xs text-zinc-400 mb-1.5">{control.description}</p>
                    <p className="text-xs text-zinc-500">
                      <span className="text-orange-400/70 font-medium">STBCS:</span>{" "}
                      {control.stbcsMapping}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function FrameworkView({
  framework,
  posture,
  isAuthenticated,
  isPro,
}: {
  framework: ComplianceFramework;
  posture: PostureData | null;
  isAuthenticated: boolean;
  isPro: boolean;
}) {
  const overallStats = useMemo(() => {
    let addressed = 0, partial = 0, notAddressed = 0, total = 0;
    for (const cat of framework.categories) {
      for (const control of cat.controls) {
        total++;
        const status = isAuthenticated ? getControlStatus(control, posture) : "not_addressed";
        if (status === "addressed") addressed++;
        else if (status === "partial") partial++;
        else notAddressed++;
      }
    }
    const coverage = total > 0 ? Math.round(((addressed + partial * 0.5) / total) * 100) : 0;
    return { addressed, partial, notAddressed, total, coverage };
  }, [framework, posture, isAuthenticated]);

  const handleExport = () => {
    const lines = [
      `COMPLIANCE COVERAGE REPORT — ${framework.name} ${framework.version}`,
      `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      `Platform: STB Cybersecurity (stbcybersecurity.com)`,
      "",
      `OVERALL COVERAGE: ${overallStats.coverage}%`,
      `Controls Addressed: ${overallStats.addressed}/${overallStats.total}`,
      `Controls Partial: ${overallStats.partial}/${overallStats.total}`,
      `Controls Not Addressed: ${overallStats.notAddressed}/${overallStats.total}`,
      "",
      "=" .repeat(60),
      "",
    ];

    for (const cat of framework.categories) {
      lines.push(`${cat.name}`);
      lines.push("-".repeat(40));
      for (const control of cat.controls) {
        const status = isAuthenticated ? getControlStatus(control, posture) : "not_addressed";
        const statusLabel = status === "addressed" ? "[✓ ADDRESSED]" : status === "partial" ? "[~ PARTIAL]" : "[✗ NOT ADDRESSED]";
        lines.push(`  ${control.id} — ${control.name}  ${statusLabel}`);
        lines.push(`    ${control.description}`);
        lines.push(`    STBCS Action: ${control.stbcsMapping}`);
        lines.push("");
      }
      lines.push("");
    }

    lines.push("=".repeat(60));
    lines.push("Generated by STB Cybersecurity — stbcybersecurity.com");

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stbcs-compliance-${framework.id}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Card className="border-orange-500/20 bg-card/50">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1" data-testid={`text-framework-${framework.id}`}>
                {framework.name} {framework.version}
              </h3>
              <p className="text-sm text-zinc-400">{framework.description}</p>
            </div>
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-800" />
                  <circle
                    cx="18" cy="18" r="15.5" fill="none"
                    strokeWidth="2"
                    strokeDasharray={`${overallStats.coverage} ${100 - overallStats.coverage}`}
                    strokeLinecap="round"
                    className={
                      overallStats.coverage >= 70 ? "text-green-400" :
                      overallStats.coverage >= 40 ? "text-amber-400" : "text-red-400"
                    }
                    stroke="currentColor"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-lg font-bold ${
                    overallStats.coverage >= 70 ? "text-green-400" :
                    overallStats.coverage >= 40 ? "text-amber-400" : "text-red-400"
                  }`} data-testid={`text-coverage-${framework.id}`}>
                    {overallStats.coverage}%
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Coverage</span>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
              <span className="text-xs text-zinc-400">{overallStats.addressed} Addressed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MinusCircle className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs text-zinc-400">{overallStats.partial} Partial</span>
            </div>
            <div className="flex items-center gap-1.5">
              <XCircle className="h-3.5 w-3.5 text-zinc-500" />
              <span className="text-xs text-zinc-400">{overallStats.notAddressed} Not Addressed</span>
            </div>
            <div className="ml-auto">
              {isPro ? (
                <Button variant="outline" size="sm" onClick={handleExport} data-testid={`button-export-${framework.id}`}>
                  <Download className="h-3.5 w-3.5 mr-1.5" /> Export Report
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled className="opacity-50">
                  <Lock className="h-3.5 w-3.5 mr-1.5" /> Export (Business+)
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {!isAuthenticated && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-amber-200 font-medium">Sign in for personalized compliance status</p>
              <p className="text-xs text-zinc-400">Create a free account to see which controls your STBCS activity covers.</p>
            </div>
            <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white shrink-0" asChild>
              <a href="/pricing">Get Started</a>
            </Button>
          </CardContent>
        </Card>
      )}

      {framework.categories.map((cat) => (
        <CategorySection
          key={cat.id}
          category={cat}
          posture={posture}
          isAuthenticated={isAuthenticated}
        />
      ))}
    </div>
  );
}

export default function Compliance() {
  useDocumentTitle(
    "Compliance Mapping | STB Cybersecurity",
    "Map your security posture to NIST CSF, CIS Controls, and ISO 27001 frameworks. See how STBCS tools cover compliance requirements."
  );

  const { isAuthenticated, isPro } = useAuth();

  const { data: frameworks, isLoading: frameworksLoading } = useQuery<ComplianceFramework[]>({
    queryKey: ["/api/compliance/frameworks"],
    queryFn: async () => {
      const res = await fetch("/api/compliance/frameworks");
      if (!res.ok) throw new Error("Failed to fetch frameworks");
      return res.json();
    },
  });

  const [activeTab, setActiveTab] = useState("nist-csf");

  const { data: activeFramework, isLoading: frameworkLoading } = useQuery<ComplianceFramework>({
    queryKey: ["/api/compliance/framework", activeTab],
    queryFn: async () => {
      const res = await fetch(`/api/compliance/framework/${activeTab}`);
      if (!res.ok) throw new Error("Failed to fetch framework");
      return res.json();
    },
  });

  const { data: posture } = useQuery<PostureData>({
    queryKey: ["/api/compliance/posture"],
    queryFn: async () => {
      const res = await fetch("/api/compliance/posture", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch posture");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const isLoading = frameworksLoading || frameworkLoading;

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <ToolPageHeader
          icon={<Shield className="h-7 w-7 text-orange-400" />}
          title="Compliance Mapping"
          description="See how your STB Cybersecurity activity maps to major security frameworks. Track your compliance coverage across NIST CSF, CIS Controls, and ISO 27001."
          tier="free"
          breadcrumbs={[
            { label: "Dashboard", href: "/" },
            { label: "Compliance Mapping" },
          ]}
          statusBadges={
            frameworks
              ? frameworks.map((f) => ({
                  label: f.name,
                  count: f.totalControls,
                  variant: "info" as const,
                }))
              : []
          }
          testIdPrefix="compliance"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: ShieldCheck,
              title: "NIST CSF 2.0",
              desc: "6 core functions covering the full cybersecurity lifecycle",
              color: "text-blue-400",
              bg: "bg-blue-500/10 border-blue-500/20",
            },
            {
              icon: Shield,
              title: "CIS Controls v8",
              desc: "Prioritized safeguards for essential cyber hygiene",
              color: "text-green-400",
              bg: "bg-green-500/10 border-green-500/20",
            },
            {
              icon: FileText,
              title: "ISO 27001:2022",
              desc: "International standard for information security management",
              color: "text-purple-400",
              bg: "bg-purple-500/10 border-purple-500/20",
            },
          ].map((item) => (
            <Card key={item.title} className={`border ${item.bg}`} data-testid={`card-overview-${item.title.toLowerCase().replace(/[\s:]+/g, '-')}`}>
              <CardContent className="p-4 text-center">
                <item.icon className={`h-8 w-8 ${item.color} mx-auto mb-2`} />
                <h3 className="text-sm font-bold text-white mb-1">{item.title}</h3>
                <p className="text-xs text-zinc-400">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : frameworks && frameworks.length > 0 ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-zinc-900 border border-zinc-500 w-full justify-start overflow-x-auto" data-testid="tabs-frameworks">
              {frameworks.map((f) => (
                <TabsTrigger
                  key={f.id}
                  value={f.id}
                  className="data-[state=active]:bg-orange-500/10 data-[state=active]:text-orange-400"
                  data-testid={`tab-${f.id}`}
                >
                  {f.name} {f.version}
                </TabsTrigger>
              ))}
            </TabsList>

            {activeFramework && (
              <TabsContent value={activeTab} className="mt-4">
                <FrameworkView
                  framework={activeFramework}
                  posture={posture || null}
                  isAuthenticated={isAuthenticated}
                  isPro={isPro}
                />
              </TabsContent>
            )}
          </Tabs>
        ) : (
          <Card className="border-white/5">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto mb-3" />
              <p className="text-sm text-zinc-400">Failed to load compliance frameworks. Please try again later.</p>
            </CardContent>
          </Card>
        )}

        <Card className="border-orange-500/20 bg-orange-500/5">
          <CardContent className="p-5 text-center">
            <Crown className="h-8 w-8 text-orange-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Need Compliance Reports for Audits?</h3>
            <p className="text-sm text-zinc-400 mb-4 max-w-lg mx-auto">
              Business+ subscribers can export detailed compliance reports showing your coverage across all frameworks. Perfect for board presentations, audits, and vendor assessments.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white" asChild>
                <a href="/pricing" data-testid="link-upgrade-compliance">
                  <Crown className="h-4 w-4 mr-1.5" /> Upgrade to Business
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/risk-score" data-testid="link-risk-score">
                  <ShieldCheck className="h-4 w-4 mr-1.5" /> Take Risk Assessment
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
              <RelatedResources links={getRelatedLinks("/compliance")} testIdPrefix="compliance" />
<Footer />
    </Layout>
  );
}
