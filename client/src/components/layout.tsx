import { Link, useLocation, useRoute } from "wouter";
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Skull, 
  Newspaper, 
  Menu, 
  Search, 
  User, 
  Bell,
  LogOut,
  Globe,
  Wrench,
  Mail
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

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim().length >= 2) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/search", label: "Global Search", icon: Search },
    { href: "/tools", label: "Security Tools", icon: Wrench },
    { href: "/ransomware", label: "Ransomware Tracker", icon: Skull },
    { href: "/exploits", label: "Exploits & CVEs", icon: ShieldAlert },
    { href: "/threat-feeds", label: "Threat Feeds", icon: Globe },
    { href: "/news", label: "Intel & News", icon: Newspaper },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="p-6 flex items-center gap-3">
        <img src="/logo.png" alt="Stop The Bleed CS" className="h-8 w-8" />
        <span className="font-display font-bold text-lg tracking-wider text-primary">STOP THE BLEED</span>
      </div>
      
      <div className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div 
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 cursor-pointer group
                  ${isActive 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_0_15px_rgba(220,38,38,0.3)]" 
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                  }
                `}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-muted-foreground group-hover:text-primary transition-colors"}`} />
                <span className="font-medium">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-sidebar-border space-y-3">
        <div className="bg-sidebar-accent/50 rounded-lg p-4 border border-sidebar-border">
          <h4 className="font-display text-sm font-bold text-primary mb-1">PRO ACCOUNT</h4>
          <p className="text-xs text-muted-foreground mb-3">Upgrade for unlimited tools, real-time API access, and custom alerts.</p>
          <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-white font-bold tracking-wide">
            UPGRADE
          </Button>
        </div>
        <div className="px-2">
          <a 
            href="mailto:info@stoptbcs.com" 
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <Mail className="h-3 w-3" />
            <span>info@stoptbcs.com</span>
          </a>
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

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-3 right-3 h-2 w-2 bg-primary rounded-full animate-pulse"></span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 pl-2 pr-4 h-10 rounded-full hover:bg-sidebar-accent">
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-xs hidden sm:flex">
                      <span className="font-bold">Security Analyst</span>
                      <span className="text-muted-foreground">Free Tier</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Alert Preferences</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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