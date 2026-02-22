import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/lib/use-document-title";
import { useState } from "react";
import { Check, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const logos = [
  { id: 1, name: "Geometric Circuit Shield", style: "Clean geometric shield with circuit board traces, minimal corporate feel", file: "logo-option-1.png" },
  { id: 2, name: "Hexagonal Lock", style: "Hexagonal shield with digital lock centerpiece, futuristic tech", file: "logo-option-2.png" },
  { id: 3, name: "Angular Binary", style: "Angular pointed shield with binary code flow, military-grade cyber defense", file: "logo-option-3.png" },
  { id: 4, name: "Fingerprint Shield", style: "Rounded shield with digital fingerprint pattern, premium corporate", file: "logo-option-4.png" },
  { id: 5, name: "Security Badge", style: "Shield divided into security quadrants, professional badge style", file: "logo-option-5.png" },
  { id: 6, name: "Network Mesh", style: "Layered shield with network mesh and glowing nodes, futuristic", file: "logo-option-6.png" },
  { id: 7, name: "Digital Fortress", style: "Fortress tower integrated into shield, strong defensive imagery", file: "logo-option-7.png" },
  { id: 8, name: "Vigilant Eye", style: "Minimalist shield with scanning surveillance eye, modern sleek", file: "logo-option-8.png" },
  { id: 9, name: "Chain Link", style: "Shield formed by interlocking chain links, unbreakable security", file: "logo-option-9.png" },
  { id: 10, name: "Eagle Tactical", style: "Military tactical shield with eagle wings, commanding authority", file: "logo-option-10.png" },
];

export default function LogoGallery() {
  useDocumentTitle("Logo Options | STB Cybersecurity", "Pick your favorite STBCS logo design from 10 professional options.");
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon" data-testid="button-back-dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-display font-bold text-white" data-testid="text-page-title">Pick Your Logo</h1>
            <p className="text-zinc-400 text-sm mt-1">10 professional options matched to your site's orange & blue theme. Click one to preview it.</p>
          </div>
        </div>

        {selected !== null && (
          <div className="mb-8 p-6 rounded-xl border border-orange-500/30 bg-orange-500/5" data-testid="preview-section">
            <h2 className="text-lg font-bold text-orange-400 mb-4">Live Preview — #{selected}: {logos[selected - 1].name}</h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 w-full md:w-72 shrink-0">
                <div className="flex items-center gap-3 mb-6">
                  <img src={`/${logos[selected - 1].file}`} alt="Preview" className="h-14 w-14 rounded-lg shadow-lg shadow-orange-500/20" />
                  <div>
                    <span className="font-display font-bold text-xl tracking-wider text-orange-400">STBCS</span>
                    <span className="block text-[10px] text-zinc-500 tracking-widest uppercase">Cyber Security</span>
                  </div>
                </div>
                <div className="space-y-1">
                  {["Dashboard", "Search", "Tools", "Alerts", "Ransomware"].map((item) => (
                    <div key={item} className="flex items-center gap-3 px-4 py-2.5 rounded-r-md text-zinc-500 text-sm border-l-2 border-transparent">
                      <div className="h-4 w-4 rounded bg-zinc-700" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap gap-4">
                  <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 flex items-center gap-3">
                    <img src={`/${logos[selected - 1].file}`} alt="Header preview" className="h-8 w-8" />
                    <span className="font-display font-bold text-sm tracking-wider text-orange-400">STBCS</span>
                    <span className="text-zinc-500 text-xs">— Mobile header</span>
                  </div>
                  <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 flex items-center gap-3">
                    <img src={`/${logos[selected - 1].file}`} alt="Favicon preview" className="h-5 w-5" />
                    <span className="text-zinc-400 text-xs">Favicon (browser tab)</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[14, 20, 32, 48].map((size) => (
                    <div key={size} className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 flex flex-col items-center gap-2">
                      <img src={`/${logos[selected - 1].file}`} alt={`${size}px`} style={{ height: size, width: size }} />
                      <span className="text-zinc-500 text-[10px]">{size}px</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {logos.map((logo) => (
            <Card
              key={logo.id}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                selected === logo.id
                  ? "border-orange-500 bg-orange-500/10 ring-2 ring-orange-500/30"
                  : "bg-zinc-900 border-zinc-800 hover:border-orange-500/50"
              }`}
              onClick={() => setSelected(logo.id)}
              data-testid={`logo-card-${logo.id}`}
            >
              <CardContent className="p-4">
                <div className="aspect-square bg-zinc-800 rounded-lg overflow-hidden mb-3 flex items-center justify-center relative">
                  <img
                    src={`/${logo.file}`}
                    alt={logo.name}
                    className="w-full h-full object-contain p-3 group-hover:scale-110 transition-transform duration-300"
                    data-testid={`logo-image-${logo.id}`}
                  />
                  {selected === logo.id && (
                    <div className="absolute top-2 right-2 h-6 w-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-white font-medium text-sm">#{logo.id} — {logo.name}</p>
                  <p className="text-zinc-500 text-xs mt-1 line-clamp-2">{logo.style}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-zinc-500 text-sm">
            Click any logo to see a live preview of how it looks in the sidebar, header, and at different sizes.
            <br />Tell me the number you like best and I'll apply it across the whole site!
          </p>
        </div>
      </div>
    </div>
  );
}
