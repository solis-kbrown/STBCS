import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDocumentTitle } from "@/lib/use-document-title";
import { useAuth } from "@/lib/auth";
import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ScrollText,
  Search,
  Lock,
  Crown,
  Loader2,
  FileText,
  Code,
  Globe,
  Calendar,
  ExternalLink,
  Copy,
  ChevronLeft,
  ChevronRight,
  Database,
  Users,
  FolderOpen,
  X,
  Shield,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface RansomNote {
  id: string;
  groupName: string;
  familyName: string | null;
  title: string;
  content: string;
  fileFormat: string | null;
  fileExtensions: string | null;
  language: string | null;
  source: string;
  sourceUrl: string | null;
  discoveredAt: string | null;
  createdAt: string | null;
}

interface NoteStats {
  totalNotes: number;
  familiesCovered: number;
  sourcesUsed: number;
  latestAddedAt: string | null;
}

interface GroupEntry {
  group: string;
  count: number;
}

const FORMAT_COLORS: Record<string, string> = {
  txt: "bg-zinc-700 text-zinc-300",
  html: "bg-orange-900/40 text-orange-400",
  hta: "bg-red-900/40 text-red-400",
  rtf: "bg-blue-900/40 text-blue-400",
  markdown: "bg-purple-900/40 text-purple-400",
};

const FORMAT_ICONS: Record<string, typeof FileText> = {
  txt: FileText,
  html: Code,
  hta: Shield,
  rtf: FileText,
  markdown: FileText,
};

function UpgradeGate() {
  return (
    <Layout>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-lg w-full border-zinc-800 bg-zinc-900/80">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Pro+ Feature</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                The Ransom Note Intelligence Library is available to Pro, Business, and Enterprise subscribers.
                Upgrade your plan to access our curated collection of real-world ransom notes for threat analysis and training.
              </p>
            </div>
            <Button
              data-testid="button-upgrade-plan"
              className="bg-amber-600 hover:bg-amber-500 text-white font-semibold"
              onClick={() => window.location.href = "/pricing"}
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade Plan
            </Button>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </Layout>
  );
}

