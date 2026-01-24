import { useState } from "react";
import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { 
  useNotifications, 
  useWatchlist, 
  useAddWatchlistItem, 
  useDeleteWatchlistItem,
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
  CheckCheck
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEMO_USER_ID = "demo-pro-user";

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
    case "critical": return "bg-destructive text-destructive-foreground";
    case "high": return "bg-orange-600 text-white";
    case "medium": return "bg-yellow-600 text-white";
    case "low": return "bg-blue-600 text-white";
    default: return "bg-secondary text-secondary-foreground";
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
  const [activeTab, setActiveTab] = useState("notifications");
  const [newWatchItem, setNewWatchItem] = useState({ type: "company", value: "" });
  const [breachSearch, setBreachSearch] = useState("");
  
  const { data: notifData, isLoading: loadingNotifs } = useNotifications(DEMO_USER_ID);
  const { data: watchlistData, isLoading: loadingWatchlist } = useWatchlist(DEMO_USER_ID);
  const { data: breachData, isLoading: loadingBreaches } = useBreaches(20, 0, breachSearch || undefined);
  
  const addWatchlistItem = useAddWatchlistItem();
  const deleteWatchlistItem = useDeleteWatchlistItem();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = notifData?.notifications || [];
  const unreadCount = notifData?.unreadCount || 0;
  const watchlist = watchlistData?.items || [];
  const breaches = breachData?.data || [];

  const handleAddWatchItem = () => {
    if (!newWatchItem.value.trim()) return;
    addWatchlistItem.mutate({
      userId: DEMO_USER_ID,
      itemType: newWatchItem.type,
      itemValue: newWatchItem.value.trim(),
      label: null,
      alertOnMatch: true,
      emailOnMatch: false,
      notes: null,
    });
    setNewWatchItem({ type: "company", value: "" });
  };

  const handleDeleteWatchItem = (itemId: string) => {
    deleteWatchlistItem.mutate({ itemId, userId: DEMO_USER_ID });
  };

  const handleMarkRead = (notificationId: string) => {
    markRead.mutate({ notificationId, userId: DEMO_USER_ID });
  };

  const handleMarkAllRead = () => {
    markAllRead.mutate(DEMO_USER_ID);
  };

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-display font-bold text-white">Pro Alerts Center</h1>
              <Badge className="bg-primary text-black font-bold">PRO</Badge>
            </div>
            <p className="text-muted-foreground">Real-time threat alerts, watchlists, and breach intelligence for Pro users.</p>
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              onClick={handleMarkAllRead}
              className="border-primary/30 hover:border-primary text-primary"
              data-testid="button-mark-all-read"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Read ({unreadCount})
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card/40 border border-white/5">
            <TabsTrigger value="notifications" className="data-[state=active]:bg-primary data-[state=active]:text-black" data-testid="tab-notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-destructive text-white text-xs px-1.5">{unreadCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="watchlist" className="data-[state=active]:bg-primary data-[state=active]:text-black" data-testid="tab-watchlist">
              <Eye className="h-4 w-4 mr-2" />
              Watchlist ({watchlist.length})
            </TabsTrigger>
            <TabsTrigger value="breaches" className="data-[state=active]:bg-primary data-[state=active]:text-black" data-testid="tab-breaches">
              <Database className="h-4 w-4 mr-2" />
              Breach Database
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="mt-6">
            <div className="space-y-4">
              {loadingNotifs ? (
                Array(3).fill(0).map((_, i) => (
                  <Card key={i} className="border-white/5 bg-card/40">
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
                <Card className="border-white/5 bg-card/40">
                  <CardContent className="p-12 text-center">
                    <Bell className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No Alerts Yet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
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
                      className={`border-white/5 bg-card/40 hover:bg-card/60 transition-colors ${!notif.read ? 'border-l-4 border-l-primary' : ''}`}
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
                                {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : 'Unknown'}
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
                    placeholder={`Enter ${WATCHLIST_TYPES.find(t => t.value === newWatchItem.type)?.label.toLowerCase() || 'value'} to watch...`}
                    value={newWatchItem.value}
                    onChange={(e) => setNewWatchItem(prev => ({ ...prev, value: e.target.value }))}
                    className="flex-1 bg-background/50 border-white/10"
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
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{typeInfo?.label || item.itemType}</Badge>
                              {item.alertOnMatch && (
                                <Badge className="bg-primary/20 text-primary text-xs">
                                  <Bell className="h-3 w-3 mr-1" />
                                  Alerts On
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                Added {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Unknown'}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteWatchItem(item.id)}
                            className="text-destructive hover:bg-destructive/10"
                            data-testid={`button-delete-watchlist-${item.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
                  placeholder="Search breaches by name, domain, or description..."
                  value={breachSearch}
                  onChange={(e) => setBreachSearch(e.target.value)}
                  className="pl-10 bg-background/50 border-white/10"
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
                              {breach.breachDate ? new Date(breach.breachDate).toLocaleDateString() : 'Date unknown'}
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
      <Footer />
    </Layout>
  );
}