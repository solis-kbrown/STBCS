import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDocumentTitle } from "@/lib/use-document-title";
import { ArrowLeft, Check, Shield, Copyright, Eye, ThumbsUp, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const currentLogo = {
  name: "Hex Lock — Red Banner",
  description: "Hexagonal shield with honeycomb mesh, orange binary code, silver chrome border, red 'Stop The Bleed' banner with white text, red glow, padlock centerpiece",
  file: "/brand/logo-main.png",
  icon: "/brand/icon-shield.png",
  version: "v2.1",
  updated: "February 2026",
  active: true,
};

const votableVariants = [
  { id: "red-banner", name: "Red Banner (Current)", file: "/brand/logo-main.png", icon: "/brand/icon-shield.png", desc: "Red banner, red glow — v2.1 current" },
  { id: "cyan-banner", name: "Cyan Banner (Original)", file: "/brand/logo-main-cyan.png", icon: "/brand/icon-shield-cyan.png", desc: "Cyan banner, cyan glow — v2.0 original" },
];

const variations = [
  {
    category: "Primary Assets",
    items: [
      { name: "Full Logo (Current)", file: "/brand/logo-main.png", size: "1024×1024", usage: "Sidebar, about page, support page, social cards", active: true },
      { name: "Shield Icon (Current)", file: "/brand/icon-shield.png", size: "1024×1024", usage: "Favicons, mobile header, footer, chat widget, auth modal, email headers" },
      { name: "Full Logo — Cyan Version", file: "/brand/logo-main-cyan.png", size: "1024×1024", usage: "Original v2.0 — archived, cyan banner + glow variant" },
      { name: "Shield Icon — Cyan Version", file: "/brand/icon-shield-cyan.png", size: "1024×1024", usage: "Original v2.0 — archived, cyan glow variant" },
    ],
  },
  {
    category: "Favicons",
    items: [
      { name: "Favicon 16px", file: "/brand/favicons/favicon-16.png", size: "16×16", usage: "Browser tab" },
      { name: "Favicon 32px", file: "/brand/favicons/favicon-32.png", size: "32×32", usage: "Browser tab (Retina)" },
      { name: "Favicon 48px", file: "/brand/favicons/favicon-48.png", size: "48×48", usage: "Windows taskbar" },
      { name: "Favicon 64px", file: "/brand/favicons/favicon-64.png", size: "64×64", usage: "Windows site icon" },
      { name: "Favicon 96px", file: "/brand/favicons/favicon-96.png", size: "96×96", usage: "Google TV" },
      { name: "Favicon 128px", file: "/brand/favicons/favicon-128.png", size: "128×128", usage: "Chrome web store" },
      { name: "Favicon 256px", file: "/brand/favicons/favicon-256.png", size: "256×256", usage: "Various" },
    ],
  },
  {
    category: "App Icons",
    items: [
      { name: "Apple Touch 57px", file: "/brand/app-icons/apple-touch-icon-57.png", size: "57×57", usage: "iPhone (non-Retina)" },
      { name: "Apple Touch 60px", file: "/brand/app-icons/apple-touch-icon-60.png", size: "60×60", usage: "iPhone" },
      { name: "Apple Touch 72px", file: "/brand/app-icons/apple-touch-icon-72.png", size: "72×72", usage: "iPad (non-Retina)" },
      { name: "Apple Touch 76px", file: "/brand/app-icons/apple-touch-icon-76.png", size: "76×76", usage: "iPad" },
      { name: "Apple Touch 114px", file: "/brand/app-icons/apple-touch-icon-114.png", size: "114×114", usage: "iPhone (Retina)" },
      { name: "Apple Touch 120px", file: "/brand/app-icons/apple-touch-icon-120.png", size: "120×120", usage: "iPhone (Retina)" },
      { name: "Apple Touch 144px", file: "/brand/app-icons/apple-touch-icon-144.png", size: "144×144", usage: "iPad (Retina)" },
      { name: "Apple Touch 152px", file: "/brand/app-icons/apple-touch-icon-152.png", size: "152×152", usage: "iPad (Retina)" },
      { name: "Apple Touch 180px", file: "/brand/app-icons/apple-touch-icon-180.png", size: "180×180", usage: "iPhone 6 Plus" },
      { name: "Android 192px", file: "/brand/app-icons/android-icon-192.png", size: "192×192", usage: "Android home screen" },
      { name: "Android 384px", file: "/brand/app-icons/android-icon-384.png", size: "384×384", usage: "Android splash screen" },
      { name: "Android 512px", file: "/brand/app-icons/android-icon-512.png", size: "512×512", usage: "Android splash / PWA" },
      { name: "Windows 70px", file: "/brand/app-icons/ms-icon-70.png", size: "70×70", usage: "Windows small tile" },
      { name: "Windows 150px", file: "/brand/app-icons/ms-icon-150.png", size: "150×150", usage: "Windows medium tile" },
      { name: "Windows 310px", file: "/brand/app-icons/ms-icon-310.png", size: "310×310", usage: "Windows large tile" },
    ],
  },
  {
    category: "Social Media & Email",
    items: [
      { name: "Open Graph Image", file: "/brand/social/og-image.png", size: "1200×630", usage: "Facebook, LinkedIn, Discord link previews" },
      { name: "Twitter Header", file: "/brand/social/twitter-header.png", size: "1500×500", usage: "X/Twitter profile banner" },
      { name: "Email Header", file: "/brand/social/email-header.png", size: "600×150", usage: "Alert & digest email banners" },
      { name: "PDF Letterhead", file: "/brand/social/pdf-letterhead.png", size: "2550×400", usage: "Printed reports & invoices" },
    ],
  },
  {
    category: "Derived Assets",
    items: [
      { name: "Sidebar Logo", file: "/brand/icon-sidebar.png", size: "200×200", usage: "Desktop sidebar navigation" },
      { name: "Header Logo", file: "/brand/icon-header.png", size: "120×120", usage: "Mobile header bar" },
    ],
  },
  {
    category: "Concept Logos",
    items: [
      { name: "Hex Binary Shield", file: "/brand/logos/logo-hex-binary.png", size: "1024×1024", usage: "Hexagonal shield with binary code streams" },
      { name: "Firewall Rings", file: "/brand/logos/logo-firewall-rings.png", size: "1024×1024", usage: "Layered firewall defense rings with keyhole" },
      { name: "Stealth Shield", file: "/brand/logos/logo-stealth-shield.png", size: "1024×1024", usage: "Stealth fighter merged with shield shape" },
      { name: "Neural Brain", file: "/brand/logos/logo-neural-brain.png", size: "1024×1024", usage: "AI neural network brain in hexagonal frame" },
      { name: "Cyber Eye", file: "/brand/logos/logo-cyber-eye.png", size: "1024×1024", usage: "All-seeing surveillance eye with circuit pattern" },
      { name: "DNA Lock", file: "/brand/logos/logo-dna-lock.png", size: "1024×1024", usage: "Double helix DNA morphing into digital lock" },
      { name: "Spartan Cyber", file: "/brand/logos/logo-spartan-cyber.png", size: "1024×1024", usage: "Spartan helmet made of circuit board traces" },
      { name: "Phoenix Rise", file: "/brand/logos/logo-phoenix-rise.png", size: "1024×1024", usage: "Phoenix rising from digital ashes — recovery" },
      { name: "Global Mesh", file: "/brand/logos/logo-global-mesh.png", size: "1024×1024", usage: "Honeycomb mesh forming a globe shape" },
      { name: "Sword & Key", file: "/brand/logos/logo-sword-key.png", size: "1024×1024", usage: "Sword crossed with key inside shield crest" },
      { name: "Quantum Chip", file: "/brand/logos/logo-quantum-chip.png", size: "1024×1024", usage: "Quantum computing chip inside shield frame" },
      { name: "Wolf Hunter", file: "/brand/logos/logo-wolf-hunter.png", size: "1024×1024", usage: "Low-poly wolf head — threat hunter predator" },
      { name: "Radar Hex", file: "/brand/logos/logo-radar-hex.png", size: "1024×1024", usage: "Radar dish inside hexagonal surveillance frame" },
      { name: "Digital Fortress", file: "/brand/logos/logo-digital-fortress.png", size: "1024×1024", usage: "Castle fortress with circuit board walls" },
      { name: "Web Trap", file: "/brand/logos/logo-web-trap.png", size: "1024×1024", usage: "Spider web shield trapping threat icons" },
      { name: "Orbital Shield", file: "/brand/logos/logo-orbital-shield.png", size: "1024×1024", usage: "Satellite orbiting shield-shaped earth" },
      { name: "Dragon Eye", file: "/brand/logos/logo-dragon-eye.png", size: "1024×1024", usage: "Dragon guardian eye in diamond shield" },
      { name: "Chain Infinity", file: "/brand/logos/logo-chain-infinity.png", size: "1024×1024", usage: "Chain infinity symbol with central lock" },
      { name: "Cobra Server", file: "/brand/logos/logo-cobra-server.png", size: "1024×1024", usage: "Cobra coiled around server tower — defense" },
      { name: "Trident WiFi", file: "/brand/logos/logo-trident-wifi.png", size: "1024×1024", usage: "Trident merged with WiFi signal — network defense" },
      { name: "Samurai Cyber", file: "/brand/logos/logo-samurai-cyber.png", size: "1024×1024", usage: "Samurai mask with digital visor — bushido warrior" },
      { name: "Kraken Guard", file: "/brand/logos/logo-kraken-guard.png", size: "1024×1024", usage: "Kraken tentacles protecting server infrastructure" },
      { name: "Owl Watch", file: "/brand/logos/logo-owl-watch.png", size: "1024×1024", usage: "Owl with binary eyes — night watch surveillance" },
      { name: "Bear Paw", file: "/brand/logos/logo-bear-paw.png", size: "1024×1024", usage: "Circuit board bear paw — powerful defender" },
      { name: "Lighthouse", file: "/brand/logos/logo-lighthouse.png", size: "1024×1024", usage: "Beacon scanning digital ocean — guidance" },
      { name: "Scorpion USB", file: "/brand/logos/logo-scorpion-usb.png", size: "1024×1024", usage: "Scorpion with USB tail — offensive security" },
      { name: "Vault Bio", file: "/brand/logos/logo-vault-bio.png", size: "1024×1024", usage: "Vault door with fingerprint lock — biometric" },
      { name: "Eagle Target", file: "/brand/logos/logo-eagle-target.png", size: "1024×1024", usage: "Eagle with targeting reticle — precision defense" },
      { name: "Security Compass", file: "/brand/logos/logo-security-compass.png", size: "1024×1024", usage: "Compass rose with security icons — navigation" },
      { name: "Data Diamond", file: "/brand/logos/logo-data-diamond.png", size: "1024×1024", usage: "Gemstone with data reflections — value protection" },
      { name: "Raven Intel", file: "/brand/logos/logo-raven-intel.png", size: "1024×1024", usage: "Raven on server blade — intelligence stealth" },
      { name: "Gear Shield", file: "/brand/logos/logo-gear-shield.png", size: "1024×1024", usage: "Interlocking gears forming shield — engineering" },
      { name: "Chess Knight", file: "/brand/logos/logo-chess-knight.png", size: "1024×1024", usage: "Holographic chess knight — tactical strategy" },
      { name: "Atom Shield", file: "/brand/logos/logo-atom-shield.png", size: "1024×1024", usage: "Atomic orbits with security shields — nuclear grade" },
      { name: "Falcon Strike", file: "/brand/logos/logo-falcon-strike.png", size: "1024×1024", usage: "Diving falcon with digital fire — rapid response" },
      { name: "Chain Lock", file: "/brand/logos/logo-chain-lock.png", size: "1024×1024", usage: "Blockchain chain with padlock — secure custody" },
      { name: "Mantis Blade", file: "/brand/logos/logo-mantis-blade.png", size: "1024×1024", usage: "Circuit mantis in strike pose — threat elimination" },
      { name: "Pulse Shield", file: "/brand/logos/logo-pulse-shield.png", size: "1024×1024", usage: "Shield with heartbeat line — uptime monitoring" },
      { name: "Octo Defense", file: "/brand/logos/logo-octo-defense.png", size: "1024×1024", usage: "Octopus with security tools — multi-capability" },
      { name: "Aspis Circuit", file: "/brand/logos/logo-aspis-circuit.png", size: "1024×1024", usage: "Greek shield with circuit overlay — timeless defense" },
    ],
  },
];

const trademarks = [
  { mark: "STBCS", type: "Brand Abbreviation" },
  { mark: "STB Cybersecurity", type: "Full Brand Name" },
  { mark: "STB Cyber", type: "Short Brand Name" },
  { mark: "Stop The Bleed", type: "Tagline / Motto" },
  { mark: "Hex Lock", type: "Logo Design Name" },
];

export default function LogoGallery() {
  useDocumentTitle("Brand Assets | STB Cybersecurity", "Official STBCS brand assets, logo variations, and trademark information.");
  const queryClient = useQueryClient();
  const [viewRecorded, setViewRecorded] = useState(false);

  const { data: viewsData } = useQuery({
    queryKey: ["/api/logos/views"],
    queryFn: () => fetch("/api/logos/views").then(r => r.json()),
  });

  const { data: votesData } = useQuery({
    queryKey: ["/api/logos/votes"],
    queryFn: () => fetch("/api/logos/votes").then(r => r.json()),
  });

  const { data: myVotesData } = useQuery({
    queryKey: ["/api/logos/my-votes"],
    queryFn: () => fetch("/api/logos/my-votes").then(r => r.json()),
  });

  useEffect(() => {
    if (!viewRecorded) {
      setViewRecorded(true);
      fetch("/api/logos/view", { method: "POST" })
        .then(r => r.json())
        .then(() => queryClient.invalidateQueries({ queryKey: ["/api/logos/views"] }))
        .catch(() => {});
    }
  }, [viewRecorded, queryClient]);

  const voteMutation = useMutation({
    mutationFn: async (variant: string) => {
      const res = await fetch("/api/logos/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/logos/votes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/logos/my-votes"] });
    },
  });

  const pageViews = viewsData?.views ?? 0;
  const votes: Record<string, number> = votesData?.votes ?? {};
  const myVotes: string[] = myVotesData?.votedFor ?? [];

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back-dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-display font-bold text-white" data-testid="text-page-title">Brand Assets</h1>
              <p className="text-zinc-400 text-sm mt-1">Official STB Cybersecurity logos, icons, and brand materials</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/hero-backgrounds">
              <Button variant="outline" className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10" data-testid="link-hero-backgrounds">
                <Monitor className="h-4 w-4 mr-2" /> Hero Backgrounds
              </Button>
            </Link>
            <div className="flex items-center gap-2 bg-zinc-900 rounded-lg px-3 py-2 border border-zinc-800" data-testid="visitor-counter">
            <Eye className="h-4 w-4 text-orange-500" />
            <span className="text-sm text-zinc-300 font-medium" data-testid="text-view-count">{Math.round(pageViews).toLocaleString()}</span>
            <span className="text-xs text-zinc-500">views</span>
          </div>
          </div>
        </div>

        <div className="rounded-2xl border border-orange-500/30 bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-orange-950/10 p-6 md:p-8" data-testid="section-current-logo">
          <div className="flex items-center gap-3 mb-6">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <Check className="h-3 w-3 mr-1" /> ACTIVE
            </Badge>
            <span className="text-zinc-500 text-xs">{currentLogo.version} &bull; Updated {currentLogo.updated}</span>
          </div>
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="shrink-0 space-y-4">
              <div className="bg-zinc-950 rounded-xl p-6 border border-zinc-800">
                <img
                  src={currentLogo.file}
                  alt="STBCS Current Logo"
                  className="h-48 w-48 object-contain mx-auto drop-shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                  data-testid="img-current-logo"
                />
              </div>
              <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800 flex items-center justify-center gap-4">
                <img src={currentLogo.icon} alt="Shield Icon" className="h-16 w-16 object-contain drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]" data-testid="img-current-icon" />
                <div className="text-left">
                  <p className="text-xs text-zinc-500">Shield Icon</p>
                  <p className="text-sm text-white font-medium">1024×1024</p>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <h2 className="text-2xl font-bold text-white">{currentLogo.name}</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">{currentLogo.description}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[16, 32, 64, 128].map((sz) => (
                  <div key={sz} className="bg-zinc-950 rounded-lg p-4 border border-zinc-800 flex flex-col items-center gap-2">
                    <img src={currentLogo.icon} alt={`${sz}px`} style={{ height: sz > 64 ? 64 : sz, width: sz > 64 ? 64 : sz }} className="object-contain" />
                    <span className="text-zinc-500 text-[10px]">{sz}px</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="outline" className="text-red-400 border-red-500/30">Red Banner</Badge>
                <Badge variant="outline" className="text-red-400 border-red-500/30">Red Glow</Badge>
                <Badge variant="outline" className="text-zinc-400 border-zinc-600">Silver Chrome</Badge>
                <Badge variant="outline" className="text-orange-300 border-orange-400/30">Orange Binary</Badge>
                <Badge variant="outline" className="text-zinc-300 border-zinc-500">Transparent BG</Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-700/50 bg-zinc-900/50 p-6 md:p-8" data-testid="section-vote">
          <div className="flex items-center gap-3 mb-2">
            <ThumbsUp className="h-5 w-5 text-orange-500" />
            <h2 className="text-xl font-bold text-white">Vote for Your Favorite</h2>
          </div>
          <p className="text-zinc-500 text-sm mb-6">One vote per variant — let us know which style you prefer!</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {votableVariants.map((v) => {
              const voteCount = votes[v.id] ?? 0;
              const hasVoted = myVotes.includes(v.id);
              const totalVotes = Object.values(votes).reduce((a: number, b: number) => a + b, 0);
              const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

              return (
                <Card
                  key={v.id}
                  className={`bg-zinc-900 transition-all ${hasVoted ? "border-orange-500/50 ring-1 ring-orange-500/20" : "border-zinc-800 hover:border-zinc-600"}`}
                  data-testid={`vote-card-${v.id}`}
                >
                  <CardContent className="p-5">
                    <div className="flex gap-4 items-center mb-4">
                      <div className="bg-zinc-950 rounded-lg p-3 border border-zinc-800 shrink-0">
                        <img src={v.file} alt={v.name} className="h-20 w-20 object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{v.name}</p>
                        <p className="text-zinc-500 text-xs mt-1">{v.desc}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-zinc-400 font-medium tabular-nums whitespace-nowrap">
                            {voteCount} {voteCount === 1 ? "vote" : "votes"} ({pct}%)
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={hasVoted ? "outline" : "default"}
                      className={hasVoted ? "w-full border-orange-500/30 text-orange-400 cursor-default" : "w-full bg-orange-600 hover:bg-orange-700"}
                      disabled={hasVoted || voteMutation.isPending}
                      onClick={() => !hasVoted && voteMutation.mutate(v.id)}
                      data-testid={`button-vote-${v.id}`}
                    >
                      {hasVoted ? (
                        <><Check className="h-4 w-4 mr-1" /> Voted</>
                      ) : (
                        <><ThumbsUp className="h-4 w-4 mr-1" /> Vote</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {variations.map((section) => (
          <div key={section.category} data-testid={`section-${section.category.toLowerCase().replace(/\s+/g, "-")}`}>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-500" />
              {section.category}
              <span className="text-zinc-500 text-sm font-normal">({section.items.length})</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {section.items.map((item) => (
                <Card
                  key={item.file}
                  className={`bg-zinc-900 border-zinc-800 hover:border-zinc-600 transition-colors ${item.active ? "ring-2 ring-orange-500/30 border-orange-500/40" : ""}`}
                  data-testid={`card-asset-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <CardContent className="p-3">
                    <div className="aspect-square bg-zinc-950 rounded-lg overflow-hidden mb-3 flex items-center justify-center relative border border-zinc-800">
                      <img
                        src={item.file}
                        alt={item.name}
                        className="max-w-[85%] max-h-[85%] object-contain"
                      />
                      {item.active && (
                        <div className="absolute top-2 right-2 h-5 w-5 bg-orange-500 rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-white text-sm font-medium truncate">{item.name}</p>
                    <p className="text-zinc-500 text-xs mt-0.5">{item.size}</p>
                    <p className="text-zinc-600 text-[10px] mt-1 line-clamp-2">{item.usage}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        <div className="rounded-2xl border border-zinc-700/50 bg-zinc-900/50 p-6 md:p-8" data-testid="section-copyright">
          <div className="flex items-center gap-3 mb-6">
            <Copyright className="h-6 w-6 text-orange-500" />
            <h2 className="text-xl font-bold text-white">Copyright & Trademark Notice</h2>
          </div>
          <div className="space-y-6">
            <p className="text-zinc-400 text-sm leading-relaxed">
              &copy; {new Date().getFullYear()} STB Cybersecurity. All rights reserved. The following names, logos, and brand elements are the exclusive property of STB Cybersecurity and may not be used, reproduced, or distributed without prior written permission.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {trademarks.map((tm) => (
                <div key={tm.mark} className="flex items-center gap-3 bg-zinc-950 rounded-lg px-4 py-3 border border-zinc-800" data-testid={`trademark-${tm.mark.toLowerCase().replace(/\s+/g, "-")}`}>
                  <span className="text-orange-400 font-bold text-sm">{tm.mark}&trade;</span>
                  <span className="text-zinc-600 text-xs">&mdash; {tm.type}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-zinc-800 pt-4 space-y-2">
              <p className="text-zinc-500 text-xs leading-relaxed">
                <strong className="text-zinc-400">Logo Usage:</strong> The STBCS Hex Lock logo and shield icon must not be altered, distorted, recolored, or used in a way that implies endorsement without authorization. Minimum clear space around the logo should be maintained at all times.
              </p>
              <p className="text-zinc-500 text-xs leading-relaxed">
                <strong className="text-zinc-400">Brand Colors:</strong> Primary Orange (#f97316), Red (#ef4444), Silver Chrome, Dark Background (#0a0a0a / #18181b). These colors define the STBCS visual identity and should be used consistently across all materials.
              </p>
              <p className="text-zinc-500 text-xs leading-relaxed">
                <strong className="text-zinc-400">Contact:</strong> For brand usage inquiries, licensing, or media requests, contact <a href="mailto:support@stbcybersecurity.com" className="text-orange-400 hover:underline">support@stbcybersecurity.com</a>
              </p>
            </div>
          </div>
        </div>

        <div className="text-center pb-8">
          <p className="text-zinc-600 text-xs">
            &copy; {new Date().getFullYear()} STB Cybersecurity &bull; All brand assets are proprietary and protected under applicable intellectual property laws.
          </p>
        </div>
      </div>
    </div>
  );
}
