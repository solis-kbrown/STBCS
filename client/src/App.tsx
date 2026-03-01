import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/lib/i18n/context";
import { AuthProvider } from "@/lib/auth";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import LiveChatWidget from "@/components/live-chat-widget";

const Dashboard = lazy(() => import("@/pages/dashboard"));
const Ransomware = lazy(() => import("@/pages/ransomware"));
const Exploits = lazy(() => import("@/pages/exploits"));
const IntelPage = lazy(() => import("@/pages/intel"));
const SearchPage = lazy(() => import("@/pages/search"));
const ToolsPage = lazy(() => import("@/pages/tools"));
const LogoGallery = lazy(() => import("@/pages/logo-gallery"));
const Messages = lazy(() => import("@/pages/messages"));
const Support = lazy(() => import("@/pages/support"));
const StylePreview = lazy(() => import("@/pages/style-preview"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Terms = lazy(() => import("@/pages/terms"));
const SmsTerms = lazy(() => import("@/pages/sms-terms"));
const ApiDocs = lazy(() => import("@/pages/api-docs"));
const GroupProfile = lazy(() => import("@/pages/group-profile"));
const AccountPage = lazy(() => import("@/pages/account"));
const CheckoutPage = lazy(() => import("@/pages/checkout"));
const CheckoutReturnPage = lazy(() => import("@/pages/checkout-return"));
const AboutPage = lazy(() => import("@/pages/about"));
const ContactPage = lazy(() => import("@/pages/contact"));
const Breaches = lazy(() => import("@/pages/breaches"));
const ICSAdvisories = lazy(() => import("@/pages/ics-advisories"));
const RiskScore = lazy(() => import("@/pages/risk-score"));
const MonitorsPage = lazy(() => import("@/pages/monitors"));
const GroupsDirectory = lazy(() => import("@/pages/groups"));
const HeroGallery = lazy(() => import("@/pages/hero-gallery"));
const AttackSurface = lazy(() => import("@/pages/attack-surface"));
const Reports = lazy(() => import("@/pages/reports"));
const ServiceStatus = lazy(() => import("@/pages/service-status"));
const Playbooks = lazy(() => import("@/pages/playbooks"));
const PricingPage = lazy(() => import("@/pages/pricing"));
const RemoteDesktop = lazy(() => import("@/pages/remote-desktop"));
const SSHTerminal = lazy(() => import("@/pages/ssh-terminal"));
const TelnetClient = lazy(() => import("@/pages/telnet-client"));
const FileScanner = lazy(() => import("@/pages/file-scanner"));
const EmailAnalyzer = lazy(() => import("@/pages/email-analyzer"));
const EncodingTools = lazy(() => import("@/pages/encoding-tools"));
const SFTPClient = lazy(() => import("@/pages/sftp-client"));
const SSLChecker = lazy(() => import("@/pages/ssl-checker"));
const WebFingerprint = lazy(() => import("@/pages/web-fingerprint"));
const ExchangeChecker = lazy(() => import("@/pages/exchange-checker"));
const DnsAnalyzer = lazy(() => import("@/pages/dns-analyzer"));
const HeadersScanner = lazy(() => import("@/pages/headers-scanner"));
const KnowledgeBase = lazy(() => import("@/pages/knowledge-base"));
const KbPost = lazy(() => import("@/pages/kb-post"));
const KbEditor = lazy(() => import("@/pages/kb-editor"));
const KbAdmin = lazy(() => import("@/pages/kb-admin"));
const Feedback = lazy(() => import("@/pages/feedback"));
const EmailSignatures = lazy(() => import("@/pages/email-signatures"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Page loading component
function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <img src="/brand/icon-shield.png" alt="STBCS" className="h-16 w-16 mx-auto animate-pulse drop-shadow-[0_0_12px_rgba(239,68,68,0.4)]" />
        <Loader2 className="h-6 w-6 animate-spin motion-reduce:animate-none text-primary mx-auto" />
        <p className="text-muted-foreground text-sm font-display tracking-wider">Loading…</p>
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
        <Route path="/intel" component={IntelPage}/>
        <Route path="/search" component={SearchPage}/>
        <Route path="/tools" component={ToolsPage}/>
        <Route path="/logos" component={LogoGallery}/>
        <Route path="/messages" component={Messages}/>
        <Route path="/support" component={Support}/>
        <Route path="/style-preview" component={StylePreview}/>
        <Route path="/privacy" component={Privacy}/>
        <Route path="/terms" component={Terms}/>
        <Route path="/sms-terms" component={SmsTerms}/>
        <Route path="/api-docs" component={ApiDocs}/>
        <Route path="/account" component={AccountPage}/>
        <Route path="/checkout" component={CheckoutPage}/>
        <Route path="/checkout/return" component={CheckoutReturnPage}/>
        <Route path="/about" component={AboutPage}/>
        <Route path="/contact" component={ContactPage}/>
        <Route path="/breaches" component={Breaches}/>
        <Route path="/ics-advisories" component={ICSAdvisories}/>
        <Route path="/risk-score" component={RiskScore}/>
        <Route path="/monitors" component={MonitorsPage}/>
        <Route path="/groups" component={GroupsDirectory}/>
        <Route path="/hero-backgrounds" component={HeroGallery}/>
        <Route path="/attack-surface" component={AttackSurface}/>
        <Route path="/reports" component={Reports}/>
        <Route path="/service-status" component={ServiceStatus}/>
        <Route path="/pricing" component={PricingPage}/>
        <Route path="/playbooks" component={Playbooks}/>
        <Route path="/remote-desktop" component={RemoteDesktop}/>
        <Route path="/ssh-terminal" component={SSHTerminal}/>
        <Route path="/telnet-client" component={TelnetClient}/>
        <Route path="/file-scanner" component={FileScanner}/>
        <Route path="/email-analyzer" component={EmailAnalyzer}/>
        <Route path="/encoding-tools" component={EncodingTools}/>
        <Route path="/sftp-client" component={SFTPClient}/>
        <Route path="/ssl-checker" component={SSLChecker}/>
        <Route path="/web-fingerprint" component={WebFingerprint}/>
        <Route path="/exchange-checker" component={ExchangeChecker}/>
        <Route path="/dns-analyzer" component={DnsAnalyzer}/>
        <Route path="/headers-scanner" component={HeadersScanner}/>
        <Route path="/knowledge-base" component={KnowledgeBase}/>
        <Route path="/knowledge-base/new" component={KbEditor}/>
        <Route path="/knowledge-base/admin" component={KbAdmin}/>
        <Route path="/knowledge-base/:slug/edit" component={KbEditor}/>
        <Route path="/knowledge-base/:slug" component={KbPost}/>
        <Route path="/feedback" component={Feedback}/>
        <Route path="/email-signatures" component={EmailSignatures}/>
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
            <LiveChatWidget />
          </TooltipProvider>
        </I18nProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;