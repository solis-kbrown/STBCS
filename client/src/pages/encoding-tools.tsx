import { useState, useCallback } from "react";
import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Copy,
  ArrowDownUp,
  Check,
  Binary,
  Link2,
  Hash,
  RotateCcw,
  Braces,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type EncodingType = "base64" | "url" | "hex" | "rot13";

interface EncoderConfig {
  id: EncodingType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  encode: (input: string) => string;
  decode: (input: string) => string;
}

function base64Encode(input: string): string {
  try {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(input);
    let binary = "";
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary);
  } catch {
    throw new Error("Failed to encode input as Base64");
  }
}

function base64Decode(input: string): string {
  try {
    const cleaned = input.replace(/\s/g, "");
    const binary = atob(cleaned);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    throw new Error("Invalid Base64 input");
  }
}

function urlEncode(input: string): string {
  try {
    return encodeURIComponent(input);
  } catch {
    throw new Error("Failed to URL-encode input");
  }
}

function urlDecode(input: string): string {
  try {
    return decodeURIComponent(input);
  } catch {
    throw new Error("Invalid URL-encoded input");
  }
}

function hexEncode(input: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(input);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join(" ");
}

function hexDecode(input: string): string {
  try {
    const cleaned = input.replace(/\s+/g, "").replace(/0x/gi, "");
    if (cleaned.length % 2 !== 0) throw new Error("Odd length");
    const bytes = new Uint8Array(cleaned.length / 2);
    for (let i = 0; i < cleaned.length; i += 2) {
      const val = parseInt(cleaned.substring(i, i + 2), 16);
      if (isNaN(val)) throw new Error("Invalid hex character");
      bytes[i / 2] = val;
    }
    return new TextDecoder().decode(bytes);
  } catch {
    throw new Error("Invalid hexadecimal input");
  }
}

