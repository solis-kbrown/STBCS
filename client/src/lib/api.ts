import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Cve {
  id: string;
  cveId: string;
  description: string | null;
  severity: string | null;
  score: number | null;
  platform: string | null;
  vendor: string | null;
  status: string | null;
  publishedDate: string | null;
  lastModified: string | null;
  references: string | null;
  exploitAvailable: boolean | null;
  epssScore: number | null;
  epssPercentile: number | null;
  cweId: string | null;
  cweName: string | null;
  inCisaKev: boolean | null;
  affectedProducts: string | null;
  createdAt: string | null;
}

export interface RansomwareIncident {
  id: string;
  victim: string;
  groupName: string;
  sector: string | null;
  country: string | null;
  description: string | null;
  dataSize: string | null;
  status: string | null;
  website: string | null;
  discoveredAt: string | null;
  deadline: string | null;
  createdAt: string | null;
  postUrl: string | null;
  screenshotUrl: string | null;
  proofUrl: string | null;
  activity: string | null;
  sourceApi: string | null;
  ransomAmount: string | null;
  ransomCurrency: string | null;
  bitcoinWallet: string | null;
  paymentStatus: string | null;
  attackVector: string | null;
  victimRevenue: string | null;
  employeeCount: string | null;
}

export interface ThreatActor {
  id: string;
  name: string;
  aliases: string | null;
  description: string | null;
  type: string | null;
  origin: string | null;
  firstSeen: string | null;
  lastActive: string | null;
  ttps: string | null;
  targetSectors: string | null;
  active: boolean | null;
  createdAt: string | null;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string | null;
  content: string | null;
  source: string | null;
  sourceUrl: string | null;
  category: string | null;
  tags: string | null;
  publishedAt: string | null;
  createdAt: string | null;
}

export interface DashboardStats {
  activeGroups: number;
  criticalCves: number;
  activeExploits: number;
  totalIncidents: number;
  maliciousIps: number;
  maliciousUrls: number;
  cisaKevCount: number;
}

export interface MaliciousIp {
  id: string;
  ipAddress: string;
  source: string;
  threatType: string | null;
  riskScore: number | null;
  country: string | null;
  asn: string | null;
  lastSeen: string | null;
  firstSeen: string | null;
  reportCount: number | null;
  abuseConfidenceScore: number | null;
  isp: string | null;
  domain: string | null;
  usageType: string | null;
  reverseDns: string | null;
  openPorts: string | null;
  tags: string | null;
  createdAt: string | null;
}

export interface MaliciousUrl {
  id: string;
  url: string;
  source: string;
  threatType: string | null;
  status: string | null;
  malwareFamily: string | null;
  country: string | null;
  hostIp: string | null;
  lastOnline: string | null;
  reportedAt: string | null;
  createdAt: string | null;
}

export interface CisaKev {
  id: string;
  cveId: string;
  vendorProject: string | null;
  product: string | null;
  vulnerabilityName: string | null;
  dateAdded: string | null;
  shortDescription: string | null;
  requiredAction: string | null;
  dueDate: string | null;
  knownRansomware: boolean | null;
  notes: string | null;
  createdAt: string | null;
}

export interface ThreatFeed {
  id: string;
  name: string;
  url: string;
  feedType: string | null;
  updateFrequency: string | null;
  lastFetched: string | null;
  isActive: boolean | null;
  requiresProTier: boolean | null;
  description: string | null;
  createdAt: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

async function fetchApi<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

export function useStats() {
  return useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
    queryFn: () => fetchApi<DashboardStats>("/api/stats"),
    refetchInterval: 60000,
  });
}

export function useCves(limit = 50, offset = 0, search?: string) {
  const queryString = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    ...(search && { search }),
  }).toString();
  
  return useQuery<PaginatedResponse<Cve>>({
    queryKey: ["/api/cves", limit, offset, search],
    queryFn: () => fetchApi<PaginatedResponse<Cve>>(`/api/cves?${queryString}`),
    refetchInterval: 120000,
  });
}

