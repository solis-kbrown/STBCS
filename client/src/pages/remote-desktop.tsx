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
  RefreshCw, Info, X, Copy, Check, MonitorSmartphone, Plus
} from "lucide-react";
import { RDPIcon } from "@/components/branded-icons";
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

interface RDPTab {
  id: string;
  label: string;
  connectionState: ConnectionState;
  wsUrl: string;
  sessionId: string | null;
  errorMessage: string | null;
  config: ConnectionConfig | null;
}

const MAX_TABS = 2;

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
              className="w-full h-9 rounded-md border border-zinc-500 bg-zinc-900 px-3 text-sm text-white"
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
  isActiveTab,
}: {
  wsUrl: string;
  connectionState: ConnectionState;
  onDisconnect: () => void;
  errorMessage: string | null;
  isActiveTab: boolean;
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
      if (!isActiveTab) return;
      if (ws.readyState === WebSocket.OPEN) {
        e.preventDefault();
        ws.send(JSON.stringify({ type: "key", keyCode: e.keyCode, down: true, key: e.key }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!isActiveTab) return;
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
  }, [connectionState, wsUrl, isActiveTab]);

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
        <Button onClick={onDisconnect} variant="outline" className="border-zinc-500 text-zinc-300 hover:bg-zinc-800" data-testid="button-rdp-retry">
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

function TabBar({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onAddTab,
  canAddTab,
}: {
  tabs: RDPTab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onAddTab: () => void;
  canAddTab: boolean;
}) {
  return (
    <div className="flex items-center gap-1 bg-zinc-900/80 border border-zinc-800 rounded-lg p-1 mb-4 overflow-x-auto" data-testid="rdp-tab-bar">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const stateColor =
          tab.connectionState === "connected"
            ? "bg-green-500"
            : tab.connectionState === "connecting"
            ? "bg-orange-500 animate-pulse"
            : tab.connectionState === "error"
            ? "bg-red-500"
            : "bg-zinc-600";

        return (
          <div
            key={tab.id}
            className={`
              flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer text-sm transition-all duration-200 min-w-0 shrink-0
              ${isActive
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
              }
            `}
            onClick={() => onSelectTab(tab.id)}
            data-testid={`rdp-tab-${tab.id}`}
          >
            <span className={`h-2 w-2 rounded-full shrink-0 ${stateColor}`} />
            <span className="truncate max-w-[140px] font-medium text-xs">
              {tab.label}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(tab.id);
              }}
              className="p-0.5 rounded hover:bg-zinc-700 transition-colors shrink-0"
              data-testid={`rdp-tab-close-${tab.id}`}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}
      {canAddTab && (
        <button
          onClick={onAddTab}
          className="flex items-center gap-1 px-2 py-1.5 rounded-md text-zinc-500 hover:text-orange-400 hover:bg-zinc-800/50 transition-all duration-200 shrink-0"
          data-testid="rdp-tab-add"
          title="New session"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

let tabIdCounter = 0;
function generateTabId() {
  tabIdCounter++;
  return `rdp-tab-${Date.now()}-${tabIdCounter}`;
}

export default function RemoteDesktop() {
  useDocumentTitle("Remote Desktop | STB Cybersecurity");
  const { user, isAuthenticated, isBusiness } = useAuth();
  const { toast } = useToast();

  const [tabs, setTabs] = useState<RDPTab[]>(() => {
    const initialId = generateTabId();
    return [{
      id: initialId,
      label: "New Connection",
      connectionState: "disconnected",
      wsUrl: "",
      sessionId: null,
      errorMessage: null,
      config: null,
    }];
  });
  const [activeTabId, setActiveTabId] = useState<string>(tabs[0].id);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const updateTab = (tabId: string, updates: Partial<RDPTab>) => {
    setTabs((prev) => prev.map((t) => (t.id === tabId ? { ...t, ...updates } : t)));
  };

  const handleConnect = async (tabId: string, config: ConnectionConfig) => {
    updateTab(tabId, { connectionState: "connecting", errorMessage: null, config });

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
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsEndpoint = `${protocol}//${window.location.host}/ws/rdp/${data.sessionId}`;

      updateTab(tabId, {
        sessionId: data.sessionId,
        wsUrl: wsEndpoint,
        connectionState: "connected",
        label: `${config.hostname}:${config.port}`,
      });

      toast({
        title: "Connected",
        description: `Session established to ${config.hostname}`,
      });
    } catch (err: any) {
      updateTab(tabId, {
        connectionState: "error",
        errorMessage: err.message,
      });
      toast({
        title: "Connection Failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (tab?.sessionId) {
      try {
        await fetch(`/api/rdp/disconnect/${tab.sessionId}`, {
          method: "POST",
          credentials: "include",
        });
      } catch {}
    }
    updateTab(tabId, {
      connectionState: "disconnected",
      wsUrl: "",
      sessionId: null,
      errorMessage: null,
      label: "New Connection",
      config: null,
    });
  };

  const handleAddTab = () => {
    if (tabs.length >= MAX_TABS) return;
    const newId = generateTabId();
    setTabs((prev) => [
      ...prev,
      {
        id: newId,
        label: "New Connection",
        connectionState: "disconnected",
        wsUrl: "",
        sessionId: null,
        errorMessage: null,
        config: null,
      },
    ]);
    setActiveTabId(newId);
  };

  const handleCloseTab = async (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (tab?.sessionId) {
      try {
        await fetch(`/api/rdp/disconnect/${tab.sessionId}`, {
          method: "POST",
          credentials: "include",
        });
      } catch {}
    }

    setTabs((prev) => {
      const remaining = prev.filter((t) => t.id !== tabId);
      if (remaining.length === 0) {
        const newId = generateTabId();
        const newTab: RDPTab = {
          id: newId,
          label: "New Connection",
          connectionState: "disconnected",
          wsUrl: "",
          sessionId: null,
          errorMessage: null,
          config: null,
        };
        setActiveTabId(newId);
        return [newTab];
      }
      if (activeTabId === tabId) {
        setActiveTabId(remaining[remaining.length - 1].id);
      }
      return remaining;
    });
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
              <a href="/pricing" data-testid="link-rdp-upgrade">
                <Crown className="h-4 w-4 mr-2" /> Upgrade to Business
              </a>
            </Button>
          </div>
        </div>
        <Footer />
      </Layout>
    );
  }

  const hasAnySessions = tabs.some((t) => t.connectionState !== "disconnected");

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/20 shrink-0" style={{ filter: "drop-shadow(0 0 16px rgba(249, 115, 22, 0.3))" }}>
              <RDPIcon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-white" data-testid="text-rdp-title">
                Remote Desktop
              </h1>
              <p className="text-muted-foreground mt-1">
                Secure, browser-based RDP client for remote server management
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
              <Crown className="h-3 w-3 mr-1" /> BUSINESS
            </Badge>
            {hasAnySessions && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                <Wifi className="h-3 w-3 mr-1" /> ACTIVE SESSION
              </Badge>
            )}
          </div>
        </div>

        {tabs.length > 1 || hasAnySessions ? (
          <TabBar
            tabs={tabs}
            activeTabId={activeTabId}
            onSelectTab={setActiveTabId}
            onCloseTab={handleCloseTab}
            onAddTab={handleAddTab}
            canAddTab={tabs.length < MAX_TABS}
          />
        ) : null}

        {tabs.map((tab) => (
          <div key={tab.id} className={tab.id === activeTabId ? "block" : "hidden"}>
            {tab.connectionState === "disconnected" ? (
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
                      <ConnectionModal onConnect={(config) => handleConnect(tab.id, config)} isConnecting={false} />
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
                  wsUrl={tab.wsUrl}
                  connectionState={tab.connectionState}
                  onDisconnect={() => handleDisconnect(tab.id)}
                  errorMessage={tab.errorMessage}
                  isActiveTab={tab.id === activeTabId}
                />
              </Card>
            )}
          </div>
        ))}

        {tabs.length < MAX_TABS && !hasAnySessions && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={handleAddTab}
              className="border-zinc-500 text-zinc-400 hover:text-orange-400 hover:border-orange-500/50"
              data-testid="button-rdp-add-session"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Another Session
            </Button>
          </div>
        )}
      </div>
      <Footer />
    </Layout>
  );
}
