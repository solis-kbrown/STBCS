import Layout from "@/components/layout";
import { useRansomware, useRansomwareGroups } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

export default function Ransomware() {
  const [selectedGroup, setSelectedGroup] = useState<string | undefined>();
  const { data, isLoading } = useRansomware(50, 0, selectedGroup);
  const { data: groups } = useRansomwareGroups();
  
  const incidents = data?.data || [];

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">Ransomware Tracker</h1>
            <p className="text-muted-foreground">Monitor active ransomware groups, victim postings, and negotiation statuses.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
             <Button variant="outline" className="border-white/10 hover:bg-white/5" data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button className="bg-primary hover:bg-primary/90" data-testid="button-report-incident">
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
                placeholder="Search victims, groups, or sectors..." 
                className="pl-10 bg-background/50 border-white/10"
                data-testid="input-search"
              />
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

        {/* Incidents Grid */}
        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
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
              <Card key={incident.id} className="border-white/5 bg-card/40 hover:bg-card/60 transition-colors group" data-testid={`card-incident-${incident.id}`}>
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
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-white/20"></span>
                          {incident.sector}
                        </span>
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
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end justify-between gap-4 min-w-[140px]">
                      <Badge className={
                        incident.status === "Published" ? "bg-destructive hover:bg-destructive/90" : 
                        incident.status === "Negotiating" ? "bg-yellow-600 hover:bg-yellow-700" : 
                        "bg-secondary hover:bg-secondary/90 text-black"
                      }>
                        {incident.status}
                      </Badge>
                      <Button variant="link" className="text-primary p-0 h-auto font-mono text-xs" data-testid={`link-view-evidence-${incident.id}`}>
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
      </div>
    </Layout>
  );
}