export function useRansomware(limit = 50, offset = 0, group?: string, sector?: string) {
  const queryString = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    ...(group && { group }),
    ...(sector && { sector }),
  }).toString();
  
  return useQuery<PaginatedResponse<RansomwareIncident>>({
    queryKey: ["/api/ransomware", limit, offset, group, sector],
    queryFn: () => fetchApi<PaginatedResponse<RansomwareIncident>>(`/api/ransomware?${queryString}`),
    refetchInterval: 120000,
  });
}

export function useRansomwareGroups() {
  return useQuery<{ name: string; count: number }[]>({
    queryKey: ["/api/ransomware/groups"],
    queryFn: () => fetchApi<{ name: string; count: number }[]>("/api/ransomware/groups"),
    refetchInterval: 300000,
  });
}

export function useRansomwareSearch(query: string) {
  return useQuery<{ data: RansomwareIncident[]; query: string; count: number }>({
    queryKey: ["/api/ransomware/search", query],
    queryFn: () => fetchApi<{ data: RansomwareIncident[]; query: string; count: number }>(
      `/api/ransomware/search?q=${encodeURIComponent(query)}`
    ),
    enabled: query.length >= 2,
  });
}

export function useThreatActors(limit = 50) {
  return useQuery<ThreatActor[]>({
    queryKey: ["/api/threat-actors", limit],
    queryFn: () => fetchApi<ThreatActor[]>(`/api/threat-actors?limit=${limit}`),
    refetchInterval: 300000,
  });
}

export function useNews(limit = 50, offset = 0, category?: string) {
  const queryString = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    ...(category && { category }),
  }).toString();
  
  return useQuery<PaginatedResponse<NewsArticle>>({
    queryKey: ["/api/news", limit, offset, category],
    queryFn: () => fetchApi<PaginatedResponse<NewsArticle>>(`/api/news?${queryString}`),
    refetchInterval: 120000,
  });
}

export function useMaliciousIps(limit = 50, offset = 0, source?: string, threatType?: string) {
  const queryString = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    ...(source && { source }),
    ...(threatType && { threatType }),
  }).toString();
  
  return useQuery<PaginatedResponse<MaliciousIp>>({
    queryKey: ["/api/malicious-ips", limit, offset, source, threatType],
    queryFn: () => fetchApi<PaginatedResponse<MaliciousIp>>(`/api/malicious-ips?${queryString}`),
    refetchInterval: 120000,
  });
}

export function useMaliciousUrls(limit = 50, offset = 0, source?: string, threatType?: string) {
  const queryString = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    ...(source && { source }),
    ...(threatType && { threatType }),
  }).toString();
  
  return useQuery<PaginatedResponse<MaliciousUrl>>({
    queryKey: ["/api/malicious-urls", limit, offset, source, threatType],
    queryFn: () => fetchApi<PaginatedResponse<MaliciousUrl>>(`/api/malicious-urls?${queryString}`),
    refetchInterval: 120000,
  });
}

export function useCisaKev(limit = 50, offset = 0) {
  const queryString = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  }).toString();
  
  return useQuery<PaginatedResponse<CisaKev>>({
    queryKey: ["/api/cisa-kev", limit, offset],
    queryFn: () => fetchApi<PaginatedResponse<CisaKev>>(`/api/cisa-kev?${queryString}`),
    refetchInterval: 300000,
  });
}

export function useThreatFeeds() {
  return useQuery<ThreatFeed[]>({
    queryKey: ["/api/threat-feeds"],
    queryFn: () => fetchApi<ThreatFeed[]>("/api/threat-feeds"),
    refetchInterval: 600000,
  });
}

export interface SearchResults {
  query: string;
  totalResults: number;
  cves: Cve[];
  ransomware: RansomwareIncident[];
  ips: MaliciousIp[];
  urls: MaliciousUrl[];
  kev: CisaKev[];
  news: NewsArticle[];
}

export interface AdminStats {
  totalCves: number;
  totalRansomware: number;
  totalIps: number;
  totalUrls: number;
  totalKev: number;
  totalNews: number;
  totalUsers: number;
  oldestRecord: string | null;
}

