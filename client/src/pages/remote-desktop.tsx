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
  Monitor, Lock, Shield, ShieldAlert, Wifi, WifiOff,
  Maximize, Minimize, Settings, Power, Crown, Loader2,
  Eye, EyeOff, AlertTriangle, Server, Keyboard, Mouse,
  RefreshCw, Info, X, Copy, Check, MonitorSmartphone
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

type ConnectionState = "disconnected" | "connecting" | "connected" | "error";

interface ConnectionConfig {
  hostname: string;
  port: string;
  username: string;
  password: string;
  domain: string;
  width: string;
  height: string;
  security: string;
}

function ConnectionModal({
  onConnect,
  isConnecting,
}: {
  onConnect: (config: ConnectionConfig) => void;
  isConnecting: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [config, setConfig] = useState<ConnectionConfig>({
    hostname: "",
    port: "3389",
    username: "",
    password: "",
    domain: "",
    width: "1920",
    height: "1080",
    security: "nla",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.hostname || !config.username || !config.password) return;
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
              data-testid="input-rdp-hostname"
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
              data-testid="input-rdp-port"
              value={config.port}
              onChange={(e) => setConfig({ ...config, port: e.target.value })}
              placeholder="3389"
              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600"
            />
          </div>
          <div>
            <Label className="text-zinc-300 text-sm mb-1.5 block">Domain (optional)</Label>
            <Input
              data-testid="input-rdp-domain"
              value={config.domain}
              onChange={(e) => setConfig({ ...config, domain: e.target.value })}
              placeholder="WORKGROUP"
              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600"
            />
          </div>
        </div>

        <div>
          <Label className="text-zinc-300 text-sm mb-1.5 block">Username</Label>
          <Input
            data-testid="input-rdp-username"
            value={config.username}
            onChange={(e) => setConfig({ ...config, username: e.target.value })}
            placeholder="Administrator"
            className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600"
            required
          />
        </div>

        <div>
          <Label className="text-zinc-300 text-sm mb-1.5 block">Password</Label>
          <div className="relative">
            <Input
              data-testid="input-rdp-password"
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
              data-testid="button-toggle-password"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-zinc-300 text-sm mb-1.5 block">Width</Label>
            <Input
              data-testid="input-rdp-width"
              value={config.width}
              onChange={(e) => setConfig({ ...config, width: e.target.value })}
              className="bg-zinc-900 border-zinc-700 text-white"
            />
          </div>
          <div>
            <Label className="text-zinc-300 text-sm mb-1.5 block">Height</Label>
            <Input
              data-testid="input-rdp-height"
              value={config.height}
              onChange={(e) => setConfig({ ...config, height: e.target.value })}
              className="bg-zinc-900 border-zinc-700 text-white"
            />
          </div>
          <div>
            <Label className="text-zinc-300 text-sm mb-1.5 block">Security</Label>
            <select
              data-testid="select-rdp-security"
              value={config.security}
              onChange={(e) => setConfig({ ...config, security: e.target.value })}
              className="w-full h-9 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-white"
            >
              <option value="nla">NLA</option>
              <option value="tls">TLS</option>
              <option value="rdp">RDP</option>
              <option value="any">Any</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
        <Lock className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
        <p className="text-xs text-zinc-400">
          Your credentials are transmitted over an encrypted WebSocket connection and held only in server memory for the duration of your session. They are never logged, cached, or stored in any database.
        </p>
      </div>

      <Button
        type="submit"
        disabled={isConnecting || !config.hostname || !config.username || !config.password}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
        data-testid="button-rdp-connect"
      >
        {isConnecting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Connecting…
          </>
        ) : (
          <>
            <Monitor className="h-4 w-4 mr-2" /> Connect to Remote Desktop
          </>
        )}
      </Button>
    </form>
  );
}

