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
  Eye, EyeOff, AlertTriangle, Server, RefreshCw,
  Check, Power, KeyRound, FileKey, X, Copy, Upload
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

type ConnectionState = "disconnected" | "connecting" | "connected" | "error";

type AuthMethod = "password" | "privateKey";

interface ConnectionConfig {
  hostname: string;
  port: string;
  username: string;
  password: string;
  privateKey: string;
  authMethod: AuthMethod;
}

function ConnectionForm({
  onConnect,
  isConnecting,
}: {
  onConnect: (config: ConnectionConfig) => void;
  isConnecting: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [config, setConfig] = useState<ConnectionConfig>({
    hostname: "",
    port: "22",
    username: "",
    password: "",
    privateKey: "",
    authMethod: "password",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.hostname || !config.username) return;
    if (config.authMethod === "password" && !config.password) return;
    if (config.authMethod === "privateKey" && !config.privateKey) return;
    onConnect(config);
  };

  const handleKeyFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 32768) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result;
      if (typeof text === "string") {
        setConfig({ ...config, privateKey: text });
      }
    };
    reader.readAsText(file);
  };

  const isValid = config.hostname && config.username && (
    (config.authMethod === "password" && config.password) ||
    (config.authMethod === "privateKey" && config.privateKey)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        <div>
          <Label className="text-zinc-300 text-sm mb-1.5 block">Target Host / IP Address</Label>
          <div className="relative">
            <Server className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              data-testid="input-ssh-hostname"
              value={config.hostname}
              onChange={(e) => setConfig({ ...config, hostname: e.target.value })}
              placeholder="192.168.1.100 or server.example.com"
              className="pl-10 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-zinc-300 text-sm mb-1.5 block">Port</Label>
            <Input
              data-testid="input-ssh-port"
              value={config.port}
              onChange={(e) => setConfig({ ...config, port: e.target.value })}
              placeholder="22"
              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600"
            />
          </div>
          <div>
            <Label className="text-zinc-300 text-sm mb-1.5 block">Username</Label>
            <Input
              data-testid="input-ssh-username"
              value={config.username}
              onChange={(e) => setConfig({ ...config, username: e.target.value })}
              placeholder="root"
              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600"
              required
            />
          </div>
        </div>

        <div>
          <Label className="text-zinc-300 text-sm mb-2 block">Authentication Method</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setConfig({ ...config, authMethod: "password" })}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                config.authMethod === "password"
                  ? "border-orange-500 bg-orange-500/10 text-orange-400"
                  : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
              }`}
              data-testid="button-auth-password"
            >
              <KeyRound className="h-4 w-4" /> Password
            </button>
            <button
              type="button"
              onClick={() => setConfig({ ...config, authMethod: "privateKey" })}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                config.authMethod === "privateKey"
                  ? "border-orange-500 bg-orange-500/10 text-orange-400"
                  : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
              }`}
              data-testid="button-auth-privatekey"
            >
              <FileKey className="h-4 w-4" /> Private Key
            </button>
          </div>
        </div>

        {config.authMethod === "password" ? (
          <div>
            <Label className="text-zinc-300 text-sm mb-1.5 block">Password</Label>
            <div className="relative">
              <Input
                data-testid="input-ssh-password"
                type={showPassword ? "text" : "password"}
                value={config.password}
                onChange={(e) => setConfig({ ...config, password: e.target.value })}
                placeholder="••••••••"
                className="pr-10 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600"
                required
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                data-testid="button-toggle-ssh-password"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label className="text-zinc-300 text-sm mb-1.5 block">Private Key (RSA / Ed25519 / ECDSA)</Label>
              <textarea
                data-testid="input-ssh-privatekey"
                value={config.privateKey}
                onChange={(e) => setConfig({ ...config, privateKey: e.target.value })}
                placeholder={"-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----"}
                className="w-full h-32 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-600 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
              />
              <div className="flex items-center gap-2 mt-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pem,.key,.pub,.ppk,*"
                  onChange={handleKeyFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  data-testid="button-upload-key"
                >
                  <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload Key File
                </Button>
                {config.privateKey && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfig({ ...config, privateKey: "" })}
                    className="text-zinc-500 hover:text-red-400"
                    data-testid="button-clear-key"
                  >
                    <X className="h-3.5 w-3.5 mr-1" /> Clear
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Label className="text-zinc-300 text-sm mb-1.5 block">Key Passphrase (optional)</Label>
              <div className="relative">
                <Input
                  data-testid="input-ssh-passphrase"
                  type={showPassword ? "text" : "password"}
                  value={config.password}
                  onChange={(e) => setConfig({ ...config, password: e.target.value })}
                  placeholder="Passphrase for encrypted key"
                  className="pr-10 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  data-testid="button-toggle-ssh-passphrase"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-start gap-2 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
        <Lock className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
        <p className="text-xs text-zinc-400">
          Credentials and private keys exist strictly in server memory for the duration of your session. They are never written to disk, logged, or stored in any database. All traffic is encrypted via WSS.
        </p>
      </div>

      <Button
        type="submit"
        disabled={isConnecting || !isValid}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
        data-testid="button-ssh-connect"
      >
        {isConnecting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Connecting…
          </>
        ) : (
          <>
            <Terminal className="h-4 w-4 mr-2" /> Connect via SSH
          </>
        )}
      </Button>
    </form>
  );
}

