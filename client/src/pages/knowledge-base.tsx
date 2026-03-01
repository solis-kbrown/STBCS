import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useDocumentTitle } from "@/lib/use-document-title";
import {
  BookOpen, Search, Plus, ChevronUp, MessageSquare,
  Shield, Bug, Lightbulb, AlertTriangle, FileText,
  Crown, Star, Award, TrendingUp, Pin, Clock,
  Filter, ChevronLeft, ChevronRight, Users, Sparkles
} from "lucide-react";

const POST_TYPES = [
  { value: "", label: "All Posts", icon: BookOpen },
  { value: "official_kb", label: "Official KB", icon: Shield },
  { value: "threat_intel", label: "Threat Intel", icon: AlertTriangle },
  { value: "bug_report", label: "Bug Reports", icon: Bug },
  { value: "feature_request", label: "Feature Requests", icon: Lightbulb },
  { value: "general_idea", label: "General Ideas", icon: Sparkles },
];

function TierBadge({ tier, isTrusted, isAdmin }: { tier: string | null; isTrusted: boolean | null; isAdmin: boolean | null }) {
  if (isAdmin) return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]"><Crown className="h-3 w-3 mr-1" />STB Admin</Badge>;
  if (isTrusted) return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]"><Award className="h-3 w-3 mr-1" />Trusted</Badge>;
  if (tier === "business" || tier === "enterprise" || tier === "unlimited") return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px]"><Star className="h-3 w-3 mr-1" />Business</Badge>;
  if (tier && tier !== "free") return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-[10px]">Member</Badge>;
  return null;
}

