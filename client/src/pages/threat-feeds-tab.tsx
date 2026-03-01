import { useThreatFeeds, useMaliciousIps, useMaliciousUrls, useCisaKev, useExportData } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Shield, Link2, Lock, AlertTriangle, CheckCircle, Clock, Zap, Download, Loader2, Search, ArrowUpDown, SlidersHorizontal, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useMemo } from "react";
import PaginationControls from "@/components/pagination-controls";

type IpSortOption = "newest" | "oldest" | "source" | "threat";
type UrlSortOption = "newest" | "oldest" | "source" | "status";
type KevSortOption = "newest" | "oldest" | "vendor-az" | "due-soonest";

export default function ThreatFeedsTab() {
  const { data: feeds, isLoading: feedsLoading } = useThreatFeeds();
  const { data: ipsData, isLoading: ipsLoading } = useMaliciousIps(1000);
  const { data: urlsData, isLoading: urlsLoading } = useMaliciousUrls(1000);
  const { data: kevData, isLoading: kevLoading } = useCisaKev(1000);
  const exportMutation = useExportData();

  const [ipSearch, setIpSearch] = useState("");
  const [ipSort, setIpSort] = useState<IpSortOption>("newest");
  const [ipSourceFilter, setIpSourceFilter] = useState("all");

  const [urlSearch, setUrlSearch] = useState("");
  const [urlSort, setUrlSort] = useState<UrlSortOption>("newest");
  const [urlSourceFilter, setUrlSourceFilter] = useState("all");
  const [urlStatusFilter, setUrlStatusFilter] = useState("all");

  const [kevSearch, setKevSearch] = useState("");
  const [kevSort, setKevSort] = useState<KevSortOption>("newest");
  const [kevVendorFilter, setKevVendorFilter] = useState("all");

  const [ipPage, setIpPage] = useState(1);
  const [ipPageSize, setIpPageSize] = useState(25);
  const [urlPage, setUrlPage] = useState(1);
  const [urlPageSize, setUrlPageSize] = useState(25);
  const [kevPage, setKevPage] = useState(1);
  const [kevPageSize, setKevPageSize] = useState(25);

  const rawIps = ipsData?.data || [];
  const rawUrls = urlsData?.data || [];
  const rawKev = kevData?.data || [];

  const ipSources = useMemo(() => Array.from(new Set(rawIps.map(ip => ip.source).filter(Boolean))).sort(), [rawIps]);
  const urlSources = useMemo(() => Array.from(new Set(rawUrls.map(u => u.source).filter(Boolean))).sort(), [rawUrls]);
  const kevVendors = useMemo(() => Array.from(new Set(rawKev.map(k => k.vendorProject).filter(Boolean))).sort(), [rawKev]);

  const maliciousIps = useMemo(() => {
    let filtered = [...rawIps];
    if (ipSearch) {
      const q = ipSearch.toLowerCase();
      filtered = filtered.filter(ip => ip.ipAddress?.toLowerCase().includes(q) || ip.source?.toLowerCase().includes(q) || ip.threatType?.toLowerCase().includes(q));
    }
    if (ipSourceFilter !== "all") {
      filtered = filtered.filter(ip => ip.source === ipSourceFilter);
    }
    filtered.sort((a, b) => {
      switch (ipSort) {
        case "newest": return new Date(b.lastSeen || 0).getTime() - new Date(a.lastSeen || 0).getTime();
        case "oldest": return new Date(a.lastSeen || 0).getTime() - new Date(b.lastSeen || 0).getTime();
        case "source": return (a.source || "").localeCompare(b.source || "");
        case "threat": return (a.threatType || "").localeCompare(b.threatType || "");
        default: return 0;
      }
    });
    return filtered;
  }, [rawIps, ipSearch, ipSort, ipSourceFilter]);

  const maliciousUrls = useMemo(() => {
    let filtered = [...rawUrls];
    if (urlSearch) {
      const q = urlSearch.toLowerCase();
      filtered = filtered.filter(u => u.url?.toLowerCase().includes(q) || u.source?.toLowerCase().includes(q) || u.threatType?.toLowerCase().includes(q));
    }
    if (urlSourceFilter !== "all") {
      filtered = filtered.filter(u => u.source === urlSourceFilter);
    }
    if (urlStatusFilter !== "all") {
      filtered = filtered.filter(u => u.status === urlStatusFilter);
    }
    filtered.sort((a, b) => {
      switch (urlSort) {
        case "newest": return new Date(b.reportedAt || b.createdAt || 0).getTime() - new Date(a.reportedAt || a.createdAt || 0).getTime();
        case "oldest": return new Date(a.reportedAt || a.createdAt || 0).getTime() - new Date(b.reportedAt || b.createdAt || 0).getTime();
        case "source": return (a.source || "").localeCompare(b.source || "");
        case "status": return (a.status || "").localeCompare(b.status || "");
        default: return 0;
      }
    });
    return filtered;
  }, [rawUrls, urlSearch, urlSort, urlSourceFilter, urlStatusFilter]);

  const cisaKev = useMemo(() => {
    let filtered = [...rawKev];
    if (kevSearch) {
      const q = kevSearch.toLowerCase();
      filtered = filtered.filter(k => k.cveId?.toLowerCase().includes(q) || k.vulnerabilityName?.toLowerCase().includes(q) || k.vendorProject?.toLowerCase().includes(q) || k.product?.toLowerCase().includes(q));
    }
    if (kevVendorFilter !== "all") {
      filtered = filtered.filter(k => k.vendorProject === kevVendorFilter);
    }
    filtered.sort((a, b) => {
      switch (kevSort) {
        case "newest": return new Date(b.dateAdded || 0).getTime() - new Date(a.dateAdded || 0).getTime();
        case "oldest": return new Date(a.dateAdded || 0).getTime() - new Date(b.dateAdded || 0).getTime();
        case "vendor-az": return (a.vendorProject || "").localeCompare(b.vendorProject || "");
        case "due-soonest": return new Date(a.dueDate || "9999").getTime() - new Date(b.dueDate || "9999").getTime();
        default: return 0;
      }
    });
    return filtered;
  }, [rawKev, kevSearch, kevSort, kevVendorFilter]);

  const ipTotalPages = Math.max(1, Math.ceil(maliciousIps.length / ipPageSize));
  const ipSafePage = Math.min(ipPage, ipTotalPages);
  const paginatedIps = maliciousIps.slice((ipSafePage - 1) * ipPageSize, ipSafePage * ipPageSize);

  const urlTotalPages = Math.max(1, Math.ceil(maliciousUrls.length / urlPageSize));
  const urlSafePage = Math.min(urlPage, urlTotalPages);
  const paginatedUrls = maliciousUrls.slice((urlSafePage - 1) * urlPageSize, urlSafePage * urlPageSize);

  const kevTotalPages = Math.max(1, Math.ceil(cisaKev.length / kevPageSize));
  const kevSafePage = Math.min(kevPage, kevTotalPages);
  const paginatedKev = cisaKev.slice((kevSafePage - 1) * kevPageSize, kevSafePage * kevPageSize);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-muted-foreground">
            Malicious IPs, phishing URLs, and CISA Known Exploited Vulnerabilities pulled from 70+ sources every 15 minutes.
          </p>
        </div>
        <Badge className="bg-green-600/20 text-green-400 border-green-500/50 px-4 py-2" data-testid="badge-live-status">
          <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
          70+ FEEDS ACTIVE
        </Badge>
      </div>

      <Card className="border-white/5 bg-card/50">
        <CardHeader>
          <CardTitle className="font-display flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Active Data Sources
          </CardTitle>
          <CardDescription>
            Every feed refreshes automatically. Pro members get higher rate limits and export access.
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
                onClick={() => exportMutation.mutate({ type: 'ips' })}
                disabled={exportMutation.isPending}
              >
                {exportMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
                Export
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search IPs, sources, threat types..."
                    className="pl-10 bg-background/50 border-white/10 h-9 text-sm"
                    value={ipSearch}
                    onChange={(e) => { setIpSearch(e.target.value); setIpPage(1); }}
                    data-testid="input-search-ips"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={ipSort} onValueChange={(v) => { setIpSort(v as IpSortOption); setIpPage(1); }}>
                    <SelectTrigger className="w-[150px] bg-background/50 border-white/10 h-9 text-sm" data-testid="select-sort-ips">
                      <ArrowUpDown className="h-3 w-3 mr-2 text-muted-foreground" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="source">By Source</SelectItem>
                      <SelectItem value="threat">By Threat</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={ipSourceFilter} onValueChange={(v) => { setIpSourceFilter(v); setIpPage(1); }}>
                    <SelectTrigger className="w-[160px] bg-background/50 border-white/10 h-9 text-sm" data-testid="select-source-ips">
                      <SelectValue placeholder="All Sources" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      {ipSources.map(s => (
                        <SelectItem key={s} value={s as string}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{(ipSearch || ipSourceFilter !== "all" || ipSort !== "newest") ? `${maliciousIps.length} IPs (filtered from ${(ipsData?.total || 0).toLocaleString()})` : `${(ipsData?.total || 0).toLocaleString()} IPs`}</span>
                {(ipSearch || ipSourceFilter !== "all" || ipSort !== "newest") && (
                  <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground hover:text-white px-2" onClick={() => { setIpSearch(""); setIpSort("newest"); setIpSourceFilter("all"); setIpPage(1); }} data-testid="button-clear-ip-filters">
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
              {ipsLoading ? (
                <div className="space-y-2">
                  {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : paginatedIps.length > 0 ? (
                <>
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
                        {paginatedIps.map((ip) => (
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
                  <PaginationControls
                    currentPage={ipSafePage}
                    totalPages={ipTotalPages}
                    pageSize={ipPageSize}
                    totalItems={maliciousIps.length}
                    onPageChange={setIpPage}
                    onPageSizeChange={(s) => { setIpPageSize(s); setIpPage(1); }}
                  />
                </>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {ipSearch || ipSourceFilter !== "all" ? "No IPs match the current filters." : "No malicious IPs loaded yet."}
                </p>
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
                onClick={() => exportMutation.mutate({ type: 'urls' })}
                disabled={exportMutation.isPending}
              >
                {exportMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
                Export
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search URLs, sources, threat types..."
                    className="pl-10 bg-background/50 border-white/10 h-9 text-sm"
                    value={urlSearch}
                    onChange={(e) => { setUrlSearch(e.target.value); setUrlPage(1); }}
                    data-testid="input-search-urls"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={urlSort} onValueChange={(v) => { setUrlSort(v as UrlSortOption); setUrlPage(1); }}>
                    <SelectTrigger className="w-[150px] bg-background/50 border-white/10 h-9 text-sm" data-testid="select-sort-urls">
                      <ArrowUpDown className="h-3 w-3 mr-2 text-muted-foreground" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="source">By Source</SelectItem>
                      <SelectItem value="status">By Status</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={urlSourceFilter} onValueChange={(v) => { setUrlSourceFilter(v); setUrlPage(1); }}>
                    <SelectTrigger className="w-[160px] bg-background/50 border-white/10 h-9 text-sm" data-testid="select-source-urls">
                      <SelectValue placeholder="All Sources" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sources</SelectItem>
                      {urlSources.map(s => (
                        <SelectItem key={s} value={s as string}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={urlStatusFilter} onValueChange={(v) => { setUrlStatusFilter(v); setUrlPage(1); }}>
                    <SelectTrigger className="w-[140px] bg-background/50 border-white/10 h-9 text-sm" data-testid="select-status-urls">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{(urlSearch || urlSourceFilter !== "all" || urlStatusFilter !== "all" || urlSort !== "newest") ? `${maliciousUrls.length} URLs (filtered from ${(urlsData?.total || 0).toLocaleString()})` : `${(urlsData?.total || 0).toLocaleString()} URLs`}</span>
                {(urlSearch || urlSourceFilter !== "all" || urlStatusFilter !== "all" || urlSort !== "newest") && (
                  <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground hover:text-white px-2" onClick={() => { setUrlSearch(""); setUrlSort("newest"); setUrlSourceFilter("all"); setUrlStatusFilter("all"); setUrlPage(1); }} data-testid="button-clear-url-filters">
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
              {urlsLoading ? (
                <div className="space-y-2">
                  {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : paginatedUrls.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {paginatedUrls.map((url) => (
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
                  <PaginationControls
                    currentPage={urlSafePage}
                    totalPages={urlTotalPages}
                    pageSize={urlPageSize}
                    totalItems={maliciousUrls.length}
                    onPageChange={setUrlPage}
                    onPageSizeChange={(s) => { setUrlPageSize(s); setUrlPage(1); }}
                  />
                </>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {urlSearch || urlSourceFilter !== "all" || urlStatusFilter !== "all" ? "No URLs match the current filters." : "No malicious URLs loaded yet."}
                </p>
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
                onClick={() => exportMutation.mutate({ type: 'kev' })}
                disabled={exportMutation.isPending}
              >
                {exportMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
                Export
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3 items-stretch">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search CVEs, vendors, products..."
                    className="pl-10 bg-background/50 border-white/10 h-9 text-sm"
                    value={kevSearch}
                    onChange={(e) => { setKevSearch(e.target.value); setKevPage(1); }}
                    data-testid="input-search-kev"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={kevSort} onValueChange={(v) => { setKevSort(v as KevSortOption); setKevPage(1); }}>
                    <SelectTrigger className="w-[160px] bg-background/50 border-white/10 h-9 text-sm" data-testid="select-sort-kev">
                      <ArrowUpDown className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="vendor-az">Vendor A-Z</SelectItem>
                      <SelectItem value="due-soonest">Due Soonest</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={kevVendorFilter} onValueChange={(v) => { setKevVendorFilter(v); setKevPage(1); }}>
                    <SelectTrigger className="w-[160px] bg-background/50 border-white/10 h-9 text-sm" data-testid="select-vendor-kev">
                      <SlidersHorizontal className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="Vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Vendors</SelectItem>
                      {kevVendors.map(v => (
                        <SelectItem key={v} value={v!}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {(kevSearch || kevSort !== "newest" || kevVendorFilter !== "all") ? `${cisaKev.length} entries (filtered from ${(kevData?.total || 0).toLocaleString()})` : `${(kevData?.total || 0).toLocaleString()} entries`}
              </div>
              {kevLoading ? (
                <div className="space-y-2">
                  {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : paginatedKev.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {paginatedKev.map((kev) => (
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
                  <PaginationControls
                    currentPage={kevSafePage}
                    totalPages={kevTotalPages}
                    pageSize={kevPageSize}
                    totalItems={cisaKev.length}
                    onPageChange={setKevPage}
                    onPageSizeChange={(s) => { setKevPageSize(s); setKevPage(1); }}
                  />
                </>
              ) : (
                <p className="text-center text-muted-foreground py-8">No CISA KEV data loaded yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
            onClick={() => window.location.href = '/support'}
          >
            UPGRADE TO PRO
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}