export function useGlobalSearch(query: string, limit = 20) {
  return useQuery<SearchResults>({
    queryKey: ["/api/search", query, limit],
    queryFn: () => fetchApi<SearchResults>(`/api/search?q=${encodeURIComponent(query)}&limit=${limit}`),
    enabled: query.length >= 2,
    staleTime: 30000,
  });
}

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    queryFn: () => fetchApi<AdminStats>("/api/admin/stats"),
    refetchInterval: 300000, // 5 minutes
  });
}

export function useExportData() {
  return useMutation({
    mutationFn: async (type: 'cves' | 'ips' | 'urls' | 'kev' | 'ransomware') => {
      const response = await fetch(`/api/export/${type}`);
      if (!response.ok) throw new Error("Failed to export data");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_export_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return { success: true };
    },
  });
}

export function useRefreshData() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/refresh", { method: "POST" });
      if (!response.ok) throw new Error("Failed to refresh data");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cves"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ransomware"] });
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      queryClient.invalidateQueries({ queryKey: ["/api/malicious-ips"] });
      queryClient.invalidateQueries({ queryKey: ["/api/malicious-urls"] });
      queryClient.invalidateQueries({ queryKey: ["/api/cisa-kev"] });
      queryClient.invalidateQueries({ queryKey: ["/api/threat-feeds"] });
    },
  });
}

export interface IpLookupResult {
  ip: string;
  hostname?: string;
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  as?: string;
  asn?: string;
  reverse?: string[];
  isProxy?: boolean;
  isHosting?: boolean;
  isMobile?: boolean;
}

export interface DomainLookupResult {
  domain: string;
  registrar?: string;
  creationDate?: string;
  expirationDate?: string;
  updatedDate?: string;
  nameServers?: string[];
  status?: string[];
  dnssec?: string;
  aRecords?: string[];
  aaaaRecords?: string[];
  mxRecords?: { exchange: string; priority: number }[];
  txtRecords?: string[];
  nsRecords?: string[];
}

export interface PortScanResult {
  target: string;
  ip: string;
  scannedAt: string;
  ports: { ip: string; port: number; open: boolean; service?: string; responseTime?: number }[];
  openPorts: { ip: string; port: number; open: boolean; service?: string; responseTime?: number }[];
  tier: 'free' | 'pro';
}

export interface ThreatCheckResult {
  ip: string;
  isThreat: boolean;
  message?: string;
  threatDetails?: {
    source: string;
    threatType: string;
    riskScore?: number;
    lastSeen?: string;
    country?: string;
  };
}

export function useIpLookup() {
  return useMutation({
    mutationFn: async (ip: string): Promise<IpLookupResult> => {
      const response = await fetch(`/api/tools/ip-lookup?ip=${encodeURIComponent(ip)}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to lookup IP");
      }
      return response.json();
    },
  });
}

export function useDomainLookup() {
  return useMutation({
    mutationFn: async (domain: string): Promise<DomainLookupResult> => {
      const response = await fetch(`/api/tools/domain-lookup?domain=${encodeURIComponent(domain)}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to lookup domain");
      }
      return response.json();
    },
  });
}

