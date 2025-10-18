import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowRight } from "lucide-react";
import heroImage from "@/assets/college-hero.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/85 to-accent/80"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 z-10 text-center">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-card rounded-2xl flex items-center justify-center shadow-elegant">
              <GraduationCap className="w-14 h-14 text-primary" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground">
              Dronacharya College
            </h1>
            <h2 className="text-3xl md:text-4xl font-semibold text-primary-foreground/90">
              Companion Portal
            </h2>
            <p className="text-xl md:text-2xl text-primary-foreground/80 font-light italic">
              Empowering Learning through Technology
            </p>
          </div>

          {/* Description */}
          <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed">
            A centralized digital ecosystem connecting students, faculty, and administrators
            for seamless academic excellence and collaboration.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Button 
              size="lg" 
              className="bg-card text-primary hover:bg-card/90 shadow-elegant group min-w-[200px]"
              onClick={() => window.location.href = "/student/auth"}
            >
              Student Login
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary min-w-[200px]"
              disabled
            >
              Faculty Login (Coming Soon)
            </Button>
            <Button 
              size="lg" 
              className="bg-warning text-warning-foreground hover:bg-warning/90 shadow-elegant min-w-[200px]"
              onClick={() => window.location.href = "/admin/auth"}
            >
              Admin Login
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10"></div>
    </section>
  );
};

export default Hero;
