export interface MitreTechnique {
  id: string;
  name: string;
  tactic: string;
  url: string;
}

export const MITRE_TECHNIQUES: Record<string, MitreTechnique> = {
  "T1566": { id: "T1566", name: "Phishing", tactic: "Initial Access", url: "https://attack.mitre.org/techniques/T1566/" },
  "T1566.001": { id: "T1566.001", name: "Spearphishing Attachment", tactic: "Initial Access", url: "https://attack.mitre.org/techniques/T1566/001/" },
  "T1566.002": { id: "T1566.002", name: "Spearphishing Link", tactic: "Initial Access", url: "https://attack.mitre.org/techniques/T1566/002/" },
  "T1190": { id: "T1190", name: "Exploit Public-Facing Application", tactic: "Initial Access", url: "https://attack.mitre.org/techniques/T1190/" },
  "T1133": { id: "T1133", name: "External Remote Services", tactic: "Initial Access", url: "https://attack.mitre.org/techniques/T1133/" },
  "T1078": { id: "T1078", name: "Valid Accounts", tactic: "Initial Access", url: "https://attack.mitre.org/techniques/T1078/" },
  "T1195": { id: "T1195", name: "Supply Chain Compromise", tactic: "Initial Access", url: "https://attack.mitre.org/techniques/T1195/" },
  "T1059": { id: "T1059", name: "Command and Scripting Interpreter", tactic: "Execution", url: "https://attack.mitre.org/techniques/T1059/" },
  "T1059.001": { id: "T1059.001", name: "PowerShell", tactic: "Execution", url: "https://attack.mitre.org/techniques/T1059/001/" },
  "T1059.003": { id: "T1059.003", name: "Windows Command Shell", tactic: "Execution", url: "https://attack.mitre.org/techniques/T1059/003/" },
  "T1204": { id: "T1204", name: "User Execution", tactic: "Execution", url: "https://attack.mitre.org/techniques/T1204/" },
  "T1047": { id: "T1047", name: "Windows Management Instrumentation", tactic: "Execution", url: "https://attack.mitre.org/techniques/T1047/" },
  "T1053": { id: "T1053", name: "Scheduled Task/Job", tactic: "Persistence", url: "https://attack.mitre.org/techniques/T1053/" },
  "T1547": { id: "T1547", name: "Boot or Logon Autostart Execution", tactic: "Persistence", url: "https://attack.mitre.org/techniques/T1547/" },
  "T1547.001": { id: "T1547.001", name: "Registry Run Keys", tactic: "Persistence", url: "https://attack.mitre.org/techniques/T1547/001/" },
  "T1136": { id: "T1136", name: "Create Account", tactic: "Persistence", url: "https://attack.mitre.org/techniques/T1136/" },
  "T1548": { id: "T1548", name: "Abuse Elevation Control Mechanism", tactic: "Privilege Escalation", url: "https://attack.mitre.org/techniques/T1548/" },
  "T1068": { id: "T1068", name: "Exploitation for Privilege Escalation", tactic: "Privilege Escalation", url: "https://attack.mitre.org/techniques/T1068/" },
  "T1055": { id: "T1055", name: "Process Injection", tactic: "Defense Evasion", url: "https://attack.mitre.org/techniques/T1055/" },
  "T1562": { id: "T1562", name: "Impair Defenses", tactic: "Defense Evasion", url: "https://attack.mitre.org/techniques/T1562/" },
  "T1562.001": { id: "T1562.001", name: "Disable or Modify Tools", tactic: "Defense Evasion", url: "https://attack.mitre.org/techniques/T1562/001/" },
  "T1070": { id: "T1070", name: "Indicator Removal", tactic: "Defense Evasion", url: "https://attack.mitre.org/techniques/T1070/" },
  "T1027": { id: "T1027", name: "Obfuscated Files or Information", tactic: "Defense Evasion", url: "https://attack.mitre.org/techniques/T1027/" },
  "T1036": { id: "T1036", name: "Masquerading", tactic: "Defense Evasion", url: "https://attack.mitre.org/techniques/T1036/" },
  "T1003": { id: "T1003", name: "OS Credential Dumping", tactic: "Credential Access", url: "https://attack.mitre.org/techniques/T1003/" },
  "T1110": { id: "T1110", name: "Brute Force", tactic: "Credential Access", url: "https://attack.mitre.org/techniques/T1110/" },
  "T1555": { id: "T1555", name: "Credentials from Password Stores", tactic: "Credential Access", url: "https://attack.mitre.org/techniques/T1555/" },
  "T1552": { id: "T1552", name: "Unsecured Credentials", tactic: "Credential Access", url: "https://attack.mitre.org/techniques/T1552/" },
  "T1087": { id: "T1087", name: "Account Discovery", tactic: "Discovery", url: "https://attack.mitre.org/techniques/T1087/" },
  "T1083": { id: "T1083", name: "File and Directory Discovery", tactic: "Discovery", url: "https://attack.mitre.org/techniques/T1083/" },
  "T1046": { id: "T1046", name: "Network Service Discovery", tactic: "Discovery", url: "https://attack.mitre.org/techniques/T1046/" },
  "T1135": { id: "T1135", name: "Network Share Discovery", tactic: "Discovery", url: "https://attack.mitre.org/techniques/T1135/" },
  "T1057": { id: "T1057", name: "Process Discovery", tactic: "Discovery", url: "https://attack.mitre.org/techniques/T1057/" },
  "T1021": { id: "T1021", name: "Remote Services", tactic: "Lateral Movement", url: "https://attack.mitre.org/techniques/T1021/" },
  "T1021.001": { id: "T1021.001", name: "Remote Desktop Protocol", tactic: "Lateral Movement", url: "https://attack.mitre.org/techniques/T1021/001/" },
  "T1021.002": { id: "T1021.002", name: "SMB/Windows Admin Shares", tactic: "Lateral Movement", url: "https://attack.mitre.org/techniques/T1021/002/" },
  "T1570": { id: "T1570", name: "Lateral Tool Transfer", tactic: "Lateral Movement", url: "https://attack.mitre.org/techniques/T1570/" },
  "T1560": { id: "T1560", name: "Archive Collected Data", tactic: "Collection", url: "https://attack.mitre.org/techniques/T1560/" },
  "T1005": { id: "T1005", name: "Data from Local System", tactic: "Collection", url: "https://attack.mitre.org/techniques/T1005/" },
  "T1039": { id: "T1039", name: "Data from Network Shared Drive", tactic: "Collection", url: "https://attack.mitre.org/techniques/T1039/" },
  "T1041": { id: "T1041", name: "Exfiltration Over C2 Channel", tactic: "Exfiltration", url: "https://attack.mitre.org/techniques/T1041/" },
  "T1048": { id: "T1048", name: "Exfiltration Over Alternative Protocol", tactic: "Exfiltration", url: "https://attack.mitre.org/techniques/T1048/" },
  "T1567": { id: "T1567", name: "Exfiltration Over Web Service", tactic: "Exfiltration", url: "https://attack.mitre.org/techniques/T1567/" },
  "T1486": { id: "T1486", name: "Data Encrypted for Impact", tactic: "Impact", url: "https://attack.mitre.org/techniques/T1486/" },
  "T1490": { id: "T1490", name: "Inhibit System Recovery", tactic: "Impact", url: "https://attack.mitre.org/techniques/T1490/" },
  "T1489": { id: "T1489", name: "Service Stop", tactic: "Impact", url: "https://attack.mitre.org/techniques/T1489/" },
  "T1529": { id: "T1529", name: "System Shutdown/Reboot", tactic: "Impact", url: "https://attack.mitre.org/techniques/T1529/" },
  "T1071": { id: "T1071", name: "Application Layer Protocol", tactic: "Command and Control", url: "https://attack.mitre.org/techniques/T1071/" },
  "T1105": { id: "T1105", name: "Ingress Tool Transfer", tactic: "Command and Control", url: "https://attack.mitre.org/techniques/T1105/" },
  "T1573": { id: "T1573", name: "Encrypted Channel", tactic: "Command and Control", url: "https://attack.mitre.org/techniques/T1573/" },
  "T1219": { id: "T1219", name: "Remote Access Software", tactic: "Command and Control", url: "https://attack.mitre.org/techniques/T1219/" },
  "T1572": { id: "T1572", name: "Protocol Tunneling", tactic: "Command and Control", url: "https://attack.mitre.org/techniques/T1572/" },
  "T1098": { id: "T1098", name: "Account Manipulation", tactic: "Persistence", url: "https://attack.mitre.org/techniques/T1098/" },
  "T1574": { id: "T1574", name: "Hijack Execution Flow", tactic: "Persistence", url: "https://attack.mitre.org/techniques/T1574/" },
  "T1112": { id: "T1112", name: "Modify Registry", tactic: "Defense Evasion", url: "https://attack.mitre.org/techniques/T1112/" },
  "T1497": { id: "T1497", name: "Virtualization/Sandbox Evasion", tactic: "Defense Evasion", url: "https://attack.mitre.org/techniques/T1497/" },
  "T1218": { id: "T1218", name: "System Binary Proxy Execution", tactic: "Defense Evasion", url: "https://attack.mitre.org/techniques/T1218/" },
  "T1543": { id: "T1543", name: "Create or Modify System Process", tactic: "Persistence", url: "https://attack.mitre.org/techniques/T1543/" },
  "T1543.003": { id: "T1543.003", name: "Windows Service", tactic: "Persistence", url: "https://attack.mitre.org/techniques/T1543/003/" },
};