function TypeBadge({ type }: { type: string }) {
  const config: Record<string, { label: string; className: string }> = {
    official_kb: { label: "Official KB", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    threat_intel: { label: "Threat Intel", className: "bg-red-500/20 text-red-400 border-red-500/30" },
    bug_report: { label: "Bug Report", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    feature_request: { label: "Feature Request", className: "bg-green-500/20 text-green-400 border-green-500/30" },
    general_idea: { label: "Idea", className: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30" },
  };
  const c = config[type] || config.general_idea;
  return <Badge className={`${c.className} text-[10px]`}>{c.label}</Badge>;
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function KnowledgeBase() {
  useDocumentTitle("Knowledge Base | STB Cybersecurity");
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [activeType, setActiveType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["/api/kb/posts", activeType, searchQuery, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeType) params.set("type", activeType);
      if (searchQuery) params.set("search", searchQuery);
      params.set("page", String(page));
      params.set("limit", "20");
      const res = await fetch(`/api/kb/posts?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: leaderboard } = useQuery({
    queryKey: ["/api/kb/leaderboard"],
    queryFn: async () => {
      const res = await fetch("/api/kb/leaderboard");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const handleSearch = () => {
    setSearchQuery(searchInput.trim());
    setPage(1);
  };

  const isPaid = isAuthenticated && user?.tier !== "free";

  return (
    <Layout>
      <div className="min-h-screen">
        <div className="relative overflow-hidden border-b border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900 to-orange-950/20">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-red-500/20 rounded-full blur-3xl" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                <BookOpen className="h-8 w-8 text-orange-400" />
              </div>
              <div>
                <h1 className="text-3xl font-display font-bold text-white tracking-wide" data-testid="text-kb-title">Knowledge Base</h1>
                <p className="text-zinc-400 text-sm mt-1">Community-driven cybersecurity intelligence hub</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <div className="flex-1 min-w-[250px] max-w-md relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  data-testid="input-kb-search"
                  placeholder="Search articles, PoCs, threat intel..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>
              <Button onClick={handleSearch} variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" data-testid="button-kb-search">
                <Search className="h-4 w-4 mr-2" />Search
              </Button>
              {isPaid && (
                <Button onClick={() => setLocation("/knowledge-base/new")} className="bg-orange-500 hover:bg-orange-600 text-white" data-testid="button-kb-new-post">
                  <Plus className="h-4 w-4 mr-2" />New Post
                </Button>
              )}
              {user?.isAdmin && (
                <Button onClick={() => setLocation("/knowledge-base/admin")} variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10" data-testid="button-kb-admin">
                  <Shield className="h-4 w-4 mr-2" />Admin
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-wrap gap-2 mb-8">
            {POST_TYPES.map((t) => {
              const Icon = t.icon;
              const isActive = activeType === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => { setActiveType(t.value); setPage(1); }}
                  data-testid={`button-filter-${t.value || "all"}`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-orange-500/15 text-orange-400 border border-orange-500/30"
                      : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-800 hover:text-zinc-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />{t.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 animate-pulse">
                      <div className="h-5 bg-zinc-800 rounded w-3/4 mb-3" />
                      <div className="h-4 bg-zinc-800 rounded w-1/2 mb-2" />
                      <div className="h-3 bg-zinc-800 rounded w-1/4" />
                    </div>
                  ))}
                </div>
              ) : data?.posts?.length === 0 ? (
                <div className="text-center py-16 rounded-xl border border-zinc-800 bg-zinc-900/50">
                  <BookOpen className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-zinc-400">No posts found</h3>
                  <p className="text-zinc-500 text-sm mt-2">
                    {searchQuery ? "Try a different search term" : "Be the first to contribute!"}
                  </p>
                </div>
              ) : (
                data?.posts?.map((post: any) => (
                  <Link key={post.id} href={`/knowledge-base/${post.slug}`}>
                    <div
                      data-testid={`card-post-${post.id}`}
                      className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 hover:border-orange-500/30 hover:bg-zinc-900/80 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center gap-1 pt-1 min-w-[48px]">
                          <ChevronUp className="h-5 w-5 text-zinc-600 group-hover:text-orange-400 transition-colors" />
                          <span className="text-sm font-bold text-zinc-300" data-testid={`text-votes-${post.id}`}>{post.voteCount || 0}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {post.isPinned && <Pin className="h-3.5 w-3.5 text-orange-400" />}
                            <TypeBadge type={post.type} />
                            {post.tags?.map((tag: string) => (
                              <Badge key={tag} variant="outline" className="text-[10px] border-zinc-700 text-zinc-500">{tag}</Badge>
                            ))}
                          </div>
                          <h3 className="text-lg font-semibold text-white group-hover:text-orange-400 transition-colors truncate" data-testid={`text-title-${post.id}`}>
                            {post.title}
                          </h3>
                          <p className="text-sm text-zinc-500 mt-1 line-clamp-2">
                            {post.content?.replace(/[#*`>\-\[\]()!]/g, "").slice(0, 200)}
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
                            <span className="flex items-center gap-1">
                              {post.author?.username || "Unknown"}
                              {post.author && <TierBadge tier={post.author.tier} isTrusted={post.author.isTrusted} isAdmin={post.author.isAdmin} />}
                            </span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(post.createdAt)}</span>
                            <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{post.commentCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}

              {data && data.pages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="border-zinc-700 text-zinc-400"
                    data-testid="button-prev-page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-zinc-400">Page {page} of {data.pages}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(data.pages, p + 1))}
                    disabled={page >= data.pages}
                    className="border-zinc-700 text-zinc-400"
                    data-testid="button-next-page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
                  <TrendingUp className="h-4 w-4 text-orange-400" />Top Contributors
                </h3>
                {leaderboard?.length === 0 && <p className="text-xs text-zinc-500">No contributors yet</p>}
                <div className="space-y-3">
                  {leaderboard?.slice(0, 10).map((u: any, i: number) => (
                    <div key={u.userId} className="flex items-center gap-3" data-testid={`leaderboard-user-${i}`}>
                      <span className="text-xs font-bold text-zinc-600 w-5">#{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-300 truncate">{u.username}</p>
                        <div className="flex items-center gap-1">
                          <TierBadge tier={u.tier} isTrusted={u.isTrusted} isAdmin={u.isAdmin} />
                        </div>
                      </div>
                      <span className="text-xs font-bold text-orange-400">{u.reputation} pts</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-orange-400" />How It Works
                </h3>
                <div className="space-y-2 text-xs text-zinc-400">
                  <p><strong className="text-zinc-300">Free:</strong> Read official articles</p>
                  <p><strong className="text-zinc-300">Paid Members:</strong> Post, comment, vote (moderated)</p>
                  <p><strong className="text-zinc-300">Trusted:</strong> Posts go live instantly</p>
                  <p><strong className="text-zinc-300">Earn Trust:</strong> Get 50+ upvotes to auto-promote</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
