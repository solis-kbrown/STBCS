import { useDocumentTitle } from "@/lib/use-document-title";
import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, Key, Shield, Zap, Database, Globe, Lock, ArrowRight, Copy } from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const endpoints = [
  {
    method: "GET",
    path: "/api/v1/cves",
    description: "List CVEs from the NVD database",
    params: [
      { name: "limit", type: "number", default: "50", desc: "Max results (up to 500)" },
      { name: "offset", type: "number", default: "0", desc: "Pagination offset" },
      { name: "search", type: "string", default: "", desc: "Search CVE IDs or descriptions" },
    ],
    example: `curl -H "X-API-Key: stbcs_pro_xxxx_secret" \\
  "https://stbcybersecurity.com/api/v1/cves?limit=10&search=chrome"`,
    response: `{ "data": [...], "total": 1250, "limit": 10, "offset": 0 }`,
  },
  {
    method: "GET",
    path: "/api/v1/cves/:cveId",
    description: "Get a specific CVE by ID",
    params: [{ name: "cveId", type: "string", default: "", desc: "CVE identifier (e.g., CVE-2024-1234)" }],
    example: `curl -H "X-API-Key: stbcs_pro_xxxx_secret" \\
  "https://stbcybersecurity.com/api/v1/cves/CVE-2024-1234"`,
    response: `{ "data": { "cveId": "CVE-2024-1234", "score": 9.8, ... } }`,
  },
  {
    method: "GET",
    path: "/api/v1/ransomware",
    description: "List ransomware incidents and victim data",
    params: [
      { name: "limit", type: "number", default: "50", desc: "Max results (up to 500)" },
      { name: "offset", type: "number", default: "0", desc: "Pagination offset" },
      { name: "group", type: "string", default: "", desc: "Filter by ransomware group name" },
      { name: "sector", type: "string", default: "", desc: "Filter by industry sector" },
    ],
    example: `curl -H "X-API-Key: stbcs_pro_xxxx_secret" \\
  "https://stbcybersecurity.com/api/v1/ransomware?group=lockbit&limit=20"`,
    response: `{ "data": [...], "total": 5200, "limit": 20, "offset": 0 }`,
  },
  {
    method: "GET",
    path: "/api/v1/ips",
    description: "List malicious IP addresses from 30+ feeds",
    params: [
      { name: "limit", type: "number", default: "100", desc: "Max results (up to 1000)" },
      { name: "offset", type: "number", default: "0", desc: "Pagination offset" },
      { name: "source", type: "string", default: "", desc: "Filter by feed source" },
      { name: "threat_type", type: "string", default: "", desc: "Filter by threat type" },
    ],
    example: `curl -H "X-API-Key: stbcs_pro_xxxx_secret" \\
  "https://stbcybersecurity.com/api/v1/ips?limit=50&source=feodo"`,
    response: `{ "data": [...], "total": 45000, "limit": 50, "offset": 0 }`,
  },
  {
    method: "GET",
    path: "/api/v1/urls",
    description: "List malicious URLs (phishing, malware, C2)",
    params: [
      { name: "limit", type: "number", default: "100", desc: "Max results (up to 1000)" },
      { name: "offset", type: "number", default: "0", desc: "Pagination offset" },
      { name: "source", type: "string", default: "", desc: "Filter by feed source" },
      { name: "threat_type", type: "string", default: "", desc: "Filter by threat type" },
    ],
    example: `curl -H "X-API-Key: stbcs_pro_xxxx_secret" \\
  "https://stbcybersecurity.com/api/v1/urls?threat_type=phishing"`,
    response: `{ "data": [...], "total": 12000, "limit": 100, "offset": 0 }`,
  },
  {
    method: "GET",
    path: "/api/v1/kev",
    description: "CISA Known Exploited Vulnerabilities catalog",
    params: [
      { name: "limit", type: "number", default: "100", desc: "Max results (up to 500)" },
      { name: "offset", type: "number", default: "0", desc: "Pagination offset" },
    ],
    example: `curl -H "X-API-Key: stbcs_pro_xxxx_secret" \\
  "https://stbcybersecurity.com/api/v1/kev?limit=25"`,
    response: `{ "data": [...], "total": 1100, "limit": 25, "offset": 0 }`,
  },
  {
    method: "GET",
    path: "/api/v1/threat-actors",
    description: "List tracked threat actors and ransomware groups",
    params: [
      { name: "limit", type: "number", default: "50", desc: "Max results (up to 200)" },
    ],
    example: `curl -H "X-API-Key: stbcs_pro_xxxx_secret" \\
  "https://stbcybersecurity.com/api/v1/threat-actors"`,
    response: `{ "data": [...], "total": 85 }`,
  },
  {
    method: "GET",
    path: "/api/v1/stats",
    description: "Get aggregated dashboard statistics",
    params: [],
    example: `curl -H "X-API-Key: stbcs_pro_xxxx_secret" \\
  "https://stbcybersecurity.com/api/v1/stats"`,
    response: `{ "data": { "totalCves": 1250, "totalIncidents": 5200, ... } }`,
  },
  {
    method: "GET",
    path: "/api/v1/ioc/lookup",
    description: "Look up a specific indicator of compromise (IP, domain, CVE, hash, URL)",
    params: [
      { name: "indicator", type: "string", default: "", desc: "The IOC to look up" },
    ],
    example: `curl -H "X-API-Key: stbcs_pro_xxxx_secret" \\
  "https://stbcybersecurity.com/api/v1/ioc/lookup?indicator=8.8.8.8"`,
    response: `{ "data": { "indicator": "8.8.8.8", "matches": [...], "riskLevel": "low" } }`,
    note: "Counts against your daily live lookup quota. Results cached for 2 hours.",
  },
  {
    method: "GET",
    path: "/api/v1/key/usage",
    description: "Check your API key usage, quotas, and rate limits",
    params: [],
    example: `curl -H "X-API-Key: stbcs_pro_xxxx_secret" \\
  "https://stbcybersecurity.com/api/v1/key/usage"`,
    response: `{ "key": { "name": "...", "tier": "pro" }, "today": { "requestCount": 42, ... } }`,
  },
];

