import { Card, CardContent } from "@/components/ui/card";
import { useDocumentTitle } from "@/lib/use-document-title";

const logos = [
  { id: 1, name: "Shield Circuit", style: "Minimalist shield with digital circuit patterns", file: "logo-01-shield-circuit.png" },
  { id: 2, name: "Hex Lock", style: "Hexagonal honeycomb pattern forming lock icon", file: "logo-02-hex-lock.png" },
  { id: 3, name: "Neural Network", style: "Abstract neural network nodes with glowing connections", file: "logo-03-neural-network.png" },
  { id: 4, name: "Digital Eye", style: "Surveillance eye with binary code iris", file: "logo-04-digital-eye.png" },
  { id: 5, name: "Terminal", style: "Hacker terminal command prompt aesthetic", file: "logo-05-terminal.png" },
  { id: 6, name: "Key Circuit", style: "Elegant key integrated with circuit board traces", file: "logo-06-key-circuit.png" },
  { id: 7, name: "Geometric S", style: "Modern S lettermark with interconnected nodes", file: "logo-07-geometric-s.png" },
  { id: 8, name: "Tactical Badge", style: "Military-style tactical badge design", file: "logo-08-tactical-badge.png" },
  { id: 9, name: "Cyber Skull", style: "Edgy cyberpunk skull with circuit patterns", file: "logo-09-cyber-skull.png" },
  { id: 10, name: "Global Shield", style: "Globe with protective digital barrier", file: "logo-10-global-shield.png" },
  { id: 11, name: "Binary Waterfall", style: "Matrix-style binary code waterfall behind shield", file: "logo-11-binary-waterfall.png" },
  { id: 12, name: "Biometric Lock", style: "Premium padlock with fingerprint pattern", file: "logo-12-biometric-lock.png" },
  { id: 13, name: "Mask Circuit", style: "Anonymous-inspired mask with circuit patterns", file: "logo-13-mask-circuit.png" },
  { id: 14, name: "Digital Fortress", style: "Corporate fortress made of digital blocks", file: "logo-14-digital-fortress.png" },
  { id: 15, name: "Radar Scan", style: "Threat detection radar with scanning effect", file: "logo-15-radar-scan.png" },
  { id: 16, name: "Line Art Shield", style: "Apple-style minimalist line art shield", file: "logo-16-line-art-shield.png" },
  { id: 17, name: "Predator Eye", style: "Aggressive threat hunter predator eye", file: "logo-17-predator-eye.png" },
  { id: 18, name: "Eagle Shield", style: "Patriotic eagle with cyber shield", file: "logo-18-eagle-shield.png" },
  { id: 19, name: "Quantum Geometric", style: "Futuristic quantum computing inspired design", file: "logo-19-quantum-geometric.png" },
  { id: 20, name: "Classic Premium", style: "Ornate classic premium security firm style", file: "logo-20-classic-premium.png" },
];

export default function LogoGallery() {
  useDocumentTitle("Brand Assets & Logo Gallery | STB Cybersecurity", "Official STB Cybersecurity brand assets, logo designs, and visual identity gallery for media and partners.");
  return (
    <div className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">STBCS Logo Concepts</h1>
          <p className="text-xl text-cyan-400 mb-2">STB Cybersecurity Labs</p>
          <p className="text-slate-400 italic">"Stop The Bleed"</p>
          <p className="text-slate-500 mt-4 max-w-2xl mx-auto">
            20 professional logo concepts for your review. Each design incorporates the STBCS / STB Cybersecurity Labs branding 
            with "Stop The Bleed" as a tagline. Click any logo to view it larger.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {logos.map((logo) => (
            <Card 
              key={logo.id} 
              className="bg-slate-900 border-slate-800 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 cursor-pointer group"
              data-testid={`logo-card-${logo.id}`}
            >
              <CardContent className="p-4">
                <div className="aspect-square bg-slate-800 rounded-lg overflow-hidden mb-3 flex items-center justify-center">
                  <img 
                    src={`/assets/logos/${logo.file}`}
                    alt={logo.name}
                    className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                    data-testid={`logo-image-${logo.id}`}
                  />
                </div>
                <div className="text-center">
                  <p className="text-white font-medium text-sm">#{logo.id} - {logo.name}</p>
                  <p className="text-slate-500 text-xs mt-1">{logo.style}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-400 mb-4">
            Let me know which logo(s) you like best, or if you'd like variations on any specific design!
          </p>
          <a 
            href="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
            data-testid="back-to-dashboard-btn"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
