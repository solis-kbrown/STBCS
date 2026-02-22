import Layout from "@/components/layout";
import Footer from "@/components/footer";
import AnimatedSection from "@/components/animated-section";
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
import { toSlug } from "@shared/schema";
import { ACTOR_MITRE_MAPPING } from "@shared/mitre-attack";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Search, Globe, Users, Target, Skull, Eye, EyeOff,
  ChevronRight, ArrowUpDown, RotateCcw, Download, Loader2, MapPin,
  Calendar, TrendingUp, Lock, Filter, Shield,
  Crosshair, Activity, DollarSign, FileWarning, Link2, Server, Scale
} from "lucide-react";

interface GroupDirectoryEntry {
  name: string;
  victims: number;
  active: boolean;
  type: string | null;
  origin: string | null;
  firstSeen: string | null;
  lastActive: string | null;
  description: string | null;
  aliases: string | null;
  ransomwareAsService: boolean;
  doubleExtortion: boolean;
  dataExfiltration: boolean;
  totalRansomCollected: string | null;
  averageRansom: string | null;
  targetSectors: string | null;
  targetCountries: string | null;
  statusMessage: string | null;
  encryptionMethod: string | null;
  knownCves: string | null;
  malwareFamilies: string | null;
  attackVectors: string | null;
  affiliations: string | null;
  infrastructure: string | null;
  governmentAdvisories: string | null;
  lawEnforcementActions: string | null;
  sectorCount: number;
  countryCount: number;
  ransomDemands: number;
  paidCount: number;
  uniqueSites: number;
  earliestIncident: string | null;
  latestIncident: string | null;
}

type SortOption = "victims" | "name" | "recent" | "oldest";

