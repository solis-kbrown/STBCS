import { Home, ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  testIdPrefix?: string;
}

export default function BreadcrumbNav({ items, testIdPrefix = "page" }: BreadcrumbNavProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-xs text-zinc-500 mb-4 px-1"
      data-testid={`${testIdPrefix}-breadcrumbs`}
    >
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i === 0 && <Home className="h-3 w-3" />}
          {i > 0 && <ChevronRight className="h-3 w-3 text-zinc-700" />}
          {item.href ? (
            <a
              href={item.href}
              className="hover:text-white transition-colors"
              data-testid={`${testIdPrefix}-breadcrumb-${i}`}
            >
              {item.label}
            </a>
          ) : (
            <span
              className="text-zinc-300 font-medium"
              data-testid={`${testIdPrefix}-breadcrumb-${i}`}
            >
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
