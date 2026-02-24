import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface IconTheme {
  id: string;
  name: string;
  description: string;
  category: string;
  preview: {
    activeColor: string;
    inactiveColor: string;
    hoverColor: string;
    glowColor: string;
  };
  styles: {
    activeIcon: string;
    inactiveIcon: string;
    hoverIcon: string;
    activeGlow?: string;
    iconBg?: string;
    activeIconBg?: string;
    strokeWidth?: number;
  };
}

export const ICON_THEMES: IconTheme[] = [
  {
    id: "default",
    name: "Stealth Orange",
    description: "Default orange accent on dark zinc — clean and minimal",
    category: "Classic",
    preview: { activeColor: "#f97316", inactiveColor: "#71717a", hoverColor: "#fb923c", glowColor: "#f9731633" },
    styles: {
      activeIcon: "text-orange-400",
      inactiveIcon: "text-zinc-600",
      hoverIcon: "group-hover:text-orange-400/80",
    },
  },
  {
    id: "neon-green",
    name: "Matrix Green",
    description: "Classic hacker green on dark — matrix terminal style",
    category: "Hacker",
    preview: { activeColor: "#22c55e", inactiveColor: "#6b7280", hoverColor: "#4ade80", glowColor: "#22c55e33" },
    styles: {
      activeIcon: "text-green-500",
      inactiveIcon: "text-gray-600",
      hoverIcon: "group-hover:text-green-400/80",
      activeGlow: "drop-shadow-[0_0_6px_rgba(34,197,94,0.4)]",
    },
  },
  {
    id: "cyber-blue",
    name: "Cyber Blue",
    description: "Electric blue neon — futuristic tech interface",
    category: "Tech",
    preview: { activeColor: "#3b82f6", inactiveColor: "#6b7280", hoverColor: "#60a5fa", glowColor: "#3b82f633" },
    styles: {
      activeIcon: "text-blue-500",
      inactiveIcon: "text-gray-600",
      hoverIcon: "group-hover:text-blue-400/80",
      activeGlow: "drop-shadow-[0_0_6px_rgba(59,130,246,0.4)]",
    },
  },
  {
    id: "blood-red",
    name: "Blood Red",
    description: "Deep crimson red — threat alert aggressive style",
    category: "Combat",
    preview: { activeColor: "#ef4444", inactiveColor: "#6b7280", hoverColor: "#f87171", glowColor: "#ef444433" },
    styles: {
      activeIcon: "text-red-500",
      inactiveIcon: "text-gray-600",
      hoverIcon: "group-hover:text-red-400/80",
      activeGlow: "drop-shadow-[0_0_6px_rgba(239,68,68,0.4)]",
    },
  },
  {
    id: "plasma-purple",
    name: "Plasma Purple",
    description: "Vibrant purple plasma — dark web intelligence style",
    category: "Hacker",
    preview: { activeColor: "#a855f7", inactiveColor: "#6b7280", hoverColor: "#c084fc", glowColor: "#a855f733" },
    styles: {
      activeIcon: "text-purple-500",
      inactiveIcon: "text-gray-600",
      hoverIcon: "group-hover:text-purple-400/80",
      activeGlow: "drop-shadow-[0_0_6px_rgba(168,85,247,0.4)]",
    },
  },
  {
    id: "arctic-cyan",
    name: "Arctic Cyan",
    description: "Icy cyan blue — cold precision defense",
    category: "Tech",
    preview: { activeColor: "#06b6d4", inactiveColor: "#6b7280", hoverColor: "#22d3ee", glowColor: "#06b6d433" },
    styles: {
      activeIcon: "text-cyan-500",
      inactiveIcon: "text-gray-600",
      hoverIcon: "group-hover:text-cyan-400/80",
      activeGlow: "drop-shadow-[0_0_6px_rgba(6,182,212,0.4)]",
    },
  },
  {
    id: "solar-amber",
    name: "Solar Amber",
    description: "Warm golden amber — intelligence operations",
    category: "Classic",
    preview: { activeColor: "#f59e0b", inactiveColor: "#6b7280", hoverColor: "#fbbf24", glowColor: "#f59e0b33" },
    styles: {
      activeIcon: "text-amber-500",
      inactiveIcon: "text-gray-600",
      hoverIcon: "group-hover:text-amber-400/80",
      activeGlow: "drop-shadow-[0_0_6px_rgba(245,158,11,0.4)]",
    },
  },
  {
    id: "toxic-lime",
    name: "Toxic Lime",
    description: "Radioactive lime green — biohazard warning",
    category: "Combat",
    preview: { activeColor: "#84cc16", inactiveColor: "#6b7280", hoverColor: "#a3e635", glowColor: "#84cc1633" },
    styles: {
      activeIcon: "text-lime-500",
      inactiveIcon: "text-gray-600",
      hoverIcon: "group-hover:text-lime-400/80",
      activeGlow: "drop-shadow-[0_0_6px_rgba(132,204,22,0.4)]",
    },
  },
  {
    id: "rose-signal",
    name: "Rose Signal",
    description: "Hot pink rose — critical alert signal",
    category: "Classic",
    preview: { activeColor: "#f43f5e", inactiveColor: "#6b7280", hoverColor: "#fb7185", glowColor: "#f43f5e33" },
    styles: {
      activeIcon: "text-rose-500",
      inactiveIcon: "text-gray-600",
      hoverIcon: "group-hover:text-rose-400/80",
      activeGlow: "drop-shadow-[0_0_6px_rgba(244,63,94,0.4)]",
    },
  },
  {
    id: "emerald-shield",
    name: "Emerald Shield",
    description: "Rich emerald green — secure and protected",
    category: "Defense",
    preview: { activeColor: "#10b981", inactiveColor: "#6b7280", hoverColor: "#34d399", glowColor: "#10b98133" },
    styles: {
      activeIcon: "text-emerald-500",
      inactiveIcon: "text-gray-600",
      hoverIcon: "group-hover:text-emerald-400/80",
      activeGlow: "drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]",
    },
  },
  {
    id: "ghost-white",
    name: "Ghost White",
    description: "Clean white on dark — stealth minimal",
    category: "Stealth",
    preview: { activeColor: "#f4f4f5", inactiveColor: "#52525b", hoverColor: "#e4e4e7", glowColor: "#f4f4f522" },
    styles: {
      activeIcon: "text-zinc-100",
      inactiveIcon: "text-zinc-600",
      hoverIcon: "group-hover:text-zinc-300",
    },
  },
  {
    id: "indigo-ops",
    name: "Indigo Ops",
    description: "Deep indigo — covert operations and surveillance",
    category: "Stealth",
    preview: { activeColor: "#6366f1", inactiveColor: "#6b7280", hoverColor: "#818cf8", glowColor: "#6366f133" },
    styles: {
      activeIcon: "text-indigo-500",
      inactiveIcon: "text-gray-600",
      hoverIcon: "group-hover:text-indigo-400/80",
      activeGlow: "drop-shadow-[0_0_6px_rgba(99,102,241,0.4)]",
    },
  },
  {
    id: "fire-orange-glow",
    name: "Fire Orange Glow",
    description: "Orange with intense neon glow — high alert mode",
    category: "Combat",
    preview: { activeColor: "#f97316", inactiveColor: "#52525b", hoverColor: "#fb923c", glowColor: "#f9731666" },
    styles: {
      activeIcon: "text-orange-500",
      inactiveIcon: "text-zinc-600",
      hoverIcon: "group-hover:text-orange-400",
      activeGlow: "drop-shadow-[0_0_10px_rgba(249,115,22,0.6)]",
    },
  },
  {
    id: "teal-sentinel",
    name: "Teal Sentinel",
    description: "Cool teal — watchful guardian presence",
    category: "Defense",
    preview: { activeColor: "#14b8a6", inactiveColor: "#6b7280", hoverColor: "#2dd4bf", glowColor: "#14b8a633" },
    styles: {
      activeIcon: "text-teal-500",
      inactiveIcon: "text-gray-600",
      hoverIcon: "group-hover:text-teal-400/80",
      activeGlow: "drop-shadow-[0_0_6px_rgba(20,184,166,0.4)]",
    },
  },
  {
    id: "duotone-blue-orange",
    name: "Duotone Blue/Orange",
    description: "Blue inactive, orange active — classic security UI",
    category: "Duotone",
    preview: { activeColor: "#f97316", inactiveColor: "#3b82f6", hoverColor: "#fb923c", glowColor: "#f9731633" },
    styles: {
      activeIcon: "text-orange-500",
      inactiveIcon: "text-blue-500/60",
      hoverIcon: "group-hover:text-orange-400",
      activeGlow: "drop-shadow-[0_0_6px_rgba(249,115,22,0.3)]",
    },
  },
  {
    id: "duotone-green-red",
    name: "Duotone Green/Red",
    description: "Green inactive, red active — threat status display",
    category: "Duotone",
    preview: { activeColor: "#ef4444", inactiveColor: "#22c55e", hoverColor: "#f87171", glowColor: "#ef444433" },
    styles: {
      activeIcon: "text-red-500",
      inactiveIcon: "text-green-500/60",
      hoverIcon: "group-hover:text-red-400",
      activeGlow: "drop-shadow-[0_0_6px_rgba(239,68,68,0.3)]",
    },
  },
  {
    id: "duotone-purple-cyan",
    name: "Duotone Purple/Cyan",
    description: "Cyan inactive, purple active — cyberpunk aesthetic",
    category: "Duotone",
    preview: { activeColor: "#a855f7", inactiveColor: "#06b6d4", hoverColor: "#c084fc", glowColor: "#a855f733" },
    styles: {
      activeIcon: "text-purple-500",
      inactiveIcon: "text-cyan-500/60",
      hoverIcon: "group-hover:text-purple-400",
      activeGlow: "drop-shadow-[0_0_6px_rgba(168,85,247,0.3)]",
    },
  },
  {
    id: "neon-badge-green",
    name: "Neon Badge Green",
    description: "Icons with subtle green background badges — tech dashboard",
    category: "Badge",
    preview: { activeColor: "#22c55e", inactiveColor: "#6b7280", hoverColor: "#4ade80", glowColor: "#22c55e33" },
    styles: {
      activeIcon: "text-green-400",
      inactiveIcon: "text-gray-500",
      hoverIcon: "group-hover:text-green-400/80",
      iconBg: "bg-transparent",
      activeIconBg: "bg-green-500/10 rounded-lg p-0.5",
    },
  },
  {
    id: "neon-badge-blue",
    name: "Neon Badge Blue",
    description: "Icons with subtle blue background badges — corporate tech",
    category: "Badge",
    preview: { activeColor: "#3b82f6", inactiveColor: "#6b7280", hoverColor: "#60a5fa", glowColor: "#3b82f633" },
    styles: {
      activeIcon: "text-blue-400",
      inactiveIcon: "text-gray-500",
      hoverIcon: "group-hover:text-blue-400/80",
      iconBg: "bg-transparent",
      activeIconBg: "bg-blue-500/10 rounded-lg p-0.5",
    },
  },
  {
    id: "neon-badge-red",
    name: "Neon Badge Red",
    description: "Icons with subtle red background badges — alert mode",
    category: "Badge",
    preview: { activeColor: "#ef4444", inactiveColor: "#6b7280", hoverColor: "#f87171", glowColor: "#ef444433" },
    styles: {
      activeIcon: "text-red-400",
      inactiveIcon: "text-gray-500",
      hoverIcon: "group-hover:text-red-400/80",
      iconBg: "bg-transparent",
      activeIconBg: "bg-red-500/10 rounded-lg p-0.5",
    },
  },
  {
    id: "outlined-cyan",
    name: "Outlined Cyan",
    description: "Thin outlined icons with cyan color — wire blueprint",
    category: "Outlined",
    preview: { activeColor: "#06b6d4", inactiveColor: "#6b7280", hoverColor: "#22d3ee", glowColor: "#06b6d433" },
    styles: {
      activeIcon: "text-cyan-400",
      inactiveIcon: "text-gray-600",
      hoverIcon: "group-hover:text-cyan-400/80",
      strokeWidth: 1.5,
    },
  },
  {
    id: "outlined-amber",
    name: "Outlined Amber",
    description: "Thin outlined icons with amber color — schematic view",
    category: "Outlined",
    preview: { activeColor: "#f59e0b", inactiveColor: "#6b7280", hoverColor: "#fbbf24", glowColor: "#f59e0b33" },
    styles: {
      activeIcon: "text-amber-400",
      inactiveIcon: "text-gray-600",
      hoverIcon: "group-hover:text-amber-400/80",
      strokeWidth: 1.5,
    },
  },
  {
    id: "bold-orange",
    name: "Bold Orange",
    description: "Thick bold icons in orange — high visibility mode",
    category: "Bold",
    preview: { activeColor: "#f97316", inactiveColor: "#52525b", hoverColor: "#fb923c", glowColor: "#f9731644" },
    styles: {
      activeIcon: "text-orange-500",
      inactiveIcon: "text-zinc-600",
      hoverIcon: "group-hover:text-orange-400",
      strokeWidth: 2.5,
    },
  },
  {
    id: "bold-blue",
    name: "Bold Blue",
    description: "Thick bold icons in blue — security command",
    category: "Bold",
    preview: { activeColor: "#3b82f6", inactiveColor: "#52525b", hoverColor: "#60a5fa", glowColor: "#3b82f644" },
    styles: {
      activeIcon: "text-blue-500",
      inactiveIcon: "text-zinc-600",
      hoverIcon: "group-hover:text-blue-400",
      strokeWidth: 2.5,
    },
  },
  {
    id: "bold-red",
    name: "Bold Red",
    description: "Thick bold icons in red — maximum threat level",
    category: "Bold",
    preview: { activeColor: "#ef4444", inactiveColor: "#52525b", hoverColor: "#f87171", glowColor: "#ef444444" },
    styles: {
      activeIcon: "text-red-500",
      inactiveIcon: "text-zinc-600",
      hoverIcon: "group-hover:text-red-400",
      strokeWidth: 2.5,
    },
  },
  {
    id: "holo-violet",
    name: "Holographic Violet",
    description: "Violet with holographic shimmer — advanced tech",
    category: "Hacker",
    preview: { activeColor: "#8b5cf6", inactiveColor: "#6b7280", hoverColor: "#a78bfa", glowColor: "#8b5cf644" },
    styles: {
      activeIcon: "text-violet-500",
      inactiveIcon: "text-gray-600",
      hoverIcon: "group-hover:text-violet-400/80",
      activeGlow: "drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]",
    },
  },
  {
    id: "midnight-blue",
    name: "Midnight Blue",
    description: "Deep blue on charcoal — covert night operations",
    category: "Stealth",
    preview: { activeColor: "#2563eb", inactiveColor: "#3f3f46", hoverColor: "#3b82f6", glowColor: "#2563eb33" },
    styles: {
      activeIcon: "text-blue-600",
      inactiveIcon: "text-zinc-700",
      hoverIcon: "group-hover:text-blue-500",
    },
  },
  {
    id: "infrared",
    name: "Infrared",
    description: "Deep red infrared — thermal threat detection",
    category: "Combat",
    preview: { activeColor: "#dc2626", inactiveColor: "#3f3f46", hoverColor: "#ef4444", glowColor: "#dc262644" },
    styles: {
      activeIcon: "text-red-600",
      inactiveIcon: "text-zinc-700",
      hoverIcon: "group-hover:text-red-500",
      activeGlow: "drop-shadow-[0_0_8px_rgba(220,38,38,0.5)]",
    },
  },
  {
    id: "gold-command",
    name: "Gold Command",
    description: "Rich gold — executive command authority",
    category: "Classic",
    preview: { activeColor: "#eab308", inactiveColor: "#6b7280", hoverColor: "#facc15", glowColor: "#eab30833" },
    styles: {
      activeIcon: "text-yellow-500",
      inactiveIcon: "text-gray-600",
      hoverIcon: "group-hover:text-yellow-400/80",
      activeGlow: "drop-shadow-[0_0_6px_rgba(234,179,8,0.4)]",
    },
  },
  {
    id: "sky-patrol",
    name: "Sky Patrol",
    description: "Light sky blue — aerial surveillance operations",
    category: "Defense",
    preview: { activeColor: "#0ea5e9", inactiveColor: "#6b7280", hoverColor: "#38bdf8", glowColor: "#0ea5e933" },
    styles: {
      activeIcon: "text-sky-500",
      inactiveIcon: "text-gray-600",
      hoverIcon: "group-hover:text-sky-400/80",
      activeGlow: "drop-shadow-[0_0_6px_rgba(14,165,233,0.4)]",
    },
  },
];

export function useIconTheme() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["/api/site-settings/icon-theme"],
    queryFn: () => fetch("/api/site-settings/icon-theme").then(r => r.json()),
    staleTime: 60000,
  });

  const activeThemeId = data?.value || "default";
  const activeTheme = ICON_THEMES.find(t => t.id === activeThemeId) || ICON_THEMES[0];

  const setTheme = useMutation({
    mutationFn: async (themeId: string) => {
      const res = await fetch("/api/site-settings/icon-theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: themeId }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/site-settings/icon-theme"] });
    },
  });

  return { activeTheme, activeThemeId, setTheme, allThemes: ICON_THEMES };
}
