import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDocumentTitle } from "@/lib/use-document-title";
import {
  User, Crown, Star, Award, Shield, MapPin, Building, Globe, Mail,
  Calendar, BookOpen, MessageSquare, Eye, ChevronUp, TrendingUp,
  ArrowLeft, Lock, Loader2
} from "lucide-react";
import { ProfileIcon } from "@/components/branded-icons";
import { format } from "date-fns";

const KB_RANKS = [
  { min: 0, name: "Recruit", color: "text-zinc-400" },
  { min: 10, name: "Analyst", color: "text-blue-400" },
  { min: 50, name: "Specialist", color: "text-green-400" },
  { min: 150, name: "Expert", color: "text-purple-400" },
  { min: 300, name: "Elite", color: "text-orange-400" },
  { min: 500, name: "Legend", color: "text-red-400" },
];

function getRank(rep: number) {
  for (let i = KB_RANKS.length - 1; i >= 0; i--) {
    if (rep >= KB_RANKS[i].min) return KB_RANKS[i];
  }
  return KB_RANKS[0];
}

function TierBadge({ tier, isTrusted, isAdmin }: { tier: string | null; isTrusted: boolean; isAdmin: boolean }) {
  if (isAdmin) return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><Crown className="h-3 w-3 mr-1" />STB Admin</Badge>;
  if (isTrusted) return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"><Award className="h-3 w-3 mr-1" />Trusted Contributor</Badge>;
  if (tier === "business" || tier === "enterprise" || tier === "unlimited") return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30"><Star className="h-3 w-3 mr-1" />Business</Badge>;
  if (tier === "pro") return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30"><Star className="h-3 w-3 mr-1" />Pro</Badge>;
  if (tier === "supporter") return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Supporter</Badge>;
  return <Badge className="bg-zinc-700 text-zinc-300">Free</Badge>;
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

export default function ProfilePage() {
  const [, params] = useRoute("/user/:username");
  const username = params?.username || "";

  const { data: profile, isLoading, error } = useQuery({
    queryKey: [`/api/users/${username}/profile`],
    queryFn: async () => {
      const res = await fetch(`/api/users/${username}/profile`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    enabled: !!username,
  });

  useDocumentTitle(profile ? `${profile.displayName || profile.username} | STB Cybersecurity` : "Profile | STB Cybersecurity");

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
        </div>
      </Layout>
    );
  }

  if (!profile || error) {
    return (
      <Layout>
        <div className="max-w-lg mx-auto text-center py-20 space-y-4">
          <User className="h-12 w-12 text-zinc-600 mx-auto" />
          <h2 className="text-xl font-bold text-white">User Not Found</h2>
          <p className="text-zinc-400">This user doesn't exist or their profile is private.</p>
          <Link href="/knowledge-base">
            <Button variant="outline" className="border-zinc-700 text-zinc-400">
              <ArrowLeft className="h-4 w-4 mr-2" />Back to Knowledge Base
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const rank = getRank(profile.kbReputation || 0);
  const nextRank = KB_RANKS.find(r => r.min > (profile.kbReputation || 0));
  const progress = nextRank ? ((profile.kbReputation || 0) - rank.min) / (nextRank.min - rank.min) * 100 : 100;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/knowledge-base">
          <button className="flex items-center gap-2 text-sm text-zinc-500 hover:text-orange-400 transition-colors mb-6" data-testid="button-back">
            <ArrowLeft className="h-4 w-4" />Back to Knowledge Base
          </button>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <Card className="border-zinc-800 bg-zinc-900/50 overflow-hidden">
              <div className="relative">
                <div className="absolute inset-0 opacity-[0.04]" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L52 17.5 L52 42.5 L30 55 L8 42.5 L8 17.5Z' fill='none' stroke='%23f97316' stroke-width='1'/%3E%3C/svg%3E")`,
                  backgroundSize: '40px 40px'
                }} />
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
                <div className="absolute top-2 left-4 w-8 h-px bg-orange-500/10" />
                <div className="absolute top-4 left-4 w-px h-6 bg-orange-500/10" />
                <div className="absolute top-2 right-4 w-8 h-px bg-orange-500/10" />
                <div className="absolute top-4 right-4 w-px h-6 bg-orange-500/10" />
              </div>
              <CardContent className="p-6 text-center relative">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.username}
                    className="h-24 w-24 rounded-full object-cover border-2 border-zinc-700 mx-auto mb-4"
                    data-testid="img-profile-avatar"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-zinc-800/80 border-2 border-orange-500/20 flex items-center justify-center mx-auto mb-4" style={{ boxShadow: '0 0 20px rgba(249,115,22,0.08)' }}>
                    <ProfileIcon className="h-14 w-14" />
                  </div>
                )}
                <h1 className="text-xl font-bold text-white" data-testid="text-profile-name">
                  {profile.displayName || profile.username}
                </h1>
                <p className="text-sm text-zinc-500 mb-3">@{profile.username}</p>
                <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                  <TierBadge tier={profile.tier} isTrusted={profile.isTrusted} isAdmin={profile.isAdmin} />
                  <Badge className={`${rank.color.replace('text-', 'bg-').replace('-400', '-500/20')} ${rank.color} border-transparent`}>
                    <Shield className="h-3 w-3 mr-1" />{rank.name}
                  </Badge>
                </div>

                {profile.bio && <p className="text-sm text-zinc-400 mb-4" data-testid="text-profile-bio">{profile.bio}</p>}

                <div className="space-y-2 text-sm text-left">
                  {profile.location && (
                    <p className="flex items-center gap-2 text-zinc-400">
                      <MapPin className="h-3.5 w-3.5 text-zinc-500 shrink-0" />{profile.location}
                    </p>
                  )}
                  {profile.company && (
                    <p className="flex items-center gap-2 text-zinc-400">
                      <Building className="h-3.5 w-3.5 text-zinc-500 shrink-0" />{profile.company}
                    </p>
                  )}
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-orange-400 hover:underline">
                      <Globe className="h-3.5 w-3.5 shrink-0" />{profile.website.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                  {profile.email && (
                    <p className="flex items-center gap-2 text-zinc-400">
                      <Mail className="h-3.5 w-3.5 text-zinc-500 shrink-0" />{profile.email}
                    </p>
                  )}
                  <p className="flex items-center gap-2 text-zinc-500">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />Joined {profile.createdAt ? format(new Date(profile.createdAt), "MMMM yyyy") : "N/A"}
                  </p>
                </div>

                {!profile.profilePublic && (
                  <div className="mt-4 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700 flex items-center gap-2 text-xs text-zinc-500">
                    <Lock className="h-3.5 w-3.5" />This user has a private profile
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-white flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-400" />KB Reputation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-400" data-testid="text-profile-reputation">{profile.kbReputation || 0}</p>
                  <p className={`text-sm font-medium ${rank.color}`}>{rank.name}</p>
                </div>
                {nextRank && (
                  <div>
                    <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                      <span>{rank.name}</span>
                      <span>{nextRank.name} ({nextRank.min} pts)</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%`, boxShadow: '0 0 8px rgba(249,115,22,0.5), 0 0 16px rgba(249,115,22,0.2)' }} />
                    </div>
                    <p className="text-[10px] text-zinc-600 mt-1 text-center">{nextRank.min - (profile.kbReputation || 0)} pts to {nextRank.name}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-800">
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{profile.stats?.posts || 0}</p>
                    <p className="text-[10px] text-zinc-500 uppercase">Posts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">{profile.stats?.comments || 0}</p>
                    <p className="text-[10px] text-zinc-500 uppercase">Comments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-orange-400" />
                  Recent Posts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile.recentPosts?.length === 0 ? (
                  <p className="text-sm text-zinc-500 text-center py-8">No posts yet</p>
                ) : (
                  <div className="space-y-3">
                    {profile.recentPosts?.map((post: any) => (
                      <Link key={post.id} href={`/knowledge-base/${post.slug}`}>
                        <div className="p-4 rounded-lg border border-zinc-800 hover:border-orange-500/30 hover:bg-zinc-900/80 transition-all cursor-pointer" data-testid={`profile-post-${post.id}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <TypeBadge type={post.type} />
                          </div>
                          <h3 className="text-sm font-medium text-white mb-2">{post.title}</h3>
                          <div className="flex items-center gap-4 text-xs text-zinc-500">
                            <span className="flex items-center gap-1"><ChevronUp className="h-3 w-3" />{post.voteCount || 0}</span>
                            <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{post.commentCount || 0}</span>
                            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.viewCount || 0}</span>
                            <span>{timeAgo(post.createdAt)}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
