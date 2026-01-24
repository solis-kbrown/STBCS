import Layout from "@/components/layout";
import { latestNews } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Globe, Share2 } from "lucide-react";

export default function News() {
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
            {latestNews.map((news) => (
              <Card key={news.id} className="border-white/5 bg-card/40 hover:bg-card/60 transition-colors group overflow-hidden">
                <CardContent className="p-0 flex flex-col sm:flex-row">
                  <div className="w-full sm:w-48 bg-white/5 shrink-0 flex items-center justify-center p-8 sm:p-0">
                    <Globe className="h-12 w-12 text-white/20 group-hover:text-primary/50 transition-colors" />
                  </div>
                  <div className="p-6 flex-1 space-y-4">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">
                        {news.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-mono">
                        {new Date(news.date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                        {news.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {news.summary}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs font-bold text-white/50">{news.source}</span>
                      <div className="flex gap-2">
                         <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-white">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="border-white/10 hover:border-primary/50 hover:text-primary text-xs">
                          READ FULL <ArrowRight className="ml-2 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sidebar Widgets */}
          <div className="space-y-6">
            <Card className="border-white/5 bg-card/50">
              <CardContent className="p-6">
                <h3 className="font-display font-bold text-white mb-4">Trending Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {["#Ransomware", "#ZeroDay", "#Infosec", "#DataBreach", "#CyberWar", "#AI", "#CloudSecurity"].map(tag => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-secondary/80">
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
                  />
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90">SUBSCRIBE</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}