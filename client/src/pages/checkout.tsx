import { useCallback, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Loader2, Shield, Lock, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/lib/use-document-title";
import Layout from "@/components/layout";
import Footer from "@/components/footer";

let stripePromise: ReturnType<typeof loadStripe> | null = null;

function getStripePromise() {
  if (!stripePromise) {
    stripePromise = fetch("/api/stripe/config")
      .then((res) => res.json())
      .then((data) => loadStripe(data.publishableKey));
  }
  return stripePromise;
}

export default function CheckoutPage() {
  useDocumentTitle("Secure Checkout | STB Cybersecurity", "Complete your secure payment with Stripe embedded checkout. PCI DSS compliant. Your card details never touch our servers.");
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const type = searchParams.get("type") || "subscription";
  const priceId = searchParams.get("priceId");
  const amount = searchParams.get("amount");
  const tierName = searchParams.get("tier");
  
  const storedData = (() => {
    try {
      const raw = sessionStorage.getItem("stbcs_checkout");
      if (raw) {
        sessionStorage.removeItem("stbcs_checkout");
        return JSON.parse(raw);
      }
    } catch {}
    return {};
  })();
  const email = storedData.email;
  const donorName = storedData.donorName;

  const [error, setError] = useState<string | null>(null);

  const fetchClientSecret = useCallback(async () => {
    let endpoint = "/api/stripe/checkout";
    let body: any = {};

    if (type === "donation") {
      endpoint = "/api/stripe/donate";
      body = {
        amount: parseInt(amount || "0"),
        customerEmail: email || undefined,
        donorName: donorName || undefined,
      };
    } else {
      body = {
        priceId,
        customerEmail: email || undefined,
        mode: "subscription",
      };
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to create checkout session");
    }

    const data = await res.json();
    return data.clientSecret;
  }, [type, priceId, amount, email, donorName]);

  if (!priceId && type !== "donation") {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
          <p className="text-zinc-400">Invalid checkout request. Please go back and try again.</p>
          <Button onClick={() => navigate("/support")} variant="outline" data-testid="button-back-support">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Membership
          </Button>
        </div>
        <Footer />
      </Layout>
    );
  }

  if (type === "donation" && (!amount || parseInt(amount) < 100)) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
          <p className="text-zinc-400">Invalid donation amount. Please go back and try again.</p>
          <Button onClick={() => navigate("/support")} variant="outline" data-testid="button-back-support">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Support
          </Button>
        </div>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8 space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <Button
            onClick={() => navigate("/support")}
            variant="ghost"
            className="text-zinc-400 hover:text-white"
            data-testid="button-back-support"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3 text-green-500" aria-hidden="true" /> SSL Encrypted
            </span>
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-green-500" aria-hidden="true" /> PCI Compliant
            </span>
            <span className="flex items-center gap-1">
              <CreditCard className="h-3 w-3 text-green-500" aria-hidden="true" /> Powered by Stripe
            </span>
          </div>
        </div>

        <div className="text-center space-y-3">
          <img src="/brand/icon-shield.png" alt="STBCS" className="h-16 w-16 mx-auto drop-shadow-[0_0_10px_rgba(0,200,255,0.3)]" data-testid="img-checkout-logo" />
          <h1 className="text-2xl font-bold text-white" data-testid="text-checkout-title">
            {type === "donation" ? "Complete Your Donation" : `Subscribe to ${tierName || "STBCS"}`}
          </h1>
          <p className="text-zinc-400 text-sm">
            Your payment details are handled securely by Stripe and never touch our servers.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center text-red-400">
            {error}
            <Button
              onClick={() => { setError(null); navigate("/support"); }}
              variant="outline"
              size="sm"
              className="ml-4"
            >
              Try Again
            </Button>
          </div>
        )}

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-1 min-h-[400px]" data-testid="checkout-embedded-form">
          <EmbeddedCheckoutProvider
            stripe={getStripePromise()}
            options={{ fetchClientSecret }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>

        <p className="text-center text-xs text-zinc-600">
          By completing this payment, you agree to our{" "}
          <a href="/terms" className="text-zinc-500 hover:text-orange-400 underline">Terms of Service</a>{" "}
          and{" "}
          <a href="/privacy" className="text-zinc-500 hover:text-orange-400 underline">Privacy Policy</a>.
        </p>
      </div>
      <Footer />
    </Layout>
  );
}
