import { format } from "date-fns";

export interface RansomwareIncident {
  id: string;
  victim: string;
  group: string;
  date: string;
  sector: string;
  status: "Published" | "claimed" | "Negotiating";
  dataSize?: string;
  description: string;
  website?: string;
}

export interface Exploit {
  id: string;
  cve: string;
  name: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  score: number;
  date: string;
  platform: string;
  status: "Active" | "Patched" | "PoC Available";
  description: string;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  date: string;
  category: "Ransomware" | "Zero-Day" | "Breach" | "Policy";
  summary: string;
  url: string;
}

export const recentRansomware: RansomwareIncident[] = [
  {
    id: "r1",
    victim: "Global Logistics Corp",
    group: "LockBit 3.0",
    date: new Date().toISOString(),
    sector: "Logistics",
    status: "Published",
    dataSize: "450 GB",
    description: "Full dump of internal logistics data, employee records, and financial documents.",
    website: "lockbit...onion"
  },
  {
    id: "r2",
    victim: "City Health Network",
    group: "BlackCat/ALPHV",
    date: new Date(Date.now() - 86400000).toISOString(),
    sector: "Healthcare",
    status: "claimed",
    dataSize: "1.2 TB",
    description: "Patient records and administrative data. Timer set for 48 hours.",
  },
  {
    id: "r3",
    victim: "TechInnovate Solutions",
    group: "Play",
    date: new Date(Date.now() - 172800000).toISOString(),
    sector: "Technology",
    status: "Published",
    dataSize: "80 GB",
    description: "Source code repository and developer keys.",
  },
  {
    id: "r4",
    victim: "Regional Bank of West",
    group: "Akira",
    date: new Date(Date.now() - 259200000).toISOString(),
    sector: "Finance",
    status: "Negotiating",
    description: "Internal banking infrastructure access logs.",
  },
  {
    id: "r5",
    victim: "EduSystems Inc",
    group: "8Base",
    date: new Date(Date.now() - 345600000).toISOString(),
    sector: "Education",
    status: "Published",
    dataSize: "200 GB",
    description: "Student database and faculty emails.",
  }
];

export const topExploits: Exploit[] = [
  {
    id: "e1",
    cve: "CVE-2025-2304",
    name: "ConnectSecure RCE",
    severity: "Critical",
    score: 9.8,
    date: new Date().toISOString(),
    platform: "Ivanti Connect Secure",
    status: "Active",
    description: "Remote Code Execution vulnerability in VPN gateway allowing unauthenticated access."
  },
  {
    id: "e2",
    cve: "CVE-2025-1094",
    name: "Exchange PrivEsc",
    severity: "High",
    score: 8.8,
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    platform: "Microsoft Exchange",
    status: "PoC Available",
    description: "Privilege escalation vulnerability allowing authenticated users to gain SYSTEM rights."
  },
  {
    id: "e3",
    cve: "CVE-2025-0045",
    name: "Chrome V8 Type Confusion",
    severity: "High",
    score: 8.2,
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    platform: "Google Chrome",
    status: "Patched",
    description: "Type confusion in V8 engine used in Chrome, actively exploited in the wild."
  },
  {
    id: "e4",
    cve: "CVE-2024-5521",
    name: "SSH Terrapin Attack",
    severity: "Medium",
    score: 5.9,
    date: new Date(Date.now() - 86400000 * 10).toISOString(),
    platform: "OpenSSH",
    status: "Active",
    description: "Prefix truncation attack in SSH protocol handshake."
  }
];

export const latestNews: NewsItem[] = [
  {
    id: "n1",
    title: "FBI Disrupts Hive Ransomware Network",
    source: "CISA Alert",
    date: new Date().toISOString(),
    category: "Ransomware",
    summary: "International law enforcement operation seizes infrastructure of major ransomware group.",
    url: "#"
  },
  {
    id: "n2",
    title: "Critical Zero-Day in iOS 18.2",
    source: "Zero Day Initiative",
    date: new Date(Date.now() - 43200000).toISOString(),
    category: "Zero-Day",
    summary: "Apple releases emergency patch for actively exploited WebKit vulnerability.",
    url: "#"
  },
  {
    id: "n3",
    title: "New SEC Disclosure Rules in Effect",
    source: "CyberPolicy Watch",
    date: new Date(Date.now() - 120000000).toISOString(),
    category: "Policy",
    summary: "Public companies now required to report material cybersecurity incidents within 4 days.",
    url: "#"
  },
  {
    id: "n4",
    title: "Supply Chain Attack Hits Major Logistics Firm",
    source: "ThreatPost",
    date: new Date(Date.now() - 200000000).toISOString(),
    category: "Breach",
    summary: "Third-party vendor compromise leads to shipping delays across North America.",
    url: "#"
  }
];
