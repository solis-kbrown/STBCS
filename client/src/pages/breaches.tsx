import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PaginationControls from "@/components/pagination-controls";
import { useQuery } from "@tanstack/react-query";
import { useExportData } from "@/lib/api";
import { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import {
  ShieldOff,
  Search,
  Database,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Filter,
  Crown,
  ArrowUpDown,
  RotateCcw,
  Download,
  Loader2,
  Lock,
} from "lucide-react";
import type { BreachIncident } from "@shared/schema";

type SortOption = "newest" | "oldest" | "most-records";

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

function parseDataClasses(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatDate(d: string | Date | null | undefined): string {
  if (!d) return "Unknown";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

const DATA_TYPE_OPTIONS = [
  "Email addresses",
  "Passwords",
  "Usernames",
  "IP addresses",
  "Phone numbers",
  "Physical addresses",
  "Names",
  "Dates of birth",
];

export default function Breaches() {
  useDocumentTitle(
    "Breach Database | STB Cybersecurity",
    "Search known data breaches, compromised accounts, and exposed credentials. Track breach incidents with verified status and affected data types."
  );

  const { isPro, isBusiness } = useAuth();
  const canExport = isPro || isBusiness;
  const exportMutation = useExportData();
  const [search, setSearch] = useState("");
  const [domainSearch, setDomainSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [dataTypeFilter, setDataTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/breaches", 1000, 0, search],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "1000", offset: "0" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/breaches?${params}`);
      if (!res.ok) throw new Error("Failed to fetch breaches");
      return res.json() as Promise<{ data: BreachIncident[]; total: number }>;
    },
  });

  const rawBreaches: BreachIncident[] = data?.data || [];

  const activeFilterCount = [
    verifiedOnly,
    dataTypeFilter !== "all",
    dateRange !== "all",
    sortBy !== "newest",
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setVerifiedOnly(false);
    setDataTypeFilter("all");
    setDateRange("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  const toggleCard = (id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const breaches = useMemo(() => {
    let filtered = [...rawBreaches];

    if (verifiedOnly) {
      filtered = filtered.filter((b) => b.isVerified);
    }

    if (dataTypeFilter !== "all") {
      filtered = filtered.filter((b) => {
        const classes = parseDataClasses(b.dataClasses);
        return classes.some((c) => c.toLowerCase().includes(dataTypeFilter.toLowerCase()));
      });
    }

    if (dateRange !== "all") {
      const now = new Date();
      const cutoff = new Date();
      switch (dateRange) {
        case "30d": cutoff.setDate(now.getDate() - 30); break;
        case "90d": cutoff.setDate(now.getDate() - 90); break;
        case "1y": cutoff.setFullYear(now.getFullYear() - 1); break;
        case "3y": cutoff.setFullYear(now.getFullYear() - 3); break;
      }
      filtered = filtered.filter((b) => new Date(b.breachDate || b.addedDate || 0) >= cutoff);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.breachDate || b.addedDate || 0).getTime() - new Date(a.breachDate || a.addedDate || 0).getTime();
        case "oldest":
          return new Date(a.breachDate || a.addedDate || 0).getTime() - new Date(b.breachDate || b.addedDate || 0).getTime();
        case "most-records":
          return (parseInt(b.pwnCount || "0", 10) || 0) - (parseInt(a.pwnCount || "0", 10) || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [rawBreaches, verifiedOnly, dataTypeFilter, dateRange, sortBy]);

  const totalPages = Math.max(1, Math.ceil(breaches.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedBreaches = breaches.slice((safePage - 1) * pageSize, safePage * pageSize);

  const stats = useMemo(() => {
    const totalRecords = rawBreaches.reduce((sum, b) => sum + (parseInt(b.pwnCount || "0", 10) || 0), 0);
    const verifiedCount = rawBreaches.filter((b) => b.isVerified).length;
    const latestBreach = rawBreaches.length > 0
      ? rawBreaches.reduce((latest, b) => {
          const d = new Date(b.breachDate || b.addedDate || 0);
          return d > new Date(latest.breachDate || latest.addedDate || 0) ? b : latest;
        })
      : null;
    return { total: rawBreaches.length, totalRecords, verifiedCount, latestBreach };
  }, [rawBreaches]);

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2" data-testid="text-breaches-title">Breach Database</h1>
            <p className="text-muted-foreground">
              Search known data breaches, compromised accounts, and exposed credentials across thousands of incidents.
            </p>
          </div>
          <div className="flex gap-2">
            {canExport ? (
              <>
                <Button variant="outline" className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10" data-testid="button-export-breaches-csv" onClick={() => exportMutation.mutate({ type: 'breaches', format: 'csv' })} disabled={exportMutation.isPending}>
                  {exportMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                  CSV
                </Button>
                <Button variant="outline" className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10" data-testid="button-export-breaches-json" onClick={() => exportMutation.mutate({ type: 'breaches', format: 'json' })} disabled={exportMutation.isPending}>
                  <Download className="h-4 w-4 mr-2" />
                  JSON
                </Button>
              </>
            ) : (
              <Button variant="outline" className="border-zinc-700 text-zinc-500 cursor-not-allowed" disabled data-testid="button-export-breaches-locked">
                <Lock className="h-4 w-4 mr-2" />
                Export (Pro)
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-white/5 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Database className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Breaches</p>
                  {isLoading ? (
                    <Skeleton className="h-6 w-16 mt-1" />
                  ) : (
                    <p className="text-xl font-bold text-white" data-testid="text-stat-total-breaches">
                      {formatNumber(stats.total)}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <Users className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Records Exposed</p>
                  {isLoading ? (
                    <Skeleton className="h-6 w-24 mt-1" />
                  ) : (
                    <p className="text-xl font-bold text-white" data-testid="text-stat-total-records">
                      {formatNumber(stats.totalRecords)}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Verified Breaches</p>
                  {isLoading ? (
                    <Skeleton className="h-6 w-16 mt-1" />
                  ) : (
                    <p className="text-xl font-bold text-white" data-testid="text-stat-verified">
                      {formatNumber(stats.verifiedCount)}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Calendar className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Latest Breach</p>
                  {isLoading ? (
                    <Skeleton className="h-6 w-20 mt-1" />
                  ) : (
                    <p className="text-sm font-bold text-white truncate" data-testid="text-stat-latest">
                      {stats.latestBreach ? stats.latestBreach.name : "N/A"}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Domain Search (Pro) */}
        <Card className="border-orange-500/20 bg-orange-500/5">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-orange-400" />
                <span className="text-sm font-medium text-white">Domain Search</span>
                <Badge className="bg-orange-500/20 text-orange-400 text-[10px] border-orange-500/30">
                  <Crown className="h-3 w-3 mr-1" />
                  PRO
                </Badge>
              </div>
              <div className="flex-1 flex gap-2 w-full sm:w-auto">
                <Input
                  placeholder="Search by domain (e.g., example.com)"
                  className="bg-background/50 border-orange-500/20 h-9 text-sm"
                  value={domainSearch}
                  onChange={(e) => setDomainSearch(e.target.value)}
                  data-testid="input-domain-search"
                />
                <Button
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-white h-9"
                  disabled={!domainSearch.trim()}
                  data-testid="button-domain-search"
                >
                  <Search className="h-3.5 w-3.5 mr-1" />
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card className="border-white/5 bg-card/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-stretch">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search breaches by name..."
                  className="pl-10 bg-background/50 border-white/10 h-10"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  data-testid="input-search-breaches"
                />
              </div>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={(v) => { setSortBy(v as SortOption); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[180px] bg-background/50 border-white/10 h-10" data-testid="select-sort-breaches">
                    <ArrowUpDown className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="most-records">Most Records</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  className={`border-white/10 h-10 px-3 ${showFilters ? "bg-orange-500/20 text-orange-400 border-orange-500/30" : "text-muted-foreground hover:text-white"}`}
                  onClick={() => setShowFilters(!showFilters)}
                  data-testid="button-toggle-filters"
                >
                  <Filter className="h-4 w-4 mr-2" />
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
                <Button
                  variant={verifiedOnly ? "default" : "outline"}
                  size="sm"
                  className={`h-9 text-sm ${verifiedOnly ? "bg-green-600 hover:bg-green-700 text-white" : "border-white/10 text-muted-foreground hover:text-white"}`}
                  onClick={() => { setVerifiedOnly(!verifiedOnly); setCurrentPage(1); }}
                  data-testid="button-verified-filter"
                >
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  Verified Only
                </Button>

                <Select value={dataTypeFilter} onValueChange={(v) => { setDataTypeFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[180px] bg-background/50 border-white/10 h-9 text-sm" data-testid="select-data-type-filter">
                    <ShieldOff className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Data Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Data Types</SelectItem>
                    {DATA_TYPE_OPTIONS.map((dt) => (
                      <SelectItem key={dt} value={dt}>{dt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={dateRange} onValueChange={(v) => { setDateRange(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[150px] bg-background/50 border-white/10 h-9 text-sm" data-testid="select-date-range">
                    <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="90d">Last 90 Days</SelectItem>
                    <SelectItem value="1y">Last Year</SelectItem>
                    <SelectItem value="3y">Last 3 Years</SelectItem>
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
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span data-testid="text-results-count">
            {isLoading ? "Loading..." : `${formatNumber(breaches.length)} breach${breaches.length !== 1 ? "es" : ""} found`}
          </span>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-red-500/20 bg-red-500/5">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-3" />
              <p className="text-red-400 font-medium" data-testid="text-error-message">Failed to load breach data</p>
              <p className="text-sm text-muted-foreground mt-1">Please try again later or contact support.</p>
            </CardContent>
          </Card>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="border-white/5 bg-card/50">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-6 w-24" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-5 w-14" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Breach Cards */}
        {!isLoading && !error && (
          <div className="space-y-3">
            {paginatedBreaches.length === 0 ? (
              <Card className="border-white/5 bg-card/50">
                <CardContent className="p-8 text-center">
                  <ShieldOff className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground" data-testid="text-no-results">No breaches found matching your criteria.</p>
                </CardContent>
              </Card>
            ) : (
              paginatedBreaches.map((breach) => {
                const dataClasses = parseDataClasses(breach.dataClasses);
                const pwnCount = parseInt(breach.pwnCount || "0", 10) || 0;
                const isExpanded = expandedCards.has(breach.id);

                return (
                  <Card
                    key={breach.id}
                    className="border-white/5 bg-card/50 hover:border-orange-500/20 transition-colors"
                    data-testid={`card-breach-${breach.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold text-white truncate" data-testid={`text-breach-name-${breach.id}`}>
                              {breach.name}
                            </h3>
                            {breach.isVerified && (
                              <Badge className="bg-green-500/20 text-green-400 text-[10px] border-green-500/30" data-testid={`badge-verified-${breach.id}`}>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                            {breach.isSensitive && (
                              <Badge className="bg-red-500/20 text-red-400 text-[10px] border-red-500/30">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Sensitive
                              </Badge>
                            )}
                            {breach.isFabricated && (
                              <Badge className="bg-yellow-500/20 text-yellow-400 text-[10px] border-yellow-500/30">
                                Fabricated
                              </Badge>
                            )}
                            {breach.isSpamList && (
                              <Badge className="bg-zinc-500/20 text-zinc-400 text-[10px] border-zinc-500/30">
                                Spam List
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground flex-wrap">
                            {breach.domain && (
                              <span className="flex items-center gap-1" data-testid={`text-breach-domain-${breach.id}`}>
                                <ExternalLink className="h-3 w-3" />
                                {breach.domain}
                              </span>
                            )}
                            <span className="flex items-center gap-1" data-testid={`text-breach-date-${breach.id}`}>
                              <Calendar className="h-3 w-3" />
                              {formatDate(breach.breachDate)}
                            </span>
                            <span className="flex items-center gap-1" data-testid={`text-breach-records-${breach.id}`}>
                              <Users className="h-3 w-3" />
                              {formatNumber(pwnCount)} records
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="text-lg font-bold text-orange-400" style={{ fontVariantNumeric: "tabular-nums" }}>
                              {pwnCount >= 1000000
                                ? `${(pwnCount / 1000000).toFixed(1)}M`
                                : pwnCount >= 1000
                                  ? `${(pwnCount / 1000).toFixed(0)}K`
                                  : formatNumber(pwnCount)}
                            </p>
                            <p className="text-[10px] text-muted-foreground">accounts</p>
                          </div>
                        </div>
                      </div>

                      {dataClasses.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3" data-testid={`badges-data-classes-${breach.id}`}>
                          {dataClasses.slice(0, isExpanded ? undefined : 6).map((dc) => (
                            <Badge
                              key={dc}
                              variant="outline"
                              className="text-[10px] border-white/10 text-zinc-400 bg-zinc-800/50"
                            >
                              {dc}
                            </Badge>
                          ))}
                          {!isExpanded && dataClasses.length > 6 && (
                            <Badge variant="outline" className="text-[10px] border-orange-500/20 text-orange-400">
                              +{dataClasses.length - 6} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {breach.description && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 h-7 text-xs text-muted-foreground hover:text-white px-2"
                          onClick={() => toggleCard(breach.id)}
                          data-testid={`button-expand-${breach.id}`}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="h-3 w-3 mr-1" />
                              Hide Details
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3 w-3 mr-1" />
                              Show Details
                            </>
                          )}
                        </Button>
                      )}

                      {isExpanded && breach.description && (
                        <div className="mt-3 pt-3 border-t border-white/5 animate-in slide-in-from-top-2 duration-200">
                          <p
                            className="text-sm text-zinc-400 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: breach.description }}
                            data-testid={`text-breach-description-${breach.id}`}
                          />
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            {breach.addedDate && (
                              <span>Added: {formatDate(breach.addedDate)}</span>
                            )}
                            {breach.modifiedDate && (
                              <span>Modified: {formatDate(breach.modifiedDate)}</span>
                            )}
                            {breach.sourceUrl && (
                              <a
                                href={breach.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-orange-400 hover:text-orange-300 flex items-center gap-1"
                                data-testid={`link-source-${breach.id}`}
                              >
                                <ExternalLink className="h-3 w-3" />
                                Source
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && breaches.length > 0 && (
          <PaginationControls
            currentPage={safePage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={breaches.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={handlePageSizeChange}
          />
        )}

        <Footer />
      </div>
    </Layout>
  );
}