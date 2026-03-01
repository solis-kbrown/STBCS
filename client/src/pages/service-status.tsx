import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useDocumentTitle } from "@/lib/use-document-title";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, CheckCircle2, AlertTriangle, XCircle, Cloud, Globe, Server, Shield, Lock, Wifi, Mail, Code, Database, MonitorCheck, Zap, Radio } from "lucide-react";
import AnimatedSection from "@/components/animated-section";
import { useState } from "react";

interface ServiceStatus {
  name: string;
  category: string;
  status: "operational" | "degraded" | "outage" | "unknown";
  description: string;
  lastUpdated: string | null;
  url: string;
}

const CATEGORIES: Record<string, { label: string; icon: typeof Shield; color: string }> = {
  stbcs: { label: "STB Cybersecurity", icon: Shield, color: "text-orange-400" },
  cloud: { label: "Cloud Providers", icon: Cloud, color: "text-blue-400" },
  cdn_dns: { label: "CDN & DNS", icon: Globe, color: "text-green-400" },
  security: { label: "Security & Observability", icon: Lock, color: "text-red-400" },
  communication: { label: "Communication", icon: Mail, color: "text-purple-400" },
  development: { label: "Development & DevOps", icon: Code, color: "text-cyan-400" },
  hosting: { label: "Hosting & Platforms", icon: Server, color: "text-yellow-400" },
  infrastructure: { label: "Infrastructure & Payments", icon: Database, color: "text-emerald-400" },
};

function getStatusColor(status: string) {
  switch (status) {
    case "operational": return "text-green-400";
    case "degraded": return "text-yellow-400";
    case "outage": return "text-red-400";
    default: return "text-zinc-400";
  }
}

function getStatusBg(status: string) {
  switch (status) {
    case "operational": return "border-green-500/20";
    case "degraded": return "border-yellow-500/20";
    case "outage": return "border-red-500/20";
    default: return "border-zinc-700/30";
  }
}

