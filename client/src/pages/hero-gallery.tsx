import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Monitor, Zap, Layers, Eye, Image, Copyright, Paintbrush } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AnimatedMap from "@/components/animated-map";
import { HERO_BACKGROUNDS, getHeroBackground } from "@/components/hero-backgrounds";

export default function HeroGallery() {
  useDocumentTitle("Hero Backgrounds | STB Cybersecurity", "Browse and select hero background styles for the STBCS dashboard.");
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState<string | null>(null);

  const { data: settingsData } = useQuery({
    queryKey: ["/api/site-settings/hero-bg"],
    queryFn: () => fetch("/api/site-settings/hero-bg").then(r => r.json()).catch(() => ({ value: "threat-map" })),
  });

  const currentBg = settingsData?.value || "threat-map";

  const selectMutation = useMutation({
    mutationFn: async (bgId: string) => {
      const res = await fetch("/api/site-settings/hero-bg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: bgId }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-settings/hero-bg"] });
    },
  });

  const renderBgPreview = (id: string) => {
    if (id === "threat-map") return <AnimatedMap />;
    return getHeroBackground(id);
  };

  return (
    <Layout>
      <div className="space-y-8 page-transition">
        <div className="flex items-center gap-4 mb-2">
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white" asChild data-testid="link-back">
            <Link href="/brand-kit"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-display font-bold text-white" data-testid="text-page-title">Brand &amp; Theme Center</h1>
            <p className="text-zinc-400 text-sm mt-1">Customize logos, icon themes, and hero backgrounds</p>
          </div>
        </div>

        <div className="flex items-center gap-2 border-b border-zinc-800 pb-0" data-testid="brand-tabs">
          <Link href="/logos">
            <button className="px-4 py-2.5 text-sm font-medium border-b-2 border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 rounded-t-lg transition-colors" data-testid="tab-logos">
              <Copyright className="h-4 w-4 inline mr-1.5 -mt-0.5" />Logos
            </button>
          </Link>
          <Link href="/logos#icon-themes">
            <button className="px-4 py-2.5 text-sm font-medium border-b-2 border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 rounded-t-lg transition-colors" data-testid="tab-icon-themes">
              <Paintbrush className="h-4 w-4 inline mr-1.5 -mt-0.5" />Icon Themes
            </button>
          </Link>
          <Link href="/hero-backgrounds">
            <button className="px-4 py-2.5 text-sm font-medium border-b-2 border-orange-500 text-orange-400 bg-orange-500/5 rounded-t-lg" data-testid="tab-backgrounds">
              <Monitor className="h-4 w-4 inline mr-1.5 -mt-0.5" />Hero Backgrounds
            </button>
          </Link>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="outline" className="border-orange-500/30 text-orange-400">
            <Monitor className="h-3 w-3 mr-1" /> {HERO_BACKGROUNDS.length} Options
          </Badge>
          <Badge variant="outline" className="border-zinc-700 text-zinc-400">
            <Zap className="h-3 w-3 mr-1" /> {HERO_BACKGROUNDS.filter(b => (b.tags as readonly string[]).includes("animated")).length} Animated
          </Badge>
          <Badge variant="outline" className="border-zinc-700 text-zinc-400">
            <Layers className="h-3 w-3 mr-1" /> {HERO_BACKGROUNDS.filter(b => (b.tags as readonly string[]).includes("static")).length} Static
          </Badge>
          <Badge variant="outline" className="border-zinc-700 text-zinc-400">
            <Image className="h-3 w-3 mr-1" /> {HERO_BACKGROUNDS.filter(b => (b.tags as readonly string[]).includes("image")).length} HD Images
          </Badge>
        </div>

        {preview && (
          <Card className="border-orange-500/20 bg-card overflow-hidden" data-testid="card-fullpreview">
            <div className="relative h-64 bg-zinc-950 overflow-hidden rounded-t-lg">
              <div className="absolute inset-0 z-0">
                {renderBgPreview(preview)}
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
              </div>
              <div className="relative z-10 p-8 flex items-center h-full max-w-2xl">
                <div>
                  <Badge className="mb-4 bg-primary/20 text-primary border-primary/50">
                    <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse" />
                    LIVE THREAT LEVEL: ELEVATED
                  </Badge>
                  <h2 className="text-4xl font-display font-bold text-white mb-2 tracking-wide">
                    KNOW THE THREAT <span className="text-primary">BEFORE IT HITS</span>
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    70+ live threat feeds. Ransomware tracking. CVE monitoring.
                  </p>
                </div>
              </div>
            </div>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">{HERO_BACKGROUNDS.find(b => b.id === preview)?.name}</p>
                <p className="text-zinc-500 text-sm">Full-size preview with hero overlay</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="border-zinc-700 text-zinc-400" onClick={() => setPreview(null)} data-testid="button-close-preview">Close Preview</Button>
                {preview !== currentBg && (
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => selectMutation.mutate(preview)}
                    disabled={selectMutation.isPending}
                    data-testid="button-apply-from-preview"
                  >
                    <Check className="h-4 w-4 mr-2" /> Apply This Background
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {HERO_BACKGROUNDS.map((bg) => {
            const isActive = bg.id === currentBg;
            return (
              <Card
                key={bg.id}
                className={`overflow-hidden border transition-all ${isActive ? "border-orange-500/50 ring-1 ring-orange-500/20" : "border-white/5 hover:border-white/15"}`}
                data-testid={`card-bg-${bg.id}`}
              >
                <div className="relative h-40 bg-zinc-950 overflow-hidden cursor-pointer" onClick={() => setPreview(bg.id)}>
                  <div className="absolute inset-0">
                    {renderBgPreview(bg.id)}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent" />
                  {isActive && (
                    <div className="absolute top-2 right-2 z-10">
                      <Badge className="bg-orange-500 text-white border-0 text-[10px]">
                        <Check className="h-3 w-3 mr-1" /> ACTIVE
                      </Badge>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 z-10 flex gap-1">
                    {bg.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="bg-zinc-950/80 border-zinc-700 text-zinc-400 text-[10px] px-1.5 py-0">{tag}</Badge>
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/30 z-10">
                    <Badge className="bg-zinc-900/90 border-zinc-700 text-zinc-200">
                      <Eye className="h-3 w-3 mr-1" /> Click to Preview
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="text-white font-bold text-sm" data-testid={`text-bg-name-${bg.id}`}>{bg.name}</h3>
                    <p className="text-zinc-500 text-xs mt-1 leading-relaxed">{bg.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-zinc-700 text-zinc-400 hover:text-white text-xs"
                      onClick={() => setPreview(bg.id)}
                      data-testid={`button-preview-${bg.id}`}
                    >
                      <Eye className="h-3 w-3 mr-1" /> Preview
                    </Button>
                    {isActive ? (
                      <Button size="sm" className="flex-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs" disabled>
                        <Check className="h-3 w-3 mr-1" /> Active
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="flex-1 bg-primary hover:bg-primary/90 text-xs"
                        onClick={() => selectMutation.mutate(bg.id)}
                        disabled={selectMutation.isPending}
                        data-testid={`button-apply-${bg.id}`}
                      >
                        Apply
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Footer />
      </div>
    </Layout>
  );
}
