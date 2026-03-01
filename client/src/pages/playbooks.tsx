import { useState } from "react";
import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Lock,
  Mail,
  Bug,
  UserX,
  Database,
} from "lucide-react";

interface PlaybookStep {
  phase: string;
  title: string;
  tasks: string[];
}

interface Playbook {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium";
  estimatedTime: string;
  icon: React.ElementType;
  steps: PlaybookStep[];
}

const playbooks: Playbook[] = [
  {
    id: "ransomware",
    title: "Ransomware Response",
    description: "Step-by-step guide to contain and recover from a ransomware attack. Covers isolation, assessment, reporting, recovery, and lessons learned.",
    severity: "critical",
    estimatedTime: "4-72 hours",
    icon: Lock,
    steps: [
      {
        phase: "Preparation",
        title: "Pre-Incident Readiness",
        tasks: [
          "Ensure offline backups are current and tested",
          "Verify incident response team contact list is up to date",
          "Confirm endpoint detection and response (EDR) tools are deployed",
          "Document critical business systems and recovery priorities",
          "Prepare communication templates for stakeholders",
        ],
      },
      {
        phase: "Detection",
        title: "Identify the Attack",
        tasks: [
          "Confirm ransomware indicators: encrypted files, ransom notes, unusual file extensions",
          "Identify the ransomware variant using ransom note or encrypted file samples",
          "Determine initial infection vector (phishing, RDP, exploit)",
          "Document the timeline of events and affected systems",
          "Check threat intelligence feeds for known decryption tools",
        ],
      },
      {
        phase: "Containment",
        title: "Stop the Spread",
        tasks: [
          "Immediately isolate affected systems from the network",
          "Disable shared drives and network shares",
          "Block lateral movement by segmenting network zones",
          "Preserve forensic evidence — do NOT reboot affected machines",
          "Disable compromised user accounts",
          "Block known C2 IPs and domains at the firewall",
        ],
      },
      {
        phase: "Eradication",
        title: "Remove the Threat",
        tasks: [
          "Identify and remove all malware artifacts and persistence mechanisms",
          "Patch the vulnerability or close the access vector used for initial compromise",
          "Reset all potentially compromised credentials",
          "Scan all systems with updated antivirus/EDR signatures",
          "Verify no backdoors or secondary payloads remain",
        ],
      },
      {
        phase: "Recovery",
        title: "Restore Operations",
        tasks: [
          "Restore systems from clean, verified backups",
          "Prioritize recovery based on business criticality",
          "Validate data integrity after restoration",
          "Monitor restored systems closely for re-infection",
          "Gradually reconnect systems to the network",
          "Communicate recovery status to stakeholders",
        ],
      },
      {
        phase: "Lessons Learned",
        title: "Post-Incident Review",
        tasks: [
          "Conduct a formal post-incident review within 5 business days",
          "Document root cause, timeline, and response effectiveness",
          "Update incident response procedures based on findings",
          "Implement additional security controls to prevent recurrence",
          "Brief executive leadership on findings and improvements",
        ],
      },
    ],
  },
  {
    id: "phishing",
    title: "Phishing Incident",
    description: "Response procedure for phishing attacks including credential harvesting, malware delivery, and business email compromise (BEC).",
    severity: "high",
    estimatedTime: "1-8 hours",
    icon: Mail,
    steps: [
      {
        phase: "Preparation",
        title: "Pre-Incident Readiness",
        tasks: [
          "Deploy email security gateway with anti-phishing capabilities",
          "Implement DMARC, DKIM, and SPF for email authentication",
          "Conduct regular phishing awareness training",
          "Establish a phishing report button/process for employees",
          "Maintain a list of known good sender domains",
        ],
      },
      {
        phase: "Detection",
        title: "Identify the Phishing Attack",
        tasks: [
          "Analyze reported email headers for spoofing indicators",
          "Check sender domain against known phishing databases",
          "Identify the payload type: credential harvesting link, malware attachment, or BEC",
          "Determine how many users received the phishing email",
          "Check if any users clicked links or opened attachments",
        ],
      },
      {
        phase: "Containment",
        title: "Limit the Impact",
        tasks: [
          "Block the sender domain/IP at the email gateway",
          "Quarantine all instances of the phishing email across mailboxes",
          "Block the phishing URL at the web proxy/firewall",
          "If credentials were entered, immediately reset affected passwords",
          "Revoke active sessions for compromised accounts",
          "Enable MFA on affected accounts if not already active",
        ],
      },
      {
        phase: "Eradication",
        title: "Investigate and Clean",
        tasks: [
          "Scan systems of users who clicked links for malware",
          "Review email forwarding rules for unauthorized changes",
          "Check for unauthorized OAuth app grants on affected accounts",
          "Search for similar phishing emails that may have bypassed filters",
          "Update email filtering rules to catch this phishing pattern",
        ],
      },
      {
        phase: "Recovery",
        title: "Restore Normal Operations",
        tasks: [
          "Confirm all phishing emails have been removed from mailboxes",
          "Verify compromised accounts are secured with new credentials and MFA",
          "Monitor affected accounts for suspicious activity for 30 days",
          "Send organization-wide alert about the phishing campaign",
          "Update phishing training materials with this real-world example",
        ],
      },
      {
        phase: "Lessons Learned",
        title: "Post-Incident Review",
        tasks: [
          "Analyze why the phishing email bypassed existing controls",
          "Evaluate employee reporting response time",
          "Update email security policies and filtering rules",
          "Schedule targeted phishing simulation for affected department",
          "Document the incident for compliance and audit purposes",
        ],
      },
    ],
  },
  {
    id: "data-breach",
    title: "Data Breach Response",
    description: "Comprehensive response plan for confirmed data breaches including detection, containment, legal notification, and compliance requirements.",
    severity: "critical",
    estimatedTime: "24-168 hours",
    icon: Database,
    steps: [
      {
        phase: "Preparation",
        title: "Pre-Incident Readiness",
        tasks: [
          "Classify and inventory sensitive data assets",
          "Document data flow maps showing where sensitive data resides",
          "Establish relationships with legal counsel and breach notification vendors",
          "Review regulatory requirements (GDPR, CCPA, HIPAA, etc.)",
          "Prepare breach notification templates for regulators and affected parties",
        ],
      },
      {
        phase: "Detection",
        title: "Confirm the Breach",
        tasks: [
          "Verify unauthorized access to sensitive data through log analysis",
          "Determine the scope: what data was accessed, modified, or exfiltrated",
          "Identify the number of affected individuals/records",
          "Determine the data types involved (PII, PHI, financial, credentials)",
          "Establish the timeline of unauthorized access",
          "Preserve all evidence with proper chain of custody",
        ],
      },
      {
        phase: "Containment",
        title: "Stop Data Loss",
        tasks: [
          "Revoke unauthorized access immediately",
          "Isolate affected systems and databases",
          "Block exfiltration channels (IPs, domains, protocols)",
          "Change all credentials for affected systems",
          "Enable enhanced monitoring on affected data stores",
          "Engage legal counsel for breach notification obligations",
        ],
      },
      {
        phase: "Eradication",
        title: "Investigate and Notify",
        tasks: [
          "Conduct thorough forensic investigation",
          "Determine root cause and attack vector",
          "Notify regulatory authorities within required timeframes",
          "Prepare and send individual notifications to affected parties",
          "Offer credit monitoring/identity protection if applicable",
          "Issue public disclosure if required by law",
        ],
      },
      {
        phase: "Recovery",
        title: "Secure and Restore",
        tasks: [
          "Implement additional access controls on affected data",
          "Deploy enhanced monitoring and DLP solutions",
          "Conduct vulnerability assessment on affected systems",
          "Update data handling procedures and access policies",
          "Verify no further unauthorized access is occurring",
        ],
      },
      {
        phase: "Lessons Learned",
        title: "Compliance and Improvement",
        tasks: [
          "Complete regulatory compliance documentation",
          "Conduct root cause analysis and document findings",
          "Update data protection policies and procedures",
          "Implement technical controls to prevent similar breaches",
          "Review and update data classification and handling procedures",
          "Schedule follow-up security assessment",
        ],
      },
    ],
  },
  {
    id: "malware",
    title: "Malware Infection",
    description: "Response procedures for malware infections including trojans, worms, spyware, and advanced persistent threats (APTs).",
    severity: "high",
    estimatedTime: "2-24 hours",
    icon: Bug,
    steps: [
      {
        phase: "Preparation",
        title: "Pre-Incident Readiness",
        tasks: [
          "Deploy and maintain EDR/antivirus on all endpoints",
          "Implement application whitelisting on critical systems",
          "Maintain up-to-date system images for rapid reimaging",
          "Configure network segmentation to limit lateral movement",
          "Subscribe to threat intelligence feeds for IOC updates",
        ],
      },
      {
        phase: "Detection",
        title: "Identify the Malware",
        tasks: [
          "Collect malware samples safely for analysis",
          "Identify malware family/variant using hash lookups and sandbox analysis",
          "Determine infection vector (email, drive-by download, USB, supply chain)",
          "Map all affected systems using EDR telemetry and network logs",
          "Identify command and control (C2) infrastructure",
          "Check if the malware has data exfiltration capabilities",
        ],
      },
      {
        phase: "Containment",
        title: "Isolate Infected Systems",
        tasks: [
          "Quarantine infected endpoints from the network",
          "Block C2 domains and IPs at the firewall and DNS level",
          "Disable affected user accounts if credentials may be compromised",
          "Create network IOC signatures to detect additional infections",
          "Snapshot infected systems for forensic analysis before cleanup",
        ],
      },
      {
        phase: "Eradication",
        title: "Remove All Traces",
        tasks: [
          "Remove malware and all persistence mechanisms",
          "For severe infections, reimage systems from clean baselines",
          "Update antivirus/EDR signatures with new IOCs",
          "Scan all systems in the environment for related indicators",
          "Patch the vulnerability exploited for initial infection",
          "Reset credentials for all accounts on infected systems",
        ],
      },
      {
        phase: "Recovery",
        title: "Restore and Harden",
        tasks: [
          "Restore data from clean backups if needed",
          "Gradually reconnect cleaned systems with enhanced monitoring",
          "Verify system integrity using file integrity monitoring",
          "Apply security hardening measures to prevent reinfection",
          "Monitor for signs of reinfection for at least 30 days",
        ],
      },
      {
        phase: "Lessons Learned",
        title: "Post-Incident Review",
        tasks: [
          "Document the malware analysis findings and IOCs",
          "Share IOCs with threat intelligence community if appropriate",
          "Review and improve endpoint protection configuration",
          "Update security awareness training with real-world example",
          "Evaluate effectiveness of detection and response times",
        ],
      },
    ],
  },
  {
    id: "account-compromise",
    title: "Account Compromise",
    description: "Response plan for compromised user or service accounts including unauthorized access, privilege escalation, and insider threats.",
    severity: "high",
    estimatedTime: "1-12 hours",
    icon: UserX,
    steps: [
      {
        phase: "Preparation",
        title: "Pre-Incident Readiness",
        tasks: [
          "Enforce MFA on all accounts, especially privileged ones",
          "Implement privileged access management (PAM) solution",
          "Configure impossible travel and anomalous login alerts",
          "Maintain inventory of all service accounts and their permissions",
          "Establish baseline user behavior profiles for anomaly detection",
        ],
      },
      {
        phase: "Detection",
        title: "Identify the Compromise",
        tasks: [
          "Review authentication logs for suspicious login activity",
          "Check for impossible travel, unusual geolocations, or new devices",
          "Look for unauthorized privilege escalation or role changes",
          "Identify any unauthorized data access or modifications",
          "Check for new OAuth app consents or API key creation",
          "Review email forwarding rules and mailbox delegations",
        ],
      },
      {
        phase: "Containment",
        title: "Lock Down the Account",
        tasks: [
          "Immediately disable or lock the compromised account",
          "Revoke all active sessions and tokens",
          "Remove any unauthorized OAuth apps or API keys",
          "Block the attacker's source IPs if identified",
          "Check for and remove unauthorized email forwarding rules",
          "Review and revoke any shared access granted by the account",
        ],
      },
      {
        phase: "Eradication",
        title: "Investigate and Secure",
        tasks: [
          "Determine how the account was compromised (phishing, credential stuffing, malware)",
          "Check if the attacker moved laterally to other accounts",
          "Review all actions performed by the attacker during the compromise",
          "Remove any persistence mechanisms (scheduled tasks, scripts, etc.)",
          "Check for data exfiltration or unauthorized changes",
        ],
      },
      {
        phase: "Recovery",
        title: "Restore Account Access",
        tasks: [
          "Reset the account password using a verified out-of-band channel",
          "Re-enable MFA with new enrollment (do not reuse old MFA)",
          "Restore any data or configurations changed by the attacker",
          "Monitor the account closely for 30 days post-recovery",
          "Notify the account owner about the compromise and actions taken",
        ],
      },
      {
        phase: "Lessons Learned",
        title: "Post-Incident Review",
        tasks: [
          "Analyze how the compromise occurred and what controls failed",
          "Review and strengthen authentication policies",
          "Evaluate the effectiveness of anomaly detection alerts",
          "Update account security baselines and monitoring thresholds",
          "Conduct targeted security awareness training for the affected user",
        ],
      },
    ],
  },
];

