import { Shield, Target, Search, MessageSquare, Phone, Mail } from "lucide-react";
import { useDocumentTitle } from "@/lib/use-document-title";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/layout";
import Footer from "@/components/footer";

const services = [
  {
    icon: Shield,
    title: "Incident Response",
    description: "Rapid response to active cyber threats. Our team deploys immediately to contain, investigate, and remediate security incidents for your business.",
  },
  {
    icon: Target,
    title: "Ransomware Recovery",
    description: "Expert ransomware negotiation, decryption, and recovery services. We help businesses get back online quickly and securely after an attack.",
  },
  {
    icon: Search,
    title: "Threat Hunting",
    description: "Proactive threat hunting to identify and neutralize hidden threats in your environment before they cause damage.",
  },
  {
    icon: MessageSquare,
    title: "Security Consulting",
    description: "Comprehensive security assessments, policy development, and strategic guidance to strengthen your organization's security posture.",
  },
];

export default function AboutPage() {
  useDocumentTitle("About Us | STBCS", "About STB Cybersecurity - Professional cybersecurity services including incident response, ransomware recovery, threat hunting, and security consulting for small to medium-sized businesses.");

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500" data-testid="about-page">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center gap-2">
            <div className="p-3 bg-orange-500/10 rounded-xl">
              <Shield className="h-8 w-8 text-orange-400" />
            </div>
          </div>
          <h1 className="text-4xl font-display font-bold tracking-tight text-white" data-testid="text-about-title">
            About STB Cybersecurity
          </h1>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed" data-testid="text-about-description">
            STB Cybersecurity (STBCS) provides professional cybersecurity services for small to medium-sized businesses.
            We specialize in incident response, ransomware recovery, threat hunting, and security consulting —
            helping organizations stay ahead of threats and recover quickly when attacks occur.
          </p>
        </div>

        <Card className="bg-gradient-to-r from-orange-500/5 to-zinc-900/50 border-orange-500/20">
          <CardContent className="py-8 text-center space-y-4">
            <h2 className="text-2xl font-bold text-white" data-testid="text-about-mission-title">Our Mission</h2>
            <p className="text-zinc-400 max-w-3xl mx-auto leading-relaxed" data-testid="text-about-mission">
              Making enterprise-grade threat intelligence accessible to businesses of all sizes. We believe every organization
              deserves access to the same caliber of cybersecurity expertise and tools that protect the world's largest enterprises.
              Our platform combines real-time threat data, professional consulting, and community-driven intelligence to
              deliver comprehensive protection for the businesses that need it most.
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
              <h2 className="text-2xl font-bold text-white" data-testid="text-about-contact-title">Get In Touch</h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Whether you're facing an active security incident or looking to strengthen your defenses,
                our team is ready to help. Reach out anytime — we're available 24/7 for emergencies.
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