function SSHTerminalViewer({
  wsUrl,
  connectionState,
  onDisconnect,
  errorMessage,
}: {
  wsUrl: string;
  connectionState: ConnectionState;
  onDisconnect: () => void;
  errorMessage: string | null;
}) {
  const termContainerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const termRef = useRef<any>(null);
  const fitAddonRef = useRef<any>(null);

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
        cursorStyle: "bar",
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
        scrollback: 10000,
        convertEol: true,
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

      term.writeln("\x1b[38;2;249;115;22m◆ STB Cybersecurity — SSH Terminal\x1b[0m");
      term.writeln("\x1b[38;5;245mEstablishing secure connection…\x1b[0m\r\n");

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
              if (msg.status === "ready") {
                term.writeln("\x1b[38;5;34m✓ Shell ready\x1b[0m\r\n");
                const dims = fitAddon.proposeDimensions();
                if (dims && ws && ws.readyState === WebSocket.OPEN) {
                  ws.send(JSON.stringify({ type: "resize", cols: dims.cols, rows: dims.rows }));
                }
              } else if (msg.status === "disconnected") {
                term.writeln("\r\n\x1b[38;5;245m— Connection closed by remote host —\x1b[0m");
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
        term.writeln("\r\n\x1b[38;5;196m✗ WebSocket connection error\x1b[0m");
      };

      ws.onclose = () => {
        term.writeln("\r\n\x1b[38;5;245m— Session ended —\x1b[0m");
        if (pingInterval) clearInterval(pingInterval);
      };

      term.onData((data: string) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
          const encoded = btoa(data);
          ws.send(JSON.stringify({ type: "input", data: encoded }));
        }
      });

      const handleResize = () => {
        try {
          fitAddon.fit();
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "resize", cols: term.cols, rows: term.rows }));
          }
        } catch {}
      };

      const resizeObserver = new ResizeObserver(() => handleResize());
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
        if (term._resizeObserver) {
          term._resizeObserver.disconnect();
        }
        term.dispose();
        termRef.current = null;
        fitAddonRef.current = null;
      }
    };
  }, [connectionState, wsUrl]);

  if (connectionState === "error") {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="p-4 rounded-full bg-red-500/10">
          <WifiOff className="h-10 w-10 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Connection Failed</h3>
        <p className="text-sm text-zinc-400 text-center max-w-md">
          {errorMessage || "Unable to establish an SSH connection. Verify the target is reachable, credentials are correct, and SSH is enabled on the remote host."}
        </p>
        <Button onClick={onDisconnect} variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" data-testid="button-ssh-retry">
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
            <Terminal className="h-10 w-10 text-orange-400" />
          </div>
          <Loader2 className="absolute -top-1 -right-1 h-6 w-6 text-orange-500 animate-spin" />
        </div>
        <h3 className="text-lg font-semibold text-white">Establishing SSH Connection…</h3>
        <p className="text-sm text-zinc-400 text-center max-w-md">
          Authenticating and establishing a secure shell session. This may take a few seconds.
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
          <span className="text-[10px] text-zinc-500 font-mono">SSH</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onDisconnect}
            className="p-1.5 hover:bg-red-500/20 rounded transition-colors text-zinc-400 hover:text-red-400"
            title="Disconnect"
            data-testid="button-ssh-disconnect"
          >
            <Power className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div
        ref={termContainerRef}
        className="w-full bg-[#09090b] border-x border-b border-zinc-800 rounded-b-lg"
        style={{ minHeight: "500px", height: "calc(100vh - 280px)" }}
        data-testid="container-ssh-terminal"
      />
    </div>
  );
}

