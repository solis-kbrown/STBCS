import { useState } from "react";
import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail,
  Lock,
  Crown,
  Loader2,
  Shield,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  AlertTriangle,
  Clock,
  ArrowRight,
  Server,
  Copy,
  Check,
  Trash2,
  Info,
  Globe,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface ReceivedHop {
  from: string;
  by: string;
  with?: string;
  timestamp?: string;
  delay?: number;
  ip?: string;
}

interface AuthResults {
  spf?: string;
  dkim?: string;
  dmarc?: string;
}

interface EmailHeaderAnalysis {
  metadata: {
    from?: string;
    to?: string;
    subject?: string;
    date?: string;
    messageId?: string;
    xMailer?: string;
    contentType?: string;
    replyTo?: string;
    returnPath?: string;
    mimeVersion?: string;
  };
  hops: ReceivedHop[];
  authResults: AuthResults;
  totalDelay?: number;
  warnings: string[];
}

function AuthBadge({ label, value }: { label: string; value?: string }) {
  if (!value) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50" data-testid={`badge-auth-${label.toLowerCase()}`}>
        <ShieldAlert className="h-4 w-4 text-zinc-500" />
        <span className="text-xs font-medium text-zinc-500">{label}</span>
        <span className="text-xs text-zinc-600 ml-auto">Not found</span>
      </div>
    );
  }

  const isPassing = value.toLowerCase() === "pass" || value.toLowerCase() === "present";
  const isFailing = value.toLowerCase() === "fail" || value.toLowerCase() === "hardfail" || value.toLowerCase() === "softfail";

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
        isPassing
          ? "bg-green-500/10 border-green-500/30"
          : isFailing
            ? "bg-red-500/10 border-red-500/30"
            : "bg-amber-500/10 border-amber-500/30"
      }`}
      data-testid={`badge-auth-${label.toLowerCase()}`}
    >
      {isPassing ? (
        <ShieldCheck className="h-4 w-4 text-green-400" />
      ) : isFailing ? (
        <ShieldX className="h-4 w-4 text-red-400" />
      ) : (
        <ShieldAlert className="h-4 w-4 text-amber-400" />
      )}
      <span className={`text-xs font-medium ${isPassing ? "text-green-400" : isFailing ? "text-red-400" : "text-amber-400"}`}>
        {label}
      </span>
      <span className={`text-xs ml-auto font-mono ${isPassing ? "text-green-300" : isFailing ? "text-red-300" : "text-amber-300"}`}>
        {value}
      </span>
    </div>
  );
}

function HopTimeline({ hops }: { hops: ReceivedHop[] }) {
  if (hops.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
        <Server className="h-8 w-8 mb-2" />
        <p className="text-sm">No routing hops detected</p>
      </div>
    );
  }

  return (
    <div className="space-y-0" data-testid="container-hop-timeline">
      {hops.map((hop, index) => (
        <div key={index} className="relative" data-testid={`hop-${index}`}>
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                index === 0
                  ? "bg-green-500/20 border border-green-500/50"
                  : index === hops.length - 1
                    ? "bg-orange-500/20 border border-orange-500/50"
                    : "bg-zinc-800 border border-zinc-700"
              }`}>
                <span className={`text-xs font-mono font-bold ${
                  index === 0 ? "text-green-400" : index === hops.length - 1 ? "text-orange-400" : "text-zinc-400"
                }`}>
                  {index + 1}
                </span>
              </div>
              {index < hops.length - 1 && (
                <div className="w-px h-full min-h-[24px] bg-zinc-700/50" />
              )}
            </div>

            <div className="flex-1 pb-4">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-zinc-500 text-xs">from</span>
                    <span className="text-white font-mono text-xs">{hop.from}</span>
                    <ArrowRight className="h-3 w-3 text-zinc-600" />
                    <span className="text-zinc-500 text-xs">by</span>
                    <span className="text-white font-mono text-xs">{hop.by}</span>
                  </div>
                  {hop.delay !== undefined && hop.delay > 0 && (
                    <Badge className={`text-[10px] ${
                      hop.delay > 300
                        ? "bg-red-500/20 text-red-400 border-red-500/50"
                        : hop.delay > 30
                          ? "bg-amber-500/20 text-amber-400 border-amber-500/50"
                          : "bg-zinc-800 text-zinc-400 border-zinc-700"
                    }`}>
                      <Clock className="h-3 w-3 mr-1" />
                      +{hop.delay}s
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {hop.with && (
                    <span className="text-[10px] text-zinc-500">
                      with <span className="text-zinc-400 font-mono">{hop.with}</span>
                    </span>
                  )}
                  {hop.ip && (
                    <span className="text-[10px] text-zinc-500">
                      IP: <span className="text-cyan-400 font-mono">{hop.ip}</span>
                    </span>
                  )}
                  {hop.timestamp && (
                    <span className="text-[10px] text-zinc-600 font-mono">
                      {new Date(hop.timestamp).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MetadataTable({ metadata }: { metadata: EmailHeaderAnalysis["metadata"] }) {
  const entries = [
    { label: "From", value: metadata.from },
    { label: "To", value: metadata.to },
    { label: "Subject", value: metadata.subject },
    { label: "Date", value: metadata.date },
    { label: "Message-ID", value: metadata.messageId },
    { label: "Reply-To", value: metadata.replyTo },
    { label: "Return-Path", value: metadata.returnPath },
    { label: "X-Mailer", value: metadata.xMailer },
    { label: "Content-Type", value: metadata.contentType },
    { label: "MIME-Version", value: metadata.mimeVersion },
  ].filter((e) => e.value);

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
        <Info className="h-8 w-8 mb-2" />
        <p className="text-sm">No metadata extracted</p>
      </div>
    );
  }

  return (
    <div className="space-y-1" data-testid="container-metadata">
      {entries.map(({ label, value }) => (
        <div key={label} className="flex items-start gap-3 py-2 border-b border-zinc-800/50 last:border-0" data-testid={`metadata-${label.toLowerCase().replace(/[^a-z]/g, "-")}`}>
          <span className="text-xs text-zinc-500 w-24 shrink-0 font-medium pt-0.5">{label}</span>
          <span className="text-xs text-white font-mono break-all">{value}</span>
        </div>
      ))}
    </div>
  );
}

function AnalysisResults({ analysis }: { analysis: EmailHeaderAnalysis }) {
  return (
    <div className="space-y-6" data-testid="container-results">
      {analysis.warnings.length > 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-400">
              <AlertTriangle className="h-4 w-4" /> Warnings ({analysis.warnings.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {analysis.warnings.map((warning, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-amber-300/80" data-testid={`warning-${i}`}>
                <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0 text-amber-400" />
                {warning}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="border-white/5 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2 text-white">
            <Shield className="h-4 w-4 text-orange-400" /> Authentication Results
          </CardTitle>
          <CardDescription className="text-xs">SPF, DKIM, and DMARC verification status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <AuthBadge label="SPF" value={analysis.authResults.spf} />
          <AuthBadge label="DKIM" value={analysis.authResults.dkim} />
          <AuthBadge label="DMARC" value={analysis.authResults.dmarc} />
        </CardContent>
      </Card>

      <Card className="border-white/5 bg-card/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2 text-white">
              <Globe className="h-4 w-4 text-orange-400" /> Routing Hops ({analysis.hops.length})
            </CardTitle>
            {analysis.totalDelay !== undefined && (
              <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 text-[10px]">
                <Clock className="h-3 w-3 mr-1" />
                Total: {analysis.totalDelay}s
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs">Mail server routing path from origin to destination</CardDescription>
        </CardHeader>
        <CardContent>
          <HopTimeline hops={analysis.hops} />
        </CardContent>
      </Card>

      <Card className="border-white/5 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2 text-white">
            <Mail className="h-4 w-4 text-orange-400" /> Message Metadata
          </CardTitle>
          <CardDescription className="text-xs">Extracted header fields and values</CardDescription>
        </CardHeader>
        <CardContent>
          <MetadataTable metadata={analysis.metadata} />
        </CardContent>
      </Card>
    </div>
  );
}

export default function EmailAnalyzer() {
  useDocumentTitle("Email Header Analyzer | STB Cybersecurity");
  const { user, isAuthenticated, isPro } = useAuth();
  const { toast } = useToast();

  const [rawHeaders, setRawHeaders] = useState("");
  const [analysis, setAnalysis] = useState<EmailHeaderAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async () => {
    if (!rawHeaders.trim() || rawHeaders.trim().length < 10) {
      toast({ title: "Input too short", description: "Please paste complete email headers (at least 10 characters).", variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      const res = await fetch("/api/analyze/email-headers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ headers: rawHeaders }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Analysis failed" }));
        throw new Error(data.error || `Server error (${res.status})`);
      }

      const data = await res.json();
      setAnalysis(data);
      toast({ title: "Analysis Complete", description: `Found ${data.hops?.length || 0} hops and ${data.warnings?.length || 0} warnings.` });
    } catch (err: any) {
      setError(err.message);
      toast({ title: "Analysis Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setRawHeaders("");
    setAnalysis(null);
    setError(null);
  };

  const handleCopyResults = async () => {
    if (!analysis) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(analysis, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied", description: "Analysis results copied to clipboard" });
    } catch {
      toast({ title: "Copy failed", description: "Could not access clipboard", variant: "destructive" });
    }
  };

  const sampleHeaders = `Received: from mail-wr1-f54.google.com (mail-wr1-f54.google.com [209.85.221.54])
        by mx.example.com (Postfix) with ESMTPS id ABC123
        for <user@example.com>; Mon, 15 Jan 2024 10:30:15 -0500
Received: by mail-wr1-f54.google.com with SMTP id ffacd0b85a97d-33d1234
        for <user@example.com>; Mon, 15 Jan 2024 07:30:14 -0800
Authentication-Results: mx.example.com;
       dkim=pass header.i=@gmail.com header.s=20230601;
       spf=pass (google.com: domain of sender@gmail.com designates 209.85.221.54 as permitted sender);
       dmarc=pass (p=NONE sp=QUARANTINE) header.from=gmail.com
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=gmail.com; s=20230601
From: John Doe <sender@gmail.com>
To: user@example.com
Subject: Test Email Header Analysis
Date: Mon, 15 Jan 2024 15:30:12 +0000
Message-ID: <CABx+XJ3abc123@mail.gmail.com>
MIME-Version: 1.0
Content-Type: text/plain; charset="UTF-8"
Return-Path: <sender@gmail.com>
X-Mailer: Apple Mail`;

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="p-5 rounded-full bg-orange-500/10">
              <Lock className="h-12 w-12 text-orange-400" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-display font-bold text-white" data-testid="text-email-analyzer-login-required">Sign In Required</h2>
              <p className="text-zinc-400 max-w-md">
                Email Header Analyzer access requires authentication. Please sign in with your STB Cybersecurity account to continue.
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </Layout>
    );
  }

  if (!isPro) {
    return (
      <Layout>
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="p-5 rounded-full bg-orange-500/10">
              <Crown className="h-12 w-12 text-orange-400" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-display font-bold text-white" data-testid="text-email-analyzer-upgrade-required">Pro Subscription Required</h2>
              <p className="text-zinc-400 max-w-md">
                The Email Header Analyzer is available to Pro, Business, and Enterprise subscribers.
                Upgrade your plan to trace email routing, verify authentication, and detect anomalies.
              </p>
            </div>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold" asChild>
              <a href="/pricing" data-testid="link-email-analyzer-upgrade">
                <Crown className="h-4 w-4 mr-2" /> Upgrade to Pro
              </a>
            </Button>
          </div>
        </div>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-white" data-testid="text-email-analyzer-title">
              Email Header Analyzer
            </h1>
            <p className="text-muted-foreground mt-1">
              Parse raw email headers to trace routing, verify authentication, and detect anomalies
            </p>
          </div>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50" data-testid="badge-email-analyzer-pro">
            <Crown className="h-3 w-3 mr-1" /> PRO
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="border-white/5 bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <Mail className="h-5 w-5 text-orange-400" /> Paste Email Headers
                </CardTitle>
                <CardDescription>
                  Paste the full raw email headers below. You can usually find these in your email client under "Show Original" or "View Source".
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={rawHeaders}
                  onChange={(e) => setRawHeaders(e.target.value)}
                  placeholder="Paste raw email headers here…"
                  className="min-h-[250px] bg-zinc-900 border-zinc-700 text-white font-mono text-sm placeholder:text-zinc-600 resize-y"
                  data-testid="textarea-email-headers"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-600">{rawHeaders.length} characters</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRawHeaders(sampleHeaders)}
                      className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 text-xs"
                      data-testid="button-load-sample"
                    >
                      Load Sample
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClear}
                      disabled={!rawHeaders && !analysis}
                      className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-1.5 text-xs"
                      data-testid="button-clear-headers"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Clear
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || !rawHeaders.trim()}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-semibold gap-1.5"
                      data-testid="button-analyze-headers"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Analyzing…
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4" /> Analyze
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm" data-testid="text-analysis-error">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>

            {analysis && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-display font-bold text-white" data-testid="text-results-heading">Analysis Results</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyResults}
                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-1.5 text-xs"
                    data-testid="button-copy-results"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy JSON"}
                  </Button>
                </div>
                <AnalysisResults analysis={analysis} />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Card className="border-white/5 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-white">
                  <Info className="h-4 w-4 text-orange-400" /> How to Find Headers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { client: "Gmail", steps: 'Open message → ⋮ → "Show original"' },
                  { client: "Outlook", steps: 'Open message → ⋯ → "View message source"' },
                  { client: "Apple Mail", steps: "View → Message → Raw Source" },
                  { client: "Thunderbird", steps: "View → Message Source (Ctrl+U)" },
                  { client: "Yahoo", steps: 'More → "View raw message"' },
                ].map(({ client, steps }) => (
                  <div key={client} className="space-y-0.5">
                    <p className="text-xs font-medium text-white">{client}</p>
                    <p className="text-[11px] text-zinc-500">{steps}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-white/5 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-white">
                  <Shield className="h-4 w-4 text-green-400" /> What We Analyze
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Routing Hops", desc: "Trace the path from sender to recipient through each mail server" },
                  { label: "SPF/DKIM/DMARC", desc: "Verify email authentication results to detect spoofing" },
                  { label: "Delivery Delays", desc: "Identify slow hops or suspicious routing anomalies" },
                  { label: "Header Metadata", desc: "Extract From, To, Subject, Message-ID and other fields" },
                  { label: "Security Warnings", desc: "Flag mismatched domains, failed auth, and relay issues" },
                ].map(({ label, desc }) => (
                  <div key={label} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-white">{label}</p>
                      <p className="text-[10px] text-zinc-500">{desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex items-start gap-2 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
              <Shield className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
              <p className="text-xs text-zinc-400">
                Headers are analyzed server-side and are not stored. All data is discarded after the response is returned.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </Layout>
  );
}
