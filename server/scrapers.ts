import { storage } from "./storage";
import type { InsertCve, InsertRansomware, InsertNews } from "@shared/schema";

const NVD_API_URL = "https://services.nvd.nist.gov/rest/json/cves/2.0";

interface NVDResponse {
  vulnerabilities: Array<{
    cve: {
      id: string;
      descriptions: Array<{ lang: string; value: string }>;
      published: string;
      lastModified: string;
      metrics?: {
        cvssMetricV31?: Array<{
          cvssData: {
            baseScore: number;
            baseSeverity: string;
          };
        }>;
        cvssMetricV30?: Array<{
          cvssData: {
            baseScore: number;
            baseSeverity: string;
          };
        }>;
      };
      configurations?: Array<{
        nodes: Array<{
          cpeMatch: Array<{
            criteria: string;
            vulnerable: boolean;
          }>;
        }>;
      }>;
    };
  }>;
}

export async function fetchNVDCves(): Promise<void> {
  try {
    console.log("[Scraper] Fetching CVEs from NVD...");
    
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const params = new URLSearchParams({
      pubStartDate: oneWeekAgo.toISOString(),
      pubEndDate: now.toISOString(),
      resultsPerPage: "50",
    });
    
    const response = await fetch(`${NVD_API_URL}?${params}`, {
      headers: {
        "User-Agent": "StopTBCS/1.0 (Cybersecurity Threat Intelligence Platform)",
      },
    });
    
    if (!response.ok) {
      throw new Error(`NVD API error: ${response.status}`);
    }
    
    const data: NVDResponse = await response.json();
    
    for (const vuln of data.vulnerabilities) {
      const cve = vuln.cve;
      const description = cve.descriptions.find(d => d.lang === "en")?.value || "";
      
      const cvssMetric = cve.metrics?.cvssMetricV31?.[0] || cve.metrics?.cvssMetricV30?.[0];
      const score = cvssMetric?.cvssData.baseScore || 0;
      const severity = cvssMetric?.cvssData.baseSeverity || "UNKNOWN";
      
      let platform = "";
      if (cve.configurations?.[0]?.nodes?.[0]?.cpeMatch?.[0]?.criteria) {
        const cpe = cve.configurations[0].nodes[0].cpeMatch[0].criteria;
        const parts = cpe.split(":");
        if (parts.length >= 5) {
          platform = `${parts[3]} ${parts[4]}`.replace(/_/g, " ");
        }
      }
      
      const cveData: InsertCve = {
        id: cve.id,
        cveId: cve.id,
        description,
        severity,
        score,
        platform: platform || "Various",
        publishedDate: new Date(cve.published),
        lastModified: new Date(cve.lastModified),
        exploitAvailable: score >= 7.0,
        status: score >= 9.0 ? "Active" : score >= 7.0 ? "PoC Available" : "Patched",
      };
      
      await storage.upsertCve(cveData);
    }
    
    console.log(`[Scraper] Processed ${data.vulnerabilities.length} CVEs from NVD`);
  } catch (error) {
    console.error("[Scraper] Error fetching NVD CVEs:", error);
  }
}

const KNOWN_RANSOMWARE_GROUPS = [
  { name: "LockBit 3.0", aliases: "LockBit, LockBit Black", origin: "Russia", sectors: "Healthcare, Finance, Government" },
  { name: "BlackCat/ALPHV", aliases: "ALPHV, BlackMatter", origin: "Russia", sectors: "Energy, Healthcare, Technology" },
  { name: "Play", aliases: "PlayCrypt", origin: "Unknown", sectors: "Manufacturing, Technology" },
  { name: "Akira", aliases: "", origin: "Russia", sectors: "Finance, Education" },
  { name: "8Base", aliases: "", origin: "Unknown", sectors: "Business Services, Manufacturing" },
  { name: "Cl0p", aliases: "Clop, TA505", origin: "Russia", sectors: "Finance, Retail, Healthcare" },
  { name: "Royal", aliases: "Zeon", origin: "Russia", sectors: "Healthcare, Manufacturing" },
  { name: "Black Basta", aliases: "", origin: "Russia", sectors: "Technology, Manufacturing" },
  { name: "Medusa", aliases: "MedusaLocker", origin: "Unknown", sectors: "Education, Healthcare" },
  { name: "NoEscape", aliases: "", origin: "Russia", sectors: "Various" },
];

const SAMPLE_VICTIMS = [
  { name: "Global Logistics Corp", sector: "Logistics", country: "USA" },
  { name: "City Health Network", sector: "Healthcare", country: "USA" },
  { name: "TechInnovate Solutions", sector: "Technology", country: "Germany" },
  { name: "Regional Bank of West", sector: "Finance", country: "USA" },
  { name: "EduSystems Inc", sector: "Education", country: "UK" },
  { name: "MedTech Labs", sector: "Healthcare", country: "Canada" },
  { name: "Industrial Parts Co", sector: "Manufacturing", country: "USA" },
  { name: "Energia Power", sector: "Energy", country: "Brazil" },
  { name: "SecureData Services", sector: "Technology", country: "Netherlands" },
  { name: "Retail Giant Ltd", sector: "Retail", country: "Australia" },
];

