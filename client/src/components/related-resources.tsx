import { ArrowRight, Link2 } from "lucide-react";

export interface RelatedLink {
  label: string;
  href: string;
  description?: string;
}

interface RelatedResourcesProps {
  links: RelatedLink[];
  title?: string;
  testIdPrefix?: string;
}

const CROSS_LINK_MAP: Record<string, RelatedLink[]> = {
  "/": [
    { label: "Ransomware Tracker", href: "/ransomware", description: "Monitor active ransomware groups and victim postings" },
    { label: "Exploits & CVE Database", href: "/exploits", description: "Track critical vulnerabilities and zero-days" },
    { label: "Free Security Tools", href: "/tools", description: "18+ professional cybersecurity tools" },
    { label: "Intel & Threat Feeds", href: "/intel", description: "Real-time data from 160+ feeds" },
    { label: "Cyber Risk Score", href: "/risk-score", description: "Assess your organization's security posture" },
  ],
  "/ransomware": [
    { label: "Threat Actors Directory", href: "/groups", description: "Browse all tracked ransomware groups" },
    { label: "Ransomware Cost Estimator", href: "/ransomware-calculator", description: "Estimate financial impact of an attack" },
    { label: "Incident Response Playbooks", href: "/playbooks", description: "Step-by-step ransomware response guides" },
    { label: "Data Breach Database", href: "/breaches", description: "Search compromised credentials and exposures" },
    { label: "Threat Intelligence Reports", href: "/reports", description: "Generate branded threat analysis reports" },
  ],
  "/groups": [
    { label: "Ransomware Tracker", href: "/ransomware", description: "Real-time ransomware incident monitoring" },
    { label: "Exploits & CVE Database", href: "/exploits", description: "Track vulnerabilities exploited by threat actors" },
    { label: "Attack Surface Discovery", href: "/attack-surface", description: "Map your external attack surface" },
    { label: "Intel & Threat Feeds", href: "/intel", description: "Curated threat intelligence from 160+ feeds" },
  ],
  "/exploits": [
    { label: "ICS-CERT Advisories", href: "/ics-advisories", description: "Industrial control system security alerts" },
    { label: "Attack Surface Discovery", href: "/attack-surface", description: "Find vulnerabilities in your infrastructure" },
    { label: "Threat Search & IOC Lookup", href: "/search", description: "Search CVEs and indicators of compromise" },
    { label: "Ransomware Tracker", href: "/ransomware", description: "See which groups exploit known CVEs" },
    { label: "Compliance Mapper", href: "/compliance", description: "Map vulnerabilities to compliance frameworks" },
  ],
  "/tools": [
    { label: "SSL/TLS Certificate Checker", href: "/ssl-checker", description: "Comprehensive SSL analysis with A+ to F grading" },
    { label: "DNS Security Analyzer", href: "/dns-analyzer", description: "SPF, DKIM, DMARC, and DNSSEC validation" },
    { label: "HTTP Security Headers Scanner", href: "/headers-scanner", description: "Audit security headers with remediation guidance" },
    { label: "Email Header Analyzer", href: "/email-analyzer", description: "Trace routing and detect email spoofing" },
    { label: "Web Server Fingerprinter", href: "/web-fingerprint", description: "Identify server software and CMS platforms" },
  ],
  "/search": [
    { label: "Exploits & CVE Database", href: "/exploits", description: "Deep-dive into CVEs with CVSS scoring" },
    { label: "Data Breach Database", href: "/breaches", description: "Check if credentials have been compromised" },
    { label: "Threat Actors Directory", href: "/groups", description: "Research ransomware groups and APTs" },
    { label: "Intel & Threat Feeds", href: "/intel", description: "Browse malicious IPs, phishing URLs, and more" },
  ],
  "/intel": [
    { label: "Threat Search & IOC Lookup", href: "/search", description: "Search across all threat intelligence data" },
    { label: "STB-Sync Firewall Block Lists", href: "/stb-sync", description: "Generate EDL URLs for firewall integration" },
    { label: "Phishing Awareness Feeds", href: "/awareness", description: "Ready-to-send phishing awareness bulletins" },
    { label: "Ransomware Tracker", href: "/ransomware", description: "Monitor ransomware incidents in real-time" },
    { label: "ICS-CERT Advisories", href: "/ics-advisories", description: "Critical infrastructure security alerts" },
  ],
  "/ssl-checker": [
    { label: "DNS Security Analyzer", href: "/dns-analyzer", description: "Check SPF, DKIM, DMARC, and DNSSEC" },
    { label: "HTTP Security Headers Scanner", href: "/headers-scanner", description: "Audit HSTS, CSP, and other headers" },
    { label: "Web Server Fingerprinter", href: "/web-fingerprint", description: "Identify web server and CMS" },
    { label: "Attack Surface Discovery", href: "/attack-surface", description: "Full external security assessment" },
  ],
  "/dns-analyzer": [
    { label: "SSL/TLS Certificate Checker", href: "/ssl-checker", description: "Validate certificates and cipher suites" },
    { label: "Email Header Analyzer", href: "/email-analyzer", description: "Verify SPF/DKIM pass in email headers" },
    { label: "Exchange Server Checker", href: "/exchange-checker", description: "Detect exposed Exchange endpoints" },
    { label: "Attack Surface Discovery", href: "/attack-surface", description: "Map subdomains and DNS footprint" },
  ],
  "/headers-scanner": [
    { label: "SSL/TLS Certificate Checker", href: "/ssl-checker", description: "Check TLS configuration alongside headers" },
    { label: "Web Server Fingerprinter", href: "/web-fingerprint", description: "Identify server software from headers" },
    { label: "DNS Security Analyzer", href: "/dns-analyzer", description: "Complete DNS security audit" },
    { label: "Compliance Mapper", href: "/compliance", description: "Map header security to compliance frameworks" },
  ],
  "/web-fingerprint": [
    { label: "HTTP Security Headers Scanner", href: "/headers-scanner", description: "Audit security headers for misconfigurations" },
    { label: "SSL/TLS Certificate Checker", href: "/ssl-checker", description: "Analyze TLS and certificate security" },
    { label: "Exchange Server Checker", href: "/exchange-checker", description: "Detect Microsoft Exchange vulnerabilities" },
    { label: "Attack Surface Discovery", href: "/attack-surface", description: "Full infrastructure fingerprinting" },
  ],
  "/exchange-checker": [
    { label: "DNS Security Analyzer", href: "/dns-analyzer", description: "Check MX records and email security" },
    { label: "Web Server Fingerprinter", href: "/web-fingerprint", description: "Identify server versions and software" },
    { label: "Exploits & CVE Database", href: "/exploits", description: "Look up Exchange CVEs like ProxyLogon" },
    { label: "Attack Surface Discovery", href: "/attack-surface", description: "Discover exposed services and ports" },
  ],
  "/email-analyzer": [
    { label: "DNS Security Analyzer", href: "/dns-analyzer", description: "Validate SPF, DKIM, DMARC records" },
    { label: "Exchange Server Checker", href: "/exchange-checker", description: "Check Exchange server security" },
    { label: "Phishing Awareness Feeds", href: "/awareness", description: "Track phishing campaigns and brands" },
    { label: "Data Breach Database", href: "/breaches", description: "Check if email domains are compromised" },
  ],
  "/file-scanner": [
    { label: "Encoding & Decoding Tools", href: "/encoding-tools", description: "Base64, Hex, URL encode/decode files" },
    { label: "Threat Search & IOC Lookup", href: "/search", description: "Look up file hashes against threat data" },
    { label: "Free Security Tools", href: "/tools", description: "Browse all 18+ security tools" },
    { label: "Exploits & CVE Database", href: "/exploits", description: "Research malware-related CVEs" },
  ],
  "/encoding-tools": [
    { label: "File Scanner & Malware Analyzer", href: "/file-scanner", description: "Compute hashes and analyze files" },
    { label: "Email Header Analyzer", href: "/email-analyzer", description: "Decode and trace email headers" },
    { label: "Free Security Tools", href: "/tools", description: "All cybersecurity tools in one place" },
    { label: "Threat Search & IOC Lookup", href: "/search", description: "Search IOCs across all feeds" },
  ],
  "/risk-score": [
    { label: "Compliance Mapper", href: "/compliance", description: "Map risk areas to compliance frameworks" },
    { label: "Attack Surface Discovery", href: "/attack-surface", description: "Technical assessment of your security" },
    { label: "Ransomware Cost Estimator", href: "/ransomware-calculator", description: "Financial impact of a cyber attack" },
    { label: "Incident Response Playbooks", href: "/playbooks", description: "Prepare for security incidents" },
    { label: "Plans & Pricing", href: "/pricing", description: "Get continuous monitoring and protection" },
  ],
  "/breaches": [
    { label: "Threat Search & IOC Lookup", href: "/search", description: "Cross-reference with threat intelligence" },
    { label: "Email Header Analyzer", href: "/email-analyzer", description: "Analyze suspicious email origins" },
    { label: "Ransomware Tracker", href: "/ransomware", description: "See which groups claim data breaches" },
    { label: "Phishing Awareness Feeds", href: "/awareness", description: "Track phishing campaigns and spoofed domains" },
  ],
  "/ics-advisories": [
    { label: "Exploits & CVE Database", href: "/exploits", description: "Track CVEs affecting ICS systems" },
    { label: "Compliance Mapper", href: "/compliance", description: "Map ICS security to frameworks" },
    { label: "Attack Surface Discovery", href: "/attack-surface", description: "Discover exposed OT endpoints" },
    { label: "Threat Actors Directory", href: "/groups", description: "Nation-state groups targeting critical infrastructure" },
  ],
  "/attack-surface": [
    { label: "SSL/TLS Certificate Checker", href: "/ssl-checker", description: "Deep-dive into certificate issues" },
    { label: "DNS Security Analyzer", href: "/dns-analyzer", description: "Investigate DNS configuration gaps" },
    { label: "HTTP Security Headers Scanner", href: "/headers-scanner", description: "Fix header misconfigurations" },
    { label: "Web Server Fingerprinter", href: "/web-fingerprint", description: "Identify exposed technologies" },
    { label: "Threat Intelligence Reports", href: "/reports", description: "Generate branded security reports" },
  ],
  "/reports": [
    { label: "Ransomware Tracker", href: "/ransomware", description: "Latest ransomware landscape data" },
    { label: "Attack Surface Discovery", href: "/attack-surface", description: "Technical findings for reports" },
    { label: "Exploits & CVE Database", href: "/exploits", description: "Critical vulnerability data" },
    { label: "Plans & Pricing", href: "/pricing", description: "Unlock advanced reporting features" },
  ],
  "/playbooks": [
    { label: "Ransomware Tracker", href: "/ransomware", description: "Current ransomware threat landscape" },
    { label: "Cyber Risk Score", href: "/risk-score", description: "Assess your readiness for incidents" },
    { label: "Compliance Mapper", href: "/compliance", description: "IR procedures for compliance" },
    { label: "Contact Us", href: "/contact", description: "Engage 24/7 incident response services" },
    { label: "Threat Actors Directory", href: "/groups", description: "Research attack methods and TTPs" },
  ],
  "/compliance": [
    { label: "Cyber Risk Score", href: "/risk-score", description: "Quick security posture assessment" },
    { label: "Attack Surface Discovery", href: "/attack-surface", description: "Technical compliance evidence" },
    { label: "Incident Response Playbooks", href: "/playbooks", description: "IR procedures for audit readiness" },
    { label: "Plans & Pricing", href: "/pricing", description: "Get continuous compliance monitoring" },
  ],
  "/ransomware-calculator": [
    { label: "Ransomware Tracker", href: "/ransomware", description: "See real ransom demands and trends" },
    { label: "Cyber Risk Score", href: "/risk-score", description: "Holistic security assessment" },
    { label: "Incident Response Playbooks", href: "/playbooks", description: "Prepare your IR procedures" },
    { label: "Threat Actors Directory", href: "/groups", description: "Which groups target your industry" },
  ],
  "/awareness": [
    { label: "Intel & Threat Feeds", href: "/intel", description: "Source data for awareness bulletins" },
    { label: "Email Header Analyzer", href: "/email-analyzer", description: "Analyze suspicious phishing emails" },
    { label: "Data Breach Database", href: "/breaches", description: "Check for credential exposures" },
    { label: "Cyber Risk Score", href: "/risk-score", description: "Measure your security awareness impact" },
  ],
  "/stb-sync": [
    { label: "Intel & Threat Feeds", href: "/intel", description: "Browse the feeds behind block lists" },
    { label: "Threat Search & IOC Lookup", href: "/search", description: "Validate IPs before blocking" },
    { label: "Attack Surface Discovery", href: "/attack-surface", description: "Identify what to protect" },
    { label: "Plans & Pricing", href: "/pricing", description: "Unlock authenticated EDL feeds" },
  ],
  "/knowledge-base": [
    { label: "Intel & Threat Feeds", href: "/intel", description: "Real-time cybersecurity intelligence" },
    { label: "Incident Response Playbooks", href: "/playbooks", description: "Actionable security procedures" },
    { label: "Free Security Tools", href: "/tools", description: "Hands-on security analysis" },
    { label: "Feedback & Bug Reports", href: "/feedback", description: "Contribute to the community" },
  ],
  "/pricing": [
    { label: "Free Security Tools", href: "/tools", description: "See what's available free" },
    { label: "Cyber Risk Score", href: "/risk-score", description: "Assess your security needs" },
    { label: "Threat Intelligence Dashboard", href: "/", description: "Explore the platform" },
    { label: "Contact Us", href: "/contact", description: "Talk to our team" },
    { label: "About STB Cybersecurity", href: "/about", description: "Learn about our mission" },
  ],
  "/about": [
    { label: "Plans & Pricing", href: "/pricing", description: "Explore subscription tiers" },
    { label: "Contact Us", href: "/contact", description: "Get in touch with our team" },
    { label: "Threat Intelligence Dashboard", href: "/", description: "See the platform in action" },
    { label: "Knowledge Base", href: "/knowledge-base", description: "Community security resources" },
  ],
  "/contact": [
    { label: "About STB Cybersecurity", href: "/about", description: "Learn about our team and mission" },
    { label: "Plans & Pricing", href: "/pricing", description: "Compare subscription options" },
    { label: "Support & Membership", href: "/support", description: "Membership benefits and support" },
    { label: "Feedback & Bug Reports", href: "/feedback", description: "Report issues or suggest features" },
  ],
  "/brand-kit": [
    { label: "About STB Cybersecurity", href: "/about", description: "Company overview and mission" },
    { label: "Email Signatures", href: "/brand-kit/email-signatures", description: "Professional email signatures" },
    { label: "Threat Intelligence Reports", href: "/reports", description: "Branded security reports" },
    { label: "Contact Us", href: "/contact", description: "Brand inquiries and partnerships" },
  ],
  "/feedback": [
    { label: "Knowledge Base", href: "/knowledge-base", description: "Browse community articles" },
    { label: "Service Status", href: "/service-status", description: "Platform operational status" },
    { label: "Contact Us", href: "/contact", description: "Direct communication with our team" },
    { label: "About STB Cybersecurity", href: "/about", description: "Our mission and roadmap" },
  ],
  "/service-status": [
    { label: "Threat Intelligence Dashboard", href: "/", description: "Main platform dashboard" },
    { label: "Feedback & Bug Reports", href: "/feedback", description: "Report service issues" },
    { label: "Contact Us", href: "/contact", description: "24/7 emergency hotline" },
    { label: "Plans & Pricing", href: "/pricing", description: "Upgrade for priority support" },
  ],
  "/support": [
    { label: "Plans & Pricing", href: "/pricing", description: "Compare all subscription tiers" },
    { label: "Threat Intelligence Dashboard", href: "/", description: "Explore the platform" },
    { label: "Contact Us", href: "/contact", description: "Talk to our team" },
    { label: "About STB Cybersecurity", href: "/about", description: "Our mission and services" },
  ],
};

export function getRelatedLinks(path: string): RelatedLink[] {
  return CROSS_LINK_MAP[path] || [];
}

export default function RelatedResources({ links, title = "Related Resources", testIdPrefix = "related" }: RelatedResourcesProps) {
  if (!links || links.length === 0) return null;

  return (
    <section className="mt-12 mb-6 border-t border-zinc-800/50 pt-8" data-testid={`${testIdPrefix}-resources`}>
      <div className="flex items-center gap-2 mb-5">
        <Link2 className="h-4 w-4 text-orange-400" />
        <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">{title}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {links.map((link, i) => (
          <a
            key={i}
            href={link.href}
            className="group flex items-start gap-3 p-3 rounded-lg border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-800/50 hover:border-zinc-700/50 transition-all duration-200"
            data-testid={`${testIdPrefix}-link-${i}`}
          >
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-orange-400 group-hover:text-orange-300 transition-colors">
                {link.label}
              </span>
              {link.description && (
                <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{link.description}</p>
              )}
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-orange-400 transition-colors mt-0.5 shrink-0" />
          </a>
        ))}
      </div>
    </section>
  );
}
