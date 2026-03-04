import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useNews } from "@/lib/api";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Globe, Search, ArrowUpDown, SlidersHorizontal, RotateCcw, Linkedin, Mail, Link2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import PaginationControls from "@/components/pagination-controls";

type SortOption = "newest" | "oldest" | "source-az";

export default function News() {
  useDocumentTitle("Cybersecurity Intel & News | STB Cybersecurity", "Curated cybersecurity news, threat intelligence reports, policy updates, and industry analysis from trusted security sources worldwide.");
  const { toast } = useToast();
  const { data, isLoading } = useNews(1000);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  
  const rawNews = data?.data || [];

  const categories = useMemo(() => {
    const cats = new Set<string>();
    rawNews.forEach(a => { if (a.category) cats.add(a.category); });
    return Array.from(cats).sort();
  }, [rawNews]);

  const activeFilterCount = [
    sortBy !== "newest",
    categoryFilter !== "all",
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSortBy("newest");
    setCategoryFilter("all");
    setCurrentPage(1);
  };

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);

  const news = useMemo(() => {
    let filtered = [...rawNews];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(a =>
        (a.title || "").toLowerCase().includes(q) ||
        (a.summary || "").toLowerCase().includes(q) ||
        (a.source || "").toLowerCase().includes(q) ||
        (a.category || "").toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(a => a.category === categoryFilter);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest": return new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime();
        case "oldest": return new Date(a.publishedAt || 0).getTime() - new Date(b.publishedAt || 0).getTime();
        case "source-az": return (a.source || "").localeCompare(b.source || "");
        default: return 0;
      }
    });

    return filtered;
  }, [rawNews, search, sortBy, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(news.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedNews = news.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-display font-bold text-white mb-2">Intel & News</h1>
          <p className="text-muted-foreground">Breaking security news, threat reports, and policy updates from trusted sources. Updated continuously.</p>
        </div>

        <Card className="border-white/5 bg-card/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-stretch">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by title, summary, source, or category..." 
                  className="pl-10 bg-background/50 border-zinc-500 h-10"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  data-testid="input-search-news"
                />
              </div>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={(v) => { setSortBy(v as SortOption); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[180px] bg-background/50 border-zinc-500 h-10" data-testid="select-sort-news">
                    <ArrowUpDown className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="source-az">Source A-Z</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  className={`border-zinc-500 h-10 px-3 ${showFilters ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'text-muted-foreground hover:text-white'}`}
                  onClick={() => setShowFilters(!showFilters)}
                  data-testid="button-toggle-filters"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge className="ml-2 bg-orange-500 text-white text-[10px] h-5 w-5 p-0 flex items-center justify-center rounded-full">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>

            {showFilters && (
              <div className="flex flex-wrap gap-3 pt-2 border-t border-white/5 animate-in slide-in-from-top-2 duration-200">
                <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-[200px] bg-background/50 border-zinc-500 h-9 text-sm" data-testid="select-category-filter">
                    <SlidersHorizontal className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 text-sm text-muted-foreground hover:text-white"
                    onClick={clearAllFilters}
                    data-testid="button-clear-filters"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span data-testid="text-result-count">
                {activeFilterCount > 0
                  ? `${news.length} articles (filtered from ${(data?.total || 0).toLocaleString()}) | ${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active`
                  : `${(data?.total || 0).toLocaleString()} articles`
                }
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <Card key={i} className="border-white/5 bg-card/40">
                  <CardContent className="p-0 flex flex-col sm:flex-row">
                    <div className="w-full sm:w-48 bg-white/5 shrink-0 h-32 sm:h-auto" />
                    <div className="p-6 flex-1 space-y-4">
                      <div className="flex justify-between">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-6 w-full max-w-sm" />
                      <Skeleton className="h-16 w-full" />
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-8 w-28" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : paginatedNews.length > 0 ? (
              paginatedNews.map((article) => (
                <Card key={article.id} className="border-white/5 bg-card/40 hover:bg-card/60 transition-colors group overflow-hidden" data-testid={`card-news-${article.id}`}>
                  <CardContent className="p-0 flex flex-col sm:flex-row">
                    <div className="w-full sm:w-48 bg-white/5 shrink-0 flex items-center justify-center p-8 sm:p-0">
                      <Globe className="h-12 w-12 text-white/20 group-hover:text-primary/50 transition-colors" />
                    </div>
                    <div className="p-6 flex-1 space-y-4">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">
                          {article.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono">
                          {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {article.summary}
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        <span className="text-xs font-bold text-white/50">{article.source}</span>
                        <div className="flex gap-1 items-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:text-[#1DA1F2]"
                            title="Share on Twitter/X"
                            data-testid={`button-share-twitter-${article.id}`}
                            onClick={() => {
                              const shareUrl = article.sourceUrl || window.location.href;
                              const text = encodeURIComponent(`${article.title} — via STB Cybersecurity`);
                              const url = encodeURIComponent(shareUrl);
                              window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
                            }}
                          >
                            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:text-[#0A66C2]"
                            title="Share on LinkedIn"
                            data-testid={`button-share-linkedin-${article.id}`}
                            onClick={() => {
                              const shareUrl = article.sourceUrl || window.location.href;
                              const url = encodeURIComponent(shareUrl);
                              window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
                            }}
                          >
                            <Linkedin className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:text-orange-400"
                            title="Share via Email"
                            data-testid={`button-share-email-${article.id}`}
                            onClick={() => {
                              const shareUrl = article.sourceUrl || window.location.href;
                              const subject = encodeURIComponent(article.title || 'Cybersecurity News');
                              const body = encodeURIComponent(`${article.title}\n\n${article.summary || ''}\n\nRead more: ${shareUrl}\n\nShared via STB Cybersecurity`);
                              window.location.href = `mailto:?subject=${subject}&body=${body}`;
                            }}
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:text-white"
                            title="Copy Link"
                            data-testid={`button-share-copy-${article.id}`}
                            onClick={() => {
                              const shareUrl = article.sourceUrl || window.location.href;
                              navigator.clipboard.writeText(shareUrl).then(() => {
                                toast({ title: "Link copied to clipboard" });
                              }).catch(() => {
                                toast({ title: "Failed to copy link", variant: "destructive" });
                              });
                            }}
                          >
                            <Link2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-zinc-500 hover:border-primary/50 hover:text-primary text-xs ml-1" 
                            data-testid={`button-read-${article.id}`}
                            onClick={() => article.sourceUrl ? window.open(article.sourceUrl, '_blank') : toast({ title: "Source link not available", description: "No source URL is available for this article.", variant: "destructive" })}
                          >
                            READ FULL <ArrowRight className="ml-2 h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-white/5 bg-card/40">
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">{search ? `No articles found matching "${search}".` : activeFilterCount > 0 ? 'No articles match the current filters. Try adjusting your filters.' : 'No news articles loaded yet. Data will appear after the first refresh cycle.'}</p>
                </CardContent>
              </Card>
            )}
            {!isLoading && news.length > 0 && (
              <PaginationControls
                currentPage={safePage}
                totalPages={totalPages}
                pageSize={pageSize}
                totalItems={news.length}
                onPageChange={setCurrentPage}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </div>

          {/* Sidebar Widgets */}
          <div className="space-y-6">
            <Card className="border-white/5 bg-card/50">
              <CardContent className="p-6">
                <h3 className="font-display font-bold text-white mb-4">Trending Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {["#Ransomware", "#ZeroDay", "#Infosec", "#DataBreach", "#CyberWar", "#AI", "#CloudSecurity"].map(tag => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-secondary/80" data-testid={`tag-${tag.replace('#', '')}`}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="p-6 text-center space-y-4">
                <h3 className="font-display font-bold text-primary text-lg">Daily Intel Brief</h3>
                <p className="text-sm text-muted-foreground">Get the top 5 daily threats delivered to your inbox every morning.</p>
                <div className="flex gap-2">
                  <input 
                    type="email" 
                    placeholder="Enter email" 
                    className="flex-1 bg-background/50 border border-primary/20 rounded px-3 text-sm focus:outline-none focus:border-primary"
                    data-testid="input-email-subscribe"
                  />
                </div>
                <Button 
                  className="w-full bg-primary hover:bg-primary/90" 
                  data-testid="button-subscribe"
                  onClick={() => window.location.href = '/support'}
                >SUBSCRIBE</Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    </Layout>
  );
}