export const ACTOR_MITRE_MAPPING: Record<string, string[]> = {
  "lockbit": ["T1190", "T1133", "T1078", "T1059.001", "T1059.003", "T1047", "T1053", "T1547.001", "T1562.001", "T1070", "T1027", "T1003", "T1135", "T1021.001", "T1021.002", "T1570", "T1560", "T1005", "T1041", "T1486", "T1490", "T1489", "T1219", "T1105"],
  "blackcat": ["T1190", "T1078", "T1059.001", "T1059.003", "T1055", "T1562.001", "T1027", "T1036", "T1003", "T1087", "T1083", "T1135", "T1021.001", "T1021.002", "T1005", "T1039", "T1041", "T1567", "T1486", "T1490", "T1489", "T1071", "T1573"],
  "alphv": ["T1190", "T1078", "T1059.001", "T1059.003", "T1055", "T1562.001", "T1027", "T1036", "T1003", "T1087", "T1083", "T1135", "T1021.001", "T1021.002", "T1005", "T1039", "T1041", "T1567", "T1486", "T1490", "T1489", "T1071", "T1573"],
  "cl0p": ["T1190", "T1195", "T1059", "T1053", "T1562.001", "T1027", "T1003", "T1083", "T1046", "T1560", "T1005", "T1048", "T1567", "T1486", "T1490", "T1105"],
  "clop": ["T1190", "T1195", "T1059", "T1053", "T1562.001", "T1027", "T1003", "T1083", "T1046", "T1560", "T1005", "T1048", "T1567", "T1486", "T1490", "T1105"],
  "conti": ["T1566.001", "T1190", "T1059.001", "T1059.003", "T1047", "T1053", "T1547.001", "T1055", "T1562.001", "T1070", "T1003", "T1110", "T1087", "T1135", "T1057", "T1021.001", "T1021.002", "T1570", "T1005", "T1039", "T1041", "T1486", "T1490", "T1489", "T1071", "T1219", "T1105"],
  "revil": ["T1566.001", "T1190", "T1133", "T1059.001", "T1204", "T1053", "T1547.001", "T1548", "T1562.001", "T1027", "T1003", "T1552", "T1083", "T1135", "T1021.001", "T1021.002", "T1005", "T1041", "T1486", "T1490", "T1071", "T1573", "T1105"],
  "sodinokibi": ["T1566.001", "T1190", "T1133", "T1059.001", "T1204", "T1053", "T1547.001", "T1548", "T1562.001", "T1027", "T1003", "T1552", "T1083", "T1135", "T1021.001", "T1021.002", "T1005", "T1041", "T1486", "T1490", "T1071", "T1573", "T1105"],
  "blackbasta": ["T1566.001", "T1190", "T1059.001", "T1059.003", "T1053", "T1547.001", "T1562.001", "T1027", "T1036", "T1003", "T1087", "T1046", "T1135", "T1021.002", "T1570", "T1005", "T1041", "T1486", "T1490", "T1219", "T1105"],
  "black basta": ["T1566.001", "T1190", "T1059.001", "T1059.003", "T1053", "T1547.001", "T1562.001", "T1027", "T1036", "T1003", "T1087", "T1046", "T1135", "T1021.002", "T1570", "T1005", "T1041", "T1486", "T1490", "T1219", "T1105"],
  "hive": ["T1566.001", "T1190", "T1133", "T1059.001", "T1204", "T1053", "T1547.001", "T1562.001", "T1070", "T1003", "T1555", "T1083", "T1135", "T1021.001", "T1570", "T1005", "T1041", "T1486", "T1490", "T1489", "T1071", "T1105"],
  "royal": ["T1566.001", "T1566.002", "T1190", "T1059.001", "T1059.003", "T1204", "T1053", "T1547.001", "T1562.001", "T1027", "T1003", "T1087", "T1083", "T1046", "T1021.001", "T1021.002", "T1005", "T1041", "T1486", "T1490", "T1219", "T1105"],
  "play": ["T1190", "T1133", "T1078", "T1059.001", "T1059.003", "T1053", "T1562.001", "T1070", "T1027", "T1003", "T1083", "T1135", "T1021.001", "T1021.002", "T1005", "T1041", "T1486", "T1490", "T1105"],
  "8base": ["T1566.001", "T1190", "T1059.001", "T1204", "T1562.001", "T1027", "T1083", "T1046", "T1005", "T1041", "T1486", "T1490", "T1105"],
  "akira": ["T1566.001", "T1190", "T1133", "T1078", "T1059.001", "T1059.003", "T1053", "T1562.001", "T1027", "T1003", "T1087", "T1083", "T1046", "T1135", "T1021.001", "T1021.002", "T1005", "T1039", "T1041", "T1567", "T1486", "T1490", "T1219", "T1105"],
  "medusa": ["T1190", "T1133", "T1078", "T1059.001", "T1059.003", "T1053", "T1562.001", "T1027", "T1003", "T1083", "T1135", "T1021.001", "T1005", "T1041", "T1486", "T1490", "T1105"],
  "bianlian": ["T1190", "T1133", "T1078", "T1059.001", "T1059.003", "T1562.001", "T1003", "T1087", "T1083", "T1046", "T1135", "T1021.001", "T1005", "T1039", "T1048", "T1567", "T1486", "T1490", "T1219", "T1105"],
  "rhysida": ["T1566.001", "T1190", "T1059.001", "T1059.003", "T1053", "T1562.001", "T1027", "T1003", "T1087", "T1083", "T1046", "T1021.001", "T1021.002", "T1005", "T1041", "T1486", "T1490", "T1105"],
  "hunters international": ["T1190", "T1133", "T1078", "T1059.001", "T1562.001", "T1027", "T1003", "T1083", "T1135", "T1021.001", "T1005", "T1041", "T1486", "T1490", "T1105"],
  "inc ransom": ["T1190", "T1133", "T1059.001", "T1059.003", "T1562.001", "T1003", "T1083", "T1046", "T1021.001", "T1005", "T1041", "T1486", "T1490", "T1105"],
  "maze": ["T1566.001", "T1190", "T1059.001", "T1059.003", "T1204", "T1053", "T1547.001", "T1562.001", "T1070", "T1027", "T1003", "T1555", "T1087", "T1083", "T1135", "T1021.001", "T1021.002", "T1570", "T1560", "T1005", "T1039", "T1041", "T1567", "T1486", "T1490", "T1489", "T1071", "T1573", "T1219", "T1105"],
  "ryuk": ["T1566.001", "T1059.001", "T1059.003", "T1047", "T1204", "T1053", "T1547.001", "T1055", "T1562.001", "T1070", "T1003", "T1087", "T1135", "T1057", "T1021.001", "T1021.002", "T1570", "T1005", "T1041", "T1486", "T1490", "T1489", "T1529", "T1071", "T1105"],
  "darkside": ["T1566.001", "T1190", "T1133", "T1059.001", "T1059.003", "T1204", "T1053", "T1547.001", "T1562.001", "T1027", "T1036", "T1003", "T1555", "T1087", "T1083", "T1135", "T1021.001", "T1021.002", "T1005", "T1039", "T1041", "T1486", "T1490", "T1489", "T1071", "T1573", "T1105"],
  "ragnar locker": ["T1190", "T1133", "T1059.003", "T1053", "T1497", "T1562.001", "T1027", "T1003", "T1083", "T1135", "T1021.001", "T1005", "T1041", "T1486", "T1490", "T1071"],
  "vice society": ["T1190", "T1133", "T1078", "T1059.001", "T1059.003", "T1053", "T1562.001", "T1003", "T1087", "T1083", "T1021.001", "T1005", "T1041", "T1486", "T1490", "T1105"],
  "lazarus": ["T1566.001", "T1566.002", "T1195", "T1059.001", "T1059.003", "T1204", "T1053", "T1547.001", "T1543.003", "T1055", "T1562.001", "T1070", "T1027", "T1036", "T1112", "T1497", "T1218", "T1003", "T1555", "T1552", "T1087", "T1083", "T1046", "T1057", "T1021.001", "T1570", "T1560", "T1005", "T1041", "T1048", "T1567", "T1486", "T1490", "T1071", "T1573", "T1572", "T1105"],
  "apt28": ["T1566.001", "T1566.002", "T1190", "T1133", "T1078", "T1059.001", "T1059.003", "T1204", "T1053", "T1547.001", "T1068", "T1055", "T1562.001", "T1070", "T1027", "T1036", "T1003", "T1110", "T1555", "T1087", "T1083", "T1046", "T1057", "T1021.001", "T1005", "T1039", "T1041", "T1048", "T1071", "T1573", "T1105"],
  "apt29": ["T1566.001", "T1566.002", "T1195", "T1078", "T1059.001", "T1204", "T1053", "T1547.001", "T1098", "T1068", "T1055", "T1562.001", "T1070", "T1027", "T1036", "T1574", "T1003", "T1555", "T1552", "T1087", "T1083", "T1046", "T1057", "T1021.001", "T1021.002", "T1005", "T1039", "T1041", "T1567", "T1071", "T1573", "T1572", "T1105"],
  "apt41": ["T1190", "T1195", "T1078", "T1059.001", "T1059.003", "T1047", "T1053", "T1547.001", "T1543.003", "T1068", "T1055", "T1562.001", "T1070", "T1027", "T1036", "T1112", "T1003", "T1555", "T1087", "T1083", "T1046", "T1021.001", "T1021.002", "T1570", "T1005", "T1039", "T1041", "T1486", "T1071", "T1573", "T1105"],
  "fin7": ["T1566.001", "T1566.002", "T1059.001", "T1059.003", "T1204", "T1053", "T1547.001", "T1055", "T1562.001", "T1027", "T1036", "T1218", "T1003", "T1555", "T1087", "T1083", "T1057", "T1005", "T1041", "T1071", "T1573", "T1105", "T1219"],
};

