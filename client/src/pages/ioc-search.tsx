import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import {
  Search,
  Shield,
  Globe,
  Hash,
  Link2,
  Server,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink,
  Loader2,
  Copy,
  Info,
} from "lucide-react";

type IocType = "ip" | "domain" | "hash" | "url" | "email" | "cve" | "unknown";

interface IocResult {
  source: string;
  found: boolean;
  threatType?: string;
  riskScore?: number;
  details?: string;
  lastSeen?: string;
  tags?: string[];
  url?: string;
}

function detectIocType(input: string): IocType {
  const trimmed = input.trim();
  if (/^CVE-\d{4}-\d{4,}$/i.test(trimmed)) return "cve";
  if (/^[a-f0-9]{32}$/i.test(trimmed) || /^[a-f0-9]{40}$/i.test(trimmed) || /^[a-f0-9]{64}$/i.test(trimmed)) return "hash";
  if (/^https?:\/\//i.test(trimmed)) return "url";
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(trimmed)) return "ip";
  if (/^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}$/.test(trimmed)) return "domain";
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "email";
  return "unknown";
}

function getIocTypeIcon(type: IocType) {
  switch (type) {
    case "ip": return <Server className="h-4 w-4" />;
    case "domain": return <Globe className="h-4 w-4" />;
    case "hash": return <Hash className="h-4 w-4" />;
    case "url": return <Link2 className="h-4 w-4" />;
    case "cve": return <Shield className="h-4 w-4" />;
    default: return <Search className="h-4 w-4" />;
  }
}

function getIocTypeLabel(type: IocType): string {
  switch (type) {
    case "ip": return "IP Address";
    case "domain": return "Domain";
    case "hash": return "File Hash";
    case "url": return "URL";
    case "cve": return "CVE";
    case "email": return "Email";
    default: return "Unknown";
  }
}

function getRiskColor(score: number): string {
  if (score >= 80) return "text-red-400";
  if (score >= 60) return "text-orange-400";
  if (score >= 40) return "text-yellow-400";
  if (score >= 20) return "text-blue-400";
  return "text-green-400";
}

function getRiskLabel(score: number): string {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 40) return "Medium";
  if (score >= 20) return "Low";
  return "Clean";
}

