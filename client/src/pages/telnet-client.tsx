import { useState, useRef, useEffect, useCallback } from "react";
import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Terminal, Lock, Shield, Wifi, WifiOff, Crown, Loader2,
  AlertTriangle, Server, RefreshCw, Check, Power, Globe,
  Mail, Database, Copy, X
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

type ConnectionState = "disconnected" | "connecting" | "connected" | "error";

interface ConnectionConfig {
  hostname: string;
  port: string;
}

const COMMON_PORTS = [
  { port: "23", label: "Telnet (23)", desc: "Standard Telnet" },
  { port: "25", label: "SMTP (25)", desc: "Mail server" },
  { port: "80", label: "HTTP (80)", desc: "Web server" },
  { port: "110", label: "POP3 (110)", desc: "Email retrieval" },
  { port: "143", label: "IMAP (143)", desc: "Email access" },
  { port: "443", label: "HTTPS (443)", desc: "Secure web" },
  { port: "465", label: "SMTPS (465)", desc: "Secure SMTP" },
  { port: "587", label: "Submission (587)", desc: "Mail submission" },
  { port: "993", label: "IMAPS (993)", desc: "Secure IMAP" },
  { port: "995", label: "POP3S (995)", desc: "Secure POP3" },
];

function ConnectionForm({
  onConnect,
  isConnecting,
}: {
  onConnect: (config: ConnectionConfig) => void;
  isConnecting: boolean;
}) {
  const [config, setConfig] = useState<ConnectionConfig>({
    hostname: "",
    port: "25",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.hostname || !config.port) return;
    onConnect(config);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        <div>
          <Label className="text-zinc-300 text-sm mb-1.5 block">Target Host / IP Address</Label>
          <div className="relative">
            <Server className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              data-testid="input-telnet-hostname"
              value={config.hostname}
              onChange={(e) => setConfig({ ...config, hostname: e.target.value })}
              placeholder="mail.example.com or 203.0.113.50"
              className="pl-10 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600"
              required
            />
          </div>
        </div>

        <div>
          <Label className="text-zinc-300 text-sm mb-1.5 block">Port</Label>
          <Input
            data-testid="input-telnet-port"
            value={config.port}
            onChange={(e) => setConfig({ ...config, port: e.target.value })}
            placeholder="23"
            className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600"
            required
          />
        </div>

        <div>
          <Label className="text-zinc-300 text-sm mb-2 block">Quick Ports</Label>
          <div className="grid grid-cols-2 gap-1.5">
            {COMMON_PORTS.map(({ port, label }) => (
              <button
                key={port}
                type="button"
                onClick={() => setConfig({ ...config, port })}
                className={`text-left px-2.5 py-1.5 rounded-md border text-xs transition-all ${
                  config.port === port
                    ? "border-orange-500 bg-orange-500/10 text-orange-400"
                    : "border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                }`}
                data-testid={`button-port-${port}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
        <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
        <p className="text-xs text-zinc-400">
          Telnet transmits data in plaintext. Do not send sensitive credentials over Telnet connections. Use this tool for diagnostics, banner grabbing, and SMTP testing only.
        </p>
      </div>

      <Button
        type="submit"
        disabled={isConnecting || !config.hostname || !config.port}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
        data-testid="button-telnet-connect"
      >
        {isConnecting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Connecting…
          </>
        ) : (
          <>
            <Globe className="h-4 w-4 mr-2" /> Connect
          </>
        )}
      </Button>
    </form>
  );
}

function TelnetTerminalViewer({
  wsUrl,
  connectionState,
  onDisconnect,
  errorMessage,
  hostname,
  port,
}: {
  wsUrl: string;
  connectionState: ConnectionState;
  onDisconnect: () => void;
  errorMessage: string | null;
  hostname: string;
  port: string;
}) {
  const termContainerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const termRef = useRef<any>(null);
  const fitAddonRef = useRef<any>(null);
  const [inputLine, setInputLine] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (connectionState !== "connected" || !wsUrl) return;

    let term: any = null;
    let fitAddon: any = null;
    let ws: WebSocket | null = null;
    let pingInterval: NodeJS.Timeout | null = null;
    let disposed = false;

    const init = async () => {
      const { Terminal } = await import("@xterm/xterm");
      const { FitAddon } = await import("@xterm/addon-fit");
      await import("@xterm/xterm/css/xterm.css");

      if (disposed) return;

      term = new Terminal({
        cursorBlink: true,
        cursorStyle: "underline",
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
        theme: {
          background: "#09090b",
          foreground: "#e4e4e7",
          cursor: "#f97316",
          cursorAccent: "#09090b",
          selectionBackground: "#f9731640",
          selectionForeground: "#ffffff",
          black: "#18181b",
          red: "#ef4444",
          green: "#22c55e",
          yellow: "#eab308",
          blue: "#3b82f6",
          magenta: "#a855f7",
          cyan: "#06b6d4",
          white: "#e4e4e7",
          brightBlack: "#52525b",
          brightRed: "#f87171",
          brightGreen: "#4ade80",
          brightYellow: "#facc15",
          brightBlue: "#60a5fa",
          brightMagenta: "#c084fc",
          brightCyan: "#22d3ee",
          brightWhite: "#fafafa",
        },
        allowProposedApi: true,
        scrollback: 5000,
        convertEol: true,
        disableStdin: true,
      });

      fitAddon = new FitAddon();
      term.loadAddon(fitAddon);

      termRef.current = term;
      fitAddonRef.current = fitAddon;

      if (termContainerRef.current) {
        termContainerRef.current.innerHTML = "";
        term.open(termContainerRef.current);
        setTimeout(() => {
          try { fitAddon.fit(); } catch {}
        }, 100);
      }

      term.writeln(`\x1b[38;2;249;115;22m◆ STB Cybersecurity — Telnet Client\x1b[0m`);
      term.writeln(`\x1b[38;5;245mConnecting to ${hostname}:${port}…\x1b[0m\r\n`);

      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        pingInterval = setInterval(() => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          switch (msg.type) {
            case "output": {
              const bytes = atob(msg.data);
              const arr = new Uint8Array(bytes.length);
              for (let i = 0; i < bytes.length; i++) {
                arr[i] = bytes.charCodeAt(i);
              }
              term.write(arr);
              break;
            }
            case "status":
              if (msg.status === "connected") {
                term.writeln(`\x1b[38;5;34m✓ Connected to ${hostname}:${port}\x1b[0m\r\n`);
                inputRef.current?.focus();
              } else if (msg.status === "disconnected") {
                term.writeln(`\r\n\x1b[38;5;245m— Connection closed by remote host —\x1b[0m`);
              }
              break;
            case "error":
              term.writeln(`\r\n\x1b[38;5;196m✗ ${msg.message}\x1b[0m`);
              break;
            case "pong":
              break;
          }
        } catch {}
      };

      ws.onerror = () => {
        term.writeln(`\r\n\x1b[38;5;196m✗ WebSocket connection error\x1b[0m`);
      };

      ws.onclose = () => {
        term.writeln(`\r\n\x1b[38;5;245m— Session ended —\x1b[0m`);
        if (pingInterval) clearInterval(pingInterval);
      };

      const resizeObserver = new ResizeObserver(() => {
        try { fitAddon.fit(); } catch {}
      });
      if (termContainerRef.current) {
        resizeObserver.observe(termContainerRef.current);
      }
      term._resizeObserver = resizeObserver;
    };

    init();

    return () => {
      disposed = true;
      if (pingInterval) clearInterval(pingInterval);
      if (ws) {
        ws.close();
        wsRef.current = null;
      }
      if (term) {
        if (term._resizeObserver) term._resizeObserver.disconnect();
        term.dispose();
        termRef.current = null;
        fitAddonRef.current = null;
      }
    };
  }, [connectionState, wsUrl, hostname, port]);

  const sendLine = useCallback((line: string) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "raw", data: line + "\r\n" }));
    }
  }, []);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendLine(inputLine);
      setInputLine("");
    }
  };

  if (connectionState === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="p-4 rounded-full bg-red-500/10">
          <WifiOff className="h-10 w-10 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Connection Failed</h3>
        <p className="text-sm text-zinc-400 text-center max-w-md">
          {errorMessage || "Unable to establish a connection. Verify the target is reachable and the port is open."}
        </p>
        <Button onClick={onDisconnect} variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" data-testid="button-telnet-retry">
          <RefreshCw className="h-4 w-4 mr-2" /> Try Again
        </Button>
      </div>
    );
  }

  if (connectionState === "connecting") {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="relative">
          <div className="p-4 rounded-full bg-orange-500/10">
            <Globe className="h-10 w-10 text-orange-400" />
          </div>
          <Loader2 className="absolute -top-1 -right-1 h-6 w-6 text-orange-500 animate-spin" />
        </div>
        <h3 className="text-lg font-semibold text-white">Establishing Connection…</h3>
        <p className="text-sm text-zinc-400 text-center max-w-md">
          Opening a TCP connection to {hostname}:{port}. This may take a few seconds.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-t-lg">
        <div className="flex items-center gap-3">
          <Badge className="bg-green-500/20 text-green-400 border-green-500/50 text-[10px]">
            <Wifi className="h-3 w-3 mr-1" /> CONNECTED
          </Badge>
          <span className="text-[10px] text-zinc-500 font-mono">{hostname}:{port}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onDisconnect}
            className="p-1.5 hover:bg-red-500/20 rounded transition-colors text-zinc-400 hover:text-red-400"
            title="Disconnect"
            data-testid="button-telnet-disconnect"
          >
            <Power className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        ref={termContainerRef}
        className="w-full bg-[#09090b] border-x border-zinc-800"
        style={{ minHeight: "400px", height: "calc(100vh - 340px)" }}
        data-testid="container-telnet-terminal"
      />
      <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-b-lg">
        <span className="text-[10px] text-orange-400 font-mono shrink-0">{">"}</span>
        <input
          ref={inputRef}
          type="text"
          value={inputLine}
          onChange={(e) => setInputLine(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Type command and press Enter (e.g., EHLO example.com)"
          className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 outline-none font-mono"
          data-testid="input-telnet-command"
          autoComplete="off"
          spellCheck={false}
        />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => { sendLine(inputLine); setInputLine(""); }}
          disabled={!inputLine}
          className="text-zinc-400 hover:text-orange-400 h-7 px-2"
          data-testid="button-telnet-send"
        >
          Send
        </Button>
      </div>
    </div>
  );
}

export default function TelnetClient() {
  useDocumentTitle("Telnet Client | STB Cybersecurity");
  const { user, isAuthenticated, isPro } = useAuth();
  const { toast } = useToast();

  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [wsUrl, setWsUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [connectedHost, setConnectedHost] = useState({ hostname: "", port: "" });

  const handleConnect = async (config: ConnectionConfig) => {
    setConnectionState("connecting");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/telnet/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(config),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to initiate connection");
      }

      const data = await res.json();
      setSessionId(data.sessionId);
      setConnectedHost({ hostname: config.hostname, port: config.port });

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsEndpoint = `${protocol}//${window.location.host}/ws/telnet/${data.sessionId}`;
      setWsUrl(wsEndpoint);
      setConnectionState("connected");

      toast({
        title: "Connected",
        description: `Telnet session to ${config.hostname}:${config.port}`,
      });
    } catch (err: any) {
      setConnectionState("error");
      setErrorMessage(err.message);
      toast({
        title: "Connection Failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async () => {
    if (sessionId) {
      try {
        await fetch(`/api/telnet/disconnect/${sessionId}`, {
          method: "POST",
          credentials: "include",
        });
      } catch {}
    }
    setConnectionState("disconnected");
    setWsUrl("");
    setSessionId(null);
    setErrorMessage(null);
    setConnectedHost({ hostname: "", port: "" });
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
              <h2 className="text-2xl font-display font-bold text-white" data-testid="text-telnet-login-required">Sign In Required</h2>
              <p className="text-zinc-400 max-w-md">
                Telnet Client access requires authentication. Please sign in with your STB Cybersecurity account to continue.
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
              <h2 className="text-2xl font-display font-bold text-white" data-testid="text-telnet-upgrade-required">Pro Subscription Required</h2>
              <p className="text-zinc-400 max-w-md">
                The Telnet Client is available to Pro, Business, and Enterprise subscribers.
                Upgrade your plan to access network diagnostics and SMTP testing tools.
              </p>
            </div>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold" asChild>
              <a href="/support#pricing" data-testid="link-telnet-upgrade">
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
            <h1 className="text-3xl font-display font-bold text-white" data-testid="text-telnet-title">
              Telnet Client
            </h1>
            <p className="text-muted-foreground mt-1">
              Network diagnostics, SMTP testing, and banner grabbing tool
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">
              <Crown className="h-3 w-3 mr-1" /> PRO
            </Badge>
            {connectionState === "connected" && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                <Wifi className="h-3 w-3 mr-1" /> ACTIVE SESSION
              </Badge>
            )}
          </div>
        </div>

        {connectionState === "disconnected" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="border-white/5 bg-card/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-white">
                    <Globe className="h-5 w-5 text-orange-400" /> New Connection
                  </CardTitle>
                  <CardDescription>
                    Enter the host and port you want to connect to. Commonly used for SMTP testing and banner grabbing.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ConnectionForm onConnect={handleConnect} isConnecting={false} />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="border-white/5 bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-white">
                    <Mail className="h-4 w-4 text-orange-400" /> SMTP Quick Reference
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1.5">
                    {[
                      { cmd: "EHLO example.com", desc: "Identify & list extensions" },
                      { cmd: "MAIL FROM:<user@example.com>", desc: "Set sender" },
                      { cmd: "RCPT TO:<dest@example.com>", desc: "Set recipient" },
                      { cmd: "DATA", desc: "Begin message body" },
                      { cmd: "QUIT", desc: "End session" },
                      { cmd: "VRFY user", desc: "Verify mailbox" },
                      { cmd: "STARTTLS", desc: "Upgrade to TLS" },
                    ].map(({ cmd, desc }) => (
                      <div key={cmd} className="flex items-center justify-between gap-2 group">
                        <code className="text-[11px] text-orange-400/80 font-mono">{cmd}</code>
                        <span className="text-[10px] text-zinc-600 shrink-0">{desc}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/5 bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-white">
                    <Shield className="h-4 w-4 text-green-400" /> Session Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-zinc-400">Max 3 concurrent sessions</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-zinc-400">15-minute max session / 10-minute idle timeout</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-zinc-400">Private/internal IP ranges are blocked</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-zinc-400">Telnet is unencrypted — do not transmit credentials</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <TelnetTerminalViewer
            wsUrl={wsUrl}
            connectionState={connectionState}
            onDisconnect={handleDisconnect}
            errorMessage={errorMessage}
            hostname={connectedHost.hostname}
            port={connectedHost.port}
          />
        )}
      </div>
      <Footer />
    </Layout>
  );
}
