import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation, Link } from "wouter";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import { useDocumentTitle } from "@/lib/use-document-title";
import { useToast } from "@/hooks/use-toast";
import { renderMarkdown, highlightCodeBlocks } from "@/lib/render-markdown";
import {
  ChevronUp, ChevronDown, MessageSquare, Clock, Edit, Trash2, ArrowLeft,
  Crown, Star, Award, Shield, Pin, Reply, Send, BookOpen,
  Eye, Bookmark, BookmarkCheck, ArrowUpDown, Tag, Link2, Sparkles, List,
  Share2, Linkedin, Mail, Flag, X, AlertTriangle, Check, QrCode, Download, FileCode
} from "lucide-react";
import { KBIcon } from "@/components/branded-icons";
import UserAvatar from "@/components/user-avatar";
import QRCode from "qrcode";

function TierBadge({ tier, isTrusted, isAdmin }: { tier: string | null; isTrusted: boolean | null; isAdmin: boolean | null }) {
  if (isAdmin) return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]"><Crown className="h-3 w-3 mr-1" />Admin</Badge>;
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
  return <Badge className={`${c.className} text-xs`}>{c.label}</Badge>;
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

function generateSlug(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

function calculateReadingTime(content: string): number {
  const stripped = content
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]+`/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#*_~>\-|]/g, "")
    .replace(/\n+/g, " ")
    .trim();
  const wordCount = stripped.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

function extractHeadings(content: string): { level: number; text: string; slug: string }[] {
  const headings: { level: number; text: string; slug: string }[] = [];
  const slugCounts: Record<string, number> = {};
  const lines = content.split("\n");
  let inCodeBlock = false;
  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      let slug = generateSlug(match[2].trim());
      if (slugCounts[slug] !== undefined) {
        slugCounts[slug]++;
        slug = `${slug}-${slugCounts[slug]}`;
      } else {
        slugCounts[slug] = 0;
      }
      headings.push({
        level: match[1].length,
        text: match[2].trim(),
        slug,
      });
    }
  }
  return headings;
}


const COMMENT_SORTS = [
  { value: "oldest", label: "Oldest First" },
  { value: "newest", label: "Newest First" },
  { value: "best", label: "Best" },
];

function ReportDialog({ type, targetId, postId, onClose }: { type: "post" | "comment"; targetId: number; postId: number; onClose: () => void }) {
  const { toast } = useToast();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason) { toast({ title: "Please select a reason", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      const body: any = { reason, details: details.trim() || undefined };
      if (type === "post") body.postId = targetId;
      else body.commentId = targetId;
      const res = await fetch("/api/kb/report", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      toast({ title: "Report submitted", description: "We'll review this content shortly." });
      onClose();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2"><Flag className="h-5 w-5 text-red-400" />Report {type === "post" ? "Post" : "Comment"}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300" data-testid="button-close-report"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-300 mb-2 block">Reason</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "spam", label: "Spam" },
                { value: "harassment", label: "Harassment" },
                { value: "misinformation", label: "Misinformation" },
                { value: "off_topic", label: "Off Topic" },
                { value: "other", label: "Other" },
              ].map((r) => (
                <button
                  key={r.value}
                  onClick={() => setReason(r.value)}
                  data-testid={`button-report-reason-${r.value}`}
                  className={`px-3 py-2 rounded-lg text-sm border transition-all ${
                    reason === r.value
                      ? "bg-red-500/15 text-red-400 border-red-500/30"
                      : "bg-zinc-800/50 text-zinc-400 border-zinc-700/50 hover:border-zinc-600"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-300 mb-2 block">Details (optional)</label>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide additional context..."
              className="bg-zinc-800 border-zinc-700 text-zinc-300 min-h-[80px]"
              data-testid="input-report-details"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className="border-zinc-700 text-zinc-400">Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting || !reason} className="bg-red-600 hover:bg-red-700 text-white" data-testid="button-submit-report">
              {submitting ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Comment({ comment, depth, postId, user, onReply, topContributorSet, risingStarSet }: { comment: any; depth: number; postId: number; user: any; onReply: (parentId: number) => void; topContributorSet: Set<string>; risingStarSet: Set<string> }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [showReport, setShowReport] = useState(false);

  const voteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/kb/comments/${comment.id}/vote`, { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/kb/comments", postId] }); },
    onError: (err: Error) => { toast({ title: "Error", description: err.message, variant: "destructive" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/kb/comments/${comment.id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kb/comments", postId] });
      toast({ title: "Comment deleted" });
    },
  });

  const editMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/kb/comments/${comment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: editText.trim() }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed"); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kb/comments", postId] });
      setIsEditing(false);
      toast({ title: "Comment updated" });
    },
    onError: (err: Error) => { toast({ title: "Error", description: err.message, variant: "destructive" }); },
  });

  const isPaid = user && user.tier !== "free";
  const isAuthor = user?.id === comment.authorId;
  const editWindowMs = 30 * 60 * 1000;
  const canEdit = isAuthor && (Date.now() - new Date(comment.createdAt).getTime()) < editWindowMs;
  const wasEdited = comment.updatedAt && comment.updatedAt !== comment.createdAt;

  return (
    <div className={`${depth > 0 ? "ml-6 border-l-2 border-zinc-800 pl-4" : ""}`} data-testid={`comment-${comment.id}`}>
      <div className="py-3">
        <div className="flex items-center gap-2 mb-2">
          <UserAvatar avatarUrl={comment.author?.avatarUrl} username={comment.author?.username} size="sm" />
          <Link href={`/user/${comment.author?.username}`}><span className="text-sm font-medium text-zinc-300 hover:text-orange-400 transition-colors cursor-pointer">{comment.author?.username || "Unknown"}</span></Link>
          {comment.author && <TierBadge tier={comment.author.tier} isTrusted={comment.author.isTrusted} isAdmin={comment.author.isAdmin} />}
          {comment.author?.username && topContributorSet.has(comment.author.username) && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-orange-500/15 text-orange-400 text-[10px] font-medium" title="Top Contributor">
              <Crown className="h-2.5 w-2.5" />Top
            </span>
          )}
          {comment.author?.username && !topContributorSet.has(comment.author.username) && risingStarSet.has(comment.author.username) && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-medium" title="Rising Star">
              <Sparkles className="h-2.5 w-2.5" />Rising
            </span>
          )}
          <span className="text-xs text-zinc-600">·</span>
          <span className="text-xs text-zinc-500">{timeAgo(comment.createdAt)}</span>
          {wasEdited && <span className="text-xs text-zinc-600 italic" data-testid={`text-edited-${comment.id}`}>(edited)</span>}
        </div>
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-300 min-h-[60px] text-sm"
              data-testid={`input-edit-comment-${comment.id}`}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => editMutation.mutate()} disabled={!editText.trim() || editText.trim() === comment.content} className="bg-orange-600 hover:bg-orange-700 text-white h-7 text-xs" data-testid={`button-save-edit-${comment.id}`}>
                <Check className="h-3 w-3 mr-1" />Save
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setIsEditing(false); setEditText(comment.content); }} className="border-zinc-700 text-zinc-400 h-7 text-xs" data-testid={`button-cancel-edit-${comment.id}`}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-400 whitespace-pre-wrap">{comment.content}</p>
        )}
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={() => voteMutation.mutate()}
            disabled={!isPaid}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-orange-400 transition-colors disabled:opacity-50"
            data-testid={`button-vote-comment-${comment.id}`}
          >
            <ChevronUp className="h-3.5 w-3.5" />{comment.voteCount || 0}
          </button>
          {isPaid && (
            <button onClick={() => onReply(comment.id)} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-orange-400 transition-colors" data-testid={`button-reply-${comment.id}`}>
              <Reply className="h-3.5 w-3.5" />Reply
            </button>
          )}
          {canEdit && !isEditing && (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-orange-400 transition-colors" data-testid={`button-edit-comment-${comment.id}`}>
              <Edit className="h-3.5 w-3.5" />Edit
            </button>
          )}
          {user?.isAdmin && (
            <button onClick={() => deleteMutation.mutate()} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-red-400 transition-colors" data-testid={`button-delete-comment-${comment.id}`}>
              <Trash2 className="h-3.5 w-3.5" />Delete
            </button>
          )}
          {isPaid && !isAuthor && (
            <button onClick={() => setShowReport(true)} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-red-400 transition-colors" data-testid={`button-report-comment-${comment.id}`}>
              <Flag className="h-3.5 w-3.5" />Report
            </button>
          )}
        </div>
      </div>
      {showReport && <ReportDialog type="comment" targetId={comment.id} postId={postId} onClose={() => setShowReport(false)} />}
      {comment.children?.map((child: any) => (
        <Comment key={child.id} comment={child} depth={depth + 1} postId={postId} user={user} onReply={onReply} topContributorSet={topContributorSet} risingStarSet={risingStarSet} />
      ))}
    </div>
  );
}

export default function KbPost() {
  const [, params] = useRoute("/knowledge-base/:slug");
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [commentSort, setCommentSort] = useState("oldest");
  const [tocOpen, setTocOpen] = useState(() => typeof window !== "undefined" && window.innerWidth >= 768);
  const [showPostReport, setShowPostReport] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const slug = params?.slug || "";

  const { data: post, isLoading } = useQuery({
    queryKey: [`/api/kb/posts/${slug}`],
    queryFn: async () => {
      const res = await fetch(`/api/kb/posts/${slug}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    enabled: !!slug,
  });

  useDocumentTitle(post ? `${post.title} | Knowledge Base` : "Knowledge Base");

  const { data: comments } = useQuery({
    queryKey: ["/api/kb/comments", post?.id, commentSort],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (commentSort !== "oldest") params.set("sort", commentSort);
      const res = await fetch(`/api/kb/posts/${post.id}/comments?${params}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!post?.id,
  });

  const { data: bookmarkData } = useQuery({
    queryKey: ["/api/kb/bookmarks/check", post?.id],
    queryFn: async () => {
      const res = await fetch(`/api/kb/bookmarks/check?postIds=${post.id}`);
      if (!res.ok) return { bookmarkedPostIds: [] };
      return res.json();
    },
    enabled: isAuthenticated && !!post?.id,
  });
  const isBookmarked = bookmarkData?.bookmarkedPostIds?.includes(post?.id);

  const { data: leaderboard } = useQuery({
    queryKey: ["/api/kb/leaderboard"],
    queryFn: async () => {
      const res = await fetch("/api/kb/leaderboard");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const topContributorSet = new Set(
    (leaderboard || []).slice(0, 5).map((u: any) => u.username)
  );
  const risingStarSet = new Set(
    (leaderboard || []).filter((u: any) => u.reputation >= 10 && u.reputation < 100).map((u: any) => u.username)
  );

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/kb/posts/${post.id}/bookmark`, { method: "POST" });
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/kb/bookmarks/check"] });
      toast({ title: data.bookmarked ? "Bookmarked" : "Bookmark removed" });
    },
    onError: (err: Error) => { toast({ title: "Error", description: err.message, variant: "destructive" }); },
  });

  const firstTag = post?.tags?.[0];
  const { data: relatedData } = useQuery({
    queryKey: ["/api/kb/related", firstTag, post?.id],
    queryFn: async () => {
      const res = await fetch(`/api/kb/posts?tag=${encodeURIComponent(firstTag)}&limit=6`);
      if (!res.ok) return { posts: [] };
      return res.json();
    },
    enabled: !!firstTag && !!post?.id,
  });
  const relatedPosts = (relatedData?.posts || []).filter((p: any) => p.id !== post?.id).slice(0, 5);

  const voteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/kb/posts/${post.id}/vote`, { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [`/api/kb/posts/${slug}`] }); },
    onError: (err: Error) => { toast({ title: "Error", description: err.message, variant: "destructive" }); },
  });

  const commentMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/kb/posts/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: commentText, parentId: replyTo }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    },
    onSuccess: () => {
      setCommentText("");
      setReplyTo(null);
      queryClient.invalidateQueries({ queryKey: ["/api/kb/comments", post.id] });
      queryClient.invalidateQueries({ queryKey: [`/api/kb/posts/${slug}`] });
      toast({ title: "Comment posted" });
    },
    onError: (err: Error) => { toast({ title: "Error", description: err.message, variant: "destructive" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/kb/posts/${post.id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Post deleted" });
      setLocation("/knowledge-base");
    },
  });

  const threadedComments = (() => {
    if (!comments) return [];
    const map = new Map<number, any>();
    const roots: any[] = [];
    for (const c of comments) {
      map.set(c.id, { ...c, children: [] });
    }
    for (const c of comments) {
      const node = map.get(c.id)!;
      if (c.parentId && map.has(c.parentId)) {
        map.get(c.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  })();

  useEffect(() => {
    if (post?.content) {
      highlightCodeBlocks(contentRef);
    }
  }, [post?.content]);

  const isPaid = isAuthenticated && user?.tier !== "free";
  const canEdit = user && (post?.authorId === user.id || user.isAdmin);

  const handleShareTwitter = () => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(post.title);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleShareLinkedin = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(post.title);
    const body = encodeURIComponent(window.location.href);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast({ title: "Link copied to clipboard", description: "Ready to paste anywhere", action: <button className="text-xs text-orange-400 hover:underline whitespace-nowrap" onClick={() => window.open(url, "_blank")}>Open in new tab</button> });
    }).catch(() => {
      toast({ title: "Failed to copy link", variant: "destructive" });
    });
  };

  const handleCopyMarkdown = () => {
    const url = window.location.href;
    const excerpt = (post.content || "").replace(/[#*_`>\[\]]/g, "").slice(0, 120).trim();
    const md = `## [${post.title}](${url})\n\n> ${excerpt}…\n\n*via STB Cybersecurity*`;
    navigator.clipboard.writeText(md).then(() => {
      toast({ title: "Copied as Markdown", description: "Paste into Slack, Discord, or GitHub" });
    }).catch(() => {
      toast({ title: "Failed to copy", variant: "destructive" });
    });
  };

  const handleShowQrCode = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(window.location.href, {
        width: 256,
        margin: 2,
        color: { dark: "#ea580c", light: "#18181b" },
      });
      setQrDataUrl(dataUrl);
      setShowQrCode(true);
    } catch {
      toast({ title: "Failed to generate QR code", variant: "destructive" });
    }
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.download = `qr-${slug}.png`;
    link.href = qrDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-zinc-800 rounded w-3/4" />
            <div className="h-4 bg-zinc-800 rounded w-1/3" />
            <div className="h-64 bg-zinc-800 rounded" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <BookOpen className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Post Not Found</h2>
          <Link href="/knowledge-base"><Button variant="outline" className="border-zinc-700 text-zinc-400">Back to KB</Button></Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/knowledge-base">
          <button className="flex items-center gap-2 text-sm text-zinc-500 hover:text-orange-400 transition-colors mb-6" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />
            <KBIcon className="h-5 w-5" />
            Back to Knowledge Base
          </button>
        </Link>

        <div className="flex gap-6">
          <div className="flex flex-col items-center gap-1 pt-2">
            <button
              onClick={() => voteMutation.mutate()}
              disabled={!isPaid}
              className="p-1 rounded hover:bg-orange-500/10 transition-colors disabled:opacity-50"
              data-testid="button-vote-post"
            >
              <ChevronUp className="h-6 w-6 text-zinc-500 hover:text-orange-400" />
            </button>
            <span className="text-lg font-bold text-orange-400" data-testid="text-post-votes">{post.voteCount || 0}</span>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {post.isPinned && <Pin className="h-4 w-4 text-orange-400" />}
              <TypeBadge type={post.type} />
              {post.status === "pending_review" && <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">Pending Review</Badge>}
              {post.status === "rejected" && <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">Rejected</Badge>}
              {post.tags?.map((tag: string) => (
                <Link key={tag} href={`/knowledge-base?tag=${encodeURIComponent(tag)}`}>
                  <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-500 hover:border-orange-500/30 hover:text-orange-400 cursor-pointer">
                    <Tag className="h-3 w-3 mr-1" />{tag}
                  </Badge>
                </Link>
              ))}
            </div>

            <h1 className="text-2xl font-bold text-white mb-4" data-testid="text-post-title">{post.title}</h1>

            <div className="flex items-center gap-3 mb-4 text-sm text-zinc-500 flex-wrap">
              <span className="flex items-center gap-1.5">
                <UserAvatar avatarUrl={post.author?.avatarUrl} username={post.author?.username} size="md" />
                By <Link href={`/user/${post.author?.username}`}><strong className="text-zinc-300 hover:text-orange-400 transition-colors cursor-pointer">{post.author?.username || "Unknown"}</strong></Link>
                {post.author && <TierBadge tier={post.author.tier} isTrusted={post.author.isTrusted} isAdmin={post.author.isAdmin} />}
                {post.author?.username && topContributorSet.has(post.author.username) && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-orange-500/15 text-orange-400 text-[10px] font-medium" title="Top Contributor" data-testid="badge-top-contributor">
                    <Crown className="h-2.5 w-2.5" />Top Contributor
                  </span>
                )}
                {post.author?.username && !topContributorSet.has(post.author.username) && risingStarSet.has(post.author.username) && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-medium" title="Rising Star" data-testid="badge-rising-star">
                    <Sparkles className="h-2.5 w-2.5" />Rising Star
                  </span>
                )}
              </span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{timeAgo(post.createdAt)}</span>
              <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />{post.commentCount || 0} comments</span>
              <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{post.viewCount || 0} views</span>
              <span className="flex items-center gap-1 text-zinc-500 text-sm" data-testid="text-reading-time"><Clock className="h-3.5 w-3.5" />{calculateReadingTime(post.content)} min read</span>
            </div>

            <div className="flex items-center gap-2 mb-6 flex-wrap">
              {isPaid && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => bookmarkMutation.mutate()}
                  className={`${isBookmarked ? "border-orange-500/30 text-orange-400 bg-orange-500/5" : "border-zinc-700 text-zinc-400"} hover:bg-orange-500/10`}
                  data-testid="button-bookmark-post"
                >
                  {isBookmarked ? <BookmarkCheck className="h-4 w-4 mr-1" /> : <Bookmark className="h-4 w-4 mr-1" />}
                  {isBookmarked ? "Bookmarked" : "Bookmark"}
                </Button>
              )}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleShareTwitter}
                  className="p-1.5 rounded hover:bg-orange-500/10 transition-colors text-zinc-400 hover:text-orange-400"
                  title="Share on Twitter"
                  data-testid="button-share-twitter"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button
                  onClick={handleShareLinkedin}
                  className="p-1.5 rounded hover:bg-orange-500/10 transition-colors text-zinc-400 hover:text-orange-400"
                  title="Share on LinkedIn"
                  data-testid="button-share-linkedin"
                >
                  <Linkedin className="h-4 w-4" />
                </button>
                <button
                  onClick={handleShareEmail}
                  className="p-1.5 rounded hover:bg-orange-500/10 transition-colors text-zinc-400 hover:text-orange-400"
                  title="Share via Email"
                  data-testid="button-share-email"
                >
                  <Mail className="h-4 w-4" />
                </button>
                <button
                  onClick={handleCopyLink}
                  className="p-1.5 rounded hover:bg-orange-500/10 transition-colors text-zinc-400 hover:text-orange-400"
                  title="Copy link"
                  data-testid="button-share-copy-link"
                >
                  <Link2 className="h-4 w-4" />
                </button>
                <button
                  onClick={handleCopyMarkdown}
                  className="p-1.5 rounded hover:bg-orange-500/10 transition-colors text-zinc-400 hover:text-orange-400"
                  title="Copy as Markdown"
                  data-testid="button-share-markdown"
                >
                  <FileCode className="h-4 w-4" />
                </button>
                <button
                  onClick={handleShowQrCode}
                  className="p-1.5 rounded hover:bg-orange-500/10 transition-colors text-zinc-400 hover:text-orange-400"
                  title="QR Code"
                  data-testid="button-share-qrcode"
                >
                  <QrCode className="h-4 w-4" />
                </button>
              </div>
              {isPaid && post.authorId !== user?.id && (
                <button
                  onClick={() => setShowPostReport(true)}
                  className="p-1.5 rounded hover:bg-red-500/10 transition-colors text-zinc-400 hover:text-red-400"
                  title="Report post"
                  data-testid="button-report-post"
                >
                  <Flag className="h-4 w-4" />
                </button>
              )}
              {canEdit && (
                <>
                  <Button variant="outline" size="sm" onClick={() => setLocation(`/knowledge-base/${post.slug}/edit`)} className="border-zinc-700 text-zinc-400" data-testid="button-edit-post">
                    <Edit className="h-4 w-4 mr-1" />Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { if (confirm("Delete this post?")) deleteMutation.mutate(); }} className="border-red-500/30 text-red-400 hover:bg-red-500/10" data-testid="button-delete-post">
                    <Trash2 className="h-4 w-4 mr-1" />Delete
                  </Button>
                </>
              )}
            </div>
            {showPostReport && <ReportDialog type="post" targetId={post.id} postId={post.id} onClose={() => setShowPostReport(false)} />}

            {showQrCode && qrDataUrl && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowQrCode(false)}>
                <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-xs mx-4 text-center" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2"><QrCode className="h-5 w-5 text-orange-400" />QR Code</h3>
                    <button onClick={() => setShowQrCode(false)} className="text-zinc-500 hover:text-zinc-300" data-testid="button-close-qr"><X className="h-5 w-5" /></button>
                  </div>
                  <img src={qrDataUrl} alt="QR Code" className="mx-auto rounded-lg mb-3" width={256} height={256} data-testid="img-qr-code" />
                  <p className="text-xs text-zinc-500 mb-1">Scan to open this post</p>
                  <p className="text-xs text-orange-400 font-semibold mb-4">STB Cybersecurity</p>
                  <Button onClick={handleDownloadQr} variant="outline" size="sm" className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10" data-testid="button-download-qr">
                    <Download className="h-4 w-4 mr-1" />Download QR
                  </Button>
                </div>
              </div>
            )}

            {(() => {
              const headings = extractHeadings(post.content);
              if (headings.length < 3) return null;
              return (
                <div className="mb-6 rounded-lg border border-zinc-700 bg-zinc-800/50" data-testid="toc-section">
                  <button
                    onClick={() => setTocOpen(!tocOpen)}
                    className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold text-zinc-300 hover:text-orange-400 transition-colors"
                    data-testid="button-toggle-toc"
                  >
                    <span className="flex items-center gap-2">
                      <List className="h-4 w-4 text-orange-400" />
                      Table of Contents
                    </span>
                    {tocOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {tocOpen && (
                    <nav className="px-4 pb-3 space-y-1">
                      {headings.map((h, i) => (
                        <a
                          key={i}
                          href={`#${h.slug}`}
                          className={`block text-sm text-zinc-400 hover:text-orange-400 transition-colors ${
                            h.level === 2 ? "pl-4" : h.level === 3 ? "pl-8" : ""
                          }`}
                          data-testid={`toc-link-${i}`}
                        >
                          {h.text}
                        </a>
                      ))}
                    </nav>
                  )}
                </div>
              );
            })()}

            <div
              ref={contentRef}
              className="prose prose-invert max-w-none"
              data-testid="content-post-body"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
            />

            {relatedPosts.length > 0 && (
              <div className="mt-12 border-t border-zinc-800 pt-8">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Link2 className="h-5 w-5 text-orange-400" />Related Posts
                </h3>
                <div className="grid gap-3">
                  {relatedPosts.map((rp: any) => (
                    <Link key={rp.id} href={`/knowledge-base/${rp.slug}`}>
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-orange-500/30 hover:bg-zinc-900/80 transition-all cursor-pointer" data-testid={`related-post-${rp.id}`}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-300 truncate">{rp.title}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                            <TypeBadge type={rp.type} />
                            <span className="flex items-center gap-1"><ChevronUp className="h-3 w-3" />{rp.voteCount || 0}</span>
                            <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{rp.commentCount || 0}</span>
                            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{rp.viewCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-12 border-t border-zinc-800 pt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-orange-400" />
                  Comments ({post.commentCount || 0})
                </h3>
                {(post.commentCount || 0) > 1 && (
                  <div className="flex items-center gap-1">
                    <ArrowUpDown className="h-3.5 w-3.5 text-zinc-500" />
                    {COMMENT_SORTS.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setCommentSort(s.value)}
                        data-testid={`button-comment-sort-${s.value}`}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                          commentSort === s.value
                            ? "bg-zinc-700 text-white"
                            : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isPaid && (
                <div className="mb-8 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                  {replyTo && (
                    <div className="flex items-center gap-2 mb-2 text-xs text-zinc-500">
                      <Reply className="h-3 w-3" />Replying to comment
                      <button onClick={() => setReplyTo(null)} className="text-orange-400 hover:underline">Cancel</button>
                    </div>
                  )}
                  <Textarea
                    data-testid="input-comment"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-600 min-h-[80px]"
                  />
                  <div className="flex justify-end mt-3">
                    <Button
                      onClick={() => commentMutation.mutate()}
                      disabled={!commentText.trim() || commentMutation.isPending}
                      className="bg-orange-500 hover:bg-orange-600 text-white"
                      data-testid="button-submit-comment"
                    >
                      <Send className="h-4 w-4 mr-2" />Post Comment
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                {threadedComments.length === 0 && (
                  <p className="text-sm text-zinc-500 py-4">No comments yet. Be the first to share your thoughts!</p>
                )}
                {threadedComments.map((c: any) => (
                  <Comment key={c.id} comment={c} depth={0} postId={post.id} user={user} onReply={setReplyTo} topContributorSet={topContributorSet} risingStarSet={risingStarSet} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
