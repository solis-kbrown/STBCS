import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { CheckCircle2, XCircle, Loader2, ArrowRight, Mail, Shield, Bell, Wrench, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDocumentTitle } from "@/lib/use-document-title";
import Layout from "@/components/layout";
import Footer from "@/components/footer";

export default function CheckoutReturnPage() {
  useDocumentTitle("Payment Status | STB Cybersecurity");
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const sessionId = searchParams.get("session_id");

  const { data, isLoading, error } = useQuery({
    queryKey: ["session-status", sessionId],
    queryFn: async () => {
      const res = await fetch(`/api/stripe/session-status?session_id=${sessionId}`);
      if (!res.ok) throw new Error("Failed to retrieve payment status");
      return res.json();
    },
    enabled: !!sessionId,
    refetchOnWindowFocus: false,
  });

  if (!sessionId) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
          <p className="text-zinc-400">No session found. Please return to the support page.</p>
          <Button onClick={() => navigate("/support")} data-testid="button-back-support">
            Back to Support
          </Button>
        </div>
        <Footer />
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-orange-500 mx-auto" />
            <p className="text-zinc-400">Confirming your payment...</p>
          </div>
        </div>
        <Footer />
      </Layout>
    );
  }

  const isDonation = data?.metadata?.type === "donation";
  const isComplete = data?.status === "complete";
  const isOpen = data?.status === "open";

  if (isComplete) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-12 space-y-6 animate-in fade-in duration-500">
          <Card className={isDonation ? "bg-pink-500/10 border-pink-500/30" : "bg-green-500/10 border-green-500/30"} data-testid="card-payment-success">
            <CardContent className="pt-6 text-center space-y-4">
              <img src="/brand/icon-shield.png" alt="STBCS" className="h-16 w-16 mx-auto drop-shadow-[0_0_12px_rgba(0,200,255,0.4)]" data-testid="img-success-logo" />
              {isDonation ? (
                <Heart className="h-8 w-8 text-pink-400 mx-auto" />
              ) : (
                <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto" />
              )}
              <h2 className="text-2xl font-bold text-white" data-testid="text-success-title">
                {isDonation ? "Thank You for Your Donation!" : "Welcome to STBCS!"}
              </h2>
              <p className="text-zinc-300">
                {isDonation
                  ? "Your generous donation supports free cybersecurity tools for the community. A receipt has been sent to your email."
                  : "Your membership is now active. You have full access to all your tier's features."}
              </p>
              <p className="text-sm text-zinc-500 flex items-center justify-center gap-1">
                <Mail className="h-3 w-3" /> A confirmation has been sent to your email by Stripe
              </p>
            </CardContent>
          </Card>

          {!isDonation && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Button
                onClick={() => navigate("/account")}
                className="bg-orange-500 hover:bg-orange-600 text-white h-auto py-4 flex-col gap-2"
                data-testid="button-view-account"
              >
                <Shield className="h-5 w-5" />
                <span>View Account</span>
              </Button>
              <Button
                onClick={() => navigate("/alerts")}
                variant="outline"
                className="border-zinc-700 hover:border-orange-500/50 h-auto py-4 flex-col gap-2"
                data-testid="button-setup-alerts"
              >
                <Bell className="h-5 w-5" />
                <span>Set Up Alerts</span>
              </Button>
              <Button
                onClick={() => navigate("/tools")}
                variant="outline"
                className="border-zinc-700 hover:border-orange-500/50 h-auto py-4 flex-col gap-2"
                data-testid="button-explore-tools"
              >
                <Wrench className="h-5 w-5" />
                <span>Explore Tools</span>
              </Button>
            </div>
          )}

          {isDonation && (
            <div className="text-center">
              <Button
                onClick={() => navigate("/support")}
                className="bg-orange-500 hover:bg-orange-600 text-white"
                data-testid="button-back-support"
              >
                <ArrowRight className="h-4 w-4 mr-2" /> Back to Support
              </Button>
            </div>
          )}
        </div>
        <Footer />
      </Layout>
    );
  }

  if (isOpen) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-12 space-y-6 animate-in fade-in duration-500">
          <Card className="bg-yellow-500/10 border-yellow-500/30" data-testid="card-payment-incomplete">
            <CardContent className="pt-6 text-center space-y-4">
              <XCircle className="h-12 w-12 text-yellow-400 mx-auto" />
              <h2 className="text-xl font-bold text-white">Payment Incomplete</h2>
              <p className="text-zinc-400">
                Your payment was not completed. No charges have been made.
              </p>
              <Button
                onClick={() => navigate("/support")}
                variant="outline"
                className="border-zinc-700"
                data-testid="button-try-again"
              >
                <ArrowRight className="h-4 w-4 mr-2" /> Return to Membership
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-12 space-y-6">
        <Card className="bg-red-500/10 border-red-500/30" data-testid="card-payment-error">
          <CardContent className="pt-6 text-center space-y-4">
            <XCircle className="h-12 w-12 text-red-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">Something Went Wrong</h2>
            <p className="text-zinc-400">
              {error ? "Unable to verify payment status." : "An unexpected error occurred."}{" "}
              Please <a href="mailto:support@stbcybersecurity.com" className="text-orange-400 hover:underline">contact us</a> if you believe this is an error.
            </p>
            <Button
              onClick={() => navigate("/support")}
              variant="outline"
              className="border-zinc-700"
              data-testid="button-back-support"
            >
              Back to Support
            </Button>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </Layout>
  );
}
