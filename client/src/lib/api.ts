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
