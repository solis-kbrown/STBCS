import { useState, useRef, useCallback, useEffect } from "react";
import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FolderSync, Lock, Shield, Wifi, WifiOff, Crown, Loader2,
  Eye, EyeOff, AlertTriangle, Server, RefreshCw, Check, Power,
  KeyRound, FileKey, X, Upload, Plus, Folder, File, FileText,
  FileImage, FileCode, FileArchive, Download, Trash2, FolderPlus,
  Pencil, ChevronRight, Home, ArrowUp, HardDrive, Copy
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

interface RemoteFile {
  name: string;
  longname: string;
  size: number;
  uid: number;
  gid: number;
  mode: number;
  atime: number;
  mtime: number;
  isDirectory: boolean;
  isSymlink: boolean;
  permissions: string;
}

interface SFTPTab {
  id: string;
  connectionState: ConnectionState;
  sessionId: string | null;
  errorMessage: string | null;
  hostname: string;
  port: string;
  username: string;
  currentPath: string;
  files: RemoteFile[];
  isLoading: boolean;
  selectedFiles: Set<string>;
}

const MAX_TABS = 3;

let tabIdCounter = 0;
function generateTabId(): string {
  tabIdCounter++;
  return `sftp-tab-${Date.now()}-${tabIdCounter}`;
}

function createNewTab(): SFTPTab {
  return {
    id: generateTabId(),
    connectionState: "disconnected",
    sessionId: null,
    errorMessage: null,
    hostname: "",
    port: "22",
    username: "",
    currentPath: "/",
    files: [],
    isLoading: false,
    selectedFiles: new Set(),
  };
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp * 1000);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getFileIcon(file: RemoteFile) {
  if (file.isDirectory) return <Folder className="h-4 w-4 text-orange-400" />;
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "gif", "svg", "webp", "bmp", "ico"].includes(ext))
    return <FileImage className="h-4 w-4 text-purple-400" />;
  if (["js", "ts", "tsx", "jsx", "py", "rb", "go", "rs", "c", "cpp", "h", "java", "sh", "bash", "zsh", "php", "css", "html", "xml", "json", "yaml", "yml", "toml"].includes(ext))
    return <FileCode className="h-4 w-4 text-cyan-400" />;
  if (["zip", "tar", "gz", "bz2", "xz", "7z", "rar", "tgz"].includes(ext))
    return <FileArchive className="h-4 w-4 text-amber-400" />;
  if (["txt", "md", "log", "csv", "cfg", "conf", "ini"].includes(ext))
    return <FileText className="h-4 w-4 text-zinc-400" />;
  return <File className="h-4 w-4 text-zinc-500" />;
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
    if (file.size > 32768) return;
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
              data-testid="input-sftp-hostname"
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
              data-testid="input-sftp-port"
              value={config.port}
              onChange={(e) => setConfig({ ...config, port: e.target.value })}
              placeholder="22"
              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600"
            />
          </div>
          <div>
            <Label className="text-zinc-300 text-sm mb-1.5 block">Username</Label>
            <Input
              data-testid="input-sftp-username"
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
              data-testid="button-sftp-auth-password"
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
              data-testid="button-sftp-auth-privatekey"
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
                data-testid="input-sftp-password"
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
                data-testid="button-toggle-sftp-password"
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
                data-testid="input-sftp-privatekey"
                value={config.privateKey}
                onChange={(e) => setConfig({ ...config, privateKey: e.target.value })}
                placeholder={"Paste your private key here (PEM format)"}
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
                  data-testid="button-sftp-upload-key"
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
                    data-testid="button-sftp-clear-key"
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
                  data-testid="input-sftp-passphrase"
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
                  data-testid="button-toggle-sftp-passphrase"
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
          Credentials and private keys exist strictly in server memory for the duration of your session. They are never written to disk, logged, or stored in any database.
        </p>
      </div>

      <Button
        type="submit"
        disabled={isConnecting || !isValid}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
        data-testid="button-sftp-connect"
      >
        {isConnecting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Connecting…
          </>
        ) : (
          <>
            <FolderSync className="h-4 w-4 mr-2" /> Connect via SFTP
          </>
        )}
      </Button>
    </form>
  );
}

