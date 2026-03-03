import { Shield, Target, Search, MessageSquare, Phone, Mail, Users, Award, Clock, Globe, TrendingUp, Zap, CheckCircle, Star, Quote, Briefcase } from "lucide-react";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout";
import Footer from "@/components/footer";
import { Link } from "wouter";
import AnimatedSection, { AnimatedList } from "@/components/animated-section";

const services = [
  {
    icon: Shield,
    title: "Incident Response",
    description: "Active breach? Our team deploys immediately to contain the attack, investigate root cause, and get your systems back to a known-good state. We handle ransomware negotiations, forensic analysis, and recovery end to end.",
  },
  {
    icon: Target,
    title: "Ransomware Recovery",
    description: "We negotiate with threat actors, attempt decryption, and restore your operations. Our recovery engineers work around the clock to get your business back online as fast as possible.",
  },
  {
    icon: Search,
    title: "Threat Hunting",
    description: "Attackers already inside your network? We find them. Proactive hunts identify compromised accounts, backdoors, and lateral movement before the damage spreads.",
  },
  {
    icon: MessageSquare,
    title: "Security Consulting",
    description: "Gap assessments, policy development, compliance readiness, and hands-on guidance. We help you build defenses that match your risk profile and budget.",
  },
];

const platformFeatures = [
  "IR Playbooks with step-by-step response procedures",
  "Service Status Dashboard for real-time platform monitoring",
  "Email Header Analyzer to detect spoofing and phishing",
  "Dark web threat intelligence monitoring",
  "Attack Surface Discovery for exposed assets",
  "Real-time alerts via email and SMS",
];

const stats = [
  { value: "105+", label: "Threat Intelligence Feeds", icon: Globe },
  { value: "24/7", label: "Emergency Response", icon: Clock },
  { value: "15min", label: "Threat Data Refresh Cycle", icon: Zap },
  { value: "SMB", label: "Focused on Small Business", icon: Users },
];

const whyUs = [
  "Real practitioners who handle real incidents every day",
  "Threat intelligence from 105+ live public and commercial feeds",
  "No long-term contracts required for consulting engagements",
  "Free security tools and threat intelligence for everyone",
  "Subscription plans that scale — Supporter, Pro, Business, and Unlimited Everything tiers",
  "24/7 emergency hotline for active incidents",
];

const testimonials = [
  {
    quote: "When ransomware hit us at 2 AM on a Saturday, STB had someone on the phone within 15 minutes. They walked us through containment, negotiated with the threat actors, and had our systems restored by Monday. We didn't lose a single file.",
    author: "Marcus T.",
    role: "IT Director, Manufacturing Company",
    rating: 5,
  },
  {
    quote: "We thought we were done. LockBit encrypted everything and our backups were compromised. STB's recovery team found a way to decrypt our data that our previous vendor said was impossible. They literally saved our business.",
    author: "Jennifer W.",
    role: "CEO, Healthcare Services",
    rating: 5,
  },
  {
    quote: "The consulting engagement was eye-opening. They found three active backdoors in our network that had been there for months. Their threat hunting team is the real deal — these aren't salespeople, they're practitioners.",
    author: "David K.",
    role: "CISO, Financial Services Firm",
    rating: 5,
  },
  {
    quote: "After the breach, STB handled the forensic investigation, wrote the incident report, and helped us meet our regulatory notification deadlines. Having someone who's been through thousands of these cases guiding you makes all the difference.",
    author: "Rachel P.",
    role: "General Counsel, Regional Bank",
    rating: 5,
  },
];

const consultingHighlights = [
  { value: "1,000+", label: "Ransomware Cases Handled" },
  { value: "98%", label: "Successful Recovery Rate" },
  { value: "< 4hr", label: "Average Response Time" },
  { value: "50+", label: "Industries Served" },
];

