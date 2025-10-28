import { Card } from "@/components/ui/card";
import { 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  ClipboardCheck, 
  Bell, 
  BarChart 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: BookOpen,
    title: "Attendance Management",
    description: "Real-time attendance tracking with visual analytics and insights",
    color: "bg-gradient-primary",
  },
  {
    icon: ClipboardCheck,
    title: "Assignments & Tasks",
    description: "Seamless assignment submission and tracking system",
    color: "bg-gradient-accent",
  },
  {
    icon: Calendar,
    title: "Event Calendar",
    description: "Stay updated with cultural, technical, and sports events",
    color: "bg-gradient-gold",
  },
  {
    icon: MessageSquare,
    title: "Smart Complaints",
    description: "Integrated complaint management with real-time tracking",
    color: "bg-gradient-primary",
  },
  {
    icon: Bell,
    title: "Notice Board",
    description: "Instant notifications for important updates and announcements",
    color: "bg-gradient-accent",
  },
  {
    icon: BarChart,
    title: "Performance Analytics",
    description: "Comprehensive academic performance tracking and reports",
    color: "bg-gradient-gold",
  },
];

const Features = () => {
  const navigate = useNavigate();
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Comprehensive Features
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need for a seamless academic experience in one unified platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="p-6 hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 border-border bg-card cursor-pointer"
                onClick={() => navigate("/student/auth")}
              >
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
