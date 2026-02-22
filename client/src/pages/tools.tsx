import { useState } from "react";
import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Globe, 
  Network, 
  Shield, 
  Server, 
  MapPin, 
  Clock, 
  Building, 
  AlertTriangle, 
  Check, 
  X, 
  Loader2, 
  Crown,
  Mail,
  Lock,
  Wifi,
  ExternalLink,
  Eye,
  Bug,
  Tag,
  Newspaper,
  Bell,
  ShieldAlert,
  FileSearch,
  Link2,
  Fingerprint,
  Hash,
  KeyRound
} from "lucide-react";
import { 
  useIpLookup, 
  useDomainLookup, 
  usePortScan, 
  useThreatCheck,
  useDnsLookup,
  useShodanLookup,
  useNewsletterSubscribe,
  useNmapScan,
  useNmapUsage,
  useEmailSecurity,
  useThreatFoxLookup,
  useMalwareBazaarLookup,
  useSSLLabsCheck,
  useURLScanSearch,
  usePhishTankCheck,
  IpLookupResult, 
  DomainLookupResult, 
  PortScanResult, 
  ThreatCheckResult,
  ShodanLookupResult,
  EmailSecurityResult
} from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

function ToolCard({ 
  title, 
  description, 
  icon: Icon, 
  tier = 'free',
  children 
}: { 
  title: string; 
  description: string; 
  icon: React.ComponentType<{ className?: string }>; 
  tier?: 'free' | 'pro';
  children: React.ReactNode;
}) {
  return (
    <Card className="border-white/5 bg-card/50">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-white">{title}</CardTitle>
              <CardDescription className="text-sm mt-1">{description}</CardDescription>
            </div>
          </div>
          <Badge className={tier === 'pro' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' : 'bg-green-600 text-white'}>
            {tier === 'pro' ? <><Crown className="h-3 w-3 mr-1" /> PRO</> : 'FREE'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function IpLookupTool() {
  const [ip, setIp] = useState("");
  const { mutate: lookup, data, isPending, error, reset } = useIpLookup();

  const handleLookup = () => {
    if (ip.trim()) {
      lookup(ip.trim());
    }
  };

  return (
    <ToolCard
      title="IP WHOIS Lookup"
      description="Get detailed information about any IP address including geolocation, ISP, organization, and network details."
      icon={Globe}
      tier="free"
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter IP address (e.g., 8.8.8.8)"
            value={ip}
            onChange={(e) => { setIp(e.target.value); reset(); }}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            className="bg-background border-white/10"
            data-testid="input-ip-lookup"
          />
          <Button onClick={handleLookup} disabled={isPending || !ip.trim()} data-testid="button-ip-lookup">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lookup"}
          </Button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error.message}
          </div>
        )}

        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <MapPin className="h-3 w-3" /> Location
                </div>
                <p className="font-medium text-white">
                  {data.city && data.region ? `${data.city}, ${data.region}` : 'Unknown'}
                  {data.country && `, ${data.country}`}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Building className="h-3 w-3" /> Organization
                </div>
                <p className="font-medium text-white">{data.org || data.isp || 'Unknown'}</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Network className="h-3 w-3" /> ASN
                </div>
                <p className="font-medium text-white font-mono text-sm">{data.as || 'Unknown'}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <Clock className="h-3 w-3" /> Timezone
                </div>
                <p className="font-medium text-white">{data.timezone || 'Unknown'}</p>
              </div>
              {data.hostname && (
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Server className="h-3 w-3" /> Hostname
                  </div>
                  <p className="font-medium text-white font-mono text-sm truncate">{data.hostname}</p>
                </div>
              )}
              <div className="flex gap-2 flex-wrap">
                {data.isProxy && <Badge className="bg-yellow-500">Proxy/VPN</Badge>}
                {data.isHosting && <Badge className="bg-blue-500">Hosting</Badge>}
                {data.isMobile && <Badge className="bg-purple-500">Mobile</Badge>}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolCard>
  );
}

function DomainLookupTool() {
  const [domain, setDomain] = useState("");
  const { mutate: lookup, data, isPending, error, reset } = useDomainLookup();

  const handleLookup = () => {
    if (domain.trim()) {
      lookup(domain.trim());
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Unknown';
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <ToolCard
      title="Domain WHOIS Lookup"
      description="Retrieve domain registration details including registrar, creation date, expiration, nameservers, and DNS records."
      icon={Network}
      tier="free"
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter domain (e.g., example.com)"
            value={domain}
            onChange={(e) => { setDomain(e.target.value); reset(); }}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            className="bg-background border-white/10"
            data-testid="input-domain-lookup"
          />
          <Button onClick={handleLookup} disabled={isPending || !domain.trim()} data-testid="button-domain-lookup">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lookup"}
          </Button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error.message}
          </div>
        )}

        {data && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-xs text-muted-foreground mb-1">Registrar</div>
                <p className="font-medium text-white text-sm">{data.registrar || 'Unknown'}</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-xs text-muted-foreground mb-1">Created</div>
                <p className="font-medium text-white">{formatDate(data.creationDate)}</p>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-xs text-muted-foreground mb-1">Expires</div>
                <p className="font-medium text-white">{formatDate(data.expirationDate)}</p>
              </div>
            </div>

            {data.aRecords && data.aRecords.length > 0 && (
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-xs text-muted-foreground mb-2">A Records (IPv4)</div>
                <div className="flex flex-wrap gap-2">
                  {data.aRecords.map((ip, i) => (
                    <Badge key={i} variant="outline" className="font-mono">{ip}</Badge>
                  ))}
                </div>
              </div>
            )}

            {data.nsRecords && data.nsRecords.length > 0 && (
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-xs text-muted-foreground mb-2">Name Servers</div>
                <div className="flex flex-wrap gap-2">
                  {data.nsRecords.map((ns, i) => (
                    <Badge key={i} variant="outline" className="font-mono text-xs">{ns}</Badge>
                  ))}
                </div>
              </div>
            )}

            {data.mxRecords && data.mxRecords.length > 0 && (
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-xs text-muted-foreground mb-2">MX Records (Mail)</div>
                <div className="space-y-1">
                  {data.mxRecords.map((mx, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="text-xs">{mx.priority}</Badge>
                      <span className="font-mono text-white">{mx.exchange}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolCard>
  );
}

function PortScanTool() {
  const [target, setTarget] = useState("");
  const { mutate: scan, data, isPending, error, reset } = usePortScan();

  const handleScan = () => {
    if (target.trim()) {
      scan({ target: target.trim() });
    }
  };

  return (
    <ToolCard
      title="Port Scanner"
      description="Scan common ports on any IP or domain. Free tier scans 10 common ports, Pro tier scans 17+ ports including database and admin ports."
      icon={Server}
      tier="free"
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter IP or domain (e.g., example.com)"
            value={target}
            onChange={(e) => { setTarget(e.target.value); reset(); }}
            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
            className="bg-background border-white/10 flex-1"
            data-testid="input-port-scan"
          />
          <Button onClick={handleScan} disabled={isPending || !target.trim()} data-testid="button-port-scan">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Scan"}
          </Button>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Badge className="bg-green-600">Free: 10 common ports</Badge>
          <Badge className="bg-muted text-muted-foreground">
            <Lock className="h-3 w-3 mr-1" /> Pro: 17+ ports (upgrade required)
          </Badge>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error.message}
          </div>
        )}

        {data && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Target: <span className="text-white font-mono">{data.ip}</span></span>
              <span>Open: <span className="text-green-400 font-bold">{data.openPorts.length}</span></span>
              <span>Closed: <span className="text-red-400 font-bold">{data.ports.length - data.openPorts.length}</span></span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {data.ports.map((port) => (
                <div 
                  key={port.port}
                  className={`p-2 rounded-lg border text-center ${
                    port.open 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-red-500/10 border-red-500/20'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {port.open ? <Check className="h-3 w-3 text-green-400" /> : <X className="h-3 w-3 text-red-400" />}
                    <span className="font-mono font-bold text-white">{port.port}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{port.service}</div>
                  {port.responseTime && (
                    <div className="text-[10px] text-green-400">{port.responseTime}ms</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolCard>
  );
}

function NmapScanTool() {
  const { user } = useAuth();
  const [target, setTarget] = useState("");
  const [scanType, setScanType] = useState<'quick' | 'standard' | 'comprehensive'>('quick');
  const [customPorts, setCustomPorts] = useState("");
  const [showCustomPorts, setShowCustomPorts] = useState(false);
  const { mutate: scan, data, isPending, error, reset } = useNmapScan();
  const { data: usage, refetch: refetchUsage } = useNmapUsage();

  const isPro = user && ['supporter', 'pro', 'business', 'enterprise'].includes(user.tier);
  const isBusiness = user && ['business', 'enterprise'].includes(user.tier);

  const handleScan = () => {
    if (target.trim() && isPro) {
      scan({
        target: target.trim(),
        scanType,
        customPorts: showCustomPorts && customPorts.trim() ? customPorts.trim() : undefined,
        grabBanners: true,
      }, {
        onSuccess: () => refetchUsage(),
      });
    }
  };

  const getPortCount = () => {
    if (showCustomPorts && customPorts.trim()) {
      return "Custom";
    }
    switch (scanType) {
      case 'quick': return '16 ports';
      case 'standard': return '100 ports';
      case 'comprehensive': return '500 ports';
      default: return '';
    }
  };

  return (
    <ToolCard
      title="Advanced Port Scanner"
      description="Nmap-style port scanner with service detection, banner grabbing, and custom port ranges. Pro/Business feature with abuse prevention."
      icon={Server}
      tier="pro"
    >
      <div className="space-y-4">
        {!isPro ? (
          <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4 text-orange-400" />
              <span className="text-orange-400 font-medium">Pro/Business Feature</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Upgrade to Pro or Business to access the advanced port scanner with service detection, 
              banner grabbing, custom port ranges, and up to 500 ports per scan.
            </p>
          </div>
        ) : (
          <>
            {usage && (
              <div className="flex items-center justify-between text-xs text-muted-foreground bg-white/5 p-2 rounded">
                <span>Scans today: {usage.scansToday}/{usage.dailyLimit}</span>
                <span>{usage.scansRemaining} remaining</span>
                {usage.cooldownRemaining > 0 && (
                  <span className="text-orange-400">Cooldown: {usage.cooldownRemaining}s</span>
                )}
              </div>
            )}
            
            <div className="flex gap-2">
              <Input
                placeholder="Enter IP address (e.g., 8.8.8.8)"
                value={target}
                onChange={(e) => { setTarget(e.target.value); reset(); }}
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                className="bg-background/50 border-white/10"
                data-testid="input-nmap-target"
              />
              <Button 
                onClick={handleScan} 
                disabled={isPending || !target.trim() || (usage?.cooldownRemaining ?? 0) > 0}
                className="shrink-0"
                data-testid="button-nmap-scan"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Scan"}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <Select value={scanType} onValueChange={(v) => setScanType(v as any)}>
                <SelectTrigger className="w-40 bg-background/50 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quick">Quick (16 ports)</SelectItem>
                  <SelectItem value="standard">Standard (100)</SelectItem>
                  <SelectItem value="comprehensive">Full (500)</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCustomPorts(!showCustomPorts)}
                className="text-xs"
              >
                {showCustomPorts ? 'Use Preset' : 'Custom Ports'}
              </Button>

              <Badge variant="outline" className="text-xs">
                {getPortCount()}
              </Badge>
            </div>

            {showCustomPorts && (
              <Input
                placeholder="Custom ports: 22,80,443 or 1-1000 or 22,80,100-200"
                value={customPorts}
                onChange={(e) => setCustomPorts(e.target.value)}
                className="bg-background/50 border-white/10 text-sm"
                data-testid="input-custom-ports"
              />
            )}
          </>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
            <AlertTriangle className="h-4 w-4 inline mr-2" />
            {error.message}
          </div>
        )}

        {data?.scan && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              <div className="p-2 rounded bg-white/5">
                <div className="text-muted-foreground text-xs">Target</div>
                <div className="font-mono text-white">{data.scan.target}</div>
              </div>
              <div className="p-2 rounded bg-white/5">
                <div className="text-muted-foreground text-xs">Duration</div>
                <div className="text-white">{(data.scan.duration / 1000).toFixed(1)}s</div>
              </div>
              <div className="p-2 rounded bg-white/5">
                <div className="text-muted-foreground text-xs">Scanned</div>
                <div className="text-white">{data.scan.portsScanned} ports</div>
              </div>
              <div className="p-2 rounded bg-green-500/10">
                <div className="text-muted-foreground text-xs">Open Ports</div>
                <div className="text-green-400 font-bold">{data.scan.openPorts}</div>
              </div>
            </div>

            {data.scan.results.length > 0 ? (
              <div className="rounded-lg border border-white/10 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-3 py-2 text-left text-muted-foreground font-medium">Port</th>
                      <th className="px-3 py-2 text-left text-muted-foreground font-medium">Service</th>
                      <th className="px-3 py-2 text-left text-muted-foreground font-medium">Response</th>
                      <th className="px-3 py-2 text-left text-muted-foreground font-medium hidden md:table-cell">Banner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.scan.results.map((result, idx) => (
                      <tr key={idx} className="border-t border-white/5">
                        <td className="px-3 py-2 font-mono text-green-400">{result.port}</td>
                        <td className="px-3 py-2 text-white">{result.service}</td>
                        <td className="px-3 py-2 text-muted-foreground">{result.responseTime}ms</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground font-mono truncate max-w-[200px] hidden md:table-cell">
                          {result.banner || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground bg-white/5 rounded-lg">
                {data.scan.hostUp 
                  ? 'No open ports found in scanned range'
                  : 'Host appears to be down or filtered'}
              </div>
            )}
          </div>
        )}
      </div>
    </ToolCard>
  );
}

function ThreatCheckTool() {
  const [ip, setIp] = useState("");
  const { mutate: check, data, isPending, error, reset } = useThreatCheck();

  const handleCheck = () => {
    if (ip.trim()) {
      check(ip.trim());
    }
  };

  return (
    <ToolCard
      title="Threat Database Check"
      description="Check if an IP address appears in our threat intelligence database including malicious IPs, botnets, and known attackers."
      icon={Shield}
      tier="free"
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter IP address to check"
            value={ip}
            onChange={(e) => { setIp(e.target.value); reset(); }}
            onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
            className="bg-background border-white/10"
            data-testid="input-threat-check"
          />
          <Button onClick={handleCheck} disabled={isPending || !ip.trim()} data-testid="button-threat-check">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check"}
          </Button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error.message}
          </div>
        )}

        {data && (
          <div className={`p-4 rounded-lg border ${
            data.isThreat 
              ? 'bg-destructive/10 border-destructive/30' 
              : 'bg-green-500/10 border-green-500/30'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {data.isThreat ? (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              ) : (
                <Check className="h-5 w-5 text-green-400" />
              )}
              <span className={`font-bold ${data.isThreat ? 'text-destructive' : 'text-green-400'}`}>
                {data.isThreat ? 'THREAT DETECTED' : 'NOT IN THREAT DATABASE'}
              </span>
            </div>
            {data.isThreat && data.threatDetails && (
              <div className="space-y-2 mt-3">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">Source:</span>
                  <Badge variant="outline">{data.threatDetails.source}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge className="bg-destructive">{data.threatDetails.threatType}</Badge>
                </div>
                {data.threatDetails.country && (
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">Country:</span>
                    <span className="text-white">{data.threatDetails.country}</span>
                  </div>
                )}
              </div>
            )}
            {!data.isThreat && (
              <p className="text-sm text-muted-foreground mt-2">{data.message}</p>
            )}
          </div>
        )}
      </div>
    </ToolCard>
  );
}

function ShodanLookupTool() {
  const [ip, setIp] = useState("");
  const { mutate: lookup, data, isPending, error, reset } = useShodanLookup();

  const handleLookup = () => {
    if (ip.trim()) {
      lookup(ip.trim());
    }
  };

  return (
    <ToolCard
      title="Shodan IP Intelligence"
      description="Get open ports, vulnerabilities, hostnames, and service details for any IP using Shodan's InternetDB - completely free."
      icon={Eye}
      tier="free"
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter IP address (e.g., 8.8.8.8)"
            value={ip}
            onChange={(e) => { setIp(e.target.value); reset(); }}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            className="bg-background border-white/10"
            data-testid="input-shodan-lookup"
          />
          <Button onClick={handleLookup} disabled={isPending || !ip.trim()} data-testid="button-shodan-lookup">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lookup"}
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Eye className="h-3 w-3" />
          <span>Powered by Shodan InternetDB - Free, no API key required</span>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error.message}
          </div>
        )}

        {data && (
          <div className="space-y-4 pt-2">
            {!data.found ? (
              <div className="p-4 rounded-lg bg-muted/20 border border-white/10 text-center">
                <p className="text-muted-foreground">{data.message || "No data found for this IP"}</p>
              </div>
            ) : (
              <>
                {data.ports.length > 0 && (
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Server className="h-3 w-3" /> Open Ports ({data.ports.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {data.ports.map((port) => (
                        <Badge key={port} variant="outline" className="font-mono bg-green-500/10 border-green-500/30 text-green-400">
                          {port}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {data.vulns.length > 0 && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                    <div className="flex items-center gap-2 text-xs text-destructive mb-2">
                      <Bug className="h-3 w-3" /> Known Vulnerabilities ({data.vulns.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {data.vulns.slice(0, 10).map((vuln) => (
                        <Badge key={vuln} className="bg-destructive font-mono text-xs">
                          {vuln}
                        </Badge>
                      ))}
                      {data.vulns.length > 10 && (
                        <Badge variant="outline" className="text-xs">+{data.vulns.length - 10} more</Badge>
                      )}
                    </div>
                  </div>
                )}

                {data.hostnames.length > 0 && (
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Globe className="h-3 w-3" /> Hostnames
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {data.hostnames.map((hostname) => (
                        <Badge key={hostname} variant="outline" className="font-mono text-xs">
                          {hostname}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {data.tags.length > 0 && (
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Tag className="h-3 w-3" /> Tags
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {data.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs capitalize">
                          {tag.replace(/-/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {data.cpes.length > 0 && (
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Shield className="h-3 w-3" /> CPE (Software/Hardware)
                    </div>
                    <div className="space-y-1 text-xs font-mono text-muted-foreground max-h-32 overflow-y-auto">
                      {data.cpes.slice(0, 5).map((cpe) => (
                        <div key={cpe} className="truncate">{cpe}</div>
                      ))}
                      {data.cpes.length > 5 && (
                        <div className="text-primary">+{data.cpes.length - 5} more...</div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </ToolCard>
  );
}

function EmailSecurityTool() {
  const [domain, setDomain] = useState("");
  const { mutate: checkSecurity, data, isPending, error, reset } = useEmailSecurity();

  const handleCheck = () => {
    const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (cleanDomain && cleanDomain.includes(".")) {
      checkSecurity(cleanDomain);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A+": case "A": return "text-green-400";
      case "B": return "text-lime-400";
      case "C": return "text-yellow-400";
      case "D": return "text-orange-400";
      case "F": return "text-red-400";
      default: return "text-muted-foreground";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500";
    if (score >= 70) return "bg-lime-500";
    if (score >= 50) return "bg-yellow-500";
    if (score >= 30) return "bg-orange-500";
    return "bg-red-500";
  };

  const renderCheckStatus = (valid: boolean, label: string) => (
    <div className="flex items-center gap-2">
      {valid ? (
        <Check className="h-4 w-4 text-green-400" />
      ) : (
        <X className="h-4 w-4 text-red-400" />
      )}
      <span className={valid ? "text-green-400" : "text-red-400"}>{label}</span>
    </div>
  );

  return (
    <ToolCard
      title="Email Security Check"
      description="MXToolbox-style email security analysis - MX, SPF, DMARC records with scoring"
      icon={Mail}
      tier="free"
    >
      <div className="space-y-4" data-testid="tool-email-security">
        <div className="flex gap-2">
          <Input
            placeholder="Enter domain (e.g., google.com)"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCheck()}
            disabled={isPending}
            data-testid="input-email-domain"
          />
          <Button 
            onClick={handleCheck} 
            disabled={isPending || !domain.trim()}
            data-testid="button-email-check"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check"}
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-sm">
            {error.message}
          </div>
        )}

        {data && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-white/10">
              <div>
                <h4 className="font-medium text-white">{data.domain}</h4>
                <p className="text-sm text-muted-foreground">Email Security Score</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className={`text-3xl font-bold ${getGradeColor(data.grade)}`}>
                    {data.grade}
                  </div>
                  <div className="text-sm text-muted-foreground">{data.overallScore}/100</div>
                </div>
                <div className="w-16 h-16 relative">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/10" />
                    <circle
                      cx="18" cy="18" r="16" fill="none"
                      stroke="currentColor" strokeWidth="2"
                      strokeDasharray={`${data.overallScore} 100`}
                      className={getScoreColor(data.overallScore).replace('bg-', 'text-')}
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {renderCheckStatus(data.mx.valid, "MX Records")}
              {renderCheckStatus(data.spf.valid, "SPF Record")}
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 text-yellow-400">-</span>
                <span className="text-yellow-400">DKIM (selector required)</span>
              </div>
              {renderCheckStatus(data.dmarc.valid, "DMARC Policy")}
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-background/30 rounded border border-white/5">
                <h5 className="font-medium text-white flex items-center gap-2 mb-2">
                  <Server className="h-4 w-4 text-orange-400" /> MX Records
                </h5>
                {data.mx.records.length > 0 ? (
                  <div className="space-y-1 text-sm">
                    {data.mx.records.slice(0, 5).map((mx, i) => (
                      <div key={i} className="flex justify-between text-muted-foreground">
                        <span className="font-mono">{mx.exchange}</span>
                        <span>Priority: {mx.priority}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-red-400">No MX records found</p>
                )}
              </div>

              <div className="p-3 bg-background/30 rounded border border-white/5">
                <h5 className="font-medium text-white flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-orange-400" /> SPF Record
                </h5>
                {data.spf.record ? (
                  <div className="text-sm">
                    <code className="text-xs break-all text-muted-foreground bg-black/30 px-2 py-1 rounded block">
                      {data.spf.record}
                    </code>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        Policy: {data.spf.policy}
                      </Badge>
                      {data.spf.includes.slice(0, 3).map((inc, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {inc}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-red-400">No SPF record found - emails may be spoofed</p>
                )}
              </div>

              <div className="p-3 bg-background/30 rounded border border-white/5">
                <h5 className="font-medium text-white flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-orange-400" /> DMARC Policy
                </h5>
                {data.dmarc.record ? (
                  <div className="text-sm">
                    <div className="flex gap-2 flex-wrap mb-2">
                      <Badge variant="outline" className="text-xs">
                        Policy: {data.dmarc.policy}
                      </Badge>
                      {data.dmarc.subdomainPolicy && data.dmarc.subdomainPolicy !== "none" && (
                        <Badge variant="outline" className="text-xs">
                          Subdomain: {data.dmarc.subdomainPolicy}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {data.dmarc.percentage}% enforcement
                      </Badge>
                    </div>
                    {data.dmarc.reportEmail.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Reports: {data.dmarc.reportEmail.slice(0, 2).join(", ")}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-red-400">No DMARC policy - domain vulnerable to spoofing</p>
                )}
              </div>
            </div>

            {data.recommendations.length > 0 && (
              <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded">
                <h5 className="font-medium text-yellow-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" /> Recommendations
                </h5>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {data.recommendations.map((rec, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-yellow-400">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center">
              Checked at {new Date(data.timestamp).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </ToolCard>
  );
}

function NewsletterSubscribeTool() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const { mutate: subscribe, data, isPending, error, reset } = useNewsletterSubscribe();

  const handleSubscribe = () => {
    if (email.trim() && email.includes("@")) {
      subscribe({ 
        email: email.trim(), 
        name: name.trim() || undefined,
        frequency: "weekly",
        preferences: { ransomware: true, cves: true, news: true, breaches: true }
      });
    }
  };

  return (
    <ToolCard
      title="Weekly Security Digest"
      description="Subscribe to receive weekly updates on ransomware attacks, critical CVEs, security news, and breach alerts."
      icon={Newspaper}
      tier="free"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Input
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => { setName(e.target.value); reset(); }}
            className="bg-background border-white/10"
            data-testid="input-newsletter-name"
          />
          <Input
            placeholder="Your email address"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); reset(); }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
            className="bg-background border-white/10"
            data-testid="input-newsletter-email"
          />
        </div>
        <Button 
          onClick={handleSubscribe} 
          disabled={isPending || !email.includes("@")} 
          className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700"
          data-testid="button-newsletter-subscribe"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Bell className="h-4 w-4 mr-2" />}
          Subscribe to Newsletter
        </Button>

        <div className="text-xs text-muted-foreground text-center">
          Get weekly updates on: Ransomware incidents, Critical CVEs, Security news, Data breaches
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error.message}
          </div>
        )}

        {data?.success && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>{data.message}</span>
            </div>
          </div>
        )}
      </div>
    </ToolCard>
  );
}

function ThreatFoxTool() {
  const [ioc, setIoc] = useState("");
  const [iocType, setIocType] = useState<'ip' | 'domain' | 'url' | 'hash'>('hash');
  const { mutate: lookup, data, isPending, error, reset } = useThreatFoxLookup();

  const handleLookup = () => {
    if (ioc.trim()) {
      lookup({ ioc: ioc.trim(), iocType });
    }
  };

  return (
    <ToolCard
      title="ThreatFox IOC Lookup"
      description="Check if an IP, domain, URL, or hash is associated with known malware (Abuse.ch)"
      icon={Bug}
      tier="free"
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <Select value={iocType} onValueChange={(v) => setIocType(v as any)}>
            <SelectTrigger className="w-24 bg-background border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hash">Hash</SelectItem>
              <SelectItem value="ip">IP</SelectItem>
              <SelectItem value="domain">Domain</SelectItem>
              <SelectItem value="url">URL</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder={iocType === 'hash' ? "Enter MD5/SHA256 hash" : `Enter ${iocType}`}
            value={ioc}
            onChange={(e) => { setIoc(e.target.value); reset(); }}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            className="bg-background border-white/10 flex-1"
            data-testid="input-threatfox-ioc"
          />
          <Button onClick={handleLookup} disabled={isPending || !ioc.trim()} data-testid="button-threatfox-lookup">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lookup"}
          </Button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error.message}
          </div>
        )}

        {data && (
          <div className="space-y-3">
            {data.queryStatus === 'ok' && data.data.length > 0 ? (
              <>
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <div className="flex items-center gap-2 text-red-400 font-bold">
                    <AlertTriangle className="h-4 w-4" />
                    MALICIOUS - {data.data.length} IOC(s) found
                  </div>
                </div>
                {data.data.slice(0, 3).map((item, i) => (
                  <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-red-600">{item.malwarePrintable}</Badge>
                      <span className="text-xs text-muted-foreground">Confidence: {item.confidence}%</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <span className="font-mono">{item.iocValue}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 5).map((tag, j) => (
                        <Badge key={j} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground">First seen: {item.firstSeen}</div>
                  </div>
                ))}
              </>
            ) : (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="flex items-center gap-2 text-green-400">
                  <Check className="h-4 w-4" />
                  No malware associations found in ThreatFox database
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolCard>
  );
}

function MalwareBazaarTool() {
  const [hash, setHash] = useState("");
  const { mutate: lookup, data, isPending, error, reset } = useMalwareBazaarLookup();

  const handleLookup = () => {
    if (hash.trim() && /^[a-fA-F0-9]{32,64}$/.test(hash.trim())) {
      lookup({ hash: hash.trim() });
    }
  };

  return (
    <ToolCard
      title="Malware Bazaar Hash Lookup"
      description="Check if a file hash (MD5/SHA256) is associated with known malware samples"
      icon={Hash}
      tier="free"
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter MD5, SHA1, or SHA256 hash"
            value={hash}
            onChange={(e) => { setHash(e.target.value); reset(); }}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
            className="bg-background border-white/10 font-mono text-sm"
            data-testid="input-malwarebazaar-hash"
          />
          <Button onClick={handleLookup} disabled={isPending || !/^[a-fA-F0-9]{32,64}$/.test(hash.trim())} data-testid="button-malwarebazaar-lookup">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lookup"}
          </Button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error.message}
          </div>
        )}

        {data && (
          <div className="space-y-3">
            {data.queryStatus === 'ok' && data.data.length > 0 ? (
              <>
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <div className="flex items-center gap-2 text-red-400 font-bold">
                    <AlertTriangle className="h-4 w-4" />
                    MALWARE FOUND
                  </div>
                </div>
                {data.data.map((sample, i) => (
                  <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      {sample.signature && <Badge className="bg-red-600">{sample.signature}</Badge>}
                      <span className="text-xs text-muted-foreground">{sample.fileType}</span>
                    </div>
                    {sample.fileName && (
                      <div className="text-sm text-white">{sample.fileName}</div>
                    )}
                    <div className="text-xs font-mono text-muted-foreground truncate">
                      SHA256: {sample.sha256Hash}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {sample.tags.slice(0, 5).map((tag, j) => (
                        <Badge key={j} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      First seen: {sample.firstSeen} | Size: {(sample.fileSize / 1024).toFixed(1)} KB
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="flex items-center gap-2 text-green-400">
                  <Check className="h-4 w-4" />
                  No malware samples found with this hash
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolCard>
  );
}

function SSLLabsTool() {
  const [host, setHost] = useState("");
  const { mutate: check, data, isPending, error, reset } = useSSLLabsCheck();

  const handleCheck = () => {
    if (host.trim()) {
      check({ host: host.trim().replace(/^https?:\/\//, '').split('/')[0] });
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-600';
    if (grade.startsWith('B')) return 'bg-blue-600';
    if (grade.startsWith('C')) return 'bg-yellow-600';
    if (grade.startsWith('D')) return 'bg-orange-600';
    if (grade.startsWith('F')) return 'bg-red-600';
    return 'bg-gray-600';
  };

  return (
    <ToolCard
      title="SSL/TLS Security Grade"
      description="Check the SSL/TLS configuration and get a security grade (A+ to F) using Qualys SSL Labs"
      icon={KeyRound}
      tier="free"
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter domain (e.g., google.com)"
            value={host}
            onChange={(e) => { setHost(e.target.value); reset(); }}
            onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
            className="bg-background border-white/10"
            data-testid="input-ssllabs-host"
          />
          <Button onClick={handleCheck} disabled={isPending || !host.trim()} data-testid="button-ssllabs-check">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check"}
          </Button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error.message}
          </div>
        )}

        {data && (
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-lg font-bold text-white">{data.host}</div>
                  <div className="text-xs text-muted-foreground">{data.statusMessage}</div>
                </div>
                <div className={`text-3xl font-bold px-4 py-2 rounded-lg ${getGradeColor(data.grade)}`}>
                  {data.grade}
                </div>
              </div>
              {data.status === 'READY' && data.endpoints.length > 0 && (
                <div className="space-y-2 mt-3">
                  {data.endpoints.map((ep, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-white/5">
                      <span className="font-mono text-sm text-muted-foreground">{ep.ipAddress}</span>
                      <Badge className={getGradeColor(ep.grade)}>{ep.grade}</Badge>
                    </div>
                  ))}
                </div>
              )}
              {data.hasWarnings && (
                <div className="flex items-center gap-2 text-yellow-400 text-sm mt-3">
                  <AlertTriangle className="h-4 w-4" />
                  Configuration has warnings
                </div>
              )}
              {data.isExceptional && (
                <div className="flex items-center gap-2 text-green-400 text-sm mt-3">
                  <Check className="h-4 w-4" />
                  Exceptional security configuration
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolCard>
  );
}

function URLScanTool() {
  const [query, setQuery] = useState("");
  const { mutate: search, data, isPending, error, reset } = useURLScanSearch();

  const handleSearch = () => {
    if (query.trim()) {
      search({ query: query.trim() });
    }
  };

  return (
    <ToolCard
      title="URLScan.io Domain Search"
      description="Search for scan history and threat analysis of any domain using URLScan.io"
      icon={Link2}
      tier="free"
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter domain to search (e.g., example.com)"
            value={query}
            onChange={(e) => { setQuery(e.target.value); reset(); }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="bg-background border-white/10"
            data-testid="input-urlscan-query"
          />
          <Button onClick={handleSearch} disabled={isPending || !query.trim()} data-testid="button-urlscan-search">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error.message}
          </div>
        )}

        {data && (
          <div className="space-y-3">
            {data.results.length > 0 ? (
              <>
                <div className="text-sm text-muted-foreground">
                  Found {data.results.length} scan result(s)
                </div>
                {data.results.slice(0, 5).map((result, i) => (
                  <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-mono text-sm text-white truncate max-w-xs">{result.domain}</span>
                      {result.malicious ? (
                        <Badge className="bg-red-600">Malicious</Badge>
                      ) : (
                        <Badge className="bg-green-600">Clean</Badge>
                      )}
                    </div>
                    {result.ip && (
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <Server className="h-3 w-3" />
                        {result.ip} {result.country && `(${result.country})`}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Date(result.timestamp).toLocaleDateString()}
                      </span>
                      <a 
                        href={result.reportUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        View Report <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center text-muted-foreground">
                No scan results found for this domain
              </div>
            )}
          </div>
        )}
      </div>
    </ToolCard>
  );
}

function PhishTankTool() {
  const [url, setUrl] = useState("");
  const { mutate: check, data, isPending, error, reset } = usePhishTankCheck();

  const handleCheck = () => {
    if (url.trim() && url.includes('://')) {
      check({ url: url.trim() });
    }
  };

  return (
    <ToolCard
      title="PhishTank URL Check"
      description="Check if a URL is a known phishing site using PhishTank's community database"
      icon={Fingerprint}
      tier="free"
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter full URL (e.g., https://example.com/page)"
            value={url}
            onChange={(e) => { setUrl(e.target.value); reset(); }}
            onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
            className="bg-background border-white/10"
            data-testid="input-phishtank-url"
          />
          <Button onClick={handleCheck} disabled={isPending || !url.includes('://')} data-testid="button-phishtank-check">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check"}
          </Button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error.message}
          </div>
        )}

        {data && (
          <div className="space-y-3">
            {data.inDatabase ? (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 space-y-3">
                <div className="flex items-center gap-2 text-red-400 font-bold">
                  <AlertTriangle className="h-5 w-5" />
                  PHISHING SITE DETECTED
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  {data.verified && (
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-red-400" />
                      Verified phishing site
                    </div>
                  )}
                  {data.target && (
                    <div>Target: <span className="text-white">{data.target}</span></div>
                  )}
                  {data.phishId && (
                    <div>PhishTank ID: <span className="font-mono">{data.phishId}</span></div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                <div className="flex items-center gap-2 text-green-400">
                  <Check className="h-4 w-4" />
                  URL not found in PhishTank database
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Note: A URL not being in the database doesn't guarantee it's safe. Always exercise caution.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolCard>
  );
}

function CVEPriorityTool() {
  const [cveInput, setCveInput] = useState("");
  const [priorityResults, setPriorityResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const analyzePriority = async () => {
    if (!cveInput.trim()) return;
    setIsLoading(true);
    try {
      const cveIds = cveInput.split(/[,\n\s]+/).filter(id => id.trim()).map(id => id.trim().toUpperCase());
      const res = await fetch(`/api/cves/priority`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cveIds })
      });
      if (res.ok) {
        const data = await res.json();
        setPriorityResults(data.results || []);
      }
    } catch (error) {
      console.error('Priority analysis failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (score: number) => {
    if (score >= 0.7) return 'text-red-500 bg-red-500/20';
    if (score >= 0.4) return 'text-orange-500 bg-orange-500/20';
    if (score >= 0.1) return 'text-yellow-500 bg-yellow-500/20';
    return 'text-green-500 bg-green-500/20';
  };

  const getPriorityLabel = (score: number) => {
    if (score >= 0.7) return 'CRITICAL - Patch Immediately';
    if (score >= 0.4) return 'HIGH - Patch This Week';
    if (score >= 0.1) return 'MEDIUM - Schedule Patch';
    return 'LOW - Monitor';
  };

  return (
    <ToolCard
      title="CVE Patch Prioritization"
      description="Prioritize which vulnerabilities to patch first using EPSS (Exploit Prediction Scoring System) data"
      icon={Shield}
      tier="free"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Enter CVE IDs (comma or newline separated)</label>
          <textarea
            value={cveInput}
            onChange={(e) => setCveInput(e.target.value)}
            placeholder="CVE-2024-1234, CVE-2024-5678&#10;CVE-2023-9999"
            className="w-full h-24 px-3 py-2 bg-background border border-white/10 rounded-md text-sm text-white placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50"
            data-testid="input-cve-priority"
          />
        </div>
        <Button 
          onClick={analyzePriority} 
          disabled={isLoading || !cveInput.trim()}
          className="w-full"
          data-testid="button-analyze-priority"
        >
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Shield className="h-4 w-4 mr-2" />}
          Analyze Patch Priority
        </Button>
        
        {priorityResults.length > 0 && (
          <div className="space-y-3 mt-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-400" />
              Priority Rankings (Highest First)
            </h4>
            <div className="space-y-2">
              {priorityResults.sort((a, b) => (b.epssScore || 0) - (a.epssScore || 0)).map((cve, idx) => (
                <div key={cve.cveId || idx} className="p-3 rounded-lg border border-white/10 bg-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-400">#{idx + 1}</span>
                      <Badge variant="outline" className="font-mono">{cve.cveId}</Badge>
                      {cve.inCisaKev && (
                        <Badge className="bg-red-600 text-white text-[10px]">CISA KEV</Badge>
                      )}
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-bold ${getPriorityColor(cve.epssScore || 0)}`}>
                      {((cve.epssScore || 0) * 100).toFixed(1)}% exploit probability
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{cve.description || 'No description available'}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-medium ${getPriorityColor(cve.epssScore || 0).split(' ')[0]}`}>
                      {getPriorityLabel(cve.epssScore || 0)}
                    </span>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {cve.cweId && <span>CWE: {cve.cweId}</span>}
                      <span>CVSS: {cve.score?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </div>
                  <Progress value={(cve.epssScore || 0) * 100} className="h-1 mt-2" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolCard>
  );
}

function IPReputationAggregator() {
  const [ipInput, setIpInput] = useState("");
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkReputation = async () => {
    if (!ipInput.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/ip/reputation/${encodeURIComponent(ipInput.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (error) {
      console.error('IP reputation check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-500';
    if (score >= 50) return 'text-orange-500';
    if (score >= 20) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <ToolCard
      title="IP Reputation Aggregator"
      description="Check any IP against all our threat intelligence feeds for a unified risk assessment"
      icon={Globe}
      tier="free"
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={ipInput}
            onChange={(e) => setIpInput(e.target.value)}
            placeholder="Enter IP address (e.g., 8.8.8.8)"
            className="bg-background border-white/10"
            data-testid="input-ip-reputation"
          />
          <Button 
            onClick={checkReputation}
            disabled={isLoading || !ipInput.trim()}
            data-testid="button-check-reputation"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
          </Button>
        </div>
        
        {results && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-white/10 bg-gradient-to-r from-zinc-900 to-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-white">{results.ip}</h4>
                <div className={`text-2xl font-bold ${getRiskColor(results.riskScore || 0)}`}>
                  {results.riskScore || 0}/100
                </div>
              </div>
              <Progress value={results.riskScore || 0} className="h-2 mb-3" />
              <div className="grid grid-cols-2 gap-3 text-sm">
                {results.country && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{results.country}</span>
                  </div>
                )}
                {results.isp && (
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{results.isp}</span>
                  </div>
                )}
                {results.asn && (
                  <div className="flex items-center gap-2">
                    <Network className="h-4 w-4 text-muted-foreground" />
                    <span>{results.asn}</span>
                  </div>
                )}
                {results.threatType && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-400" />
                    <span className="text-orange-400">{results.threatType}</span>
                  </div>
                )}
              </div>
            </div>
            
            {results.feedMatches && results.feedMatches.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  Found in {results.feedMatches.length} Threat Feed(s)
                </h4>
                <div className="space-y-1">
                  {results.feedMatches.map((feed: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-red-500/10 border border-red-500/20">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-red-500/50 text-red-400">{feed.source}</Badge>
                        <span className="text-xs text-muted-foreground">{feed.threatType}</span>
                      </div>
                      {feed.lastSeen && (
                        <span className="text-xs text-muted-foreground">
                          Last seen: {new Date(feed.lastSeen).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {results.feedMatches && results.feedMatches.length === 0 && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2 text-green-400">
                  <Check className="h-4 w-4" />
                  <span className="font-medium">Not found in any threat feeds</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This IP is not currently listed in our threat intelligence databases.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </ToolCard>
  );
}

export default function ToolsPage() {
  useDocumentTitle("Free Security Tools | STB Cybersecurity", "Free cybersecurity tools: IP/Domain WHOIS, Port Scanner, SSL Checker, Password Checker, Hash Analyzer, Email Header Analyzer, and more. No account needed.");
  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Security Tools</h1>
            <p className="text-muted-foreground mt-1">
              Professional cybersecurity utilities for threat intelligence and network reconnaissance.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-green-600 text-white px-3 py-1">
              <Wifi className="h-3 w-3 mr-1" /> Free: 10 requests/min
            </Badge>
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1">
              <Crown className="h-3 w-3 mr-1" /> Pro: 60 requests/min
            </Badge>
          </div>
        </div>

        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Crown className="h-6 w-6 text-amber-400" />
                <div>
                  <h3 className="font-bold text-white">Upgrade to Pro for Unlimited Access</h3>
                  <p className="text-sm text-muted-foreground">
                    Get unlimited tool usage, advanced port scanning, priority support, and more.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="border-white/20" asChild>
                  <a href="mailto:info@stbcybersecurity.com">
                    <Mail className="h-4 w-4 mr-2" /> Contact Sales
                  </a>
                </Button>
                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold" asChild>
                  <a href="/support#pricing">
                    <Crown className="h-4 w-4 mr-2" /> Upgrade to Pro
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="bg-background border border-white/10" data-testid="tabs-tools">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary/20">All Tools</TabsTrigger>
            <TabsTrigger value="network" className="data-[state=active]:bg-primary/20">Network</TabsTrigger>
            <TabsTrigger value="email" className="data-[state=active]:bg-primary/20">Email Security</TabsTrigger>
            <TabsTrigger value="threat" className="data-[state=active]:bg-primary/20">Threat Intel</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-primary/20">Analytics</TabsTrigger>
            <TabsTrigger value="subscribe" className="data-[state=active]:bg-primary/20">Newsletter</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CVEPriorityTool />
              <IPReputationAggregator />
              <IpLookupTool />
              <ShodanLookupTool />
              <DomainLookupTool />
              <PortScanTool />
              <NmapScanTool />
              <SSLLabsTool />
              <EmailSecurityTool />
              <ThreatCheckTool />
              <ThreatFoxTool />
              <MalwareBazaarTool />
              <URLScanTool />
              <PhishTankTool />
              <NewsletterSubscribeTool />
            </div>
          </TabsContent>

          <TabsContent value="network" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <IpLookupTool />
              <DomainLookupTool />
              <PortScanTool />
              <NmapScanTool />
              <SSLLabsTool />
              <ShodanLookupTool />
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EmailSecurityTool />
              <PhishTankTool />
            </div>
          </TabsContent>

          <TabsContent value="threat" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ThreatCheckTool />
              <ThreatFoxTool />
              <MalwareBazaarTool />
              <URLScanTool />
              <ShodanLookupTool />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <CVEPriorityTool />
              <IPReputationAggregator />
            </div>
          </TabsContent>

          <TabsContent value="subscribe" className="space-y-6">
            <div className="max-w-xl mx-auto">
              <NewsletterSubscribeTool />
            </div>
          </TabsContent>
        </Tabs>

        <Card className="border-white/5 bg-card/50">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="font-bold text-white text-lg">Need Custom Solutions?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Contact STBCS for enterprise API access, custom integrations, and B2B threat intelligence services.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline" className="border-white/20" asChild>
                  <a href="mailto:sales@stbcybersecurity.com">
                    <Mail className="h-4 w-4 mr-2" /> sales@stbcybersecurity.com
                  </a>
                </Button>
                <Button variant="outline" className="border-white/20" asChild>
                  <a href="mailto:support@stbcybersecurity.com">
                    <Mail className="h-4 w-4 mr-2" /> support@stbcybersecurity.com
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground pb-4">
          <p>
            These tools are provided for legitimate security research and educational purposes only. 
            Unauthorized scanning of systems you do not own may be illegal.
          </p>
        </div>
        <Footer />
      </div>
    </Layout>
  );
}
