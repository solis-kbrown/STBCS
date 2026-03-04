import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Lock, Mail } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "login" | "signup";
  onSuccess?: () => void;
}

export function AuthModal({ open, onOpenChange, defaultTab = "login", onSuccess }: AuthModalProps) {
  const { login, signup } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">(defaultTab);

  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [signupForm, setSignupForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (open) {
      setActiveTab(defaultTab);
    }
  }, [open, defaultTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(loginForm.username, loginForm.password);
      toast({ title: "Welcome back!", description: "You have been logged in." });
      onOpenChange(false);
      setLoginForm({ username: "", password: "" });
      onSuccess?.();
    } catch (error: any) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      toast({ title: "Please agree to the Terms of Service and Privacy Policy", variant: "destructive" });
      return;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }

    if (signupForm.password.length < 12) {
      toast({ title: "Password must be at least 12 characters", variant: "destructive" });
      return;
    }

    if (!/[a-z]/.test(signupForm.password) || !/[A-Z]/.test(signupForm.password) || !/[0-9]/.test(signupForm.password)) {
      toast({ title: "Password must include uppercase, lowercase, and a number", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      await signup(signupForm.username, signupForm.email, signupForm.password);
      toast({ title: "Account created!", description: "Welcome to STBCS." });
      onOpenChange(false);
      setSignupForm({ username: "", email: "", password: "", confirmPassword: "" });
      setAgreedToTerms(false);
      onSuccess?.();
    } catch (error: any) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <img src="/brand/icon-shield.png" alt="STBCS" className="h-10 w-10 drop-shadow-[0_0_6px_rgba(239,68,68,0.3)]" />
            <DialogTitle className="text-xl font-display text-orange-400">STBCS Account</DialogTitle>
          </div>
          <DialogDescription className="text-zinc-400">
            Sign in or create an account to access Pro features.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")}>
          <TabsList className="grid w-full grid-cols-2 bg-zinc-800">
            <TabsTrigger value="login" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              Login
            </TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-username" className="text-zinc-300">Username or Email</Label>
                <div className="relative">
                  <User aria-hidden="true" className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input
                    id="login-username"
                    placeholder="Enter username or email…"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                    className="pl-10 bg-zinc-800 border-zinc-500 text-white"
                    required
                    name="username"
                    autoComplete="username"
                    spellCheck={false}
                    data-testid="input-login-username"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-zinc-300">Password</Label>
                <div className="relative">
                  <Lock aria-hidden="true" className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Enter password…"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="pl-10 bg-zinc-800 border-zinc-500 text-white"
                    required
                    name="password"
                    autoComplete="current-password"
                    data-testid="input-login-password"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                disabled={isLoading}
                data-testid="button-login-submit"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Login"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-username" className="text-zinc-300">Username</Label>
                <div className="relative">
                  <User aria-hidden="true" className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input
                    id="signup-username"
                    placeholder="Choose a username…"
                    value={signupForm.username}
                    onChange={(e) => setSignupForm({ ...signupForm, username: e.target.value })}
                    className="pl-10 bg-zinc-800 border-zinc-500 text-white"
                    required
                    name="username"
                    autoComplete="username"
                    spellCheck={false}
                    data-testid="input-signup-username"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-zinc-300">Email</Label>
                <div className="relative">
                  <Mail aria-hidden="true" className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email…"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    className="pl-10 bg-zinc-800 border-zinc-500 text-white"
                    required
                    name="email"
                    autoComplete="email"
                    spellCheck={false}
                    data-testid="input-signup-email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-zinc-300">Password</Label>
                <div className="relative">
                  <Lock aria-hidden="true" className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Min 12 chars, upper + lower + number"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    className="pl-10 bg-zinc-800 border-zinc-500 text-white"
                    required
                    name="new-password"
                    autoComplete="new-password"
                    data-testid="input-signup-password"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-confirm" className="text-zinc-300">Confirm Password</Label>
                <div className="relative">
                  <Lock aria-hidden="true" className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <Input
                    id="signup-confirm"
                    type="password"
                    placeholder="Confirm your password…"
                    value={signupForm.confirmPassword}
                    onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                    className="pl-10 bg-zinc-800 border-zinc-500 text-white"
                    required
                    name="confirm-password"
                    autoComplete="new-password"
                    data-testid="input-signup-confirm"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="agree-terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-zinc-500 bg-zinc-800 text-orange-500 focus:ring-orange-500 accent-orange-500"
                  data-testid="checkbox-agree-terms"
                />
                <label htmlFor="agree-terms" className="text-xs text-zinc-400 leading-relaxed">
                  I agree to the{" "}
                  <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">
                    Privacy Policy
                  </a>
                  . I confirm I am at least 18 years of age.
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                disabled={isLoading || !agreedToTerms}
                data-testid="button-signup-submit"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
