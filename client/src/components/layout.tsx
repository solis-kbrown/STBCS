import { Link, useLocation, useRoute } from "wouter";
import { 
  GalleryVerticalEnd,
  Scan,
  Wrench,
  Activity,
  ShieldOff,
  Bug,
  Satellite,
  TrendingUp,
  Heart,
  Menu, 
  Search, 
  User, 
  LogOut,
  Mail,
  Phone,
  MessageSquare,
  Bell,
  Crown
} from "lucide-react";
import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LanguageSelector } from "@/components/language-selector";
import { useTranslation } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth";
import { AuthModal } from "@/components/auth-modal";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { t } = useTranslation();
  const { user, isAuthenticated, isPro, logout } = useAuth();

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim().length >= 2) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navItems = [
    { href: "/", labelKey: "nav.dashboard", icon: GalleryVerticalEnd },
    { href: "/search", labelKey: "nav.search", icon: Scan },
    { href: "/tools", labelKey: "nav.tools", icon: Wrench },
    { href: "/alerts", labelKey: "nav.alerts", icon: Activity, isPro: true },
    { href: "/ransomware", labelKey: "nav.ransomware", icon: ShieldOff },
    { href: "/exploits", labelKey: "nav.exploits", icon: Bug },
    { href: "/threat-feeds", labelKey: "nav.threatFeeds", icon: Satellite },
    { href: "/news", labelKey: "nav.news", icon: TrendingUp },
    { href: "/support", labelKey: "nav.support", icon: Heart },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="p-6 flex items-center gap-3 group">
        <div className="relative">
          <img src="/logo.png" alt="STB Cybersecurity" className="h-20 w-20 rounded-lg shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow duration-300" />
          <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
        <div className="flex flex-col">
          <span className="font-display font-bold text-xl tracking-wider text-orange-400 drop-shadow-[0_0_10px_rgba(249,115,22,0.3)]">STBCS</span>
          <span className="text-[10px] text-zinc-500 tracking-widest uppercase">Stop The Bleed Cybersecurity</span>
        </div>
      </div>
      
      <div className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div 
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-r-md transition-all duration-200 cursor-pointer group
                  ${isActive 
                    ? "bg-orange-500/15 text-orange-400 border-l-2 border-orange-500" 
                    : "text-zinc-500 hover:bg-zinc-800/50 hover:text-orange-300 border-l-2 border-transparent hover:border-orange-500/50"
                  }
                `}
              >
                <item.icon className={`h-5 w-5 transition-colors ${isActive ? "text-orange-400" : "text-zinc-600 group-hover:text-orange-400/80"}`} />
                <span className="font-medium">{t(item.labelKey)}</span>
                {'isPro' in item && item.isPro && (
                  <span className="ml-auto text-[10px] font-bold bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded">PRO</span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-zinc-800/50 space-y-3">
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
          <p className="text-[10px] text-orange-400 font-bold mb-1 flex items-center gap-1">
            <Phone className="h-3 w-3" /> {t('hotline.emergency')}
          </p>
          <a 
            href="tel:+18557821987" 
            className="text-base font-display font-bold text-white hover:text-orange-400 transition-colors block"
            data-testid="link-phone-sidebar"
          >
            (855) STB-1987
          </a>
          <p className="text-xs text-zinc-500 mt-1">{t('hotline.available')}</p>
          <div className="flex gap-2 mt-2">
            <a 
              href="tel:+18557821987" 
              className="flex-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-xs py-1.5 px-2 rounded flex items-center justify-center gap-1 transition-colors"
              data-testid="button-call-sidebar"
            >
              <Phone className="h-3 w-3" /> {t('hotline.callNow')}
            </a>
            <a 
              href="sms:+18557821987" 
              className="flex-1 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-xs py-1.5 px-2 rounded flex items-center justify-center gap-1 transition-colors"
              data-testid="button-sms-sidebar"
            >
              <MessageSquare className="h-3 w-3" /> {t('hotline.textUs')}
            </a>
          </div>
        </div>
        <div className="bg-zinc-900/50 rounded-lg p-4 border border-zinc-800">
          <h4 className="font-display text-sm font-bold text-orange-400 mb-1">PRO ACCOUNT</h4>
          <p className="text-xs text-zinc-500 mb-3">Upgrade for unlimited tools, real-time API access, and custom alerts.</p>
          <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold tracking-wide">
            UPGRADE
          </Button>
        </div>
        <div className="px-2 space-y-1">
          <a 
            href="mailto:info@stoptbcs.com" 
            className="flex items-center gap-2 text-xs text-zinc-500 hover:text-orange-400 transition-colors"
          >
            <Mail className="h-3 w-3" />
            <span>info@stoptbcs.com</span>
          </a>
          <a 
            href="mailto:support@stoptbcs.com" 
            className="flex items-center gap-2 text-xs text-zinc-500 hover:text-orange-400 transition-colors"
          >
            <Mail className="h-3 w-3" />
            <span>support@stoptbcs.com</span>
          </a>
        </div>
        <div className="px-2 pt-2 border-t border-zinc-800/50">
          <p className="text-[10px] text-zinc-600 leading-relaxed">
            STB Cybersecurity (STBCS)<br />
            stoptbcs.com | stbcybersecurity.com
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 selection:text-white">
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72 border-r border-sidebar-border bg-sidebar">
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
          <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <div className="relative hidden sm:block w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search CVEs, Groups, Incidents... (Press Enter)" 
                  className="pl-10 bg-sidebar-accent border-input focus:border-primary/50 transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  data-testid="input-header-search"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <LanguageSelector />
              
              {isAuthenticated && (
                <Link href="/alerts">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-orange-400 relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-3 right-3 h-2 w-2 bg-orange-500 rounded-full animate-pulse"></span>
                  </Button>
                </Link>
              )}
              
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2 pl-2 pr-4 h-10 rounded-full hover:bg-zinc-800">
                      <Avatar className="h-8 w-8 border border-orange-500/30">
                        <AvatarFallback className="bg-orange-500/20 text-orange-400">
                          {user?.username?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
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
                    <DropdownMenuItem className="cursor-pointer text-zinc-400 hover:text-white">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer text-zinc-400 hover:text-white">
                      <Bell className="mr-2 h-4 w-4" />
                      <span>Alert Preferences</span>
                    </DropdownMenuItem>
                    {!isPro && (
                      <>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <Link href="/support">
                          <DropdownMenuItem className="cursor-pointer text-orange-400 hover:text-orange-300">
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
          <main className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}