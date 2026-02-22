import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Home } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/lib/use-document-title";

export default function NotFound() {
  useDocumentTitle("Page Not Found | STB Cybersecurity");
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950">
      <Card className="w-full max-w-md mx-4 border-white/10 bg-zinc-900/50">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="flex flex-col items-center gap-4 mb-6">
            <img src="/brand/icon-shield.png" alt="STBCS" className="h-20 w-20 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)] opacity-60" />
            <div className="p-3 rounded-full bg-orange-500/10 border border-orange-500/30">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
            <h1 className="text-3xl font-display font-bold text-white">404</h1>
            <p className="text-xl text-zinc-400">Page Not Found</p>
          </div>

          <p className="text-sm text-zinc-500 mb-6">
            This page doesn't exist or has been moved. Head back to the dashboard for live threat data.
          </p>
          
          <Link href="/">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white" data-testid="button-go-home">
              <Home className="h-4 w-4 mr-2" />
              Back to Threat Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
