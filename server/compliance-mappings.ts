export interface ComplianceControl {
  id: string;
  name: string;
  description: string;
  stbcsMapping: string;
  checkType: "watchlist" | "uptime" | "darkweb" | "risk" | "digest" | "ssl" | "attack_surface" | "playbook" | "export" | "tool_usage" | "manual";
}

export interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  description: string;
  categories: ComplianceCategory[];
}

export interface ComplianceCategory {
  id: string;
  name: string;
  controls: ComplianceControl[];
}

export const NIST_CSF: ComplianceFramework = {
  id: "nist-csf",
  name: "NIST Cybersecurity Framework",
  version: "2.0",
  description: "The NIST CSF provides a prioritized, flexible, and cost-effective approach to managing cybersecurity risk.",
  categories: [
    {
      id: "GV",
      name: "Govern",
      controls: [
        { id: "GV.OC-01", name: "Organizational Context", description: "The organizational mission is understood and informs cybersecurity risk management", stbcsMapping: "Complete Cyber Risk Score assessment to understand your security posture", checkType: "risk" },
        { id: "GV.RM-01", name: "Risk Management Strategy", description: "Risk management objectives are established and communicated", stbcsMapping: "Use Risk Score Calculator and review threat intelligence dashboards", checkType: "risk" },
        { id: "GV.SC-01", name: "Supply Chain Risk", description: "Cyber supply chain risk management processes are established", stbcsMapping: "Monitor vendor domains with Dark Web monitoring", checkType: "darkweb" },
      ],
    },
    {
      id: "ID",
      name: "Identify",
      controls: [
        { id: "ID.AM-01", name: "Asset Management", description: "Inventories of hardware, software, and data assets are maintained", stbcsMapping: "Run Attack Surface Discovery to identify external-facing assets", checkType: "attack_surface" },
        { id: "ID.AM-02", name: "Software Inventory", description: "Software platforms and applications are inventoried", stbcsMapping: "Use Web Fingerprinting to identify technology stacks", checkType: "tool_usage" },
        { id: "ID.RA-01", name: "Risk Assessment", description: "Vulnerabilities in assets are identified and documented", stbcsMapping: "Monitor CVE database and configure vulnerability watchlists", checkType: "watchlist" },
        { id: "ID.RA-02", name: "Threat Intelligence", description: "Cyber threat intelligence is received from information sharing forums", stbcsMapping: "STBCS aggregates 160+ threat intelligence feeds automatically", checkType: "manual" },
        { id: "ID.RA-05", name: "Risk Prioritization", description: "Threats, vulnerabilities, likelihoods, and impacts are used to understand risk", stbcsMapping: "Use EPSS scores and CVSS to prioritize CVE remediation", checkType: "manual" },
      ],
    },
    {
      id: "PR",
      name: "Protect",
      controls: [
        { id: "PR.AA-01", name: "Identity Management", description: "Identities and credentials for authorized users are managed", stbcsMapping: "Monitor credential exposures with Dark Web monitoring", checkType: "darkweb" },
        { id: "PR.DS-01", name: "Data Protection", description: "Data-at-rest and data-in-transit are protected", stbcsMapping: "Use SSL/TLS Checker to verify encryption on your domains", checkType: "ssl" },
        { id: "PR.DS-02", name: "Data Integrity", description: "Data integrity checking mechanisms are employed", stbcsMapping: "Use File Scanner for hash verification of critical files", checkType: "tool_usage" },
        { id: "PR.PS-01", name: "Configuration Management", description: "Configuration management practices are established", stbcsMapping: "Use HTTP Headers Scanner to check security configurations", checkType: "tool_usage" },
        { id: "PR.IR-01", name: "Technology Resilience", description: "Recovery plans are in place", stbcsMapping: "Review and follow Incident Response Playbooks", checkType: "playbook" },
      ],
    },
    {
      id: "DE",
      name: "Detect",
      controls: [
        { id: "DE.CM-01", name: "Network Monitoring", description: "Networks and network services are monitored to find potentially adverse events", stbcsMapping: "Set up Uptime Monitors for your critical services", checkType: "uptime" },
        { id: "DE.CM-06", name: "External Service Monitoring", description: "External service provider activities are monitored", stbcsMapping: "Monitor third-party domains with Uptime and SSL monitoring", checkType: "uptime" },
        { id: "DE.CM-09", name: "Computing Hardware Monitoring", description: "Computing hardware and software are monitored", stbcsMapping: "Run Attack Surface Discovery scans regularly", checkType: "attack_surface" },
        { id: "DE.AE-02", name: "Anomaly Analysis", description: "Potentially adverse events are analyzed to understand attack targets", stbcsMapping: "Use IOC Search to investigate suspicious indicators", checkType: "tool_usage" },
        { id: "DE.AE-06", name: "Threat Detection", description: "Information on adverse events is provided to authorized staff", stbcsMapping: "Configure Watchlist alerts for real-time threat notifications", checkType: "watchlist" },
      ],
    },
    {
      id: "RS",
      name: "Respond",
      controls: [
        { id: "RS.MA-01", name: "Incident Management", description: "Incident response plan is executed during or after an incident", stbcsMapping: "Follow Incident Response Playbooks for structured response", checkType: "playbook" },
        { id: "RS.AN-03", name: "Incident Analysis", description: "Incidents are categorized and prioritized", stbcsMapping: "Use IOC Search and Threat Check for rapid incident triage", checkType: "tool_usage" },
        { id: "RS.CO-02", name: "Incident Reporting", description: "Incidents are reported to designated stakeholders", stbcsMapping: "Generate Threat Intelligence Reports for stakeholder briefings", checkType: "export" },
        { id: "RS.MI-01", name: "Incident Mitigation", description: "Incidents are contained and mitigated", stbcsMapping: "Use real-time threat feeds to block IOCs during incidents", checkType: "manual" },
      ],
    },
    {
      id: "RC",
      name: "Recover",
      controls: [
        { id: "RC.RP-01", name: "Recovery Planning", description: "Recovery plan is executed during or after an incident", stbcsMapping: "Follow Ransomware Recovery playbook for structured restoration", checkType: "playbook" },
        { id: "RC.CO-03", name: "Recovery Communication", description: "Recovery activities are communicated to stakeholders", stbcsMapping: "Use Threat Reports to document recovery progress", checkType: "export" },
      ],
    },
  ],
};

