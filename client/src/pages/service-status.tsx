import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useDocumentTitle } from "@/lib/use-document-title";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, CheckCircle2, AlertTriangle, XCircle, Cloud, Globe, Server } from "lucide-react";
import AnimatedSection from "@/components/animated-section";

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "outage" | "unknown";
  description: string;
  lastUpdated: string | null;
  url: string;
}

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
    case "operational": return "bg-green-500/10 border-green-500/30";
    case "degraded": return "bg-yellow-500/10 border-yellow-500/30";
    case "outage": return "bg-red-500/10 border-red-500/30";
    default: return "bg-zinc-500/10 border-zinc-500/30";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "operational": return CheckCircle2;
    case "degraded": return AlertTriangle;
    case "outage": return XCircle;
    default: return Cloud;
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "operational": return "Operational";
    case "degraded": return "Degraded";
    case "outage": return "Outage";
    default: return "Unknown";
  }
}

function getServiceIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("github")) return "github";
  if (lower.includes("cloudflare")) return "cloudflare";
  if (lower.includes("aws")) return "aws";
  if (lower.includes("azure") || lower.includes("microsoft")) return "microsoft";
  if (lower.includes("google")) return "google";
  if (lower.includes("slack")) return "slack";
  if (lower.includes("datadog")) return "datadog";
  if (lower.includes("vercel")) return "vercel";
  return "default";
}

export default function ServiceStatusPage() {
  useDocumentTitle("Service Status | STB Cybersecurity", "Real-time status monitoring for major cloud services and platforms.");

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

  const overallStatus = outageCount > 0 ? "outage" : degradedCount > 0 ? "degraded" : operationalCount > 0 ? "operational" : "unknown";

  return (
    <Layout>
      <div className="space-y-8 page-transition">
        <AnimatedSection animation="fade-up">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <div>
              <h1 className="text-3xl font-display font-bold text-white tracking-wide" data-testid="text-page-title">
                <Server className="inline h-8 w-8 mr-3 text-orange-500" />
                Service Status Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Real-time status monitoring for major cloud services and platforms
              </p>
            </div>
            <Button
              variant="outline"
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
          <Card className={`border-white/5 bg-card/50 backdrop-blur-sm ${getStatusBg(overallStatus)}`} data-testid="card-overall-status">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                {(() => {
                  const Icon = getStatusIcon(overallStatus);
                  return <Icon className={`h-10 w-10 ${getStatusColor(overallStatus)}`} />;
                })()}
                <div>
                  <h2 className="text-xl font-display font-bold text-white" data-testid="text-overall-status">
                    {overallStatus === "operational" && "All Systems Operational"}
                    {overallStatus === "degraded" && "Some Systems Degraded"}
                    {overallStatus === "outage" && "System Outages Detected"}
                    {overallStatus === "unknown" && "Checking Status..."}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {services.length > 0 ? (
                      <>
                        {operationalCount} operational
                        {degradedCount > 0 && <>, {degradedCount} degraded</>}
                        {outageCount > 0 && <>, {outageCount} outage{outageCount > 1 ? 's' : ''}</>}
                        {' '}out of {services.length} monitored services
                      </>
                    ) : (
                      "Loading service status..."
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        <AnimatedSection animation="fade-up" stagger={2}>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array(8).fill(0).map((_, i) => (
                <Card key={i} className="border-white/5 bg-card/50">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <Skeleton className="h-5 w-28" />
                    </div>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-3 w-40" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : isError ? (
            <Card className="border-white/5 bg-card/50" data-testid="card-error">
              <CardContent className="p-8 text-center">
                <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Failed to Load Status</h3>
                <p className="text-muted-foreground mb-4">Unable to fetch service status. Please try again.</p>
                <Button
                  variant="outline"
                  className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                  onClick={() => refetch()}
                  data-testid="button-retry"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {services.map((service, index) => {
                const StatusIcon = getStatusIcon(service.status);
                return (
                  <Card
                    key={service.name}
                    className={`border-white/5 bg-card/50 backdrop-blur-sm hover:border-white/10 transition-all duration-200 ${getStatusBg(service.status)}`}
                    data-testid={`card-service-${index}`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-background border border-white/5">
                            {getServiceIcon(service.name) === "github" && <Globe className="h-5 w-5 text-white" />}
                            {getServiceIcon(service.name) === "cloudflare" && <Cloud className="h-5 w-5 text-orange-400" />}
                            {getServiceIcon(service.name) === "aws" && <Server className="h-5 w-5 text-yellow-400" />}
                            {getServiceIcon(service.name) === "microsoft" && <Cloud className="h-5 w-5 text-blue-400" />}
                            {getServiceIcon(service.name) === "google" && <Cloud className="h-5 w-5 text-green-400" />}
                            {getServiceIcon(service.name) === "slack" && <Server className="h-5 w-5 text-purple-400" />}
                            {getServiceIcon(service.name) === "datadog" && <Server className="h-5 w-5 text-violet-400" />}
                            {getServiceIcon(service.name) === "vercel" && <Globe className="h-5 w-5 text-white" />}
                            {getServiceIcon(service.name) === "default" && <Server className="h-5 w-5 text-zinc-400" />}
                          </div>
                          <h3 className="font-display font-bold text-white text-sm" data-testid={`text-service-name-${index}`}>
                            {service.name}
                          </h3>
                        </div>
                        <StatusIcon className={`h-5 w-5 ${getStatusColor(service.status)}`} />
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getStatusBg(service.status)} ${getStatusColor(service.status)}`}
                        data-testid={`badge-status-${index}`}
                      >
                        {getStatusLabel(service.status)}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2" data-testid={`text-service-desc-${index}`}>
                        {service.description}
                      </p>
                      {service.lastUpdated && (
                        <p className="text-[10px] text-zinc-500 mt-2">
                          Updated: {new Date(service.lastUpdated).toLocaleString()}
                        </p>
                      )}
                      {service.url && (
                        <a
                          href={service.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-orange-400 hover:text-orange-300 mt-1 inline-block"
                          data-testid={`link-service-${index}`}
                        >
                          View Status Page &rarr;
                        </a>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </AnimatedSection>

        <Footer />
      </div>
    </Layout>
  );
}
