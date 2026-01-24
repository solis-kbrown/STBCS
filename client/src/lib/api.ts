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
    },
  });
}
