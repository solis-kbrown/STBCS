import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Download,
  Lock,
  Users,
  Server,
  Mail,
  Wifi,
  HardDrive,
  Eye,
  FileCheck,
  Globe,
} from "lucide-react";

interface Question {
  id: string;
  category: string;
  categoryIcon: typeof Shield;
  question: string;
  options: { label: string; value: number; detail?: string }[];
}

const questions: Question[] = [
  {
    id: "mfa",
    category: "Access Control",
    categoryIcon: Lock,
    question: "Does your organization use Multi-Factor Authentication (MFA)?",
    options: [
      { label: "Yes, for all accounts", value: 10, detail: "Excellent - MFA is the #1 defense against account compromise" },
      { label: "Yes, for some accounts", value: 5, detail: "Partial coverage leaves gaps" },
      { label: "No", value: 0, detail: "Critical risk - 80% of breaches involve compromised credentials" },
    ],
  },
  {
    id: "passwords",
    category: "Access Control",
    categoryIcon: Lock,
    question: "How does your organization manage passwords?",
    options: [
      { label: "Enterprise password manager with policies", value: 10 },
      { label: "Personal password managers encouraged", value: 6 },
      { label: "Users manage their own passwords", value: 2 },
      { label: "Shared passwords / sticky notes", value: 0 },
    ],
  },
  {
    id: "endpoint",
    category: "Endpoint Security",
    categoryIcon: HardDrive,
    question: "What endpoint protection do you use?",
    options: [
      { label: "EDR/XDR solution (CrowdStrike, SentinelOne, etc.)", value: 10 },
      { label: "Business antivirus with central management", value: 7 },
      { label: "Consumer antivirus on individual machines", value: 3 },
      { label: "Built-in OS protection only (Windows Defender)", value: 1 },
      { label: "No endpoint protection", value: 0 },
    ],
  },
  {
    id: "patching",
    category: "Endpoint Security",
    categoryIcon: HardDrive,
    question: "How quickly are security patches applied?",
    options: [
      { label: "Automated patching within 24-48 hours", value: 10 },
      { label: "Within 1 week of release", value: 7 },
      { label: "Monthly patching cycle", value: 4 },
      { label: "Quarterly or less frequently", value: 1 },
      { label: "No patching process", value: 0 },
    ],
  },
  {
    id: "email_security",
    category: "Email Security",
    categoryIcon: Mail,
    question: "What email security measures are in place?",
    options: [
      { label: "Advanced email gateway + DMARC/DKIM/SPF + training", value: 10 },
      { label: "Email filtering + basic spam protection", value: 6 },
      { label: "Built-in provider filtering only (Gmail/O365 defaults)", value: 3 },
      { label: "No additional email security", value: 0 },
    ],
  },
  {
    id: "awareness",
    category: "Security Awareness",
    categoryIcon: Users,
    question: "Do employees receive cybersecurity training?",
    options: [
      { label: "Regular training + simulated phishing tests", value: 10 },
      { label: "Annual security awareness training", value: 5 },
      { label: "One-time onboarding training only", value: 2 },
      { label: "No security training", value: 0 },
    ],
  },
  {
    id: "backups",
    category: "Data Protection",
    categoryIcon: Server,
    question: "How is your data backup strategy?",
    options: [
      { label: "3-2-1 backups with tested restores + immutable copies", value: 10 },
      { label: "Regular automated backups with offsite copies", value: 7 },
      { label: "Cloud-only backups (OneDrive, Google Drive)", value: 4 },
      { label: "Manual/occasional backups", value: 1 },
      { label: "No backups", value: 0 },
    ],
  },
  {
    id: "network",
    category: "Network Security",
    categoryIcon: Wifi,
    question: "What network security controls are in place?",
    options: [
      { label: "Next-gen firewall + IDS/IPS + network segmentation", value: 10 },
      { label: "Business firewall with basic rules", value: 6 },
      { label: "ISP-provided router/firewall only", value: 2 },
      { label: "No dedicated firewall", value: 0 },
    ],
  },
  {
    id: "incident_response",
    category: "Incident Response",
    categoryIcon: ShieldAlert,
    question: "Do you have an incident response plan?",
    options: [
      { label: "Written plan, tested annually, with retainer IR team", value: 10 },
      { label: "Written plan but never tested", value: 5 },
      { label: "Informal / ad-hoc response", value: 2 },
      { label: "No incident response plan", value: 0 },
    ],
  },
  {
    id: "monitoring",
    category: "Monitoring",
    categoryIcon: Eye,
    question: "How do you monitor for security threats?",
    options: [
      { label: "24/7 SOC or managed SIEM with alerting", value: 10 },
      { label: "SIEM or log management with periodic review", value: 6 },
      { label: "Basic logging with no regular review", value: 2 },
      { label: "No security monitoring", value: 0 },
    ],
  },
  {
    id: "vendor_risk",
    category: "Third-Party Risk",
    categoryIcon: Globe,
    question: "How do you manage third-party/vendor security?",
    options: [
      { label: "Formal vendor risk assessments + contractual requirements", value: 10 },
      { label: "Basic due diligence before onboarding vendors", value: 5 },
      { label: "Trust vendors without formal assessment", value: 1 },
      { label: "Never considered vendor security", value: 0 },
    ],
  },
  {
    id: "compliance",
    category: "Governance",
    categoryIcon: FileCheck,
    question: "Does your organization follow any security framework?",
    options: [
      { label: "Certified (SOC 2, ISO 27001, NIST CSF, etc.)", value: 10 },
      { label: "Following a framework but not certified", value: 6 },
      { label: "Some security policies in place", value: 3 },
      { label: "No formal security policies", value: 0 },
    ],
  },
];

