import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation, Link } from "wouter";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import { useDocumentTitle } from "@/lib/use-document-title";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronUp, MessageSquare, Clock, Edit, Trash2, ArrowLeft,
  Crown, Star, Award, Shield, Pin, Reply, Send, BookOpen
} from "lucide-react";

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

function renderMarkdown(content: string) {
  let html = content
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_m, lang, code) =>
      `<pre class="bg-zinc-800 border border-zinc-700 rounded-lg p-4 overflow-x-auto my-4"><code class="text-sm text-emerald-400 font-mono">${code.trim()}</code></pre>`)
    .replace(/`([^`]+)`/g, '<code class="bg-zinc-800 text-orange-400 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-white mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-white mt-8 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-white mt-8 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^\- (.+)$/gm, '<li class="ml-4 text-zinc-300">• $1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 text-zinc-300">$1</li>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, text, url) => {
      const safeUrl = /^https?:\/\//i.test(url) ? url : "#";
      return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="text-orange-400 hover:text-orange-300 underline">${text}</a>`;
    })
    .replace(/^(?!<[hpuol]|<li|<pre|<code|<a|<strong|<em)(.*\S.*)$/gm, '<p class="text-zinc-300 leading-relaxed mb-3">$1</p>');
  return html;
}

function Comment({ comment, depth, postId, user, onReply }: { comment: any; depth: number; postId: number; user: any; onReply: (parentId: number) => void }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const voteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/kb/comments/${comment.id}/vote`, { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error((await res.json()).error);
      return res.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: [`/api/kb/posts/${postId}/comments`] }); },
    onError: (err: Error) => { toast({ title: "Error", description: err.message, variant: "destructive" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/kb/comments/${comment.id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/kb/posts/${postId}/comments`] });
      toast({ title: "Comment deleted" });
    },
  });

  const isPaid = user && user.tier !== "free";

  return (
    <div className={`${depth > 0 ? "ml-6 border-l-2 border-zinc-800 pl-4" : ""}`} data-testid={`comment-${comment.id}`}>
      <div className="py-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-zinc-300">{comment.author?.username || "Unknown"}</span>
          {comment.author && <TierBadge tier={comment.author.tier} isTrusted={comment.author.isTrusted} isAdmin={comment.author.isAdmin} />}
          <span className="text-xs text-zinc-600">·</span>
          <span className="text-xs text-zinc-500">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-zinc-400 whitespace-pre-wrap">{comment.content}</p>
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
          {user?.isAdmin && (
            <button onClick={() => deleteMutation.mutate()} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-red-400 transition-colors" data-testid={`button-delete-comment-${comment.id}`}>
              <Trash2 className="h-3.5 w-3.5" />Delete
            </button>
          )}
        </div>
      </div>
      {comment.children?.map((child: any) => (
        <Comment key={child.id} comment={child} depth={depth + 1} postId={postId} user={user} onReply={onReply} />
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
    queryKey: [`/api/kb/posts/${post?.id}/comments`],
    queryFn: async () => {
      const res = await fetch(`/api/kb/posts/${post.id}/comments`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!post?.id,
  });

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
      queryClient.invalidateQueries({ queryKey: [`/api/kb/posts/${post.id}/comments`] });
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

  const isPaid = isAuthenticated && user?.tier !== "free";
  const canEdit = user && (post?.authorId === user.id || user.isAdmin);

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
            <ArrowLeft className="h-4 w-4" />Back to Knowledge Base
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
                <Badge key={tag} variant="outline" className="text-xs border-zinc-700 text-zinc-500">{tag}</Badge>
              ))}
            </div>

            <h1 className="text-2xl font-bold text-white mb-4" data-testid="text-post-title">{post.title}</h1>

            <div className="flex items-center gap-3 mb-6 text-sm text-zinc-500">
              <span className="flex items-center gap-1">
                By <strong className="text-zinc-300">{post.author?.username || "Unknown"}</strong>
                {post.author && <TierBadge tier={post.author.tier} isTrusted={post.author.isTrusted} isAdmin={post.author.isAdmin} />}
              </span>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{timeAgo(post.createdAt)}</span>
              <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />{post.commentCount || 0} comments</span>
            </div>

            {canEdit && (
              <div className="flex gap-2 mb-6">
                <Button variant="outline" size="sm" onClick={() => setLocation(`/knowledge-base/${post.slug}/edit`)} className="border-zinc-700 text-zinc-400" data-testid="button-edit-post">
                  <Edit className="h-4 w-4 mr-1" />Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => { if (confirm("Delete this post?")) deleteMutation.mutate(); }} className="border-red-500/30 text-red-400 hover:bg-red-500/10" data-testid="button-delete-post">
                  <Trash2 className="h-4 w-4 mr-1" />Delete
                </Button>
              </div>
            )}

            <div
              className="prose prose-invert max-w-none"
              data-testid="content-post-body"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
            />

            <div className="mt-12 border-t border-zinc-800 pt-8">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-orange-400" />
                Comments ({post.commentCount || 0})
              </h3>

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
                  <Comment key={c.id} comment={c} depth={0} postId={post.id} user={user} onReply={setReplyTo} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
