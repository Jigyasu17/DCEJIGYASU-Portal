import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Jigyasu Gaur",
    role: "B.Tech Student",
    content: "The portal has transformed how I manage my academics. Checking attendance and submitting assignments is now incredibly simple and efficient.",
  },
  {
    name: "Dr. Ashima Mehta",
    role: "Head of Department",
    content: "As a HOD, I appreciate how streamlined the platform makes student management and grading. It saves hours of administrative work.",
  },
  {
    name: "Rajat Kumar",
    role: "Final Year Student",
    content: "The complaint management system is brilliant. My hostel issues were resolved in just 48 hours with complete transparency.",
  },
];

const Testimonials = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            What Our Community Says
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hear from students and faculty about their experience with the portal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="p-6 hover:shadow-elegant transition-all duration-300 bg-card border-border"
            >
              <Quote className="w-8 h-8 text-accent mb-4" />
              <p className="text-muted-foreground mb-4 leading-relaxed">
                "{testimonial.content}"
              </p>
              <div className="border-t border-border pt-4">
                <p className="font-semibold text-foreground">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