export default function AboutPage() {
  useDocumentTitle(
    "About Us — Incident Response & Threat Intelligence | STB Cybersecurity",
    "Meet STB Cybersecurity: incident responders, recovery engineers, and threat hunters protecting SMBs. 105+ live threat feeds, 24/7 IR, ransomware recovery, and security consulting."
  );

  return (
    <Layout>
      <div className="space-y-10 page-transition" data-testid="about-page">
        <AnimatedSection animation="fade-down" className="text-center space-y-4">
          <img src="/brand/logo-main.png" alt="STB Cybersecurity" className="h-32 w-auto mx-auto drop-shadow-[0_0_14px_rgba(239,68,68,0.3)] icon-float" data-testid="img-about-logo" />
          <h1 className="text-4xl font-display font-bold tracking-tight text-white" data-testid="text-about-title">
            We Fight Cyberattacks for a Living
          </h1>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed" data-testid="text-about-description">
            STB Cybersecurity is a team of incident responders, recovery engineers, and threat hunters.
            We work with small to medium-sized businesses who need real security help — not a sales pitch.
            When ransomware locks your files or an attacker gets inside your network, we're the team you call.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="stats-grid">
          {stats.map((stat, i) => (
            <AnimatedSection key={stat.label} animation="fade-up" stagger={i + 1 as any}>
              <Card className="bg-zinc-900/50 border-zinc-800 text-center card-interactive">
                <CardContent className="pt-6 pb-5 space-y-2">
                  <stat.icon className="h-6 w-6 text-orange-400 mx-auto icon-hover" />
                  <p className="text-2xl font-bold text-white font-display">{stat.value}</p>
                  <p className="text-xs text-zinc-400">{stat.label}</p>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection animation="scale">
          <Card className="bg-gradient-to-r from-orange-500/5 to-zinc-900/50 border-orange-500/20">
          <CardContent className="py-8 text-center space-y-4">
            <h2 className="text-2xl font-bold text-white" data-testid="text-about-mission-title">Our Mission</h2>
            <p className="text-zinc-400 max-w-3xl mx-auto leading-relaxed" data-testid="text-about-mission">
              Fortune 500 companies have dedicated threat intelligence teams. Most small businesses don't.
              We built STBCS to close that gap. Our platform pulls data from 105+ live threat feeds and pairs it with
              hands-on consulting from people who handle real incidents every day.
              The goal is simple: give every business the tools and expertise to see threats coming and respond fast.
            </p>
          </CardContent>
        </Card>
        </AnimatedSection>

        <div>
          <AnimatedSection animation="fade-up">
            <h2 className="text-2xl font-bold text-white text-center mb-6" data-testid="text-about-services-title">Our Services</h2>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 gap-6">
            {services.map((service, i) => (
              <AnimatedSection key={service.title} animation={i % 2 === 0 ? "fade-left" : "fade-right"} stagger={i + 1 as any}>
                <Card className="bg-zinc-900/50 border-zinc-800 card-interactive" data-testid={`card-service-${service.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-500/10 rounded-lg">
                        <service.icon className="h-5 w-5 text-orange-400 icon-hover" />
                      </div>
                      <h3 className="font-bold text-white text-lg">{service.title}</h3>
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed">{service.description}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>

        <AnimatedSection animation="fade-up">
          <h2 className="text-2xl font-bold text-white text-center mb-6" data-testid="text-about-platform-title">
            What the Platform Does
          </h2>
          <Card className="bg-zinc-900/50 border-zinc-800 border-glow">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <AnimatedSection animation="fade-left">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-orange-400 icon-hover" />
                      Real-Time Threat Intelligence
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      STBCS aggregates data from over 105 public and commercial threat feeds — NVD, CISA KEV, URLhaus,
                      OpenPhish, Shodan, AlienVault OTX, VirusTotal, and many more — refreshed every 15 minutes.
                      Track ransomware groups, CVEs, malicious IPs, phishing URLs, and threat actors all in one place.
                    </p>
                  </div>
                </AnimatedSection>
                <AnimatedSection animation="fade-right">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Search className="h-5 w-5 text-orange-400 icon-hover" />
                      Free Security Tools
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      Our free tools let anyone check IP/domain reputation, scan ports, analyze email headers,
                      check SSL certificates, assess password strength, calculate subnets, search IOCs across 105+ feeds,
                      and generate a cyber risk score. No account required.
                    </p>
                  </div>
                </AnimatedSection>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        <AnimatedSection animation="fade-up">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="py-8">
              <h2 className="text-2xl font-bold text-white text-center mb-6" data-testid="text-about-platform-features-title">Platform Features</h2>
              <AnimatedList className="grid sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
                {platformFeatures.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-zinc-300">{item}</p>
                  </div>
                ))}
              </AnimatedList>
            </CardContent>
          </Card>
        </AnimatedSection>

        <AnimatedSection animation="scale">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="py-8">
              <h2 className="text-2xl font-bold text-white text-center mb-6" data-testid="text-about-why-title">Why Work With Us</h2>
              <AnimatedList className="grid sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
                {whyUs.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-zinc-300">{item}</p>
                  </div>
                ))}
              </AnimatedList>
            </CardContent>
          </Card>
        </AnimatedSection>

        <AnimatedSection animation="fade-up">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white text-center" data-testid="text-about-consulting-title">
              Expert Consulting & Recovery
            </h2>
            <p className="text-zinc-400 text-center max-w-3xl mx-auto leading-relaxed">
              Sometimes you need more than tools and dashboards — you need someone who's been through it before.
              Our founding team has personally handled over a thousand ransomware cases, data breach investigations,
              and incident response engagements. When the stakes are highest, there's no substitute for experience.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {consultingHighlights.map((item, i) => (
                <AnimatedSection key={item.label} animation="fade-up" stagger={i + 1 as any}>
                  <Card className="bg-zinc-900/50 border-orange-500/20 text-center" data-testid={`card-consulting-stat-${i}`}>
                    <CardContent className="pt-6 pb-5 space-y-1">
                      <p className="text-2xl font-bold text-orange-400 font-display">{item.value}</p>
                      <p className="text-xs text-zinc-400">{item.label}</p>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              ))}
            </div>
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-500/10 rounded-lg flex-shrink-0">
                    <Briefcase className="h-6 w-6 text-orange-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white">More Than a Platform</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                      What you see on this website is only a fraction of what we can do. Behind the platform is a team
                      of seasoned incident responders, forensic analysts, and recovery engineers who've worked cases ranging
                      from small business ransomware to nation-state APT intrusions. We offer hands-on consulting,
                      guided remediation, tabletop exercises, security architecture reviews, and direct access to our founders
                      when you need someone with deep expertise to walk you through the hardest decisions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fade-up">
          <h2 className="text-2xl font-bold text-white text-center mb-6" data-testid="text-about-reviews-title">
            What Our Clients Say
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((t, i) => (
              <AnimatedSection key={i} animation={i % 2 === 0 ? "fade-left" : "fade-right"} stagger={i + 1 as any}>
                <Card className="bg-zinc-900/50 border-zinc-800 h-full" data-testid={`card-testimonial-${i}`}>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex gap-1">
                      {Array.from({ length: t.rating }).map((_, si) => (
                        <Star key={si} className="h-4 w-4 text-orange-400 fill-orange-400" />
                      ))}
                    </div>
                    <div className="relative">
                      <Quote className="h-8 w-8 text-orange-500/20 absolute -top-1 -left-1" />
                      <p className="text-sm text-zinc-300 leading-relaxed pl-6 italic">
                        "{t.quote}"
                      </p>
                    </div>
                    <div className="border-t border-zinc-800 pt-3">
                      <p className="text-sm font-semibold text-white">{t.author}</p>
                      <p className="text-xs text-zinc-500">{t.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fade-up">
          <Card className="border-orange-500/20 bg-gradient-to-r from-orange-500/5 to-zinc-900/50 glow-pulse">
          <CardContent className="py-8">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-2xl font-bold text-white" data-testid="text-about-contact-title">Under Attack? Call Now.</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Active incident or just want to talk about your security posture? We're available 24/7 for emergencies
                and during business hours for everything else.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <a
                  href="tel:+18557821987"
                  className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors font-bold text-lg"
                  data-testid="link-about-phone"
                >
                  <Phone className="h-5 w-5" />
                  (855) STB-1987
                </a>
                <a
                  href="mailto:info@stbcybersecurity.com"
                  className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors"
                  data-testid="link-about-email"
                >
                  <Mail className="h-5 w-5" />
                  info@stbcybersecurity.com
                </a>
              </div>
              <Link href="/contact">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white mt-2" data-testid="button-about-contact">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Us
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        </AnimatedSection>

        <Footer />
      </div>
    </Layout>
  );
}