const maxScore = questions.length * 10;

function getGrade(score: number): { letter: string; color: string; bgColor: string; label: string; icon: typeof Shield } {
  const pct = (score / maxScore) * 100;
  if (pct >= 90) return { letter: "A+", color: "text-green-400", bgColor: "bg-green-500/10 border-green-500/30", label: "Excellent", icon: ShieldCheck };
  if (pct >= 80) return { letter: "A", color: "text-green-400", bgColor: "bg-green-500/10 border-green-500/30", label: "Strong", icon: ShieldCheck };
  if (pct >= 70) return { letter: "B", color: "text-blue-400", bgColor: "bg-blue-500/10 border-blue-500/30", label: "Good", icon: Shield };
  if (pct >= 60) return { letter: "C", color: "text-yellow-400", bgColor: "bg-yellow-500/10 border-yellow-500/30", label: "Fair", icon: ShieldAlert };
  if (pct >= 50) return { letter: "D", color: "text-orange-400", bgColor: "bg-orange-500/10 border-orange-500/30", label: "Needs Improvement", icon: AlertTriangle };
  return { letter: "F", color: "text-red-400", bgColor: "bg-red-500/10 border-red-500/30", label: "Critical Risk", icon: ShieldOff };
}

export default function RiskScore() {
  useDocumentTitle(
    "Cyber Risk Score Calculator | STB Cybersecurity",
    "Free cybersecurity risk assessment for small and medium businesses. Get your security grade and actionable recommendations in minutes."
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  const totalScore = useMemo(() => Object.values(answers).reduce((a, b) => a + b, 0), [answers]);
  const grade = useMemo(() => getGrade(totalScore), [totalScore]);

  const categoryScores = useMemo(() => {
    const cats = new Map<string, { max: number; score: number; icon: typeof Shield }>();
    questions.forEach((q) => {
      const existing = cats.get(q.category) || { max: 0, score: 0, icon: q.categoryIcon };
      existing.max += 10;
      existing.score += answers[q.id] ?? 0;
      existing.icon = q.categoryIcon;
      cats.set(q.category, existing);
    });
    return Array.from(cats.entries()).map(([name, data]) => ({
      name,
      ...data,
      pct: Math.round((data.score / data.max) * 100),
    }));
  }, [answers]);

  const weakAreas = useMemo(
    () => categoryScores.filter((c) => c.pct < 50).sort((a, b) => a.pct - b.pct),
    [categoryScores]
  );

  const recommendations = useMemo(() => {
    const recs: string[] = [];
    if ((answers.mfa ?? -1) < 10) recs.push("Enable MFA on all accounts immediately - this blocks 99.9% of automated attacks");
    if ((answers.backups ?? -1) < 7) recs.push("Implement 3-2-1 backup strategy with immutable copies to defend against ransomware");
    if ((answers.patching ?? -1) < 7) recs.push("Automate security patching to reduce your vulnerability window");
    if ((answers.awareness ?? -1) < 5) recs.push("Start regular security awareness training with phishing simulations");
    if ((answers.incident_response ?? -1) < 5) recs.push("Develop and test an incident response plan before a breach occurs");
    if ((answers.endpoint ?? -1) < 7) recs.push("Upgrade to an EDR/XDR solution for advanced threat detection");
    if ((answers.monitoring ?? -1) < 6) recs.push("Implement security monitoring/SIEM to detect threats early");
    if ((answers.email_security ?? -1) < 6) recs.push("Deploy advanced email security with DMARC/DKIM/SPF authentication");
    if ((answers.network ?? -1) < 6) recs.push("Upgrade network security with next-gen firewall and network segmentation");
    if ((answers.compliance ?? -1) < 6) recs.push("Adopt a security framework like NIST CSF or CIS Controls");
    return recs;
  }, [answers]);

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep((s) => s + 1), 300);
    } else {
      setTimeout(() => setShowResults(true), 300);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({});
    setShowResults(false);
  };

  const downloadReport = () => {
    const lines = [
      "STBCS CYBER RISK ASSESSMENT REPORT",
      `Date: ${new Date().toLocaleDateString()}`,
      `Overall Score: ${totalScore}/${maxScore} (${Math.round((totalScore / maxScore) * 100)}%)`,
      `Grade: ${grade.letter} - ${grade.label}`,
      "",
      "CATEGORY SCORES",
      "─".repeat(40),
      ...categoryScores.map((c) => `${c.name}: ${c.score}/${c.max} (${c.pct}%)`),
      "",
      "ANSWERS",
      "─".repeat(40),
      ...questions.map((q) => {
        const ansVal = answers[q.id];
        const chosen = q.options.find((o) => o.value === ansVal);
        return `${q.question}\n  → ${chosen?.label || "Not answered"} (${ansVal ?? 0}/10)`;
      }),
      "",
      "RECOMMENDATIONS",
      "─".repeat(40),
      ...recommendations.map((r, i) => `${i + 1}. ${r}`),
      "",
      "─".repeat(40),
      "Generated by STB Cybersecurity (stbcybersecurity.com)",
      "For professional remediation, contact us for a free consultation.",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stbcs-risk-assessment-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const progress = Math.round((Object.keys(answers).length / questions.length) * 100);

  if (showResults) {
    return (
      <Layout>
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-white mb-2" data-testid="text-risk-title">
                Your Cyber Risk Score
              </h1>
              <p className="text-muted-foreground">Assessment complete. Here's your cybersecurity posture analysis.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={downloadReport} data-testid="button-download-report">
                <Download className="h-4 w-4 mr-1" /> Download Report
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset} data-testid="button-retake">
                <RotateCcw className="h-4 w-4 mr-1" /> Retake
              </Button>
            </div>
          </div>

          <Card className={`border ${grade.bgColor}`}>
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className={`text-6xl font-bold ${grade.color}`} data-testid="text-grade">
                  {grade.letter}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-white">{grade.label}</p>
                  <p className="text-sm text-muted-foreground">
                    Score: {totalScore}/{maxScore} ({Math.round((totalScore / maxScore) * 100)}%)
                  </p>
                  <div className="w-full bg-zinc-800 rounded-full h-3 mt-2">
                    <div
                      className={`h-3 rounded-full transition-all duration-1000 ${
                        grade.letter.startsWith("A") ? "bg-green-500" :
                        grade.letter === "B" ? "bg-blue-500" :
                        grade.letter === "C" ? "bg-yellow-500" :
                        grade.letter === "D" ? "bg-orange-500" : "bg-red-500"
                      }`}
                      style={{ width: `${Math.round((totalScore / maxScore) * 100)}%` }}
                    />
                  </div>
                </div>
                <grade.icon className={`h-16 w-16 ${grade.color} opacity-30`} />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {categoryScores.map((cat) => (
              <Card key={cat.name} className="border-white/5 bg-card/50" data-testid={`card-category-${cat.name.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <cat.icon className="h-4 w-4 text-orange-400" />
                    <span className="text-sm font-semibold text-white">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-zinc-800 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-700 ${
                          cat.pct >= 70 ? "bg-green-500" :
                          cat.pct >= 50 ? "bg-yellow-500" :
                          cat.pct >= 30 ? "bg-orange-500" : "bg-red-500"
                        }`}
                        style={{ width: `${cat.pct}%` }}
                      />
                    </div>
                    <span className={`text-sm font-bold ${
                      cat.pct >= 70 ? "text-green-400" :
                      cat.pct >= 50 ? "text-yellow-400" :
                      cat.pct >= 30 ? "text-orange-400" : "text-red-400"
                    }`}>
                      {cat.pct}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {weakAreas.length > 0 && (
            <Card className="border-red-500/20 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-red-400">
                  <AlertTriangle className="h-4 w-4" /> Priority Weak Areas
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {weakAreas.map((area) => (
                    <div key={area.name} className="flex items-center justify-between p-2 bg-red-500/5 rounded border border-red-500/10">
                      <span className="text-sm text-white">{area.name}</span>
                      <Badge variant="outline" className="text-red-400 border-red-500/30">{area.pct}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {recommendations.length > 0 && (
            <Card className="border-orange-500/20 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-orange-400">
                  <CheckCircle className="h-4 w-4" /> Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ol className="space-y-2">
                  {recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                      <span className="text-orange-400 font-bold shrink-0">{i + 1}.</span>
                      {rec}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          <Card className="border-orange-500/30 bg-orange-500/5">
            <CardContent className="p-5 text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Need Help Improving Your Score?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                STB Cybersecurity offers professional remediation services tailored for small and medium businesses.
                Get a free consultation to address your specific vulnerabilities.
              </p>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white" asChild>
                <a href="/contact">View Our Services</a>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </Layout>
    );
  }

  const currentQuestion = questions[currentStep];

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2" data-testid="text-risk-title">
            Cyber Risk Score Calculator
          </h1>
          <p className="text-muted-foreground">
            Free cybersecurity assessment for small and medium businesses. Answer {questions.length} questions to get your security grade and actionable recommendations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 bg-zinc-800 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-orange-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm text-muted-foreground">{Object.keys(answers).length}/{questions.length}</span>
        </div>

        <Card className="border-white/10 bg-card/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-[10px] border-orange-500/30 text-orange-400">
                <currentQuestion.categoryIcon className="h-3 w-3 mr-1" />
                {currentQuestion.category}
              </Badge>
              <span className="text-xs text-muted-foreground">Question {currentStep + 1} of {questions.length}</span>
            </div>
            <h2 className="text-lg font-semibold text-white mt-3 mb-5" data-testid="text-current-question">
              {currentQuestion.question}
            </h2>
            <div className="space-y-2">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = answers[currentQuestion.id] === opt.value;
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(currentQuestion.id, opt.value)}
                    className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                      isSelected
                        ? "border-orange-500 bg-orange-500/10"
                        : "border-white/5 bg-zinc-900/50 hover:border-orange-500/30 hover:bg-zinc-800/50"
                    }`}
                    data-testid={`button-option-${idx}`}
                  >
                    <span className={`text-sm ${isSelected ? "text-orange-400 font-semibold" : "text-zinc-300"}`}>
                      {opt.label}
                    </span>
                    {opt.detail && isSelected && (
                      <p className="text-xs text-muted-foreground mt-1">{opt.detail}</p>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              {currentStep < questions.length - 1 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep((s) => s + 1)}
                  disabled={!answers[currentQuestion.id] && answers[currentQuestion.id] !== 0}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => setShowResults(true)}
                  disabled={Object.keys(answers).length < questions.length}
                  data-testid="button-view-results"
                >
                  View Results
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "100% Free", desc: "No sign-up required. Get your score instantly.", icon: Shield },
            { title: "Actionable Insights", desc: "Prioritized recommendations based on real-world threats.", icon: CheckCircle },
            { title: "SMB-Focused", desc: "Built for small and medium business security needs.", icon: Users },
          ].map((item) => (
            <Card key={item.title} className="border-white/5 bg-card/30">
              <CardContent className="p-4 text-center">
                <item.icon className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </Layout>
  );
}
