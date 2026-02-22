import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useRansomware, useRansomwareGroups, useRansomwareSearch, useExportData, useTrackView, useRansomwareAnalytics } from "@/lib/api";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download, ExternalLink, Globe, Loader2, ArrowUpDown, SlidersHorizontal, Calendar, RotateCcw, ChevronRight, BarChart3, TrendingUp, Users, Target, MapPin, Building2 } from "lucide-react";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo, useCallback, KeyboardEvent } from "react";
import PaginationControls from "@/components/pagination-controls";

type SortOption = "newest" | "oldest" | "group-az" | "group-za" | "status";

export default function Ransomware() {
  useDocumentTitle("Ransomware Tracker | STB Cybersecurity", "Monitor active ransomware groups, victim postings, and attack analytics in real-time. Track LockBit, BlackCat, Cl0p with profiles, TTPs, and targeting data.");
  const [selectedGroup, setSelectedGroup] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [dateRange, setDateRange] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [showAllGroups, setShowAllGroups] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  
  const [, setLocation] = useLocation();
  const { data, isLoading } = useRansomware(1000, 0, selectedGroup);
  const { data: groups } = useRansomwareGroups();
  const trackView = useTrackView();
  const { data: searchResults, isLoading: isSearching } = useRansomwareSearch(activeSearch);
  const { data: analytics } = useRansomwareAnalytics();
  const exportMutation = useExportData();
  
  const handleSearch = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim().length >= 2) {
      setActiveSearch(searchQuery.trim());
      setSelectedGroup(undefined);
      setCurrentPage(1);
    }
  };
  
  const clearSearch = () => {
    setSearchQuery("");
    setActiveSearch("");
    setCurrentPage(1);
  };
  
  const rawIncidents = activeSearch ? (searchResults?.data || []) : (data?.data || []);
  const loading = activeSearch ? isSearching : isLoading;

  const countries = useMemo(() => Array.from(new Set(rawIncidents.map(i => i.country).filter(Boolean))).sort(), [rawIncidents]);
  const sectors = useMemo(() => Array.from(new Set(rawIncidents.map(i => i.sector).filter(Boolean))).sort(), [rawIncidents]);

  const activeFilterCount = [
    sortBy !== "newest",
    dateRange !== "all",
    statusFilter !== "all",
    countryFilter !== "all",
    sectorFilter !== "all",
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSortBy("newest");
    setDateRange("all");
    setStatusFilter("all");
    setCountryFilter("all");
    setSectorFilter("all");
    setCurrentPage(1);
  };

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  const incidents = useMemo(() => {
    let filtered = [...rawIncidents];

    if (statusFilter !== "all") {
      filtered = filtered.filter(i => i.status === statusFilter);
    }

    if (countryFilter !== "all") {
      filtered = filtered.filter(i => i.country === countryFilter);
    }
    if (sectorFilter !== "all") {
      filtered = filtered.filter(i => i.sector === sectorFilter);
    }

    if (dateRange !== "all") {
      const now = new Date();
      const cutoff = new Date();
      switch (dateRange) {
        case "24h": cutoff.setHours(now.getHours() - 24); break;
        case "7d": cutoff.setDate(now.getDate() - 7); break;
        case "30d": cutoff.setDate(now.getDate() - 30); break;
        case "90d": cutoff.setDate(now.getDate() - 90); break;
      }
      filtered = filtered.filter(i => new Date(i.discoveredAt || 0) >= cutoff);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest": return new Date(b.discoveredAt || 0).getTime() - new Date(a.discoveredAt || 0).getTime();
        case "oldest": return new Date(a.discoveredAt || 0).getTime() - new Date(b.discoveredAt || 0).getTime();
        case "group-az": return (a.groupName || "").localeCompare(b.groupName || "");
        case "group-za": return (b.groupName || "").localeCompare(a.groupName || "");
        case "status": return (a.status || "").localeCompare(b.status || "");
        default: return 0;
      }
    });

    return filtered;
  }, [rawIncidents, sortBy, dateRange, statusFilter, countryFilter, sectorFilter]);

  const totalPages = Math.max(1, Math.ceil(incidents.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedIncidents = incidents.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">Ransomware Tracker</h1>
            <p className="text-muted-foreground">Monitor active ransomware groups, victim postings, and negotiation statuses.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button 
              variant="outline" 
              className={`border-orange-500/30 ${showAnalytics ? 'bg-orange-500/20 text-orange-300' : 'text-orange-400'} hover:bg-orange-500/10`}
              data-testid="button-analytics"
              onClick={() => setShowAnalytics(!showAnalytics)}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
             <Button 
              variant="outline" 
              className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10" 
              data-testid="button-export"
              onClick={() => exportMutation.mutate('ransomware')}
              disabled={exportMutation.isPending}
            >
              {exportMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              Export JSON
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90" 
              data-testid="button-report-incident"
              onClick={() => window.location.href = 'mailto:info@stbcybersecurity.com?subject=Ransomware%20Incident%20Report&body=Please%20provide%20details%20about%20the%20ransomware%20incident.'}
            >
              Report Incident
            </Button>
          </div>
        </div>

        {showAnalytics && analytics && (
          <div className="space-y-4" data-testid="section-analytics">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              <Card className="border-white/5 bg-card/40">
                <CardContent className="p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Target className="h-3.5 w-3.5 text-red-400" />
                    <span className="text-[10px] text-zinc-400">Total Victims</span>
                  </div>
                  <p className="text-xl font-bold text-white" data-testid="text-total-incidents">{(analytics.totalVictims || 0).toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="border-white/5 bg-card/40">
                <CardContent className="p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Users className="h-3.5 w-3.5 text-orange-400" />
                    <span className="text-[10px] text-zinc-400">Groups Tracked</span>
                  </div>
                  <p className="text-xl font-bold text-white" data-testid="text-active-groups">{analytics.totalGroups || 0}</p>
                </CardContent>
              </Card>
              <Card className="border-white/5 bg-card/40">
                <CardContent className="p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingUp className="h-3.5 w-3.5 text-green-400" />
                    <span className="text-[10px] text-zinc-400">Active (30d)</span>
                  </div>
                  <p className="text-xl font-bold text-white" data-testid="text-last-30-days">{analytics.activeGroupsLast30d || 0}</p>
                  <p className="text-[9px] text-zinc-500">groups posting</p>
                </CardContent>
              </Card>
              <Card className="border-red-500/20 bg-red-950/20">
                <CardContent className="p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Target className="h-3.5 w-3.5 text-red-500 animate-pulse" />
                    <span className="text-[10px] text-red-300">New Today</span>
                  </div>
                  <p className="text-xl font-bold text-red-400" data-testid="text-new-today">{analytics.newToday || 0}</p>
                  <p className="text-[9px] text-red-300/50">victims posted</p>
                </CardContent>
              </Card>
              <Card className="border-orange-500/20 bg-orange-950/20">
                <CardContent className="p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <BarChart3 className="h-3.5 w-3.5 text-orange-400" />
                    <span className="text-[10px] text-orange-300">This Week</span>
                  </div>
                  <p className="text-xl font-bold text-orange-400" data-testid="text-new-week">{analytics.newThisWeek || 0}</p>
                  <p className="text-[9px] text-orange-300/50">victims</p>
                </CardContent>
              </Card>
              <Card className="border-white/5 bg-card/40">
                <CardContent className="p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <MapPin className="h-3.5 w-3.5 text-yellow-400" />
                    <span className="text-[10px] text-zinc-400">Countries Hit</span>
                  </div>
                  <p className="text-xl font-bold text-white" data-testid="text-countries-hit">{analytics.totalCountries || analytics.topCountries?.length || 0}</p>
                </CardContent>
              </Card>
              <Card className="border-white/5 bg-card/40">
                <CardContent className="p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <BarChart3 className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="text-[10px] text-zinc-400">Daily Avg</span>
                  </div>
                  <p className="text-xl font-bold text-white" data-testid="text-daily-avg">{analytics.avgDailyAttacks || 0}</p>
                  <p className="text-[9px] text-zinc-500">attacks/day</p>
                </CardContent>
              </Card>
            </div>

            {analytics.dailyTrend && analytics.dailyTrend.length > 0 && (
              <Card className="border-white/5 bg-card/40">
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    Daily Attack Activity (Last 30 Days)
                  </h3>
                  <div className="flex items-end gap-[2px] h-32">
                    {analytics.dailyTrend.map((d: { date: string; count: number }, i: number) => {
                      const maxCount = Math.max(...analytics.dailyTrend.map((x: { count: number }) => x.count));
                      const heightPct = maxCount > 0 ? (d.count / maxCount) * 100 : 0;
                      const isToday = d.date === new Date().toISOString().slice(0, 10);
                      return (
                        <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5" data-testid={`bar-daily-${i}`}>
                          <span className="text-[8px] text-zinc-500 hidden md:block">{d.count > 0 ? d.count : ''}</span>
                          <div 
                            className={`w-full rounded-t transition-colors ${isToday ? 'bg-red-500 hover:bg-red-400' : 'bg-orange-500/60 hover:bg-orange-500'}`}
                            style={{ height: `${Math.max(2, heightPct)}%` }}
                            title={`${d.date}: ${d.count} victims posted`}
                          />
                          <span className="text-[7px] text-zinc-600 hidden lg:block">{d.date.slice(8, 10)}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-zinc-600">{analytics.dailyTrend[0]?.date}</span>
                    <span className="text-[9px] text-zinc-600">{analytics.dailyTrend[analytics.dailyTrend.length - 1]?.date}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-white/5 bg-card/40">
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-orange-400" />
                    Top 10 Most Active Groups
                  </h3>
                  <div className="space-y-2">
                    {(analytics.topGroups || []).slice(0, 10).map((g: { name: string; victims: number }, i: number) => (
                      <div key={g.name} className="flex items-center justify-between group cursor-pointer hover:bg-white/5 rounded px-2 py-1 transition-colors"
                        onClick={() => setLocation(`/group/${encodeURIComponent(g.name)}`)}
                        data-testid={`row-top-group-${i}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-500 w-5">{i + 1}.</span>
                          <span className="text-sm text-white group-hover:text-orange-400 transition-colors">{g.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-orange-500 rounded-full" 
                              style={{ width: `${Math.min(100, (g.victims / (analytics.topGroups?.[0]?.victims || 1)) * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-zinc-400 w-8 text-right">{g.victims}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/5 bg-card/40">
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-yellow-400" />
                    Top Targeted Countries
                  </h3>
                  <div className="space-y-2">
                    {(analytics.topCountries || []).slice(0, 10).map((c: { name: string; count: number }, i: number) => (
                      <div key={c.name} className="flex items-center justify-between px-2 py-1" data-testid={`row-top-country-${i}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-500 w-5">{i + 1}.</span>
                          <span className="text-sm text-white">{c.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-yellow-500 rounded-full" 
                              style={{ width: `${Math.min(100, (c.count / (analytics.topCountries?.[0]?.count || 1)) * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-zinc-400 w-8 text-right">{c.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analytics.topSectors && analytics.topSectors.length > 0 && (
                <Card className="border-white/5 bg-card/40">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-400" />
                      Top Targeted Sectors
                    </h3>
                    <div className="space-y-2">
                      {analytics.topSectors.slice(0, 10).map((s: { name: string; count: number }, i: number) => (
                        <div key={s.name} className="flex items-center justify-between px-2 py-1" data-testid={`row-sector-${i}`}>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-zinc-500 w-5">{i + 1}.</span>
                            <span className="text-sm text-white">{s.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full" 
                                style={{ width: `${Math.min(100, (s.count / (analytics.topSectors?.[0]?.count || 1)) * 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-zinc-400 w-8 text-right">{s.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {analytics.monthlyTrend && analytics.monthlyTrend.length > 0 && (
                <Card className="border-white/5 bg-card/40">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-400" />
                      Monthly Attack Trend
                    </h3>
                    <div className="flex items-end gap-1 h-32">
                      {analytics.monthlyTrend.slice(-12).map((m: { month: string; count: number }, i: number) => {
                        const recentData = analytics.monthlyTrend.slice(-12);
                        const maxCount = Math.max(...recentData.map((x: { count: number }) => x.count));
                        const heightPct = maxCount > 0 ? (m.count / maxCount) * 100 : 0;
                        return (
                          <div key={m.month} className="flex-1 flex flex-col items-center gap-1" data-testid={`bar-month-${i}`}>
                            <span className="text-[9px] text-zinc-500">{m.count}</span>
                            <div 
                              className="w-full bg-orange-500/60 rounded-t hover:bg-orange-500 transition-colors" 
                              style={{ height: `${Math.max(2, heightPct)}%` }}
                              title={`${m.month}: ${m.count} incidents`}
                            />
                            <span className="text-[8px] text-zinc-600 -rotate-45 origin-center">{m.month.slice(5, 7)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {analytics.topSourceApis && analytics.topSourceApis.length > 0 && (
              <Card className="border-white/5 bg-card/40">
                <CardContent className="p-4">
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-cyan-400" />
                    Intelligence Sources
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analytics.topSourceApis.map((s: { name: string; count: number }, i: number) => (
                      <Badge key={s.name} variant="outline" className="border-white/10 text-zinc-300 text-xs" data-testid={`badge-source-${i}`}>
                        {s.name} <span className="ml-1 text-cyan-400">({s.count.toLocaleString()})</span>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <Card className="border-white/5 bg-card/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-stretch">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search victims, groups, countries... (press Enter)" 
                  className="pl-10 bg-background/50 border-white/10 h-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                  data-testid="input-search"
                />
                {activeSearch && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                    onClick={clearSearch}
                    data-testid="button-clear-search"
                  >
                    Clear
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={(v) => { setSortBy(v as SortOption); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[170px] bg-background/50 border-white/10 h-10" data-testid="select-sort-ransomware">
                    <ArrowUpDown className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="group-az">Group (A-Z)</SelectItem>
                    <SelectItem value="group-za">Group (Z-A)</SelectItem>
                    <SelectItem value="status">By Status</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  className={`border-white/10 h-10 px-3 ${showFilters ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'text-muted-foreground hover:text-white'}`}
                  onClick={() => setShowFilters(!showFilters)}
                  data-testid="button-toggle-filters"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge className="ml-2 bg-orange-500 text-white text-[10px] h-5 w-5 p-0 flex items-center justify-center rounded-full">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>

            {showFilters && (
              <div className="flex flex-wrap gap-3 pt-2 border-t border-white/5 animate-in slide-in-from-top-2 duration-200">
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[160px] bg-background/50 border-white/10 h-9 text-sm" data-testid="select-status-filter">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                    <SelectItem value="Negotiating">Negotiating</SelectItem>
                    <SelectItem value="Resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateRange} onValueChange={(v) => { setDateRange(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[150px] bg-background/50 border-white/10 h-9 text-sm" data-testid="select-date-range">
                    <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="90d">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={countryFilter} onValueChange={(v) => { setCountryFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[160px] bg-background/50 border-white/10 h-9 text-sm" data-testid="select-country-filter">
                    <MapPin className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    {countries.map(c => (
                      <SelectItem key={c} value={c!}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sectorFilter} onValueChange={(v) => { setSectorFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[160px] bg-background/50 border-white/10 h-9 text-sm" data-testid="select-sector-filter">
                    <Building2 className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Sector" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sectors</SelectItem>
                    {sectors.map(s => (
                      <SelectItem key={s} value={s!}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 text-sm text-muted-foreground hover:text-white"
                    onClick={clearAllFilters}
                    data-testid="button-clear-filters"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
              <Button 
                variant={!selectedGroup ? "default" : "ghost"} 
                size="sm" 
                className={`h-7 text-xs ${!selectedGroup ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border border-white/10 bg-white/5 text-muted-foreground hover:text-white'}`}
                onClick={() => { setSelectedGroup(undefined); setCurrentPage(1); }}
                data-testid="button-filter-all"
              >
                All Groups
              </Button>
              {(showAllGroups ? groups : groups?.slice(0, 8))?.map((g) => (
                <Button 
                  key={g.name}
                  variant={selectedGroup === g.name ? "default" : "ghost"} 
                  size="sm" 
                  className={`h-7 text-xs ${selectedGroup === g.name ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border border-white/10 bg-white/5 text-muted-foreground hover:text-white'}`}
                  onClick={() => { setSelectedGroup(g.name); setCurrentPage(1); }}
                  data-testid={`button-filter-${g.name.replace(/[^a-zA-Z0-9]/g, '')}`}
                >
                  {g.name} ({g.count})
                </Button>
              ))}
              {groups && groups.length > 8 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs text-orange-400 hover:text-orange-300"
                  onClick={() => setShowAllGroups(!showAllGroups)}
                  data-testid="button-show-more-groups"
                >
                  {showAllGroups ? `Show Less` : `+${groups.length - 8} More`}
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span data-testid="text-result-count">
                {incidents.length} incidents{incidents.length !== rawIncidents.length ? ` (filtered from ${rawIncidents.length})` : ''}
                {activeFilterCount > 0 && ` | ${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active`}
              </span>
              <span>{data?.total || 0} total in database</span>
            </div>
          </CardContent>
        </Card>

        {/* Search Results Info */}
        {activeSearch && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Search className="h-4 w-4" />
            <span>Search results for "{activeSearch}" - {incidents.length} results found</span>
          </div>
        )}

        {/* Incidents Grid */}
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <Card key={i} className="border-white/5 bg-card/40">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                      <Skeleton className="h-4 w-full max-w-md" />
                      <div className="flex gap-4">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-4">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : paginatedIncidents.length > 0 ? (
            paginatedIncidents.map((incident) => (
              <Card 
                key={incident.id} 
                className="border-white/5 bg-card/40 hover:bg-card/60 transition-colors group cursor-pointer" 
                data-testid={`card-incident-${incident.id}`}
                onClick={() => trackView.mutate({ contentType: 'ransomware', contentId: incident.id })}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                          {incident.victim}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className="bg-primary/10 text-primary border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors"
                          onClick={(e) => { e.stopPropagation(); setLocation(`/group/${encodeURIComponent(incident.groupName)}`); }}
                          data-testid={`badge-group-${incident.id}`}
                        >
                          {incident.groupName}
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm">{incident.description}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-4 font-mono">
                        {incident.sector && (
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-white/20"></span>
                            {incident.sector}
                          </span>
                        )}
                        {incident.dataSize && (
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-white/20"></span>
                            Data: {incident.dataSize}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-white/20"></span>
                          {incident.discoveredAt ? new Date(incident.discoveredAt).toLocaleDateString() : 'N/A'}
                        </span>
                        {incident.country && (
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-white/20"></span>
                            {incident.country}
                          </span>
                        )}
                        {incident.attackVector && (
                          <span className="flex items-center gap-1 text-orange-400">
                            <span className="w-2 h-2 rounded-full bg-orange-400/50"></span>
                            Vector: {incident.attackVector}
                          </span>
                        )}
                        {incident.website && (
                          <a 
                            href={incident.website.startsWith('http') ? incident.website : `https://${incident.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                            data-testid={`link-website-${incident.id}`}
                          >
                            <Globe className="h-3 w-3" />
                            Website
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      {(incident.ransomAmount || incident.bitcoinWallet || incident.victimRevenue) && (
                        <div className="flex flex-wrap gap-4 text-xs mt-2 pt-2 border-t border-white/5">
                          {incident.ransomAmount && (
                            <span className="flex items-center gap-1 text-red-400">
                              Ransom: {incident.ransomCurrency || '$'}{incident.ransomAmount}
                            </span>
                          )}
                          {incident.paymentStatus && (
                            <span className={`flex items-center gap-1 ${incident.paymentStatus === 'Paid' ? 'text-red-400' : 'text-green-400'}`}>
                              {incident.paymentStatus}
                            </span>
                          )}
                          {incident.victimRevenue && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              Est. Revenue: {incident.victimRevenue}
                            </span>
                          )}
                          {incident.employeeCount && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              Employees: {incident.employeeCount}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end justify-between gap-4 min-w-[160px]">
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={
                          incident.status === "Published" ? "bg-destructive hover:bg-destructive/90" : 
                          incident.status === "Negotiating" ? "bg-yellow-600 hover:bg-yellow-700" : 
                          "bg-secondary hover:bg-secondary/90 text-black"
                        }>
                          {incident.status}
                        </Badge>
                        {incident.activity && (
                          <span className="text-xs text-muted-foreground">{incident.activity}</span>
                        )}
                        {incident.sourceApi && (
                          <span className="text-[10px] text-muted-foreground/60">via {incident.sourceApi}</span>
                        )}
                      </div>
                      {incident.screenshotUrl && (
                        <a 
                          href={incident.screenshotUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                          data-testid={`link-screenshot-${incident.id}`}
                        >
                          View Screenshot
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      <Button 
                        variant="link" 
                        className="text-primary p-0 h-auto font-mono text-xs" 
                        data-testid={`link-view-evidence-${incident.id}`}
                        onClick={() => alert('Evidence viewing requires Pro tier access for security reasons.')}
                      >
                        VIEW EVIDENCE &gt;
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-white/5 bg-card/40">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">
                  {activeSearch ? `No incidents found matching "${activeSearch}".` : activeFilterCount > 0 ? 'No incidents match the current filters. Try adjusting your filters.' : 'No ransomware incidents found. Data will appear after the first refresh cycle.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
        {!loading && incidents.length > 0 && (
          <PaginationControls
            currentPage={safePage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={incidents.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
        <Footer />
      </div>
    </Layout>
  );
}
