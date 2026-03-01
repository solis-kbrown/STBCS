import { useState } from "react";
import { useDocumentTitle } from "@/lib/use-document-title";
import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bug, MessageSquareText, Lightbulb, AlertTriangle, ShieldAlert,
  ThumbsUp, Send, Loader2, CheckCircle, ChevronDown
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import AnimatedSection from "@/components/animated-section";

const categories = [
  { value: "bug_report", label: "Bug Report", icon: Bug, description: "Something isn't working right" },
  { value: "site_issue", label: "Site Issue / Problem", icon: AlertTriangle, description: "Page errors, broken links, display issues" },
  { value: "feature_request", label: "Feature Request", icon: Lightbulb, description: "Suggest a new feature or improvement" },
  { value: "general_feedback", label: "General Feedback", icon: MessageSquareText, description: "Share your thoughts about the platform" },
  { value: "recommendation", label: "Recommendation", icon: ThumbsUp, description: "Recommend a tool, feed, or resource" },
  { value: "security_concern", label: "Security Concern", icon: ShieldAlert, description: "Report a security vulnerability or concern" },
];

export default function FeedbackPage() {
  useDocumentTitle(
    "Feedback & Bug Reports | STB Cybersecurity",
    "Report bugs, request features, submit feedback, or share recommendations with the STBCS team. Your input helps us improve."
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    category: "",
    subject: "",
    description: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit");
      }
      return res.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      setForm({ name: "", email: "", category: "", subject: "", description: "" });
    },
  });

  if (submitted) {
    return (
      <Layout>
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
          <AnimatedSection animation="fade-up">
            <Card className="bg-zinc-900/80 border-green-500/30 max-w-lg mx-auto">
              <CardContent className="p-8 text-center space-y-4">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <h2 className="text-2xl font-display font-bold text-white tracking-wider" data-testid="text-feedback-success">
                  Submission Received
                </h2>
                <p className="text-zinc-400 leading-relaxed">
                  Thank you for your feedback. Our team will review your submission and take appropriate action.
                  If you provided an email, we may reach out for follow-up.
                </p>
                <Button
                  onClick={() => setSubmitted(false)}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-display tracking-wider"
                  data-testid="button-submit-another"
                >
                  Submit Another
                </Button>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-zinc-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          <AnimatedSection animation="fade-up">
            <div className="text-center space-y-3">
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-wider" data-testid="text-feedback-title">
                FEEDBACK & BUG REPORTS
              </h1>
              <p className="text-zinc-400 max-w-2xl mx-auto">
                Help us improve STBCS. Report bugs, suggest features, share feedback, or flag security concerns.
                No account required — anyone can submit.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={100}>
            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-xl font-display text-white tracking-wider">
                  What would you like to tell us?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = form.category === cat.value;
                    return (
                      <button
                        key={cat.value}
                        onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                        className={`p-4 rounded-lg border text-left transition-all ${
                          isSelected
                            ? "border-orange-500 bg-orange-500/10 ring-1 ring-orange-500/30"
                            : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600 hover:bg-zinc-800"
                        }`}
                        data-testid={`button-category-${cat.value}`}
                      >
                        <Icon className={`h-5 w-5 mb-2 ${isSelected ? "text-orange-400" : "text-zinc-400"}`} />
                        <div className={`text-sm font-semibold ${isSelected ? "text-orange-300" : "text-zinc-200"}`}>
                          {cat.label}
                        </div>
                        <div className="text-xs text-zinc-500 mt-1">{cat.description}</div>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Name (optional)</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Your name"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none"
                      data-testid="input-feedback-name"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-1">Email (optional, for follow-up)</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="your@email.com"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none"
                      data-testid="input-feedback-email"
                      maxLength={200}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Subject *</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
                    placeholder="Brief summary of your feedback"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none"
                    data-testid="input-feedback-subject"
                    maxLength={200}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Description *</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Describe the bug, issue, feature, or feedback in detail. Include steps to reproduce if applicable."
                    rows={6}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none resize-none"
                    data-testid="input-feedback-description"
                    maxLength={5000}
                  />
                  <div className="text-xs text-zinc-500 mt-1 text-right">{form.description.length}/5000</div>
                </div>

                {submitMutation.isError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm" data-testid="text-feedback-error">
                    {submitMutation.error?.message || "Failed to submit. Please try again."}
                  </div>
                )}

                <Button
                  onClick={() => submitMutation.mutate(form)}
                  disabled={!form.subject.trim() || !form.description.trim() || !form.category || submitMutation.isPending}
                  className="w-full bg-orange-600 hover:bg-orange-500 text-white font-display tracking-wider py-3 disabled:opacity-50"
                  data-testid="button-submit-feedback"
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Feedback
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={200}>
            <Card className="bg-zinc-900/40 border-zinc-800">
              <CardContent className="p-6">
                <h3 className="text-lg font-display text-white tracking-wider mb-4">What Happens Next?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm">1</div>
                    <h4 className="text-sm font-semibold text-white">Review</h4>
                    <p className="text-xs text-zinc-500">Our team reviews every submission within 24-48 hours.</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm">2</div>
                    <h4 className="text-sm font-semibold text-white">Action</h4>
                    <p className="text-xs text-zinc-500">Bugs are prioritized and fixed. Features are evaluated for the roadmap.</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm">3</div>
                    <h4 className="text-sm font-semibold text-white">Follow-up</h4>
                    <p className="text-xs text-zinc-500">If you left an email, we'll notify you when your issue is resolved.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </div>
      <Footer />
    </Layout>
  );
}
