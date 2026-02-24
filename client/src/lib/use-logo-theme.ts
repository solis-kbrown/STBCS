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
  { id: "cyber-iris", name: "Cyber Iris", description: "All-seeing eye with circuit board iris and binary code — STBCS surveillance", fullLogo: "/brand/themes/cyber-iris-full.png", icon: "/brand/themes/cyber-iris-icon.png", category: "Eyes" },
  { id: "sentinel-eye", name: "Sentinel Eye", description: "Triangular pyramid eye with scanning grid HUD — STBCS omniscient watch", fullLogo: "/brand/themes/sentinel-eye-full.png", icon: "/brand/themes/sentinel-eye-icon.png", category: "Eyes" },
  { id: "target-eye", name: "Target Eye", description: "Cybernetic eye with camera lens and targeting reticle — STBCS precision", fullLogo: "/brand/themes/target-eye-full.png", icon: "/brand/themes/target-eye-icon.png", category: "Eyes" },
  { id: "shield-eye", name: "Shield Eye", description: "Eye inside shield with radar scanning rings — STBCS protected vision", fullLogo: "/brand/themes/shield-eye-full.png", icon: "/brand/themes/shield-eye-icon.png", category: "Eyes" },
  { id: "data-eye", name: "Data Eye", description: "Neon eye with holographic data streams through pupil — STBCS data vision", fullLogo: "/brand/themes/data-eye-full.png", icon: "/brand/themes/data-eye-icon.png", category: "Eyes" },
  { id: "hex-vision", name: "Hex Vision", description: "Compound hexagonal eye matrix — STBCS multi-threat detection", fullLogo: "/brand/themes/hex-vision-full.png", icon: "/brand/themes/hex-vision-icon.png", category: "Eyes" },
  { id: "ghost-hacker", name: "Ghost Hacker", description: "Hooded figure with glowing laptop — STBCS anonymous operative", fullLogo: "/brand/themes/ghost-hacker-full.png", icon: "/brand/themes/ghost-hacker-icon.png", category: "Hacker" },
  { id: "cyber-mask", name: "Cyber Mask", description: "Gas mask with digital HUD overlay — STBCS cyber soldier", fullLogo: "/brand/themes/cyber-mask-full.png", icon: "/brand/themes/cyber-mask-icon.png", category: "Hacker" },
  { id: "ops-desk", name: "Ops Desk", description: "Dual monitor threat intelligence workstation — STBCS command center", fullLogo: "/brand/themes/ops-desk-full.png", icon: "/brand/themes/ops-desk-icon.png", category: "Hacker" },
  { id: "vr-skull", name: "VR Skull", description: "Skull with VR headset and matrix visor — STBCS cyberpunk ops", fullLogo: "/brand/themes/vr-skull-full.png", icon: "/brand/themes/vr-skull-icon.png", category: "Hacker" },
  { id: "ai-sentinel", name: "AI Sentinel", description: "Robot head with scanning eyes — STBCS artificial intelligence guard", fullLogo: "/brand/themes/ai-sentinel-full.png", icon: "/brand/themes/ai-sentinel-icon.png", category: "Tech" },
  { id: "breach-force", name: "Breach Force", description: "Armored fist breaking through firewall — STBCS offensive security", fullLogo: "/brand/themes/breach-force-full.png", icon: "/brand/themes/breach-force-icon.png", category: "Defense" },
  { id: "key-access", name: "Key Access", description: "Keyhole of swirling binary code — STBCS access control", fullLogo: "/brand/themes/key-access-full.png", icon: "/brand/themes/key-access-icon.png", category: "Security" },
  { id: "web-spider", name: "Web Spider", description: "Spider web of network lines — STBCS web application security", fullLogo: "/brand/themes/web-spider-full.png", icon: "/brand/themes/web-spider-icon.png", category: "Security" },
  { id: "threat-scope", name: "Threat Scope", description: "Sniper crosshair on malware target — STBCS precision threat hunting", fullLogo: "/brand/themes/threat-scope-full.png", icon: "/brand/themes/threat-scope-icon.png", category: "Defense" },
  { id: "athena-guard", name: "Athena Guard", description: "Cyber warrior goddess with digital spear and shield — STBCS wisdom", fullLogo: "/brand/themes/athena-guard-full.png", icon: "/brand/themes/athena-guard-icon.png", category: "Warriors" },
  { id: "cyber-ninja", name: "Cyber Ninja", description: "Digital ninja with binary shuriken — STBCS stealth operations", fullLogo: "/brand/themes/cyber-ninja-full.png", icon: "/brand/themes/cyber-ninja-icon.png", category: "Warriors" },
  { id: "holo-lock", name: "Holo Lock", description: "Padlock with holographic shield projection — STBCS maximum security", fullLogo: "/brand/themes/holo-lock-full.png", icon: "/brand/themes/holo-lock-icon.png", category: "Security" },
  { id: "code-blade", name: "Code Blade", description: "Binary DNA helix transforming into digital sword — STBCS code warrior", fullLogo: "/brand/themes/code-blade-full.png", icon: "/brand/themes/code-blade-icon.png", category: "Tech" },
  { id: "global-guard", name: "Global Guard", description: "Earth wrapped in digital chain links and firewalls — STBCS global defense", fullLogo: "/brand/themes/global-guard-full.png", icon: "/brand/themes/global-guard-icon.png", category: "Defense" },
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