export function usePortScan() {
  return useMutation({
    mutationFn: async ({ target }: { target: string }): Promise<PortScanResult> => {
      // Note: Pro tier port scanning requires authentication (not yet implemented)
      const response = await fetch(`/api/tools/port-scan?target=${encodeURIComponent(target)}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to scan ports");
      }
      return response.json();
    },
  });
}

// ==========================================
// ADVANCED NMAP SCANNER (Pro/Business)
// ==========================================

export interface NmapScanRequest {
  target: string;
  scanType: 'quick' | 'standard' | 'comprehensive';
  customPorts?: string;
  grabBanners?: boolean;
}

export interface AdvancedScanResult {
  ip: string;
  port: number;
  state: 'open' | 'closed' | 'filtered';
  service: string;
  version?: string;
  banner?: string;
  responseTime: number;
}

export interface NmapScanResponse {
  success: boolean;
  scan: {
    target: string;
    scanType: 'quick' | 'standard' | 'comprehensive';
    startTime: string;
    endTime: string;
    duration: number;
    portsScanned: number;
    openPorts: number;
    closedPorts: number;
    filteredPorts: number;
    results: AdvancedScanResult[];
    hostUp: boolean;
  };
  usage: {
    scansToday: number;
    dailyLimit: number;
    tier: string;
  };
}

export interface NmapUsageStats {
  scansToday: number;
  dailyLimit: number;
  scansRemaining: number;
  cooldownRemaining: number;
  tier: string;
}

export function useNmapScan() {
  return useMutation({
    mutationFn: async (request: NmapScanRequest): Promise<NmapScanResponse> => {
      const response = await fetch('/api/tools/nmap-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(request),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to run scan");
      }
      return response.json();
    },
  });
}

export function useNmapUsage() {
  return useQuery({
    queryKey: ['/api/tools/nmap-scan/usage'],
    queryFn: async (): Promise<NmapUsageStats> => {
      const response = await fetch('/api/tools/nmap-scan/usage', {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error("Failed to get usage stats");
      }
      return response.json();
    },
    enabled: true,
    staleTime: 30000,
  });
}

// Email Security Types
export interface MxRecord {
  priority: number;
  exchange: string;
  ip?: string;
}

export interface MxLookupResult {
  domain: string;
  records: MxRecord[];
  valid: boolean;
  timestamp: string;
}

export interface SpfLookupResult {
  domain: string;
  record: string | null;
  valid: boolean;
  policy: string;
  includes: string[];
  mechanisms: string[];
  timestamp: string;
}

export interface DkimLookupResult {
  domain: string;
  selector: string;
  record: string | null;
  valid: boolean;
  keyType: string | null;
  publicKey: string | null;
  timestamp: string;
}

export interface DmarcLookupResult {
  domain: string;
  record: string | null;
  valid: boolean;
  policy: string;
  subdomainPolicy: string;
  reportEmail: string[];
  forensicEmail: string[];
  percentage: number;
  timestamp: string;
}

export interface EmailSecurityResult {
  domain: string;
  overallScore: number;
  grade: string;
  mx: MxLookupResult;
  spf: SpfLookupResult;
  dkim: DkimLookupResult;
  dmarc: DmarcLookupResult;
  recommendations: string[];
  timestamp: string;
}

// Email Security Hooks
export function useMxLookup() {
  return useMutation({
    mutationFn: async (domain: string): Promise<MxLookupResult> => {
      const response = await fetch('/api/tools/mx-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to lookup MX records");
      }
      return response.json();
    },
  });
}

export function useSpfLookup() {
  return useMutation({
    mutationFn: async (domain: string): Promise<SpfLookupResult> => {
      const response = await fetch('/api/tools/spf-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to lookup SPF record");
      }
      return response.json();
    },
  });
}

export function useDkimLookup() {
  return useMutation({
    mutationFn: async ({ domain, selector }: { domain: string; selector?: string }): Promise<DkimLookupResult> => {
      const response = await fetch('/api/tools/dkim-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, selector }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to lookup DKIM record");
      }
      return response.json();
    },
  });
}

export function useDmarcLookup() {
  return useMutation({
    mutationFn: async (domain: string): Promise<DmarcLookupResult> => {
      const response = await fetch('/api/tools/dmarc-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to lookup DMARC record");
      }
      return response.json();
    },
  });
}

export function useEmailSecurity() {
  return useMutation({
    mutationFn: async (domain: string): Promise<EmailSecurityResult> => {
      const response = await fetch('/api/tools/email-security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to check email security");
      }
      return response.json();
    },
  });
}

export function useThreatCheck() {
  return useMutation({
    mutationFn: async (ip: string): Promise<ThreatCheckResult> => {
      const response = await fetch(`/api/tools/threat-check?ip=${encodeURIComponent(ip)}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to check threat");
      }
      return response.json();
    },
  });
}