function FileBrowser({
  tab,
  onNavigate,
  onDownload,
  onDelete,
  onMkdir,
  onRename,
  onUpload,
  onRefresh,
  onDisconnect,
  onToggleSelect,
}: {
  tab: SFTPTab;
  onNavigate: (path: string) => void;
  onDownload: (filePath: string) => void;
  onDelete: (filePath: string, isDirectory: boolean) => void;
  onMkdir: () => void;
  onRename: (oldPath: string) => void;
  onUpload: (files: FileList) => void;
  onRefresh: () => void;
  onDisconnect: () => void;
  onToggleSelect: (name: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const pathParts = tab.currentPath.split("/").filter(Boolean);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files);
    }
  };

  const handleFileClick = (file: RemoteFile) => {
    if (file.isDirectory) {
      const newPath = tab.currentPath === "/"
        ? `/${file.name}`
        : `${tab.currentPath}/${file.name}`;
      onNavigate(newPath);
    }
  };

  const goUp = () => {
    if (tab.currentPath === "/") return;
    const parts = tab.currentPath.split("/").filter(Boolean);
    parts.pop();
    onNavigate("/" + parts.join("/"));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-t-lg">
        <div className="flex items-center gap-3">
          <Badge className="bg-green-500/20 text-green-400 border-green-500/50 text-[10px]">
            <Wifi className="h-3 w-3 mr-1" /> CONNECTED
          </Badge>
          <span className="text-[10px] text-zinc-500 font-mono">
            SFTP • {tab.username}@{tab.hostname}:{tab.port}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onRefresh}
            className="p-1.5 hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-orange-400"
            title="Refresh"
            data-testid="button-sftp-refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={onDisconnect}
            className="p-1.5 hover:bg-red-500/20 rounded transition-colors text-zinc-400 hover:text-red-400"
            title="Disconnect"
            data-testid="button-sftp-disconnect"
          >
            <Power className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 px-3 py-2 bg-zinc-900/80 border-x border-zinc-800">
        <button
          onClick={goUp}
          disabled={tab.currentPath === "/"}
          className="p-1 hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
          title="Go up"
          data-testid="button-sftp-go-up"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
        <button
          onClick={() => onNavigate("/")}
          className="p-1 hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-white"
          title="Home"
          data-testid="button-sftp-go-home"
        >
          <Home className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-0.5 ml-2 text-sm overflow-x-auto scrollbar-none">
          <button
            onClick={() => onNavigate("/")}
            className="text-zinc-500 hover:text-orange-400 transition-colors px-1"
            data-testid="breadcrumb-sftp-root"
          >
            /
          </button>
          {pathParts.map((part, i) => (
            <span key={i} className="flex items-center gap-0.5">
              <ChevronRight className="h-3 w-3 text-zinc-700" />
              <button
                onClick={() => onNavigate("/" + pathParts.slice(0, i + 1).join("/"))}
                className="text-zinc-400 hover:text-orange-400 transition-colors px-1 font-mono text-xs"
                data-testid={`breadcrumb-sftp-${i}`}
              >
                {part}
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900/60 border-x border-zinc-800">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => e.target.files && onUpload(e.target.files)}
          className="hidden"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-orange-400 h-7 text-xs"
          data-testid="button-sftp-upload"
        >
          <Upload className="h-3 w-3 mr-1" /> Upload
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onMkdir}
          className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-orange-400 h-7 text-xs"
          data-testid="button-sftp-mkdir"
        >
          <FolderPlus className="h-3 w-3 mr-1" /> New Folder
        </Button>
      </div>

      <div
        className={`flex-1 border-x border-b border-zinc-800 rounded-b-lg overflow-auto bg-[#09090b] transition-colors ${
          isDragOver ? "bg-orange-500/5 border-orange-500/30" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ minHeight: "400px", maxHeight: "calc(100vh - 380px)" }}
        data-testid="container-sftp-file-list"
      >
        {isDragOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 z-10 pointer-events-none">
            <div className="flex flex-col items-center gap-2 text-orange-400">
              <Upload className="h-10 w-10" />
              <span className="text-sm font-medium">Drop files to upload</span>
            </div>
          </div>
        )}

        {tab.isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 text-orange-400 animate-spin" />
            <span className="ml-2 text-zinc-400 text-sm">Loading directory…</span>
          </div>
        ) : (
          <table className="w-full text-sm" data-testid="table-sftp-files">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs">
                <th className="text-left py-2 px-3 font-medium w-8"></th>
                <th className="text-left py-2 px-3 font-medium">Name</th>
                <th className="text-right py-2 px-3 font-medium w-24">Size</th>
                <th className="text-left py-2 px-3 font-medium w-40 hidden md:table-cell">Modified</th>
                <th className="text-left py-2 px-3 font-medium w-28 hidden lg:table-cell">Permissions</th>
                <th className="text-right py-2 px-3 font-medium w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tab.files.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-zinc-600">
                    <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Empty directory</p>
                  </td>
                </tr>
              ) : (
                tab.files.map((file) => (
                  <tr
                    key={file.name}
                    className={`border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors group ${
                      tab.selectedFiles.has(file.name) ? "bg-orange-500/5" : ""
                    }`}
                    data-testid={`row-sftp-file-${file.name}`}
                  >
                    <td className="py-1.5 px-3">
                      {getFileIcon(file)}
                    </td>
                    <td className="py-1.5 px-3">
                      {file.isDirectory ? (
                        <button
                          onClick={() => handleFileClick(file)}
                          className="text-orange-400 hover:text-orange-300 font-mono text-xs hover:underline"
                          data-testid={`link-sftp-dir-${file.name}`}
                        >
                          {file.name}/
                        </button>
                      ) : (
                        <span className="text-zinc-300 font-mono text-xs" data-testid={`text-sftp-file-${file.name}`}>
                          {file.name}
                        </span>
                      )}
                      {file.isSymlink && (
                        <span className="ml-1 text-[10px] text-cyan-500">→</span>
                      )}
                    </td>
                    <td className="py-1.5 px-3 text-right text-zinc-500 font-mono text-xs">
                      {file.isDirectory ? "—" : formatFileSize(file.size)}
                    </td>
                    <td className="py-1.5 px-3 text-zinc-500 text-xs hidden md:table-cell">
                      {formatDate(file.mtime)}
                    </td>
                    <td className="py-1.5 px-3 font-mono text-zinc-600 text-xs hidden lg:table-cell">
                      {file.permissions}
                    </td>
                    <td className="py-1.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!file.isDirectory && (
                          <button
                            onClick={() => {
                              const fullPath = tab.currentPath === "/"
                                ? `/${file.name}`
                                : `${tab.currentPath}/${file.name}`;
                              onDownload(fullPath);
                            }}
                            className="p-1 hover:bg-zinc-700 rounded text-zinc-500 hover:text-green-400 transition-colors"
                            title="Download"
                            data-testid={`button-sftp-download-${file.name}`}
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            const fullPath = tab.currentPath === "/"
                              ? `/${file.name}`
                              : `${tab.currentPath}/${file.name}`;
                            onRename(fullPath);
                          }}
                          className="p-1 hover:bg-zinc-700 rounded text-zinc-500 hover:text-amber-400 transition-colors"
                          title="Rename"
                          data-testid={`button-sftp-rename-${file.name}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            const fullPath = tab.currentPath === "/"
                              ? `/${file.name}`
                              : `${tab.currentPath}/${file.name}`;
                            onDelete(fullPath, file.isDirectory);
                          }}
                          className="p-1 hover:bg-zinc-700 rounded text-zinc-500 hover:text-red-400 transition-colors"
                          title="Delete"
                          data-testid={`button-sftp-delete-${file.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function TabBar({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onAddTab,
}: {
  tabs: SFTPTab[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onAddTab: () => void;
}) {
  return (
    <div className="flex items-center gap-1 bg-zinc-900/80 border border-zinc-800 rounded-lg p-1" data-testid="container-sftp-tabs">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        const label = tab.hostname
          ? `${tab.hostname}:${tab.port || "22"}`
          : "New Session";

        let statusDot: React.ReactNode;
        if (tab.connectionState === "connecting") {
          statusDot = (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
            </span>
          );
        } else if (tab.connectionState === "connected") {
          statusDot = <span className="h-2.5 w-2.5 rounded-full bg-green-500" />;
        } else if (tab.connectionState === "error") {
          statusDot = <span className="h-2.5 w-2.5 rounded-full bg-red-500" />;
        } else {
          statusDot = <span className="h-2.5 w-2.5 rounded-full bg-zinc-600" />;
        }

        return (
          <div
            key={tab.id}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer text-sm font-medium transition-all ${
              isActive
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
            }`}
            onClick={() => onSelectTab(tab.id)}
            data-testid={`tab-sftp-session-${tab.id}`}
          >
            {statusDot}
            <span className="font-mono text-xs truncate max-w-[140px]">{label}</span>
            {tabs.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
                className="ml-1 p-0.5 rounded hover:bg-red-500/20 hover:text-red-400 transition-colors"
                title="Close tab"
                data-testid={`button-close-sftp-tab-${tab.id}`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        );
      })}
      {tabs.length < MAX_TABS && (
        <button
          onClick={onAddTab}
          className="flex items-center justify-center h-7 w-7 rounded-md text-zinc-500 hover:text-orange-400 hover:bg-zinc-800/50 transition-all"
          title="New SFTP session"
          data-testid="button-add-sftp-tab"
        >
          <Plus className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default function SFTPClient() {
  useDocumentTitle("SFTP Client | STB Cybersecurity");
  const { user, isAuthenticated, isBusiness } = useAuth();
  const { toast } = useToast();

  const [tabs, setTabs] = useState<SFTPTab[]>(() => [createNewTab()]);
  const [activeTabId, setActiveTabId] = useState<string>(() => tabs[0].id);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const updateTab = useCallback((tabId: string, updates: Partial<SFTPTab>) => {
    setTabs((prev) => prev.map((t) => (t.id === tabId ? { ...t, ...updates } : t)));
  }, []);

  const listDirectory = useCallback(async (tabId: string, sessionId: string, path: string) => {
    updateTab(tabId, { isLoading: true });
    try {
      const res = await fetch("/api/sftp/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sessionId, path }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to list directory");
      }
      const data = await res.json();
      updateTab(tabId, { currentPath: data.path, files: data.files, isLoading: false, selectedFiles: new Set() });
    } catch (err: any) {
      updateTab(tabId, { isLoading: false });
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  }, [updateTab, toast]);

  const handleConnect = async (tabId: string, config: ConnectionConfig) => {
    updateTab(tabId, {
      connectionState: "connecting",
      errorMessage: null,
      hostname: config.hostname,
      port: config.port,
      username: config.username,
    });

    try {
      const res = await fetch("/api/sftp/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          hostname: config.hostname,
          port: parseInt(config.port) || 22,
          username: config.username,
          password: config.authMethod === "password" ? config.password : (config.password || undefined),
          privateKey: config.authMethod === "privateKey" ? config.privateKey : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to connect");
      }

      const data = await res.json();
      updateTab(tabId, {
        sessionId: data.sessionId,
        connectionState: "connected",
      });

      toast({ title: "Connected", description: `SFTP session to ${config.hostname}:${config.port}` });
      await listDirectory(tabId, data.sessionId, "/");
    } catch (err: any) {
      updateTab(tabId, { connectionState: "error", errorMessage: err.message });
      toast({ title: "Connection Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleDisconnect = async (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (tab?.sessionId) {
      try {
        await fetch(`/api/sftp/disconnect/${tab.sessionId}`, {
          method: "POST",
          credentials: "include",
        });
      } catch {}
    }
    updateTab(tabId, {
      connectionState: "disconnected",
      sessionId: null,
      errorMessage: null,
      hostname: "",
      port: "22",
      username: "",
      currentPath: "/",
      files: [],
      selectedFiles: new Set(),
    });
  };

  const handleNavigate = (tabId: string, path: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab?.sessionId) return;
    listDirectory(tabId, tab.sessionId, path);
  };

  const handleDownload = async (tabId: string, filePath: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab?.sessionId) return;

    try {
      const res = await fetch(`/api/sftp/download/${tab.sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ path: filePath }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Download failed");
      }

      const blob = await res.blob();
      const fileName = filePath.split("/").pop() || "download";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({ title: "Downloaded", description: fileName });
    } catch (err: any) {
      toast({ title: "Download Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (tabId: string, filePath: string, isDirectory: boolean) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab?.sessionId) return;

    const name = filePath.split("/").pop();
    if (!confirm(`Delete ${isDirectory ? "directory" : "file"} "${name}"?`)) return;

    try {
      const res = await fetch(`/api/sftp/delete/${tab.sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ path: filePath, isDirectory }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Delete failed");
      }

      toast({ title: "Deleted", description: name || filePath });
      await listDirectory(tabId, tab.sessionId, tab.currentPath);
    } catch (err: any) {
      toast({ title: "Delete Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleMkdir = async (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab?.sessionId) return;

    const name = prompt("Enter directory name:");
    if (!name) return;

    const dirPath = tab.currentPath === "/" ? `/${name}` : `${tab.currentPath}/${name}`;

    try {
      const res = await fetch(`/api/sftp/mkdir/${tab.sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ path: dirPath }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create directory");
      }

      toast({ title: "Directory Created", description: name });
      await listDirectory(tabId, tab.sessionId, tab.currentPath);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleRename = async (tabId: string, oldPath: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab?.sessionId) return;

    const oldName = oldPath.split("/").pop();
    const newName = prompt("Enter new name:", oldName);
    if (!newName || newName === oldName) return;

    const parentDir = oldPath.substring(0, oldPath.lastIndexOf("/")) || "/";
    const newPath = parentDir === "/" ? `/${newName}` : `${parentDir}/${newName}`;

    try {
      const res = await fetch(`/api/sftp/rename/${tab.sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ oldPath, newPath }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Rename failed");
      }

      toast({ title: "Renamed", description: `${oldName} → ${newName}` });
      await listDirectory(tabId, tab.sessionId, tab.currentPath);
    } catch (err: any) {
      toast({ title: "Rename Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleUpload = async (tabId: string, files: FileList) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab?.sessionId) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const remotePath = tab.currentPath === "/"
        ? `/${file.name}`
        : `${tab.currentPath}/${file.name}`;

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("path", remotePath);

        const res = await fetch(`/api/sftp/upload/${tab.sessionId}`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }

        toast({ title: "Uploaded", description: file.name });
      } catch (err: any) {
        toast({ title: "Upload Failed", description: `${file.name}: ${err.message}`, variant: "destructive" });
      }
    }

    await listDirectory(tabId, tab.sessionId, tab.currentPath);
  };

  const handleCloseTab = async (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (tab?.sessionId) {
      try {
        await fetch(`/api/sftp/disconnect/${tab.sessionId}`, { method: "POST", credentials: "include" });
      } catch {}
    }

    setTabs((prev) => {
      const remaining = prev.filter((t) => t.id !== tabId);
      if (remaining.length === 0) {
        const newTab = createNewTab();
        setActiveTabId(newTab.id);
        return [newTab];
      }
      if (activeTabId === tabId) {
        setActiveTabId(remaining[remaining.length - 1].id);
      }
      return remaining;
    });
  };

  const handleAddTab = () => {
    if (tabs.length >= MAX_TABS) {
      toast({ title: "Tab Limit", description: `Maximum ${MAX_TABS} concurrent SFTP sessions allowed.`, variant: "destructive" });
      return;
    }
    const newTab = createNewTab();
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const connectedCount = tabs.filter((t) => t.connectionState === "connected" || t.connectionState === "connecting").length;

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="p-5 rounded-full bg-orange-500/10">
              <Lock className="h-12 w-12 text-orange-400" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-display font-bold text-white" data-testid="text-sftp-login-required">Sign In Required</h2>
              <p className="text-zinc-400 max-w-md">
                SFTP Client access requires authentication. Please sign in with your STB Cybersecurity account to continue.
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
            <div className="p-5 rounded-full bg-purple-500/10">
              <Crown className="h-12 w-12 text-purple-400" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-display font-bold text-white" data-testid="text-sftp-upgrade-required">Business Subscription Required</h2>
              <p className="text-zinc-400 max-w-md">
                The SFTP Client is available to Business and Enterprise subscribers.
                Upgrade your plan to access secure file transfer tools.
              </p>
            </div>
            <Button className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-semibold" asChild>
              <a href="/support#pricing" data-testid="link-sftp-upgrade">
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
            <h1 className="text-3xl font-display font-bold text-white" data-testid="text-sftp-title">
              SFTP Client
            </h1>
            <p className="text-muted-foreground mt-1">
              Secure file transfer, browse remote filesystems, and manage files
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">
              <Crown className="h-3 w-3 mr-1" /> BIZ
            </Badge>
            {connectedCount > 0 && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                <Wifi className="h-3 w-3 mr-1" /> {connectedCount} ACTIVE
              </Badge>
            )}
          </div>
        </div>

        <TabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onSelectTab={setActiveTabId}
          onCloseTab={handleCloseTab}
          onAddTab={handleAddTab}
        />

        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;

          if (!isActive) return null;

          if (tab.connectionState === "disconnected") {
            return (
              <div key={tab.id} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <Card className="bg-zinc-900/80 border-zinc-800">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-white flex items-center gap-2 text-lg">
                        <FolderSync className="h-5 w-5 text-orange-400" />
                        SFTP Connection
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ConnectionForm
                        onConnect={(config) => handleConnect(tab.id, config)}
                        isConnecting={false}
                      />
                    </CardContent>
                  </Card>
                </div>
                <div className="lg:col-span-2">
                  <Card className="bg-zinc-900/80 border-zinc-800">
                    <CardContent className="py-16">
                      <div className="flex flex-col items-center justify-center text-center space-y-4">
                        <div className="p-4 rounded-full bg-zinc-800/50">
                          <HardDrive className="h-10 w-10 text-zinc-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-zinc-400">No Active Connection</h3>
                        <p className="text-sm text-zinc-600 max-w-md">
                          Connect to a remote server using SFTP to browse files, upload, download, and manage the filesystem securely.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center mt-4">
                          <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <Shield className="h-4 w-4 text-green-500" />
                            <span>Encrypted Transfer</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <Upload className="h-4 w-4 text-orange-500" />
                            <span>Upload & Download</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <Folder className="h-4 w-4 text-purple-500" />
                            <span>Browse Filesystem</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            );
          }

          if (tab.connectionState === "connecting") {
            return (
              <div key={tab.id} className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="relative">
                  <div className="p-4 rounded-full bg-orange-500/10">
                    <FolderSync className="h-10 w-10 text-orange-400" />
                  </div>
                  <Loader2 className="absolute -top-1 -right-1 h-6 w-6 text-orange-500 animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-white">Establishing SFTP Connection…</h3>
                <p className="text-sm text-zinc-400 text-center max-w-md">
                  Authenticating and initializing the SFTP subsystem. This may take a few seconds.
                </p>
              </div>
            );
          }

          if (tab.connectionState === "error") {
            return (
              <div key={tab.id} className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="p-4 rounded-full bg-red-500/10">
                  <WifiOff className="h-10 w-10 text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Connection Failed</h3>
                <p className="text-sm text-zinc-400 text-center max-w-md">
                  {tab.errorMessage || "Unable to establish an SFTP connection. Verify the target is reachable and credentials are correct."}
                </p>
                <Button
                  onClick={() => handleDisconnect(tab.id)}
                  variant="outline"
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  data-testid="button-sftp-retry"
                >
                  <RefreshCw className="h-4 w-4 mr-2" /> Try Again
                </Button>
              </div>
            );
          }

          return (
            <div key={tab.id}>
              <FileBrowser
                tab={tab}
                onNavigate={(path) => handleNavigate(tab.id, path)}
                onDownload={(path) => handleDownload(tab.id, path)}
                onDelete={(path, isDir) => handleDelete(tab.id, path, isDir)}
                onMkdir={() => handleMkdir(tab.id)}
                onRename={(path) => handleRename(tab.id, path)}
                onUpload={(files) => handleUpload(tab.id, files)}
                onRefresh={() => tab.sessionId && listDirectory(tab.id, tab.sessionId, tab.currentPath)}
                onDisconnect={() => handleDisconnect(tab.id)}
                onToggleSelect={(name) => {
                  const newSelected = new Set(tab.selectedFiles);
                  if (newSelected.has(name)) newSelected.delete(name);
                  else newSelected.add(name);
                  updateTab(tab.id, { selectedFiles: newSelected });
                }}
              />
            </div>
          );
        })}
      </div>
      <Footer />
    </Layout>
  );
}
