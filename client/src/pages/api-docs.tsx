import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Lock, Zap, Globe, Shield, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ApiDocs() {
  useDocumentTitle("API Documentation | STB Cybersecurity", "REST API docs for real-time threat intelligence: CVEs, ransomware incidents, malicious IPs, phishing URLs, and CISA KEV. Free and Pro tiers available.");

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-4">
          <Code className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-display font-bold text-white">API Documentation</h1>
        </div>
        <p className="text-muted-foreground mb-8">
          Access STBCS threat intelligence programmatically with our REST API.
        </p>

        <div className="grid gap-6 mb-8">
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Crown className="h-8 w-8 text-amber-400" />
                  <div>
                    <h3 className="font-bold text-white text-lg">API Access Requires Pro Subscription</h3>
                    <p className="text-muted-foreground text-sm">
                      Upgrade to Pro or Business to get your API key and access our endpoints.
                    </p>
                  </div>
                </div>
                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold" asChild>
                  <a href="/support#pricing">
                    <Crown className="h-4 w-4 mr-2" /> Get API Access
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="border-white/5 bg-card/50">
            <CardContent className="pt-6 text-center">
              <Shield className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="font-bold text-white mb-2">Secure</h3>
              <p className="text-sm text-muted-foreground">
                All API requests require authentication and are encrypted with TLS 1.3.
              </p>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-card/50">
            <CardContent className="pt-6 text-center">
              <Zap className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="font-bold text-white mb-2">Fast</h3>
              <p className="text-sm text-muted-foreground">
                Low-latency responses with 99.9% uptime SLA for enterprise customers.
              </p>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-card/50">
            <CardContent className="pt-6 text-center">
              <Globe className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="font-bold text-white mb-2">Comprehensive</h3>
              <p className="text-sm text-muted-foreground">
                Access CVEs, ransomware intel, malicious IPs/URLs, and more.
              </p>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-2xl font-bold text-white mb-4">Available Endpoints</h2>
        
        <div className="space-y-4">
          <Card className="border-white/5 bg-card/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-mono">GET /api/cves</CardTitle>
                <Badge className="bg-green-600">Public</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-3">
                Retrieve CVE/vulnerability data with optional search and pagination.
              </p>
              <div className="bg-zinc-900 rounded-lg p-3 font-mono text-sm">
                <code className="text-green-400">GET</code>
                <code className="text-zinc-300"> /api/cves?limit=100&offset=0&search=apache</code>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-card/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-mono">GET /api/ransomware</CardTitle>
                <Badge className="bg-green-600">Public</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-3">
                Get ransomware incident data including victim information and threat actors.
              </p>
              <div className="bg-zinc-900 rounded-lg p-3 font-mono text-sm">
                <code className="text-green-400">GET</code>
                <code className="text-zinc-300"> /api/ransomware?limit=100&group=lockbit</code>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-card/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-mono">GET /api/malicious-ips</CardTitle>
                <Badge className="bg-green-600">Public</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-3">
                Retrieve known malicious IP addresses from multiple threat feeds.
              </p>
              <div className="bg-zinc-900 rounded-lg p-3 font-mono text-sm">
                <code className="text-green-400">GET</code>
                <code className="text-zinc-300"> /api/malicious-ips?limit=500&source=Spamhaus</code>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-card/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-mono">GET /api/export/:type</CardTitle>
                <Badge className="bg-amber-500"><Lock className="h-3 w-3 mr-1" /> Pro</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-3">
                Export data in JSON or CSV format. Available types: cves, ransomware, ips, urls, kev.
              </p>
              <div className="bg-zinc-900 rounded-lg p-3 font-mono text-sm">
                <code className="text-green-400">GET</code>
                <code className="text-zinc-300"> /api/export/cves?format=csv&limit=5000</code>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-card/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-mono">GET /api/watchlist</CardTitle>
                <Badge className="bg-amber-500"><Lock className="h-3 w-3 mr-1" /> Pro</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-3">
                Manage your personal watchlist for CVEs, IPs, domains, and keywords.
              </p>
              <div className="bg-zinc-900 rounded-lg p-3 font-mono text-sm">
                <code className="text-green-400">GET</code>
                <code className="text-zinc-300"> /api/watchlist</code>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-card/50">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-mono">POST /api/tools/ip-lookup</CardTitle>
                <Badge className="bg-green-600">Public</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-3">
                Perform IP WHOIS lookup with threat intelligence enrichment.
              </p>
              <div className="bg-zinc-900 rounded-lg p-3 font-mono text-sm">
                <code className="text-blue-400">POST</code>
                <code className="text-zinc-300">{` /api/tools/ip-lookup { "ip": "8.8.8.8" }`}</code>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-white/5 bg-card/50 mt-8">
          <CardHeader>
            <CardTitle className="text-xl">Rate Limits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Tier</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Rate Limit</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Export Limit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4 text-white">Free</td>
                    <td className="py-3 px-4 text-muted-foreground">10 requests/minute</td>
                    <td className="py-3 px-4 text-muted-foreground">N/A</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="py-3 px-4 text-white">Pro</td>
                    <td className="py-3 px-4 text-muted-foreground">60 requests/minute</td>
                    <td className="py-3 px-4 text-muted-foreground">5,000 records</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-white">Business</td>
                    <td className="py-3 px-4 text-muted-foreground">120 requests/minute</td>
                    <td className="py-3 px-4 text-muted-foreground">10,000 records</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">
            Need help with API integration? Contact our support team.
          </p>
          <Button variant="outline" asChild>
            <a href="mailto:api@stbcybersecurity.com">Contact API Support</a>
          </Button>
        </div>
      </div>
      <Footer />
    </Layout>
  );
}
