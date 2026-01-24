import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Ransomware from "@/pages/ransomware";
import Exploits from "@/pages/exploits";
import News from "@/pages/news";
import ThreatFeeds from "@/pages/threat-feeds";
import SearchPage from "@/pages/search";
import ToolsPage from "@/pages/tools";
import LogoGallery from "@/pages/logo-gallery";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard}/>
      <Route path="/ransomware" component={Ransomware}/>
      <Route path="/exploits" component={Exploits}/>
      <Route path="/news" component={News}/>
      <Route path="/threat-feeds" component={ThreatFeeds}/>
      <Route path="/search" component={SearchPage}/>
      <Route path="/tools" component={ToolsPage}/>
      <Route path="/logos" component={LogoGallery}/>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;