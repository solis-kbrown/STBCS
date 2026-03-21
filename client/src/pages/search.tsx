import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/layout";
import Footer from "@/components/footer";
import RelatedResources, { getRelatedLinks } from "@/components/related-resources";
import UpgradeBanner from "@/components/upgrade-banner";
import { useGlobalSearch } from "@/lib/api";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Shield, Skull, Globe, Link2, AlertTriangle, Newspaper, Loader2, Filter, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import IOCSearchTab from "./ioc-search-tab";

export default function SearchPage() {
  const [location, setLocation] = useLocation();
  const params = new URLSearchParams(location.split('?')[1] || '');
  const initialQuery = params.get('q') || '';
  const initialTab = params.get('tab') === 'ioc' ? 'ioc' : 'search';
  const [activeTab, setActiveTab] = useState(initialTab);

  useDocumentTitle(
    activeTab === 'ioc'
      ? "IOC Lookup | STB Cybersecurity"
      : "Global Threat Search | STB Cybersecurity",
    activeTab === 'ioc'
      ? "Search Indicators of Compromise across 160+ threat intelligence feeds. Check IPs, domains, hashes, URLs, and CVEs against multiple threat databases."
      : "Search CVEs, ransomware incidents, malicious IPs, phishing URLs, threat actors, and security news. Unified threat intelligence search across 160+ feeds."
  );

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    if (value === 'ioc') {
      setLocation('/search?tab=ioc');
    } else {
      const currentParams = new URLSearchParams(location.split('?')[1] || '');
      const q = currentParams.get('q');
      setLocation(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
    }
  }, [location, setLocation]);
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  
  const isPro = user?.tier && ['pro', 'business', 'enterprise'].includes(user.tier);
  
  const { data: results, isLoading, isFetching } = useGlobalSearch(debouncedQuery);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  const filterResults = (data: typeof results) => {
    if (!data || !isPro) return data;
    
    let filtered = { ...data };
    
    if (severityFilter !== "all" && filtered.cves) {
      filtered.cves = filtered.cves.filter(cve => cve.severity?.toUpperCase() === severityFilter.toUpperCase());
    }
    
    if (dateRangeFilter !== "all") {
      const now = new Date();
      let cutoffDate = new Date();
      
      switch (dateRangeFilter) {
        case "24h": cutoffDate.setHours(now.getHours() - 24); break;
        case "7d": cutoffDate.setDate(now.getDate() - 7); break;
        case "30d": cutoffDate.setDate(now.getDate() - 30); break;
        case "90d": cutoffDate.setDate(now.getDate() - 90); break;
      }
      
      filtered.cves = filtered.cves?.filter(cve => new Date(cve.publishedDate || 0) >= cutoffDate);
      filtered.ransomware = filtered.ransomware?.filter(r => new Date(r.discoveredAt || 0) >= cutoffDate);
      filtered.ips = filtered.ips?.filter(ip => new Date(ip.lastSeen || ip.createdAt || 0) >= cutoffDate);
      filtered.urls = filtered.urls?.filter(url => new Date(url.createdAt || 0) >= cutoffDate);
      filtered.news = filtered.news?.filter(n => new Date(n.publishedAt || 0) >= cutoffDate);
    }
    
    filtered.totalResults = (filtered.cves?.length || 0) + (filtered.ransomware?.length || 0) + 
      (filtered.ips?.length || 0) + (filtered.urls?.length || 0) + 
      (filtered.kev?.length || 0) + (filtered.news?.length || 0);
    
    return filtered;
  };
  
  const filteredResults = filterResults(results);

  const getSeverityColor = (severity: string | null) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return 'bg-red-600 text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MEDIUM': return 'bg-yellow-500 text-black';
      case 'LOW': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-display font-bold text-white">Global Threat Search</h1>
          <p className="text-muted-foreground">
            Search across all threat intelligence data including CVEs, ransomware incidents, malicious IPs/URLs, and more.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="bg-zinc-900/50 border border-zinc-500" data-testid="tabs-page-mode">
            <TabsTrigger value="search" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400" data-testid="tab-global-search">
              Global Search
            </TabsTrigger>
            <TabsTrigger value="ioc" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400" data-testid="tab-ioc-lookup">
              IOC Lookup
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6 mt-6">

        <Card className="border-white/5 bg-card/50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search CVEs, IPs, URLs, ransomware groups, vendors..."
                  className="pl-10 h-12 text-lg bg-background border-zinc-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-global-search"
                />
              </div>
              {isFetching && <Loader2 className="h-6 w-6 animate-spin text-primary self-center" />}
            </div>
            {results && (
              <p className="text-sm text-muted-foreground mt-3">
                Found <span className="font-bold text-white">{filteredResults?.totalResults || 0}</span> results for "{results.query}"
              </p>
            )}
            
            <div className="mt-4 border-t border-white/10 pt-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-white"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                data-testid="button-toggle-advanced-filters"
              >
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
                {showAdvancedFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
                {!isPro && <Badge className="ml-2 bg-orange-500/20 text-orange-400 border-orange-500/50" variant="outline"><Lock className="h-3 w-3 mr-1" />PRO</Badge>}
              </Button>
              
              {showAdvancedFilters && (
                <div className={`mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 ${!isPro ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Severity</label>
                    <Select value={severityFilter} onValueChange={setSeverityFilter} disabled={!isPro}>
                      <SelectTrigger className="bg-background border-zinc-500" data-testid="select-severity">
                        <SelectValue placeholder="All Severities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Severities</SelectItem>
                        <SelectItem value="CRITICAL">Critical</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="LOW">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Date Range</label>
                    <Select value={dateRangeFilter} onValueChange={setDateRangeFilter} disabled={!isPro}>
                      <SelectTrigger className="bg-background border-zinc-500" data-testid="select-date-range">
                        <SelectValue placeholder="All Time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="24h">Last 24 Hours</SelectItem>
                        <SelectItem value="7d">Last 7 Days</SelectItem>
                        <SelectItem value="30d">Last 30 Days</SelectItem>
                        <SelectItem value="90d">Last 90 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">Source Type</label>
                    <Select value={sourceFilter} onValueChange={setSourceFilter} disabled={!isPro}>
                      <SelectTrigger className="bg-background border-zinc-500" data-testid="select-source">
                        <SelectValue placeholder="All Sources" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        <SelectItem value="nvd">NVD</SelectItem>
                        <SelectItem value="cisa">CISA</SelectItem>
                        <SelectItem value="urlhaus">URLhaus</SelectItem>
                        <SelectItem value="openphish">OpenPhish</SelectItem>
                        <SelectItem value="dshield">DShield</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {!isPro && (
                    <div className="col-span-full text-center py-2">
                      <p className="text-sm text-orange-400">
                        Upgrade to Pro to unlock advanced search filters
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {debouncedQuery.length >= 2 && (
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="bg-background border border-zinc-500 flex-wrap h-auto gap-1" data-testid="tabs-search-results">
              <TabsTrigger value="all" className="data-[state=active]:!bg-orange-500 data-[state=active]:!text-white" data-testid="tab-all-results">
                All ({filteredResults?.totalResults || 0})
              </TabsTrigger>
              <TabsTrigger value="cves" className="data-[state=active]:!bg-orange-500 data-[state=active]:!text-white" data-testid="tab-cve-results">
                CVEs ({filteredResults?.cves?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="ransomware" className="data-[state=active]:!bg-orange-500 data-[state=active]:!text-white" data-testid="tab-ransomware-results">
                Ransomware ({filteredResults?.ransomware?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="ips" className="data-[state=active]:!bg-orange-500 data-[state=active]:!text-white" data-testid="tab-ip-results">
                IPs ({filteredResults?.ips?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="urls" className="data-[state=active]:!bg-orange-500 data-[state=active]:!text-white" data-testid="tab-url-results">
                URLs ({filteredResults?.urls?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="kev" className="data-[state=active]:!bg-orange-500 data-[state=active]:!text-white" data-testid="tab-kev-results">
                KEV ({filteredResults?.kev?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="news" className="data-[state=active]:!bg-orange-500 data-[state=active]:!text-white" data-testid="tab-news-results">
                News ({filteredResults?.news?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
              ) : filteredResults && filteredResults.totalResults > 0 ? (
                <div className="space-y-6">
                  {(filteredResults.cves?.length || 0) > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" /> CVEs
                      </h3>
                      <div className="space-y-2">
                        {filteredResults.cves?.slice(0, 5).map((cve) => (
                          <Card key={cve.id} className="border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                            <CardContent className="py-3">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="font-mono border-primary/50 text-primary">{cve.cveId}</Badge>
                                    <Badge className={getSeverityColor(cve.severity)}>{cve.severity}</Badge>
                                    {cve.score && <span className="text-sm font-bold text-white">{cve.score}</span>}
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-2">{cve.description}</p>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-zinc-500 text-xs shrink-0"
                                  onClick={() => window.open(`https://nvd.nist.gov/vuln/detail/${cve.cveId}`, '_blank')}
                                >
                                  View
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {(filteredResults.ransomware?.length || 0) > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Skull className="h-5 w-5 text-destructive" /> Ransomware Incidents
                      </h3>
                      <div className="space-y-2">
                        {filteredResults.ransomware?.slice(0, 5).map((incident) => (
                          <Card key={incident.id} className="border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                            <CardContent className="py-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-semibold text-white">{incident.victim}</h4>
                                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                    <Badge variant="outline" className="border-destructive/50 text-destructive">{incident.groupName}</Badge>
                                    <span>{incident.sector}</span>
                                    <span>{incident.country}</span>
                                  </div>
                                </div>
                                <Badge className={incident.status === 'Published' ? 'bg-destructive' : 'bg-yellow-500'}>{incident.status}</Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {(filteredResults.ips?.length || 0) > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Globe className="h-5 w-5 text-orange-500" /> Malicious IPs
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {filteredResults.ips?.slice(0, 6).map((ip) => (
                          <div key={ip.id} className="p-3 rounded-lg border border-white/5 bg-white/5">
                            <p className="font-mono text-primary">{ip.ipAddress}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <Badge variant="outline" className="border-white/20">{ip.source}</Badge>
                              <span>{ip.threatType}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(filteredResults.urls?.length || 0) > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Link2 className="h-5 w-5 text-yellow-500" /> Malicious URLs
                      </h3>
                      <div className="space-y-2">
                        {filteredResults.urls?.slice(0, 5).map((url) => (
                          <div key={url.id} className="p-3 rounded-lg border border-white/5 bg-white/5">
                            <p className="font-mono text-sm text-primary truncate">{url.url}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <Badge variant="outline" className="border-white/20">{url.source}</Badge>
                              <span>{url.threatType}</span>
                              <Badge className={url.status === 'active' ? 'bg-destructive' : 'bg-green-600'}>{url.status}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(filteredResults.kev?.length || 0) > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" /> CISA KEV
                      </h3>
                      <div className="space-y-2">
                        {filteredResults.kev?.slice(0, 5).map((kev) => (
                          <Card key={kev.id} className="border-white/5 bg-white/5">
                            <CardContent className="py-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="font-mono border-yellow-500/50 text-yellow-400">{kev.cveId}</Badge>
                                {kev.knownRansomware && <Badge className="bg-destructive text-[10px]">RANSOMWARE</Badge>}
                              </div>
                              <h4 className="font-semibold text-white">{kev.vulnerabilityName}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{kev.vendorProject} - {kev.product}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {(filteredResults.news?.length || 0) > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Newspaper className="h-5 w-5 text-blue-400" /> News
                      </h3>
                      <div className="space-y-2">
                        {filteredResults.news?.slice(0, 5).map((article) => (
                          <Card key={article.id} className="border-white/5 bg-white/5">
                            <CardContent className="py-3">
                              <h4 className="font-semibold text-white">{article.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{article.summary}</p>
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <Badge variant="outline" className="border-white/20">{article.category}</Badge>
                                <span>{article.source}</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : debouncedQuery.length >= 2 ? (
                <Card className="border-white/5 bg-card/50">
                  <CardContent className="py-12 text-center">
                    <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No results found</h3>
                    <p className="text-muted-foreground">Try searching for different keywords like CVE IDs, IP addresses, or ransomware group names.</p>
                  </CardContent>
                </Card>
              ) : null}
            </TabsContent>

            <TabsContent value="cves">
              {results?.cves.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No CVEs match your search.</p>
              ) : (
                <div className="space-y-2">
                  {results?.cves.map((cve) => (
                    <Card key={cve.id} className="border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                      <CardContent className="py-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="font-mono border-primary/50 text-primary">{cve.cveId}</Badge>
                              <Badge className={getSeverityColor(cve.severity)}>{cve.severity}</Badge>
                              {cve.score && <span className="text-sm font-bold text-white">{cve.score}</span>}
                            </div>
                            <p className="text-sm text-muted-foreground">{cve.description}</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-zinc-500 text-xs shrink-0"
                            onClick={() => window.open(`https://nvd.nist.gov/vuln/detail/${cve.cveId}`, '_blank')}
                          >
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="ransomware">
              {results?.ransomware.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No ransomware incidents match your search.</p>
              ) : (
                <div className="space-y-2">
                  {results?.ransomware.map((incident) => (
                    <Card key={incident.id} className="border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                      <CardContent className="py-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-white">{incident.victim}</h4>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <Badge variant="outline" className="border-destructive/50 text-destructive">{incident.groupName}</Badge>
                              <span>{incident.sector}</span>
                              <span>{incident.country}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{incident.description}</p>
                          </div>
                          <Badge className={incident.status === 'Published' ? 'bg-destructive' : 'bg-yellow-500'}>{incident.status}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="ips">
              {results?.ips.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No IPs match your search.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {results?.ips.map((ip) => (
                    <div key={ip.id} className="p-4 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                      <p className="font-mono text-lg text-primary">{ip.ipAddress}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="border-white/20">{ip.source}</Badge>
                        <span>{ip.threatType}</span>
                        {ip.country && <span>{ip.country}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="urls">
              {results?.urls.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No URLs match your search.</p>
              ) : (
                <div className="space-y-2">
                  {results?.urls.map((url) => (
                    <div key={url.id} className="p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                      <p className="font-mono text-sm text-primary break-all">{url.url}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="border-white/20">{url.source}</Badge>
                        <span>{url.threatType}</span>
                        {url.malwareFamily && <span className="text-orange-400">{url.malwareFamily}</span>}
                        <Badge className={url.status === 'active' ? 'bg-destructive' : 'bg-green-600'}>{url.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="kev">
              {results?.kev.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No KEV entries match your search.</p>
              ) : (
                <div className="space-y-3">
                  {results?.kev.map((kev) => (
                    <Card key={kev.id} className="border-white/5 bg-white/5 hover:border-yellow-500/30 transition-colors">
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="font-mono border-yellow-500/50 text-yellow-400">{kev.cveId}</Badge>
                              {kev.knownRansomware && <Badge className="bg-destructive text-[10px]">RANSOMWARE</Badge>}
                            </div>
                            <h4 className="font-bold text-white">{kev.vulnerabilityName}</h4>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-zinc-500 text-xs"
                            onClick={() => window.open(`https://nvd.nist.gov/vuln/detail/${kev.cveId}`, '_blank')}
                          >
                            View CVE
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{kev.shortDescription}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span><strong>Vendor:</strong> {kev.vendorProject}</span>
                          <span><strong>Product:</strong> {kev.product}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="news">
              {results?.news.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No news articles match your search.</p>
              ) : (
                <div className="space-y-3">
                  {results?.news.map((article) => (
                    <Card key={article.id} className="border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white line-clamp-2">{article.title}</h4>
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{article.summary}</p>
                            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                              <Badge variant="outline" className="border-blue-400/50 text-blue-400">{article.category}</Badge>
                              <span className="text-white/70">{article.source}</span>
                              {article.publishedAt && (
                                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                          {article.sourceUrl && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-zinc-500 text-xs shrink-0"
                              onClick={() => window.open(article.sourceUrl!, '_blank')}
                            >
                              Read
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {debouncedQuery.length < 2 && (
          <Card className="border-white/5 bg-card/50">
            <CardContent className="py-12 text-center">
              <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Search Threat Intelligence</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Enter at least 2 characters to search across CVEs, ransomware incidents, malicious IPs, URLs, CISA KEV entries, and security news.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                <Badge variant="outline" className="cursor-pointer hover:bg-white/10" onClick={() => setSearchQuery('CVE-2024')}>CVE-2024</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-white/10" onClick={() => setSearchQuery('LockBit')}>LockBit</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-white/10" onClick={() => setSearchQuery('healthcare')}>healthcare</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-white/10" onClick={() => setSearchQuery('phishing')}>phishing</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-white/10" onClick={() => setSearchQuery('Microsoft')}>Microsoft</Badge>
              </div>
            </CardContent>
          </Card>
        )}

          </TabsContent>

          <TabsContent value="ioc" className="mt-6">
            <IOCSearchTab />
          </TabsContent>
        </Tabs>

        <UpgradeBanner context="search" />
                <RelatedResources links={getRelatedLinks("/search")} testIdPrefix="search" />
<Footer />
      </div>
    </Layout>
  );
}