export const CIS_CONTROLS: ComplianceFramework = {
  id: "cis-v8",
  name: "CIS Controls",
  version: "v8",
  description: "The CIS Controls are a prioritized set of safeguards to mitigate the most prevalent cyber attacks.",
  categories: [
    {
      id: "IG1",
      name: "Implementation Group 1 — Essential Cyber Hygiene",
      controls: [
        { id: "1.1", name: "Enterprise Asset Inventory", description: "Establish and maintain an accurate inventory of enterprise assets", stbcsMapping: "Run Attack Surface Discovery to map external assets", checkType: "attack_surface" },
        { id: "2.1", name: "Software Inventory", description: "Establish and maintain a software inventory", stbcsMapping: "Use Web Fingerprinting to detect installed software", checkType: "tool_usage" },
        { id: "3.1", name: "Data Protection", description: "Establish and maintain a data management process", stbcsMapping: "Monitor for data exposure with Dark Web scanning", checkType: "darkweb" },
        { id: "4.1", name: "Secure Configuration", description: "Establish and maintain a secure configuration process", stbcsMapping: "Audit with HTTP Headers Scanner and SSL Checker", checkType: "ssl" },
        { id: "5.1", name: "Account Management", description: "Establish and maintain an inventory of accounts", stbcsMapping: "Check credential exposure in Breach Database", checkType: "darkweb" },
        { id: "7.1", name: "Vulnerability Management", description: "Establish and maintain a vulnerability management process", stbcsMapping: "Monitor CVE database with EPSS prioritization and watchlists", checkType: "watchlist" },
        { id: "8.1", name: "Audit Log Management", description: "Establish and maintain an audit log management process", stbcsMapping: "Review Uptime Monitor logs and incident history", checkType: "uptime" },
        { id: "9.1", name: "Email & Browser Protection", description: "Ensure use of only fully supported browsers and email clients", stbcsMapping: "Use Email Header Analyzer and DNS Analyzer for email security", checkType: "tool_usage" },
        { id: "10.1", name: "Malware Defenses", description: "Deploy and maintain anti-malware software", stbcsMapping: "Scan files with File Scanner; monitor IOCs from threat feeds", checkType: "tool_usage" },
        { id: "11.1", name: "Data Recovery", description: "Establish and maintain a data recovery process", stbcsMapping: "Follow Ransomware Recovery playbook procedures", checkType: "playbook" },
        { id: "14.1", name: "Security Awareness Training", description: "Establish and maintain a security awareness program", stbcsMapping: "Share Knowledge Base articles with your team; use Risk Score for assessment", checkType: "risk" },
        { id: "17.1", name: "Incident Response", description: "Designate personnel to manage incident handling", stbcsMapping: "Review and customize Incident Response Playbooks", checkType: "playbook" },
      ],
    },
    {
      id: "IG2",
      name: "Implementation Group 2 — Advanced Protections",
      controls: [
        { id: "7.5", name: "Automated Vulnerability Scanning", description: "Perform automated vulnerability scans of internal and external assets", stbcsMapping: "Run regular Attack Surface scans; track CISA KEV and EPSS scores", checkType: "attack_surface" },
        { id: "13.1", name: "Network Monitoring", description: "Centralize security event alerting", stbcsMapping: "Configure Watchlist alerts with email and SMS notifications", checkType: "watchlist" },
        { id: "13.6", name: "Threat Intel Integration", description: "Collect network traffic flow logs and/or integrate with threat intelligence", stbcsMapping: "Export STIX 2.1 feeds; integrate via REST API", checkType: "export" },
        { id: "15.1", name: "Service Provider Management", description: "Establish and maintain an inventory of service providers", stbcsMapping: "Monitor vendor domains with Uptime Monitors and SSL tracking", checkType: "uptime" },
      ],
    },
  ],
};

