import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useDocumentTitle } from "@/lib/use-document-title";
import { useToast } from "@/hooks/use-toast";
import {
  Save, Eye, Edit, ArrowLeft, X, Plus, BookOpen,
  Shield, Bug, Lightbulb, AlertTriangle, Sparkles
} from "lucide-react";

const POST_TYPES = [
  { value: "general_idea", label: "General Idea", icon: Sparkles },
  { value: "threat_intel", label: "Threat Intel", icon: AlertTriangle },
  { value: "bug_report", label: "Bug Report", icon: Bug },
  { value: "feature_request", label: "Feature Request", icon: Lightbulb },
  { value: "official_kb", label: "Official KB", icon: Shield, adminOnly: true },
];

function renderMarkdown(content: string) {
  let html = content
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_m, _lang, code) =>
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

export default function KbEditor() {
  const [, editParams] = useRoute("/knowledge-base/:slug/edit");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!editParams?.slug;
  const slug = editParams?.slug || "";

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("general_idea");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [preview, setPreview] = useState(false);

  useDocumentTitle(isEditMode ? "Edit Post | Knowledge Base" : "New Post | Knowledge Base");

  const { data: existingPost } = useQuery({
    queryKey: [`/api/kb/posts/${slug}`],
    queryFn: async () => {
      const res = await fetch(`/api/kb/posts/${slug}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    enabled: isEditMode,
  });

  useEffect(() => {
    if (existingPost) {
      setTitle(existingPost.title);
      setContent(existingPost.content);
      setType(existingPost.type);
      setTags(existingPost.tags || []);
    }
  }, [existingPost]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = isEditMode ? `/api/kb/posts/${existingPost.id}` : "/api/kb/posts";
      const method = isEditMode ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, content, type, tags }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to save");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/kb/posts"] });
      toast({ title: isEditMode ? "Post updated" : "Post created" });
      setLocation(`/knowledge-base/${data.slug}`);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag));

  const bypassModeration = user?.isAdmin || user?.isTrusted;
  const availableTypes = POST_TYPES.filter(t => !t.adminOnly || user?.isAdmin);

  if (!user || user.tier === "free") {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <BookOpen className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Paid Membership Required</h2>
          <p className="text-zinc-400 text-sm">Upgrade your plan to create posts</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => setLocation("/knowledge-base")} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-orange-400 transition-colors mb-6" data-testid="button-back">
          <ArrowLeft className="h-4 w-4" />Back to Knowledge Base
        </button>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">{isEditMode ? "Edit Post" : "New Post"}</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPreview(!preview)} className="border-zinc-700 text-zinc-400" data-testid="button-toggle-preview">
              {preview ? <><Edit className="h-4 w-4 mr-2" />Edit</> : <><Eye className="h-4 w-4 mr-2" />Preview</>}
            </Button>
            <Button onClick={() => saveMutation.mutate()} disabled={!title.trim() || !content.trim() || saveMutation.isPending} className="bg-orange-500 hover:bg-orange-600 text-white" data-testid="button-save-post">
              <Save className="h-4 w-4 mr-2" />{bypassModeration ? "Publish" : "Submit for Review"}
            </Button>
          </div>
        </div>

        {!bypassModeration && (
          <div className="mb-6 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4 text-sm text-yellow-400">
            Your post will be reviewed by a moderator before publishing. Earn 50+ upvotes to become a Trusted Contributor and bypass moderation.
          </div>
        )}

        {preview ? (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
            <h1 className="text-2xl font-bold text-white mb-4">{title || "Untitled"}</h1>
            <div className="flex gap-2 mb-6">
              {POST_TYPES.find(t => t.value === type) && (
                <Badge className="bg-orange-500/20 text-orange-400 text-xs">{POST_TYPES.find(t => t.value === type)?.label}</Badge>
              )}
              {tags.map(t => <Badge key={t} variant="outline" className="text-xs border-zinc-700 text-zinc-500">{t}</Badge>)}
            </div>
            <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(content || "*No content yet*") }} />
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <Label className="text-zinc-300 mb-2 block">Title</Label>
              <Input
                data-testid="input-post-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a descriptive title..."
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-600"
              />
            </div>

            <div>
              <Label className="text-zinc-300 mb-2 block">Type</Label>
              <div className="flex flex-wrap gap-2">
                {availableTypes.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.value}
                      onClick={() => setType(t.value)}
                      data-testid={`button-type-${t.value}`}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                        type === t.value
                          ? "bg-orange-500/15 text-orange-400 border border-orange-500/30"
                          : "bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 hover:bg-zinc-800"
                      }`}
                    >
                      <Icon className="h-4 w-4" />{t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-zinc-300 mb-2 block">Content (Markdown)</Label>
              <Textarea
                data-testid="input-post-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your content using Markdown... Supports code blocks, headers, links, and more."
                className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-600 font-mono text-sm min-h-[400px]"
              />
              <p className="text-xs text-zinc-600 mt-2">Supports Markdown: **bold**, *italic*, `code`, ```code blocks```, ## headers, - lists, [links](url)</p>
            </div>

            <div>
              <Label className="text-zinc-300 mb-2 block">Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(t => (
                  <Badge key={t} className="bg-zinc-800 text-zinc-300 border-zinc-700 text-xs flex items-center gap-1">
                    {t}
                    <button onClick={() => removeTag(t)} className="hover:text-red-400"><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  data-testid="input-tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Add a tag..."
                  className="bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-600 max-w-xs"
                />
                <Button variant="outline" onClick={addTag} className="border-zinc-700 text-zinc-400" data-testid="button-add-tag">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