function formatDate(date: string | null | undefined): string {
  if (!date) return "Unknown";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Unknown";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

function parseField(value: string | null | undefined): string[] {
  if (!value) return [];
  return value.split(/[|,]/).map(s => s.trim()).filter(Boolean);
}

export default function GroupsDirectory() {
  useDocumentTitle(
    "Ransomware Groups Directory | STB Cybersecurity",
    "Browse all tracked ransomware groups with victim counts, activity status, TTPs, and threat intelligence. Click any group for detailed dossier."
  );

  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("victims");
  const [statusFilter, setStatusFilter] = useState("all");
  const [raasFilter, setRaasFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const exportMutation = useExportData();

  const { data: groups, isLoading } = useQuery<GroupDirectoryEntry[]>({
    queryKey: ["/api/ransomware/groups/directory"],
    queryFn: async () => {
      const res = await fetch("/api/ransomware/groups/directory");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    staleTime: 300000,
    refetchInterval: 600000,
  });

  const rawGroups = groups || [];

  const activeFilterCount = [
    statusFilter !== "all",
    raasFilter !== "all",
    sortBy !== "victims",
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setStatusFilter("all");
    setRaasFilter("all");
    setSortBy("victims");
    setSearch("");
    setCurrentPage(1);
  };

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  const filtered = useMemo(() => {
    let result = [...rawGroups];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(g =>
        g.name.toLowerCase().includes(q) ||
        g.aliases?.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q) ||
        g.targetSectors?.toLowerCase().includes(q) ||
        g.targetCountries?.toLowerCase().includes(q) ||
        g.attackVectors?.toLowerCase().includes(q) ||
        g.malwareFamilies?.toLowerCase().includes(q) ||
        g.affiliations?.toLowerCase().includes(q) ||
        g.origin?.toLowerCase().includes(q) ||
        g.type?.toLowerCase().includes(q)
      );
    }

    if (statusFilter === "active") result = result.filter(g => g.active);
    if (statusFilter === "inactive") result = result.filter(g => !g.active);
    if (statusFilter === "seized") result = result.filter(g => g.statusMessage?.toLowerCase().includes("seized") || g.lawEnforcementActions);

    if (raasFilter === "raas") result = result.filter(g => g.ransomwareAsService);
    if (raasFilter === "non-raas") result = result.filter(g => !g.ransomwareAsService);

    result.sort((a, b) => {
      switch (sortBy) {
        case "victims": return b.victims - a.victims;
        case "name": return a.name.localeCompare(b.name);
        case "recent": return new Date(b.lastActive || b.latestIncident || 0).getTime() - new Date(a.lastActive || a.latestIncident || 0).getTime();
        case "oldest": return new Date(a.firstSeen || a.earliestIncident || "9999").getTime() - new Date(b.firstSeen || b.earliestIncident || "9999").getTime();
        default: return 0;
      }
    });

    return result;
  }, [rawGroups, search, sortBy, statusFilter, raasFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const stats = useMemo(() => {
    const total = rawGroups.length;
    const active = rawGroups.filter(g => g.active).length;
    const raas = rawGroups.filter(g => g.ransomwareAsService).length;
    const totalVictims = rawGroups.reduce((sum, g) => sum + g.victims, 0);
    const hasMitre = rawGroups.filter(g => ACTOR_MITRE_MAPPING[g.name.toLowerCase()]).length;
    const withInfra = rawGroups.filter(g => g.infrastructure).length;
    const withAdvisories = rawGroups.filter(g => g.governmentAdvisories).length;
    const doubleExt = rawGroups.filter(g => g.doubleExtortion).length;
    return { total, active, raas, totalVictims, hasMitre, withInfra, withAdvisories, doubleExt };
  }, [rawGroups]);

  useEffect(() => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Dataset",
      "name": "STBCS Ransomware Groups Directory",
      "description": `Threat intelligence directory tracking ${stats.total} ransomware groups with ${stats.totalVictims.toLocaleString()} known victims. Includes group profiles, TTPs, MITRE ATT&CK mapping, and victim data.`,
      "url": "https://stbcybersecurity.com/groups",
      "creator": { "@type": "Organization", "name": "STB Cybersecurity" },
      "keywords": ["ransomware", "threat intelligence", "cybersecurity", "threat actors", "MITRE ATT&CK"],
    };
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, [stats.total, stats.totalVictims]);

  return (
    <Layout>
      <div className="space-y-6 page-transition">
        <AnimatedSection animation="fade-down">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-white mb-2">Ransomware Groups Directory</h1>
              <p className="text-muted-foreground">
                Browse {stats.total > 0 ? stats.total.toLocaleString() : ''} tracked ransomware groups. Click any group for a full intelligence dossier with MITRE ATT&CK mapping, victim data, and TTPs.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10" data-testid="button-export-groups" onClick={() => exportMutation.mutate({ type: 'threat-actors', format: 'json' })} disabled={exportMutation.isPending}>
                {exportMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                Export
              </Button>
            </div>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { icon: Users, label: "Groups", value: stats.total, color: "text-orange-400", bg: "bg-orange-500/10" },
            { icon: Target, label: "Victims", value: stats.totalVictims.toLocaleString(), color: "text-red-400", bg: "bg-red-500/10" },
            { icon: Activity, label: "Active", value: stats.active, color: "text-green-400", bg: "bg-green-500/10" },
            { icon: Skull, label: "RaaS", value: stats.raas, color: "text-purple-400", bg: "bg-purple-500/10" },
            { icon: Crosshair, label: "MITRE", value: stats.hasMitre, color: "text-cyan-400", bg: "bg-cyan-500/10" },
            { icon: Shield, label: "Double Ext.", value: stats.doubleExt, color: "text-yellow-400", bg: "bg-yellow-500/10" },
            { icon: Server, label: "Infra Intel", value: stats.withInfra, color: "text-blue-400", bg: "bg-blue-500/10" },
            { icon: FileWarning, label: "Advisories", value: stats.withAdvisories, color: "text-rose-400", bg: "bg-rose-500/10" },
          ].map((s, i) => (
            <Card key={i} className="border-white/5 bg-card/50">
              <CardContent className="p-2.5 flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${s.bg}`}>
                  <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground leading-tight">{s.label}</p>
                  {isLoading ? <Skeleton className="h-4 w-8 mt-0.5" /> : <p className={`text-sm font-bold ${s.color}`} data-testid={`stat-${s.label.toLowerCase().replace(/[\s.]/g, '-')}`}>{s.value}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-white/5 bg-card/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-stretch">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search groups, aliases, sectors, countries, malware, affiliations..."
                  className="pl-10 bg-background/50 border-white/10 h-10"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  data-testid="input-search-groups"
                />
              </div>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={(v) => { setSortBy(v as SortOption); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[180px] bg-background/50 border-white/10 h-10" data-testid="select-sort">
                    <ArrowUpDown className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="victims">Most Victims</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="oldest">First Seen</SelectItem>
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
                    <Badge className="ml-2 bg-orange-500 text-white text-[10px] h-5 w-5 p-0 flex items-center justify-center rounded-full">{activeFilterCount}</Badge>
                  )}
                </Button>
              </div>
            </div>

            {showFilters && (
              <div className="flex flex-wrap gap-3 pt-2 border-t border-white/5 animate-in slide-in-from-top-2 duration-200">
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[140px] bg-background/50 border-white/10 h-9 text-sm" data-testid="select-status-filter">
                    <Activity className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="seized">Seized / LE Action</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={raasFilter} onValueChange={(v) => { setRaasFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[140px] bg-background/50 border-white/10 h-9 text-sm" data-testid="select-raas-filter">
                    <Skull className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="raas">RaaS Only</SelectItem>
                    <SelectItem value="non-raas">Non-RaaS</SelectItem>
                  </SelectContent>
                </Select>
                {activeFilterCount > 0 && (
                  <Button variant="ghost" size="sm" className="h-9 text-sm text-muted-foreground hover:text-white" onClick={clearAllFilters} data-testid="button-clear-filters">
                    <RotateCcw className="h-3.5 w-3.5 mr-1" /> Clear
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground" data-testid="text-results-count">
            {isLoading ? "Loading..." : `${filtered.length} ransomware group${filtered.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <Card key={i} className="border-white/5 bg-card/50">
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-2"><Skeleton className="h-5 w-16" /><Skeleton className="h-5 w-16" /></div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <Card className="border-white/5 bg-card/50">
            <CardContent className="p-8 text-center">
              <Skull className="h-10 w-10 text-zinc-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">No Groups Found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
              <Button variant="outline" size="sm" className="mt-4 border-white/10" onClick={clearAllFilters} data-testid="button-clear-empty">Clear Filters</Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && paginated.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginated.map((group, idx) => {
              const sectors = parseField(group.targetSectors).slice(0, 3);
              const countries = parseField(group.targetCountries).slice(0, 2);
              const aliasesList = parseField(group.aliases).slice(0, 3);
              const hasMitre = !!ACTOR_MITRE_MAPPING[group.name.toLowerCase()];
              const isSeized = group.statusMessage?.toLowerCase().includes("seized");
              const hasLawEnforcement = !!group.lawEnforcementActions;
              const vectors = parseField(group.attackVectors).slice(0, 2);
              const hasAdvisory = !!group.governmentAdvisories;

              return (
                <Card
                  key={group.name}
                  className={`border-white/5 bg-card/50 hover:border-orange-500/20 transition-all cursor-pointer card-interactive group ${isSeized || hasLawEnforcement ? 'border-red-500/20' : ''}`}
                  style={{ animation: `fadeInLeft 0.3s ease-out ${Math.min(idx * 40, 400)}ms both` }}
                  onClick={() => setLocation(`/group/${toSlug(group.name)}`)}
                  data-testid={`card-group-${toSlug(group.name)}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors truncate" data-testid={`text-group-name-${toSlug(group.name)}`}>
                            {group.name}
                          </h3>
                          {isSeized || hasLawEnforcement ? (
                            <Badge className="bg-red-700 text-white text-[10px] shrink-0"><Lock className="h-2.5 w-2.5 mr-0.5" />{isSeized ? 'Seized' : 'LE Action'}</Badge>
                          ) : group.active ? (
                            <Badge className="bg-green-700/50 text-green-300 text-[10px] border border-green-500/30 shrink-0"><Eye className="h-2.5 w-2.5 mr-0.5" />Active</Badge>
                          ) : (
                            <Badge className="bg-zinc-700/50 text-zinc-400 text-[10px] border border-zinc-500/30 shrink-0"><EyeOff className="h-2.5 w-2.5 mr-0.5" />Inactive</Badge>
                          )}
                        </div>
                        {aliasesList.length > 0 && (
                          <p className="text-[10px] text-zinc-500 mt-0.5 truncate">aka {aliasesList.join(", ")}</p>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-orange-400 transition-colors shrink-0 mt-0.5" />
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                      <div className="bg-white/5 rounded-md p-1.5 text-center">
                        <p className="text-sm font-bold text-red-400" data-testid={`text-victims-${toSlug(group.name)}`}>{group.victims.toLocaleString()}</p>
                        <p className="text-[9px] text-zinc-500">Victims</p>
                      </div>
                      <div className="bg-white/5 rounded-md p-1.5 text-center">
                        <p className="text-xs font-bold text-white">{formatDate(group.firstSeen || group.earliestIncident)}</p>
                        <p className="text-[9px] text-zinc-500">First Seen</p>
                      </div>
                      <div className="bg-white/5 rounded-md p-1.5 text-center">
                        <p className="text-xs font-bold text-zinc-300">{group.type?.replace("Ransomware ", "").slice(0, 10) || "Unknown"}</p>
                        <p className="text-[9px] text-zinc-500">Type</p>
                      </div>
                    </div>

                    {group.description && (
                      <p className="text-[11px] text-zinc-400 line-clamp-2 mb-2">{group.description}</p>
                    )}

                    <div className="flex flex-wrap gap-1 mb-2">
                      {group.ransomwareAsService && (
                        <Badge variant="outline" className="text-[9px] py-0 h-[18px] border-purple-500/30 text-purple-400 bg-purple-500/5">RaaS</Badge>
                      )}
                      {group.doubleExtortion && (
                        <Badge variant="outline" className="text-[9px] py-0 h-[18px] border-red-500/30 text-red-400 bg-red-500/5">Double Extortion</Badge>
                      )}
                      {group.dataExfiltration && (
                        <Badge variant="outline" className="text-[9px] py-0 h-[18px] border-yellow-500/30 text-yellow-400 bg-yellow-500/5">Data Exfil</Badge>
                      )}
                      {hasMitre && (
                        <Badge variant="outline" className="text-[9px] py-0 h-[18px] border-cyan-500/30 text-cyan-400 bg-cyan-500/5">MITRE ATT&CK</Badge>
                      )}
                      {hasAdvisory && (
                        <Badge variant="outline" className="text-[9px] py-0 h-[18px] border-rose-500/30 text-rose-400 bg-rose-500/5">Gov Advisory</Badge>
                      )}
                      {group.encryptionMethod && (
                        <Badge variant="outline" className="text-[9px] py-0 h-[18px] border-zinc-500/30 text-zinc-400 bg-zinc-500/5"><Lock className="h-2.5 w-2.5 mr-0.5" />{group.encryptionMethod.split(",")[0].trim().slice(0, 18)}</Badge>
                      )}
                      {group.infrastructure && (
                        <Badge variant="outline" className="text-[9px] py-0 h-[18px] border-blue-500/30 text-blue-400 bg-blue-500/5"><Server className="h-2.5 w-2.5 mr-0.5" />Infra</Badge>
                      )}
                    </div>

                    {vectors.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {vectors.map((v, i) => (
                          <span key={i} className="text-[9px] text-orange-400/80 bg-orange-500/5 border border-orange-500/10 rounded px-1.5 py-0.5">{v.slice(0, 25)}</span>
                        ))}
                        {parseField(group.attackVectors).length > 2 && (
                          <span className="text-[9px] text-orange-400">+{parseField(group.attackVectors).length - 2}</span>
                        )}
                      </div>
                    )}

                    {(sectors.length > 0 || countries.length > 0) && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {sectors.map((s, i) => (
                          <span key={`s${i}`} className="text-[9px] text-zinc-400 bg-white/5 rounded px-1.5 py-0.5">{s}</span>
                        ))}
                        {parseField(group.targetSectors).length > 3 && (
                          <span className="text-[9px] text-zinc-500">+{parseField(group.targetSectors).length - 3} sectors</span>
                        )}
                        {countries.map((c, i) => (
                          <span key={`c${i}`} className="text-[9px] text-zinc-400 bg-white/5 rounded px-1.5 py-0.5 flex items-center gap-0.5"><Globe className="h-2 w-2" />{c}</span>
                        ))}
                        {parseField(group.targetCountries).length > 2 && (
                          <span className="text-[9px] text-zinc-500">+{parseField(group.targetCountries).length - 2} countries</span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                        {group.origin && group.origin !== "Unknown" && <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{group.origin}</span>}
                        {(group.lastActive || group.latestIncident) && <span className="flex items-center gap-0.5"><TrendingUp className="h-2.5 w-2.5" />Last: {formatDate(group.lastActive || group.latestIncident)}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        {group.totalRansomCollected && (
                          <span className="text-[10px] text-green-400 flex items-center gap-0.5"><DollarSign className="h-2.5 w-2.5" />{group.totalRansomCollected}</span>
                        )}
                        {group.affiliations && (
                          <span className="text-[10px] text-zinc-500 flex items-center gap-0.5"><Link2 className="h-2.5 w-2.5" />Linked</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!isLoading && filtered.length > 0 && (
          <PaginationControls
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
          />
        )}

        <Footer />
      </div>
    </Layout>
  );
}
