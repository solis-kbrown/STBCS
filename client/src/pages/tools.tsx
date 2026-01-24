import { useState } from "react";
import Layout from "@/components/layout";
import Footer from "@/components/footer";
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
  ExternalLink
} from "lucide-react";
import { 
  useIpLookup, 
  useDomainLookup, 
  usePortScan, 
  useThreatCheck,
  useDnsLookup,
  IpLookupResult, 
  DomainLookupResult, 
  PortScanResult, 
  ThreatCheckResult 
} from "@/lib/api";
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

export default function ToolsPage() {
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
                  <a href="mailto:info@stoptbcs.com">
                    <Mail className="h-4 w-4 mr-2" /> Contact Sales
                  </a>
                </Button>
                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold">
                  <Crown className="h-4 w-4 mr-2" /> Upgrade to Pro
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="bg-background border border-white/10" data-testid="tabs-tools">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary/20">All Tools</TabsTrigger>
            <TabsTrigger value="network" className="data-[state=active]:bg-primary/20">Network</TabsTrigger>
            <TabsTrigger value="threat" className="data-[state=active]:bg-primary/20">Threat Intel</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <IpLookupTool />
              <DomainLookupTool />
              <PortScanTool />
              <ThreatCheckTool />
            </div>
          </TabsContent>

          <TabsContent value="network" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <IpLookupTool />
              <DomainLookupTool />
              <PortScanTool />
            </div>
          </TabsContent>

          <TabsContent value="threat" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ThreatCheckTool />
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
                  <a href="mailto:sales@stoptbcs.com">
                    <Mail className="h-4 w-4 mr-2" /> sales@stoptbcs.com
                  </a>
                </Button>
                <Button variant="outline" className="border-white/20" asChild>
                  <a href="mailto:support@stoptbcs.com">
                    <Mail className="h-4 w-4 mr-2" /> support@stoptbcs.com
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