const severityColors: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/50",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/50",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
};

const phaseColors: Record<string, string> = {
  Preparation: "border-blue-500/50 bg-blue-500/10",
  Detection: "border-yellow-500/50 bg-yellow-500/10",
  Containment: "border-orange-500/50 bg-orange-500/10",
  Eradication: "border-red-500/50 bg-red-500/10",
  Recovery: "border-green-500/50 bg-green-500/10",
  "Lessons Learned": "border-purple-500/50 bg-purple-500/10",
};

const phaseTextColors: Record<string, string> = {
  Preparation: "text-blue-400",
  Detection: "text-yellow-400",
  Containment: "text-orange-400",
  Eradication: "text-red-400",
  Recovery: "text-green-400",
  "Lessons Learned": "text-purple-400",
};

function PlaybookCard({ playbook }: { playbook: Playbook }) {
  const [expanded, setExpanded] = useState(false);
  const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set());
  const Icon = playbook.icon;

  const totalTasks = playbook.steps.reduce((sum, step) => sum + step.tasks.length, 0);
  const completedTasks = checkedTasks.size;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const toggleTask = (taskKey: string) => {
    setCheckedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskKey)) {
        next.delete(taskKey);
      } else {
        next.add(taskKey);
      }
      return next;
    });
  };

  return (
    <Card
      className="border-white/5 bg-card/50 backdrop-blur-sm hover:border-orange-500/20 transition-all duration-300"
      data-testid={`card-playbook-${playbook.id}`}
    >
      <CardHeader
        className="cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        data-testid={`button-toggle-playbook-${playbook.id}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-lg bg-background border border-white/5">
              <Icon className="h-6 w-6 text-orange-400" />
            </div>
            <div className="space-y-2">
              <CardTitle className="font-display text-lg text-white" data-testid={`text-playbook-title-${playbook.id}`}>
                {playbook.title}
              </CardTitle>
              <p className="text-sm text-zinc-400">{playbook.description}</p>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className={severityColors[playbook.severity]} data-testid={`badge-severity-${playbook.id}`}>
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {playbook.severity.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="border-white/10 text-zinc-400" data-testid={`badge-time-${playbook.id}`}>
                  <Clock className="h-3 w-3 mr-1" />
                  {playbook.estimatedTime}
                </Badge>
                <Badge variant="outline" className="border-white/10 text-zinc-400">
                  {playbook.steps.length} phases
                </Badge>
                <Badge variant="outline" className="border-white/10 text-zinc-400">
                  {totalTasks} tasks
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0 text-zinc-400">
            {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
        </div>

        {completedTasks > 0 && (
          <div className="mt-4" data-testid={`progress-playbook-${playbook.id}`}>
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
              <span>{completedTasks} of {totalTasks} tasks completed</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 space-y-4" data-testid={`content-playbook-${playbook.id}`}>
          {playbook.steps.map((step, stepIdx) => (
            <div
              key={stepIdx}
              className={`rounded-lg border p-4 ${phaseColors[step.phase] || "border-white/10 bg-white/5"}`}
              data-testid={`section-phase-${playbook.id}-${stepIdx}`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-bold uppercase tracking-wider ${phaseTextColors[step.phase] || "text-zinc-400"}`}>
                  Phase {stepIdx + 1}: {step.phase}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mb-3">{step.title}</h4>
              <ul className="space-y-2">
                {step.tasks.map((task, taskIdx) => {
                  const taskKey = `${playbook.id}-${stepIdx}-${taskIdx}`;
                  const isChecked = checkedTasks.has(taskKey);
                  return (
                    <li key={taskIdx} className="flex items-start gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTask(taskKey);
                        }}
                        className={`mt-0.5 shrink-0 h-5 w-5 rounded border flex items-center justify-center transition-all ${
                          isChecked
                            ? "bg-orange-500 border-orange-500 text-white"
                            : "border-zinc-600 hover:border-orange-500/50"
                        }`}
                        data-testid={`checkbox-task-${taskKey}`}
                      >
                        {isChecked && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </button>
                      <span
                        className={`text-sm ${isChecked ? "text-zinc-500 line-through" : "text-zinc-300"}`}
                        data-testid={`text-task-${taskKey}`}
                      >
                        {task}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}

export default function PlaybooksPage() {
  useDocumentTitle("IR Playbooks | STB Cybersecurity", "Incident response playbooks for ransomware, phishing, data breaches, malware, and account compromise.");

  return (
    <Layout>
      <div className="space-y-8 page-transition">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/30">
              <Shield className="h-6 w-6 text-orange-400" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-white tracking-wide" data-testid="text-page-title">
                Incident Response Playbooks
              </h1>
              <p className="text-zinc-400 text-sm" data-testid="text-page-description">
                Step-by-step guides for handling security incidents. Click any playbook to expand the checklist.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-white/5 bg-card/50 backdrop-blur-sm" data-testid="card-stat-total-playbooks">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Shield className="h-5 w-5 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-white">{playbooks.length}</p>
                <p className="text-xs text-zinc-500">Playbooks Available</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-card/50 backdrop-blur-sm" data-testid="card-stat-total-phases">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-white">6</p>
                <p className="text-xs text-zinc-500">Phases Per Playbook</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-card/50 backdrop-blur-sm" data-testid="card-stat-total-tasks">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-white">
                  {playbooks.reduce((sum, pb) => sum + pb.steps.reduce((s, step) => s + step.tasks.length, 0), 0)}
                </p>
                <p className="text-xs text-zinc-500">Total Checklist Tasks</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4" data-testid="list-playbooks">
          {playbooks.map((playbook) => (
            <PlaybookCard key={playbook.id} playbook={playbook} />
          ))}
        </div>

        <Footer />
      </div>
    </Layout>
  );
}
