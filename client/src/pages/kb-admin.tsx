import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useDocumentTitle } from "@/lib/use-document-title";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import {
  Shield, Check, X, ArrowLeft, Clock, Eye,
  Crown, Award, Star, ChevronUp, ChevronDown,
  Users, FileText, AlertTriangle, BookOpen, Flag, MessageSquare
} from "lucide-react";

function TierBadge({ tier, isTrusted, isAdmin }: { tier: string | null; isTrusted: boolean | null; isAdmin: boolean | null }) {
  if (isAdmin) return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]"><Crown className="h-3 w-3 mr-1" />Admin</Badge>;
  if (isTrusted) return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]"><Award className="h-3 w-3 mr-1" />Trusted</Badge>;
  if (tier === "business" || tier === "enterprise" || tier === "unlimited") return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px]"><Star className="h-3 w-3 mr-1" />Business</Badge>;
  if (tier && tier !== "free") return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-[10px]">Member</Badge>;
  return null;
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function KbAdmin() {
  useDocumentTitle("KB Admin | STB Cybersecurity");
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"pending" | "users" | "reports">("pending");

  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ["/api/kb/admin/reports"],
    queryFn: async () => {
      const res = await fetch("/api/kb/admin/reports", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: tab === "reports",
  });

  const reviewReportMutation = useMutation({
    mutationFn: async ({ reportId, status, adminNotes }: { reportId: number; status: string; adminNotes?: string }) => {
      const res = await fetch(`/api/kb/admin/reports/${reportId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status, adminNotes }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kb/admin/reports"] });
      toast({ title: "Report updated" });
    },
  });

  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ["/api/kb/admin/pending"],
    queryFn: async () => {
      const res = await fetch("/api/kb/admin/pending", { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: tab === "pending",
  });

  const { data: leaderboard } = useQuery({
    queryKey: ["/api/kb/leaderboard"],
    queryFn: async () => {
      const res = await fetch("/api/kb/leaderboard");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: tab === "users",
  });

  const approveMutation = useMutation({
    mutationFn: async (postId: number) => {
      const res = await fetch(`/api/kb/admin/posts/${postId}/approve`, { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kb/admin/pending"] });
      toast({ title: "Post approved and published" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (postId: number) => {
      const res = await fetch(`/api/kb/admin/posts/${postId}/reject`, { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kb/admin/pending"] });
      toast({ title: "Post rejected" });
    },
  });

  const promoteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/kb/admin/users/${userId}/promote`, { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kb/leaderboard"] });
      toast({ title: "User promoted to Trusted Contributor" });
    },
  });

  const demoteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/kb/admin/users/${userId}/demote`, { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kb/leaderboard"] });
      toast({ title: "User demoted from Trusted status" });
    },
  });

  if (!user?.isAdmin) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <Shield className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Admin Access Required</h2>
          <Link href="/knowledge-base"><Button variant="outline" className="border-zinc-700 text-zinc-400">Back to KB</Button></Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => setLocation("/knowledge-base")} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-orange-400 transition-colors mb-6" data-testid="button-back">
          <ArrowLeft className="h-4 w-4" />Back to Knowledge Base
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <Shield className="h-6 w-6 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">KB Administration</h1>
            <p className="text-sm text-zinc-400">Manage posts, users, and moderation</p>
          </div>
        </div>

        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setTab("pending")}
            data-testid="tab-pending"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "pending" ? "bg-orange-500/15 text-orange-400 border border-orange-500/30" : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50"
            }`}
          >
            <Clock className="h-4 w-4" />Pending Review
            {pendingData?.total > 0 && <Badge className="bg-red-500/20 text-red-400 text-[10px] ml-1">{pendingData.total}</Badge>}
          </button>
          <button
            onClick={() => setTab("users")}
            data-testid="tab-users"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "users" ? "bg-orange-500/15 text-orange-400 border border-orange-500/30" : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50"
            }`}
          >
            <Users className="h-4 w-4" />User Management
          </button>
          <button
            onClick={() => setTab("reports")}
            data-testid="tab-reports"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "reports" ? "bg-orange-500/15 text-orange-400 border border-orange-500/30" : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50"
            }`}
          >
            <Flag className="h-4 w-4" />Reports
            {reportsData?.reports?.filter((r: any) => r.status === "pending").length > 0 && (
              <Badge className="bg-red-500/20 text-red-400 text-[10px] ml-1">{reportsData.reports.filter((r: any) => r.status === "pending").length}</Badge>
            )}
          </button>
        </div>

        {tab === "pending" && (
          <div className="space-y-4">
            {pendingLoading ? (
              <div className="space-y-4">{[1, 2, 3].map(i => (
                <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 animate-pulse">
                  <div className="h-5 bg-zinc-800 rounded w-2/3 mb-3" />
                  <div className="h-4 bg-zinc-800 rounded w-1/3" />
                </div>
              ))}</div>
            ) : pendingData?.posts?.length === 0 ? (
              <div className="text-center py-16 rounded-xl border border-zinc-800 bg-zinc-900/50">
                <Check className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-zinc-300">All caught up!</h3>
                <p className="text-zinc-500 text-sm mt-2">No posts pending review</p>
              </div>
            ) : (
              pendingData?.posts?.map((post: any) => (
                <div key={post.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6" data-testid={`pending-post-${post.id}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px]">{post.type}</Badge>
                        {post.tags?.map((t: string) => <Badge key={t} variant="outline" className="text-[10px] border-zinc-700 text-zinc-500">{t}</Badge>)}
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-1">{post.title}</h3>
                      <p className="text-sm text-zinc-500 line-clamp-2">{post.content?.replace(/[#*`>\-\[\]()!]/g, "").slice(0, 200)}</p>
                      <div className="flex items-center gap-3 mt-3 text-xs text-zinc-500">
                        <span>By <strong className="text-zinc-300">{post.author?.username || "Unknown"}</strong></span>
                        {post.author && <TierBadge tier={post.author.tier} isTrusted={post.author.isTrusted} isAdmin={post.author.isAdmin} />}
                        <span>{timeAgo(post.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link href={`/knowledge-base/${post.slug}`}>
                        <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-400" data-testid={`button-preview-${post.id}`}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        onClick={() => approveMutation.mutate(post.id)}
                        disabled={approveMutation.isPending}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        data-testid={`button-approve-${post.id}`}
                      >
                        <Check className="h-4 w-4 mr-1" />Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => rejectMutation.mutate(post.id)}
                        disabled={rejectMutation.isPending}
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        data-testid={`button-reject-${post.id}`}
                      >
                        <X className="h-4 w-4 mr-1" />Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "users" && (
          <div className="space-y-4">
            {leaderboard?.length === 0 ? (
              <div className="text-center py-16 rounded-xl border border-zinc-800 bg-zinc-900/50">
                <Users className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-zinc-400">No contributors yet</h3>
              </div>
            ) : (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800 text-left">
                      <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase">User</th>
                      <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase">Reputation</th>
                      <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-xs font-medium text-zinc-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard?.map((u: any) => (
                      <tr key={u.userId} className="border-b border-zinc-800/50 hover:bg-zinc-800/30" data-testid={`user-row-${u.userId}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-zinc-300">{u.username}</span>
                            <TierBadge tier={u.tier} isTrusted={u.isTrusted} isAdmin={u.isAdmin} />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-orange-400">{u.reputation} pts</span>
                        </td>
                        <td className="px-6 py-4">
                          {u.isTrusted ? (
                            <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px]">Trusted</Badge>
                          ) : (
                            <Badge className="bg-zinc-700/50 text-zinc-400 text-[10px]">Standard</Badge>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {!u.isAdmin && (
                            u.isTrusted ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => demoteMutation.mutate(u.userId)}
                                disabled={demoteMutation.isPending}
                                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                data-testid={`button-demote-${u.userId}`}
                              >
                                <ChevronDown className="h-4 w-4 mr-1" />Demote
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => promoteMutation.mutate(u.userId)}
                                disabled={promoteMutation.isPending}
                                className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                                data-testid={`button-promote-${u.userId}`}
                              >
                                <ChevronUp className="h-4 w-4 mr-1" />Promote
                              </Button>
                            )
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "reports" && (
          <div className="space-y-4">
            {reportsLoading ? (
              <div className="space-y-4">{[1, 2, 3].map(i => (
                <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 animate-pulse">
                  <div className="h-5 bg-zinc-800 rounded w-2/3 mb-3" />
                  <div className="h-4 bg-zinc-800 rounded w-1/3" />
                </div>
              ))}</div>
            ) : !reportsData?.reports?.length ? (
              <div className="text-center py-16 rounded-xl border border-zinc-800 bg-zinc-900/50">
                <Check className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-zinc-300">No reports</h3>
                <p className="text-zinc-500 text-sm mt-2">No content has been reported</p>
              </div>
            ) : (
              reportsData.reports.map((report: any) => (
                <div key={report.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6" data-testid={`report-${report.id}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`text-[10px] ${
                          report.status === "pending" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                          report.status === "reviewed" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                          "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
                        }`}>
                          {report.status}
                        </Badge>
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]">
                          {report.reason?.replace("_", " ")}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-500">
                          {report.postId ? "Post" : "Comment"}
                        </Badge>
                      </div>
                      {report.details && <p className="text-sm text-zinc-400 mb-2">{report.details}</p>}
                      <div className="text-xs text-zinc-500 space-y-1">
                        <p>Reported by: <strong className="text-zinc-300">{report.reporter?.username || "Unknown"}</strong> · {timeAgo(report.createdAt)}</p>
                        {report.post && <p>Post: <Link href={`/knowledge-base/${report.post.slug}`} className="text-orange-400 hover:underline">{report.post.title}</Link></p>}
                        {report.comment && <p>Comment: <span className="text-zinc-300 italic">"{report.comment.content?.slice(0, 100)}{report.comment.content?.length > 100 ? "..." : ""}"</span></p>}
                      </div>
                    </div>
                    {report.status === "pending" && (
                      <div className="flex gap-2 shrink-0">
                        <Button
                          size="sm"
                          onClick={() => reviewReportMutation.mutate({ reportId: report.id, status: "reviewed", adminNotes: "Action taken" })}
                          disabled={reviewReportMutation.isPending}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          data-testid={`button-review-${report.id}`}
                        >
                          <Check className="h-4 w-4 mr-1" />Review
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => reviewReportMutation.mutate({ reportId: report.id, status: "dismissed" })}
                          disabled={reviewReportMutation.isPending}
                          className="border-zinc-700 text-zinc-400"
                          data-testid={`button-dismiss-${report.id}`}
                        >
                          <X className="h-4 w-4 mr-1" />Dismiss
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