export const MITRE_TACTICS = [
  "Initial Access",
  "Execution",
  "Persistence",
  "Privilege Escalation",
  "Defense Evasion",
  "Credential Access",
  "Discovery",
  "Lateral Movement",
  "Collection",
  "Exfiltration",
  "Command and Control",
  "Impact",
] as const;

export const TACTIC_COLORS: Record<string, string> = {
  "Initial Access": "#ef4444",
  "Execution": "#f97316",
  "Persistence": "#f59e0b",
  "Privilege Escalation": "#eab308",
  "Defense Evasion": "#84cc16",
  "Credential Access": "#22c55e",
  "Discovery": "#10b981",
  "Lateral Movement": "#06b6d4",
  "Collection": "#3b82f6",
  "Exfiltration": "#6366f1",
  "Command and Control": "#a855f7",
  "Impact": "#ec4899",
};

export function getActorTechniques(actorName: string): MitreTechnique[] {
  const normalized = actorName.toLowerCase().trim();
  const techniqueIds = ACTOR_MITRE_MAPPING[normalized];
  if (!techniqueIds) return [];
  return techniqueIds
    .map(id => MITRE_TECHNIQUES[id])
    .filter((t): t is MitreTechnique => !!t);
}

export function getTacticBreakdown(techniques: MitreTechnique[]): Record<string, MitreTechnique[]> {
  const breakdown: Record<string, MitreTechnique[]> = {};
  for (const t of techniques) {
    if (!breakdown[t.tactic]) breakdown[t.tactic] = [];
    breakdown[t.tactic].push(t);
  }
  return breakdown;
}
