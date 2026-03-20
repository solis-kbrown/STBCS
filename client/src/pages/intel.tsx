import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import NewsTab from "@/pages/news-tab";
import ThreatFeedsTab from "@/pages/threat-feeds-tab";

export default function IntelPage() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialTab = searchParams.get("tab") === "threat-feeds" ? "threat-feeds" : "news";
  const [activeTab, setActiveTab] = useState(initialTab);

  useDocumentTitle(
    activeTab === "news"
      ? "Cybersecurity Intel & News | STB Cybersecurity"
      : "Threat Intelligence Feeds | STB Cybersecurity",
    activeTab === "news"
      ? "Curated cybersecurity news, threat intelligence reports, policy updates, and industry analysis from trusted security sources worldwide."
      : "Real-time malicious IPs, phishing URLs, CISA KEV, and threat indicators from 160+ feeds including SANS DShield, Feodo Tracker, and more."
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "threat-feeds" || tab === "news") {
      setActiveTab(tab);
    }
  }, [location]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setLocation(`/intel?tab=${value}`);
  };

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-display font-bold text-white mb-2">Intel & Feeds</h1>
          <p className="text-muted-foreground">Curated cybersecurity news and live threat intelligence data from 160+ sources, updated continuously.</p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="bg-zinc-900/50 border border-zinc-500" data-testid="tabs-intel">
            <TabsTrigger value="news" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400" data-testid="tab-news">
              News
            </TabsTrigger>
            <TabsTrigger value="threat-feeds" className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400" data-testid="tab-threat-feeds">
              Threat Feeds
            </TabsTrigger>
          </TabsList>

          <TabsContent value="news">
            <NewsTab />
          </TabsContent>

          <TabsContent value="threat-feeds">
            <ThreatFeedsTab />
          </TabsContent>
        </Tabs>

        <Footer />
      </div>
    </Layout>
  );
}