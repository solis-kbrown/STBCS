import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useDocumentTitle } from "@/lib/use-document-title";
import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { User, Crown, CreditCard, Calendar, Shield, ExternalLink, Loader2, ArrowRight, Bell, Mail, Key, Copy, Trash2, Eye, EyeOff, Plus, Camera, MapPin, Building, Globe, Award, Save, BookOpen, Terminal, Lock, Bug, Skull, Radar, CircuitBoard, Upload, X, Link2 } from "lucide-react";
import { format } from "date-fns";
import { useLocation, Link } from "wouter";
import { useState, useEffect, useRef, useCallback } from "react";

const tierColors: Record<string, string> = {
  free: "bg-zinc-700 text-zinc-300",
  supporter: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  pro: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  business: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  unlimited: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const tierLabels: Record<string, string> = {
  free: "Free Tier",
  supporter: "STBCS Supporter",
  pro: "STBCS Pro",
  business: "STBCS Business",
  unlimited: "STBCS Unlimited Everything",
};

const DEFAULT_AVATARS = [
  { name: "Shield", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="32" fill="#27272a"/><path d="M32 12L16 20v12c0 11 7 18 16 20 9-2 16-9 16-20V20L32 12z" stroke="#f97316" stroke-width="2.5" fill="#f97316" fill-opacity="0.15"/><path d="M28 32l4 4 8-8" stroke="#f97316" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
  { name: "Terminal", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="32" fill="#27272a"/><rect x="12" y="16" width="40" height="32" rx="4" stroke="#f97316" stroke-width="2.5" fill="#f97316" fill-opacity="0.1"/><path d="M20 28l6 4-6 4M30 36h8" stroke="#f97316" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
  { name: "Lock", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="32" fill="#27272a"/><rect x="18" y="28" width="28" height="22" rx="4" stroke="#f97316" stroke-width="2.5" fill="#f97316" fill-opacity="0.15"/><path d="M24 28v-6a8 8 0 0116 0v6" stroke="#f97316" stroke-width="2.5" stroke-linecap="round"/><circle cx="32" cy="38" r="3" fill="#f97316"/></svg>` },
  { name: "Bug", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="32" fill="#27272a"/><ellipse cx="32" cy="36" rx="10" ry="12" stroke="#f97316" stroke-width="2.5" fill="#f97316" fill-opacity="0.15"/><circle cx="28" cy="30" r="2" fill="#f97316"/><circle cx="36" cy="30" r="2" fill="#f97316"/><path d="M18 30h4M42 30h4M18 38h4M42 38h4M24 22l-4-4M40 22l4-4" stroke="#f97316" stroke-width="2" stroke-linecap="round"/></svg>` },
  { name: "Skull", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="32" fill="#27272a"/><path d="M20 32c0-8 5-16 12-16s12 8 12 16c0 4-2 7-4 9v5H24v-5c-2-2-4-5-4-9z" stroke="#f97316" stroke-width="2.5" fill="#f97316" fill-opacity="0.12"/><circle cx="27" cy="31" r="3" fill="#f97316"/><circle cx="37" cy="31" r="3" fill="#f97316"/><path d="M28 46v-4M32 46v-4M36 46v-4" stroke="#f97316" stroke-width="2" stroke-linecap="round"/></svg>` },
  { name: "Radar", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="32" fill="#27272a"/><circle cx="32" cy="32" r="18" stroke="#f97316" stroke-width="2" fill="#f97316" fill-opacity="0.08"/><circle cx="32" cy="32" r="12" stroke="#f97316" stroke-width="1.5" opacity="0.6"/><circle cx="32" cy="32" r="6" stroke="#f97316" stroke-width="1.5" opacity="0.4"/><line x1="32" y1="32" x2="32" y2="14" stroke="#f97316" stroke-width="2.5" stroke-linecap="round"/><circle cx="32" cy="32" r="2" fill="#f97316"/><circle cx="38" cy="26" r="2.5" fill="#f97316" opacity="0.8"/></svg>` },
  { name: "Eye", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="32" fill="#27272a"/><path d="M10 32s8-14 22-14 22 14 22 14-8 14-22 14S10 32 10 32z" stroke="#f97316" stroke-width="2.5" fill="#f97316" fill-opacity="0.1"/><circle cx="32" cy="32" r="7" stroke="#f97316" stroke-width="2" fill="#f97316" fill-opacity="0.2"/><circle cx="32" cy="32" r="3" fill="#f97316"/></svg>` },
  { name: "Circuit", svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><rect width="64" height="64" rx="32" fill="#27272a"/><rect x="24" y="24" width="16" height="16" rx="2" stroke="#f97316" stroke-width="2.5" fill="#f97316" fill-opacity="0.15"/><path d="M32 14v10M32 40v10M14 32h10M40 32h10M18 18l8 8M38 38l8 8M18 46l8-8M38 26l8-8" stroke="#f97316" stroke-width="1.5" stroke-linecap="round"/><circle cx="32" cy="14" r="2" fill="#f97316"/><circle cx="32" cy="50" r="2" fill="#f97316"/><circle cx="14" cy="32" r="2" fill="#f97316"/><circle cx="50" cy="32" r="2" fill="#f97316"/></svg>` },
];

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export default function AccountPage() {
  useDocumentTitle("My Account | STB Cybersecurity");
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: accountData, isLoading } = useQuery({
    queryKey: ["account"],
    queryFn: async () => {
      const res = await fetch("/api/account", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch account");
      return res.json();
    },
    enabled: isAuthenticated,
  });

  const portalMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to open billing portal");
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
        </div>
        <Footer />
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="max-w-lg mx-auto text-center py-20 space-y-4">
          <img src="/brand/icon-shield.png" alt="STB Cybersecurity account" className="h-20 w-20 mx-auto drop-shadow-[0_0_10px_rgba(239,68,68,0.3)] opacity-70" />
          <h1 className="text-2xl font-bold text-white">Sign in to view your account</h1>
          <p className="text-zinc-400">You need to be logged in to access your account settings and subscription details.</p>
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={() => setLocation("/")}
            data-testid="button-go-home"
          >
            Go to Homepage
          </Button>
        </div>
        <Footer />
      </Layout>
    );
  }

  const queryClient = useQueryClient();
  const [newKeyName, setNewKeyName] = useState("");
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [avatarTab, setAvatarTab] = useState<"upload" | "defaults" | "url">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileForm, setProfileForm] = useState({
    displayName: "", bio: "", avatarUrl: "", location: "", website: "", company: "",
    profilePublic: true, showEmail: false,
  });

  const handleAvatarUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Please upload a JPEG, PNG, GIF, or WebP image.", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Avatar must be under 2MB.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setProfileForm(f => ({ ...f, avatarUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [toast]);

  const account = accountData?.user;
  const subscription = accountData?.subscription;
  const tier = account?.tier || user?.tier || "free";
  const isPaid = tier !== "free";
  const hasPaidApi = tier === "pro" || tier === "business" || tier === "unlimited";

  useEffect(() => {
    if (account) {
      setProfileForm({
        displayName: account.displayName || "",
        bio: account.bio || "",
        avatarUrl: account.avatarUrl || "",
        location: account.location || "",
        website: account.website || "",
        company: account.company || "",
        profilePublic: account.profilePublic !== false,
        showEmail: account.showEmail === true,
      });
    }
  }, [account]);

  const profileMutation = useMutation({
    mutationFn: async (data: typeof profileForm) => {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
      setEditingProfile(false);
      toast({ title: "Profile updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const { data: apiKeysData, isLoading: keysLoading } = useQuery({
    queryKey: ["api-keys"],
    queryFn: async () => {
      const res = await fetch("/api/account/api-keys", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: isAuthenticated && hasPaidApi,
  });

  const createKeyMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/account/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create API key");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setRevealedKey(data.key);
      setNewKeyName("");
      setShowCreateForm(false);
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast({ title: "API Key Created", description: "Copy your key now — you won't be able to see it again." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const digestMutation = useMutation({
    mutationFn: async (optIn: boolean) => {
      const res = await fetch("/api/account/digest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ digestOptIn: optIn }),
      });
      if (!res.ok) throw new Error("Failed to update digest preference");
      return res.json();
    },
    onSuccess: (_data, optIn) => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
      toast({ title: optIn ? "Digest enabled" : "Digest disabled", description: optIn ? "You'll receive weekly threat digests." : "You've been unsubscribed from weekly digests." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const revokeKeyMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/account/api-keys/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to revoke key");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast({ title: "API Key Revoked", description: "The key has been deactivated." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-white" data-testid="text-account-title">My Account</h1>
          <p className="text-zinc-400">Manage your account, subscription, and preferences.</p>
        </div>

        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <User className="h-5 w-5 text-orange-400" />
                Profile
              </CardTitle>
              <div className="flex items-center gap-2">
                <Link href={`/user/${account?.username || user?.username}`}>
                  <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-orange-400 text-xs" data-testid="button-view-public-profile">
                    <Eye className="h-3.5 w-3.5 mr-1" />View Public Profile
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingProfile(!editingProfile)}
                  className="border-zinc-500 text-zinc-400 hover:text-orange-400 text-xs"
                  data-testid="button-edit-profile"
                >
                  {editingProfile ? "Cancel" : "Edit Profile"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                {(account?.avatarUrl || profileForm.avatarUrl) ? (
                  <img
                    src={editingProfile ? profileForm.avatarUrl : account?.avatarUrl}
                    alt="Avatar"
                    className="h-16 w-16 rounded-full object-cover border-2 border-zinc-500"
                    data-testid="img-avatar"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-zinc-800 border-2 border-zinc-500 flex items-center justify-center">
                    <User className="h-8 w-8 text-zinc-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-semibold text-white" data-testid="text-account-username">
                  {account?.displayName || account?.username || user?.username}
                </p>
                <p className="text-sm text-zinc-500">@{account?.username || user?.username}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`${tierColors[tier] || tierColors.free}`} data-testid="badge-account-tier">
                    {isPaid && <Crown className="h-3 w-3 mr-1" />}
                    {tierLabels[tier] || tier}
                  </Badge>
                  {account?.kbReputation > 0 && (
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-[10px]">
                      <Award className="h-3 w-3 mr-1" />{account.kbReputation} KB Rep
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {!editingProfile ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-800">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Email</p>
                  <p className="text-white font-medium text-sm" data-testid="text-account-email">{account?.email || user?.email || "Not set"}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Member Since</p>
                  <p className="text-white font-medium text-sm flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                    {account?.createdAt ? format(new Date(account.createdAt), "MMMM d, yyyy") : "N/A"}
                  </p>
                </div>
                {account?.bio && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Bio</p>
                    <p className="text-zinc-300 text-sm">{account.bio}</p>
                  </div>
                )}
                {(account?.location || account?.company || account?.website) && (
                  <>
                    {account?.location && (
                      <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Location</p>
                        <p className="text-zinc-300 text-sm flex items-center gap-1"><MapPin className="h-3 w-3 text-zinc-500" />{account.location}</p>
                      </div>
                    )}
                    {account?.company && (
                      <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Company</p>
                        <p className="text-zinc-300 text-sm flex items-center gap-1"><Building className="h-3 w-3 text-zinc-500" />{account.company}</p>
                      </div>
                    )}
                    {account?.website && (
                      <div className="sm:col-span-2">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Website</p>
                        <a href={account.website} target="_blank" rel="noopener noreferrer" className="text-orange-400 text-sm hover:underline flex items-center gap-1">
                          <Globe className="h-3 w-3" />{account.website}
                        </a>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4 pt-2 border-t border-zinc-800">
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-wider mb-1 block">Display Name</label>
                  <Input
                    data-testid="input-display-name"
                    value={profileForm.displayName}
                    onChange={(e) => setProfileForm(f => ({ ...f, displayName: e.target.value }))}
                    placeholder="Your display name"
                    className="bg-zinc-800 border-zinc-500 text-white"
                    maxLength={100}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs text-zinc-500 uppercase tracking-wider block">Avatar</label>
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 relative group">
                      {profileForm.avatarUrl ? (
                        <img
                          src={profileForm.avatarUrl}
                          alt="Avatar preview"
                          className="h-20 w-20 rounded-full object-cover border-2 border-orange-500/40"
                          data-testid="img-avatar-preview"
                          onError={(e) => { (e.target as HTMLImageElement).src = ""; }}
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-zinc-800 border-2 border-zinc-500 flex items-center justify-center">
                          <User className="h-10 w-10 text-zinc-600" />
                        </div>
                      )}
                      {profileForm.avatarUrl && (
                        <button
                          type="button"
                          onClick={() => setProfileForm(f => ({ ...f, avatarUrl: "" }))}
                          className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          data-testid="button-remove-avatar"
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setAvatarTab("upload")}
                          className={`px-2.5 py-1 text-[11px] rounded-md transition-colors ${avatarTab === "upload" ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "text-zinc-400 hover:text-zinc-300 border border-zinc-500"}`}
                          data-testid="button-avatar-tab-upload"
                        >
                          <Upload className="h-3 w-3 inline mr-1" />Upload
                        </button>
                        <button
                          type="button"
                          onClick={() => setAvatarTab("defaults")}
                          className={`px-2.5 py-1 text-[11px] rounded-md transition-colors ${avatarTab === "defaults" ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "text-zinc-400 hover:text-zinc-300 border border-zinc-500"}`}
                          data-testid="button-avatar-tab-defaults"
                        >
                          <Shield className="h-3 w-3 inline mr-1" />Defaults
                        </button>
                        <button
                          type="button"
                          onClick={() => setAvatarTab("url")}
                          className={`px-2.5 py-1 text-[11px] rounded-md transition-colors ${avatarTab === "url" ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "text-zinc-400 hover:text-zinc-300 border border-zinc-500"}`}
                          data-testid="button-avatar-tab-url"
                        >
                          <Link2 className="h-3 w-3 inline mr-1" />URL
                        </button>
                      </div>

                      {avatarTab === "upload" && (
                        <div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={handleAvatarUpload}
                            className="hidden"
                            data-testid="input-avatar-file"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="border-zinc-500 text-zinc-400 hover:text-orange-400 text-xs w-full"
                            data-testid="button-upload-avatar"
                          >
                            <Camera className="h-3.5 w-3.5 mr-1.5" />
                            Choose Image (max 2MB)
                          </Button>
                          <p className="text-[10px] text-zinc-600 mt-1">JPEG, PNG, GIF, or WebP</p>
                        </div>
                      )}

                      {avatarTab === "defaults" && (
                        <div className="grid grid-cols-4 gap-2" data-testid="avatar-defaults-grid">
                          {DEFAULT_AVATARS.map((a) => {
                            const dataUrl = svgToDataUrl(a.svg);
                            const isSelected = profileForm.avatarUrl === dataUrl;
                            return (
                              <button
                                key={a.name}
                                type="button"
                                onClick={() => setProfileForm(f => ({ ...f, avatarUrl: dataUrl }))}
                                className={`rounded-full p-0.5 transition-all ${isSelected ? "ring-2 ring-orange-500 ring-offset-2 ring-offset-zinc-900" : "hover:ring-2 hover:ring-zinc-600 hover:ring-offset-1 hover:ring-offset-zinc-900"}`}
                                title={a.name}
                                data-testid={`button-default-avatar-${a.name.toLowerCase()}`}
                              >
                                <img src={dataUrl} alt={a.name} className="h-10 w-10 rounded-full" />
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {avatarTab === "url" && (
                        <div>
                          <Input
                            data-testid="input-avatar-url"
                            value={profileForm.avatarUrl.startsWith("data:") ? "" : profileForm.avatarUrl}
                            onChange={(e) => setProfileForm(f => ({ ...f, avatarUrl: e.target.value }))}
                            placeholder="https://example.com/avatar.jpg"
                            className="bg-zinc-800 border-zinc-500 text-white text-xs"
                            maxLength={2000}
                          />
                          <p className="text-[10px] text-zinc-600 mt-1">Paste an external image URL</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-wider mb-1 block">Bio</label>
                  <Textarea
                    data-testid="input-bio"
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm(f => ({ ...f, bio: e.target.value }))}
                    placeholder="Tell others about yourself..."
                    className="bg-zinc-800 border-zinc-500 text-white min-h-[80px]"
                    maxLength={500}
                  />
                  <p className="text-[10px] text-zinc-600 mt-1">{profileForm.bio.length}/500</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-wider mb-1 block">Location</label>
                    <Input
                      data-testid="input-location"
                      value={profileForm.location}
                      onChange={(e) => setProfileForm(f => ({ ...f, location: e.target.value }))}
                      placeholder="City, Country"
                      className="bg-zinc-800 border-zinc-500 text-white"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-wider mb-1 block">Company</label>
                    <Input
                      data-testid="input-company"
                      value={profileForm.company}
                      onChange={(e) => setProfileForm(f => ({ ...f, company: e.target.value }))}
                      placeholder="Your organization"
                      className="bg-zinc-800 border-zinc-500 text-white"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-wider mb-1 block">Website</label>
                    <Input
                      data-testid="input-website"
                      value={profileForm.website}
                      onChange={(e) => setProfileForm(f => ({ ...f, website: e.target.value }))}
                      placeholder="https://yoursite.com"
                      className="bg-zinc-800 border-zinc-500 text-white"
                      maxLength={200}
                    />
                  </div>
                </div>
                <div className="border-t border-zinc-800 pt-4 space-y-3">
                  <h4 className="text-sm font-medium text-white">Privacy Settings</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-300">Public Profile</p>
                      <p className="text-xs text-zinc-500">Show your bio, location, company, and website to others</p>
                    </div>
                    <Switch
                      data-testid="switch-profile-public"
                      checked={profileForm.profilePublic}
                      onCheckedChange={(checked) => setProfileForm(f => ({ ...f, profilePublic: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-zinc-300">Show Email</p>
                      <p className="text-xs text-zinc-500">Display your email address on your public profile</p>
                    </div>
                    <Switch
                      data-testid="switch-show-email"
                      checked={profileForm.showEmail}
                      onCheckedChange={(checked) => setProfileForm(f => ({ ...f, showEmail: checked }))}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingProfile(false)}
                    className="border-zinc-500 text-zinc-400"
                    data-testid="button-cancel-profile"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => profileMutation.mutate(profileForm)}
                    disabled={profileMutation.isPending}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    data-testid="button-save-profile"
                  >
                    {profileMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Save className="h-4 w-4 mr-1" />}
                    Save Profile
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-orange-400" />
              Subscription & Billing
            </CardTitle>
            <CardDescription>
              {isPaid
                ? "Manage your subscription, update payment methods, or view invoices."
                : "Upgrade to a paid plan to unlock advanced features."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Status</p>
                    <Badge className={subscription.status === "active" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"} data-testid="badge-subscription-status">
                      {subscription.status === "active" ? "Active" : subscription.status}
                    </Badge>
                    {subscription.cancelAtPeriodEnd && (
                      <p className="text-xs text-yellow-400 mt-1">Cancels at end of billing period</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Current Period</p>
                    <p className="text-white text-sm">
                      {subscription.currentPeriodStart && format(new Date(subscription.currentPeriodStart * 1000), "MMM d")}
                      {" - "}
                      {subscription.currentPeriodEnd && format(new Date(subscription.currentPeriodEnd * 1000), "MMM d, yyyy")}
                    </p>
                  </div>
                  {subscription.currentPeriodEnd && (
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                        {subscription.cancelAtPeriodEnd ? "Access Until" : "Next Renewal"}
                      </p>
                      <p className="text-white text-sm">
                        {format(new Date(subscription.currentPeriodEnd * 1000), "MMMM d, yyyy")}
                      </p>
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                  onClick={() => portalMutation.mutate()}
                  disabled={portalMutation.isPending}
                  data-testid="button-manage-subscription"
                >
                  {portalMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ExternalLink className="h-4 w-4 mr-2" />
                  )}
                  Manage Subscription
                </Button>
                <p className="text-[11px] text-zinc-500">
                  Update payment method, view invoices, or cancel your subscription through Stripe's secure billing portal.
                </p>
              </>
            ) : isPaid && account?.hasStripeCustomer ? (
              <>
                <p className="text-sm text-zinc-400">Your subscription is being set up. If this persists, please contact support.</p>
                <Button
                  variant="outline"
                  className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                  onClick={() => portalMutation.mutate()}
                  disabled={portalMutation.isPending}
                  data-testid="button-manage-billing"
                >
                  {portalMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ExternalLink className="h-4 w-4 mr-2" />}
                  View Billing
                </Button>
              </>
            ) : (
              <div className="text-center py-4 space-y-3">
                <p className="text-zinc-400 text-sm">You're currently on the free tier.</p>
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => setLocation("/pricing")}
                  data-testid="button-upgrade"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade Your Plan
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/50" data-testid="card-notifications-digest">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-400" />
              Notifications & Digest
            </CardTitle>
            <CardDescription>
              Manage your email notification preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-500 bg-zinc-800/50">
              <div className="space-y-0.5 flex-1 min-w-0 mr-4">
                <p className="text-sm font-medium text-white" data-testid="text-digest-label">Weekly Threat Digest</p>
                <p className="text-xs text-zinc-400" data-testid="text-digest-description">
                  Receive a weekly email summary of top CVEs, ransomware incidents, and threat landscape changes
                </p>
              </div>
              <Switch
                checked={!!account?.digestOptIn}
                onCheckedChange={(checked: boolean) => digestMutation.mutate(checked)}
                disabled={digestMutation.isPending}
                data-testid="switch-digest-optin"
              />
            </div>
          </CardContent>
        </Card>

        {hasPaidApi && (
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Key className="h-5 w-5 text-orange-400" />
                API Keys
              </CardTitle>
              <CardDescription>
                Access the STBCS Threat Intelligence API programmatically. {tier === "pro" ? "1 key allowed." : tier === "unlimited" ? "Up to 10 keys." : "Up to 5 keys."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {revealedKey && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 space-y-2" data-testid="container-new-key">
                  <p className="text-sm font-medium text-green-400">Your new API key (copy it now):</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-zinc-800 px-3 py-2 rounded text-sm text-green-300 font-mono break-all" data-testid="text-new-api-key">{revealedKey}</code>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                      onClick={() => { navigator.clipboard.writeText(revealedKey); toast({ title: "Copied!" }); }}
                      data-testid="button-copy-key"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-zinc-500">This key will not be shown again. Store it securely.</p>
                  <Button size="sm" variant="ghost" className="text-zinc-400" onClick={() => setRevealedKey(null)} data-testid="button-dismiss-key">
                    Dismiss
                  </Button>
                </div>
              )}

              {keysLoading ? (
                <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-orange-400" /></div>
              ) : apiKeysData?.keys?.length > 0 ? (
                <div className="space-y-3">
                  {apiKeysData.keys.map((key: any) => (
                    <div key={key.id} className={`flex items-center justify-between p-3 rounded-lg border ${key.status === "active" ? "border-zinc-500 bg-zinc-800/50" : "border-zinc-800 bg-zinc-900/30 opacity-60"}`} data-testid={`api-key-${key.id}`}>
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium text-sm">{key.name}</span>
                          <Badge className={key.status === "active" ? "bg-green-500/20 text-green-400 text-[10px]" : "bg-red-500/20 text-red-400 text-[10px]"}>
                            {key.status}
                          </Badge>
                          <Badge className="bg-zinc-700 text-zinc-300 text-[10px]">{key.tier}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-zinc-500">
                          <code className="font-mono">{key.prefix}...****</code>
                          <span>Today: {key.todayUsage?.requests || 0}/{key.dailyQuota} requests</span>
                          {key.lastUsedAt && <span>Last used: {format(new Date(key.lastUsedAt), "MMM d, HH:mm")}</span>}
                        </div>
                      </div>
                      {key.status === "active" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:bg-red-500/10 ml-2"
                          onClick={() => { if (confirm("Revoke this API key? This cannot be undone.")) revokeKeyMutation.mutate(key.id); }}
                          disabled={revokeKeyMutation.isPending}
                          data-testid={`button-revoke-key-${key.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 text-center py-2">No API keys yet. Create one to get started.</p>
              )}

              {showCreateForm ? (
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Key name (e.g., 'Production Server')"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="bg-zinc-800 border-zinc-500 text-white"
                    data-testid="input-key-name"
                  />
                  <Button
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white whitespace-nowrap"
                    onClick={() => newKeyName.trim() && createKeyMutation.mutate(newKeyName.trim())}
                    disabled={createKeyMutation.isPending || !newKeyName.trim()}
                    data-testid="button-create-key-submit"
                  >
                    {createKeyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-zinc-400" onClick={() => { setShowCreateForm(false); setNewKeyName(""); }} data-testid="button-cancel-create">
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 w-full"
                  onClick={() => setShowCreateForm(true)}
                  data-testid="button-create-api-key"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New API Key
                </Button>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <span className="text-xs text-zinc-500">
                  {apiKeysData?.tierLimits ? `${apiKeysData.keys?.filter((k: any) => k.status === "active").length || 0}/${apiKeysData.tierLimits.maxKeys} active keys` : ""}
                </span>
                <Button
                  variant="link"
                  className="text-orange-400 text-xs p-0 h-auto"
                  onClick={() => setLocation("/api-docs")}
                  data-testid="button-view-api-docs"
                >
                  View API Documentation <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-400" />
              Quick Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="justify-start border-zinc-500 text-zinc-300 hover:bg-zinc-800"
                onClick={() => setLocation("/monitors?tab=alerts")}
                data-testid="button-go-alerts"
              >
                <Bell className="h-4 w-4 mr-2 text-orange-400" />
                Alert Preferences
              </Button>
              <Button
                variant="outline"
                className="justify-start border-zinc-500 text-zinc-300 hover:bg-zinc-800"
                onClick={() => setLocation("/pricing")}
                data-testid="button-go-support"
              >
                <CreditCard className="h-4 w-4 mr-2 text-orange-400" />
                Support & Membership
              </Button>
              <a href="/contact?category=support&subject=Account%20Support" className="w-full">
                <Button
                  variant="outline"
                  className="w-full justify-start border-zinc-500 text-zinc-300 hover:bg-zinc-800"
                  data-testid="button-contact-support"
                >
                  <Mail className="h-4 w-4 mr-2 text-orange-400" />
                  Contact Support
                </Button>
              </a>
              <Button
                variant="outline"
                className="justify-start border-zinc-500 text-zinc-300 hover:bg-zinc-800"
                onClick={() => setLocation("/api-docs")}
                data-testid="button-go-api-docs"
              >
                <ExternalLink className="h-4 w-4 mr-2 text-orange-400" />
                API Documentation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </Layout>
  );
}
