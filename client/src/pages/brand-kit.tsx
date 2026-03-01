import { Link } from "wouter";
import Layout from "@/components/layout";
import { Shield, Mail, FileText, CreditCard, Receipt, Share2, Monitor, Video, FileSearch, Palette, Image, Paintbrush, ExternalLink } from "lucide-react";

const categories = [
  {
    slug: "email-signatures",
    title: "Email Signatures",
    count: 10,
    description: "Professional email signature templates with tactical cybersecurity styling",
    icon: Mail,
  },
  {
    slug: "letterheads",
    title: "PDF Letterheads",
    count: 8,
    description: "Branded letterhead designs for official documents and correspondence",
    icon: FileText,
  },
  {
    slug: "business-cards",
    title: "Business Cards",
    count: 8,
    description: "Front and back business card designs with dark tactical aesthetics",
    icon: CreditCard,
  },
  {
    slug: "invoices",
    title: "Invoice Templates",
    count: 6,
    description: "Professional invoice and quote templates for billing and proposals",
    icon: Receipt,
  },
  {
    slug: "social-media",
    title: "Social Media Banners",
    count: 8,
    description: "Platform-optimized banners for Twitter, LinkedIn, YouTube, and Facebook",
    icon: Share2,
  },
  {
    slug: "presentations",
    title: "Presentation Headers",
    count: 6,
    description: "Title slide designs for keynotes, briefings, and technical presentations",
    icon: Monitor,
  },
  {
    slug: "backgrounds",
    title: "Meeting Backgrounds",
    count: 6,
    description: "Virtual backgrounds for Zoom, Teams, and video conferencing",
    icon: Video,
  },
  {
    slug: "report-covers",
    title: "Report Covers",
    count: 6,
    description: "Cover page designs for security assessments, audits, and incident reports",
    icon: FileSearch,
  },
];

const linkedPages = [
  {
    href: "/logos",
    title: "Logo Themes",
    count: "20+",
    description: "Switchable logo themes, icon variants, and logo voting — apply site-wide",
    icon: Palette,
  },
  {
    href: "/hero-backgrounds",
    title: "Hero Backgrounds",
    count: "10+",
    description: "Animated dashboard hero backgrounds — threat maps, radar, matrix, and more",
    icon: Image,
  },
  {
    href: "/style-preview",
    title: "Icon & Style Preview",
    count: "50+",
    description: "Browse all icon styles, color palettes, and UI component design tokens",
    icon: Paintbrush,
  },
];

export default function BrandKit() {
  return (
    <Layout>
      <div className="min-h-screen bg-[#09090b] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="h-10 w-10 text-orange-500" />
              <h1
                data-testid="text-page-title"
                className="text-4xl font-bold tracking-wider text-zinc-200 uppercase"
              >
                STBCS Brand Kit
              </h1>
            </div>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Professional brand assets for STB Cybersecurity
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/brand-kit/${cat.slug}`}>
                <div
                  data-testid={`card-category-${cat.slug}`}
                  className="group relative rounded-xl border border-zinc-800 bg-[#18181b] p-6 cursor-pointer transition-all duration-300 hover:border-orange-500/50 hover:shadow-[0_0_24px_rgba(249,115,22,0.15)]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 rounded-lg bg-zinc-900 p-3 group-hover:bg-orange-500/10 transition-colors">
                      <cat.icon className="h-6 w-6 text-orange-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-zinc-200 font-semibold text-sm truncate">
                          {cat.title}
                        </h3>
                        <span className="flex-shrink-0 rounded-full bg-orange-500/10 text-orange-500 text-xs font-medium px-2 py-0.5">
                          {cat.count} styles
                        </span>
                      </div>
                      <p className="text-zinc-500 text-xs leading-relaxed">
                        {cat.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-zinc-800" />
              <h2 className="text-zinc-400 text-sm font-semibold uppercase tracking-wider">Visual Customization</h2>
              <div className="h-px flex-1 bg-zinc-800" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {linkedPages.map((page) => (
                <Link key={page.href} href={page.href}>
                  <div
                    data-testid={`card-linked-${page.href.slice(1)}`}
                    className="group relative rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-6 cursor-pointer transition-all duration-300 hover:border-orange-500/40 hover:bg-[#18181b]"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 rounded-lg bg-zinc-800/50 p-3 group-hover:bg-orange-500/10 transition-colors">
                        <page.icon className="h-6 w-6 text-orange-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-zinc-300 font-semibold text-sm truncate">
                            {page.title}
                          </h3>
                          <span className="flex-shrink-0 rounded-full bg-zinc-800 text-zinc-400 text-xs font-medium px-2 py-0.5">
                            {page.count}
                          </span>
                          <ExternalLink className="h-3 w-3 text-zinc-600 ml-auto" />
                        </div>
                        <p className="text-zinc-500 text-xs leading-relaxed">
                          {page.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
