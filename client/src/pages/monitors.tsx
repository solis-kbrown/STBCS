import { useState } from "react";
import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Globe, Shield, Activity, AlertTriangle, Check, X, Loader2,
  Crown, Plus, Trash2, Eye, EyeOff, Clock, Lock,
  Wifi, WifiOff, ShieldAlert, Search, RefreshCw,
  ArrowUpRight, ArrowDownRight, Minus, ChevronRight,
  MonitorCheck, Radar, Skull, KeyRound, Server, FileWarning,
  ExternalLink, TrendingUp, ShieldCheck, AlertCircle
} from "lucide-react";
import {
  useMonitorSummary, useUptimeMonitors, useCreateUptimeMonitor, useDeleteUptimeMonitor,
  useUptimeChecks, useDarkWebMonitors, useCreateDarkWebMonitor, useDeleteDarkWebMonitor,
  useDarkWebFindings, useMarkFindingRead, useUptimeIncidents
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function StatusDot({ state }: { state: string }) {
  const colors: Record<string, string> = {
    up: "bg-green-500",
    down: "bg-red-500",
    degraded: "bg-yellow-500",
    unknown: "bg-zinc-500",
  };
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${colors[state] || colors.unknown} ${state === "up" ? "animate-pulse" : ""}`} />;
}

function UptimeBar({ checks }: { checks: any[] }) {
  const recent = checks.slice(0, 50).reverse();
  if (recent.length === 0) return <div className="text-xs text-zinc-500">No checks yet</div>;
  return (
    <div className="flex gap-0.5 items-end h-6" data-testid="uptime-bar">
      {recent.map((check: any, i: number) => (
        <div
          key={i}
          className={`w-1.5 rounded-sm transition-all ${
            check.status === "up" ? "bg-green-500 h-full" :
            check.status === "degraded" ? "bg-yellow-500 h-4" :
            "bg-red-500 h-3"
          }`}
          title={`${check.status} - ${check.responseTime}ms - ${new Date(check.checkedAt).toLocaleString()}`}
        />
      ))}
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    critical: "bg-red-500/20 text-red-400 border-red-500/50",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/50",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    low: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    info: "bg-zinc-500/20 text-zinc-400 border-zinc-500/50",
  };
  return <Badge className={styles[severity] || styles.info}>{severity.toUpperCase()}</Badge>;
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "-";
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  return `${Math.floor(seconds / 86400)}d`;
}

function timeAgo(date: string | Date | null): string {
  if (!date) return "Never";
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function OverviewPanel() {
  const { data: summary, isLoading } = useMonitorSummary();

  if (isLoading) return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
    </div>
  );

  if (!summary) return null;
  const { uptime, darkWeb, limits, tier } = summary;

  const stats = [
    { label: "Monitors Active", value: uptime.total, icon: MonitorCheck, color: "text-primary" },
    { label: "Services UP", value: uptime.up, icon: Check, color: "text-green-500" },
    { label: "Services DOWN", value: uptime.down, icon: X, color: "text-red-500" },
    { label: "Avg Uptime", value: `${uptime.avgUptime}%`, icon: TrendingUp, color: uptime.avgUptime > 99 ? "text-green-500" : uptime.avgUptime > 95 ? "text-yellow-500" : "text-red-500" },
    { label: "SSL Expiring", value: uptime.sslExpiring, icon: ShieldAlert, color: uptime.sslExpiring > 0 ? "text-red-500" : "text-green-500" },
    { label: "Active Incidents", value: uptime.activeIncidents, icon: AlertTriangle, color: uptime.activeIncidents > 0 ? "text-red-500" : "text-green-500" },
    { label: "Dark Web Targets", value: darkWeb.total, icon: Radar, color: "text-purple-500" },
    { label: "Unread Findings", value: darkWeb.unreadFindings, icon: Eye, color: darkWeb.unreadFindings > 0 ? "text-orange-400" : "text-zinc-500" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Badge className="bg-primary/20 text-primary border-primary/50 mb-2">{tier.toUpperCase()} PLAN</Badge>
          <h2 className="text-2xl font-display font-bold text-white">Monitoring Dashboard</h2>
        </div>
        <div className="text-right text-sm text-zinc-500">
          <div>Uptime: {uptime.total}/{limits.uptimeMonitors} monitors</div>
          <div>Dark Web: {darkWeb.total}/{limits.darkWebMonitors} monitors</div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <Card key={i} className="border-white/5 bg-card/50" data-testid={`stat-${stat.label.toLowerCase().replace(/\s/g, '-')}`}>
            <CardContent className="p-4">
              <stat.icon className={`h-5 w-5 ${stat.color} mb-2`} />
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-zinc-500">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AddUptimeMonitorForm({ onClose }: { onClose: () => void }) {
  const createMonitor = useCreateUptimeMonitor();
  const [form, setForm] = useState({
    name: "", url: "", protocol: "https" as string,
    checkInterval: 300, timeout: 30, expectedStatusCode: 200,
    alertOnDown: true, alertOnSslExpiry: true, sslExpiryThresholdDays: 14,
    emailAlert: true, smsAlert: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMonitor.mutateAsync(form);
      onClose();
    } catch {}
  };

  return (
    <Card className="border-primary/30 bg-card">
      <CardHeader>
        <CardTitle className="text-lg">Add Uptime Monitor</CardTitle>
        <CardDescription>Monitor any website, API, or service endpoint</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input placeholder="My Website" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-zinc-800 border-zinc-700" data-testid="input-monitor-name" />
            </div>
            <div>
              <Label>URL / Domain</Label>
              <Input placeholder="example.com or https://api.example.com/health" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} className="bg-zinc-800 border-zinc-700" data-testid="input-monitor-url" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>Protocol</Label>
              <Select value={form.protocol} onValueChange={v => setForm(f => ({ ...f, protocol: v }))}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="https">HTTPS</SelectItem>
                  <SelectItem value="http">HTTP</SelectItem>
                  <SelectItem value="tcp">TCP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Check Interval</Label>
              <Select value={String(form.checkInterval)} onValueChange={v => setForm(f => ({ ...f, checkInterval: parseInt(v) }))}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="300">5 minutes</SelectItem>
                  <SelectItem value="600">10 minutes</SelectItem>
                  <SelectItem value="1800">30 minutes</SelectItem>
                  <SelectItem value="3600">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Timeout (sec)</Label>
              <Input type="number" value={form.timeout} onChange={e => setForm(f => ({ ...f, timeout: parseInt(e.target.value) || 30 }))} className="bg-zinc-800 border-zinc-700" />
            </div>
            <div>
              <Label>Expected Status</Label>
              <Input type="number" value={form.expectedStatusCode} onChange={e => setForm(f => ({ ...f, expectedStatusCode: parseInt(e.target.value) || 200 }))} className="bg-zinc-800 border-zinc-700" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={form.alertOnDown} onCheckedChange={v => setForm(f => ({ ...f, alertOnDown: v }))} />
              <Label className="text-sm">Alert on Down</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.alertOnSslExpiry} onCheckedChange={v => setForm(f => ({ ...f, alertOnSslExpiry: v }))} />
              <Label className="text-sm">SSL Expiry Alert</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.emailAlert} onCheckedChange={v => setForm(f => ({ ...f, emailAlert: v }))} />
              <Label className="text-sm">Email Alerts</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.smsAlert} onCheckedChange={v => setForm(f => ({ ...f, smsAlert: v }))} />
              <Label className="text-sm">SMS Alerts</Label>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={createMonitor.isPending || !form.name || !form.url} className="bg-primary" data-testid="button-create-monitor">
              {createMonitor.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Create Monitor
            </Button>
          </div>
          {createMonitor.isError && <p className="text-red-400 text-sm">{createMonitor.error.message}</p>}
        </form>
      </CardContent>
    </Card>
  );
}

function UptimeMonitorCard({ monitor, onSelect }: { monitor: any; onSelect: (id: string) => void }) {
  const deleteMonitor = useDeleteUptimeMonitor();
  const { data: checksData } = useUptimeChecks(monitor.id);

  return (
    <Card className={`border-white/5 bg-card/50 hover:border-primary/20 transition-colors cursor-pointer ${monitor.currentState === "down" ? "border-red-500/30" : ""}`} data-testid={`monitor-card-${monitor.id}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0" onClick={() => onSelect(monitor.id)}>
            <StatusDot state={monitor.currentState || "unknown"} />
            <div className="min-w-0">
              <div className="font-semibold text-white truncate">{monitor.name}</div>
              <div className="text-xs text-zinc-500 truncate">{monitor.url}</div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-red-400 h-8 w-8 p-0" onClick={() => deleteMonitor.mutate(monitor.id)} data-testid={`delete-monitor-${monitor.id}`}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-3">
          <UptimeBar checks={checksData?.checks || []} />
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <div className="text-zinc-500">Uptime</div>
            <div className={`font-semibold ${(monitor.uptimePercent || 100) > 99 ? "text-green-400" : (monitor.uptimePercent || 100) > 95 ? "text-yellow-400" : "text-red-400"}`}>
              {(monitor.uptimePercent || 100).toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="text-zinc-500">Avg Response</div>
            <div className="font-semibold text-white">{monitor.avgResponseTime ? `${Math.round(monitor.avgResponseTime)}ms` : "-"}</div>
          </div>
          <div>
            <div className="text-zinc-500">Last Check</div>
            <div className="font-semibold text-white">{timeAgo(monitor.lastCheckAt)}</div>
          </div>
        </div>

        {monitor.sslExpiresAt && (
          <div className={`mt-2 p-2 rounded text-xs flex items-center gap-1 ${
            new Date(monitor.sslExpiresAt).getTime() - Date.now() < 14 * 24 * 60 * 60 * 1000
              ? "bg-red-500/10 text-red-400"
              : "bg-green-500/10 text-green-400"
          }`}>
            <Lock className="h-3 w-3" />
            SSL: {monitor.sslIssuer || "Valid"} - expires {new Date(monitor.sslExpiresAt).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MonitorDetail({ monitorId, onBack }: { monitorId: string; onBack: () => void }) {
  const { data: monitors } = useUptimeMonitors();
  const { data: checksData, isLoading } = useUptimeChecks(monitorId);
  const { data: incidentsData } = useUptimeIncidents(monitorId);
  const monitor = monitors?.monitors?.find((m: any) => m.id === monitorId);

  if (!monitor) return null;

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="text-zinc-400 hover:text-white mb-2">
        <ChevronRight className="h-4 w-4 rotate-180 mr-1" /> Back to Monitors
      </Button>

      <div className="flex items-center gap-3">
        <StatusDot state={monitor.currentState || "unknown"} />
        <div>
          <h3 className="text-xl font-bold text-white">{monitor.name}</h3>
          <a href={monitor.url.startsWith("http") ? monitor.url : `https://${monitor.url}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
            {monitor.url} <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Status", value: (monitor.currentState || "unknown").toUpperCase(), color: monitor.currentState === "up" ? "text-green-400" : "text-red-400" },
          { label: "Uptime", value: `${(monitor.uptimePercent || 100).toFixed(2)}%`, color: "text-white" },
          { label: "Avg Response", value: checksData?.stats24h ? `${checksData.stats24h.avgResponseTime}ms` : "-", color: "text-white" },
          { label: "Total Checks", value: monitor.totalChecks || 0, color: "text-white" },
          { label: "Protocol", value: (monitor.protocol || "https").toUpperCase(), color: "text-zinc-400" },
        ].map((s, i) => (
          <Card key={i} className="border-white/5 bg-card/50">
            <CardContent className="p-3 text-center">
              <div className="text-xs text-zinc-500">{s.label}</div>
              <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {checksData?.stats24h && checksData?.stats7d && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-white/5 bg-card/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Last 24 Hours</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-3 gap-2 text-sm">
              <div><span className="text-zinc-500">Checks:</span> <span className="text-white">{checksData.stats24h.totalChecks}</span></div>
              <div><span className="text-zinc-500">Up:</span> <span className="text-green-400">{checksData.stats24h.upChecks}</span></div>
              <div><span className="text-zinc-500">Avg:</span> <span className="text-white">{checksData.stats24h.avgResponseTime}ms</span></div>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-card/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Last 7 Days</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-3 gap-2 text-sm">
              <div><span className="text-zinc-500">Checks:</span> <span className="text-white">{checksData.stats7d.totalChecks}</span></div>
              <div><span className="text-zinc-500">Up:</span> <span className="text-green-400">{checksData.stats7d.upChecks}</span></div>
              <div><span className="text-zinc-500">Avg:</span> <span className="text-white">{checksData.stats7d.avgResponseTime}ms</span></div>
            </CardContent>
          </Card>
        </div>
      )}

      {monitor.sslExpiresAt && (
        <Card className="border-white/5 bg-card/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Lock className="h-4 w-4" /> SSL Certificate</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div><span className="text-zinc-500">Issuer:</span> <span className="text-white">{monitor.sslIssuer || "Unknown"}</span></div>
            <div><span className="text-zinc-500">Expires:</span> <span className="text-white">{new Date(monitor.sslExpiresAt).toLocaleDateString()}</span></div>
            <div>
              <span className="text-zinc-500">Days Left:</span>{" "}
              <span className={Math.ceil((new Date(monitor.sslExpiresAt).getTime() - Date.now()) / 86400000) <= 14 ? "text-red-400 font-bold" : "text-green-400"}>
                {Math.ceil((new Date(monitor.sslExpiresAt).getTime() - Date.now()) / 86400000)}
              </span>
            </div>
            <div><span className="text-zinc-500">HTTP:</span> <span className="text-white">{monitor.httpVersion || "Unknown"}</span></div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <Skeleton className="h-32" />
      ) : (
        <Card className="border-white/5 bg-card/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Response Time History</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-0.5 h-24 overflow-hidden">
              {(checksData?.checks || []).slice(0, 100).reverse().map((check: any, i: number) => {
                const maxMs = Math.max(...(checksData?.checks || []).slice(0, 100).map((c: any) => c.responseTime || 0), 1);
                const height = ((check.responseTime || 0) / maxMs) * 100;
                return (
                  <div
                    key={i}
                    className={`flex-1 min-w-[2px] max-w-[6px] rounded-t transition-all ${
                      check.status === "up" ? "bg-green-500/70" :
                      check.status === "degraded" ? "bg-yellow-500/70" : "bg-red-500/70"
                    }`}
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`${check.responseTime}ms - ${new Date(check.checkedAt).toLocaleString()}`}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {incidentsData?.incidents && incidentsData.incidents.length > 0 && (
        <Card className="border-white/5 bg-card/50">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Incident History</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {incidentsData.incidents.map((inc: any) => (
              <div key={inc.id} className="flex items-center gap-3 p-2 rounded bg-zinc-900/50 text-sm">
                <Badge className={inc.status === "ongoing" ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}>
                  {inc.status}
                </Badge>
                <div className="flex-1 min-w-0">
                  <div className="text-white truncate">{inc.title}</div>
                  <div className="text-xs text-zinc-500">{inc.description}</div>
                </div>
                <div className="text-xs text-zinc-500 whitespace-nowrap">
                  {timeAgo(inc.startedAt)}
                  {inc.duration ? ` (${formatDuration(inc.duration)})` : ""}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function UptimeTab() {
  const { data, isLoading } = useUptimeMonitors();
  const [showForm, setShowForm] = useState(false);
  const [selectedMonitor, setSelectedMonitor] = useState<string | null>(null);

  if (selectedMonitor) {
    return <MonitorDetail monitorId={selectedMonitor} onBack={() => setSelectedMonitor(null)} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Uptime Monitors</h3>
          <p className="text-sm text-zinc-500">Monitor websites, APIs, and services for availability, performance, and SSL health</p>
        </div>
        {data && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-500">{data.monitors?.length || 0}/{data.limits?.uptimeMonitors} monitors</span>
            <Button onClick={() => setShowForm(!showForm)} className="bg-primary" data-testid="button-add-monitor">
              <Plus className="h-4 w-4 mr-2" /> Add Monitor
            </Button>
          </div>
        )}
      </div>

      {showForm && <AddUptimeMonitorForm onClose={() => setShowForm(false)} />}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-40 rounded-lg" />)}
        </div>
      ) : data?.monitors?.length === 0 ? (
        <Card className="border-white/5 bg-card/50 border-dashed">
          <CardContent className="p-8 text-center">
            <MonitorCheck className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No monitors yet</h3>
            <p className="text-zinc-500 mb-4">Add your first uptime monitor to start tracking website availability, response times, and SSL certificates.</p>
            <Button onClick={() => setShowForm(true)} className="bg-primary" data-testid="button-add-first-monitor">
              <Plus className="h-4 w-4 mr-2" /> Add Your First Monitor
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.monitors?.map((monitor: any) => (
            <UptimeMonitorCard key={monitor.id} monitor={monitor} onSelect={setSelectedMonitor} />
          ))}
        </div>
      )}
    </div>
  );
}

function AddDarkWebForm({ onClose }: { onClose: () => void }) {
  const createMonitor = useCreateDarkWebMonitor();
  const [form, setForm] = useState({
    targetType: "domain" as string, targetValue: "", label: "",
    emailAlert: true, smsAlert: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await createMonitor.mutateAsync(form); onClose(); } catch {}
  };

  const targetTypeOptions = [
    { value: "domain", label: "Domain", placeholder: "example.com", desc: "Monitor a domain for breaches, leaks, and dark web mentions" },
    { value: "email", label: "Email", placeholder: "admin@example.com", desc: "Check if email credentials have been exposed in data breaches" },
    { value: "ip", label: "IP Address", placeholder: "203.0.113.1", desc: "Monitor an IP for C&C associations, blacklists, and Tor exit nodes" },
    { value: "keyword", label: "Keyword", placeholder: "company name", desc: "Search for mentions of your brand or organization in breach data" },
    { value: "url", label: "URL", placeholder: "https://example.com/login", desc: "Monitor a specific URL for phishing clones and malware" },
  ];

  const selected = targetTypeOptions.find(t => t.value === form.targetType);

  return (
    <Card className="border-purple-500/30 bg-card">
      <CardHeader>
        <CardTitle className="text-lg">Add Dark Web Monitor</CardTitle>
        <CardDescription>Monitor domains, emails, IPs, and keywords across breach databases and threat intelligence feeds</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Target Type</Label>
              <Select value={form.targetType} onValueChange={v => setForm(f => ({ ...f, targetType: v, targetValue: "" }))}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {targetTypeOptions.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Target Value</Label>
              <Input placeholder={selected?.placeholder} value={form.targetValue} onChange={e => setForm(f => ({ ...f, targetValue: e.target.value }))} className="bg-zinc-800 border-zinc-700" data-testid="input-darkweb-target" />
            </div>
            <div>
              <Label>Label (optional)</Label>
              <Input placeholder="Main website" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} className="bg-zinc-800 border-zinc-700" />
            </div>
          </div>
          {selected && <p className="text-xs text-zinc-500">{selected.desc}</p>}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2"><Switch checked={form.emailAlert} onCheckedChange={v => setForm(f => ({ ...f, emailAlert: v }))} /><Label className="text-sm">Email Alerts</Label></div>
            <div className="flex items-center gap-2"><Switch checked={form.smsAlert} onCheckedChange={v => setForm(f => ({ ...f, smsAlert: v }))} /><Label className="text-sm">SMS Alerts</Label></div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={createMonitor.isPending || !form.targetValue} className="bg-purple-600 hover:bg-purple-700" data-testid="button-create-darkweb">
              {createMonitor.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Radar className="h-4 w-4 mr-2" />}
              Start Monitoring
            </Button>
          </div>
          {createMonitor.isError && <p className="text-red-400 text-sm">{createMonitor.error.message}</p>}
        </form>
      </CardContent>
    </Card>
  );
}

function DarkWebTab() {
  const { data, isLoading } = useDarkWebMonitors();
  const { data: findingsData } = useDarkWebFindings();
  const deleteMonitor = useDeleteDarkWebMonitor();
  const markRead = useMarkFindingRead();
  const [showForm, setShowForm] = useState(false);
  const [selectedMonitor, setSelectedMonitor] = useState<string | null>(null);

  const findings = selectedMonitor
    ? (findingsData?.findings || []).filter((f: any) => f.monitorId === selectedMonitor)
    : (findingsData?.findings || []);

  const typeIcons: Record<string, any> = {
    domain: Globe, email: KeyRound, ip: Server, keyword: Search, url: ExternalLink,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">Dark Web Monitoring</h3>
          <p className="text-sm text-zinc-500">
            Scan for breaches, credential leaks, ransomware mentions, and dark web exposure across {data?.tier === "business" || data?.tier === "enterprise" ? "12" : "5"} intelligence sources
          </p>
        </div>
        {data && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-500">{data.monitors?.length || 0}/{data.limits?.darkWebMonitors} monitors</span>
            <Button onClick={() => setShowForm(!showForm)} className="bg-purple-600 hover:bg-purple-700" data-testid="button-add-darkweb">
              <Plus className="h-4 w-4 mr-2" /> Add Monitor
            </Button>
          </div>
        )}
      </div>

      {showForm && <AddDarkWebForm onClose={() => setShowForm(false)} />}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
        </div>
      ) : data?.monitors?.length === 0 ? (
        <Card className="border-white/5 bg-card/50 border-dashed">
          <CardContent className="p-8 text-center">
            <Radar className="h-12 w-12 text-purple-500/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No dark web monitors</h3>
            <p className="text-zinc-500 mb-4">Add domains, emails, or IPs to monitor for data breaches, credential leaks, and dark web activity.</p>
            <Button onClick={() => setShowForm(true)} className="bg-purple-600 hover:bg-purple-700" data-testid="button-add-first-darkweb">
              <Radar className="h-4 w-4 mr-2" /> Start Dark Web Monitoring
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.monitors?.map((monitor: any) => {
            const Icon = typeIcons[monitor.targetType] || Globe;
            const monitorFindings = (findingsData?.findings || []).filter((f: any) => f.monitorId === monitor.id);
            const unread = monitorFindings.filter((f: any) => !f.isRead).length;
            return (
              <Card key={monitor.id} className={`border-white/5 bg-card/50 hover:border-purple-500/20 transition-colors cursor-pointer ${selectedMonitor === monitor.id ? "border-purple-500/50" : ""}`}
                onClick={() => setSelectedMonitor(selectedMonitor === monitor.id ? null : monitor.id)}
                data-testid={`darkweb-card-${monitor.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-purple-400" />
                      <div>
                        <div className="font-semibold text-white">{monitor.label || monitor.targetValue}</div>
                        <div className="text-xs text-zinc-500">{monitor.targetType.toUpperCase()} - {monitor.targetValue}</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-red-400 h-8 w-8 p-0"
                      onClick={(e) => { e.stopPropagation(); deleteMonitor.mutate(monitor.id); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-zinc-500">Findings</div>
                      <div className="font-semibold text-white">{monitor.totalFindings || 0}</div>
                    </div>
                    <div>
                      <div className="text-zinc-500">Unread</div>
                      <div className={`font-semibold ${unread > 0 ? "text-orange-400" : "text-zinc-400"}`}>{unread}</div>
                    </div>
                    <div>
                      <div className="text-zinc-500">Last Scan</div>
                      <div className="font-semibold text-white">{timeAgo(monitor.lastScanAt)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {findings.length > 0 && (
        <Card className="border-white/5 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-purple-400" />
              {selectedMonitor ? "Monitor Findings" : "All Dark Web Findings"} ({findings.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
            {findings.map((finding: any) => (
              <div key={finding.id} className={`p-3 rounded-lg border ${finding.isRead ? "border-zinc-800 bg-zinc-900/30" : "border-purple-500/20 bg-purple-500/5"}`}
                data-testid={`finding-${finding.id}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <SeverityBadge severity={finding.severity} />
                      <Badge variant="outline" className="text-xs">{finding.findingType.replace(/_/g, " ")}</Badge>
                      <span className="text-xs text-zinc-500">{finding.source}</span>
                    </div>
                    <div className="text-sm font-medium text-white">{finding.title}</div>
                    <div className="text-xs text-zinc-400 mt-1 line-clamp-2">{finding.description}</div>
                    <div className="text-xs text-zinc-600 mt-1">{timeAgo(finding.discoveredAt)}</div>
                  </div>
                  {!finding.isRead && (
                    <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-green-400 h-8 w-8 p-0 shrink-0"
                      onClick={() => markRead.mutate(finding.id)} title="Mark as read">
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function IncidentsTab() {
  const { data, isLoading } = useUptimeIncidents();
  if (isLoading) return <Skeleton className="h-48" />;
  const incidents = data?.incidents || [];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-white">Incident History</h3>
        <p className="text-sm text-zinc-500">Complete log of all downtime events, SSL issues, and service degradation</p>
      </div>
      {incidents.length === 0 ? (
        <Card className="border-white/5 bg-card/50">
          <CardContent className="p-8 text-center">
            <ShieldCheck className="h-12 w-12 text-green-500/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No incidents recorded</h3>
            <p className="text-zinc-500">All monitored services are running smoothly.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {incidents.map((inc: any) => (
            <Card key={inc.id} className={`border-white/5 bg-card/50 ${inc.status === "ongoing" ? "border-red-500/30" : ""}`}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-2 rounded-lg ${inc.status === "ongoing" ? "bg-red-500/20" : "bg-green-500/20"}`}>
                  {inc.type === "ssl_expiry" ? <Lock className={`h-5 w-5 ${inc.status === "ongoing" ? "text-red-400" : "text-green-400"}`} /> :
                    <WifiOff className={`h-5 w-5 ${inc.status === "ongoing" ? "text-red-400" : "text-green-400"}`} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{inc.title}</span>
                    <Badge className={inc.status === "ongoing" ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}>{inc.status}</Badge>
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">{inc.description}</div>
                </div>
                <div className="text-right text-xs text-zinc-500 shrink-0">
                  <div>Started: {new Date(inc.startedAt).toLocaleString()}</div>
                  {inc.resolvedAt && <div>Resolved: {new Date(inc.resolvedAt).toLocaleString()}</div>}
                  {inc.duration && <div>Duration: {formatDuration(inc.duration)}</div>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function FreeTierGate() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="border-primary/30 bg-card max-w-lg w-full">
        <CardContent className="p-8 text-center">
          <Crown className="h-16 w-16 text-primary mx-auto mb-6" />
          <h2 className="text-2xl font-display font-bold text-white mb-3">Monitoring Suite</h2>
          <p className="text-zinc-400 mb-6">Real-time uptime monitoring, SSL certificate tracking, and dark web intelligence scanning are available with a Pro or Business subscription.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-left">
            <div className="space-y-2">
              <h4 className="text-primary font-semibold">Pro Plan</h4>
              <ul className="text-sm text-zinc-400 space-y-1">
                <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-400" /> 5 uptime monitors</li>
                <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-400" /> 5 dark web monitors</li>
                <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-400" /> 5 intelligence sources</li>
                <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-400" /> Email alerts</li>
                <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-400" /> SSL expiry warnings</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-purple-400 font-semibold">Business Plan</h4>
              <ul className="text-sm text-zinc-400 space-y-1">
                <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-400" /> 25 uptime monitors</li>
                <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-400" /> 25 dark web monitors</li>
                <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-400" /> 12 intelligence sources</li>
                <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-400" /> SSL deep inspection</li>
                <li className="flex items-center gap-2"><Check className="h-3 w-3 text-green-400" /> Email + SMS alerts</li>
              </ul>
            </div>
          </div>
          <Button className="bg-primary w-full" asChild data-testid="button-upgrade-monitors">
            <a href="/checkout">Upgrade Now</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MonitorsPage() {
  useDocumentTitle(
    "Monitoring Suite | STB Cybersecurity",
    "Real-time uptime monitoring, SSL certificate tracking, and dark web intelligence. Monitor your domains, services, and digital footprint 24/7."
  );

  const { data: auth, isLoading: authLoading } = useAuth();
  const isPaid = auth?.user?.tier && auth.user.tier !== "free";

  if (authLoading) return <Layout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;

  if (!auth?.user) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Card className="border-white/10 bg-card max-w-md w-full">
            <CardContent className="p-8 text-center">
              <Lock className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Sign In Required</h2>
              <p className="text-zinc-400 mb-4">Log in to access the monitoring suite.</p>
              <Button className="bg-primary" asChild><a href="/account">Sign In</a></Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </Layout>
    );
  }

  if (!isPaid) {
    return <Layout><FreeTierGate /><Footer /></Layout>;
  }

  return (
    <Layout>
      <div className="space-y-6 page-transition">
        <OverviewPanel />
        <Tabs defaultValue="uptime" className="w-full">
          <TabsList className="bg-zinc-900 border border-white/10 w-full md:w-auto">
            <TabsTrigger value="uptime" className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary" data-testid="tab-uptime">
              <MonitorCheck className="h-4 w-4" /> Uptime
            </TabsTrigger>
            <TabsTrigger value="darkweb" className="flex items-center gap-2 data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400" data-testid="tab-darkweb">
              <Radar className="h-4 w-4" /> Dark Web
            </TabsTrigger>
            <TabsTrigger value="incidents" className="flex items-center gap-2 data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400" data-testid="tab-incidents">
              <AlertTriangle className="h-4 w-4" /> Incidents
            </TabsTrigger>
          </TabsList>
          <TabsContent value="uptime" className="mt-4"><UptimeTab /></TabsContent>
          <TabsContent value="darkweb" className="mt-4"><DarkWebTab /></TabsContent>
          <TabsContent value="incidents" className="mt-4"><IncidentsTab /></TabsContent>
        </Tabs>
      </div>
      <Footer />
    </Layout>
  );
}
