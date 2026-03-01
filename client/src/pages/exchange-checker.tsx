import { useState } from "react";
import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield, Lock, Crown, Loader2, AlertTriangle, CheckCircle2, XCircle,
  Info, Globe, ShieldAlert, Server, Mail, Search, ExternalLink
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface EndpointCheck {
  path: string;
  accessible: boolean;
  statusCode?: number;
  headers?: Record<string, string>;
  redirectUrl?: string;
}

interface VulnerabilityInfo {
  cve: string;
  name: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  affectedVersions: string[];
  patchedDate?: string;
}

interface MxRecord {
  exchange: string;
  priority: number;
  isExchangeOnline: boolean;
}

interface Finding {
  type: "critical" | "warning" | "info";
  message: string;
}

interface ExchangeCheckResult {
  hostname: string;
  isExchange: boolean;
  exchangeOnline: boolean;
  onPremise: boolean;
  version?: string;
  buildNumber?: string;
  endpoints: EndpointCheck[];
  mxRecords: MxRecord[];
  vulnerabilities: VulnerabilityInfo[];
  serverHeaders: Record<string, string>;
  riskLevel: "critical" | "high" | "medium" | "low" | "info";
  findings: Finding[];
  scanTime: number;
}

function RiskBadge({ level }: { level: ExchangeCheckResult["riskLevel"] }) {
  const config = {
    critical: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/50", label: "CRITICAL" },
    high: { bg: "bg-orange-500/20", text: "text-orange-400", border: "border-orange-500/50", label: "HIGH" },
    medium: { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/50", label: "MEDIUM" },
    low: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/50", label: "LOW" },
    info: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/50", label: "INFO" },
  };
  const c = config[level];
  return (
    <div
      className={`flex items-center justify-center w-24 h-24 rounded-2xl border-2 shadow-lg ${c.bg} ${c.border}`}
      style={{ boxShadow: `0 0 24px ${level === "critical" ? "rgba(239,68,68,0.2)" : level === "high" ? "rgba(249,115,22,0.2)" : level === "medium" ? "rgba(245,158,11,0.2)" : level === "low" ? "rgba(34,197,94,0.2)" : "rgba(59,130,246,0.2)"}` }}
      data-testid="badge-risk-level"
    >
      <span className={`text-lg font-display font-black ${c.text}`}>{c.label}</span>
    </div>
  );
}

function FindingIcon({ type }: { type: Finding["type"] }) {
  if (type === "critical") return <XCircle className="h-4 w-4 text-red-400 shrink-0" />;
  if (type === "warning") return <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />;
  return <Info className="h-4 w-4 text-blue-400 shrink-0" />;
}

function findingColor(type: Finding["type"]) {
  if (type === "critical") return "border-red-500/30 bg-red-500/5";
  if (type === "warning") return "border-amber-500/30 bg-amber-500/5";
  return "border-blue-500/30 bg-blue-500/5";
}

function severityBadgeClass(severity: VulnerabilityInfo["severity"]) {
  if (severity === "critical") return "bg-red-500/20 text-red-400 border-red-500/50";
  if (severity === "high") return "bg-orange-500/20 text-orange-400 border-orange-500/50";
  if (severity === "medium") return "bg-amber-500/20 text-amber-400 border-amber-500/50";
  return "bg-green-500/20 text-green-400 border-green-500/50";
}

function DetectionStatusCard({ result }: { result: ExchangeCheckResult }) {
  return (
    <Card className="border-white/5 bg-card/50" data-testid="card-detection-status">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-white">
          <Server className="h-4 w-4 text-orange-400" /> Detection Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
            {result.isExchange ? (
              <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-zinc-600 shrink-0" />
            )}
            <div>
              <p className="text-xs text-zinc-500">Exchange Detected</p>
              <p className="text-sm font-mono font-bold text-white" data-testid="text-exchange-detected">
                {result.isExchange ? "Yes" : "No"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
            {result.exchangeOnline ? (
              <CheckCircle2 className="h-5 w-5 text-blue-400 shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-zinc-600 shrink-0" />
            )}
            <div>
              <p className="text-xs text-zinc-500">Exchange Online (M365)</p>
              <p className="text-sm font-mono font-bold text-white" data-testid="text-exchange-online">
                {result.exchangeOnline ? "Yes" : "No"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
            {result.onPremise ? (
              <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-zinc-600 shrink-0" />
            )}
            <div>
              <p className="text-xs text-zinc-500">On-Premise</p>
              <p className="text-sm font-mono font-bold text-white" data-testid="text-on-premise">
                {result.onPremise ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </div>
        {result.version && (
          <div className="mt-4 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
            <p className="text-xs text-zinc-500">Detected Version</p>
            <p className="text-sm font-mono font-bold text-white mt-1" data-testid="text-exchange-version">
              {result.version}
            </p>
            {result.buildNumber && (
              <p className="text-xs text-zinc-500 mt-1">Build: {result.buildNumber}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EndpointsCard({ endpoints }: { endpoints: EndpointCheck[] }) {
  const accessible = endpoints.filter(e => e.accessible);
  const inaccessible = endpoints.filter(e => !e.accessible);

  return (
    <Card className="border-white/5 bg-card/50" data-testid="card-endpoints">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2 text-white">
            <Globe className="h-4 w-4 text-orange-400" /> Endpoint Exposure
          </CardTitle>
          <div className="flex items-center gap-2">
            {accessible.length > 0 && (
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50 text-[10px]">
                {accessible.length} Exposed
              </Badge>
            )}
            <Badge className="bg-zinc-700 text-zinc-400 text-[10px]">
              {endpoints.length} Checked
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {accessible.map((ep, i) => (
          <div
            key={ep.path}
            className="flex items-center justify-between px-3 py-2 rounded-lg border border-amber-500/30 bg-amber-500/5"
            data-testid={`endpoint-accessible-${i}`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
              <span className="text-sm text-white font-mono truncate">{ep.path}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 text-[10px]">
                HTTP {ep.statusCode}
              </Badge>
              {ep.redirectUrl && (
                <span className="text-[10px] text-zinc-500 max-w-32 truncate" title={ep.redirectUrl}>
                  <ExternalLink className="h-3 w-3 inline mr-1" />{ep.redirectUrl}
                </span>
              )}
            </div>
          </div>
        ))}
        {inaccessible.map((ep, i) => (
          <div
            key={ep.path}
            className="flex items-center justify-between px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-900/50"
            data-testid={`endpoint-inaccessible-${i}`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <XCircle className="h-4 w-4 text-zinc-600 shrink-0" />
              <span className="text-sm text-zinc-500 font-mono truncate">{ep.path}</span>
            </div>
            <span className="text-[10px] text-zinc-600 shrink-0">Not Accessible</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function MxRecordsCard({ mxRecords }: { mxRecords: MxRecord[] }) {
  if (mxRecords.length === 0) return null;

  return (
    <Card className="border-white/5 bg-card/50" data-testid="card-mx-records">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-white">
          <Mail className="h-4 w-4 text-orange-400" /> MX Records
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {mxRecords.map((mx, i) => (
          <div
            key={i}
            className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
              mx.isExchangeOnline ? "border-blue-500/30 bg-blue-500/5" : "border-zinc-800 bg-zinc-900/50"
            }`}
            data-testid={`mx-record-${i}`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Mail className={`h-4 w-4 shrink-0 ${mx.isExchangeOnline ? "text-blue-400" : "text-zinc-400"}`} />
              <span className="text-sm text-white font-mono truncate">{mx.exchange}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 text-[10px]">
                Priority {mx.priority}
              </Badge>
              {mx.isExchangeOnline && (
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50 text-[10px]">
                  Exchange Online
                </Badge>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function VulnerabilitiesCard({ vulnerabilities }: { vulnerabilities: VulnerabilityInfo[] }) {
  if (vulnerabilities.length === 0) return null;

  const critical = vulnerabilities.filter(v => v.severity === "critical");
  const high = vulnerabilities.filter(v => v.severity === "high");
  const other = vulnerabilities.filter(v => v.severity !== "critical" && v.severity !== "high");

  return (
    <Card className="border-white/5 bg-card/50" data-testid="card-vulnerabilities">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2 text-white">
            <ShieldAlert className="h-4 w-4 text-red-400" /> Known Vulnerabilities
          </CardTitle>
          <div className="flex items-center gap-2">
            {critical.length > 0 && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/50 text-[10px]">
                {critical.length} Critical
              </Badge>
            )}
            {high.length > 0 && (
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50 text-[10px]">
                {high.length} High
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>
          Potential vulnerabilities based on detected Exchange version. Verify patching status.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {vulnerabilities.map((vuln, i) => (
          <div
            key={vuln.cve}
            className={`p-3 rounded-lg border ${
              vuln.severity === "critical" ? "border-red-500/30 bg-red-500/5" :
              vuln.severity === "high" ? "border-orange-500/30 bg-orange-500/5" :
              "border-zinc-800 bg-zinc-900/50"
            }`}
            data-testid={`vulnerability-${i}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={`https://nvd.nist.gov/vuln/detail/${vuln.cve}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-mono font-bold text-white hover:text-orange-400 transition-colors"
                    data-testid={`link-cve-${vuln.cve}`}
                  >
                    {vuln.cve}
                  </a>
                  <Badge className={`${severityBadgeClass(vuln.severity)} text-[9px]`}>
                    {vuln.severity.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-orange-400 font-medium mt-1">{vuln.name}</p>
                <p className="text-xs text-zinc-400 mt-1">{vuln.description}</p>
                {vuln.patchedDate && (
                  <p className="text-[10px] text-zinc-600 mt-1">Patched: {vuln.patchedDate}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function FindingsCard({ findings }: { findings: Finding[] }) {
  if (findings.length === 0) return null;

  const critical = findings.filter(f => f.type === "critical");
  const warnings = findings.filter(f => f.type === "warning");
  const infos = findings.filter(f => f.type === "info");

  const groups = [
    { label: "Critical", items: critical, color: "text-red-400" },
    { label: "Warnings", items: warnings, color: "text-amber-400" },
    { label: "Informational", items: infos, color: "text-blue-400" },
  ].filter(g => g.items.length > 0);

  return (
    <Card className="border-white/5 bg-card/50" data-testid="card-findings">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2 text-white">
            <AlertTriangle className="h-4 w-4 text-orange-400" /> Findings
          </CardTitle>
          <div className="flex items-center gap-2">
            {critical.length > 0 && <Badge className="bg-red-500/20 text-red-400 border-red-500/50 text-[10px]">{critical.length} Critical</Badge>}
            {warnings.length > 0 && <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50 text-[10px]">{warnings.length} Warning</Badge>}
            {infos.length > 0 && <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50 text-[10px]">{infos.length} Info</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {groups.map((group) => (
          <div key={group.label} className="space-y-2">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${group.color}`}>{group.label}</h4>
            {group.items.map((finding, i) => (
              <div key={i} className={`p-3 rounded-lg border ${findingColor(finding.type)}`} data-testid={`finding-${finding.type}-${i}`}>
                <div className="flex items-start gap-2">
                  <FindingIcon type={finding.type} />
                  <p className="text-sm text-white">{finding.message}</p>
                </div>
              </div>
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function ExchangeChecker() {
  useDocumentTitle("Exchange Checker | STB Cybersecurity");
  const { isAuthenticated, isPro } = useAuth();
  const { toast } = useToast();

  const [hostname, setHostname] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ExchangeCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostname.trim()) return;

    setIsScanning(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/tools/exchange-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ hostname: hostname.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Scan failed" }));
        throw new Error(data.error || `Scan failed (${res.status})`);
      }

      const data = await res.json();
      setResult(data);
      toast({ title: "Scan Complete", description: `Exchange check for ${hostname} finished in ${(data.scanTime / 1000).toFixed(1)}s` });
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Scan Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsScanning(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="p-5 rounded-full bg-orange-500/10">
              <Lock className="h-12 w-12 text-orange-400" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-display font-bold text-white" data-testid="text-exchange-checker-login-required">
                Sign In Required
              </h2>
              <p className="text-zinc-400 max-w-md">
                Exchange Checker requires authentication. Please sign in with your STB Cybersecurity account to continue.
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </Layout>
    );
  }

  if (!isPro) {
    return (
      <Layout>
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="p-5 rounded-full bg-orange-500/10">
              <Crown className="h-12 w-12 text-orange-400" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-display font-bold text-white" data-testid="text-exchange-checker-upgrade-required">
                Pro Subscription Required
              </h2>
              <p className="text-zinc-400 max-w-md">
                The Exchange Checker is available to Pro, Business, and Enterprise subscribers.
                Upgrade your plan to detect Exchange servers, exposed endpoints, and known vulnerabilities.
              </p>
            </div>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold" asChild>
              <a href="/pricing" data-testid="link-exchange-checker-upgrade">
                <Crown className="h-4 w-4 mr-2" /> Upgrade to Pro
              </a>
            </Button>
          </div>
        </div>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-white" data-testid="text-exchange-checker-title">
              Exchange Checker
            </h1>
            <p className="text-muted-foreground mt-1">
              Detect Microsoft Exchange servers, exposed endpoints, version info, and known vulnerabilities
            </p>
          </div>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
            <Crown className="h-3 w-3 mr-1" /> PRO
          </Badge>
        </div>

        <Card className="border-white/5 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Shield className="h-5 w-5 text-orange-400" /> Scan Domain
            </CardTitle>
            <CardDescription>
              Enter a domain to check for Exchange server exposure, endpoints, and vulnerability indicators.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Label htmlFor="hostname" className="sr-only">Domain</Label>
                <Input
                  id="hostname"
                  type="text"
                  placeholder="example.com"
                  value={hostname}
                  onChange={(e) => setHostname(e.target.value)}
                  disabled={isScanning}
                  className="bg-zinc-900/50 border-zinc-700 focus:border-orange-500/50"
                  data-testid="input-exchange-hostname"
                />
              </div>
              <Button
                type="submit"
                disabled={isScanning || !hostname.trim()}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold gap-2"
                data-testid="button-exchange-scan"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Scanning...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" /> Check Exchange
                  </>
                )}
              </Button>
            </form>

            {error && (
              <div className="flex items-center gap-2 p-3 mt-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm" data-testid="text-exchange-error">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {result && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <Card className="border-white/5 bg-card/50" data-testid="card-exchange-summary">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <RiskBadge level={result.riskLevel} />
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-xl font-display font-bold text-white" data-testid="text-exchange-hostname">
                      {result.hostname}
                    </h2>
                    <p className="text-sm text-zinc-400 mt-1">
                      {result.isExchange
                        ? result.onPremise
                          ? "On-premise Exchange Server detected"
                          : result.exchangeOnline
                            ? "Exchange Online (Microsoft 365) detected"
                            : "Exchange indicators detected"
                        : "No Exchange Server indicators found"}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                      {result.isExchange && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/50 text-[10px]">
                          Exchange Detected
                        </Badge>
                      )}
                      {result.onPremise && (
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50 text-[10px]">
                          On-Premise
                        </Badge>
                      )}
                      {result.exchangeOnline && (
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50 text-[10px]">
                          Exchange Online
                        </Badge>
                      )}
                      {result.vulnerabilities.length > 0 && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/50 text-[10px]">
                          {result.vulnerabilities.length} CVEs
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-zinc-600 mt-2">
                      Scan completed in {(result.scanTime / 1000).toFixed(1)}s
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <DetectionStatusCard result={result} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EndpointsCard endpoints={result.endpoints} />
              <MxRecordsCard mxRecords={result.mxRecords} />
            </div>

            <VulnerabilitiesCard vulnerabilities={result.vulnerabilities} />
            <FindingsCard findings={result.findings} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-white/5 bg-card/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Server className="h-4 w-4 text-orange-400" />
                </div>
                <CardTitle className="text-sm text-white">Endpoint Detection</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Probes Autodiscover, OWA, ECP, EWS, ActiveSync, and other Exchange-specific endpoints for exposure.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-card/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <ShieldAlert className="h-4 w-4 text-red-400" />
                </div>
                <CardTitle className="text-sm text-white">Vulnerability Mapping</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Maps detected Exchange versions to known CVEs including ProxyLogon, ProxyShell, and ProxyNotShell.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-card/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Mail className="h-4 w-4 text-blue-400" />
                </div>
                <CardTitle className="text-sm text-white">MX Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Analyzes MX records to determine if the domain uses Exchange Online (Microsoft 365) or on-premise mail.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-start gap-2 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
          <Shield className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
          <p className="text-xs text-zinc-400">
            This tool performs passive reconnaissance only. No authentication attempts or exploit testing is performed.
            Results should be verified and correlated with internal infrastructure knowledge.
          </p>
        </div>
      </div>
      <Footer />
    </Layout>
  );
}
