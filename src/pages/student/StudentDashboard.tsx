import { useEffect, useState } from "react";
import DashboardLayout from "@/components/student/DashboardLayout";
import { Card } from "@/components/ui/card";
import { app, auth } from "@/integrations/firebase/client";
import { getFirestore, collection, query, where, getCountFromServer, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import { Calendar, Bell, BarChart, Check, Plus, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const StudentDashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState({ attendance: 0, assignments: 0, events: 0, complaints: 0, notices: 0 });
  const [isComplaining, setIsComplaining] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complaint, setComplaint] = useState({ title: "", description: "" });
  const [assignments, setAssignments] = useState([]);
  const [submission, setSubmission] = useState({ assignment_id: "", file: null });

  useEffect(() => {
    fetchStats();
    fetchAssignments();
  }, []);

  const fetchStats = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const db = getFirestore(app);
    try {
      const [attendance, assignments, events, complaints, notices] = await Promise.all([
        getCountFromServer(query(collection(db, "attendance"), where("student_id", "==", user.uid))),
        getCountFromServer(collection(db, "assignments")),
        getCountFromServer(collection(db, "events")),
        getCountFromServer(query(collection(db, "complaints"), where("student_id", "==", user.uid))),
        getCountFromServer(collection(db, "notices")),
      ]);
      setStats({ 
        attendance: attendance.data().count,
        assignments: assignments.data().count,
        events: events.data().count,
        complaints: complaints.data().count,
        notices: notices.data().count,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast({ title: "Error", description: "Failed to fetch dashboard stats.", variant: "destructive" });
    }
  };

  const fetchAssignments = async () => {
    const db = getFirestore(app);
    try {
      const q = collection(db, "assignments");
      const querySnapshot = await getDocs(q);
      const assignmentsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAssignments(assignmentsData);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast({ title: "Error", description: "Failed to fetch assignments.", variant: "destructive" });
    }
  };

  const markAttendance = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    try {
      const db = getFirestore(app);
      await addDoc(collection(db, "attendance"), { student_id: user.uid, timestamp: serverTimestamp(), status: "present" });
      toast({ title: "Success", description: "Attendance marked successfully." });
      fetchStats();
    } catch (error) {
      toast({ title: "Error", description: "Failed to mark attendance.", variant: "destructive" });
    }
  };

  const handleComplaint = async () => {
    const user = auth.currentUser;
    if (!user) return;
    if (!complaint.title || !complaint.description) {
      toast({ title: "Error", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    try {
      const db = getFirestore(app);
      await addDoc(collection(db, "complaints"), { ...complaint, student_id: user.uid, created_at: serverTimestamp(), status: "pending" });
      toast({ title: "Success", description: "Complaint raised successfully." });
      setIsComplaining(false);
      setComplaint({ title: "", description: "" });
      fetchStats();
    } catch (error) {
      toast({ title: "Error", description: "Failed to raise complaint.", variant: "destructive" });
    }
  };

  const handleSubmission = async () => {
    const user = auth.currentUser;
    if (!user) return;
    if (!submission.assignment_id || !submission.file) {
      toast({ title: "Error", description: "Please select an assignment and a file.", variant: "destructive" });
      return;
    }
    try {
      // For now, we'll just add a placeholder URL
      const fileURL = "/path/to/submission/file";
      const db = getFirestore(app);
      await addDoc(collection(db, "submissions"), { assignment_id: submission.assignment_id, student_id: user.uid, file_url: fileURL, submitted_at: serverTimestamp() });
      toast({ title: "Success", description: "Assignment submitted successfully." });
      setIsSubmitting(false);
      setSubmission({ assignment_id: "", file: null });
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit assignment.", variant: "destructive" });
    }
  };

  const cards = [
    { title: "Timetable", value: "View", icon: Calendar, link: "/student/timetable" },
    { title: "Notices", value: stats.notices, icon: Bell, link: "/student/notices" },
    { title: "Performance", value: "View", icon: BarChart, link: "/student/performance" },
  ];

  const actionCards = [
    { title: "Mark Attendance", description: `You have marked your attendance ${stats.attendance} times.`, icon: Check, color: "text-green-500", action: markAttendance, trigger: false },
    { title: "Submit Assignment", description: `There are ${stats.assignments} assignments in total.`, icon: Plus, color: "text-blue-500", action: () => setIsSubmitting(true), trigger: true },
    { title: "Raise a Complaint", description: `You have raised ${stats.complaints} complaints.`, icon: Shield, color: "text-red-500", action: () => setIsComplaining(true), trigger: true },
  ];

  return (
    <DashboardLayout title="Student Dashboard">
      <div className="animate-fade-in space-y-6">
        <Card className="p-6 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <h3 className="text-2xl font-bold mb-2">Welcome Back, Student!</h3>
          <p className="text-primary-foreground/90">Your central hub for academic success. Track your progress, manage tasks, and stay connected.</p>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {actionCards.map((card, index) => {
            const Icon = card.icon;
            const cardContent = (
              <div className="p-6 flex flex-col justify-between h-full">
                <div>
                  <Icon className={`w-10 h-10 ${card.color} mb-4`} />
                  <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                  <p className="text-muted-foreground text-sm">{card.description}</p>
                </div>
                <div className="flex items-center text-sm font-medium mt-4 text-primary">
                  {card.trigger ? "Open" : "Mark"} <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            );

            if (card.title === "Submit Assignment") {
              return (
                <Dialog key={index} open={isSubmitting} onOpenChange={setIsSubmitting}>
                  <DialogTrigger asChild>
                    <Card className="h-full bg-card hover:border-primary transition-all duration-300 border animate-slide-up cursor-pointer" style={{ animationDelay: `${index * 100}ms` }}>{cardContent}</Card>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Submit Assignment</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <Select onValueChange={(value) => setSubmission({ ...submission, assignment_id: value })}><SelectTrigger><SelectValue placeholder="Select Assignment" /></SelectTrigger>
                        <SelectContent>{assignments.map((a) => <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>)}</SelectContent>
                      </Select>
                      <Input type="file" onChange={(e) => setSubmission({ ...submission, file: e.target.files ? e.target.files[0] : null })} />
                      <Button onClick={handleSubmission}>Submit</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              );
            } else if (card.title === "Raise a Complaint") {
              return (
                <Dialog key={index} open={isComplaining} onOpenChange={setIsComplaining}>
                  <DialogTrigger asChild>
                     <Card className="h-full bg-card hover:border-primary transition-all duration-300 border animate-slide-up cursor-pointer" style={{ animationDelay: `${index * 100}ms` }}>{cardContent}</Card>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>New Complaint</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <Input placeholder="Title" value={complaint.title} onChange={(e) => setComplaint({ ...complaint, title: e.target.value })} />
                      <Textarea placeholder="Description" value={complaint.description} onChange={(e) => setComplaint({ ...complaint, description: e.target.value })} />
                      <Button onClick={handleComplaint}>Raise Complaint</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              );
            }
            return (
              <Card key={index} onClick={card.action} className="h-full bg-card hover:border-primary transition-all duration-300 border animate-slide-up cursor-pointer" style={{ animationDelay: `${index * 100}ms` }}>
                {cardContent}
              </Card>
            );
          })}

          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card key={index} className="p-6 hover:border-primary transition-all duration-300 border cursor-pointer animate-slide-up bg-card" style={{ animationDelay: `${(index + actionCards.length) * 100}ms` }} onClick={() => window.location.href = card.link}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center"><Icon className="w-6 h-6 text-white" /></div>
                    <h3 className="text-lg font-semibold text-foreground">{card.title}</h3>
                  </div>
                  <div className="text-3xl font-bold text-foreground">{card.value}</div>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">Go to {card.title} <ArrowRight className="w-4 h-4 ml-2" /></div>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
