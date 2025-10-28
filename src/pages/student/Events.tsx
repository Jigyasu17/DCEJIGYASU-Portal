import { useEffect, useState } from "react";
import DashboardLayout from "@/components/student/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Calendar, MapPin, Trophy, Palette, Code, GraduationCap } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  event_type: string;
  event_date: string;
  location: string;
}

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);

  // useEffect(() => {
  //   fetchEvents();
  // }, []);

  // const fetchEvents = async () => {
  //   const { data } = await supabase
  //     .from("events")
  //     .select("*")
  //     .gte("event_date", new Date().toISOString())
  //     .order("event_date", { ascending: true });

  //   if (data) {
  //     setEvents(data);
  //   }
  // };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "cultural":
        return <Palette className="w-6 h-6" />;
      case "technical":
        return <Code className="w-6 h-6" />;
      case "sports":
        return <Trophy className="w-6 h-6" />;
      case "academic":
        return <GraduationCap className="w-6 h-6" />;
      default:
        return <Calendar className="w-6 h-6" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "cultural":
        return "bg-gradient-gold";
      case "technical":
        return "bg-gradient-primary";
      case "sports":
        return "bg-gradient-accent";
      case "academic":
        return "bg-gradient-primary";
      default:
        return "bg-gradient-primary";
    }
  };

  return (
    <DashboardLayout title="Event Calendar">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.length === 0 ? (
          <Card className="col-span-full p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No upcoming events</p>
          </Card>
        ) : (
          events.map((event) => (
            <Card key={event.id} className="p-6 hover:shadow-elegant transition-shadow">
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 ${getEventColor(
                    event.event_type
                  )} rounded-xl flex items-center justify-center text-white flex-shrink-0`}
                >
                  {getEventIcon(event.event_type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {event.title}
                    </h3>
                    <span className="text-xs bg-secondary px-2 py-1 rounded capitalize">
                      {event.event_type}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">
                    {event.description || "No description available"}
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(event.event_date).toLocaleDateString()} at{" "}
                        {new Date(event.event_date).toLocaleTimeString()}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
};

export default Events;
