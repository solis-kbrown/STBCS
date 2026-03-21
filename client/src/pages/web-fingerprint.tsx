import { useState } from "react";
import Layout from "@/components/layout";
import Footer from "@/components/footer";
import RelatedResources, { getRelatedLinks } from "@/components/related-resources";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Fingerprint, Shield, Lock, Crown, Loader2, AlertTriangle, CheckCircle2, XCircle,
  Info, Globe, Server, ArrowRight, ChevronDown, ChevronUp, Cookie, Code2,
  MonitorSmartphone, Eye, ShieldAlert, ExternalLink, Cpu, Layers
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface RedirectHop {
  url: string;
  statusCode: number;
  server?: string;
}

interface CookieInfo {
  name: string;
  flags: string[];
  possibleTech?: string;
}

interface WebFingerprintResult {
  hostname: string;
  serverHeader?: string;
  poweredBy?: string;
  aspNetVersion?: string;
  aspNetMvcVersion?: string;
  technologies: string[];
  cms?: string;
  cmsConfidence?: string;
  allowedMethods?: string[];
  cookies: CookieInfo[];
  redirectChain: RedirectHop[];
  httpsRedirect: boolean;
  responseHeaders: Record<string, string>;
  latencyMs: number;
  ipAddress?: string;
  observations: string[];
  error?: string;
}

function observationIcon(text: string) {
  if (text.toLowerCase().includes("missing") || text.toLowerCase().includes("not ") || text.toLowerCase().includes("vulnerable")) {
    return <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />;
  }
  if (text.toLowerCase().includes("exposed") || text.toLowerCase().includes("risky")) {
    return <ShieldAlert className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />;
  }
  if (text.toLowerCase().includes("properly") || text.toLowerCase().includes("detected") || text.toLowerCase().includes("identifies")) {
    return <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />;
  }
  return <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />;
}

function observationColor(text: string) {
  if (text.toLowerCase().includes("exposed") || text.toLowerCase().includes("risky")) {
    return "border-red-500/30 bg-red-500/5";
  }
  if (text.toLowerCase().includes("missing") || text.toLowerCase().includes("not ") || text.toLowerCase().includes("vulnerable")) {
    return "border-amber-500/30 bg-amber-500/5";
  }
  if (text.toLowerCase().includes("properly") || text.toLowerCase().includes("detected")) {
    return "border-green-500/30 bg-green-500/5";
  }
  return "border-blue-500/30 bg-blue-500/5";
}