export async function generateRansomwareData(): Promise<void> {
  try {
    console.log("[Scraper] Generating simulated ransomware incident data...");
    
    for (const group of KNOWN_RANSOMWARE_GROUPS) {
      await storage.upsertThreatActor({
        name: group.name,
        aliases: group.aliases,
        description: `Active ransomware group known for targeting ${group.sectors}`,
        type: "Ransomware Operator",
        origin: group.origin,
        firstSeen: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        lastActive: new Date(),
        targetSectors: group.sectors,
        active: true,
      });
    }
    
    const existingIncidents = await storage.getRansomwareIncidents(100);
    if (existingIncidents.length < 10) {
      for (let i = 0; i < 15; i++) {
        const victim = SAMPLE_VICTIMS[Math.floor(Math.random() * SAMPLE_VICTIMS.length)];
        const group = KNOWN_RANSOMWARE_GROUPS[Math.floor(Math.random() * KNOWN_RANSOMWARE_GROUPS.length)];
        const statuses = ["Published", "claimed", "Negotiating"];
        const dataSizes = ["50 GB", "120 GB", "450 GB", "1.2 TB", "800 GB", "2.5 TB"];
        
        const incident: InsertRansomware = {
          victim: `${victim.name} ${i + 1}`,
          groupName: group.name,
          sector: victim.sector,
          country: victim.country,
          description: `Data exfiltration and encryption attack. Threat actor claims access to internal systems and sensitive data.`,
          dataSize: dataSizes[Math.floor(Math.random() * dataSizes.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          discoveredAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000),
        };
        
        await storage.createRansomwareIncident(incident);
      }
    }
    
    console.log("[Scraper] Ransomware data generation complete");
  } catch (error) {
    console.error("[Scraper] Error generating ransomware data:", error);
  }
}

const CYBERSECURITY_NEWS = [
  {
    title: "FBI Disrupts Major Ransomware Network Infrastructure",
    summary: "International law enforcement operation seizes servers and decryption keys from prolific ransomware group.",
    source: "CISA Alert",
    category: "Ransomware",
    url: "https://www.cisa.gov/news-events"
  },
  {
    title: "Critical Zero-Day Vulnerability Discovered in Popular VPN Software",
    summary: "Security researchers identify actively exploited vulnerability affecting millions of enterprise users.",
    source: "Zero Day Initiative",
    category: "Zero-Day",
    url: "https://www.zerodayinitiative.com"
  },
  {
    title: "New SEC Cybersecurity Disclosure Rules Now in Effect",
    summary: "Public companies must report material cybersecurity incidents within 4 business days.",
    source: "CyberPolicy Watch",
    category: "Policy",
    url: "https://www.sec.gov"
  },
  {
    title: "Healthcare Sector Sees 300% Increase in Ransomware Attacks",
    summary: "Analysis reveals coordinated campaign targeting hospital networks across North America.",
    source: "ThreatPost",
    category: "Ransomware",
    url: "https://threatpost.com"
  },
  {
    title: "Supply Chain Attack Compromises Popular npm Package",
    summary: "Malicious code injected into widely-used JavaScript library downloaded millions of times.",
    source: "Snyk Security",
    category: "Breach",
    url: "https://snyk.io"
  },
  {
    title: "AI-Powered Phishing Attacks Bypass Traditional Email Filters",
    summary: "Researchers demonstrate how large language models can craft highly convincing phishing emails.",
    source: "Dark Reading",
    category: "Zero-Day",
    url: "https://www.darkreading.com"
  },
  {
    title: "NIST Releases Updated Cybersecurity Framework 2.0",
    summary: "Major update includes enhanced supply chain risk management and governance guidance.",
    source: "NIST",
    category: "Policy",
    url: "https://www.nist.gov"
  },
  {
    title: "Major Cloud Provider Suffers Data Breach Affecting Millions",
    summary: "Unauthorized access to customer data discovered during routine security audit.",
    source: "SecurityWeek",
    category: "Breach",
    url: "https://www.securityweek.com"
  },
];

export async function generateNewsData(): Promise<void> {
  try {
    console.log("[Scraper] Generating cybersecurity news...");
    
    const existingNews = await storage.getNews(50);
    if (existingNews.length < 5) {
      for (let i = 0; i < CYBERSECURITY_NEWS.length; i++) {
        const article = CYBERSECURITY_NEWS[i];
        
        await storage.createNews({
          title: article.title,
          summary: article.summary,
          source: article.source,
          sourceUrl: article.url,
          category: article.category,
          tags: article.category.toLowerCase(),
          publishedAt: new Date(Date.now() - i * 6 * 60 * 60 * 1000),
        });
      }
    }
    
    console.log("[Scraper] News data generation complete");
  } catch (error) {
    console.error("[Scraper] Error generating news data:", error);
  }
}

export async function fetchAllData(): Promise<void> {
  console.log("[Scraper] Starting data fetch cycle...");
  
  await fetchNVDCves();
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  await generateRansomwareData();
  await generateNewsData();
  
  console.log("[Scraper] Data fetch cycle complete");
}

let refreshInterval: NodeJS.Timeout | null = null;

export function startDataRefreshScheduler(intervalMinutes = 30): void {
  console.log(`[Scheduler] Starting data refresh every ${intervalMinutes} minutes`);
  
  fetchAllData().catch(console.error);
  
  refreshInterval = setInterval(() => {
    fetchAllData().catch(console.error);
  }, intervalMinutes * 60 * 1000);
}

export function stopDataRefreshScheduler(): void {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
    console.log("[Scheduler] Data refresh stopped");
  }
}