const tiers = [
  {
    name: "Pro",
    price: "$29/mo",
    colorClass: "text-orange-400",
    badgeClass: "bg-orange-500/20 text-orange-400",
    features: [
      "1 API key",
      "1,000 requests/day",
      "60 requests/minute",
      "50 live IOC lookups/day",
      "5 watchlist monitors",
      "Email alerts",
    ],
  },
  {
    name: "Business",
    price: "$79/mo",
    colorClass: "text-purple-400",
    badgeClass: "bg-purple-500/20 text-purple-400",
    features: [
      "5 API keys",
      "10,000 requests/day",
      "120 requests/minute",
      "200 live IOC lookups/day",
      "25 watchlist monitors",
      "Email + SMS alerts + Webhooks",
    ],
  },
];

export default function ApiDocsPage() {
  useDocumentTitle("API Documentation | STB Cybersecurity");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [expandedEndpoint, setExpandedEndpoint] = useState<number | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Code className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-white" data-testid="text-api-docs-title">API Documentation</h1>
              <p className="text-zinc-400">STBCS Threat Intelligence API v1</p>
            </div>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">
            Access real-time threat intelligence data from 70+ sources programmatically. 
            Our REST API provides CVEs, ransomware incidents, malicious IPs/URLs, CISA KEV data, and IOC lookups.
          </p>
        </div>

        <Card className="border-orange-500/20 bg-gradient-to-r from-orange-500/5 to-transparent">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-orange-400" />
              <div>
                <p className="text-white font-medium text-sm">Authentication Required</p>
                <p className="text-zinc-400 text-xs">All requests require an API key via the <code className="text-orange-300">X-API-Key</code> header.</p>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => setLocation("/account")}
              data-testid="button-get-api-key"
            >
              Get API Key <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tiers.map((tier) => (
            <Card key={tier.name} className="border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span className={tier.colorClass + " text-lg"}>{tier.name}</span>
                  <Badge className={tier.badgeClass}>{tier.price}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {tier.features.map((f) => (
                    <li key={f} className="text-zinc-400 text-sm flex items-center gap-2">
                      <Zap className="h-3 w-3 text-orange-400 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-400" />
              Quick Start
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-zinc-400">1. Subscribe to Pro or Business at <span className="text-orange-400 cursor-pointer" onClick={() => setLocation("/support")}>/support</span></p>
              <p className="text-sm text-zinc-400">2. Create an API key in your <span className="text-orange-400 cursor-pointer" onClick={() => setLocation("/account")}>account settings</span></p>
              <p className="text-sm text-zinc-400">3. Add your key to the <code className="text-orange-300 bg-zinc-800 px-1 rounded">X-API-Key</code> header in every request</p>
            </div>
            <div className="relative bg-zinc-800 rounded-lg p-4 font-mono text-sm">
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 text-zinc-500 hover:text-white"
                onClick={() => copyToClipboard('curl -H "X-API-Key: YOUR_KEY" https://stbcybersecurity.com/api/v1/stats')}
                data-testid="button-copy-quickstart"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <pre className="text-green-400 whitespace-pre-wrap break-all">{`curl -H "X-API-Key: YOUR_KEY" \\
  https://stbcybersecurity.com/api/v1/stats`}</pre>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2" data-testid="text-endpoints-heading">
            <Database className="h-5 w-5 text-orange-400" />
            Endpoints
          </h2>

          {endpoints.map((ep, i) => (
            <Card key={i} className="border-zinc-800 bg-zinc-900/50 overflow-hidden" data-testid={`endpoint-${i}`}>
              <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-zinc-800/50 transition-colors"
                onClick={() => setExpandedEndpoint(expandedEndpoint === i ? null : i)}
              >
                <Badge className="bg-green-500/20 text-green-400 font-mono text-xs">{ep.method}</Badge>
                <code className="text-orange-300 text-sm font-mono flex-1">{ep.path}</code>
                <span className="text-zinc-500 text-xs hidden sm:block">{ep.description}</span>
                <span className="text-zinc-600 text-xs">{expandedEndpoint === i ? "▲" : "▼"}</span>
              </div>
              {expandedEndpoint === i && (
                <div className="border-t border-zinc-800 p-4 space-y-4 bg-zinc-950/50">
                  <p className="text-zinc-300 text-sm">{ep.description}</p>
                  
                  {ep.params.length > 0 && (
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Parameters</p>
                      <div className="space-y-1">
                        {ep.params.map((p) => (
                          <div key={p.name} className="flex items-center gap-3 text-sm">
                            <code className="text-orange-300 font-mono min-w-[100px]">{p.name}</code>
                            <Badge className="bg-zinc-700 text-zinc-300 text-[10px]">{p.type}</Badge>
                            {p.default && <span className="text-zinc-600 text-xs">default: {p.default || "none"}</span>}
                            <span className="text-zinc-400 text-xs">{p.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Example Request</p>
                    <div className="relative bg-zinc-800 rounded-lg p-3 font-mono text-xs">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-1 right-1 text-zinc-500 hover:text-white h-6 w-6 p-0"
                        onClick={(e) => { e.stopPropagation(); copyToClipboard(ep.example); }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <pre className="text-green-400 whitespace-pre-wrap break-all">{ep.example}</pre>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Response Shape</p>
                    <div className="bg-zinc-800 rounded-lg p-3 font-mono text-xs">
                      <pre className="text-blue-300 whitespace-pre-wrap">{ep.response}</pre>
                    </div>
                  </div>

                  {ep.note && (
                    <p className="text-xs text-yellow-400/80 flex items-center gap-1.5">
                      <Lock className="h-3 w-3" /> {ep.note}
                    </p>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>

        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Globe className="h-5 w-5 text-orange-400" />
              Rate Limits & Errors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Rate Limit Headers</p>
                <div className="space-y-1 text-sm">
                  <p className="text-zinc-400"><code className="text-orange-300">X-RateLimit-Limit</code> — requests/minute</p>
                  <p className="text-zinc-400"><code className="text-orange-300">X-RateLimit-Remaining</code> — remaining this window</p>
                  <p className="text-zinc-400"><code className="text-orange-300">X-Daily-Quota-Remaining</code> — remaining today</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Error Codes</p>
                <div className="space-y-1 text-sm">
                  <p className="text-zinc-400"><code className="text-red-400">401</code> — Invalid or missing API key</p>
                  <p className="text-zinc-400"><code className="text-red-400">403</code> — Key revoked or expired</p>
                  <p className="text-zinc-400"><code className="text-yellow-400">429</code> — Rate limit or daily quota exceeded</p>
                  <p className="text-zinc-400"><code className="text-red-400">500</code> — Server error</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center py-6 space-y-3">
          <p className="text-zinc-400">Ready to integrate threat intelligence into your workflow?</p>
          <div className="flex items-center justify-center gap-3">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => setLocation("/support")} data-testid="button-subscribe-cta">
              Subscribe Now <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" onClick={() => setLocation("/contact")} data-testid="button-contact-sales">
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </Layout>
  );
}