function ServerInfoCard({ result }: { result: WebFingerprintResult }) {
  return (
    <Card className="border-white/5 bg-card/50" data-testid="card-server-info">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-white">
          <Server className="h-4 w-4 text-orange-400" /> Server Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Server</span>
              <p className="text-sm text-white font-mono" data-testid="text-server-header">
                {result.serverHeader || "Not disclosed"}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">X-Powered-By</span>
              <p className="text-sm text-white font-mono" data-testid="text-powered-by">
                {result.poweredBy || "Not disclosed"}
              </p>
            </div>
            {result.aspNetVersion && (
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">ASP.NET Version</span>
                <p className="text-sm text-white font-mono" data-testid="text-aspnet-version">{result.aspNetVersion}</p>
              </div>
            )}
            {result.aspNetMvcVersion && (
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">ASP.NET MVC Version</span>
                <p className="text-sm text-white font-mono" data-testid="text-aspnetmvc-version">{result.aspNetMvcVersion}</p>
              </div>
            )}
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">IP Address</span>
              <p className="text-sm text-white font-mono" data-testid="text-ip-address">
                {result.ipAddress || "Unknown"}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Response Latency</span>
              <p className="text-sm text-white font-mono" data-testid="text-latency">
                {result.latencyMs} ms
              </p>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">HTTPS Redirect</span>
              <div className="flex items-center gap-2" data-testid="text-https-redirect">
                {result.httpsRedirect ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-green-400 font-medium">Yes</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-amber-400" />
                    <span className="text-sm text-amber-400 font-medium">No</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TechnologyBadges({ technologies, cms, cmsConfidence }: { technologies: string[]; cms?: string; cmsConfidence?: string }) {
  if (technologies.length === 0 && !cms) return null;

  return (
    <Card className="border-white/5 bg-card/50" data-testid="card-technologies">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-white">
          <Cpu className="h-4 w-4 text-orange-400" /> Technology Stack
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cms && (
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">CMS Detected</span>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50" data-testid="badge-cms">
                <MonitorSmartphone className="h-3 w-3 mr-1" /> {cms}
              </Badge>
              {cmsConfidence && (
                <span className="text-[10px] text-zinc-500">Confidence: {cmsConfidence}</span>
              )}
            </div>
          </div>
        )}
        <div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Detected Technologies ({technologies.length})</span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {technologies.map((tech, i) => (
              <Badge
                key={i}
                className="bg-zinc-800 text-zinc-300 border-zinc-700 text-[10px] font-mono"
                data-testid={`badge-tech-${i}`}
              >
                {tech}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HeadersTable({ headers }: { headers: Record<string, string> }) {
  const entries = Object.entries(headers);
  if (entries.length === 0) return null;

  return (
    <Card className="border-white/5 bg-card/50" data-testid="card-headers">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-white">
          <Code2 className="h-4 w-4 text-orange-400" /> HTTP Response Headers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
          <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-500/20 scrollbar-track-transparent">
            {entries.map(([key, value], i) => (
              <div
                key={key}
                className={`flex items-start gap-3 px-3 py-2 text-xs font-mono ${i % 2 === 0 ? "bg-zinc-950" : "bg-zinc-900/50"}`}
                data-testid={`header-row-${i}`}
              >
                <span className="text-orange-400 font-bold whitespace-nowrap min-w-[180px]">{key}</span>
                <span className="text-zinc-300 break-all">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RedirectChainCard({ chain }: { chain: RedirectHop[] }) {
  if (chain.length === 0) return null;

  return (
    <Card className="border-white/5 bg-card/50" data-testid="card-redirect-chain">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-white">
          <ExternalLink className="h-4 w-4 text-orange-400" /> Redirect Chain
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {chain.map((hop, i) => (
            <div key={i} className="relative" data-testid={`redirect-hop-${i}`}>
              <div className={`flex items-start gap-3 p-3 rounded-lg border ${
                hop.statusCode >= 300 && hop.statusCode < 400
                  ? "border-amber-500/30 bg-amber-500/5"
                  : hop.statusCode === 200
                    ? "border-green-500/30 bg-green-500/5"
                    : "border-zinc-800 bg-zinc-900/50"
              }`}>
                <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                  hop.statusCode >= 300 && hop.statusCode < 400
                    ? "bg-amber-500/20"
                    : hop.statusCode === 200
                      ? "bg-green-500/20"
                      : "bg-zinc-800"
                }`}>
                  <Globe className={`h-4 w-4 ${
                    hop.statusCode >= 300 && hop.statusCode < 400
                      ? "text-amber-400"
                      : hop.statusCode === 200
                        ? "text-green-400"
                        : "text-zinc-400"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-white font-mono break-all">{hop.url}</span>
                    <Badge className={`text-[9px] ${
                      hop.statusCode >= 300 && hop.statusCode < 400
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/50"
                        : hop.statusCode === 200
                          ? "bg-green-500/20 text-green-400 border-green-500/50"
                          : "bg-zinc-700 text-zinc-300"
                    }`}>
                      {hop.statusCode}
                    </Badge>
                  </div>
                  {hop.server && (
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Server: {hop.server}</p>
                  )}
                </div>
              </div>
              {i < chain.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowRight className="h-3 w-3 text-zinc-600 rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CookiesCard({ cookies }: { cookies: CookieInfo[] }) {
  if (cookies.length === 0) return null;

  return (
    <Card className="border-white/5 bg-card/50" data-testid="card-cookies">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-white">
          <Cookie className="h-4 w-4 text-orange-400" /> Cookies
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {cookies.map((cookie, i) => (
            <div key={i} className="flex items-start gap-3 px-3 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800" data-testid={`cookie-${i}`}>
              <div className="flex-1 min-w-0">
                <span className="text-sm text-white font-mono">{cookie.name}</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {cookie.flags.map((flag, fi) => (
                    <Badge key={fi} className="bg-zinc-800 text-zinc-400 border-zinc-700 text-[9px]">{flag}</Badge>
                  ))}
                  {cookie.possibleTech && (
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50 text-[9px]">{cookie.possibleTech}</Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {cookie.flags.includes("Secure") ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-amber-400" />
                )}
                {cookie.flags.includes("HttpOnly") ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-amber-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MethodsCard({ methods }: { methods: string[] }) {
  if (methods.length === 0) return null;
  const riskyMethods = ["PUT", "DELETE", "TRACE", "CONNECT"];

  return (
    <Card className="border-white/5 bg-card/50" data-testid="card-methods">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-white">
          <Layers className="h-4 w-4 text-orange-400" /> Allowed HTTP Methods
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1.5">
          {methods.map((method, i) => (
            <Badge
              key={i}
              className={`text-[10px] font-mono ${
                riskyMethods.includes(method)
                  ? "bg-red-500/20 text-red-400 border-red-500/50"
                  : "bg-zinc-800 text-zinc-300 border-zinc-700"
              }`}
              data-testid={`badge-method-${method.toLowerCase()}`}
            >
              {method}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ObservationsCard({ observations }: { observations: string[] }) {
  if (observations.length === 0) return null;

  return (
    <Card className="border-white/5 bg-card/50" data-testid="card-observations">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-white">
          <Eye className="h-4 w-4 text-orange-400" /> Security Observations
        </CardTitle>
        <CardDescription>
          {observations.length} observation{observations.length !== 1 ? "s" : ""} found
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {observations.map((obs, i) => (
          <div
            key={i}
            className={`flex items-start gap-2 p-3 rounded-lg border ${observationColor(obs)}`}
            data-testid={`observation-${i}`}
          >
            {observationIcon(obs)}
            <p className="text-sm text-white">{obs}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function WebFingerprint() {
  useDocumentTitle("Web Server Fingerprint | STB Cybersecurity");
  const { isAuthenticated, isPro } = useAuth();
  const { toast } = useToast();

  const [hostname, setHostname] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<WebFingerprintResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostname.trim()) return;

    setIsScanning(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/tools/web-fingerprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ hostname: hostname.trim().replace(/^https?:\/\//, "").replace(/\/.*$/, "") }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Scan failed" }));
        throw new Error(data.error || `Scan failed (${res.status})`);
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setResult(data);
      toast({ title: "Scan Complete", description: `Fingerprint analysis for ${hostname} finished in ${(data.latencyMs / 1000).toFixed(1)}s` });
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
              <h2 className="text-2xl font-display font-bold text-white" data-testid="text-fingerprint-login-required">
                Sign In Required
              </h2>
              <p className="text-zinc-400 max-w-md">
                Web Server Fingerprint requires authentication. Please sign in with your STB Cybersecurity account to continue.
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
              <h2 className="text-2xl font-display font-bold text-white" data-testid="text-fingerprint-upgrade-required">
                Pro Subscription Required
              </h2>
              <p className="text-zinc-400 max-w-md">
                Web Server Fingerprint is available to Pro, Business, and Enterprise subscribers.
                Upgrade your plan to identify server technologies, CMS platforms, and security misconfigurations.
              </p>
            </div>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold" asChild>
              <a href="/pricing" data-testid="link-fingerprint-upgrade">
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
            <h1 className="text-3xl font-display font-bold text-white" data-testid="text-fingerprint-title">
              Web Server Fingerprint
            </h1>
            <p className="text-muted-foreground mt-1">
              Identify server technologies, CMS platforms, frameworks, and security misconfigurations
            </p>
          </div>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
            <Crown className="h-3 w-3 mr-1" /> PRO
          </Badge>
        </div>

        <Card className="border-white/5 bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Fingerprint className="h-5 w-5 text-orange-400" /> Scan Target
            </CardTitle>
            <CardDescription>
              Enter a domain name to fingerprint the web server and detect technologies.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleScan} className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="hostname" className="sr-only">Domain</Label>
                <Input
                  id="hostname"
                  placeholder="example.com"
                  value={hostname}
                  onChange={(e) => setHostname(e.target.value)}
                  disabled={isScanning}
                  className="bg-zinc-900 border-zinc-700 focus:border-orange-500/50"
                  data-testid="input-fingerprint-hostname"
                />
              </div>
              <Button
                type="submit"
                disabled={isScanning || !hostname.trim()}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6"
                data-testid="button-fingerprint-scan"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Scanning...
                  </>
                ) : (
                  <>
                    <Fingerprint className="h-4 w-4 mr-2" /> Scan
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm" data-testid="text-fingerprint-error">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {isScanning && (
          <Card className="border-white/5 bg-card/50">
            <CardContent className="py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 text-orange-400 animate-spin" />
                <div className="text-center">
                  <p className="text-white font-medium">Fingerprinting {hostname}...</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Probing server headers, technologies, CMS, cookies, redirect chain…
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {result && (
          <div className="space-y-6 animate-in fade-in duration-500" data-testid="container-fingerprint-results">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-white/5 bg-card/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Server className="h-4 w-4 text-orange-400" />
                    <span className="text-xs text-zinc-400">Server</span>
                  </div>
                  <p className="text-lg font-mono font-bold text-white truncate" data-testid="text-summary-server">
                    {result.serverHeader || "Unknown"}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/5 bg-card/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Cpu className="h-4 w-4 text-blue-400" />
                    <span className="text-xs text-zinc-400">Technologies</span>
                  </div>
                  <p className="text-lg font-mono font-bold text-white" data-testid="text-summary-tech-count">
                    {result.technologies.length}
                  </p>
                  <p className="text-[10px] text-zinc-600">detected</p>
                </CardContent>
              </Card>
              <Card className="border-white/5 bg-card/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4 text-amber-400" />
                    <span className="text-xs text-zinc-400">Observations</span>
                  </div>
                  <p className="text-lg font-mono font-bold text-white" data-testid="text-summary-observations">
                    {result.observations.length}
                  </p>
                  <p className="text-[10px] text-zinc-600">findings</p>
                </CardContent>
              </Card>
            </div>

            <ServerInfoCard result={result} />

            <TechnologyBadges
              technologies={result.technologies}
              cms={result.cms}
              cmsConfidence={result.cmsConfidence}
            />

            <HeadersTable headers={result.responseHeaders} />

            <RedirectChainCard chain={result.redirectChain} />

            {result.allowedMethods && result.allowedMethods.length > 0 && (
              <MethodsCard methods={result.allowedMethods} />
            )}

            <CookiesCard cookies={result.cookies} />

            <ObservationsCard observations={result.observations} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-white/5 bg-card/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Server className="h-4 w-4 text-orange-400" />
                </div>
                <CardTitle className="text-sm text-white">Server Detection</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Identifies web server software (Apache, Nginx, IIS, etc.) and backend frameworks from HTTP headers.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-card/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <MonitorSmartphone className="h-4 w-4 text-blue-400" />
                </div>
                <CardTitle className="text-sm text-white">CMS Detection</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Detects content management systems like WordPress, Drupal, Joomla, Shopify, and more via probing and HTML analysis.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-card/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Cookie className="h-4 w-4 text-amber-400" />
                </div>
                <CardTitle className="text-sm text-white">Cookie Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Analyzes session cookies and flags (Secure, HttpOnly, SameSite) to identify technologies and security gaps.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-card/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Shield className="h-4 w-4 text-green-400" />
                </div>
                <CardTitle className="text-sm text-white">Security Headers</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Checks for missing HSTS, CSP, X-Frame-Options, and other critical security headers that protect against attacks.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-start gap-2 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
          <Shield className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
          <p className="text-xs text-zinc-400">
            This tool performs passive fingerprinting using standard HTTP requests only. No active exploitation or vulnerability scanning is performed.
            Always ensure you have authorization before scanning any domain you do not own.
          </p>
        </div>
      </div>
              <RelatedResources links={getRelatedLinks("/web-fingerprint")} testIdPrefix="webfp" />
<Footer />
    </Layout>
  );
}
