import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { DollarSign, TrendingUp, BarChart3, Wallet, AlertTriangle, Users, Building2, Calendar, Bitcoin, Search, RotateCcw, SlidersHorizontal } from "lucide-react";
import { PieChart as PieChartIcon } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";

const CHART_COLORS = ["#f97316", "#f59e0b", "#eab308", "#ef4444", "#10b981", "#3b82f6", "#a855f7", "#ec4899", "#06b6d4", "#84cc16"];

function parseRansomAmount(raw: string | null | undefined): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
}

function truncateWallet(wallet: string): string {
  if (!wallet || wallet.length <= 16) return wallet || "—";
  return `${wallet.slice(0, 8)}…${wallet.slice(-6)}`;
}

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default function RansomwarePaymentsTab() {
  const [groupFilter, setGroupFilter] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/ransomware"],
    queryFn: async () => {
      const res = await fetch("/api/ransomware?limit=2000");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const rawIncidents = data?.data || data?.incidents || [];

  const groups = useMemo(
    () => Array.from(new Set(rawIncidents.map((i: any) => i.groupName).filter(Boolean))).sort() as string[],
    [rawIncidents]
  );
  const sectors = useMemo(
    () => Array.from(new Set(rawIncidents.map((i: any) => i.sector).filter(Boolean))).sort() as string[],
    [rawIncidents]
  );

  const activeFilterCount = [
    groupFilter !== "all",
    sectorFilter !== "all",
    statusFilter !== "all",
    dateRange !== "all",
    searchQuery.length > 0,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setGroupFilter("all");
    setSectorFilter("all");
    setStatusFilter("all");
    setDateRange("all");
    setSearchQuery("");
  };

  const filtered = useMemo(() => {
    let result = [...rawIncidents];
    if (groupFilter !== "all") result = result.filter((i: any) => i.groupName === groupFilter);
    if (sectorFilter !== "all") result = result.filter((i: any) => i.sector === sectorFilter);
    if (statusFilter !== "all") result = result.filter((i: any) => (i.paymentStatus || "unknown").toLowerCase() === statusFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((i: any) =>
        (i.victim || "").toLowerCase().includes(q) ||
        (i.groupName || "").toLowerCase().includes(q) ||
        (i.bitcoinWallet || "").toLowerCase().includes(q)
      );
    }
    if (dateRange !== "all") {
      const now = new Date();
      const cutoff = new Date();
      switch (dateRange) {
        case "7d": cutoff.setDate(now.getDate() - 7); break;
        case "30d": cutoff.setDate(now.getDate() - 30); break;
        case "90d": cutoff.setDate(now.getDate() - 90); break;
        case "1y": cutoff.setFullYear(now.getFullYear() - 1); break;
      }
      result = result.filter((i: any) => new Date(i.discoveredAt || i.createdAt || 0) >= cutoff);
    }
    return result;
  }, [rawIncidents, groupFilter, sectorFilter, statusFilter, dateRange, searchQuery]);

  const paymentIncidents = useMemo(
    () => filtered.filter((i: any) => i.ransomAmount || i.bitcoinWallet || i.paymentStatus),
    [filtered]
  );

  const stats = useMemo(() => {
    const amounts = filtered.map((i: any) => parseRansomAmount(i.ransomAmount)).filter((a: number) => a > 0);
    const totalPayments = amounts.length;
    const totalDemanded = amounts.reduce((s: number, a: number) => s + a, 0);
    const activeWallets = new Set(filtered.filter((i: any) => i.bitcoinWallet).map((i: any) => i.bitcoinWallet)).size;

    const sectorAmounts: Record<string, number> = {};
    filtered.forEach((i: any) => {
      const amt = parseRansomAmount(i.ransomAmount);
      if (amt > 0 && i.sector) {
        sectorAmounts[i.sector] = (sectorAmounts[i.sector] || 0) + amt;
      }
    });
    const topSector = Object.entries(sectorAmounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    const groupCounts: Record<string, number> = {};
    filtered.forEach((i: any) => {
      if (i.groupName && (i.ransomAmount || i.bitcoinWallet || i.paymentStatus)) {
        groupCounts[i.groupName] = (groupCounts[i.groupName] || 0) + 1;
      }
    });
    const topGroup = Object.entries(groupCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    return { totalPayments, totalDemanded, activeWallets, topSector, topGroup };
  }, [filtered]);

  const groupPaymentsData = useMemo(() => {
    const groupMap: Record<string, number> = {};
    filtered.forEach((i: any) => {
      const amt = parseRansomAmount(i.ransomAmount);
      if (amt > 0 && i.groupName) {
        groupMap[i.groupName] = (groupMap[i.groupName] || 0) + amt;
      }
    });
    return Object.entries(groupMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, total]) => ({ name: name.length > 15 ? name.slice(0, 14) + "…" : name, total }));
  }, [filtered]);

  const sectorPaymentsData = useMemo(() => {
    const sectorMap: Record<string, number> = {};
    filtered.forEach((i: any) => {
      const amt = parseRansomAmount(i.ransomAmount);
      if (amt > 0 && i.sector) {
        sectorMap[i.sector] = (sectorMap[i.sector] || 0) + amt;
      }
    });
    return Object.entries(sectorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name: name.length > 20 ? name.slice(0, 19) + "…" : name, value }));
  }, [filtered]);

  const monthlyTrendsData = useMemo(() => {
    const monthMap: Record<string, { total: number; count: number }> = {};
    filtered.forEach((i: any) => {
      const amt = parseRansomAmount(i.ransomAmount);
      if (amt > 0) {
        const date = new Date(i.discoveredAt || i.createdAt || 0);
        if (date.getFullYear() > 2000) {
          const key = getMonthKey(date);
          if (!monthMap[key]) monthMap[key] = { total: 0, count: 0 };
          monthMap[key].total += amt;
          monthMap[key].count += 1;
        }
      }
    });
    return Object.entries(monthMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, d]) => ({ month, total: d.total, count: d.count }));
  }, [filtered]);

  const avgRansomByGroupData = useMemo(() => {
    const groupMap: Record<string, { total: number; count: number }> = {};
    filtered.forEach((i: any) => {
      const amt = parseRansomAmount(i.ransomAmount);
      if (amt > 0 && i.groupName) {
        if (!groupMap[i.groupName]) groupMap[i.groupName] = { total: 0, count: 0 };
        groupMap[i.groupName].total += amt;
        groupMap[i.groupName].count += 1;
      }
    });
    return Object.entries(groupMap)
      .map(([name, d]) => ({ name: name.length > 15 ? name.slice(0, 14) + "…" : name, average: d.total / d.count }))
      .sort((a, b) => b.average - a.average)
      .slice(0, 10);
  }, [filtered]);

  const recentPayments = useMemo(() => {
    return filtered
      .filter((i: any) => i.ransomAmount || i.bitcoinWallet || i.paymentStatus)
      .sort((a: any, b: any) => new Date(b.discoveredAt || b.createdAt || 0).getTime() - new Date(a.discoveredAt || a.createdAt || 0).getTime())
      .slice(0, 50);
  }, [filtered]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm shadow-xl">
          <p className="text-zinc-300 font-medium mb-1">{label}</p>
          {payload.map((p: any, idx: number) => (
            <p key={idx} style={{ color: p.color || "#f97316" }}>
              {p.name}: {typeof p.value === "number" && p.value > 1000 ? formatCurrency(p.value) : p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Failed to Load Data</h2>
          <p className="text-zinc-400 text-sm mb-4">Unable to fetch ransomware payment data. Please try again later.</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-orange-500 hover:bg-orange-600"
            data-testid="button-retry"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card className="border-white/5 bg-card/50">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-stretch">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder="Search by victim, group, or wallet…"
                className="pl-10 bg-background/50 border-white/10 h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-payments"
              />
            </div>
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

          {showFilters && (
            <div className="flex flex-wrap gap-3 pt-2 border-t border-white/5 animate-in slide-in-from-top-2 duration-200">
              <Select value={groupFilter} onValueChange={setGroupFilter}>
                <SelectTrigger className="w-[180px] bg-background/50 border-white/10 h-9 text-sm" data-testid="select-group-filter">
                  <Users className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  {groups.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger className="w-[170px] bg-background/50 border-white/10 h-9 text-sm" data-testid="select-sector-filter">
                  <Building2 className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  {sectors.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] bg-background/50 border-white/10 h-9 text-sm" data-testid="select-status-filter">
                  <DollarSign className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="negotiating">Negotiating</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[150px] bg-background/50 border-white/10 h-9 text-sm" data-testid="select-date-range">
                  <Calendar className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                </SelectContent>
              </Select>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 text-sm text-zinc-400 hover:text-white"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-white/5 bg-card/50 hover:border-orange-500/20 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-zinc-500">Total Known Payments</p>
              <DollarSign className="h-5 w-5 text-orange-500" aria-hidden="true" />
            </div>
            <p className="text-2xl font-display font-bold text-white" data-testid="stat-total-payments">
              {formatCurrency(stats.totalDemanded)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">{stats.totalPayments} incidents with ransom data</p>
          </CardContent>
        </Card>
        <Card className="border-white/5 bg-card/50 hover:border-orange-500/20 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-zinc-500">Active Wallets Tracked</p>
              <Bitcoin className="h-5 w-5 text-orange-500" aria-hidden="true" />
            </div>
            <p className="text-2xl font-display font-bold text-white" data-testid="stat-active-wallets">
              {stats.activeWallets}
            </p>
            <p className="text-xs text-zinc-500 mt-1">unique bitcoin addresses</p>
          </CardContent>
        </Card>
        <Card className="border-white/5 bg-card/50 hover:border-orange-500/20 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-zinc-500">Top Paying Sector</p>
              <Building2 className="h-5 w-5 text-orange-500" aria-hidden="true" />
            </div>
            <p className="text-2xl font-display font-bold text-white truncate" data-testid="stat-top-sector">
              {stats.topSector}
            </p>
            <p className="text-xs text-zinc-500 mt-1">by total ransom amount</p>
          </CardContent>
        </Card>
        <Card className="border-white/5 bg-card/50 hover:border-orange-500/20 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-zinc-500">Most Active Group</p>
              <Wallet className="h-5 w-5 text-orange-500" aria-hidden="true" />
            </div>
            <p className="text-2xl font-display font-bold text-white truncate" data-testid="stat-top-group">
              {stats.topGroup}
            </p>
            <p className="text-xs text-zinc-500 mt-1">most payment activity</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-white/5 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-zinc-200 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-orange-500" aria-hidden="true" />
              Payments by Ransomware Group
            </CardTitle>
          </CardHeader>
          <CardContent>
            {groupPaymentsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={groupPaymentsData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis type="number" tickFormatter={(v: number) => formatCurrency(v)} tick={{ fill: "#71717a", fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="total" name="Total Demanded" fill="#f97316" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-zinc-500 text-sm text-center py-16" data-testid="text-no-group-data">No ransom amount data available</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-zinc-200 flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-orange-500" aria-hidden="true" />
              Payments by Sector
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sectorPaymentsData.length > 0 ? (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={sectorPaymentsData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={50}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={{ stroke: "#52525b" }}
                    >
                      {sectorPaymentsData.map((_entry, idx) => (
                        <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={(value: string) => <span className="text-zinc-400 text-xs">{value}</span>}
                      wrapperStyle={{ paddingTop: 8 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-zinc-500 text-sm text-center py-16" data-testid="text-no-sector-data">No sector payment data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-white/5 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-zinc-200 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-500" aria-hidden="true" />
              Monthly Payment Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyTrendsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrendsData} margin={{ left: 10, right: 20, top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 11 }} />
                  <YAxis yAxisId="left" tickFormatter={(v: number) => formatCurrency(v)} tick={{ fill: "#71717a", fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: "#71717a", fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value: string) => <span className="text-zinc-400 text-xs">{value}</span>}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="total" name="Total Demanded" stroke="#f97316" strokeWidth={2} dot={{ r: 3, fill: "#f97316" }} />
                  <Line yAxisId="right" type="monotone" dataKey="count" name="Incident Count" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: "#f59e0b" }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-zinc-500 text-sm text-center py-16" data-testid="text-no-timeline-data">No timeline data available</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-zinc-200 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-orange-500" aria-hidden="true" />
              Average Ransom by Group
            </CardTitle>
          </CardHeader>
          <CardContent>
            {avgRansomByGroupData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={avgRansomByGroupData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis type="number" tickFormatter={(v: number) => formatCurrency(v)} tick={{ fill: "#71717a", fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="average" name="Average Ransom" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-zinc-500 text-sm text-center py-16" data-testid="text-no-avg-data">No average ransom data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/5 bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-zinc-200 flex items-center gap-2">
            <Wallet className="h-4 w-4 text-orange-500" aria-hidden="true" />
            Recent Payment Activity
            <Badge variant="outline" className="ml-auto text-xs border-zinc-700 text-zinc-400">
              {recentPayments.length} records
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="table-payments">
                <thead>
                  <tr className="border-b border-white/5 text-zinc-500 text-xs uppercase tracking-wider">
                    <th className="text-left py-3 px-3 font-medium">Group</th>
                    <th className="text-left py-3 px-3 font-medium">Victim</th>
                    <th className="text-right py-3 px-3 font-medium">Amount</th>
                    <th className="text-left py-3 px-3 font-medium">Currency</th>
                    <th className="text-left py-3 px-3 font-medium">Wallet</th>
                    <th className="text-center py-3 px-3 font-medium">Status</th>
                    <th className="text-right py-3 px-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((incident: any, idx: number) => {
                    const amt = parseRansomAmount(incident.ransomAmount);
                    const date = incident.discoveredAt ? new Date(incident.discoveredAt) : null;
                    const status = (incident.paymentStatus || "unknown").toLowerCase();
                    return (
                      <tr key={`${incident.id}-${idx}`} className="border-b border-white/5 hover:bg-zinc-800/30 transition-colors" data-testid={`row-payment-${idx}`}>
                        <td className="py-2.5 px-3 text-zinc-300 font-medium">{incident.groupName || "—"}</td>
                        <td className="py-2.5 px-3 text-zinc-400 max-w-[200px] truncate">{incident.victim || "—"}</td>
                        <td className="py-2.5 px-3 text-right text-zinc-200 font-medium">
                          {amt > 0 ? formatCurrency(amt) : "—"}
                        </td>
                        <td className="py-2.5 px-3 text-zinc-400 text-xs">{incident.ransomCurrency || "—"}</td>
                        <td className="py-2.5 px-3 font-mono text-xs text-orange-400/80">
                          {truncateWallet(incident.bitcoinWallet)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Badge
                            variant="outline"
                            className={`text-xs capitalize ${
                              status === "paid" ? "border-red-500/30 text-red-400" :
                              status === "unpaid" ? "border-green-500/30 text-green-400" :
                              status === "negotiating" ? "border-yellow-500/30 text-yellow-400" :
                              "border-zinc-600 text-zinc-500"
                            }`}
                            data-testid={`badge-status-${idx}`}
                          >
                            {status}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-right text-zinc-500 text-xs whitespace-nowrap">
                          {date ? date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-zinc-500 text-sm text-center py-10" data-testid="text-no-payment-data">No payment activity data available</p>
          )}
        </CardContent>
      </Card>

      <div className="flex items-start gap-3 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
        <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-xs text-zinc-500 leading-relaxed" data-testid="text-disclaimer">
          <span className="font-semibold text-zinc-400">Disclaimer:</span> Data based on publicly available information from leak sites.
          Payment amounts and statuses are approximations based on available intelligence. This data should be used for research and threat
          awareness purposes only. STB Cybersecurity does not endorse or encourage ransom payments.
        </p>
      </div>
    </div>
  );
}