function rot13(input: string): string {
  return input.replace(/[a-zA-Z]/g, (c) => {
    const base = c <= "Z" ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}

const ENCODERS: EncoderConfig[] = [
  {
    id: "base64",
    label: "Base64",
    icon: Binary,
    description: "Encode and decode Base64 strings. Supports UTF-8 text.",
    encode: base64Encode,
    decode: base64Decode,
  },
  {
    id: "url",
    label: "URL",
    icon: Link2,
    description: "Percent-encode and decode URL components (RFC 3986).",
    encode: urlEncode,
    decode: urlDecode,
  },
  {
    id: "hex",
    label: "Hex",
    icon: Hash,
    description: "Convert text to hexadecimal bytes and back.",
    encode: hexEncode,
    decode: hexDecode,
  },
  {
    id: "rot13",
    label: "ROT13",
    icon: RotateCcw,
    description: "Apply ROT13 letter substitution cipher (symmetric).",
    encode: rot13,
    decode: rot13,
  },
];

function EncoderPanel({ config }: { config: EncoderConfig }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [direction, setDirection] = useState<"encode" | "decode">("encode");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const processInput = useCallback(
    (text: string, dir: "encode" | "decode") => {
      setError(null);
      if (!text.trim()) {
        setOutput("");
        return;
      }
      try {
        const result =
          dir === "encode" ? config.encode(text) : config.decode(text);
        setOutput(result);
      } catch (e: any) {
        setError(e.message || "Processing failed");
        setOutput("");
      }
    },
    [config],
  );

  const handleInputChange = (text: string) => {
    setInput(text);
    processInput(text, direction);
  };

  const handleDirectionSwap = () => {
    const newDir = direction === "encode" ? "decode" : "encode";
    setDirection(newDir);
    if (output && !error) {
      setInput(output);
      processInput(output, newDir);
    } else {
      processInput(input, newDir);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copied", description: "Output copied to clipboard" });
    } catch {
      toast({
        title: "Copy failed",
        description: "Could not access clipboard",
        variant: "destructive",
      });
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError(null);
  };

  const isSymmetric = config.id === "rot13";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge
            className={
              direction === "encode"
                ? "bg-green-500/20 text-green-400 border-green-500/50"
                : "bg-blue-500/20 text-blue-400 border-blue-500/50"
            }
          >
            {isSymmetric
              ? "ROT13 (Symmetric)"
              : direction === "encode"
                ? "Encode"
                : "Decode"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {!isSymmetric && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDirectionSwap}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-1.5"
              data-testid={`button-swap-${config.id}`}
            >
              <ArrowDownUp className="h-3.5 w-3.5" />
              Swap
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-1.5"
            data-testid={`button-clear-${config.id}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            {isSymmetric
              ? "Input"
              : direction === "encode"
                ? "Plain Text"
                : `${config.label} Encoded`}
          </label>
          <Textarea
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={
              isSymmetric
                ? "Enter text to apply ROT13…"
                : direction === "encode"
                  ? `Enter text to ${config.label} encode…`
                  : `Paste ${config.label} encoded string…`
            }
            className="min-h-[200px] bg-zinc-900 border-zinc-700 text-white font-mono text-sm placeholder:text-zinc-600 resize-y"
            data-testid={`textarea-input-${config.id}`}
          />
          <div className="text-[10px] text-zinc-600 text-right">
            {input.length} characters
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            {isSymmetric
              ? "Output"
              : direction === "encode"
                ? `${config.label} Encoded`
                : "Plain Text"}
          </label>
          <div className="relative">
            <Textarea
              value={output}
              readOnly
              placeholder="Output will appear here…"
              className="min-h-[200px] bg-zinc-950 border-zinc-700 text-green-400 font-mono text-sm placeholder:text-zinc-700 resize-y"
              data-testid={`textarea-output-${config.id}`}
            />
            {output && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="absolute top-2 right-2 h-7 px-2 text-zinc-400 hover:text-white hover:bg-zinc-800"
                data-testid={`button-copy-${config.id}`}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            )}
          </div>
          <div className="text-[10px] text-zinc-600 text-right">
            {output.length} characters
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}

export default function EncodingTools() {
  useDocumentTitle("Encoding / Decoding Tools | STB Cybersecurity");
  const [activeTab, setActiveTab] = useState<EncodingType>("base64");

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-3xl font-display font-bold text-white"
              data-testid="text-encoding-title"
            >
              Encoding / Decoding Tools
            </h1>
            <p className="text-muted-foreground mt-1">
              Encode and decode text with Base64, URL encoding, Hex, and ROT13
              — fully client-side, no data leaves your browser.
            </p>
          </div>
          <Badge className="bg-green-600 text-white" data-testid="badge-encoding-free">
            FREE
          </Badge>
        </div>

        <Card className="border-white/5 bg-card/50">
          <CardContent className="p-0">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as EncodingType)}
            >
              <div className="border-b border-white/5 px-4 pt-4">
                <TabsList className="bg-zinc-900/50 p-1">
                  {ENCODERS.map((enc) => (
                    <TabsTrigger
                      key={enc.id}
                      value={enc.id}
                      className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400 gap-1.5"
                      data-testid={`tab-${enc.id}`}
                    >
                      <enc.icon className="h-4 w-4" />
                      {enc.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {ENCODERS.map((enc) => (
                <TabsContent key={enc.id} value={enc.id} className="p-4 pt-4 mt-0">
                  <p className="text-sm text-zinc-400 mb-4">{enc.description}</p>
                  <EncoderPanel config={enc} />
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ENCODERS.map((enc) => (
            <Card
              key={enc.id}
              className="border-white/5 bg-card/50 cursor-pointer hover:border-orange-500/30 transition-colors"
              onClick={() => setActiveTab(enc.id)}
              data-testid={`card-info-${enc.id}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <enc.icon className="h-4 w-4 text-orange-400" />
                  </div>
                  <CardTitle className="text-sm text-white">
                    {enc.label}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs">
                  {enc.id === "base64" &&
                    "Standard Base64 encoding per RFC 4648. Commonly used for embedding binary data in text formats like JSON, XML, and email."}
                  {enc.id === "url" &&
                    "Percent-encoding for URI components per RFC 3986. Escapes reserved characters for safe inclusion in URLs and query strings."}
                  {enc.id === "hex" &&
                    "Converts each byte of UTF-8 text to its two-digit hexadecimal representation. Useful for inspecting raw byte values."}
                  {enc.id === "rot13" &&
                    "Simple letter substitution cipher that shifts each letter 13 places in the alphabet. Applying twice returns the original text."}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-start gap-2 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
          <Braces className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
          <p className="text-xs text-zinc-400">
            All encoding and decoding operations run entirely in your browser.
            No data is sent to any server. This tool is free for all users — no
            account required.
          </p>
        </div>
      </div>
      <Footer />
    </Layout>
  );
}