export default function IOCSearch() {
  useDocumentTitle(
    "IOC Search | STB Cybersecurity",
    "Search Indicators of Compromise across 130+ threat intelligence feeds. Check IPs, domains, hashes, URLs, and CVEs against multiple threat databases."
  );

  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const searchMutation = useMutation({
    mutationFn: async (input: string): Promise<{ type: IocType; query: string; results: IocResult[]; overallRisk: number }> => {
      const type = detectIocType(input);
      const results: IocResult[] = [];

      const searchRes = await fetch(`/api/search?q=${encodeURIComponent(input)}&limit=20`);
      if (searchRes.ok) {
        const data = await searchRes.json();
        if (data.ips?.length > 0) {
          for (const ip of data.ips.slice(0, 5)) {
            results.push({
              source: ip.source || "Threat Feed",
              found: true,
              threatType: ip.threatType || "Malicious IP",
              riskScore: ip.abuseConfidenceScore || ip.riskScore || 50,
              details: `${ip.ipAddress} - ${ip.threatType || "Suspicious"} (${ip.source})`,
              lastSeen: ip.lastSeen,
              tags: ip.tags?.split(",").map((t: string) => t.trim()).filter(Boolean),
            });
          }
        }
        if (data.urls?.length > 0) {
          for (const url of data.urls.slice(0, 5)) {
            results.push({
              source: url.source || "URLhaus",
              found: true,
              threatType: url.threatType || "Malicious URL",
              riskScore: 75,
              details: `${url.url} - ${url.threatType || "Malware"} (${url.source})`,
              lastSeen: url.lastSeen,
              tags: url.malwareFamily ? [url.malwareFamily] : undefined,
            });
          }
        }
        if (data.cves?.length > 0) {
          for (const cve of data.cves.slice(0, 5)) {
            results.push({
              source: "NVD",
              found: true,
              threatType: "CVE",
              riskScore: cve.cvssScore ? cve.cvssScore * 10 : 50,
              details: cve.description?.slice(0, 200) || cve.cveId,
              tags: cve.severity ? [cve.severity] : undefined,
              url: `https://nvd.nist.gov/vuln/detail/${cve.cveId}`,
            });
          }
        }
        if (data.kev?.length > 0) {
          for (const kev of data.kev.slice(0, 3)) {
            results.push({
              source: "CISA KEV",
              found: true,
              threatType: "Known Exploited Vulnerability",
              riskScore: 90,
              details: `${kev.cveId} - ${kev.vulnerabilityName || "Actively Exploited"}`,
              tags: ["Actively Exploited"],
              url: `https://www.cisa.gov/known-exploited-vulnerabilities-catalog`,
            });
          }
        }
        if (data.ransomware?.length > 0) {
          for (const r of data.ransomware.slice(0, 3)) {
            results.push({
              source: "Ransomware Feed",
              found: true,
              threatType: "Ransomware",
              riskScore: 85,
              details: `${r.victimName || "Unknown"} - ${r.groupName || "Unknown Group"}`,
              tags: r.groupName ? [r.groupName] : undefined,
            });
          }
        }
      }

      if (type === "ip") {
        try {
          const shodanRes = await fetch(`/api/tools/shodan/${encodeURIComponent(input)}`);
          if (shodanRes.ok) {
            const shodan = await shodanRes.json();
            if (shodan && !shodan.error) {
              results.push({
                source: "Shodan",
                found: true,
                threatType: shodan.ports?.length > 0 ? "Open Ports Detected" : "No Open Ports",
                riskScore: shodan.vulns?.length > 0 ? 70 : (shodan.ports?.length > 5 ? 40 : 20),
                details: `Ports: ${shodan.ports?.join(", ") || "None"}, Hostnames: ${shodan.hostnames?.join(", ") || "None"}`,
                tags: shodan.vulns?.slice(0, 5) || [],
              });
            }
          }
        } catch {}
      }

      if (results.length === 0) {
        results.push({
          source: "All Feeds",
          found: false,
          details: "No matches found across any threat intelligence feed",
          riskScore: 0,
        });
      }

      const maxRisk = Math.max(...results.filter(r => r.found).map(r => r.riskScore || 0), 0);
      return { type, query: input, results, overallRisk: maxRisk };
    },
  });

  const handleSearch = () => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;
    searchMutation.mutate(trimmed);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exampleQueries = [
    { label: "Malicious IP", value: "185.220.101.1" },
    { label: "CVE Lookup", value: "CVE-2024-3400" },
    { label: "Malware Hash", value: "44d88612fea8a8f36de82e1278abb02f" },
    { label: "Phishing URL", value: "https://login-verify.example.com" },
  ];

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2" data-testid="text-ioc-title">
            IOC Search
          </h1>
          <p className="text-muted-foreground">
            Search Indicators of Compromise across 130+ threat intelligence feeds. Enter an IP address, domain, file hash, URL, or CVE ID.
          </p>
        </div>

        <Card className="border-orange-500/20 bg-card/50">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Enter IP, domain, hash, URL, or CVE..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-11 h-12 text-lg bg-background/50 border-zinc-500"
                  data-testid="input-ioc-search"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={searchMutation.isPending || query.trim().length < 2}
                className="h-12 px-8 bg-orange-500 hover:bg-orange-600 text-white"
                data-testid="button-ioc-search"
              >
                {searchMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Search"
                )}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-xs text-muted-foreground">Try:</span>
              {exampleQueries.map((ex) => (
                <button
                  key={ex.value}
                  onClick={() => { setQuery(ex.value); }}
                  className="text-xs px-2 py-1 rounded bg-zinc-800 border border-white/5 text-zinc-400 hover:text-orange-400 hover:border-orange-500/30 transition-colors"
                  data-testid={`button-example-${ex.label.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {searchMutation.isPending && (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-lg bg-zinc-800/50" />
            <Skeleton className="h-20 w-full rounded-lg bg-zinc-800/50" />
            <Skeleton className="h-20 w-full rounded-lg bg-zinc-800/50" />
          </div>
        )}

        {searchMutation.data && !searchMutation.isPending && (
          <div className="space-y-4">
            <Card className="border-white/5 bg-card/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                      {getIocTypeIcon(searchMutation.data.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-white text-sm" data-testid="text-ioc-query">{searchMutation.data.query}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(searchMutation.data!.query, "query")}
                          aria-label="Copy query"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px] border-orange-500/30 text-orange-400">
                          {getIocTypeLabel(searchMutation.data.type)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {searchMutation.data.results.filter(r => r.found).length} sources matched
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">Overall Risk</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${getRiskColor(searchMutation.data.overallRisk)}`} data-testid="text-risk-score">
                        {searchMutation.data.overallRisk}
                      </span>
                      <Badge className={`text-[10px] ${searchMutation.data.overallRisk >= 60 ? "bg-red-500/20 text-red-400 border-red-500/30" : searchMutation.data.overallRisk >= 30 ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : "bg-green-500/20 text-green-400 border-green-500/30"}`}>
                        {getRiskLabel(searchMutation.data.overallRisk)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-zinc-300">Feed Results</h3>
              {searchMutation.data.results.map((result, idx) => (
                <Card key={idx} className={`border-white/5 bg-card/50 ${result.found ? "border-l-2 border-l-red-500/50" : ""}`} data-testid={`card-result-${idx}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`mt-0.5 ${result.found ? "text-red-400" : "text-green-400"}`}>
                          {result.found ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-white">{result.source}</span>
                            {result.threatType && (
                              <Badge variant="outline" className="text-[10px] border-red-500/20 text-red-300">
                                {result.threatType}
                              </Badge>
                            )}
                            {result.riskScore != null && result.riskScore > 0 && (
                              <span className={`text-xs font-bold ${getRiskColor(result.riskScore)}`}>
                                {result.riskScore}%
                              </span>
                            )}
                          </div>
                          {result.details && (
                            <p className="text-xs text-zinc-400 line-clamp-2">{result.details}</p>
                          )}
                          {result.tags && result.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {result.tags.map((tag, i) => (
                                <Badge key={i} variant="outline" className="text-[9px] border-zinc-700 text-zinc-400">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {result.lastSeen && (
                            <p className="text-[10px] text-muted-foreground mt-1">
                              Last seen: {new Date(result.lastSeen).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      {result.url && (
                        <a href={result.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-orange-400" aria-label="Open in new tab">
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-white/5 bg-card/30">
              <CardContent className="p-4 flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  Results are aggregated from STBCS threat intelligence feeds including NVD, CISA KEV, URLhaus, OpenPhish, Feodo Tracker, Shodan, and more.
                  Absence from feeds does not guarantee safety. Always verify with additional sources.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {!searchMutation.data && !searchMutation.isPending && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Server, label: "IP Addresses", desc: "Check against 20+ IP blocklists", color: "text-red-400 bg-red-500/10" },
              { icon: Globe, label: "Domains", desc: "Verify against phishing & malware feeds", color: "text-blue-400 bg-blue-500/10" },
              { icon: Hash, label: "File Hashes", desc: "MD5, SHA1, SHA256 malware lookups", color: "text-purple-400 bg-purple-500/10" },
              { icon: Shield, label: "CVE IDs", desc: "NVD + CISA KEV vulnerability data", color: "text-orange-400 bg-orange-500/10" },
            ].map((item) => (
              <Card key={item.label} className="border-white/5 bg-card/50" data-testid={`card-type-${item.label.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardContent className="p-4 text-center">
                  <div className={`p-3 rounded-lg ${item.color} mx-auto w-fit mb-3`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">{item.label}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </Layout>
  );
}
