import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface LogoTheme {
  id: string;
  name: string;
  description: string;
  fullLogo: string;
  icon: string;
  category: string;
}

export const LOGO_THEMES: LogoTheme[] = [
  { id: "default", name: "Hex Lock (Default)", description: "Hexagonal shield with honeycomb mesh and red banner", fullLogo: "/brand/logo-main.png", icon: "/brand/icon-shield.png", category: "Classic" },
  { id: "sentinel-shield", name: "Sentinel Shield", description: "Hexagonal shield with glowing circuit board patterns", fullLogo: "/brand/themes/sentinel-shield-full.png", icon: "/brand/themes/sentinel-shield-icon.png", category: "Shields" },
  { id: "neural-lock", name: "Neural Lock", description: "AI neural network brain merged with digital padlock", fullLogo: "/brand/themes/neural-lock-full.png", icon: "/brand/themes/neural-lock-icon.png", category: "Tech" },
  { id: "fortress-radar", name: "Fortress Radar", description: "Iron fortress tower with radar scanning beam", fullLogo: "/brand/themes/fortress-radar-full.png", icon: "/brand/themes/fortress-radar-icon.png", category: "Defense" },
  { id: "sword-key", name: "Sword & Key", description: "Crossed digital sword and key inside shield crest", fullLogo: "/brand/themes/sword-key-full.png", icon: "/brand/themes/sword-key-icon.png", category: "Classic" },
  { id: "quantum-core", name: "Quantum Core", description: "Quantum computing chip with glowing pathways", fullLogo: "/brand/themes/quantum-core-full.png", icon: "/brand/themes/quantum-core-icon.png", category: "Tech" },
  { id: "cyber-eye", name: "Cyber Eye", description: "All-seeing surveillance eye with circuit iris rings", fullLogo: "/brand/themes/cyber-eye-full.png", icon: "/brand/themes/cyber-eye-icon.png", category: "Tech" },
  { id: "spartan-helm", name: "Spartan Helm", description: "Spartan warrior helmet with digital visor display", fullLogo: "/brand/themes/spartan-helm-full.png", icon: "/brand/themes/spartan-helm-icon.png", category: "Warriors" },
  { id: "bio-helix", name: "Bio Helix", description: "DNA double helix morphing into digital padlock", fullLogo: "/brand/themes/bio-helix-full.png", icon: "/brand/themes/bio-helix-icon.png", category: "Tech" },
  { id: "chain-shield", name: "Chain Shield", description: "Blockchain chain links forming shield with lock", fullLogo: "/brand/themes/chain-shield-full.png", icon: "/brand/themes/chain-shield-icon.png", category: "Shields" },
  { id: "lighthouse-beacon", name: "Lighthouse Beacon", description: "Lighthouse scanning digital ocean — guidance beacon", fullLogo: "/brand/themes/lighthouse-beacon-full.png", icon: "/brand/themes/lighthouse-beacon-icon.png", category: "Defense" },
  { id: "samurai-cyber", name: "Samurai Cyber", description: "Samurai kabuto helmet with glowing digital visor", fullLogo: "/brand/themes/samurai-cyber-full.png", icon: "/brand/themes/samurai-cyber-icon.png", category: "Warriors" },
  { id: "radar-hex", name: "Radar Hex", description: "Radar dish inside hexagonal frame with scanning rings", fullLogo: "/brand/themes/radar-hex-full.png", icon: "/brand/themes/radar-hex-icon.png", category: "Tech" },
  { id: "chess-knight", name: "Chess Knight", description: "Holographic chess knight — tactical strategy", fullLogo: "/brand/themes/chess-knight-full.png", icon: "/brand/themes/chess-knight-icon.png", category: "Classic" },
  { id: "phoenix-rise", name: "Phoenix Rise", description: "Phoenix rising from digital ashes — recovery resilience", fullLogo: "/brand/themes/phoenix-rise-full.png", icon: "/brand/themes/phoenix-rise-icon.png", category: "Mythical" },
  { id: "dragon-fire", name: "Dragon Fire", description: "Dragon breathing digital fire with hex shield scales", fullLogo: "/brand/themes/dragon-fire-full.png", icon: "/brand/themes/dragon-fire-icon.png", category: "Mythical" },
  { id: "shadow-hacker", name: "Shadow Hacker", description: "Hooded hacker with binary code streams — STBCS elite ops", fullLogo: "/brand/themes/shadow-hacker-full.png", icon: "/brand/themes/shadow-hacker-icon.png", category: "Hacker" },
  { id: "cyber-skull", name: "Cyber Skull", description: "Circuit board skull with ethernet crossbones — STBCS cyber pirate", fullLogo: "/brand/themes/cyber-skull-full.png", icon: "/brand/themes/cyber-skull-icon.png", category: "Hacker" },
  { id: "vault-server", name: "Vault Server", description: "Biometric vault protecting server rack — STBCS enterprise security", fullLogo: "/brand/themes/vault-server-full.png", icon: "/brand/themes/vault-server-icon.png", category: "Security" },
  { id: "crypto-lock", name: "Crypto Lock", description: "Wireframe padlock with decryption particles — STBCS cryptography", fullLogo: "/brand/themes/crypto-lock-full.png", icon: "/brand/themes/crypto-lock-icon.png", category: "Security" },
  { id: "firewall-barrier", name: "Firewall Barrier", description: "Energy shield firewall blocking threats — STBCS network defense", fullLogo: "/brand/themes/firewall-barrier-full.png", icon: "/brand/themes/firewall-barrier-icon.png", category: "Defense" },
  { id: "terminal-ops", name: "Terminal Ops", description: "Command line terminal with orange cursor — STBCS hacker mode", fullLogo: "/brand/themes/terminal-ops-full.png", icon: "/brand/themes/terminal-ops-icon.png", category: "Hacker" },
  { id: "bio-print", name: "Bio Print", description: "Digital fingerprint with biometric scan lines — STBCS identity security", fullLogo: "/brand/themes/bio-print-full.png", icon: "/brand/themes/bio-print-icon.png", category: "Security" },
  { id: "soc-command", name: "SOC Command", description: "Security operations center with threat dashboards — STBCS command", fullLogo: "/brand/themes/soc-command-full.png", icon: "/brand/themes/soc-command-icon.png", category: "Security" },
  { id: "zero-trust", name: "Zero Trust", description: "Network nodes forming shield with encrypted packets — STBCS architecture", fullLogo: "/brand/themes/zero-trust-full.png", icon: "/brand/themes/zero-trust-icon.png", category: "Security" },
  { id: "chip-shield", name: "Chip Shield", description: "Microprocessor chip inside shield radiating protocols — STBCS hardware", fullLogo: "/brand/themes/chip-shield-full.png", icon: "/brand/themes/chip-shield-icon.png", category: "Tech" },
  { id: "orbital-intel", name: "Orbital Intel", description: "Satellite scanning Earth with detection beams — STBCS orbital surveillance", fullLogo: "/brand/themes/orbital-intel-full.png", icon: "/brand/themes/orbital-intel-icon.png", category: "Defense" },
  { id: "breach-patch", name: "Breach Patch", description: "Cracked wall repaired by security patches — STBCS incident response", fullLogo: "/brand/themes/breach-patch-full.png", icon: "/brand/themes/breach-patch-icon.png", category: "Security" },
  { id: "darkweb-intel", name: "Darkweb Intel", description: "Onion routing encryption rings — STBCS dark web intelligence", fullLogo: "/brand/themes/darkweb-intel-full.png", icon: "/brand/themes/darkweb-intel-icon.png", category: "Hacker" },
  { id: "honeypot-trap", name: "Honeypot Trap", description: "Glowing server trap attracting malware — STBCS cyber deception", fullLogo: "/brand/themes/honeypot-trap-full.png", icon: "/brand/themes/honeypot-trap-icon.png", category: "Security" },
  { id: "redblue-team", name: "Red/Blue Team", description: "Crossed offensive and defensive swords — STBCS tactical security", fullLogo: "/brand/themes/redblue-team-full.png", icon: "/brand/themes/redblue-team-icon.png", category: "Security" },
  { id: "wolf-hunter", name: "Wolf Hunter", description: "Wolf silhouette with circuit texture — STBCS threat predator", fullLogo: "/brand/themes/wolf-hunter-full.png", icon: "/brand/themes/wolf-hunter-icon.png", category: "Classic" },
  { id: "eagle-scan", name: "Eagle Scan", description: "Eagle with scanning beam — STBCS aerial surveillance", fullLogo: "/brand/themes/eagle-scan-full.png", icon: "/brand/themes/eagle-scan-icon.png", category: "Classic" },
  { id: "cobra-strike", name: "Cobra Strike", description: "King cobra with binary code scales — STBCS offensive security", fullLogo: "/brand/themes/cobra-strike-full.png", icon: "/brand/themes/cobra-strike-icon.png", category: "Classic" },
  { id: "kraken-deep", name: "Kraken Deep", description: "Bioluminescent kraken protecting infrastructure — STBCS deep defense", fullLogo: "/brand/themes/kraken-deep-full.png", icon: "/brand/themes/kraken-deep-icon.png", category: "Mythical" },
  { id: "bear-circuit", name: "Bear Circuit", description: "Bear paw of circuit traces — STBCS powerful defender", fullLogo: "/brand/themes/bear-circuit-full.png", icon: "/brand/themes/bear-circuit-icon.png", category: "Classic" },
];

export function useLogoTheme() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["/api/site-settings/logo-theme"],
    queryFn: () => fetch("/api/site-settings/logo-theme").then(r => r.json()),
    staleTime: 60000,
  });

  const activeThemeId = data?.value || "default";
  const activeTheme = LOGO_THEMES.find(t => t.id === activeThemeId) || LOGO_THEMES[0];

  const setTheme = useMutation({
    mutationFn: async (themeId: string) => {
      const res = await fetch("/api/site-settings/logo-theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: themeId }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-settings/logo-theme"] });
    },
  });

  return { activeTheme, activeThemeId, setTheme, allThemes: LOGO_THEMES };
}