export function useDnsLookup() {
  return useMutation({
    mutationFn: async (domain: string) => {
      const response = await fetch(`/api/tools/dns-lookup?domain=${encodeURIComponent(domain)}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to lookup DNS");
      }
      return response.json();
    },
  });
}

// ==========================================
// PRO TIER - NOTIFICATIONS & ALERTS
// ==========================================

export interface UserNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  severity: string | null;
  relatedId: string | null;
  relatedType: string | null;
  read: boolean;
  dismissed: boolean;
  createdAt: string | null;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  itemType: string;
  itemValue: string;
  label: string | null;
  alertOnMatch: boolean;
  emailOnMatch: boolean;
  smsOnMatch: boolean;
  notes: string | null;
  createdAt: string | null;
}

export interface BreachIncident {
  id: string;
  name: string;
  domain: string | null;
  breachDate: string | null;
  addedDate: string | null;
  modifiedDate: string | null;
  pwnCount: string | null;
  description: string | null;
  dataClasses: string | null;
  isVerified: boolean;
  isFabricated: boolean;
  isSensitive: boolean;
  isRetired: boolean;
  isSpamList: boolean;
  sourceUrl: string | null;
  sourceApi: string | null;
  createdAt: string | null;
}

export function useNotifications(userId: string, limit = 50, unreadOnly = false) {
  return useQuery<{ notifications: UserNotification[]; unreadCount: number }>({
    queryKey: ["/api/notifications", userId, limit, unreadOnly],
    queryFn: () => fetchApi(`/api/notifications?userId=${userId}&limit=${limit}&unreadOnly=${unreadOnly}`),
    enabled: !!userId,
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ notificationId, userId }: { notificationId: string; userId: string }) => {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) throw new Error("Failed to mark notification as read");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch("/api/notifications/read-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) throw new Error("Failed to mark all notifications as read");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });
}

export function useWatchlist(userId: string, itemType?: string) {
  const queryString = new URLSearchParams({
    userId,
    ...(itemType && { itemType }),
  }).toString();
  
  return useQuery<{ items: WatchlistItem[]; count: number }>({
    queryKey: ["/api/watchlist", userId, itemType],
    queryFn: () => fetchApi(`/api/watchlist?${queryString}`),
    enabled: !!userId,
  });
}

export function useAddWatchlistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: Omit<WatchlistItem, 'id' | 'createdAt'>) => {
      const response = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!response.ok) throw new Error("Failed to add watchlist item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
    },
  });
}

export function useDeleteWatchlistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, userId }: { itemId: string; userId: string }) => {
      const response = await fetch(`/api/watchlist/${itemId}?userId=${userId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete watchlist item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
    },
  });
}

export function useUpdateWatchlistItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ 
      itemId, 
      updates 
    }: { 
      itemId: string; 
      updates: { label?: string; alertOnMatch?: boolean; emailOnMatch?: boolean; smsOnMatch?: boolean; notes?: string } 
    }) => {
      const response = await fetch(`/api/watchlist/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update watchlist item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watchlist"] });
    },
  });
}

export function useBreaches(limit = 50, offset = 0, search?: string) {
  const queryString = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    ...(search && { search }),
  }).toString();
  
  return useQuery<PaginatedResponse<BreachIncident>>({
    queryKey: ["/api/breaches", limit, offset, search],
    queryFn: () => fetchApi(`/api/breaches?${queryString}`),
    refetchInterval: 120000,
  });
}

export function useSearchBreaches(query: string) {
  return useQuery<{ data: BreachIncident[]; query: string; count: number }>({
    queryKey: ["/api/breaches/search", query],
    queryFn: () => fetchApi(`/api/breaches/search?q=${encodeURIComponent(query)}`),
    enabled: query.length >= 2,
  });
}

// Shodan InternetDB Lookup
export interface ShodanLookupResult {
  ip: string;
  found: boolean;
  ports: number[];
  hostnames: string[];
  vulns: string[];
  cpes: string[];
  tags: string[];
  message?: string;
  source?: string;
}

export function useShodanLookup() {
  return useMutation<ShodanLookupResult, Error, string>({
    mutationFn: async (ip: string) => {
      const response = await fetch(`/api/tools/shodan-lookup?ip=${encodeURIComponent(ip)}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Lookup failed");
      }
      return response.json();
    },
  });
}

