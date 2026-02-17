import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n/context";
import { AuthProvider } from "@/lib/auth";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Lazy load pages for better performance
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Ransomware = lazy(() => import("@/pages/ransomware"));
const Exploits = lazy(() => import("@/pages/exploits"));
const News = lazy(() => import("@/pages/news"));
const ThreatFeeds = lazy(() => import("@/pages/threat-feeds"));
const SearchPage = lazy(() => import("@/pages/search"));
const ToolsPage = lazy(() => import("@/pages/tools"));
const LogoGallery = lazy(() => import("@/pages/logo-gallery"));
const Alerts = lazy(() => import("@/pages/alerts"));
const Messages = lazy(() => import("@/pages/messages"));
const Support = lazy(() => import("@/pages/support"));
const StylePreview = lazy(() => import("@/pages/style-preview"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Terms = lazy(() => import("@/pages/terms"));
const SmsTerms = lazy(() => import("@/pages/sms-terms"));
const ApiDocs = lazy(() => import("@/pages/api-docs"));
const GroupProfile = lazy(() => import("@/pages/group-profile"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Page loading component
function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Dashboard}/>
        <Route path="/ransomware" component={Ransomware}/>
        <Route path="/group/:name" component={GroupProfile}/>
        <Route path="/exploits" component={Exploits}/>
        <Route path="/news" component={News}/>
        <Route path="/threat-feeds" component={ThreatFeeds}/>
        <Route path="/search" component={SearchPage}/>
        <Route path="/tools" component={ToolsPage}/>
        <Route path="/logos" component={LogoGallery}/>
        <Route path="/alerts" component={Alerts}/>
        <Route path="/messages" component={Messages}/>
        <Route path="/support" component={Support}/>
        <Route path="/style-preview" component={StylePreview}/>
        <Route path="/privacy" component={Privacy}/>
        <Route path="/terms" component={Terms}/>
        <Route path="/sms-terms" component={SmsTerms}/>
        <Route path="/api-docs" component={ApiDocs}/>
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <I18nProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </I18nProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;