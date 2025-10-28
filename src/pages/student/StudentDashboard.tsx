import { useEffect, useState } from "react";
import DashboardLayout from "@/components/student/DashboardLayout";
import { Card } from "@/components/ui/card";
import { app, auth } from "@/integrations/firebase/client";
import { getFirestore, collection, query, where, getCountFromServer, addDoc, serverTimestamp, getDocs, updateDoc, doc } from "firebase/firestore";
import { BookOpen, Calendar, MessageSquare, ClipboardCheck, Bell, BarChart, Check, Plus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const StudentDashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    attendance: 0,
    assignments: 0,
    events: 0,
    complaints: 0,
    notices: 0,
  });
  const [isComplaining, setIsComplaining] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complaint, setComplaint] = useState({
    title: "",
    description: "",
  });
  const [assignments, setAssignments] = useState([]);
  const [submission, setSubmission] = useState({
    assignment_id: "",
    file: null,
  });

  useEffect(() => {
    fetchStats();
    fetchAssignments();
  }, []);

  const fetchStats = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const db = getFirestore(app);
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
  };

  const fetchAssignments = async () => {
    const db = getFirestore(app);
    const q = collection(db, "assignments");
    const querySnapshot = await getDocs(q);
    const assignmentsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setAssignments(assignmentsData);
  };

  const markAttendance = async () => {
    const user = auth.currentUser;
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to mark attendance.",
        variant: "destructive",
      });
      return;
    }

    try {
      const db = getFirestore(app);
      await addDoc(collection(db, "attendance"), {
        student_id: user.uid,
        timestamp: serverTimestamp(),
        status: "present",
      });
      toast({
        title: "Success",
        description: "Attendance marked successfully.",
      });
      fetchStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark attendance. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleComplaint = async () => {
    const user = auth.currentUser;
    if (!user) return;

    if (!complaint.title || !complaint.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const db = getFirestore(app);
      await addDoc(collection(db, "complaints"), {
        ...complaint,
        student_id: user.uid,
        created_at: serverTimestamp(),
        status: "pending",
      });
      toast({
        title: "Success",
        description: "Complaint raised successfully.",
      });
      setIsComplaining(false);
      fetchStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to raise complaint. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleSubmission = async () => {
    const user = auth.currentUser;
    if (!user) return;

    if (!submission.assignment_id || !submission.file) {
      toast({
        title: "Error",
        description: "Please select an assignment and a file.",
        variant: "destructive",
      });
      return;
    }

    try {
      const db = getFirestore(app);
      // Upload file to storage and get URL
      // For now, we'll just add a placeholder URL
      const fileURL = "/path/to/submission/file";

      await addDoc(collection(db, "submissions"), {
        assignment_id: submission.assignment_id,
        student_id: user.uid,
        file_url: fileURL,
        submitted_at: serverTimestamp(),
      });
      toast({
        title: "Success",
        description: "Assignment submitted successfully.",
      });
      setIsSubmitting(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit assignment. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const cards = [
    {
      title: "Timetable",
      value: "View",
      icon: Calendar,
      color: "bg-gradient-gold",
      link: "/student/timetable",
    },
    {
      title: "Notices",
      value: stats.notices,
      icon: Bell,
      color: "bg-gradient-accent",
      link: "/student/notices",
    },
    {
      title: "Performance",
      value: "View",
      icon: BarChart,
      color: "bg-gradient-gold",
      link: "/student/performance",
    },
  ];

  return (
    <DashboardLayout title="Student Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6 flex flex-col items-center justify-center">
          <Check className="w-12 h-12 text-green-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Mark Attendance</h2>
          <Button onClick={markAttendance}>Mark Present</Button>
        </Card>

        <Dialog open={isSubmitting} onOpenChange={setIsSubmitting}>
          <DialogTrigger asChild>
            <Card className="p-6 flex flex-col items-center justify-center cursor-pointer">
              <Plus className="w-12 h-12 text-blue-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Submit Assignments</h2>
              <Button>Submit</Button>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Assignment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Select onValueChange={(value) => setSubmission({ ...submission, assignment_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Assignment" />
                </SelectTrigger>
                <SelectContent>
                  {assignments.map((assignment) => (
                    <SelectItem key={assignment.id} value={assignment.id}>{assignment.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="file"
                onChange={(e) => setSubmission({ ...submission, file: e.target.files[0] })}
              />
              <Button onClick={handleSubmission}>Submit</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isComplaining} onOpenChange={setIsComplaining}>
          <DialogTrigger asChild>
            <Card className="p-6 flex flex-col items-center justify-center cursor-pointer">
              <Shield className="w-12 h-12 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Raise a Complaint</h2>
              <Button>Raise</Button>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Complaint</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Title"
                value={complaint.title}
                onChange={(e) => setComplaint({ ...complaint, title: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={complaint.description}
                onChange={(e) => setComplaint({ ...complaint, description: e.target.value })}
              />
              <Button onClick={handleComplaint}>Raise Complaint</Button>
            </div>
          </DialogContent>
        </Dialog>

        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card
              key={index}
              className="p-6 hover:shadow-elegant transition-all cursor-pointer"
              onClick={() => window.location.href = card.link}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-foreground">
                  {card.value}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground">{card.title}</h3>
            </Card>
          );
        })}
      </div>

      {/* Welcome Message */}
      <Card className="mt-6 p-6 bg-gradient-primary text-primary-foreground">
        <h3 className="text-2xl font-bold mb-2">Welcome Back!</h3>
        <p className="text-primary-foreground/90">
          Access all your academic resources, track attendance, submit assignments,
          and stay updated with college events and notices.
        </p>
      </Card>
    </DashboardLayout>
  );
};

export default StudentDashboard;