// Newsletter Subscription
export interface NewsletterPreferences {
  ransomware: boolean;
  cves: boolean;
  news: boolean;
  breaches: boolean;
}

export interface NewsletterSubscribeData {
  email: string;
  name?: string;
  preferences?: NewsletterPreferences;
  frequency?: "daily" | "weekly" | "monthly";
}

export function useNewsletterSubscribe() {
  return useMutation<{ success: boolean; message: string; email: string }, Error, NewsletterSubscribeData>({
    mutationFn: async (data) => {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Subscription failed");
      }
      return response.json();
    },
  });
}

export function useNewsletterUnsubscribe() {
  return useMutation<{ success: boolean; message: string }, Error, { email?: string; token?: string }>({
    mutationFn: async (data) => {
      const response = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Unsubscribe failed");
      }
      return response.json();
    },
  });
}

export function useNewsletterStatus(email: string) {
  return useQuery<{
    subscribed: boolean;
    verified?: boolean;
    frequency?: string;
    preferences?: NewsletterPreferences;
    subscribedAt?: string;
  }>({
    queryKey: ["/api/newsletter/status", email],
    queryFn: () => fetchApi(`/api/newsletter/status?email=${encodeURIComponent(email)}`),
    enabled: !!email && email.includes("@"),
  });
}

// ==========================================
// FREE THREAT INTELLIGENCE APIs
// ==========================================

// ThreatFox IOC Types
export interface ThreatFoxIOC {
  id: string;
  iocType: string;
  iocValue: string;
  threatType: string;
  threatTypeDesc: string;
  malware: string;
  malwareAlias: string | null;
  malwarePrintable: string;
  confidence: number;
  firstSeen: string;
  lastSeen: string | null;
  reference: string | null;
  reporter: string;
  tags: string[];
}

export interface ThreatFoxResult {
  queryStatus: string;
  queryType: string;
  data: ThreatFoxIOC[];
  timestamp: string;
}

