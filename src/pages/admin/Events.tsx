import { useEffect, useState } from "react";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { app } from "@/integrations/firebase/client";
import { getFirestore, collection, getDocs, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { Calendar, MapPin, Trophy, Palette, Code, GraduationCap, LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
  const [isOpen, setIsOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    event_type: "academic",
    event_date: "",
    location: "",
    event_link: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const db = getFirestore(app);
      const snapshot = await getDocs(query(collection(db, "events")));
      const data = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as Event))
        .sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
      
      setEvents(data);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.event_date || !newEvent.event_type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Title, Date, Type).",
        variant: "destructive",
      });
      return;
    }

    try {
      const db = getFirestore(app);
      await addDoc(collection(db, "events"), {
        ...newEvent,
        created_at: serverTimestamp(),
      });
      
      toast({
        title: "Success",
        description: "Event created successfully.",
      });
      
      setIsOpen(false);
      setNewEvent({
        title: "",
        description: "",
        event_type: "academic",
        event_date: "",
        location: "",
        event_link: "",
      });
      fetchEvents();
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: "Failed to create event.",
        variant: "destructive",
      });
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "cultural": return <Palette className="w-6 h-6" />;
      case "technical": return <Code className="w-6 h-6" />;
      case "sports": return <Trophy className="w-6 h-6" />;
      case "academic": return <GraduationCap className="w-6 h-6" />;
      default: return <Calendar className="w-6 h-6" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "cultural": return "bg-gradient-to-br from-yellow-400 to-orange-500";
      case "technical": return "bg-gradient-to-br from-blue-400 to-indigo-500";
      case "sports": return "bg-gradient-to-br from-green-400 to-emerald-500";
      case "academic": return "bg-gradient-to-br from-purple-400 to-pink-500";
      default: return "bg-gradient-to-br from-gray-400 to-slate-500";
    }
  };

  return (
    <AdminDashboardLayout title="Events Management">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">All Events</h2>
          <p className="text-muted-foreground">Manage and view all campus events</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Create Event</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Event Title *</Label>
                <Input 
                  placeholder="e.g. Annual Tech Symposium" 
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Event Type *</Label>
                <Select value={newEvent.event_type} onValueChange={(val) => setNewEvent({ ...newEvent, event_type: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="cultural">Cultural</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date and Time *</Label>
                <Input 
                  type="datetime-local" 
                  value={newEvent.event_date}
                  onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input 
                  placeholder="e.g. Main Auditorium" 
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Resource/Registration Link</Label>
                <Input 
                  placeholder="e.g. https://forms.gle/..." 
                  value={newEvent.event_link}
                  onChange={(e) => setNewEvent({ ...newEvent, event_link: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  placeholder="Details about the event..." 
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                />
              </div>
              <Button className="w-full" onClick={handleCreateEvent}>Publish Event</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.length === 0 ? (
          <Card className="col-span-full p-12 text-center">
            <Calendar className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground text-lg">No events have been created yet.</p>
          </Card>
        ) : (
          events.map((event) => (
            <Card key={event.id} className="p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="flex flex-col h-full">
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={`w-14 h-14 ${getEventColor(
                      event.event_type
                    )} flex-shrink-0 rounded-2xl flex items-center justify-center text-white shadow-sm`}
                  >
                    {getEventIcon(event.event_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-wider mb-2">
                      {event.event_type}
                    </span>
                    <h3 className="text-lg font-bold text-foreground leading-tight truncate">{event.title}</h3>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-6 line-clamp-2 flex-grow">
                  {event.description || "No description provided."}
                </p>
                
                <div className="space-y-2.5 mt-auto bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-blue-500">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <span className="truncate">
                      {new Date(event.event_date).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </span>
                  </div>
                  
                  {event.location && (
                    <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-rose-500">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}

                  {event.event_link && (
                    <div className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-indigo-500">
                        <LinkIcon className="h-4 w-4" />
                      </div>
                      <a href={event.event_link} target="_blank" rel="noopener noreferrer" className="truncate text-blue-600 hover:underline">
                        Event Link
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default Events;