export default function SSHTerminal() {
  useDocumentTitle("SSH Terminal | STB Cybersecurity");
  const { user, isAuthenticated, isBusiness } = useAuth();
  const { toast } = useToast();

  const [connectionState, setConnectionState] = useState<ConnectionState>("disconnected");
  const [wsUrl, setWsUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleConnect = async (config: ConnectionConfig) => {
    setConnectionState("connecting");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/ssh/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          hostname: config.hostname,
          port: config.port,
          username: config.username,
          password: config.password || undefined,
          privateKey: config.authMethod === "privateKey" ? config.privateKey : undefined,
          cols: 120,
          rows: 30,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to initiate SSH connection");
      }

      const data = await res.json();
      setSessionId(data.sessionId);

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsEndpoint = `${protocol}//${window.location.host}/ws/ssh/${data.sessionId}`;
      setWsUrl(wsEndpoint);
      setConnectionState("connected");

      toast({
        title: "Connected",
        description: `SSH session established to ${config.hostname}`,
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
        await fetch(`/api/ssh/disconnect/${sessionId}`, {
          method: "POST",
          credentials: "include",
        });
      } catch {}
    }
    setConnectionState("disconnected");
    setWsUrl("");
    setSessionId(null);
    setErrorMessage(null);
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
              <h2 className="text-2xl font-display font-bold text-white" data-testid="text-ssh-login-required">Sign In Required</h2>
              <p className="text-zinc-400 max-w-md">
                SSH Terminal access requires authentication. Please sign in with your STB Cybersecurity account to continue.
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </Layout>
    );
  }

  if (!isBusiness) {
    return (
      <Layout>
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="p-5 rounded-full bg-orange-500/10">
              <Crown className="h-12 w-12 text-orange-400" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-display font-bold text-white" data-testid="text-ssh-upgrade-required">Business Subscription Required</h2>
              <p className="text-zinc-400 max-w-md">
                The SSH Terminal is available exclusively to Business and Enterprise subscribers.
                Upgrade your plan to access secure, browser-based SSH connections.
              </p>
            </div>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold" asChild>
              <a href="/support#pricing" data-testid="link-ssh-upgrade">
                <Crown className="h-4 w-4 mr-2" /> Upgrade to Business
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
            <h1 className="text-3xl font-display font-bold text-white" data-testid="text-ssh-title">
              SSH Terminal
            </h1>
            <p className="text-muted-foreground mt-1">
              Secure, browser-based SSH client for remote server management
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
              <Crown className="h-3 w-3 mr-1" /> BUSINESS
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
                    <Terminal className="h-5 w-5 text-orange-400" /> New SSH Connection
                  </CardTitle>
                  <CardDescription>
                    Enter the credentials for the remote server you want to connect to via SSH.
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
                    <Shield className="h-4 w-4 text-green-400" /> Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-zinc-400">End-to-end encrypted SSH + WSS tunnel</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-zinc-400">Credentials held in memory only — never stored or logged</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-zinc-400">RSA, Ed25519, and ECDSA key authentication supported</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-zinc-400">Uploaded key files are read in-browser and never touch the server filesystem</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-zinc-400">Sessions auto-expire after 30 minutes or 15 minutes idle</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/5 bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-white">
                    <AlertTriangle className="h-4 w-4 text-amber-400" /> Usage Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="text-amber-400 text-xs mt-0.5">•</span>
                    <p className="text-xs text-zinc-400">Maximum 3 concurrent SSH sessions per account</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-amber-400 text-xs mt-0.5">•</span>
                    <p className="text-xs text-zinc-400">Connections to private/internal IP ranges are blocked</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-amber-400 text-xs mt-0.5">•</span>
                    <p className="text-xs text-zinc-400">Intended for incident response and authorized administration only</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <SSHTerminalViewer
            wsUrl={wsUrl}
            connectionState={connectionState}
            onDisconnect={handleDisconnect}
            errorMessage={errorMessage}
          />
        )}
      </div>
      <Footer />
    </Layout>
  );
}