function RDPViewer({
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stats, setStats] = useState({ fps: 0, latency: 0 });

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  useEffect(() => {
    if (connectionState !== "connected" || !wsUrl) return;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    ws.binaryType = "arraybuffer";

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameCount = 0;
    let lastFpsTime = Date.now();

    ws.onmessage = (event) => {
      if (typeof event.data === "string") {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "resize") {
            canvas.width = msg.width;
            canvas.height = msg.height;
          } else if (msg.type === "stats") {
            setStats({ fps: msg.fps || 0, latency: msg.latency || 0 });
          }
        } catch {}
      } else {
        const blob = new Blob([event.data], { type: "image/png" });
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(img.src);
          frameCount++;
          const now = Date.now();
          if (now - lastFpsTime >= 1000) {
            setStats((prev) => ({ ...prev, fps: frameCount }));
            frameCount = 0;
            lastFpsTime = now;
          }
        };
        img.src = URL.createObjectURL(blob);
      }
    };

    ws.onerror = () => {};
    ws.onclose = () => {};

    const handleKeyDown = (e: KeyboardEvent) => {
      if (ws.readyState === WebSocket.OPEN) {
        e.preventDefault();
        ws.send(JSON.stringify({ type: "key", keyCode: e.keyCode, down: true, key: e.key }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (ws.readyState === WebSocket.OPEN) {
        e.preventDefault();
        ws.send(JSON.stringify({ type: "key", keyCode: e.keyCode, down: false, key: e.key }));
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (ws.readyState === WebSocket.OPEN && canvas) {
        const rect = canvas.getBoundingClientRect();
        const x = Math.round(((e.clientX - rect.left) / rect.width) * canvas.width);
        const y = Math.round(((e.clientY - rect.top) / rect.height) * canvas.height);
        ws.send(JSON.stringify({ type: "mouse", x, y, button: 0 }));
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (ws.readyState === WebSocket.OPEN && canvas) {
        const rect = canvas.getBoundingClientRect();
        const x = Math.round(((e.clientX - rect.left) / rect.width) * canvas.width);
        const y = Math.round(((e.clientY - rect.top) / rect.height) * canvas.height);
        ws.send(JSON.stringify({ type: "mousedown", x, y, button: e.button }));
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (ws.readyState === WebSocket.OPEN && canvas) {
        const rect = canvas.getBoundingClientRect();
        const x = Math.round(((e.clientX - rect.left) / rect.width) * canvas.width);
        const y = Math.round(((e.clientY - rect.top) / rect.height) * canvas.height);
        ws.send(JSON.stringify({ type: "mouseup", x, y, button: e.button }));
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (ws.readyState === WebSocket.OPEN) {
        e.preventDefault();
        ws.send(JSON.stringify({ type: "scroll", deltaX: e.deltaX, deltaY: e.deltaY }));
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    canvas.focus();

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      ws.close();
      wsRef.current = null;
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
          {errorMessage || "Unable to establish an RDP connection. Verify the target is reachable, credentials are correct, and RDP is enabled on the remote host."}
        </p>
        <Button onClick={onDisconnect} variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" data-testid="button-rdp-retry">
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
            <Monitor className="h-10 w-10 text-orange-400" />
          </div>
          <Loader2 className="absolute -top-1 -right-1 h-6 w-6 text-orange-500 animate-spin" />
        </div>
        <h3 className="text-lg font-semibold text-white">Establishing Connection…</h3>
        <p className="text-sm text-zinc-400 text-center max-w-md">
          Connecting to the remote host via secure WebSocket tunnel. This may take a few seconds depending on network latency.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${isFullscreen ? "bg-black" : ""}`}>
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 rounded-t-lg">
        <div className="flex items-center gap-3">
          <Badge className="bg-green-500/20 text-green-400 border-green-500/50 text-[10px]">
            <Wifi className="h-3 w-3 mr-1" /> CONNECTED
          </Badge>
          <span className="text-[10px] text-zinc-500">{stats.fps} FPS</span>
          <span className="text-[10px] text-zinc-500">{stats.latency}ms</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleFullscreen}
            className="p-1.5 hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-white"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            data-testid="button-rdp-fullscreen"
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>
          <button
            onClick={onDisconnect}
            className="p-1.5 hover:bg-red-500/20 rounded transition-colors text-zinc-400 hover:text-red-400"
            title="Disconnect"
            data-testid="button-rdp-disconnect"
          >
            <Power className="h-4 w-4" />
          </button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full bg-black rounded-b-lg cursor-crosshair"
        style={{ aspectRatio: "16/9" }}
        tabIndex={0}
        data-testid="canvas-rdp-viewer"
      />
    </div>
  );
}

export default function RemoteDesktop() {
  useDocumentTitle("Remote Desktop | STB Cybersecurity");
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
      const res = await fetch("/api/rdp/connect", {
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

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsEndpoint = `${protocol}//${window.location.host}/ws/rdp/${data.sessionId}`;
      setWsUrl(wsEndpoint);
      setConnectionState("connected");

      toast({
        title: "Connected",
        description: `Session established to ${config.hostname}`,
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
        await fetch(`/api/rdp/disconnect/${sessionId}`, {
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
              <h2 className="text-2xl font-display font-bold text-white" data-testid="text-rdp-login-required">Sign In Required</h2>
              <p className="text-zinc-400 max-w-md">
                Remote Desktop access requires authentication. Please sign in with your STB Cybersecurity account to continue.
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
              <h2 className="text-2xl font-display font-bold text-white" data-testid="text-rdp-upgrade-required">Business Subscription Required</h2>
              <p className="text-zinc-400 max-w-md">
                The Remote Desktop tool is available exclusively to Business and Enterprise subscribers.
                Upgrade your plan to access secure, browser-based remote desktop connections.
              </p>
            </div>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold" asChild>
              <a href="/support#pricing" data-testid="link-rdp-upgrade">
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
            <h1 className="text-3xl font-display font-bold text-white" data-testid="text-rdp-title">
              Remote Desktop
            </h1>
            <p className="text-muted-foreground mt-1">
              Secure, browser-based RDP client for remote server management
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
                    <Monitor className="h-5 w-5 text-orange-400" /> New Connection
                  </CardTitle>
                  <CardDescription>
                    Enter the credentials for the remote machine you want to connect to.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ConnectionModal onConnect={handleConnect} isConnecting={false} />
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
                    <p className="text-xs text-zinc-400">End-to-end encrypted WebSocket (WSS) tunnel</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-zinc-400">Credentials held in memory only — never stored or logged</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-zinc-400">NLA, TLS, and standard RDP security modes supported</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-zinc-400">Session automatically terminated on disconnect</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/5 bg-card/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-white">
                    <Info className="h-4 w-4 text-blue-400" /> Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MonitorSmartphone className="h-4 w-4 text-zinc-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-zinc-400">Remote Desktop must be enabled on the target machine</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Wifi className="h-4 w-4 text-zinc-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-zinc-400">Port 3389 (or custom) must be accessible from the internet</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-zinc-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-zinc-400">Valid user credentials for the remote system</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-500/20 bg-orange-500/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-orange-400 mb-1">Important</p>
                      <p className="text-xs text-zinc-400">
                        Only connect to systems you own or have explicit authorization to access.
                        Unauthorized access to computer systems is a federal crime.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="border-white/5 bg-card/50 overflow-hidden">
            <RDPViewer
              wsUrl={wsUrl}
              connectionState={connectionState}
              onDisconnect={handleDisconnect}
              errorMessage={errorMessage}
            />
          </Card>
        )}
      </div>
      <Footer />
    </Layout>
  );
}