function NoteDetailModal({ note, open, onClose }: { note: RansomNote | null; open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  if (!note) return null;

  const FormatIcon = FORMAT_ICONS[note.fileFormat || "txt"] || FileText;

  const copyContent = () => {
    navigator.clipboard.writeText(note.content);
    toast({ title: "Copied", description: "Note content copied to clipboard" });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-zinc-900 border-zinc-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white" data-testid="text-note-detail-title">
            <FormatIcon className="w-5 h-5 text-red-400" />
            {note.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-red-800 text-red-400" data-testid="badge-note-group">
              {note.groupName}
            </Badge>
            {note.familyName && (
              <Badge variant="outline" className="border-zinc-700 text-zinc-400" data-testid="badge-note-family">
                {note.familyName}
              </Badge>
            )}
            <Badge className={FORMAT_COLORS[note.fileFormat || "txt"]} data-testid="badge-note-format">
              {(note.fileFormat || "txt").toUpperCase()}
            </Badge>
            {note.language && note.language !== "en" && (
              <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                <Globe className="w-3 h-3 mr-1" />
                {note.language}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-zinc-500">
              <span className="text-zinc-400 font-medium">Source:</span> {note.source}
            </div>
            {note.discoveredAt && (
              <div className="text-zinc-500">
                <Calendar className="w-3 h-3 inline mr-1" />
                {format(new Date(note.discoveredAt), "MMM d, yyyy")}
              </div>
            )}
          </div>

          <div className="relative">
            <div className="absolute top-2 right-2 flex gap-1 z-10">
              <Button size="sm" variant="ghost" onClick={copyContent} className="h-7 px-2 text-zinc-400 hover:text-white" data-testid="button-copy-note">
                <Copy className="w-3.5 h-3.5" />
              </Button>
              {note.sourceUrl && (
                <Button size="sm" variant="ghost" asChild className="h-7 px-2 text-zinc-400 hover:text-white" data-testid="link-source-url">
                  <a href={note.sourceUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </Button>
              )}
            </div>
            <pre
              className="bg-black/60 border border-zinc-800 rounded-lg p-4 pt-10 text-sm text-zinc-300 font-mono whitespace-pre-wrap break-words max-h-[400px] overflow-y-auto"
              data-testid="text-note-content"
            >
              {note.content}
            </pre>
          </div>

          {note.fileExtensions && (
            <div className="text-sm text-zinc-500">
              <span className="text-zinc-400 font-medium">Encrypted extensions:</span> {note.fileExtensions}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function RansomNotesLibrary() {
  useDocumentTitle("Ransom Note Intelligence Library | STBCS");
  const { isAuthenticated, isPro } = useAuth();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedFormat, setSelectedFormat] = useState<string>("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(0);
  const [selectedNote, setSelectedNote] = useState<RansomNote | null>(null);
  const pageSize = 24;

  if (!isAuthenticated || !isPro) {
    return <UpgradeGate />;
  }

  let searchTimeout: ReturnType<typeof setTimeout>;
  const handleSearch = (value: string) => {
    setSearch(value);
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(0);
    }, 400);
  };

  const { data: stats } = useQuery<NoteStats>({
    queryKey: ["/api/ransom-notes/stats"],
  });

  const { data: groups } = useQuery<GroupEntry[]>({
    queryKey: ["/api/ransom-notes/groups"],
  });

  const { data: notesData, isLoading } = useQuery<{ notes: RansomNote[]; total: number }>({
    queryKey: ["/api/ransom-notes", { search: debouncedSearch, group: selectedGroup === "all" ? "" : selectedGroup, format: selectedFormat === "all" ? "" : selectedFormat, sort: sortBy, limit: pageSize, offset: page * pageSize }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("limit", String(pageSize));
      params.set("offset", String(page * pageSize));
      params.set("sort", sortBy);
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (selectedGroup !== "all") params.set("group", selectedGroup);
      if (selectedFormat !== "all") params.set("format", selectedFormat);
      const res = await fetch(`/api/ransom-notes?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const totalPages = Math.ceil((notesData?.total || 0) / pageSize);

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-600/20 flex items-center justify-center">
                <ScrollText className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight" data-testid="text-page-title">
                  Ransom Note Intelligence Library
                </h1>
                <p className="text-sm text-zinc-500">Curated collection of real-world ransom notes for threat analysis</p>
              </div>
            </div>
            <Badge variant="outline" className="border-amber-700 text-amber-400 text-xs">
              <Crown className="w-3 h-3 mr-1" />
              PRO+
            </Badge>
          </div>

          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card className="bg-zinc-900/60 border-zinc-800">
                <CardContent className="p-4 flex items-center gap-3">
                  <Database className="w-5 h-5 text-red-400 shrink-0" />
                  <div>
                    <p className="text-xl font-bold text-white" data-testid="text-stat-total">{stats.totalNotes.toLocaleString()}</p>
                    <p className="text-xs text-zinc-500">Total Notes</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/60 border-zinc-800">
                <CardContent className="p-4 flex items-center gap-3">
                  <Users className="w-5 h-5 text-orange-400 shrink-0" />
                  <div>
                    <p className="text-xl font-bold text-white" data-testid="text-stat-families">{stats.familiesCovered}</p>
                    <p className="text-xs text-zinc-500">Families</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/60 border-zinc-800">
                <CardContent className="p-4 flex items-center gap-3">
                  <FolderOpen className="w-5 h-5 text-blue-400 shrink-0" />
                  <div>
                    <p className="text-xl font-bold text-white" data-testid="text-stat-sources">{stats.sourcesUsed}</p>
                    <p className="text-xs text-zinc-500">Sources</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900/60 border-zinc-800">
                <CardContent className="p-4 flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-green-400 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-white" data-testid="text-stat-latest">
                      {stats.latestAddedAt ? format(new Date(stats.latestAddedAt), "MMM d") : "—"}
                    </p>
                    <p className="text-xs text-zinc-500">Latest</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                data-testid="input-search-notes"
                placeholder="Search by group, family, content, or keyword..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
              />
              {search && (
                <button onClick={() => { setSearch(""); setDebouncedSearch(""); setPage(0); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <Select value={selectedGroup} onValueChange={(v) => { setSelectedGroup(v); setPage(0); }}>
              <SelectTrigger className="w-[180px] bg-zinc-900 border-zinc-700 text-white" data-testid="select-group-filter">
                <SelectValue placeholder="All Groups" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700 max-h-64">
                <SelectItem value="all">All Groups</SelectItem>
                {groups?.slice(0, 50).map((g) => (
                  <SelectItem key={g.group} value={g.group}>
                    {g.group} ({g.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedFormat} onValueChange={(v) => { setSelectedFormat(v); setPage(0); }}>
              <SelectTrigger className="w-[140px] bg-zinc-900 border-zinc-700 text-white" data-testid="select-format-filter">
                <SelectValue placeholder="All Formats" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                <SelectItem value="all">All Formats</SelectItem>
                <SelectItem value="txt">TXT</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="hta">HTA</SelectItem>
                <SelectItem value="rtf">RTF</SelectItem>
                <SelectItem value="markdown">Markdown</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(0); }}>
              <SelectTrigger className="w-[140px] bg-zinc-900 border-zinc-700 text-white" data-testid="select-sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="group">By Group</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-red-400" />
            </div>
          ) : notesData?.notes.length === 0 ? (
            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardContent className="py-16 text-center">
                <ScrollText className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-zinc-400">No ransom notes found</h3>
                <p className="text-sm text-zinc-500 mt-1">
                  {debouncedSearch ? "Try adjusting your search or filters" : "Notes will appear here after the next scraper run"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm text-zinc-500">
                <span data-testid="text-results-count">
                  Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, notesData?.total || 0)} of {notesData?.total?.toLocaleString()} results
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {notesData?.notes.map((note) => {
                  const FormatIcon = FORMAT_ICONS[note.fileFormat || "txt"] || FileText;
                  return (
                    <Card
                      key={note.id}
                      data-testid={`card-note-${note.id}`}
                      className="bg-zinc-900/60 border-zinc-800 hover:border-red-800/50 transition-colors cursor-pointer group"
                      onClick={() => setSelectedNote(note)}
                    >
                      <CardHeader className="pb-2 pt-4 px-4">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-sm font-medium text-zinc-200 truncate group-hover:text-red-400 transition-colors flex items-center gap-1.5">
                            <FormatIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                            {note.title}
                          </CardTitle>
                          <Badge className={`text-[10px] px-1.5 py-0 shrink-0 ${FORMAT_COLORS[note.fileFormat || "txt"]}`}>
                            {(note.fileFormat || "txt").toUpperCase()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="px-4 pb-4 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="border-red-900/50 text-red-400 text-[10px]" data-testid={`badge-group-${note.id}`}>
                            {note.groupName}
                          </Badge>
                          {note.familyName && (
                            <Badge variant="outline" className="border-zinc-700 text-zinc-500 text-[10px]">
                              {note.familyName}
                            </Badge>
                          )}
                        </div>
                        <pre className="text-xs text-zinc-500 font-mono line-clamp-3 whitespace-pre-wrap break-words leading-relaxed">
                          {note.content.substring(0, 200)}
                        </pre>
                        <div className="flex items-center justify-between text-[10px] text-zinc-600 pt-1">
                          <span>{note.source}</span>
                          {note.discoveredAt && (
                            <span>{format(new Date(note.discoveredAt), "MMM d, yyyy")}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 py-4">
                  <Button
                    data-testid="button-prev-page"
                    variant="outline"
                    size="sm"
                    disabled={page === 0}
                    onClick={() => setPage(p => p - 1)}
                    className="border-zinc-700 text-zinc-400"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-zinc-400 px-3" data-testid="text-page-number">
                    Page {page + 1} of {totalPages}
                  </span>
                  <Button
                    data-testid="button-next-page"
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(p => p + 1)}
                    className="border-zinc-700 text-zinc-400"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        <NoteDetailModal note={selectedNote} open={!!selectedNote} onClose={() => setSelectedNote(null)} />
      </div>
      <Footer />
    </Layout>
  );
}
