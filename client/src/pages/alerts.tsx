import { useState, useCallback } from "react";
import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useAuth } from "@/lib/auth";
import { useDocumentTitle } from "@/lib/use-document-title";
import { 
  useNotifications, 
  useWatchlist, 
  useAddWatchlistItem, 
  useDeleteWatchlistItem,
  useUpdateWatchlistItem,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useBreaches,
  type WatchlistItem,
  type UserNotification
} from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  Eye, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  Shield,
  Building2,
  Globe,
  Tag,
  Users,
  MapPin,
  Search,
  Clock,
  Database,
  ExternalLink,
  CheckCheck,
  Lock,
  Crown,
  Mail,
  MailX,
  MessageSquare,
  MessageSquareOff
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "wouter";

const WATCHLIST_TYPES = [
  { value: "company", label: "Company", icon: Building2 },
  { value: "sector", label: "Sector", icon: Tag },
  { value: "cve", label: "CVE ID", icon: Shield },
  { value: "threat_actor", label: "Threat Actor", icon: Users },
  { value: "country", label: "Country", icon: MapPin },
  { value: "keyword", label: "Keyword", icon: Search },
];

function getSeverityColor(severity: string | null) {
  switch (severity?.toLowerCase()) {
    case "critical": return "bg-red-600 text-white";
    case "high": return "bg-orange-600 text-white";
    case "medium": return "bg-yellow-600 text-white";
    case "low": return "bg-blue-600 text-white";
    default: return "bg-zinc-700 text-zinc-300";
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case "ransomware": return Shield;
    case "cve": return AlertTriangle;
    case "breach": return Database;
    case "threat_actor": return Users;
    default: return Bell;
  }
}