function StatusDot({ status }: { status: string }) {
  const color = status === "operational" ? "bg-green-500" : status === "degraded" ? "bg-yellow-500" : status === "outage" ? "bg-red-500" : "bg-zinc-500";
  return (
    <span className="relative flex h-2.5 w-2.5">
      {status === "operational" && <span className={`absolute inline-flex h-full w-full rounded-full ${color} opacity-40 animate-ping`} />}
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${color}`} />
    </span>
  );
}

export default function ServiceStatusPage() {
  useDocumentTitle("Service Status | STB Cybersecurity", "Real-time status monitoring for STBCS services, major cloud providers, CDNs, security platforms, and critical internet infrastructure.");
  const [filter, setFilter] = useState<string>("all");

  const { data, isLoading, isError, refetch, isFetching } = useQuery<ServiceStatus[]>({
    queryKey: ["/api/tools/service-status"],
    queryFn: async () => {
      const res = await fetch("/api/tools/service-status");
      if (!res.ok) throw new Error("Failed to fetch service status");
      return res.json();
    },
    refetchInterval: 60000,
  });

  const services = data || [];
  const operationalCount = services.filter(s => s.status === "operational").length;
  const degradedCount = services.filter(s => s.status === "degraded").length;
  const outageCount = services.filter(s => s.status === "outage").length;
  const unknownCount = services.filter(s => s.status === "unknown").length;
  const overallStatus = outageCount > 0 ? "outage" : degradedCount > 0 ? "degraded" : operationalCount > 0 ? "operational" : "unknown";

  const categories = Object.keys(CATEGORIES);
  const filteredServices = filter === "all" ? services : services.filter(s => s.category === filter);
  const grouped = categories.reduce<Record<string, ServiceStatus[]>>((acc, cat) => {
    const items = filteredServices.filter(s => s.category === cat);
    if (items.length > 0) acc[cat] = items;
    return acc;
  }, {});

  return (
    <Layout>
      <div className="space-y-6 page-transition">
        <AnimatedSection animation="fade-up">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-display font-bold text-white tracking-wide flex items-center gap-3" data-testid="text-page-title">
                <MonitorCheck className="h-7 w-7 text-orange-500" />
                Service Status
              </h1>
              <p className="text-sm text-zinc-400 mt-1">
                Real-time monitoring of {services.length} services across STBCS, cloud providers, and critical infrastructure
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 btn-press"
              onClick={() => refetch()}
              disabled={isFetching}
              data-testid="button-refresh-status"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" stagger={1}>
          <Card className={`bg-zinc-900/50 ${overallStatus === "operational" ? "border-green-500/30" : overallStatus === "degraded" ? "border-yellow-500/30" : overallStatus === "outage" ? "border-red-500/30" : "border-zinc-700"}`} data-testid="card-overall-status">
            <CardContent className="py-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <StatusDot status={overallStatus} />
                  <div>
                    <h2 className="text-lg font-display font-bold text-white" data-testid="text-overall-status">
                      {overallStatus === "operational" && "All Systems Operational"}
                      {overallStatus === "degraded" && "Some Systems Degraded"}
                      {overallStatus === "outage" && "System Outages Detected"}
                      {overallStatus === "unknown" && "Checking Status..."}
                    </h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Auto-refreshes every 60 seconds
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-green-400"><span className="w-2 h-2 rounded-full bg-green-500" />{operationalCount} operational</span>
                  {degradedCount > 0 && <span className="flex items-center gap-1.5 text-yellow-400"><span className="w-2 h-2 rounded-full bg-yellow-500" />{degradedCount} degraded</span>}
                  {outageCount > 0 && <span className="flex items-center gap-1.5 text-red-400"><span className="w-2 h-2 rounded-full bg-red-500" />{outageCount} outage</span>}
                  {unknownCount > 0 && <span className="flex items-center gap-1.5 text-zinc-400"><span className="w-2 h-2 rounded-full bg-zinc-500" />{unknownCount} unknown</span>}
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" stagger={2}>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
              className={filter === "all" ? "bg-orange-600 hover:bg-orange-500 text-white" : "border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"}
              data-testid="button-filter-all"
            >
              <Radio className="h-3 w-3 mr-1.5" />All ({services.length})
            </Button>
            {categories.map(cat => {
              const catInfo = CATEGORIES[cat];
              const count = services.filter(s => s.category === cat).length;
              if (count === 0) return null;
              const Icon = catInfo.icon;
              return (
                <Button
                  key={cat}
                  variant={filter === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(cat)}
                  className={filter === cat ? "bg-orange-600 hover:bg-orange-500 text-white" : "border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"}
                  data-testid={`button-filter-${cat}`}
                >
                  <Icon className="h-3 w-3 mr-1.5" />{catInfo.label} ({count})
                </Button>
              );
            })}
          </div>
        </AnimatedSection>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i}>
                <Skeleton className="h-6 w-40 mb-3" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {Array(4).fill(0).map((_, j) => (
                    <Card key={j} className="border-zinc-800 bg-zinc-900/50">
                      <CardContent className="p-4">
                        <Skeleton className="h-4 w-28 mb-2" />
                        <Skeleton className="h-3 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <Card className="border-red-500/20 bg-zinc-900/50" data-testid="card-error">
            <CardContent className="p-8 text-center">
              <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Failed to Load Status</h3>
              <p className="text-zinc-400 text-sm mb-4">Unable to fetch service status. Please try again.</p>
              <Button variant="outline" className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10" onClick={() => refetch()} data-testid="button-retry">
                <RefreshCw className="h-4 w-4 mr-2" />Retry
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([cat, items]) => {
              const catInfo = CATEGORIES[cat];
              if (!catInfo) return null;
              const Icon = catInfo.icon;
              const allOp = items.every(s => s.status === "operational");
              return (
                <AnimatedSection key={cat} animation="fade-up">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-display font-bold text-white tracking-wider uppercase flex items-center gap-2" data-testid={`text-category-${cat}`}>
                      <Icon className={`h-4 w-4 ${catInfo.color}`} />
                      {catInfo.label}
                    </h3>
                    {allOp && (
                      <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-400">
                        <CheckCircle2 className="h-3 w-3 mr-1" />All Operational
                      </Badge>
                    )}
                  </div>
                  <div className={`grid grid-cols-1 ${cat === "stbcs" ? "md:grid-cols-2 lg:grid-cols-5" : "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"} gap-3`}>
                    {items.map((service, i) => (
                      <Card
                        key={service.name}
                        className={`bg-zinc-900/50 hover:bg-zinc-800/50 transition-all duration-200 ${getStatusBg(service.status)} ${cat === "stbcs" ? "border-orange-500/20" : ""}`}
                        data-testid={`card-service-${cat}-${i}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className={`text-sm font-semibold ${cat === "stbcs" ? "text-orange-400" : "text-white"}`}>
                              {service.name}
                            </h4>
                            <StatusDot status={service.status} />
                          </div>
                          <p className="text-[11px] text-zinc-500 line-clamp-2 mb-2 leading-relaxed">{service.description}</p>
                          <div className="flex items-center justify-between">
                            <Badge
                              variant="outline"
                              className={`text-[9px] px-1.5 py-0 ${
                                service.status === "operational" ? "border-green-500/30 text-green-400" :
                                service.status === "degraded" ? "border-yellow-500/30 text-yellow-400" :
                                service.status === "outage" ? "border-red-500/30 text-red-400" :
                                "border-zinc-600 text-zinc-400"
                              }`}
                            >
                              {service.status === "operational" ? "Operational" : service.status === "degraded" ? "Degraded" : service.status === "outage" ? "Outage" : "Unknown"}
                            </Badge>
                            {service.url && (
                              <a
                                href={service.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-orange-400/70 hover:text-orange-400 transition-colors"
                              >
                                Status →
                              </a>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        )}

        <AnimatedSection animation="fade-up">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="py-5">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-sm font-display font-bold text-white mb-1">Monitor Your Own Services</h3>
                  <p className="text-xs text-zinc-400">
                    Set up custom uptime monitors, SSL certificate tracking, and dark web scanning for your own infrastructure.
                    Get instant email and SMS alerts when issues arise.
                  </p>
                </div>
                <a href="/monitors">
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-500 text-white font-display tracking-wider" data-testid="link-monitors">
                    <Zap className="h-3.5 w-3.5 mr-1.5" />Set Up Monitors
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        <Footer />
      </div>
    </Layout>
  );
}
