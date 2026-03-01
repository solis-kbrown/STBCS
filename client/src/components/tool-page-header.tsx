import { type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Crown, ChevronRight, Home } from "lucide-react";
import AmbientGrid from "@/components/ambient-grid";

interface StatusBadge {
  label: string;
  count?: number;
  variant: "success" | "warning" | "error" | "info" | "neutral";
}

interface ToolPageHeaderProps {
  icon: ReactNode;
  title: string;
  description: string;
  tier?: "free" | "pro" | "business" | "enterprise";
  breadcrumbs?: { label: string; href?: string }[];
  statusBadges?: StatusBadge[];
  testIdPrefix: string;
}

function variantClasses(variant: StatusBadge["variant"]) {
  switch (variant) {
    case "success": return "bg-green-500/20 text-green-400 border-green-500/50";
    case "warning": return "bg-amber-500/20 text-amber-400 border-amber-500/50";
    case "error": return "bg-red-500/20 text-red-400 border-red-500/50";
    case "info": return "bg-blue-500/20 text-blue-400 border-blue-500/50";
    default: return "bg-zinc-700/50 text-zinc-400 border-zinc-600/50";
  }
}

function tierBadge(tier: string) {
  if (tier === "free") {
    return (
      <Badge className="bg-green-600 text-white" data-testid="badge-tier-free">
        FREE
      </Badge>
    );
  }
  if (tier === "pro") {
    return (
      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50" data-testid="badge-tier-pro">
        <Crown className="h-3 w-3 mr-1" /> PRO
      </Badge>
    );
  }
  if (tier === "business") {
    return (
      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50" data-testid="badge-tier-business">
        <Crown className="h-3 w-3 mr-1" /> BUSINESS
      </Badge>
    );
  }
  return (
    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50" data-testid="badge-tier-enterprise">
      <Crown className="h-3 w-3 mr-1" /> ENTERPRISE
    </Badge>
  );
}

export default function ToolPageHeader({
  icon,
  title,
  description,
  tier,
  breadcrumbs,
  statusBadges,
  testIdPrefix,
}: ToolPageHeaderProps) {
  const crumbs = breadcrumbs || [
    { label: "Home", href: "/" },
    { label: "Tools", href: "/tools" },
    { label: title },
  ];

  return (
    <div className="relative rounded-xl overflow-hidden border border-white/5 bg-card/30 mb-6" data-testid={`${testIdPrefix}-header`}>
      <div className="absolute inset-0 pointer-events-none">
        <AmbientGrid />
      </div>

      <div className="relative z-10 px-6 py-6 space-y-4">
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500" data-testid={`${testIdPrefix}-breadcrumbs`}>
          {crumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i === 0 && <Home className="h-3 w-3" />}
              {i > 0 && <ChevronRight className="h-3 w-3 text-zinc-700" />}
              {crumb.href ? (
                <a
                  href={crumb.href}
                  className="hover:text-white transition-colors link-underline"
                  data-testid={`${testIdPrefix}-breadcrumb-${i}`}
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="text-zinc-300 font-medium" data-testid={`${testIdPrefix}-breadcrumb-${i}`}>
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
        </nav>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/20 icon-float shrink-0" style={{ filter: "drop-shadow(0 0 12px rgba(249, 115, 22, 0.25))" }}>
              {icon}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-white" data-testid={`text-${testIdPrefix}-title`}>
                {title}
              </h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                {description}
              </p>
            </div>
          </div>
          {tier && tierBadge(tier)}
        </div>

        {statusBadges && statusBadges.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1" data-testid={`${testIdPrefix}-status-badges`}>
            {statusBadges.map((badge, i) => (
              <Badge
                key={i}
                className={`${variantClasses(badge.variant)} text-[10px]`}
                data-testid={`${testIdPrefix}-status-badge-${i}`}
              >
                {badge.count !== undefined ? `${badge.count} ` : ""}{badge.label}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
