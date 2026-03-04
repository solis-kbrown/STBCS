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
import { useState, useMemo } from "react";
import {
  Shield,
  Search,
  AlertTriangle,
  ExternalLink,
  Factory,
  Cpu,
  RotateCcw,
  Activity,
} from "lucide-react";
import type { IcsAdvisory } from "@shared/schema";

type SortOption = "newest" | "oldest" | "severity" | "cvss";

function getSeverityColor(severity: string | null): string {
  switch (severity?.toLowerCase()) {
    case "critical": return "border-red-500/30 text-red-400 bg-red-500/10";
    case "high": return "border-orange-500/30 text-orange-400 bg-orange-500/10";
    case "medium": return "border-yellow-500/30 text-yellow-400 bg-yellow-500/10";
    case "low": return "border-green-500/30 text-green-400 bg-green-500/10";
    default: return "border-zinc-500/30 text-zinc-400 bg-zinc-500/10";
  }
}

function getSeverityOrder(s: string | null): number {
  switch (s?.toLowerCase()) {
    case "critical": return 0;
    case "high": return 1;
    case "medium": return 2;
    case "low": return 3;
    default: return 4;
  }
}

function formatDate(d: string | Date | null): string {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function ICSAdvisories() {
  useDocumentTitle(
    "ICS-CERT Advisories | STB Cybersecurity",
    "CISA ICS-CERT advisories for industrial control systems. Track vulnerabilities in SCADA, PLC, and critical infrastructure systems."
  );

  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const { data, isLoading, isError } = useQuery<{ data: IcsAdvisory[]; total: number }>({
    queryKey: ["/api/ics-advisories"],
    queryFn: async () => {
      const res = await fetch("/api/ics-advisories?limit=500");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const advisories = data?.data || [];

  const vendors = useMemo(() => {
    const set = new Set<string>();
    advisories.forEach(a => { if (a.vendor) set.add(a.vendor); });
    return Array.from(set).sort();
  }, [advisories]);

  const filtered = useMemo(() => {
    let results = [...advisories];
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.advisoryId?.toLowerCase().includes(q) ||
        a.vendor?.toLowerCase().includes(q) ||
        a.product?.toLowerCase().includes(q) ||
        a.cveIds?.toLowerCase().includes(q) ||
        a.summary?.toLowerCase().includes(q)
      );
    }
    if (severityFilter !== "all") {
      results = results.filter(a => a.severity?.toLowerCase() === severityFilter.toLowerCase());
    }
    if (vendorFilter !== "all") {
      results = results.filter(a => a.vendor === vendorFilter);
    }
    switch (sortBy) {
      case "newest":
        results.sort((a, b) => new Date(b.publishedDate || 0).getTime() - new Date(a.publishedDate || 0).getTime());
        break;
      case "oldest":
        results.sort((a, b) => new Date(a.publishedDate || 0).getTime() - new Date(b.publishedDate || 0).getTime());
        break;
      case "severity":
        results.sort((a, b) => getSeverityOrder(a.severity) - getSeverityOrder(b.severity));
        break;
      case "cvss":
        results.sort((a, b) => (b.cvssScore || 0) - (a.cvssScore || 0));
        break;
    }
    return results;
  }, [advisories, search, severityFilter, vendorFilter, sortBy]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const stats = useMemo(() => {
    const critical = advisories.filter(a => a.severity?.toLowerCase() === "critical").length;
    const high = advisories.filter(a => a.severity?.toLowerCase() === "high").length;
    const uniqueVendors = new Set(advisories.map(a => a.vendor).filter(Boolean)).size;
    const avgCvss = advisories.reduce((sum, a) => sum + (a.cvssScore || 0), 0) / (advisories.length || 1);
    return { total: advisories.length, critical, high, uniqueVendors, avgCvss };
  }, [advisories]);

  const resetFilters = () => {
    setSearch("");
    setSeverityFilter("all");
    setVendorFilter("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2" data-testid="text-ics-title">
              ICS-CERT Advisories
            </h1>
            <p className="text-muted-foreground">
              CISA Industrial Control Systems advisories. Track vulnerabilities in SCADA, PLCs, and critical infrastructure.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-white/5 bg-card/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Shield className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Advisories</p>
                <p className="text-xl font-bold text-white" data-testid="stat-total-advisories">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-card/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Critical</p>
                <p className="text-xl font-bold text-red-400" data-testid="stat-critical">{stats.critical}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-card/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Activity className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">High Severity</p>
                <p className="text-xl font-bold text-yellow-400" data-testid="stat-high">{stats.high}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-card/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Factory className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Vendors Affected</p>
                <p className="text-xl font-bold text-white" data-testid="stat-vendors">{stats.uniqueVendors}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search advisories, CVEs, vendors..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="pl-10 bg-background/50 border-zinc-500 h-10"
              data-testid="input-search-ics"
            />
          </div>
          <Select value={severityFilter} onValueChange={(v) => { setSeverityFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[150px] bg-background/50 border-zinc-500 h-10" data-testid="select-severity">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={vendorFilter} onValueChange={(v) => { setVendorFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[180px] bg-background/50 border-zinc-500 h-10" data-testid="select-vendor">
              <SelectValue placeholder="Vendor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vendors</SelectItem>
              {vendors.map(v => (
                <SelectItem key={v} value={v}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => { setSortBy(v as SortOption); setCurrentPage(1); }}>
            <SelectTrigger className="w-[150px] bg-background/50 border-zinc-500 h-10" data-testid="select-sort">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="severity">By Severity</SelectItem>
              <SelectItem value="cvss">By CVSS Score</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" onClick={resetFilters} className="h-10 w-10" data-testid="button-reset-filters" aria-label="Reset filters">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg bg-zinc-800/50" />
            ))}
          </div>
        ) : isError ? (
          <Card className="border-red-500/20 bg-red-500/5">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-400">Failed to load ICS advisories</p>
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="border-white/5 bg-card/50">
            <CardContent className="p-12 text-center">
              <Shield className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No advisories match your search</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Showing {paginated.length} of {filtered.length} advisories
            </p>
            <div className="space-y-3">
              {paginated.map((advisory) => (
                <Card key={advisory.id} className="border-white/5 bg-card/50 hover:border-orange-500/20 transition-colors" data-testid={`card-ics-${advisory.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <Badge variant="outline" className="text-[10px] font-mono border-zinc-600 text-zinc-300">
                            {advisory.advisoryId}
                          </Badge>
                          <Badge className={`text-[10px] ${getSeverityColor(advisory.severity)}`}>
                            {advisory.severity || "Unknown"}
                          </Badge>
                          {advisory.cvssScore != null && advisory.cvssScore > 0 && (
                            <Badge variant="outline" className={`text-[10px] ${advisory.cvssScore >= 9 ? "border-red-500/30 text-red-400" : advisory.cvssScore >= 7 ? "border-orange-500/30 text-orange-400" : "border-zinc-600 text-zinc-400"}`}>
                              CVSS {advisory.cvssScore.toFixed(1)}
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-white mb-1 line-clamp-2" data-testid={`text-ics-title-${advisory.id}`}>
                          {advisory.title}
                        </h3>
                        {advisory.summary && (
                          <p className="text-xs text-zinc-400 line-clamp-2 mb-2">{advisory.summary}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          {advisory.vendor && (
                            <span className="flex items-center gap-1">
                              <Factory className="h-3 w-3" /> {advisory.vendor}
                            </span>
                          )}
                          {advisory.product && (
                            <span className="flex items-center gap-1">
                              <Cpu className="h-3 w-3" /> {advisory.product}
                            </span>
                          )}
                          {advisory.publishedDate && (
                            <span>{formatDate(advisory.publishedDate)}</span>
                          )}
                          {advisory.cveIds && (
                            <span className="text-orange-400 font-mono text-[10px]">{advisory.cveIds}</span>
                          )}
                        </div>
                      </div>
                      {advisory.sourceUrl && (
                        <a href={advisory.sourceUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-orange-400" data-testid={`button-link-${advisory.id}`} aria-label="Open advisory">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {totalPages > 1 && (
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={filtered.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={() => {}}
              />
            )}
          </>
        )}
      </div>
      <Footer />
    </Layout>
  );
}
