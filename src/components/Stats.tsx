import { Card } from "@/components/ui/card";

const stats = [
  { value: "5000+", label: "Active Students" },
  { value: "200+", label: "Faculty Members" },
  { value: "50+", label: "Departments" },
  { value: "98%", label: "Satisfaction Rate" },
];

const Stats = () => {
  return (
    <section className="py-16 bg-gradient-primary">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card 
              key={index}
              className="p-6 text-center bg-card/10 backdrop-blur-sm border-primary-foreground/20 hover:bg-card/20 transition-colors"
            >
              <div className="text-4xl md:text-5xl font-bold text-primary-foreground mb-2">
                {stat.value}
              </div>
              <div className="text-sm md:text-base text-primary-foreground/80">
                {stat.label}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
