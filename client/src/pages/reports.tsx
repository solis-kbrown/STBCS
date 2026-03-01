import { useState } from "react";
import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  FileText, Download, Loader2, Crown, Clock, Shield, AlertTriangle,
  Bug, Globe, ChevronDown, ChevronRight, Calendar, BarChart3,
  ShieldAlert, TrendingUp, Check, X, Zap, Eye, Target, Skull
} from "lucide-react";
import { useThreatReports, useThreatReport, useGenerateThreatReport, useReportSchedule, useUpdateReportSchedule } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";

function timeAgo(date: string | Date | null): string {
  if (!date) return "—";
  const d = new Date(date);
  const diff = Date.now() - d.getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function StatusBadge({ status }: { status: string }) {
  if (status === "complete") return <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Ready</Badge>;
  if (status === "generating") return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50 animate-pulse">Generating...</Badge>;
  if (status === "failed") return <Badge className="bg-red-500/20 text-red-400 border-red-500/50">Failed</Badge>;
  return <Badge className="bg-zinc-500/20 text-zinc-400">Queued</Badge>;
}

function ReportSection({ title, icon: Icon, children, defaultOpen = false }: { title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <button className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-800/50 transition-colors rounded-lg" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-orange-400" />
          <span className="font-medium text-zinc-200">{title}</span>
        </div>
        {open ? <ChevronDown className="h-4 w-4 text-zinc-500" /> : <ChevronRight className="h-4 w-4 text-zinc-500" />}
      </button>
      {open && <CardContent className="pt-0 pb-4 px-4">{children}</CardContent>}
    </Card>
  );
}

function ReportViewer({ reportId }: { reportId: string }) {
  const { data: report, isLoading } = useThreatReport(reportId);

  if (isLoading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 bg-zinc-800" />)}</div>;
  if (!report) return <div className="text-zinc-500 text-center py-8">Report not found</div>;

  if (report.status === "generating" || report.status === "queued") {
    return (
      <Card className="bg-orange-500/5 border-orange-500/20">
        <CardContent className="p-8 flex items-center gap-4">
          <Loader2 className="h-8 w-8 text-orange-400 animate-spin flex-shrink-0" />
          <div>
            <p className="text-orange-300 font-medium">Generating your report...</p>
            <p className="text-sm text-zinc-500 mt-1">Aggregating threat intelligence data, analyzing trends, and compiling recommendations. This typically takes 10-20 seconds.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (report.status === "failed") {
    return (
      <Card className="bg-red-500/5 border-red-500/20">
        <CardContent className="p-6">
          <p className="text-red-400 font-medium">Report Generation Failed</p>
          <p className="text-sm text-zinc-500 mt-1">{report.lastError || "An unexpected error occurred."}</p>
        </CardContent>
      </Card>
    );
  }

  let data: any = {};
  try { data = JSON.parse(report.reportData || "{}"); } catch {}

  const exec = data.executiveSummary || {};
  const ransomware = data.ransomwareLandscape || {};
  const vulns = data.vulnerabilities || {};
  const actors = data.threatActors || [];
  const surface = data.attackSurface || [];
  const recs = data.recommendations || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-200" data-testid="text-report-title">{report.title}</h3>
          <p className="text-sm text-zinc-500">Generated {timeAgo(report.generatedAt)}</p>
        </div>
        <StatusBadge status={report.status} />
      </div>

      <ReportSection title="Executive Summary" icon={BarChart3} defaultOpen={true}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-testid="executive-summary-grid">
          <div className="p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50 text-center">
            <div className="text-2xl font-bold text-orange-400">{exec.activeRansomwareGroups || 0}</div>
            <div className="text-xs text-zinc-500 mt-1">Active Ransomware Groups</div>
          </div>
          <div className="p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50 text-center">
            <div className="text-2xl font-bold text-red-400">{exec.criticalCves || 0}</div>
            <div className="text-xs text-zinc-500 mt-1">Critical CVEs</div>
          </div>
          <div className="p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50 text-center">
            <div className="text-2xl font-bold text-yellow-400">{exec.activeExploits || 0}</div>
            <div className="text-xs text-zinc-500 mt-1">Active Exploits</div>
          </div>
          <div className="p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50 text-center">
            <div className="text-2xl font-bold text-zinc-200">{exec.cisaKev || 0}</div>
            <div className="text-xs text-zinc-500 mt-1">CISA KEV Entries</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50 flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-orange-400 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-zinc-300">{(exec.maliciousIps || 0).toLocaleString()}</div>
              <div className="text-xs text-zinc-500">Malicious IPs Tracked</div>
            </div>
          </div>
          <div className="p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50 flex items-center gap-3">
            <Globe className="h-5 w-5 text-orange-400 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-zinc-300">{(exec.maliciousUrls || 0).toLocaleString()}</div>
              <div className="text-xs text-zinc-500">Malicious URLs Tracked</div>
            </div>
          </div>
        </div>
      </ReportSection>

      <ReportSection title="Ransomware Landscape" icon={Skull} defaultOpen={true}>
        <div className="space-y-4">
          {ransomware.topGroups?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-zinc-400 mb-2">Most Active Groups</h4>
              <div className="space-y-2">
                {ransomware.topGroups.map((g: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-zinc-600 w-5">{i + 1}</span>
                      <span className="text-sm font-medium text-zinc-300">{g.name}</span>
                    </div>
                    <Badge variant="outline" className="text-zinc-400 border-zinc-700">{g.count} victims</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
          {ransomware.recentIncidents?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-zinc-400 mb-2">Recent Incidents</h4>
              <div className="space-y-2">
                {ransomware.recentIncidents.map((inc: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
                    <div>
                      <span className="text-sm text-zinc-300">{inc.victim || "Unknown"}</span>
                      <span className="text-xs text-zinc-600 ml-2">by {inc.group}</span>
                    </div>
                    {inc.sector && <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700">{inc.sector}</Badge>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ReportSection>

      <ReportSection title="Critical Vulnerabilities" icon={Bug}>
        <div className="space-y-2">
          {vulns.recentCritical?.length > 0 ? vulns.recentCritical.map((cve: any, i: number) => (
            <div key={i} className="p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-mono text-orange-400">{cve.cveId}</span>
                <Badge className={`${cve.severity === "CRITICAL" ? "bg-red-500/20 text-red-400 border-red-500/50" : "bg-orange-500/20 text-orange-400 border-orange-500/50"}`}>
                  {cve.severity} {cve.cvss && `(${cve.cvss})`}
                </Badge>
              </div>
              <p className="text-xs text-zinc-500 line-clamp-2">{cve.description}</p>
            </div>
          )) : <p className="text-sm text-zinc-600">No critical vulnerabilities in this period.</p>}
        </div>
      </ReportSection>

      <ReportSection title="Threat Actors" icon={Target}>
        <div className="space-y-2">
          {actors.length > 0 ? actors.map((actor: any, i: number) => (
            <div key={i} className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-zinc-300">{actor.name}</span>
                {actor.country && <span className="text-xs text-zinc-600">{actor.country}</span>}
              </div>
              {actor.type && <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700">{actor.type}</Badge>}
            </div>
          )) : <p className="text-sm text-zinc-600">No threat actors tracked this period.</p>}
        </div>
      </ReportSection>

      {surface.length > 0 && (
        <ReportSection title="Attack Surface Findings" icon={Shield}>
          <div className="space-y-3">
            {surface.map((scan: any, i: number) => (
              <div key={i} className="p-4 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-zinc-300">{scan.domain}</span>
                  <span className="text-xs text-zinc-500">{timeAgo(scan.scannedAt)}</span>
                </div>
                <div className="flex gap-3 text-xs text-zinc-500">
                  <span>{scan.subdomains || 0} subdomains</span>
                  <span>{scan.openPorts || 0} ports</span>
                  {scan.findings?.critical > 0 && <span className="text-red-400">{scan.findings.critical} critical</span>}
                  {scan.findings?.high > 0 && <span className="text-orange-400">{scan.findings.high} high</span>}
                </div>
              </div>
            ))}
          </div>
        </ReportSection>
      )}

      <ReportSection title="Recommendations" icon={Zap} defaultOpen={true}>
        <div className="space-y-2">
          {recs.map((rec: string, i: number) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
              <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold text-orange-400">{i + 1}</span>
              </div>
              <p className="text-sm text-zinc-300">{rec}</p>
            </div>
          ))}
        </div>
      </ReportSection>
    </div>
  );
}

function SchedulePanel() {
  const { user } = useAuth();
  const { data: schedule, isLoading } = useReportSchedule();
  const updateSchedule = useUpdateReportSchedule();
  const isBusiness = user?.tier && ["business", "enterprise"].includes(user.tier);

  if (!isBusiness) {
    return (
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardContent className="p-6 text-center">
          <Calendar className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
          <p className="text-sm text-zinc-400 mb-1">Automated Report Scheduling</p>
          <p className="text-xs text-zinc-600 mb-3">Receive weekly or monthly threat reports automatically delivered to your account.</p>
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50">Business Tier</Badge>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) return <Skeleton className="h-32 bg-zinc-800" />;

  return (
    <Card className="bg-zinc-900/50 border-zinc-800" data-testid="schedule-panel">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-zinc-300 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-orange-400" /> Scheduled Reports
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="schedule-active" className="text-sm text-zinc-400">Enable auto-reports</Label>
          <Switch
            id="schedule-active"
            checked={schedule?.isActive ?? false}
            onCheckedChange={(checked) => updateSchedule.mutate({ cadence: schedule?.cadence || "weekly", isActive: checked })}
            data-testid="switch-schedule-active"
          />
        </div>
        <div>
          <Label className="text-xs text-zinc-500 mb-1 block">Frequency</Label>
          <Select
            value={schedule?.cadence || "weekly"}
            onValueChange={(val) => updateSchedule.mutate({ cadence: val, isActive: schedule?.isActive ?? true })}
          >
            <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-300" data-testid="select-cadence">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {schedule?.nextRunAt && schedule.isActive && (
          <p className="text-xs text-zinc-500 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Next report: {new Date(schedule.nextRunAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function Reports() {
  useDocumentTitle("Threat Intelligence Reports | STBCS");
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const { data: reports, isLoading: reportsLoading } = useThreatReports();
  const generateReport = useGenerateThreatReport();

  const handleGenerate = () => {
    generateReport.mutate(undefined, {
      onSuccess: (data) => {
        setSelectedReportId(data.report.id);
      },
    });
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex items-center justify-center">
          <Card className="bg-zinc-900/50 border-zinc-800 max-w-md w-full">
            <CardContent className="p-8 text-center">
              <Crown className="h-12 w-12 text-orange-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-zinc-200 mb-2">Pro Feature</h2>
              <p className="text-zinc-400 mb-6">Automated Threat Intelligence Reports are available for Pro and Business subscribers. Get comprehensive, branded security reports for your organization.</p>
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setLocation("/pricing")} data-testid="button-upgrade">
                Upgrade to Pro
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-7 w-7 text-orange-400" />
            <div>
              <h1 className="text-2xl font-bold text-zinc-100" data-testid="text-page-title">Threat Intelligence Reports</h1>
              <p className="text-sm text-zinc-500">Generate comprehensive, branded threat reports for your organization's leadership and stakeholders.</p>
            </div>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={generateReport.isPending}
            className="bg-orange-500 hover:bg-orange-600 text-white"
            data-testid="button-generate-report"
          >
            {generateReport.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
            Generate Report
          </Button>
        </div>

        {generateReport.isError && (
          <Card className="bg-red-500/5 border-red-500/20">
            <CardContent className="p-4">
              <p className="text-red-400 text-sm" data-testid="text-report-error">{generateReport.error.message}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <SchedulePanel />

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Report History</h3>
              {reportsLoading && [...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 bg-zinc-800" />)}
              {reports && reports.length === 0 && (
                <p className="text-sm text-zinc-600 py-4">No reports yet. Click "Generate Report" to create your first one.</p>
              )}
              {reports?.map((report: any) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReportId(report.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedReportId === report.id
                      ? "bg-orange-500/10 border-orange-500/30"
                      : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                  }`}
                  data-testid={`report-item-${report.id}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-zinc-200 truncate pr-2">{report.title?.replace("Threat Intelligence Report — ", "") || "Report"}</span>
                    <StatusBadge status={report.status} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Clock className="h-3 w-3" />
                    {timeAgo(report.generatedAt || report.createdAt)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            {selectedReportId ? (
              <ReportViewer reportId={selectedReportId} />
            ) : (
              <Card className="bg-zinc-900/30 border-zinc-800 border-dashed">
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                  <p className="text-zinc-500 mb-2">Select a report from the history or generate a new one.</p>
                  <p className="text-xs text-zinc-600">Reports include threat landscape overview, ransomware activity, critical CVEs, attack surface findings, and actionable recommendations.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </Layout>
  );
}