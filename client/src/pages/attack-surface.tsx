import { useState } from "react";
import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Radar, Globe, Shield, ShieldAlert, Server, Lock, Mail,
  AlertTriangle, Check, X, Loader2, Crown, Clock, ChevronRight,
  ChevronDown, ExternalLink, Wifi, Eye, Bug, FileSearch,
  ArrowRight, Hash, Tag, MonitorCheck
} from "lucide-react";
import { useAttackSurfaceScans, useAttackSurfaceScan, useStartAttackSurfaceScan } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";

function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    critical: "bg-red-500/20 text-red-400 border-red-500/50",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/50",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    low: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    info: "bg-zinc-500/20 text-zinc-400 border-zinc-500/50",
  };
  return <Badge className={styles[severity] || styles.info}>{severity.toUpperCase()}</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "complete") return <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Complete</Badge>;
  if (status === "running") return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50 animate-pulse">Scanning...</Badge>;
  if (status === "failed") return <Badge className="bg-red-500/20 text-red-400 border-red-500/50">Failed</Badge>;
  return <Badge className="bg-zinc-500/20 text-zinc-400">Queued</Badge>;
}

function timeAgo(date: string | Date | null): string {
  if (!date) return "—";
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

const assetTypeLabels: Record<string, { label: string; icon: any }> = {
  subdomain: { label: "Subdomains", icon: Globe },
  dns_a: { label: "DNS A Records", icon: Server },
  dns_mx: { label: "Mail Servers", icon: Mail },
  dns_ns: { label: "Name Servers", icon: Globe },
  dns_txt: { label: "DNS TXT Records", icon: Hash },
  open_port: { label: "Open Ports", icon: Wifi },
  vulnerability: { label: "Vulnerabilities", icon: Bug },
  email_security: { label: "Email Security Issues", icon: ShieldAlert },
  email_summary: { label: "Email Security Summary", icon: Mail },
  ssl_cert: { label: "SSL Certificate", icon: Lock },
  technology: { label: "Technologies Detected", icon: MonitorCheck },
  missing_header: { label: "Missing Security Headers", icon: ShieldAlert },
  security_header: { label: "Security Headers", icon: Shield },
  tag: { label: "Tags", icon: Tag },
};

function AssetGroup({ type, assets }: { type: string; assets: any[] }) {
  const [expanded, setExpanded] = useState(type === "vulnerability" || type === "email_security" || type === "open_port" || type === "missing_header");
  const info = assetTypeLabels[type] || { label: type, icon: FileSearch };
  const Icon = info.icon;
  const critCount = assets.filter(a => a.severity === "critical").length;
  const highCount = assets.filter(a => a.severity === "high").length;

  if (type === "email_summary") return null;

  return (
    <Card className="bg-zinc-900/50 border-zinc-800" data-testid={`asset-group-${type}`}>
      <button
        className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-800/50 transition-colors rounded-lg"
        onClick={() => setExpanded(!expanded)}
        data-testid={`toggle-${type}`}
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-orange-400" />
          <span className="font-medium text-zinc-200">{info.label}</span>
          <Badge variant="outline" className="text-zinc-400 border-zinc-700">{assets.length}</Badge>
          {critCount > 0 && <Badge className="bg-red-500/20 text-red-400 border-red-500/50">{critCount} Critical</Badge>}
          {highCount > 0 && <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50">{highCount} High</Badge>}
        </div>
        {expanded ? <ChevronDown className="h-4 w-4 text-zinc-500" /> : <ChevronRight className="h-4 w-4 text-zinc-500" />}
      </button>
      {expanded && (
        <CardContent className="pt-0 pb-4 px-4">
          <div className="space-y-2">
            {assets.map((asset, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50" data-testid={`asset-${type}-${i}`}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-sm text-zinc-300 font-mono truncate">{asset.value}</span>
                  {asset.metadata && type === "open_port" && (() => {
                    try { const m = JSON.parse(asset.metadata); return <span className="text-xs text-zinc-500">({m.ip})</span>; } catch { return null; }
                  })()}
                  {asset.metadata && type === "ssl_cert" && (() => {
                    try {
                      const m = JSON.parse(asset.metadata);
                      return <span className="text-xs text-zinc-500">{m.issuer} &middot; {m.daysRemaining}d remaining</span>;
                    } catch { return null; }
                  })()}
                </div>
                <SeverityBadge severity={asset.severity || "info"} />
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function RiskGauge({ score }: { score: number }) {
  const color = score >= 75 ? "text-red-400" : score >= 50 ? "text-orange-400" : score >= 25 ? "text-yellow-400" : "text-green-400";
  const label = score >= 75 ? "Critical" : score >= 50 ? "High" : score >= 25 ? "Medium" : "Low";
  return (
    <div className="flex flex-col items-center gap-2" data-testid="risk-gauge">
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="8" className="text-zinc-800" />
          <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="8" className={color}
            strokeDasharray={`${score * 3.14} 314`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${color}`}>{score}</span>
          <span className="text-xs text-zinc-500">/ 100</span>
        </div>
      </div>
      <span className={`text-sm font-medium ${color}`}>{label} Risk</span>
    </div>
  );
}

function ScanResults({ scanId }: { scanId: string }) {
  const { data, isLoading } = useAttackSurfaceScan(scanId);

  if (isLoading) return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 bg-zinc-800" />)}
    </div>
  );

  if (!data) return <div className="text-zinc-500 text-center py-8">Scan not found</div>;

  const { scan, assets } = data;
  let summary: any = {};
  try { summary = scan.summary ? JSON.parse(scan.summary) : {}; } catch {}

  const grouped = assets.reduce((acc: Record<string, any[]>, asset: any) => {
    (acc[asset.assetType] = acc[asset.assetType] || []).push(asset);
    return acc;
  }, {});

  const priorityOrder = ["vulnerability", "open_port", "email_security", "missing_header", "ssl_cert", "subdomain", "technology", "security_header", "dns_a", "dns_mx", "dns_ns", "dns_txt", "tag"];
  const sortedTypes = Object.keys(grouped).sort((a, b) => {
    const ai = priorityOrder.indexOf(a);
    const bi = priorityOrder.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-200" data-testid="scan-domain">{scan.domain}</h3>
          <p className="text-sm text-zinc-500">Scanned {timeAgo(scan.completedAt || scan.startedAt)}</p>
        </div>
        {scan.status === "running" && (
          <div className="flex items-center gap-2 text-orange-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Scanning in progress...</span>
          </div>
        )}
        {scan.status === "complete" && summary.riskScore !== undefined && (
          <RiskGauge score={summary.riskScore} />
        )}
      </div>

      {scan.status === "complete" && summary.findings && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-testid="scan-summary-grid">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-zinc-200">{summary.totalAssets || 0}</div>
              <div className="text-xs text-zinc-500 mt-1">Total Assets</div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-zinc-200">{summary.subdomains || 0}</div>
              <div className="text-xs text-zinc-500 mt-1">Subdomains</div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-400">{summary.openPorts || 0}</div>
              <div className="text-xs text-zinc-500 mt-1">Open Ports</div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-400">{(summary.findings?.critical || 0) + (summary.findings?.high || 0)}</div>
              <div className="text-xs text-zinc-500 mt-1">Critical/High</div>
            </CardContent>
          </Card>
        </div>
      )}

      {scan.status === "running" && (
        <Card className="bg-orange-500/5 border-orange-500/20">
          <CardContent className="p-6 flex items-center gap-4">
            <Loader2 className="h-8 w-8 text-orange-400 animate-spin flex-shrink-0" />
            <div>
              <p className="text-orange-300 font-medium">Scanning {scan.domain}...</p>
              <p className="text-sm text-zinc-500 mt-1">Checking subdomains, DNS, ports, email security, SSL, and technologies. This typically takes 15-30 seconds.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {scan.status === "failed" && (
        <Card className="bg-red-500/5 border-red-500/20">
          <CardContent className="p-6">
            <p className="text-red-400 font-medium">Scan Failed</p>
            <p className="text-sm text-zinc-500 mt-1">{scan.lastError || "An unexpected error occurred."}</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {sortedTypes.map(type => (
          <AssetGroup key={type} type={type} assets={grouped[type]} />
        ))}
      </div>
    </div>
  );
}

export default function AttackSurface() {
  useDocumentTitle("Attack Surface Discovery | STBCS");
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [domain, setDomain] = useState("");
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);

  const { data: scans, isLoading: scansLoading } = useAttackSurfaceScans();
  const startScan = useStartAttackSurfaceScan();

  const handleScan = () => {
    if (!domain.trim()) return;
    startScan.mutate({ domain: domain.trim() }, {
      onSuccess: (data) => {
        setSelectedScanId(data.scan.id);
        setDomain("");
      },
    });
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <Card className="bg-zinc-900/50 border-zinc-800 max-w-md w-full">
            <CardContent className="p-8 text-center">
              <Crown className="h-12 w-12 text-orange-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-zinc-200 mb-2">Pro Feature</h2>
              <p className="text-zinc-400 mb-6">Attack Surface Discovery is available for Pro and Business subscribers. Sign up to map your organization's exposed assets.</p>
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setLocation("/checkout")} data-testid="button-upgrade">
                Upgrade to Pro
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center gap-3 mb-2">
          <Radar className="h-7 w-7 text-orange-400" />
          <div>
            <h1 className="text-2xl font-bold text-zinc-100" data-testid="text-page-title">Attack Surface Discovery</h1>
            <p className="text-sm text-zinc-500">Map your organization's external-facing assets, find exposed services, and identify security gaps.</p>
          </div>
        </div>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-zinc-200">Scan a Domain</CardTitle>
            <CardDescription className="text-zinc-500">Enter a domain name to discover subdomains, open ports, email security, SSL status, and more.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScan()}
                className="bg-zinc-950 border-zinc-800 text-zinc-200 placeholder:text-zinc-600 flex-1"
                data-testid="input-domain"
              />
              <Button
                onClick={handleScan}
                disabled={!domain.trim() || startScan.isPending}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6"
                data-testid="button-start-scan"
              >
                {startScan.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Radar className="h-4 w-4 mr-2" /> Scan</>}
              </Button>
            </div>
            {startScan.isError && (
              <p className="text-red-400 text-sm mt-2" data-testid="text-scan-error">{startScan.error.message}</p>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Scan History</h3>
            {scansLoading && [...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 bg-zinc-800" />)}
            {scans && scans.length === 0 && (
              <p className="text-sm text-zinc-600 py-4">No scans yet. Enter a domain above to get started.</p>
            )}
            {scans?.map((scan: any) => (
              <button
                key={scan.id}
                onClick={() => setSelectedScanId(scan.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedScanId === scan.id
                    ? "bg-orange-500/10 border-orange-500/30"
                    : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                }`}
                data-testid={`scan-item-${scan.id}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-zinc-200 truncate">{scan.domain}</span>
                  <StatusBadge status={scan.status} />
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Clock className="h-3 w-3" />
                  {timeAgo(scan.createdAt)}
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-3">
            {selectedScanId ? (
              <ScanResults scanId={selectedScanId} />
            ) : (
              <Card className="bg-zinc-900/30 border-zinc-800 border-dashed">
                <CardContent className="p-12 text-center">
                  <Radar className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                  <p className="text-zinc-500">Select a scan from the history or start a new scan to see results.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </Layout>
  );
}