export const ISO_27001: ComplianceFramework = {
  id: "iso-27001",
  name: "ISO/IEC 27001",
  version: "2022",
  description: "ISO 27001 is the international standard for information security management systems (ISMS).",
  categories: [
    {
      id: "A5",
      name: "A.5 — Organizational Controls",
      controls: [
        { id: "A.5.7", name: "Threat Intelligence", description: "Information about technical threats shall be collected and analyzed", stbcsMapping: "STBCS provides 160+ live threat feeds with automated analysis", checkType: "manual" },
        { id: "A.5.23", name: "Cloud Service Security", description: "Security of cloud services shall be managed", stbcsMapping: "Monitor cloud endpoints with Uptime Monitors and SSL Checker", checkType: "uptime" },
        { id: "A.5.24", name: "Incident Management Planning", description: "Incident management procedures shall be planned", stbcsMapping: "Review and follow Incident Response Playbooks", checkType: "playbook" },
        { id: "A.5.30", name: "ICT Business Continuity", description: "ICT readiness shall be planned, implemented, and maintained", stbcsMapping: "Set up Uptime Monitors and alert escalation via SMS/email", checkType: "uptime" },
      ],
    },
    {
      id: "A6",
      name: "A.6 — People Controls",
      controls: [
        { id: "A.6.3", name: "Security Awareness", description: "Personnel shall receive appropriate security awareness training", stbcsMapping: "Share KB articles; use Risk Score Calculator for team assessments", checkType: "risk" },
      ],
    },
    {
      id: "A7",
      name: "A.7 — Physical Controls",
      controls: [
        { id: "A.7.4", name: "Physical Security Monitoring", description: "Premises shall be continuously monitored for unauthorized physical access", stbcsMapping: "Monitor physical access systems with Uptime Monitors (if IP-connected)", checkType: "uptime" },
      ],
    },
    {
      id: "A8",
      name: "A.8 — Technological Controls",
      controls: [
        { id: "A.8.7", name: "Malware Protection", description: "Protection against malware shall be implemented", stbcsMapping: "Use File Scanner, monitor URLhaus and MalwareBazaar feeds", checkType: "tool_usage" },
        { id: "A.8.8", name: "Vulnerability Management", description: "Vulnerabilities shall be identified, evaluated, and treated", stbcsMapping: "Track CVEs with EPSS scoring; set up vulnerability watchlists", checkType: "watchlist" },
        { id: "A.8.9", name: "Configuration Management", description: "Configurations of hardware, software, and networks shall be managed", stbcsMapping: "Audit with HTTP Headers Scanner, SSL Checker, and DNS Analyzer", checkType: "ssl" },
        { id: "A.8.15", name: "Logging", description: "Logs that record activities and events shall be produced and stored", stbcsMapping: "Review Uptime Monitor incident logs and notification history", checkType: "uptime" },
        { id: "A.8.16", name: "Monitoring Activities", description: "Networks, systems, and applications shall be monitored for anomalous behavior", stbcsMapping: "Configure Watchlist alerts with real-time notification channels", checkType: "watchlist" },
        { id: "A.8.23", name: "Web Filtering", description: "Access to external websites shall be managed", stbcsMapping: "Use IOC feeds and URLhaus data to maintain blocklists", checkType: "manual" },
        { id: "A.8.24", name: "Use of Cryptography", description: "Rules for cryptographic controls shall be defined", stbcsMapping: "Validate TLS/SSL configurations with SSL Checker (cipher audit)", checkType: "ssl" },
      ],
    },
  ],
};

export const ALL_FRAMEWORKS: ComplianceFramework[] = [NIST_CSF, CIS_CONTROLS, ISO_27001];

export function getFramework(id: string): ComplianceFramework | undefined {
  return ALL_FRAMEWORKS.find(f => f.id === id);
}
