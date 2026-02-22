import { Shield, Target, Search, MessageSquare, Phone, Mail } from "lucide-react";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/layout";
import Footer from "@/components/footer";

const services = [
  {
    icon: Shield,
    title: "Incident Response",
    description: "Active breach? Our team deploys immediately to contain the attack, investigate root cause, and get your systems back to a known-good state.",
  },
  {
    icon: Target,
    title: "Ransomware Recovery",
    description: "We negotiate with threat actors, attempt decryption, and restore your operations. Our goal: get you back online as fast as possible.",
  },
  {
    icon: Search,
    title: "Threat Hunting",
    description: "Attackers already inside your network? We find them. Proactive hunts identify compromised accounts, backdoors, and lateral movement before the damage spreads.",
  },
  {
    icon: MessageSquare,
    title: "Security Consulting",
    description: "Gap assessments, policy development, and hands-on guidance. We help you build defenses that match your risk profile and budget.",
  },
];

export default function AboutPage() {
  useDocumentTitle("About Us | STB Cybersecurity", "Incident response, ransomware recovery, and threat hunting for small to medium-sized businesses. Real practitioners. Real cases. Real results.");

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500" data-testid="about-page">
        <div className="text-center space-y-4">
          <img src="/brand/logo-main.png" alt="STB Cybersecurity Labs" className="h-32 w-auto mx-auto drop-shadow-[0_0_14px_rgba(0,200,255,0.3)]" data-testid="img-about-logo" />
          <h1 className="text-4xl font-display font-bold tracking-tight text-white" data-testid="text-about-title">
            We Fight Cyberattacks for a Living
          </h1>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed" data-testid="text-about-description">
            STB Cybersecurity is a team of incident responders, recovery engineers, and threat hunters.
            We work with small to medium-sized businesses who need real security help, not a sales pitch.
            When ransomware locks your files or an attacker gets inside your network, we're the team you call.
          </p>
        </div>

        <Card className="bg-gradient-to-r from-orange-500/5 to-zinc-900/50 border-orange-500/20">
          <CardContent className="py-8 text-center space-y-4">
            <h2 className="text-2xl font-bold text-white" data-testid="text-about-mission-title">Our Mission</h2>
            <p className="text-zinc-400 max-w-3xl mx-auto leading-relaxed" data-testid="text-about-mission">
              Fortune 500 companies have dedicated threat intelligence teams. Most small businesses don't.
              We built STBCS to close that gap. Our platform pulls data from 45+ live threat feeds and pairs it with
              hands-on consulting from people who handle real incidents every day.
              The goal is simple: give every business the tools and expertise to see threats coming and respond fast.
            </p>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-2xl font-bold text-white text-center mb-6" data-testid="text-about-services-title">Our Services</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {services.map((service) => (
              <Card key={service.title} className="bg-zinc-900/50 border-zinc-800" data-testid={`card-service-${service.title.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <service.icon className="h-5 w-5 text-orange-400" />
                    </div>
                    <h3 className="font-bold text-white text-lg">{service.title}</h3>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card className="border-orange-500/20 bg-zinc-900/50">
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
            </div>
          </CardContent>
        </Card>

        <Footer />
      </div>
    </Layout>
  );
}
