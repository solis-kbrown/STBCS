import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useThreatFeeds, useMaliciousIps, useMaliciousUrls, useCisaKev, useExportData } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Shield, Link2, Lock, AlertTriangle, CheckCircle, Clock, Zap, Download, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ThreatFeeds() {
  const { data: feeds, isLoading: feedsLoading } = useThreatFeeds();
  const { data: ipsData, isLoading: ipsLoading } = useMaliciousIps(20);
  const { data: urlsData, isLoading: urlsLoading } = useMaliciousUrls(20);
  const { data: kevData, isLoading: kevLoading } = useCisaKev(20);
  const exportMutation = useExportData();
  
  const maliciousIps = ipsData?.data || [];
  const maliciousUrls = urlsData?.data || [];
  const cisaKev = kevData?.data || [];

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">Threat Intelligence Feeds</h1>
            <p className="text-muted-foreground">
              Real-time data from 15+ threat intelligence sources including government feeds, abuse trackers, and security research.
            </p>
          </div>
          <Badge className="bg-green-600/20 text-green-400 border-green-500/50 px-4 py-2" data-testid="badge-live-status">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            15 FEEDS ACTIVE
          </Badge>
        </div>

        {/* Feed Sources Overview */}
        <Card className="border-white/5 bg-card/50">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Active Data Sources
            </CardTitle>
            <CardDescription>
              All feeds are automatically refreshed every 30 minutes. Pro tier unlocks additional real-time feeds.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {feedsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array(9).fill(0).map((_, i) => (
                  <div key={i} className="p-4 rounded-lg border border-white/5 bg-white/5">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {feeds?.map((feed) => (
                  <div 
                    key={feed.id} 
                    className={`p-4 rounded-lg border transition-all ${
                      feed.requiresProTier 
                        ? 'border-yellow-500/20 bg-yellow-500/5' 
                        : 'border-green-500/20 bg-green-500/5'
                    }`}
                    data-testid={`feed-${feed.name.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-white">{feed.name}</h4>
                      {feed.requiresProTier ? (
                        <Badge variant="outline" className="border-yellow-500/50 text-yellow-400 text-[10px]">
                          <Lock className="h-3 w-3 mr-1" />
                          PRO
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-green-500/50 text-green-400 text-[10px]">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          ACTIVE
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{feed.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {feed.updateFrequency}
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        {feed.feedType}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Threat Data Tabs */}
        <Tabs defaultValue="ips" className="space-y-4">
          <TabsList className="bg-background border border-white/10" data-testid="tabs-threat-data">
            <TabsTrigger value="ips" className="data-[state=active]:bg-primary/20" data-testid="tab-malicious-ips">
              Malicious IPs ({ipsData?.total || 0})
            </TabsTrigger>
            <TabsTrigger value="urls" className="data-[state=active]:bg-primary/20" data-testid="tab-malicious-urls">
              Malicious URLs ({urlsData?.total || 0})
            </TabsTrigger>
            <TabsTrigger value="kev" className="data-[state=active]:bg-primary/20" data-testid="tab-cisa-kev">
              CISA KEV ({kevData?.total || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ips" className="space-y-4">
            <Card className="border-white/5 bg-card/50">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="font-display flex items-center gap-2">
                    <Shield className="h-5 w-5 text-destructive" />
                    Malicious IP Addresses
                  </CardTitle>
                  <CardDescription>
                    Known malicious IPs from DShield, Feodo Tracker, Tor exit nodes, and SSL blacklists.
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10" 
                  data-testid="button-export-ips"
                  onClick={() => exportMutation.mutate('ips')}
                  disabled={exportMutation.isPending}
                >
                  {exportMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                {ipsLoading ? (
                  <div className="space-y-2">
                    {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : maliciousIps.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-xs uppercase bg-white/5 text-gray-300">
                        <tr>
                          <th className="px-4 py-3 text-left">IP Address</th>
                          <th className="px-4 py-3 text-left">Source</th>
                          <th className="px-4 py-3 text-left">Threat Type</th>
                          <th className="px-4 py-3 text-left">Last Seen</th>
                        </tr>
                      </thead>
                      <tbody>
                        {maliciousIps.map((ip) => (
                          <tr key={ip.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="px-4 py-3 font-mono text-primary">{ip.ipAddress}</td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className="border-white/20">{ip.source}</Badge>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{ip.threatType || 'Unknown'}</td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">
                              {ip.lastSeen ? new Date(ip.lastSeen).toLocaleString() : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No malicious IPs loaded yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="urls" className="space-y-4">
            <Card className="border-white/5 bg-card/50">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="font-display flex items-center gap-2">
                    <Link2 className="h-5 w-5 text-orange-500" />
                    Malicious URLs
                  </CardTitle>
                  <CardDescription>
                    Phishing, malware distribution, and C2 URLs from URLhaus and OpenPhish.
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10" 
                  data-testid="button-export-urls"
                  onClick={() => exportMutation.mutate('urls')}
                  disabled={exportMutation.isPending}
                >
                  {exportMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                {urlsLoading ? (
                  <div className="space-y-2">
                    {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : maliciousUrls.length > 0 ? (
                  <div className="space-y-3">
                    {maliciousUrls.map((url) => (
                      <div key={url.id} className="p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-mono text-sm text-primary truncate">{url.url}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <Badge variant="outline" className="border-white/20">{url.source}</Badge>
                              <span>{url.threatType || 'Unknown'}</span>
                              {url.malwareFamily && <span className="text-orange-400">{url.malwareFamily}</span>}
                            </div>
                          </div>
                          <Badge className={
                            url.status === 'active' ? 'bg-destructive' : 
                            url.status === 'offline' ? 'bg-green-600' : 'bg-gray-600'
                          }>
                            {url.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No malicious URLs loaded yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kev" className="space-y-4">
            <Card className="border-white/5 bg-card/50">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="font-display flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    CISA Known Exploited Vulnerabilities
                  </CardTitle>
                  <CardDescription>
                    Official catalog of CVEs actively exploited in the wild. Prioritize patching these immediately.
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10" 
                  data-testid="button-export-kev"
                  onClick={() => exportMutation.mutate('kev')}
                  disabled={exportMutation.isPending}
                >
                  {exportMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                {kevLoading ? (
                  <div className="space-y-2">
                    {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : cisaKev.length > 0 ? (
                  <div className="space-y-3">
                    {cisaKev.map((kev) => (
                      <div key={kev.id} className="p-4 rounded-lg border border-white/5 bg-white/5 hover:border-yellow-500/30 transition-colors">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="font-mono border-yellow-500/50 text-yellow-400">
                                {kev.cveId}
                              </Badge>
                              {kev.knownRansomware && (
                                <Badge className="bg-destructive text-[10px]">RANSOMWARE</Badge>
                              )}
                            </div>
                            <h4 className="font-bold text-white">{kev.vulnerabilityName}</h4>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-white/10 text-xs"
                            data-testid={`button-view-cve-${kev.cveId}`}
                            onClick={() => window.open(`https://nvd.nist.gov/vuln/detail/${kev.cveId}`, '_blank')}
                          >
                            View CVE
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{kev.shortDescription}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span><strong>Vendor:</strong> {kev.vendorProject}</span>
                          <span><strong>Product:</strong> {kev.product}</span>
                          {kev.dueDate && (
                            <span className="text-yellow-400">
                              <strong>Due:</strong> {new Date(kev.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No CISA KEV data loaded yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Pro Upgrade CTA */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-bold text-xl text-white mb-2">Unlock Real-Time Threat Intelligence</h3>
              <p className="text-muted-foreground">
                Pro subscribers get access to AlienVault OTX, VirusTotal, Shodan, GreyNoise, and more real-time feeds.
              </p>
            </div>
            <Button 
              className="bg-primary hover:bg-primary/90 font-bold px-8" 
              data-testid="button-upgrade-pro"
              onClick={() => alert('Pro subscription coming soon! Contact us for early access.')}
            >
              UPGRADE TO PRO
            </Button>
          </CardContent>
        </Card>
        <Footer />
      </div>
    </Layout>
  );
}
