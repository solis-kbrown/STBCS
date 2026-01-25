import { Mail, Globe, Shield, Phone, MessageSquare } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-white/5 bg-card/30 mt-8">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-display font-bold text-lg text-primary">STBCS</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              STB Cybersecurity provides frontline incident response, ransomware recovery, threat hunting, 
              and real-time threat intelligence for small to medium-sized businesses.
            </p>
            
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 mb-4 max-w-md">
              <p className="text-xs text-primary font-bold mb-1 flex items-center gap-1">
                <Phone className="h-3 w-3" /> EMERGENCY HOTLINE
              </p>
              <a 
                href="tel:+18557821987" 
                className="text-lg font-display font-bold text-white hover:text-primary transition-colors"
                data-testid="link-phone-footer"
              >
                (855) STB-1987
              </a>
              <p className="text-xs text-muted-foreground mt-1">24/7 Incident Response</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe className="h-3 w-3" />
              <span>stoptbcs.com</span>
              <span className="text-white/20">|</span>
              <span>stbcybersecurity.com</span>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-white text-sm mb-3">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="tel:+18557821987" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <Phone className="h-3 w-3" /> (855) STB-1987
                </a>
              </li>
              <li>
                <a href="sms:+18557821987" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <MessageSquare className="h-3 w-3" /> Text Us
                </a>
              </li>
              <li>
                <a href="mailto:info@stoptbcs.com" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <Mail className="h-3 w-3" /> info@stoptbcs.com
                </a>
              </li>
              <li>
                <a href="mailto:sales@stoptbcs.com" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <Mail className="h-3 w-3" /> sales@stoptbcs.com
                </a>
              </li>
              <li>
                <a href="mailto:support@stoptbcs.com" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <Mail className="h-3 w-3" /> support@stoptbcs.com
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-white text-sm mb-3">Resources</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/tools" className="hover:text-primary transition-colors">Security Tools</a></li>
              <li><a href="/exploits" className="hover:text-primary transition-colors">CVE Database</a></li>
              <li><a href="/ransomware" className="hover:text-primary transition-colors">Ransomware Tracker</a></li>
              <li><a href="/threat-feeds" className="hover:text-primary transition-colors">Threat Feeds</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/5 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} STB Cybersecurity. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">API Documentation</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
