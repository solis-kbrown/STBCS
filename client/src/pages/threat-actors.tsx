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
import {
  Users,
  Search,
  Shield,
  Globe,
  Target,
  Skull,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Filter,
  Activity,
  MapPin,
  Crosshair,
  ArrowUpDown,
  RotateCcw,
  Download,
  Loader2,
} from "lucide-react";
import type { ThreatActor } from "@shared/schema";
import { getActorTechniques, getTacticBreakdown, TACTIC_COLORS, type MitreTechnique } from "@shared/mitre-attack";

type SortOption = "name" | "victims" | "recent" | "ransom";

function parseJsonField(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
    return [];
  } catch {
    return value.split(",").map((s) => s.trim()).filter(Boolean);
  }
}

function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "Unknown";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Unknown";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatCurrency(value: string | null | undefined): string {
  if (!value) return "N/A";
  const num = parseFloat(value.replace(/[^0-9.]/g, ""));
  if (isNaN(num)) return value;
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(0)}K`;
  return `$${num.toLocaleString()}`;
}

const typeBadgeStyles: Record<string, string> = {
  "nation-state": "bg-red-500/20 text-red-400 border-red-500/30",
  "criminal": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "hacktivist": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "unknown": "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

function getTypeBadgeStyle(type: string | null | undefined): string {
  if (!type) return typeBadgeStyles["unknown"];
  return typeBadgeStyles[type.toLowerCase()] || typeBadgeStyles["unknown"];
}

export default function ThreatActors() {
  useDocumentTitle(
    "Threat Actor Profiles | STB Cybersecurity",
    "Browse and analyze threat actor profiles including nation-state groups, criminal organizations, and hacktivists. Track TTPs, malware families, and ransomware operations."
  );

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [originFilter, setOriginFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [raasFilter, setRaasFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const exportMutation = useExportData();
  const { data: actors, isLoading, isError } = useQuery<ThreatActor[]>({
    queryKey: ["/api/threat-actors"],
    queryFn: async () => {
      const res = await fetch("/api/threat-actors?limit=500");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const rawActors = actors || [];

  const origins = useMemo(
    () => Array.from(new Set(rawActors.map((a) => a.origin).filter(Boolean))).sort() as string[],
    [rawActors]
  );

  const activeFilterCount = [
    typeFilter !== "all",
    originFilter !== "all",
    activeFilter !== "all",
    raasFilter !== "all",
    sortBy !== "name",
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setTypeFilter("all");
    setOriginFilter("all");
    setActiveFilter("all");
    setRaasFilter("all");
    setSortBy("name");
    setSearch("");
    setCurrentPage(1);
  };

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  const filteredActors = useMemo(() => {
    let filtered = [...rawActors];

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((a) => {
        const aliases = parseJsonField(a.aliases);
        return (
          a.name.toLowerCase().includes(q) ||
          aliases.some((alias) => alias.toLowerCase().includes(q)) ||
          a.description?.toLowerCase().includes(q)
        );
      });
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((a) => a.type?.toLowerCase() === typeFilter.toLowerCase());
    }

    if (originFilter !== "all") {
      filtered = filtered.filter((a) => a.origin === originFilter);
    }

    if (activeFilter !== "all") {
      filtered = filtered.filter((a) => (activeFilter === "active" ? a.active : !a.active));
    }

    if (raasFilter !== "all") {
      filtered = filtered.filter((a) => (raasFilter === "raas" ? a.ransomwareAsService : !a.ransomwareAsService));
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "victims":
          return (b.totalVictims || 0) - (a.totalVictims || 0);
        case "recent":
          return new Date(b.lastActive || 0).getTime() - new Date(a.lastActive || 0).getTime();
        case "ransom": {
          const aVal = parseFloat((a.totalRansomCollected || "0").replace(/[^0-9.]/g, "")) || 0;
          const bVal = parseFloat((b.totalRansomCollected || "0").replace(/[^0-9.]/g, "")) || 0;
          return bVal - aVal;
        }
        default:
          return 0;
      }
    });

    return filtered;
  }, [rawActors, search, typeFilter, originFilter, activeFilter, raasFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredActors.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedActors = filteredActors.slice((safePage - 1) * pageSize, safePage * pageSize);

  const stats = useMemo(() => {
    const total = rawActors.length;
    const active = rawActors.filter((a) => a.active).length;
    const nationState = rawActors.filter((a) => a.type?.toLowerCase() === "nation-state").length;
    const raas = rawActors.filter((a) => a.ransomwareAsService).length;
    return { total, active, nationState, raas };
  }, [rawActors]);

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">Threat Actor Profiles</h1>
            <p className="text-muted-foreground">
              Browse nation-state groups, criminal organizations, and hacktivists. Analyze TTPs, malware families, and ransomware operations.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10" data-testid="button-export-actors-csv" onClick={() => exportMutation.mutate({ type: 'threat-actors', format: 'csv' })} disabled={exportMutation.isPending}>
              {exportMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              CSV
            </Button>
            <Button variant="outline" className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10" data-testid="button-export-actors-json" onClick={() => exportMutation.mutate({ type: 'threat-actors', format: 'json' })} disabled={exportMutation.isPending}>
              <Download className="h-4 w-4 mr-2" />
              JSON
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-white/5 bg-card/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Users className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Actors</p>
                {isLoading ? (
                  <Skeleton className="h-6 w-12 mt-1" />
                ) : (
                  <p className="text-xl font-bold text-white" data-testid="stat-total-actors">{stats.total}</p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-card/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Activity className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Actors</p>
                {isLoading ? (
                  <Skeleton className="h-6 w-12 mt-1" />
                ) : (
                  <p className="text-xl font-bold text-white" data-testid="stat-active-actors">{stats.active}</p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-card/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Shield className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Nation-State</p>
                {isLoading ? (
                  <Skeleton className="h-6 w-12 mt-1" />
                ) : (
                  <p className="text-xl font-bold text-white" data-testid="stat-nation-state">{stats.nationState}</p>
                )}
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-card/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Skull className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">RaaS Groups</p>
                {isLoading ? (
                  <Skeleton className="h-6 w-12 mt-1" />
                ) : (
                  <p className="text-xl font-bold text-white" data-testid="stat-raas-groups">{stats.raas}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filters */}
        <Card className="border-white/5 bg-card/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-stretch">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, alias, or description..."
                  className="pl-10 bg-background/50 border-white/10 h-10"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  data-testid="input-search-actors"
                />
              </div>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={(v) => { setSortBy(v as SortOption); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[180px] bg-background/50 border-white/10 h-10" data-testid="select-sort-actors">
                    <ArrowUpDown className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="victims">Most Victims</SelectItem>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="ransom">Most Ransom</SelectItem>
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
                <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[160px] bg-background/50 border-white/10 h-9 text-sm" data-testid="select-type-filter">
                    <Shield className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="nation-state">Nation-State</SelectItem>
                    <SelectItem value="criminal">Criminal</SelectItem>
                    <SelectItem value="hacktivist">Hacktivist</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={originFilter} onValueChange={(v) => { setOriginFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[160px] bg-background/50 border-white/10 h-9 text-sm" data-testid="select-origin-filter">
                    <Globe className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Origin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Origins</SelectItem>
                    {origins.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={activeFilter} onValueChange={(v) => { setActiveFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[140px] bg-background/50 border-white/10 h-9 text-sm" data-testid="select-active-filter">
                    <Activity className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={raasFilter} onValueChange={(v) => { setRaasFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[140px] bg-background/50 border-white/10 h-9 text-sm" data-testid="select-raas-filter">
                    <Skull className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="RaaS" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Groups</SelectItem>
                    <SelectItem value="raas">RaaS Only</SelectItem>
                    <SelectItem value="non-raas">Non-RaaS</SelectItem>
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
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground" data-testid="text-results-count">
            {isLoading ? "Loading..." : `${filteredActors.length} threat actor${filteredActors.length !== 1 ? "s" : ""} found`}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-white/5 bg-card/50">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-16 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <Card className="border-red-500/20 bg-red-500/5">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-10 w-10 text-red-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">Failed to Load Threat Actors</h3>
              <p className="text-sm text-muted-foreground">Please try refreshing the page or check back later.</p>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !isError && filteredActors.length === 0 && (
          <Card className="border-white/5 bg-card/50">
            <CardContent className="p-8 text-center">
              <Users className="h-10 w-10 text-zinc-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">No Threat Actors Found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
              <Button variant="outline" size="sm" className="mt-4 border-white/10" onClick={clearAllFilters} data-testid="button-clear-empty">
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Actor Cards Grid */}
        {!isLoading && !isError && paginatedActors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginatedActors.map((actor) => {
              const isExpanded = expandedId === actor.id;
              const aliases = parseJsonField(actor.aliases);
              const sectors = parseJsonField(actor.targetSectors);
              const ttps = parseJsonField(actor.ttps);
              const cves = parseJsonField(actor.knownCves);
              const malware = parseJsonField(actor.malwareFamilies);
              const infra = parseJsonField(actor.infrastructure);
              const affiliationsList = parseJsonField(actor.affiliations);
              const advisories = parseJsonField(actor.governmentAdvisories);
              const lawActions = parseJsonField(actor.lawEnforcementActions);
              const attackVectors = parseJsonField(actor.attackVectors);
              const mirrors = parseJsonField(actor.mirrorUrls);

              return (
                <Card
                  key={actor.id}
                  className={`border-white/5 bg-card/50 hover:border-orange-500/20 transition-colors cursor-pointer ${isExpanded ? "md:col-span-2 xl:col-span-3 border-orange-500/30" : ""}`}
                  onClick={() => setExpandedId(isExpanded ? null : actor.id)}
                  data-testid={`card-actor-${actor.id}`}
                >
                  <CardContent className="p-5">
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-bold text-white truncate" data-testid={`text-actor-name-${actor.id}`}>
                            {actor.name}
                          </h3>
                          <Badge className={`text-[10px] border ${getTypeBadgeStyle(actor.type)}`} data-testid={`badge-type-${actor.id}`}>
                            {actor.type || "Unknown"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          {actor.origin && (
                            <span className="flex items-center gap-1" data-testid={`text-origin-${actor.id}`}>
                              <MapPin className="h-3 w-3" /> {actor.origin}
                            </span>
                          )}
                          <span className={`flex items-center gap-1 ${actor.active ? "text-green-400" : "text-zinc-500"}`} data-testid={`text-status-${actor.id}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${actor.active ? "bg-green-400" : "bg-zinc-500"}`} />
                            {actor.active ? "Active" : "Inactive"}
                          </span>
                          {actor.ransomwareAsService && (
                            <Badge variant="outline" className="text-[10px] border-purple-500/30 text-purple-400">RaaS</Badge>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground shrink-0" data-testid={`button-expand-${actor.id}`}>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>

                    {/* Description Preview */}
                    {actor.description && (
                      <p className={`text-sm text-zinc-400 mb-3 ${isExpanded ? "" : "line-clamp-2"}`} data-testid={`text-description-${actor.id}`}>
                        {actor.description}
                      </p>
                    )}

                    {/* Quick Stats */}
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                      {actor.totalVictims != null && actor.totalVictims > 0 && (
                        <span className="flex items-center gap-1" data-testid={`text-victims-${actor.id}`}>
                          <Target className="h-3 w-3 text-red-400" /> {actor.totalVictims} victims
                        </span>
                      )}
                      {actor.lastActive && (
                        <span className="flex items-center gap-1">
                          <Activity className="h-3 w-3 text-orange-400" /> Last: {formatDate(actor.lastActive)}
                        </span>
                      )}
                      {actor.totalRansomCollected && (
                        <span className="flex items-center gap-1">
                          <Skull className="h-3 w-3 text-yellow-400" /> {formatCurrency(actor.totalRansomCollected)}
                        </span>
                      )}
                    </div>

                    {/* Target Sectors */}
                    {sectors.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {(isExpanded ? sectors : sectors.slice(0, 4)).map((s, i) => (
                          <Badge key={i} variant="outline" className="text-[10px] border-zinc-700 text-zinc-400">
                            {s}
                          </Badge>
                        ))}
                        {!isExpanded && sectors.length > 4 && (
                          <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-500">
                            +{sectors.length - 4} more
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-white/5 space-y-4 animate-in slide-in-from-top-2 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {/* Aliases */}
                          {aliases.length > 0 && (
                            <div>
                              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Aliases</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {aliases.map((a, i) => (
                                  <Badge key={i} variant="outline" className="text-[10px] border-orange-500/20 text-orange-300">{a}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* TTPs */}
                          {ttps.length > 0 && (
                            <div>
                              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">TTPs</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {ttps.map((t, i) => (
                                  <Badge key={i} variant="outline" className="text-[10px] border-blue-500/20 text-blue-300">{t}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Malware Families */}
                          {malware.length > 0 && (
                            <div>
                              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Malware Families</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {malware.map((m, i) => (
                                  <Badge key={i} variant="outline" className="text-[10px] border-red-500/20 text-red-300">{m}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Known CVEs */}
                          {cves.length > 0 && (
                            <div>
                              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Known CVEs</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {cves.map((c, i) => (
                                  <Badge key={i} variant="outline" className="text-[10px] border-yellow-500/20 text-yellow-300 font-mono">{c}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Attack Vectors */}
                          {attackVectors.length > 0 && (
                            <div>
                              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Attack Vectors</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {attackVectors.map((v, i) => (
                                  <Badge key={i} variant="outline" className="text-[10px] border-cyan-500/20 text-cyan-300">{v}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Infrastructure */}
                          {infra.length > 0 && (
                            <div>
                              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Infrastructure</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {infra.map((inf, i) => (
                                  <Badge key={i} variant="outline" className="text-[10px] border-zinc-600 text-zinc-300">{inf}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Affiliations */}
                          {affiliationsList.length > 0 && (
                            <div>
                              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Affiliations</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {affiliationsList.map((af, i) => (
                                  <Badge key={i} variant="outline" className="text-[10px] border-purple-500/20 text-purple-300">{af}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Government Advisories */}
                          {advisories.length > 0 && (
                            <div>
                              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Government Advisories</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {advisories.map((adv, i) => (
                                  <Badge key={i} variant="outline" className="text-[10px] border-amber-500/20 text-amber-300">{adv}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Law Enforcement Actions */}
                          {lawActions.length > 0 && (
                            <div>
                              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Law Enforcement Actions</h4>
                              <div className="flex flex-wrap gap-1.5">
                                {lawActions.map((la, i) => (
                                  <Badge key={i} variant="outline" className="text-[10px] border-emerald-500/20 text-emerald-300">{la}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* MITRE ATT&CK Techniques */}
                        {(() => {
                          const techniques = getActorTechniques(actor.name);
                          if (techniques.length === 0) return null;
                          const tacticBreakdown = getTacticBreakdown(techniques);
                          return (
                            <div>
                              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Shield className="h-3.5 w-3.5 text-orange-400" />
                                MITRE ATT&CK Techniques ({techniques.length})
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                {Object.entries(tacticBreakdown).map(([tactic, techs]) => (
                                  <div key={tactic} className="bg-zinc-900/50 rounded-lg p-3 border border-white/5">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: TACTIC_COLORS[tactic] || '#666' }} />
                                      <span className="text-[11px] font-semibold text-zinc-300">{tactic}</span>
                                      <span className="text-[10px] text-zinc-500 ml-auto">{techs.length}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {techs.map((t) => (
                                        <a
                                          key={t.id}
                                          href={t.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 border border-white/5 text-zinc-400 hover:text-orange-300 hover:border-orange-500/30 transition-colors"
                                          title={t.name}
                                        >
                                          <span className="font-mono">{t.id}</span>
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}

                        {/* Ransom & Operations Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {actor.totalVictims != null && (
                            <div className="bg-zinc-900/50 rounded-lg p-3 border border-white/5">
                              <p className="text-[10px] text-muted-foreground uppercase">Total Victims</p>
                              <p className="text-lg font-bold text-white">{actor.totalVictims}</p>
                            </div>
                          )}
                          {actor.totalRansomCollected && (
                            <div className="bg-zinc-900/50 rounded-lg p-3 border border-white/5">
                              <p className="text-[10px] text-muted-foreground uppercase">Ransom Collected</p>
                              <p className="text-lg font-bold text-white">{formatCurrency(actor.totalRansomCollected)}</p>
                            </div>
                          )}
                          {actor.averageRansom && (
                            <div className="bg-zinc-900/50 rounded-lg p-3 border border-white/5">
                              <p className="text-[10px] text-muted-foreground uppercase">Average Ransom</p>
                              <p className="text-lg font-bold text-white">{formatCurrency(actor.averageRansom)}</p>
                            </div>
                          )}
                          {actor.encryptionMethod && (
                            <div className="bg-zinc-900/50 rounded-lg p-3 border border-white/5">
                              <p className="text-[10px] text-muted-foreground uppercase">Encryption</p>
                              <p className="text-sm font-bold text-white truncate">{actor.encryptionMethod}</p>
                            </div>
                          )}
                        </div>

                        {/* Operational Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {actor.ransomwareNote && (
                            <div>
                              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Ransomware Note</h4>
                              <p className="text-sm text-zinc-400 bg-zinc-900/50 rounded-lg p-3 border border-white/5">{actor.ransomwareNote}</p>
                            </div>
                          )}
                          {actor.negotiationTactics && (
                            <div>
                              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Negotiation Tactics</h4>
                              <p className="text-sm text-zinc-400 bg-zinc-900/50 rounded-lg p-3 border border-white/5">{actor.negotiationTactics}</p>
                            </div>
                          )}
                          {actor.statusMessage && (
                            <div>
                              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Status Message</h4>
                              <p className="text-sm text-zinc-400 bg-zinc-900/50 rounded-lg p-3 border border-white/5">{actor.statusMessage}</p>
                            </div>
                          )}
                        </div>

                        {/* Capability Badges */}
                        <div className="flex flex-wrap gap-2">
                          {actor.doubleExtortion && (
                            <Badge className="bg-red-500/10 text-red-400 border border-red-500/20">Double Extortion</Badge>
                          )}
                          {actor.dataExfiltration && (
                            <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20">Data Exfiltration</Badge>
                          )}
                          {actor.ransomwareAsService && (
                            <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20">RaaS</Badge>
                          )}
                        </div>

                        {/* Timeline & Links */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-white/5">
                          {actor.firstSeen && (
                            <span>First Seen: {formatDate(actor.firstSeen)}</span>
                          )}
                          {actor.lastActive && (
                            <span>Last Active: {formatDate(actor.lastActive)}</span>
                          )}
                          {actor.websiteUrl && (
                            <a
                              href={actor.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-orange-400 hover:text-orange-300 flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                              data-testid={`link-website-${actor.id}`}
                            >
                              <ExternalLink className="h-3 w-3" /> Website
                            </a>
                          )}
                          {actor.profileUrl && (
                            <a
                              href={actor.profileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-orange-400 hover:text-orange-300 flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                              data-testid={`link-profile-${actor.id}`}
                            >
                              <ExternalLink className="h-3 w-3" /> Profile
                            </a>
                          )}
                          {mirrors.length > 0 && (
                            <span className="text-zinc-500">{mirrors.length} mirror URL{mirrors.length !== 1 ? "s" : ""}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && filteredActors.length > 0 && (
          <PaginationControls
            currentPage={safePage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filteredActors.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={handlePageSizeChange}
          />
        )}

        <Footer />
      </div>
    </Layout>
  );
}