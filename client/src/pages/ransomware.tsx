import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useRansomware, useRansomwareGroups, useRansomwareSearch, useExportData, useTrackView } from "@/lib/api";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download, ExternalLink, Globe, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, KeyboardEvent } from "react";

export default function Ransomware() {
  useDocumentTitle("Ransomware Tracker | STB Cybersecurity");
  const [selectedGroup, setSelectedGroup] = useState<string | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  
  const { data, isLoading } = useRansomware(1000, 0, selectedGroup);
  const { data: groups } = useRansomwareGroups();
  const trackView = useTrackView();
  const { data: searchResults, isLoading: isSearching } = useRansomwareSearch(activeSearch);
  const exportMutation = useExportData();
  
  const handleSearch = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim().length >= 2) {
      setActiveSearch(searchQuery.trim());
      setSelectedGroup(undefined);
    }
  };
  
  const clearSearch = () => {
    setSearchQuery("");
    setActiveSearch("");
  };
  
  const incidents = activeSearch ? (searchResults?.data || []) : (data?.data || []);
  const loading = activeSearch ? isSearching : isLoading;

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">Ransomware Tracker</h1>
            <p className="text-muted-foreground">Monitor active ransomware groups, victim postings, and negotiation statuses.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
             <Button 
              variant="outline" 
              className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10" 
              data-testid="button-export"
              onClick={() => exportMutation.mutate('ransomware')}
              disabled={exportMutation.isPending}
            >
              {exportMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              Export JSON
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90" 
              data-testid="button-report-incident"
              onClick={() => window.location.href = 'mailto:info@stbcybersecurity.com?subject=Ransomware%20Incident%20Report&body=Please%20provide%20details%20about%20the%20ransomware%20incident.'}
            >
              Report Incident
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-white/5 bg-card/50">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search victims, groups, countries... (press Enter)" 
                className="pl-10 bg-background/50 border-white/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                data-testid="input-search"
              />
              {activeSearch && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                  onClick={clearSearch}
                  data-testid="button-clear-search"
                >
                  Clear
                </Button>
              )}
            </div>
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
              <Button 
                variant={selectedGroup ? "secondary" : "ghost"} 
                size="sm" 
                className="border border-white/10 bg-white/5 text-muted-foreground hover:text-white whitespace-nowrap"
                onClick={() => setSelectedGroup(undefined)}
                data-testid="button-filter-all"
              >
                <Filter className="h-3 w-3 mr-2" />
                All Groups
              </Button>
              {groups?.slice(0, 4).map((g) => (
                <Button 
                  key={g.name}
                  variant={selectedGroup === g.name ? "secondary" : "ghost"} 
                  size="sm" 
                  className="border border-white/10 bg-white/5 text-muted-foreground hover:text-white whitespace-nowrap"
                  onClick={() => setSelectedGroup(g.name)}
                  data-testid={`button-filter-${g.name.replace(/[^a-zA-Z0-9]/g, '')}`}
                >
                  {g.name} ({g.count})
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search Results Info */}
        {activeSearch && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Search className="h-4 w-4" />
            <span>Search results for "{activeSearch}" - {incidents.length} results found</span>
          </div>
        )}

        {/* Incidents Grid */}
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <Card key={i} className="border-white/5 bg-card/40">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                      <Skeleton className="h-4 w-full max-w-md" />
                      <div className="flex gap-4">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-4">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : incidents.length > 0 ? (
            incidents.map((incident) => (
              <Card 
                key={incident.id} 
                className="border-white/5 bg-card/40 hover:bg-card/60 transition-colors group cursor-pointer" 
                data-testid={`card-incident-${incident.id}`}
                onClick={() => trackView.mutate({ contentType: 'ransomware', contentId: incident.id })}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                          {incident.victim}
                        </h3>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {incident.groupName}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm">{incident.description}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-4 font-mono">
                        {incident.sector && (
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-white/20"></span>
                            {incident.sector}
                          </span>
                        )}
                        {incident.dataSize && (
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-white/20"></span>
                            Data: {incident.dataSize}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-white/20"></span>
                          {incident.discoveredAt ? new Date(incident.discoveredAt).toLocaleDateString() : 'N/A'}
                        </span>
                        {incident.country && (
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-white/20"></span>
                            {incident.country}
                          </span>
                        )}
                        {incident.attackVector && (
                          <span className="flex items-center gap-1 text-orange-400">
                            <span className="w-2 h-2 rounded-full bg-orange-400/50"></span>
                            Vector: {incident.attackVector}
                          </span>
                        )}
                        {incident.website && (
                          <a 
                            href={incident.website.startsWith('http') ? incident.website : `https://${incident.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                            data-testid={`link-website-${incident.id}`}
                          >
                            <Globe className="h-3 w-3" />
                            Website
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      {(incident.ransomAmount || incident.bitcoinWallet || incident.victimRevenue) && (
                        <div className="flex flex-wrap gap-4 text-xs mt-2 pt-2 border-t border-white/5">
                          {incident.ransomAmount && (
                            <span className="flex items-center gap-1 text-red-400">
                              Ransom: {incident.ransomCurrency || '$'}{incident.ransomAmount}
                            </span>
                          )}
                          {incident.paymentStatus && (
                            <span className={`flex items-center gap-1 ${incident.paymentStatus === 'Paid' ? 'text-red-400' : 'text-green-400'}`}>
                              {incident.paymentStatus}
                            </span>
                          )}
                          {incident.victimRevenue && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              Est. Revenue: {incident.victimRevenue}
                            </span>
                          )}
                          {incident.employeeCount && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              Employees: {incident.employeeCount}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end justify-between gap-4 min-w-[160px]">
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={
                          incident.status === "Published" ? "bg-destructive hover:bg-destructive/90" : 
                          incident.status === "Negotiating" ? "bg-yellow-600 hover:bg-yellow-700" : 
                          "bg-secondary hover:bg-secondary/90 text-black"
                        }>
                          {incident.status}
                        </Badge>
                        {incident.activity && (
                          <span className="text-xs text-muted-foreground">{incident.activity}</span>
                        )}
                        {incident.sourceApi && (
                          <span className="text-[10px] text-muted-foreground/60">via {incident.sourceApi}</span>
                        )}
                      </div>
                      {incident.screenshotUrl && (
                        <a 
                          href={incident.screenshotUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                          data-testid={`link-screenshot-${incident.id}`}
                        >
                          View Screenshot
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      <Button 
                        variant="link" 
                        className="text-primary p-0 h-auto font-mono text-xs" 
                        data-testid={`link-view-evidence-${incident.id}`}
                        onClick={() => alert('Evidence viewing requires Pro tier access for security reasons.')}
                      >
                        VIEW EVIDENCE &gt;
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-white/5 bg-card/40">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No ransomware incidents found. Data will appear after the first refresh cycle.</p>
              </CardContent>
            </Card>
          )}
        </div>
        <Footer />
      </div>
    </Layout>
  );
}
