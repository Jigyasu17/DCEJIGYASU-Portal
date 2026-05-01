import { useEffect, useState } from "react";
import FacultyDashboardLayout from "@/components/faculty/FacultyDashboardLayout";
import { Card } from "@/components/ui/card";
import { db } from "@/integrations/firebase/client";
import { collection, getDocs, query } from "firebase/firestore";
import { Calendar, MapPin, Trophy, Palette, Code, GraduationCap, LinkIcon } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  event_type: string;
  event_date: string;
  location: string;
  event_link?: string;
}

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    void fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const snapshot = await getDocs(query(collection(db, "events")));
    const now = Date.now();
    const data = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as Event))
      .filter((event) => {
        const eventDate = new Date(event.event_date).getTime();
        return !Number.isNaN(eventDate) && eventDate >= now;
      })
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());

    setEvents(data);
  };

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
    <FacultyDashboardLayout title="Event Calendar">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {events.length === 0 ? (
          <Card className="col-span-full p-12 text-center">
            <Calendar className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground">No upcoming events</p>
          </Card>
        ) : (
          events.map((event) => (
            <Card key={event.id} className="p-6 transition-shadow hover:shadow-elegant">
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 ${getEventColor(
                    event.event_type
                  )} flex-shrink-0 rounded-xl flex items-center justify-center text-white`}
                >
                  {getEventIcon(event.event_type)}
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-foreground">{event.title}</h3>
                    <span className="rounded bg-secondary px-2 py-1 text-xs capitalize">
                      {event.event_type}
                    </span>
                  </div>
                  <p className="mb-3 text-sm text-muted-foreground">
                    {event.description || "No description available"}
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(event.event_date).toLocaleDateString()} at{" "}
                        {new Date(event.event_date).toLocaleTimeString()}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.event_link && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <LinkIcon className="h-4 w-4" />
                        <a href={event.event_link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          Resource Link
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </FacultyDashboardLayout>
  );
};

export default Events;
