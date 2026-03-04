import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { ChevronUp, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TickerEvent {
  id: string;
  type: "cve" | "ransomware" | "malware" | "kev";
  icon: string;
  label: string;
  detail: string;
  timeAgo: string;
  href: string;
}

function useTickerData() {
  return useQuery<TickerEvent[]>({
    queryKey: ["/api/threat-ticker"],
    queryFn: async () => {
      const res = await fetch("/api/threat-ticker");
      if (!res.ok) throw new Error("Failed to fetch ticker data");
      return res.json();
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });
}

export default function ThreatTicker() {
  const { data: events } = useTickerData();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("ticker-collapsed") === "true";
    } catch {
      return false;
    }
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("ticker-collapsed", String(collapsed));
    } catch {}
  }, [collapsed]);

  useEffect(() => {
    if (collapsed || paused || !events?.length) return;
    const el = scrollRef.current;
    if (!el) return;

    let animId: number;
    let pos = 0;
    const speed = 0.5;

    const tick = () => {
      pos += speed;
      if (pos >= el.scrollWidth / 2) {
        pos = 0;
      }
      el.scrollLeft = pos;
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [collapsed, paused, events]);

  if (!events?.length) return null;

  const doubled = [...events, ...events];

  const colorMap: Record<string, string> = {
    cve: "text-red-400",
    ransomware: "text-orange-400",
    malware: "text-yellow-400",
    kev: "text-green-400",
  };

  const bgMap: Record<string, string> = {
    cve: "bg-red-500/10",
    ransomware: "bg-orange-500/10",
    malware: "bg-yellow-500/10",
    kev: "bg-green-500/10",
  };

  if (collapsed) {
    return (
      <div className="flex items-center justify-between px-4 py-1 bg-zinc-900/80 border border-white/5 rounded-lg mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse motion-reduce:animate-none" />
          <span className="text-[11px] text-zinc-400 font-display tracking-wider uppercase">Live Threat Ticker</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-zinc-500 hover:text-white"
          onClick={() => setCollapsed(false)}
          data-testid="button-expand-ticker"
          aria-label="Expand threat ticker"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className="relative bg-zinc-900/80 border border-white/5 rounded-lg mb-4 overflow-hidden"
      data-testid="widget-threat-ticker"
    >
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-zinc-900 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-10 top-0 bottom-0 w-12 bg-gradient-to-l from-zinc-900 to-transparent z-10 pointer-events-none" />

      <div className="flex items-center">
        <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 border-r border-white/5 z-20 bg-zinc-900/90">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse motion-reduce:animate-none" />
          <span className="text-[10px] text-zinc-400 font-display tracking-wider uppercase whitespace-nowrap">LIVE</span>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-hidden whitespace-nowrap"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="inline-flex items-center gap-0">
            {doubled.map((event, i) => (
              <a
                key={`${event.id}-${i}`}
                href={event.href}
                className="inline-flex items-center gap-2 px-4 py-2 hover:bg-white/5 transition-colors duration-200 cursor-pointer border-r border-white/5"
                data-testid={`ticker-event-${event.id}-${i}`}
              >
                <span className={`${bgMap[event.type]} ${colorMap[event.type]} px-1.5 py-0.5 rounded text-[10px] font-bold uppercase`}>
                  {event.icon} {event.label}
                </span>
                <span className="text-xs text-zinc-300 max-w-[300px] truncate">{event.detail}</span>
                <span className="text-[10px] text-zinc-600">{event.timeAgo}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="flex-shrink-0 flex items-center z-20 bg-zinc-900/90">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-zinc-500 hover:text-white"
            onClick={() => setCollapsed(true)}
            data-testid="button-collapse-ticker"
            aria-label="Collapse threat ticker"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
