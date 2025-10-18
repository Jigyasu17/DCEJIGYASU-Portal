import { Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Dronacharya College of Engineering</h3>
            <p className="text-primary-foreground/80 text-sm leading-relaxed">
              Empowering students through innovative technology and comprehensive digital solutions 
              for academic excellence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/80">
              <li className="hover:text-primary-foreground cursor-pointer transition-colors">Student Portal</li>
              <li className="hover:text-primary-foreground cursor-pointer transition-colors">Faculty Portal</li>
              <li className="hover:text-primary-foreground cursor-pointer transition-colors">Admin Dashboard</li>
              <li className="hover:text-primary-foreground cursor-pointer transition-colors">Support Center</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>info@dronacharya.edu</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+91 123 456 7890</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Gurgaon, Haryana, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/70">
          <p>© 2024 Dronacharya College of Engineering. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