export default function Alerts() {
  useDocumentTitle("Pro Alerts & Watchlist | STB Cybersecurity", "Set up watchlists to track CVEs, IPs, domains, ransomware groups, and keywords. Get real-time email and SMS alerts when threats are detected.");
  const { user, isAuthenticated, isPro, isBusiness } = useAuth();
  const [activeTab, setActiveTab] = useState("notifications");
  const [newWatchItem, setNewWatchItem] = useState({ type: "company", value: "" });
  const [breachSearch, setBreachSearch] = useState("");
  const [smsConsentDialog, setSmsConsentDialog] = useState<{ itemId: string } | null>(null);
  const [smsConsentChecked, setSmsConsentChecked] = useState(false);
  
  const userId = user?.id?.toString() || "";
  
  const { data: notifData, isLoading: loadingNotifs } = useNotifications(userId);
  const { data: watchlistData, isLoading: loadingWatchlist } = useWatchlist(userId);
  const { data: breachData, isLoading: loadingBreaches } = useBreaches(20, 0, breachSearch || undefined);
  
  const addWatchlistItem = useAddWatchlistItem();
  const deleteWatchlistItem = useDeleteWatchlistItem();
  const updateWatchlistItem = useUpdateWatchlistItem();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = notifData?.notifications || [];
  const unreadCount = notifData?.unreadCount || 0;
  const watchlist = watchlistData?.items || [];
  const breaches = breachData?.data || [];

  const handleAddWatchItem = () => {
    if (!newWatchItem.value.trim() || !userId) return;
    addWatchlistItem.mutate({
      userId,
      itemType: newWatchItem.type,
      itemValue: newWatchItem.value.trim(),
      label: null,
      alertOnMatch: true,
      emailOnMatch: false,
      smsOnMatch: false,
      notes: null,
    });
    setNewWatchItem({ type: "company", value: "" });
  };

  const handleDeleteWatchItem = (itemId: string) => {
    if (!userId) return;
    deleteWatchlistItem.mutate({ itemId, userId });
  };

  const handleToggleEmailAlerts = (itemId: string, currentValue: boolean) => {
    updateWatchlistItem.mutate({ itemId, updates: { emailOnMatch: !currentValue } });
  };

  const handleToggleSmsAlerts = useCallback((itemId: string, currentValue: boolean) => {
    if (currentValue) {
      updateWatchlistItem.mutate({ itemId, updates: { smsOnMatch: false } });
    } else {
      setSmsConsentDialog({ itemId });
      setSmsConsentChecked(false);
    }
  }, [updateWatchlistItem]);

  const handleConfirmSmsConsent = useCallback(() => {
    if (smsConsentDialog && smsConsentChecked) {
      updateWatchlistItem.mutate({ itemId: smsConsentDialog.itemId, updates: { smsOnMatch: true } });
      setSmsConsentDialog(null);
      setSmsConsentChecked(false);
    }
  }, [smsConsentDialog, smsConsentChecked, updateWatchlistItem]);

  const handleMarkRead = (notificationId: string) => {
    if (!userId) return;
    markRead.mutate({ notificationId, userId });
  };

  const handleMarkAllRead = () => {
    if (!userId) return;
    markAllRead.mutate(userId);
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Card className="max-w-md w-full border-zinc-800 bg-zinc-900/50">
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mb-6">
                <Lock className="h-8 w-8 text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Pro Feature</h2>
              <p className="text-zinc-400 mb-6">
                The Alerts Center provides real-time threat notifications, watchlist management, and breach intelligence. Sign in to access these features.
              </p>
              <div className="space-y-3">
                <p className="text-sm text-zinc-500">
                  Already have an account? Click "Sign In" in the header to continue.
                </p>
                <Link href="/support">
                  <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                    <Crown className="h-4 w-4 mr-2" />
                    View Pro Plans
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Bell className="h-6 w-6 text-orange-400" />
              </div>
              <h1 className="text-3xl font-display font-bold text-white">Pro Alerts Center</h1>
              <Badge className="bg-orange-500 text-white font-bold">PRO</Badge>
            </div>
            <p className="text-zinc-400">Real-time threat alerts, watchlists, and breach intelligence for Pro users.</p>
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              onClick={handleMarkAllRead}
              className="border-orange-500/30 hover:border-orange-500 text-orange-400"
              data-testid="button-mark-all-read"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Read ({unreadCount})
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-zinc-900 border border-zinc-800 p-1">
            <TabsTrigger value="notifications" className="data-[state=active]:!bg-orange-500 data-[state=active]:!text-white data-[state=active]:!shadow-none text-zinc-400" data-testid="tab-notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
              {unreadCount > 0 && (
                <Badge className="ml-2 !bg-red-600 !text-white text-xs px-1.5">{unreadCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="watchlist" className="data-[state=active]:!bg-orange-500 data-[state=active]:!text-white data-[state=active]:!shadow-none text-zinc-400" data-testid="tab-watchlist">
              <Eye className="h-4 w-4 mr-2" />
              Watchlist ({watchlist.length})
            </TabsTrigger>
            <TabsTrigger value="breaches" className="data-[state=active]:!bg-orange-500 data-[state=active]:!text-white data-[state=active]:!shadow-none text-zinc-400" data-testid="tab-breaches">
              <Database className="h-4 w-4 mr-2" />
              Breach Database
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="mt-6">
            <div className="space-y-4">
              {loadingNotifs ? (
                Array(3).fill(0).map((_, i) => (
                  <Card key={i} className="border-zinc-800 bg-zinc-900/50">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-48" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : notifications.length === 0 ? (
                <Card className="border-zinc-800 bg-zinc-900/50">
                  <CardContent className="p-12 text-center">
                    <Bell className="h-16 w-16 mx-auto text-zinc-600 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Alerts Yet</h3>
                    <p className="text-zinc-400 max-w-md mx-auto">
                      Add items to your watchlist to receive real-time alerts when new threats match your criteria.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                notifications.map((notif: UserNotification) => {
                  const TypeIcon = getTypeIcon(notif.type);
                  return (
                    <Card 
                      key={notif.id} 
                      className={`border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors ${!notif.read ? 'border-l-4 border-l-orange-500' : ''}`}
                      data-testid={`card-notification-${notif.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className={`p-2 rounded-lg ${getSeverityColor(notif.severity)}`}>
                            <TypeIcon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-bold text-white">{notif.title}</h4>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">{notif.type}</Badge>
                                {!notif.read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleMarkRead(notif.id)}
                                    className="h-7 px-2 text-xs"
                                    data-testid={`button-mark-read-${notif.id}`}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Mark Read
                                  </Button>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{notif.message}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {notif.createdAt ? new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(notif.createdAt)) : 'Unknown'}
                              </span>
                              {notif.severity && (
                                <Badge className={`text-xs ${getSeverityColor(notif.severity)}`}>
                                  {notif.severity}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="watchlist" className="mt-6">
            <Card className="border-white/5 bg-card/40 mb-6">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  Add to Watchlist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Select 
                    value={newWatchItem.type} 
                    onValueChange={(v) => setNewWatchItem(prev => ({ ...prev, type: v }))}
                  >
                    <SelectTrigger className="w-full sm:w-48 bg-background/50 border-white/10" data-testid="select-watchlist-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WATCHLIST_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <span className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder={`Enter ${WATCHLIST_TYPES.find(t => t.value === newWatchItem.type)?.label.toLowerCase() || 'value'} to watch\u2026`}
                    value={newWatchItem.value}
                    onChange={(e) => setNewWatchItem(prev => ({ ...prev, value: e.target.value }))}
                    className="flex-1 bg-background/50 border-white/10"
                    name="watchlist-value"
                    autoComplete="off"
                    data-testid="input-watchlist-value"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddWatchItem()}
                  />
                  <Button 
                    onClick={handleAddWatchItem}
                    disabled={!newWatchItem.value.trim() || addWatchlistItem.isPending}
                    className="bg-primary text-black hover:bg-primary/90"
                    data-testid="button-add-watchlist"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {loadingWatchlist ? (
                Array(3).fill(0).map((_, i) => (
                  <Card key={i} className="border-white/5 bg-card/40">
                    <CardContent className="p-4">
                      <div className="flex gap-4 items-center">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-32 mb-1" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : watchlist.length === 0 ? (
                <Card className="border-white/5 bg-card/40">
                  <CardContent className="p-12 text-center">
                    <Eye className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Watchlist Empty</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Add companies, CVEs, threat actors, or keywords to monitor for new threats.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                watchlist.map((item: WatchlistItem) => {
                  const typeInfo = WATCHLIST_TYPES.find(t => t.value === item.itemType);
                  const TypeIcon = typeInfo?.icon || Tag;
                  return (
                    <Card 
                      key={item.id} 
                      className="border-white/5 bg-card/40 hover:bg-card/60 transition-colors"
                      data-testid={`card-watchlist-${item.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <TypeIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-white">{item.itemValue}</h4>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge variant="outline" className="text-xs">{typeInfo?.label || item.itemType}</Badge>
                              {item.alertOnMatch && (
                                <Badge className="bg-primary/20 text-primary text-xs">
                                  <Bell className="h-3 w-3 mr-1" />
                                  Alerts On
                                </Badge>
                              )}
                              {item.emailOnMatch && (
                                <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                                  <Mail className="h-3 w-3 mr-1" />
                                  Email On
                                </Badge>
                              )}
                              {item.smsOnMatch && (
                                <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  SMS On
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                Added {item.createdAt ? new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(item.createdAt)) : 'Unknown'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleEmailAlerts(item.id, item.emailOnMatch)}
                              className={item.emailOnMatch 
                                ? "text-blue-400 hover:bg-blue-500/10" 
                                : "text-muted-foreground hover:bg-muted/10"}
                              title={item.emailOnMatch ? "Disable email alerts" : "Enable email alerts"}
                              aria-label={item.emailOnMatch ? "Disable email alerts" : "Enable email alerts"}
                              data-testid={`button-toggle-email-${item.id}`}
                            >
                              {item.emailOnMatch ? <Mail className="h-4 w-4" /> : <MailX className="h-4 w-4" />}
                            </Button>
                            {isBusiness && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleToggleSmsAlerts(item.id, item.smsOnMatch)}
                                className={item.smsOnMatch 
                                  ? "text-purple-400 hover:bg-purple-500/10" 
                                  : "text-muted-foreground hover:bg-muted/10"}
                                title={item.smsOnMatch ? "Disable SMS alerts" : "Enable SMS alerts (Business)"}
                                aria-label={item.smsOnMatch ? "Disable SMS alerts" : "Enable SMS alerts"}
                                data-testid={`button-toggle-sms-${item.id}`}
                              >
                                {item.smsOnMatch ? <MessageSquare className="h-4 w-4" /> : <MessageSquareOff className="h-4 w-4" />}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => { if (window.confirm('Remove this item from your watchlist?')) handleDeleteWatchItem(item.id); }}
                              className="text-destructive hover:bg-destructive/10"
                              aria-label="Delete watchlist item"
                              data-testid={`button-delete-watchlist-${item.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="breaches" className="mt-6">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search breaches by name, domain, or description\u2026"
                  value={breachSearch}
                  onChange={(e) => setBreachSearch(e.target.value)}
                  className="pl-10 bg-background/50 border-white/10"
                  name="breach-search"
                  autoComplete="off"
                  aria-label="Search breaches"
                  data-testid="input-breach-search"
                />
              </div>
            </div>

            <div className="space-y-4">
              {loadingBreaches ? (
                Array(4).fill(0).map((_, i) => (
                  <Card key={i} className="border-white/5 bg-card/40">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-full" />
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-20" />
                          <Skeleton className="h-5 w-24" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : breaches.length === 0 ? (
                <Card className="border-white/5 bg-card/40">
                  <CardContent className="p-12 text-center">
                    <Database className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Breach Data</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Breach intelligence data is being aggregated from various sources. Check back soon.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                breaches.map((breach) => (
                  <Card 
                    key={breach.id} 
                    className="border-white/5 bg-card/40 hover:bg-card/60 transition-colors"
                    data-testid={`card-breach-${breach.id}`}
                  >
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                              {breach.name}
                              {breach.isVerified && (
                                <Badge className="bg-green-600 text-white text-xs">Verified</Badge>
                              )}
                            </h3>
                            {breach.domain && (
                              <a 
                                href={`https://${breach.domain}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline flex items-center gap-1"
                              >
                                <Globe className="h-3 w-3" />
                                {breach.domain}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                          <div className="text-right">
                            {breach.pwnCount && (
                              <div className="text-lg font-bold text-destructive">
                                {parseInt(breach.pwnCount).toLocaleString()} accounts
                              </div>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {breach.breachDate ? new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(breach.breachDate)) : 'Date unknown'}
                            </span>
                          </div>
                        </div>
                        
                        {breach.description && (
                          <p className="text-sm text-muted-foreground">{breach.description}</p>
                        )}

                        <div className="flex flex-wrap gap-2 mt-1">
                          {breach.dataClasses && (() => {
                            try {
                              const classes = JSON.parse(breach.dataClasses);
                              return classes.slice(0, 6).map((dc: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs border-white/10">
                                  {dc}
                                </Badge>
                              ));
                            } catch {
                              return null;
                            }
                          })()}
                          {breach.isSensitive && (
                            <Badge className="bg-destructive/20 text-destructive text-xs">Sensitive</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      {smsConsentDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" data-testid="dialog-sms-consent">
          <Card className="max-w-md w-full mx-4 border-zinc-700 bg-zinc-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <MessageSquare className="h-5 w-5 text-purple-400" />
                SMS Alerts Consent
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-zinc-400">
                By enabling SMS alerts, you consent to receive recurring automated text messages from STB Cybersecurity at the phone number on your account via our toll-free number (855) STB-1987.
              </p>
              <div className="text-xs text-zinc-500 space-y-1">
                <p>Message frequency varies based on threat activity. Message and data rates may apply.</p>
                <p>Reply STOP to cancel at any time. Reply HELP for assistance.</p>
                <p>Consent is not a condition of any purchase.</p>
              </div>
              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  id="sms-consent-checkbox"
                  checked={smsConsentChecked}
                  onChange={(e) => setSmsConsentChecked(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-zinc-600 bg-zinc-800 accent-orange-500"
                  data-testid="checkbox-sms-consent"
                />
                <label htmlFor="sms-consent-checkbox" className="text-xs text-zinc-400 leading-relaxed">
                  I agree to the{" "}
                  <a href="/sms-terms" target="_blank" className="text-primary hover:underline">SMS Terms &amp; Conditions</a>
                  {" "}and{" "}
                  <a href="/privacy" target="_blank" className="text-primary hover:underline">Privacy Policy</a>
                  . I consent to receive automated SMS threat alerts at my phone number. I understand that message and data rates may apply and that I can opt out at any time by replying STOP.
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 border-zinc-700"
                  onClick={() => { setSmsConsentDialog(null); setSmsConsentChecked(false); }}
                  data-testid="button-sms-consent-cancel"
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  disabled={!smsConsentChecked}
                  onClick={handleConfirmSmsConsent}
                  data-testid="button-sms-consent-confirm"
                >
                  Enable SMS Alerts
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <Footer />
    </Layout>
  );
}