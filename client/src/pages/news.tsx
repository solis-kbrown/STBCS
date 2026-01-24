import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useNews } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, Share2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function News() {
  const { data, isLoading } = useNews(20);
  
  const news = data?.data || [];

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-display font-bold text-white mb-2">Intel & News</h1>
          <p className="text-muted-foreground">Curated cybersecurity news, policy updates, and threat intelligence reports.</p>
        </div>

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
            ) : news.length > 0 ? (
              news.map((article) => (
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
                        <div className="flex gap-2">
                           <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:text-white" 
                            data-testid={`button-share-${article.id}`}
                            onClick={() => {
                              navigator.clipboard.writeText(window.location.href);
                              alert('Link copied to clipboard!');
                            }}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-white/10 hover:border-primary/50 hover:text-primary text-xs" 
                            data-testid={`button-read-${article.id}`}
                            onClick={() => article.sourceUrl ? window.open(article.sourceUrl, '_blank') : alert('Source link not available for this article.')}
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
                  <p className="text-muted-foreground">No news articles loaded yet. Data will appear after the first refresh cycle.</p>
                </CardContent>
              </Card>
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
                  onClick={() => alert('Newsletter subscription coming soon! Check back later.')}
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
