import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { DollarSign, TrendingUp, PieChart as PieChartIcon, BarChart3, Clock, Wallet, AlertTriangle, Filter } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";

const CHART_COLORS = ["#f97316", "#ef4444", "#eab308", "#22c55e", "#3b82f6", "#a855f7"];
const STATUS_COLORS: Record<string, string> = {
  paid: "#ef4444",
  unpaid: "#22c55e",
  negotiating: "#eab308",
  unknown: "#52525b",
};

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

function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default function RansomwarePayments() {
  useDocumentTitle(
    "Ransomware Payments Dashboard | STB Cybersecurity",
    "Track ransomware payment demands, bitcoin wallets, and payment statuses across threat groups. Data from publicly available leak site information."
  );

  const [groupFilter, setGroupFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currencyFilter, setCurrencyFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["/api/ransomware", 500, 0],
    queryFn: async () => {
      const res = await fetch("/api/ransomware?limit=500");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const incidents = data?.incidents || [];

  const groups = useMemo(
    () => Array.from(new Set(incidents.map((i: any) => i.groupName).filter(Boolean))).sort() as string[],
    [incidents]
  );
  const currencies = useMemo(
    () => Array.from(new Set(incidents.map((i: any) => i.ransomCurrency).filter(Boolean))).sort() as string[],
    [incidents]
  );

  const filtered = useMemo(() => {
    let result = [...incidents];
    if (groupFilter !== "all") result = result.filter((i: any) => i.groupName === groupFilter);
    if (statusFilter !== "all") result = result.filter((i: any) => (i.paymentStatus || "unknown").toLowerCase() === statusFilter);
    if (currencyFilter !== "all") result = result.filter((i: any) => i.ransomCurrency === currencyFilter);
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
  }, [incidents, groupFilter, statusFilter, currencyFilter, dateRange]);

  const stats = useMemo(() => {
    const withPaymentData = filtered.filter((i: any) => i.ransomAmount || i.bitcoinWallet || i.paymentStatus);
    const amounts = filtered.map((i: any) => parseRansomAmount(i.ransomAmount)).filter((a: number) => a > 0);
    const totalDemanded = amounts.reduce((s: number, a: number) => s + a, 0);
    const avgRansom = amounts.length > 0 ? totalDemanded / amounts.length : 0;
    const cryptoGroups = new Set(
      filtered.filter((i: any) => i.bitcoinWallet || (i.ransomCurrency && i.ransomCurrency.toLowerCase().includes("btc")))
        .map((i: any) => i.groupName)
    );
    return { totalDemanded, withPaymentData: withPaymentData.length, cryptoGroups: cryptoGroups.size, avgRansom };
  }, [filtered]);

  const topGroupsData = useMemo(() => {
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

  const statusData = useMemo(() => {
    const statusMap: Record<string, number> = {};
    filtered.forEach((i: any) => {
      const s = (i.paymentStatus || "unknown").toLowerCase();
      statusMap[s] = (statusMap[s] || 0) + 1;
    });
    return Object.entries(statusMap).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const walletData = useMemo(() => {
    const wallets: { wallet: string; group: string; amount: number; status: string }[] = [];
    filtered.forEach((i: any) => {
      if (i.bitcoinWallet) {
        wallets.push({
          wallet: i.bitcoinWallet,
          group: i.groupName || "Unknown",
          amount: parseRansomAmount(i.ransomAmount),
          status: (i.paymentStatus || "unknown").toLowerCase(),
        });
      }
    });
    return wallets.slice(0, 50);
  }, [filtered]);

  const timelineData = useMemo(() => {
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm shadow-xl">
          <p className="text-zinc-300 font-medium mb-1">{label}</p>
          {payload.map((p: any, idx: number) => (
            <p key={idx} className="text-orange-400">
              {p.name}: {typeof p.value === "number" && p.value > 1000 ? formatCurrency(p.value) : p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const heroCards = [
    { title: "Total Ransom Demanded", value: formatCurrency(stats.totalDemanded), icon: DollarSign, testId: "stat-total-ransom" },
    { title: "Incidents with Payment Data", value: stats.withPaymentData.toString(), icon: Wallet, testId: "stat-payment-incidents" },
    { title: "Groups Accepting Crypto", value: stats.cryptoGroups.toString(), icon: TrendingUp, testId: "stat-crypto-groups" },
    { title: "Average Ransom", value: formatCurrency(stats.avgRansom), icon: BarChart3, testId: "stat-avg-ransom" },
  ];

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6 animate-in fade-in duration-500">
          <div>
            <Skeleton className="h-8 w-80 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2" data-testid="heading-payments-dashboard">
              Ransomware Payments Dashboard
            </h1>
            <p className="text-muted-foreground">
              Track ransom demands, payment statuses, and cryptocurrency wallets across threat groups.
            </p>
          </div>
        </div>

        <Card className="border-white/5 bg-card/50">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <Filter className="h-4 w-4 text-zinc-500" />
              <Select value={groupFilter} onValueChange={setGroupFilter}>
                <SelectTrigger className="w-[180px] bg-background/50 border-white/10 h-9 text-sm" data-testid="select-group-filter">
                  <SelectValue placeholder="Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  {groups.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] bg-background/50 border-white/10 h-9 text-sm" data-testid="select-status-filter">
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
              <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
                <SelectTrigger className="w-[150px] bg-background/50 border-white/10 h-9 text-sm" data-testid="select-currency-filter">
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Currencies</SelectItem>
                  {currencies.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[150px] bg-background/50 border-white/10 h-9 text-sm" data-testid="select-date-range">
                  <Clock className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
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
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {heroCards.map((card) => (
            <Card key={card.testId} className="border-white/5 bg-card/50 hover:border-orange-500/20 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-zinc-500">{card.title}</p>
                  <card.icon className="h-5 w-5 text-orange-500" />
                </div>
                <p className="text-2xl font-display font-bold text-white" data-testid={card.testId}>
                  {card.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-white/5 bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-zinc-200 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-orange-500" />
                Top 10 Groups by Ransom Demanded
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topGroupsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={topGroupsData} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis type="number" tickFormatter={(v: number) => formatCurrency(v)} tick={{ fill: "#71717a", fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={110} tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="total" name="Total Demanded" fill="#f97316" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-zinc-500 text-sm text-center py-16" data-testid="text-no-bar-data">No ransom amount data available</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-zinc-200 flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-orange-500" />
                Payment Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statusData.length > 0 ? (
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={50}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={{ stroke: "#52525b" }}
                      >
                        {statusData.map((entry, idx) => (
                          <Cell
                            key={entry.name}
                            fill={STATUS_COLORS[entry.name] || CHART_COLORS[idx % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-3 mt-2 justify-center">
                    {statusData.map((entry, idx) => (
                      <div key={entry.name} className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: STATUS_COLORS[entry.name] || CHART_COLORS[idx % CHART_COLORS.length] }}
                        />
                        {entry.name}: {entry.value}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-zinc-500 text-sm text-center py-16" data-testid="text-no-pie-data">No payment status data available</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-white/5 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium text-zinc-200 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              Ransom Demands Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timelineData} margin={{ left: 10, right: 20, top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 11 }} />
                  <YAxis tickFormatter={(v: number) => formatCurrency(v)} tick={{ fill: "#71717a", fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="total" name="Total Demanded" stroke="#f97316" strokeWidth={2} dot={{ r: 3, fill: "#f97316" }} />
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
              <Wallet className="h-4 w-4 text-orange-500" />
              Bitcoin Wallets Observed
              <Badge variant="outline" className="ml-auto text-xs border-zinc-700 text-zinc-400">
                {walletData.length} wallets
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {walletData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="table-wallets">
                  <thead>
                    <tr className="border-b border-white/5 text-zinc-500 text-xs uppercase tracking-wider">
                      <th className="text-left py-3 px-3 font-medium">Wallet Address</th>
                      <th className="text-left py-3 px-3 font-medium">Group</th>
                      <th className="text-right py-3 px-3 font-medium">Amount</th>
                      <th className="text-center py-3 px-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {walletData.map((w, idx) => (
                      <tr key={`${w.wallet}-${idx}`} className="border-b border-white/5 hover:bg-zinc-800/30 transition-colors" data-testid={`row-wallet-${idx}`}>
                        <td className="py-2.5 px-3 font-mono text-xs text-orange-400/80 truncate max-w-[260px]">
                          {w.wallet}
                        </td>
                        <td className="py-2.5 px-3 text-zinc-300">{w.group}</td>
                        <td className="py-2.5 px-3 text-right text-zinc-200 font-medium">
                          {w.amount > 0 ? formatCurrency(w.amount) : "—"}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Badge
                            variant="outline"
                            className={`text-xs capitalize ${
                              w.status === "paid" ? "border-red-500/30 text-red-400" :
                              w.status === "unpaid" ? "border-green-500/30 text-green-400" :
                              w.status === "negotiating" ? "border-yellow-500/30 text-yellow-400" :
                              "border-zinc-600 text-zinc-500"
                            }`}
                          >
                            {w.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-zinc-500 text-sm text-center py-10" data-testid="text-no-wallet-data">No bitcoin wallet data available</p>
            )}
          </CardContent>
        </Card>

        <div className="flex items-start gap-3 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
          <p className="text-xs text-zinc-500 leading-relaxed" data-testid="text-disclaimer">
            <span className="font-semibold text-zinc-400">Disclaimer:</span> Data based on publicly available information from leak sites.
            Payment amounts and statuses are approximations based on available intelligence. This data should be used for research and threat
            awareness purposes only. STB Cybersecurity does not endorse or encourage ransom payments.
          </p>
        </div>
      </div>
      <Footer />
    </Layout>
  );
}