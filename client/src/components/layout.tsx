import { Link, useLocation, useRoute } from "wouter";
import type { LucideIcon } from "lucide-react";
import { 
  GalleryVerticalEnd,
  Scan,
  Wrench,
  ShieldOff,
  Bug,
  Satellite,
  Heart,
  Menu, 
  Search, 
  User, 
  LogOut,
  Mail,
  Phone,
  MessageSquare,
  Bell,
  Crown,
  CreditCard,
  Database,
  Factory,
  ShieldCheck,
  MonitorCheck,
  Users,
  Info,
  Send,
  Radar,
  FileText,
  ClipboardList,
  Monitor,
  Terminal,
  Globe,
  FileSearch,
  MailSearch,
  Binary,
  FolderSync,
  ScanSearch,
  Fingerprint,
  MailCheck,
  Network,
  ShieldAlert,
  BookOpen,
  MessageSquareText,
  Palette,
  ChevronRight,
  Calculator,
  Radio,
  MailWarning
} from "lucide-react";
import { useState, useEffect, useRef, useCallback, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { 
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent
} from "@/components/ui/collapsible";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserAvatar from "@/components/user-avatar";
import { LanguageSelector } from "@/components/language-selector";
import { useTranslation } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth";
import { AuthModal } from "@/components/auth-modal";
import { useLogoTheme } from "@/lib/use-logo-theme";
import { useIconTheme } from "@/lib/use-icon-theme";

type NavItem = {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  isPro?: boolean;
  isBusiness?: boolean;
};

type NavSection = {
  id: string;
  labelKey: string;
  collapsible: boolean;
  tierBadge?: 'PRO' | 'BIZ';
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    id: 'main',
    labelKey: 'nav.section.main',
    collapsible: false,
    items: [
      { href: "/", labelKey: "nav.dashboard", icon: GalleryVerticalEnd },
      { href: "/search", labelKey: "nav.search", icon: Scan },
      { href: "/tools", labelKey: "nav.tools", icon: Wrench },
    ],
  },
  {
    id: 'scanners',
    labelKey: 'nav.section.scanners',
    collapsible: true,
    items: [
      { href: "/file-scanner", labelKey: "nav.fileScanner", icon: FileSearch, isPro: true },
      { href: "/ssl-checker", labelKey: "nav.sslChecker", icon: ScanSearch, isPro: true },
      { href: "/dns-analyzer", labelKey: "nav.dnsAnalyzer", icon: Network, isPro: true },
      { href: "/headers-scanner", labelKey: "nav.headersScanner", icon: ShieldAlert },
      { href: "/web-fingerprint", labelKey: "nav.webFingerprint", icon: Fingerprint, isPro: true },
      { href: "/exchange-checker", labelKey: "nav.exchangeChecker", icon: MailCheck, isPro: true },
      { href: "/email-analyzer", labelKey: "nav.emailAnalyzer", icon: MailSearch, isPro: true },
      { href: "/encoding-tools", labelKey: "nav.encodingTools", icon: Binary },
    ],
  },
  {
    id: 'monitoring',
    labelKey: 'nav.section.monitoring',
    collapsible: true,
    tierBadge: 'PRO',
    items: [
      { href: "/monitors", labelKey: "nav.monitors", icon: MonitorCheck, isPro: true },
      { href: "/attack-surface", labelKey: "nav.attackSurface", icon: Radar, isPro: true },
      { href: "/reports", labelKey: "nav.reports", icon: FileText, isPro: true },
      { href: "/stb-sync", labelKey: "nav.stbSync", icon: Radio, isBusiness: true },
    ],
  },
  {
    id: 'remote',
    labelKey: 'nav.section.remoteAccess',
    collapsible: true,
    tierBadge: 'BIZ',
    items: [
      { href: "/remote-desktop", labelKey: "nav.remoteDesktop", icon: Monitor, isBusiness: true },
      { href: "/ssh-terminal", labelKey: "nav.sshTerminal", icon: Terminal, isBusiness: true },
      { href: "/sftp-client", labelKey: "nav.sftpClient", icon: FolderSync, isBusiness: true },
      { href: "/telnet-client", labelKey: "nav.telnetClient", icon: Globe, isPro: true },
    ],
  },
  {
    id: 'threat-intel',
    labelKey: 'nav.section.threatIntel',
    collapsible: true,
    items: [
      { href: "/intel", labelKey: "nav.intel", icon: Satellite },
      { href: "/ransomware", labelKey: "nav.ransomware", icon: ShieldOff },
      { href: "/groups", labelKey: "nav.groups", icon: Users },
      { href: "/exploits", labelKey: "nav.exploits", icon: Bug },
      { href: "/breaches", labelKey: "nav.breaches", icon: Database },
      { href: "/ics-advisories", labelKey: "nav.icsAdvisories", icon: Factory },
      { href: "/risk-score", labelKey: "nav.riskScore", icon: ShieldCheck },
      { href: "/ransomware-calculator", labelKey: "nav.ransomwareCalculator", icon: Calculator },
      { href: "/awareness", labelKey: "nav.awareness", icon: MailWarning },
      { href: "/playbooks", labelKey: "nav.playbooks", icon: ClipboardList },
      { href: "/compliance", labelKey: "nav.compliance", icon: ShieldCheck },
    ],
  },
  {
    id: 'community',
    labelKey: 'nav.section.community',
    collapsible: true,
    items: [
      { href: "/knowledge-base", labelKey: "nav.knowledgeBase", icon: BookOpen },
      { href: "/messages", labelKey: "nav.messages", icon: MessageSquare, isBusiness: true },
      { href: "/brand-kit", labelKey: "nav.brandKit", icon: Palette },
      { href: "/feedback", labelKey: "nav.feedback", icon: MessageSquareText },
    ],
  },
  {
    id: 'support',
    labelKey: 'nav.section.support',
    collapsible: true,
    items: [
      { href: "/service-status", labelKey: "nav.serviceStatus", icon: MonitorCheck },
      { href: "/support", labelKey: "nav.support", icon: Heart },
      { href: "/about", labelKey: "nav.about", icon: Info },
      { href: "/contact", labelKey: "nav.contact", icon: Send },
    ],
  },
];

