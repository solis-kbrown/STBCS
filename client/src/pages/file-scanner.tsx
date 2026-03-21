import { useState, useRef, useCallback } from "react";
import Layout from "@/components/layout";
import Footer from "@/components/footer";
import RelatedResources, { getRelatedLinks } from "@/components/related-resources";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  FileUp,
  Shield,
  Lock,
  Crown,
  Loader2,
  Copy,
  Check,
  Hash,
  FileText,
  Activity,
  AlertTriangle,
  Trash2,
  Download,
  Info,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import ToolPageHeader from "@/components/tool-page-header";

interface ScanResult {
  fileName: string;
  fileSize: number;
  mimeType: string;
  hashes: {
    md5: string;
    sha1: string;
    sha256: string;
    sha512: string;
  };
  entropy: number;
  strings: string[];
  stringsCount: number;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

function EntropyGauge({ value }: { value: number }) {
  const max = 8;
  const pct = Math.min((value / max) * 100, 100);
  let color = "text-green-400";
  let bg = "bg-green-500";
  let label = "Low";
  if (value > 6) {
    color = "text-red-400";
    bg = "bg-red-500";
    label = "High (likely compressed/encrypted)";
  } else if (value > 4) {
    color = "text-amber-400";
    bg = "bg-amber-500";
    label = "Medium";
  }

  return (
    <div className="space-y-2" data-testid="gauge-entropy">
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-400">Shannon Entropy</span>
        <span className={`text-sm font-mono font-bold ${color}`}>
          {value.toFixed(4)} / {max}
        </span>
      </div>
      <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${bg}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={`text-xs ${color}`}>{label}</p>
    </div>
  );
}

function HashRow({ algo, hash }: { algo: string; hash: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied", description: `${algo} hash copied` });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  };

  return (
    <div className="flex items-start gap-3 group">
      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider w-14 pt-1 shrink-0">
        {algo}
      </span>
      <code
        className="flex-1 text-xs text-green-400 font-mono break-all bg-zinc-950 px-3 py-2 rounded border border-zinc-800"
        data-testid={`text-hash-${algo.toLowerCase()}`}
      >
        {hash}
      </code>
      <button
        onClick={handleCopy}
        className="p-1.5 text-zinc-500 hover:text-orange-400 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
        data-testid={`button-copy-${algo.toLowerCase()}`}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-400" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}

function ScanResults({ result, onReset }: { result: ScanResult; onReset: () => void }) {
  const [showAllStrings, setShowAllStrings] = useState(false);
  const displayStrings = showAllStrings ? result.strings : result.strings.slice(0, 20);

  return (
    <div className="space-y-6 animate-in fade-in duration-500" data-testid="container-scan-results">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/10">
            <Check className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white" data-testid="text-scan-filename">
              {result.fileName}
            </h3>
            <p className="text-xs text-zinc-400">Scan completed</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-1.5"
          data-testid="button-scan-new"
        >
          <Trash2 className="h-3.5 w-3.5" /> New Scan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-white/5 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-orange-400" />
              <span className="text-xs text-zinc-400">File Size</span>
            </div>
            <p className="text-lg font-mono font-bold text-white" data-testid="text-file-size">
              {formatFileSize(result.fileSize)}
            </p>
            <p className="text-[10px] text-zinc-600">{result.fileSize.toLocaleString()} bytes</p>
          </CardContent>
        </Card>
        <Card className="border-white/5 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-blue-400" />
              <span className="text-xs text-zinc-400">MIME Type</span>
            </div>
            <p className="text-lg font-mono font-bold text-white break-all" data-testid="text-mime-type">
              {result.mimeType}
            </p>
          </CardContent>
        </Card>
        <Card className="border-white/5 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-amber-400" />
              <span className="text-xs text-zinc-400">Strings Found</span>
            </div>
            <p className="text-lg font-mono font-bold text-white" data-testid="text-strings-count">
              {result.stringsCount}
            </p>
            <p className="text-[10px] text-zinc-600">printable strings (≥6 chars)</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/5 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2 text-white">
            <Hash className="h-4 w-4 text-orange-400" /> Cryptographic Hashes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <HashRow algo="MD5" hash={result.hashes.md5} />
          <HashRow algo="SHA-1" hash={result.hashes.sha1} />
          <HashRow algo="SHA-256" hash={result.hashes.sha256} />
          <HashRow algo="SHA-512" hash={result.hashes.sha512} />
        </CardContent>
      </Card>

      <Card className="border-white/5 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2 text-white">
            <Activity className="h-4 w-4 text-amber-400" /> Entropy Analysis
          </CardTitle>
          <CardDescription>
            Shannon entropy measures randomness. Higher values suggest compression or encryption.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EntropyGauge value={result.entropy} />
        </CardContent>
      </Card>

      {result.strings.length > 0 && (
        <Card className="border-white/5 bg-card/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2 text-white">
                <FileText className="h-4 w-4 text-green-400" /> Extracted Strings
              </CardTitle>
              <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700">
                {result.stringsCount} found
              </Badge>
            </div>
            <CardDescription>
              Printable ASCII strings with a minimum length of 6 characters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-500/20 scrollbar-track-transparent">
              <div className="space-y-0.5">
                {displayStrings.map((str, i) => (
                  <div
                    key={i}
                    className="text-xs font-mono text-zinc-300 px-2 py-1 rounded hover:bg-zinc-800/50"
                    data-testid={`text-string-${i}`}
                  >
                    <span className="text-zinc-600 mr-3 select-none">{(i + 1).toString().padStart(4, " ")}</span>
                    {str}
                  </div>
                ))}
              </div>
            </div>
            {result.strings.length > 20 && !showAllStrings && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllStrings(true)}
                className="mt-2 text-zinc-400 hover:text-orange-400 w-full"
                data-testid="button-show-all-strings"
              >
                Show all {result.stringsCount} strings
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function UploadArea({ onFileSelect, isScanning }: { onFileSelect: (file: File) => void; isScanning: boolean }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !isScanning && fileInputRef.current?.click()}
      className={`
        relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
        transition-all duration-300 ease-out
        ${isDragOver
          ? "border-orange-500 bg-orange-500/5 shadow-[inset_0_0_30px_rgba(249,115,22,0.08)]"
          : "border-zinc-700 hover:border-zinc-500 bg-zinc-900/30 hover:bg-zinc-900/50"
        }
        ${isScanning ? "pointer-events-none opacity-50" : ""}
      `}
      data-testid="dropzone-file-upload"
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileInput}
        data-testid="input-file-upload"
      />
      <div className="flex flex-col items-center gap-4">
        <div className={`p-4 rounded-full transition-colors ${isDragOver ? "bg-orange-500/20" : "bg-zinc-800"}`}>
          <FileUp className={`h-10 w-10 transition-colors ${isDragOver ? "text-orange-400" : "text-zinc-500"}`} />
        </div>
        <div>
          <p className="text-lg font-semibold text-white mb-1">
            Drop a file here or click to browse
          </p>
          <p className="text-sm text-zinc-500">
            Maximum file size: 50 MB
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FileScanner() {
  useDocumentTitle("File Scanner | STB Cybersecurity");
  const { user, isAuthenticated, isPro } = useAuth();
  const { toast } = useToast();

  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 50 MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setScanResult(null);
    setError(null);
    setIsScanning(true);
    setProgress(10);

    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 85) {
          clearInterval(progressInterval);
          return 85;
        }
        return p + Math.random() * 12;
      });
    }, 300);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/scan/file", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Scan failed" }));
        throw new Error(data.error || `Scan failed (${res.status})`);
      }

      setProgress(100);
      const data = await res.json();
      setScanResult(data);

      toast({
        title: "Scan Complete",
        description: `${file.name} analyzed successfully`,
      });
    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err.message);
      toast({
        title: "Scan Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
      setProgress(0);
    }
  };

  const handleReset = () => {
    setScanResult(null);
    setSelectedFile(null);
    setError(null);
    setProgress(0);
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="p-5 rounded-full bg-orange-500/10">
              <Lock className="h-12 w-12 text-orange-400" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-display font-bold text-white" data-testid="text-file-scanner-login-required">
                Sign In Required
              </h2>
              <p className="text-zinc-400 max-w-md">
                File Scanner access requires authentication. Please sign in with your STB Cybersecurity account to continue.
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
              <h2 className="text-2xl font-display font-bold text-white" data-testid="text-file-scanner-upgrade-required">
                Pro Subscription Required
              </h2>
              <p className="text-zinc-400 max-w-md">
                The File Scanner is available to Pro, Business, and Enterprise subscribers.
                Upgrade your plan to analyze files for hashes, entropy, MIME type detection, and string extraction.
              </p>
            </div>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold" asChild>
              <a href="/pricing" data-testid="link-file-scanner-upgrade">
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
        <ToolPageHeader
          icon={<FileUp className="h-6 w-6 text-orange-400" />}
          title="File Scanner"
          description="Upload a file for hash computation, MIME detection, entropy analysis, and string extraction"
          tier="pro"
          testIdPrefix="file-scanner"
          statusBadges={scanResult ? [
            { label: scanResult.fileName, variant: "info" },
            { label: `Entropy: ${scanResult.entropy.toFixed(2)}`, variant: scanResult.entropy > 6 ? "error" : scanResult.entropy > 4 ? "warning" : "success" },
            { label: "Strings", count: scanResult.stringsCount, variant: "neutral" },
          ] : undefined}
        />

        {scanResult ? (
          <ScanResults result={scanResult} onReset={handleReset} />
        ) : (
          <Card className="border-white/5 bg-card/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <Shield className="h-5 w-5 text-orange-400" /> Upload File for Analysis
              </CardTitle>
              <CardDescription>
                Files are analyzed server-side and automatically deleted after scanning. No data is retained.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <UploadArea onFileSelect={handleFileSelect} isScanning={isScanning} />

              {isScanning && selectedFile && (
                <div className="space-y-3 animate-in fade-in duration-300" data-testid="container-scan-progress">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-4 w-4 text-orange-400 animate-spin" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white font-medium">{selectedFile.name}</span>
                        <span className="text-xs text-zinc-500">{formatFileSize(selectedFile.size)}</span>
                      </div>
                      <Progress value={progress} className="h-2" data-testid="progress-scan" />
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Computing hashes, detecting MIME type, analyzing entropy, extracting strings…
                  </p>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm" data-testid="text-scan-error">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-white/5 bg-card/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Hash className="h-4 w-4 text-orange-400" />
                </div>
                <CardTitle className="text-sm text-white">Hash Computation</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Computes MD5, SHA-1, SHA-256, and SHA-512 hashes for file identification and integrity verification.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-card/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Info className="h-4 w-4 text-blue-400" />
                </div>
                <CardTitle className="text-sm text-white">MIME Detection</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Identifies file type via magic byte signatures regardless of file extension. Detects spoofed file types.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-card/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Activity className="h-4 w-4 text-amber-400" />
                </div>
                <CardTitle className="text-sm text-white">Entropy Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Calculates Shannon entropy to detect packed, compressed, or encrypted content within the file.
              </CardDescription>
            </CardContent>
          </Card>
          <Card className="border-white/5 bg-card/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <FileText className="h-4 w-4 text-green-400" />
                </div>
                <CardTitle className="text-sm text-white">String Extraction</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs">
                Extracts printable ASCII strings (≥6 chars) to reveal URLs, paths, error messages, and embedded text.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-start gap-2 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
          <Shield className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
          <p className="text-xs text-zinc-400">
            Uploaded files are processed in an isolated environment and automatically deleted immediately after analysis.
            No file content is stored or logged. Maximum file size: 50 MB.
          </p>
        </div>
      </div>
              <RelatedResources links={getRelatedLinks("/file-scanner")} testIdPrefix="filescan" />
<Footer />
    </Layout>
  );
}