export function useThreatFoxLookup() {
  return useMutation<ThreatFoxResult, Error, { ioc: string; iocType?: 'ip' | 'domain' | 'url' | 'hash' }>({
    mutationFn: async (data) => {
      const response = await fetch("/api/tools/threatfox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("ThreatFox lookup failed");
      return response.json();
    },
  });
}

// Malware Bazaar Types
export interface MalwareSample {
  sha256Hash: string;
  sha1Hash: string;
  md5Hash: string;
  fileName: string | null;
  fileType: string;
  fileSize: number;
  signature: string | null;
  firstSeen: string;
  lastSeen: string | null;
  originCountry: string | null;
  imphash: string | null;
  tlsh: string | null;
  tags: string[];
  deliveryMethod: string | null;
  intelligence: {
    downloads: number;
    uploads: number;
    mailIntelligence: number;
  };
}

export interface MalwareBazaarResult {
  queryStatus: string;
  data: MalwareSample[];
  timestamp: string;
}

export function useMalwareBazaarLookup() {
  return useMutation<MalwareBazaarResult, Error, { hash: string }>({
    mutationFn: async (data) => {
      const response = await fetch("/api/tools/malware-bazaar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Malware Bazaar lookup failed");
      return response.json();
    },
  });
}

// SSL Labs Types
export interface SSLLabsResult {
  host: string;
  port: number;
  protocol: string;
  grade: string;
  gradeTrustIgnored: string;
  hasWarnings: boolean;
  isExceptional: boolean;
  progress: number;
  status: string;
  statusMessage: string;
  endpoints: {
    ipAddress: string;
    grade: string;
    hasWarnings: boolean;
    isExceptional: boolean;
    progress: number;
    statusMessage: string;
  }[];
  timestamp: string;
}

export function useSSLLabsCheck() {
  return useMutation<SSLLabsResult, Error, { host: string }>({
    mutationFn: async (data) => {
      const response = await fetch("/api/tools/ssl-labs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("SSL Labs check failed");
      return response.json();
    },
  });
}

// URLScan.io Types
export interface URLScanResult {
  uuid: string;
  url: string;
  domain: string;
  ip: string | null;
  country: string | null;
  server: string | null;
  city: string | null;
  asn: string | null;
  asnname: string | null;
  malicious: boolean;
  score: number;
  categories: string[];
  brands: string[];
  screenshotUrl: string | null;
  reportUrl: string;
  status: string;
  timestamp: string;
}

export function useURLScanSearch() {
  return useMutation<{ results: URLScanResult[]; timestamp: string }, Error, { query: string }>({
    mutationFn: async (data) => {
      const response = await fetch("/api/tools/urlscan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("URLScan.io search failed");
      return response.json();
    },
  });
}

// PhishTank Types
export interface PhishTankResult {
  url: string;
  inDatabase: boolean;
  phishId: string | null;
  verified: boolean;
  verifiedAt: string | null;
  valid: boolean;
  target: string | null;
  submissionTime: string | null;
  timestamp: string;
}

export function usePhishTankCheck() {
  return useMutation<PhishTankResult, Error, { url: string }>({
    mutationFn: async (data) => {
      const response = await fetch("/api/tools/phishtank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("PhishTank check failed");
      return response.json();
    },
  });
}

// Enhanced IP Geolocation Types
export interface EnhancedIPInfo {
  ip: string;
  hostname: string | null;
  continent: string | null;
  continentCode: string | null;
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  district: string | null;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  offset: number;
  currency: string | null;
  isp: string;
  org: string;
  as: string;
  asname: string;
  reverse: string | null;
  mobile: boolean;
  proxy: boolean;
  hosting: boolean;
  timestamp: string;
}

export function useEnhancedIPInfo(ip: string) {
  return useQuery<EnhancedIPInfo>({
    queryKey: ["/api/tools/ip-geo", ip],
    queryFn: () => fetchApi(`/api/tools/ip-geo?ip=${encodeURIComponent(ip)}`),
    enabled: !!ip && ip.length >= 7,
  });
}

// SMS Messaging Types (Pro/Business Feature)
export interface SmsMessage {
  id: string;
  externalId: string | null;
  direction: string;
  fromNumber: string;
  toNumber: string;
  content: string;
  status: string | null;
  conversationId: string | null;
  userId: string | null;
  isRead: boolean | null;
  createdAt: string | null;
}

export interface SmsConversation {
  phoneNumber: string;
  lastMessage: SmsMessage;
  unreadCount: number;
}

export function useSmsConversations() {
  return useQuery<SmsConversation[]>({
    queryKey: ["/api/messages/conversations"],
    queryFn: () => fetchApi("/api/messages/conversations"),
    refetchInterval: 30000,
  });
}

export function useConversationMessages(phoneNumber: string) {
  return useQuery<SmsMessage[]>({
    queryKey: ["/api/messages/conversation", phoneNumber],
    queryFn: () => fetchApi(`/api/messages/conversation/${encodeURIComponent(phoneNumber)}`),
    enabled: !!phoneNumber,
    refetchInterval: 15000,
  });
}

export function useSendSms() {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean; message: SmsMessage }, Error, { to: string; content: string }>({
    mutationFn: async (data) => {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send message");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversation"] });
    },
  });
}

export function useMarkConversationRead() {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (phoneNumber) => {
      const response = await fetch(`/api/messages/conversation/${encodeURIComponent(phoneNumber)}/read`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to mark conversation read");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
    },
  });
}

export function useUnreadMessageCount() {
  return useQuery<{ count: number }>({
    queryKey: ["/api/messages/unread-count"],
    queryFn: () => fetchApi("/api/messages/unread-count"),
    refetchInterval: 30000,
  });
}