const STORAGE_KEY = 'sidebar-sections';

const DEFAULT_OPEN: Record<string, boolean> = {
  main: true,
  scanners: true,
  monitoring: false,
  remote: false,
  'threat-intel': true,
  community: false,
  support: false,
};

function getSavedSections(): Record<string, boolean> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return DEFAULT_OPEN;
}

function saveSections(state: Record<string, boolean>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { t } = useTranslation();
  const { user, isAuthenticated, isPro, logout } = useAuth();
  const { activeTheme } = useLogoTheme();
  const { activeTheme: iconTheme } = useIconTheme();
  const [searchFocused, setSearchFocused] = useState(false);
  const [bellAnimating, setBellAnimating] = useState(false);
  const bellIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(getSavedSections);

  useEffect(() => {
    const currentPath = location.split('?')[0];
    for (const section of navSections) {
      if (!section.collapsible) continue;
      const hasActiveItem = section.items.some(item => currentPath === item.href || currentPath.startsWith(item.href + '/'));
      if (hasActiveItem && !openSections[section.id]) {
        setOpenSections(prev => {
          const next = { ...prev, [section.id]: true };
          saveSections(next);
          return next;
        });
      }
    }
  }, [location]);

  const toggleSection = useCallback((sectionId: string) => {
    setOpenSections(prev => {
      const next = { ...prev, [sectionId]: !prev[sectionId] };
      saveSections(next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      bellIntervalRef.current = setInterval(() => {
        setBellAnimating(true);
        setTimeout(() => setBellAnimating(false), 800);
      }, 15000);
      return () => {
        if (bellIntervalRef.current) clearInterval(bellIntervalRef.current);
      };
    }
  }, [isAuthenticated]);

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim().length >= 2) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const NavItemRow = ({ item }: { item: NavItem }) => {
    const currentPath = location.split('?')[0];
    const isActive = currentPath === item.href;
    return (
      <Link href={item.href}>
        <div 
          className={`
            flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer group relative
            transition-all duration-300 ease-out
            ${isActive 
              ? "bg-orange-500/12 text-orange-400 shadow-[inset_0_0_12px_rgba(249,115,22,0.06)] sidebar-item-active" 
              : "text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-200"
            }
          `}
          data-testid={`nav-${item.href.replace(/\//g, '') || 'dashboard'}`}
        >
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full sidebar-active-bar" />
          )}
          <span className={`icon-bounce ${isActive && iconTheme.styles.activeIconBg ? iconTheme.styles.activeIconBg : iconTheme.styles.iconBg || ""}`}>
            <item.icon aria-hidden="true" className={`h-5 w-5 transition-all duration-300 ${isActive ? `${iconTheme.styles.activeIcon} ${iconTheme.styles.activeGlow || ""}` : `${iconTheme.styles.inactiveIcon} group-hover:text-orange-400/70`}`} strokeWidth={iconTheme.styles.strokeWidth} />
          </span>
          <span className="font-medium text-sm">{t(item.labelKey)}</span>
          {item.isPro && (
            <span className="ml-auto text-[10px] font-bold bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded tier-badge-pro">PRO</span>
          )}
          {item.isBusiness && (
            <span className="ml-auto text-[10px] font-bold bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded tier-badge-biz">BIZ</span>
          )}
        </div>
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border relative">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
      <div className="px-4 py-3">
        <Link href="/">
          <div className="flex flex-col items-center cursor-pointer">
            <img src={activeTheme.fullLogo} alt="STB Cybersecurity" className="h-16 w-auto rounded-lg sidebar-logo" />
          </div>
        </Link>
      </div>
      
      <div className="flex-1 overflow-y-auto px-3 py-2 scrollbar-thin scrollbar-thumb-orange-500/20 scrollbar-track-transparent sidebar-scroll-fade">
        {navSections.map((section, sectionIndex) => (
          <div key={section.id} className={sectionIndex > 0 ? "mt-1" : ""}>
            {sectionIndex > 0 && (
              <div className="mx-4 my-2 h-px bg-zinc-800/60" />
            )}

            {!section.collapsible ? (
              <div>
                <div className="px-4 py-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600">
                    {t(section.labelKey)}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {section.items.map(item => (
                    <NavItemRow key={item.href} item={item} />
                  ))}
                </div>
              </div>
            ) : (
              <Collapsible
                open={openSections[section.id] ?? false}
                onOpenChange={() => toggleSection(section.id)}
              >
                <CollapsibleTrigger asChild>
                  <button
                    className="flex items-center w-full px-4 py-2 group/header cursor-pointer select-none"
                    data-testid={`section-${section.id}`}
                  >
                    <ChevronRight
                      className={`h-3.5 w-3.5 text-zinc-600 group-hover/header:text-zinc-400 transition-transform duration-200 mr-2 shrink-0 ${
                        openSections[section.id] ? "rotate-90" : ""
                      }`}
                    />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 group-hover/header:text-zinc-400 transition-colors duration-200">
                      {t(section.labelKey)}
                    </span>
                    {section.tierBadge === 'PRO' && (
                      <span className="ml-auto text-[9px] font-bold bg-orange-500/15 text-orange-400/80 px-1.5 py-0.5 rounded">PRO</span>
                    )}
                    {section.tierBadge === 'BIZ' && (
                      <span className="ml-auto text-[9px] font-bold bg-purple-500/15 text-purple-400/80 px-1.5 py-0.5 rounded">BIZ</span>
                    )}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="overflow-hidden">
                  <div className="space-y-0.5 mt-0.5">
                    {section.items.map(item => (
                      <NavItemRow key={item.href} item={item} />
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        ))}
      </div>

      <div className="px-3 py-2 border-t border-zinc-800/50 space-y-2">
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-md px-2.5 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <Phone aria-hidden="true" className="h-3 w-3 text-orange-400 shrink-0" />
              <span className="text-[10px] text-orange-400 font-bold truncate">{t('hotline.emergency')}</span>
            </div>
            <a 
              href="tel:+18557821987" 
              className="text-sm font-display font-bold text-white hover:text-orange-400 transition-colors duration-300 shrink-0"
              data-testid="link-phone-sidebar"
            >
              (855) STB-1987
            </a>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <p className="text-[9px] text-zinc-500 shrink-0">{t('hotline.available')}</p>
            <a 
              href="tel:+18557821987" 
              className="flex-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-[10px] py-1 px-1.5 rounded flex items-center justify-center gap-1 transition-all duration-300"
              data-testid="button-call-sidebar"
            >
              <Phone aria-hidden="true" className="h-2.5 w-2.5" /> {t('hotline.callNow')}
            </a>
            <a 
              href="sms:+18557821987" 
              className="flex-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-[10px] py-1 px-1.5 rounded flex items-center justify-center gap-1 transition-all duration-300"
              data-testid="button-sms-sidebar"
            >
              <MessageSquare aria-hidden="true" className="h-2.5 w-2.5" /> {t('hotline.textUs')}
            </a>
          </div>
        </div>
        <div className="relative rounded-md p-[1px] overflow-hidden sidebar-upgrade-glow">
          <div className="absolute inset-0 rounded-md bg-gradient-to-r from-orange-500/40 via-amber-500/40 to-orange-500/40" />
          <div className="relative bg-zinc-900/90 rounded-md px-2.5 py-2">
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="font-display text-xs font-bold text-orange-400">PRO ACCOUNT</h4>
              <Button size="sm" className="h-6 px-3 text-[10px] bg-orange-500 hover:bg-orange-600 text-white font-bold tracking-wide transition-all duration-300 hover:shadow-[0_0_16px_rgba(249,115,22,0.3)]" asChild>
                <a href="/pricing">UPGRADE</a>
              </Button>
            </div>
            <p className="text-[10px] text-zinc-500 leading-snug">Unlimited tools, real-time API & custom alerts.</p>
          </div>
        </div>
        <div className="flex items-center justify-between px-1 text-[10px] text-zinc-500">
          <a 
            href="/contact?category=general" 
            className="flex items-center gap-1 hover:text-orange-400 transition-all duration-300"
          >
            <Mail aria-hidden="true" className="h-2.5 w-2.5" />
            <span>Contact</span>
          </a>
          <span className="text-zinc-700">·</span>
          <a 
            href="/contact?category=support" 
            className="flex items-center gap-1 hover:text-orange-400 transition-all duration-300"
          >
            <Mail aria-hidden="true" className="h-2.5 w-2.5" />
            <span>Support</span>
          </a>
          <span className="text-zinc-700">·</span>
          <span className="text-zinc-600 truncate">STBCS · stbcybersecurity.com</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 selection:text-white">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-orange-500 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium">Skip to main content</a>
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72 border-r border-sidebar-border bg-sidebar" aria-describedby={undefined}>
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-72 shrink-0">
          <SidebarContent />
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-16 border-b border-border/50 header-glass flex items-center justify-between px-4 sm:px-6 sticky top-0 z-50 relative">
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-[6px] bg-gradient-to-t from-orange-500/[0.03] to-transparent pointer-events-none" />
            <div className="flex items-center gap-3 sm:gap-4">
              <Button variant="ghost" size="icon" className="md:hidden hover:bg-orange-500/10 transition-colors duration-300" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
              <Link href="/" className="flex items-center gap-2 md:hidden">
                <img src={activeTheme.icon} alt="STBCS Logo" className="h-8 w-8 drop-shadow-[0_0_6px_rgba(249,115,22,0.3)]" />
                <span className="font-display font-bold text-sm tracking-wider text-orange-400">STBCS</span>
              </Link>
              <div className="relative hidden sm:block w-96 search-glow rounded-md transition-all duration-300">
                <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground search-icon transition-colors duration-300" />
                <Input 
                  placeholder="Search CVEs, Groups, Incidents… (Press Enter)" 
                  className="pl-10 bg-sidebar-accent border-input focus:border-primary/50 transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  name="search"
                  autoComplete="off"
                  aria-label="Search threats"
                  data-testid="input-header-search"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <LanguageSelector />
              
              {isAuthenticated && (
                <Link href="/monitors?tab=alerts">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-orange-400 relative" aria-label="View alerts">
                    <Bell className={`h-5 w-5 ${bellAnimating ? 'bell-bounce' : 'bell-hover'}`} />
                    <span className="absolute top-3 right-3 h-2 w-2 bg-orange-500 rounded-full status-pulse"></span>
                  </Button>
                </Link>
              )}
              
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 pl-2 pr-4 h-10 rounded-full hover:bg-zinc-800">
                      <UserAvatar avatarUrl={user?.avatarUrl} username={user?.username} size="md" />
                      <div className="flex flex-col items-start text-xs hidden sm:flex">
                        <span className="font-bold text-white">{user?.username}</span>
                        <span className="text-zinc-500 flex items-center gap-1">
                          {isPro && <Crown className="h-3 w-3 text-orange-400" />}
                          {user?.tier === "free" ? "Free Tier" : user?.tier?.toUpperCase()}
                        </span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800">
                    <DropdownMenuLabel className="text-zinc-300">My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-zinc-800" />
                    <Link href="/account">
                      <DropdownMenuItem className="cursor-pointer text-zinc-400 hover:text-white" data-testid="dropdown-my-account">
                        <User className="mr-2 h-4 w-4" />
                        <span>My Account</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/monitors?tab=alerts">
                      <DropdownMenuItem className="cursor-pointer text-zinc-400 hover:text-white" data-testid="dropdown-alert-preferences">
                        <Bell className="mr-2 h-4 w-4" />
                        <span>Alert Preferences</span>
                      </DropdownMenuItem>
                    </Link>
                    {isPro ? (
                      <>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <Link href="/account">
                          <DropdownMenuItem className="cursor-pointer text-zinc-400 hover:text-white" data-testid="dropdown-manage-subscription">
                            <CreditCard className="mr-2 h-4 w-4" />
                            <span>Manage Subscription</span>
                          </DropdownMenuItem>
                        </Link>
                      </>
                    ) : (
                      <>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <Link href="/support">
                          <DropdownMenuItem className="cursor-pointer text-orange-400 hover:text-orange-300" data-testid="dropdown-upgrade-pro">
                            <Crown className="mr-2 h-4 w-4" />
                            <span>Upgrade to Pro</span>
                          </DropdownMenuItem>
                        </Link>
                      </>
                    )}
                    <DropdownMenuSeparator className="bg-zinc-800" />
                    <DropdownMenuItem 
                      className="cursor-pointer text-red-400 hover:text-red-300"
                      onClick={() => logout()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  onClick={() => setAuthModalOpen(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-medium"
                  data-testid="button-login"
                >
                  Sign In
                </Button>
              )}
            </div>
            
            <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
          </header>

          {/* Main Content Scroll Area */}
          <main id="main-content" className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
            <div key={location} className="page-transition">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
