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
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
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
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);
  const [attendanceData, setAttendanceData] = useState({ subject: "" });

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

    if (!attendanceData.subject) {
      toast({
        title: "Error",
        description: "Please select a subject.",
        variant: "destructive",
      });
      return;
    }

    try {
      const db = getFirestore(app);
      const currentDate = new Date().toISOString().split("T")[0];
      await addDoc(collection(db, "attendance"), {
        student_id: user.uid,
        subject: attendanceData.subject,
        date: currentDate,
        timestamp: serverTimestamp(),
        status: "present",
      });
      toast({
        title: "Success",
        description: "Attendance marked successfully.",
      });
      setIsMarkingAttendance(false);
      setAttendanceData({ subject: "" });
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
    <DashboardLayout>
      <div className="w-full max-w-6xl mx-auto pb-6 animate-in fade-in duration-700 font-sans -mt-4">
        
        {/* Top Greeting Section */}
        <div className="mb-6">
          <p className="text-[13px] font-bold tracking-widest uppercase text-[#a0aec0] mb-1">OVERVIEW</p>
          <h2 className="text-[34px] sm:text-[40px] font-bold text-[#1a202c] tracking-tight mb-1">
            Welcome Back, {auth.currentUser?.email?.split('@')[0] || "Student"}!
          </h2>
          <p className="text-[#718096] text-base sm:text-[17px]">
            Access all your academic resources in one place
          </p>
        </div>

        {/* 3 Primary Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          
          {/* Card 1: Mark Attendance */}
          <Dialog open={isMarkingAttendance} onOpenChange={setIsMarkingAttendance}>
            <DialogTrigger asChild>
              <div className="bg-gradient-to-b from-[#ecfdf5]/80 to-white/90 backdrop-blur-xl rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-[4px] border-white hover:shadow-[0_8px_30px_rgba(34,197,94,0.12)] transition-all duration-300 cursor-pointer flex flex-col items-center text-center group h-[220px] justify-center relative overflow-hidden">
                <div className="mb-4 text-[#22c55e] transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                  <Check className="w-14 h-14" strokeWidth={2.5} />
                </div>
                <h3 className="text-[19px] font-bold text-[#1a202c] mb-4">Mark Attendance</h3>
                <Button className="rounded-full bg-[#1e40af] hover:bg-[#1e3a8a] text-white px-8 py-4 h-10 text-[15px] font-medium shadow-md transition-all">
                  Mark Present
                </Button>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Mark Attendance</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid gap-2">
                  <Label className="text-gray-500 font-semibold">Date</Label>
                  <Input className="bg-gray-50 border-transparent rounded-xl" value={new Date().toISOString().split("T")[0]} readOnly />
                </div>
                <div className="grid gap-2">
                  <Label className="text-gray-500 font-semibold">Time</Label>
                  <Input className="bg-gray-50 border-transparent rounded-xl" value={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} readOnly />
                </div>
                <div className="grid gap-2">
                  <Label className="text-gray-500 font-semibold">Subject</Label>
                  <Select onValueChange={(value) => setAttendanceData({ subject: value })}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Chemistry">Chemistry</SelectItem>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={markAttendance} className="w-full rounded-xl bg-[#4f46e5] text-white h-12 mt-2 font-bold text-base">Submit</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Card 2: Submit Assignments */}
          <Dialog open={isSubmitting} onOpenChange={setIsSubmitting}>
            <DialogTrigger asChild>
              <div className="bg-gradient-to-b from-[#eff6ff]/80 to-white/90 backdrop-blur-xl rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-[4px] border-white hover:shadow-[0_8px_30px_rgba(59,130,246,0.12)] transition-all duration-300 cursor-pointer flex flex-col items-center text-center group h-[220px] justify-center relative overflow-hidden">
                <div className="mb-4 text-[#3b82f6] transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                  <Plus className="w-14 h-14" strokeWidth={2.5} />
                </div>
                <h3 className="text-[19px] font-bold text-[#1a202c] mb-4">Submit Assignments</h3>
                <Button className="rounded-full bg-[#1e40af] hover:bg-[#1e3a8a] text-white px-8 py-4 h-10 text-[15px] font-medium shadow-md transition-all">
                  Submit
                </Button>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Submit Assignment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid gap-2">
                  <Label className="text-gray-500 font-semibold">Select Assignment</Label>
                  <Select onValueChange={(value) => setSubmission({ ...submission, assignment_id: value })}>
                    <SelectTrigger className="rounded-xl border-gray-200">
                      <SelectValue placeholder="Choose from pending tasks" />
                    </SelectTrigger>
                    <SelectContent>
                      {assignments.map((assignment: any) => (
                        <SelectItem key={assignment.id} value={assignment.id}>{assignment.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-gray-500 font-semibold">Upload File</Label>
                  <Input
                    type="file"
                    className="rounded-xl border-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    onChange={(e: any) => setSubmission({ ...submission, file: e.target.files[0] })}
                  />
                </div>
                <Button onClick={handleSubmission} className="w-full rounded-xl bg-[#4f46e5] text-white h-12 mt-2 font-bold text-base">Submit File</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Card 3: Raise a Complaint */}
          <Dialog open={isComplaining} onOpenChange={setIsComplaining}>
            <DialogTrigger asChild>
              <div className="bg-gradient-to-b from-[#fef2f2]/80 to-white/90 backdrop-blur-xl rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-[4px] border-white hover:shadow-[0_8px_30px_rgba(239,68,68,0.12)] transition-all duration-300 cursor-pointer flex flex-col items-center text-center group h-[220px] justify-center relative overflow-hidden">
                <div className="mb-4 text-[#ef4444] transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1">
                  <Shield className="w-14 h-14" strokeWidth={2.5} />
                </div>
                <h3 className="text-[19px] font-bold text-[#1a202c] mb-4">Raise a Complaint</h3>
                <Button className="rounded-full bg-[#1e40af] hover:bg-[#1e3a8a] text-white px-8 py-4 h-10 text-[15px] font-medium shadow-md transition-all">
                  View
                </Button>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">New Complaint</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid gap-2">
                  <Label className="text-gray-500 font-semibold">Title</Label>
                  <Input
                    placeholder="Short description of the issue"
                    className="rounded-xl border-gray-200"
                    value={complaint.title}
                    onChange={(e) => setComplaint({ ...complaint, title: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-gray-500 font-semibold">Detailed Description</Label>
                  <Textarea
                    placeholder="Provide more context..."
                    className="rounded-xl border-gray-200 min-h-[100px]"
                    value={complaint.description}
                    onChange={(e) => setComplaint({ ...complaint, description: e.target.value })}
                  />
                </div>
                <Button onClick={handleComplaint} className="w-full rounded-xl bg-red-500 hover:bg-red-600 text-white h-12 mt-2 font-bold text-base">Submit Complaint</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* 3 Secondary Row Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Timetable Card */}
          <div 
            onClick={() => navigate("/student/timetable")}
            className="bg-gradient-to-b from-[#fdf8f6]/80 to-white/90 backdrop-blur-xl rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-[4px] border-white hover:shadow-[0_8px_30px_rgba(245,158,11,0.12)] transition-all duration-300 cursor-pointer flex flex-col justify-between h-[130px]"
          >
            <div className="flex justify-between items-start mb-0">
               <div className="w-[42px] h-[42px] bg-[#f59e0b] rounded-[10px] flex items-center justify-center text-white shadow-sm">
                 <Calendar className="w-6 h-6" />
               </div>
               <span className="text-[17px] font-semibold text-[#1a202c]">Timetable</span>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-[#1a202c] font-semibold text-[17px]">Timetable</span>
              <div className="shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] bg-white border border-[#edf2f7] rounded-full px-5 py-1.5 h-auto font-bold text-[#1a202c] text-[13px] hover:bg-gray-50 transition-colors">
                View
              </div>
            </div>
          </div>

          {/* Notices Card */}
          <div 
            onClick={() => navigate("/student/notices")}
            className="bg-gradient-to-b from-[#f0fdf4]/80 to-white/90 backdrop-blur-xl rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-[4px] border-white hover:shadow-[0_8px_30px_rgba(52,211,153,0.12)] transition-all duration-300 cursor-pointer flex flex-col justify-between h-[130px] relative"
          >
            <div className="flex justify-between items-start mb-0">
               <div className="w-[42px] h-[42px] bg-[#34d399] rounded-[10px] flex items-center justify-center text-white shadow-sm">
                 <Bell className="w-6 h-6" />
               </div>
               <div className="relative flex items-center h-[32px] justify-center mt-[-4px]">
                 <span className="text-[26px] font-bold text-[#1a202c] leading-none">{stats.notices || 0}</span>
                 {stats.notices > 0 && <span className="absolute -top-1 -right-2 w-[10px] h-[10px] bg-[#fcd34d] border-2 border-white rounded-full"></span>}
               </div>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-[#1a202c] font-semibold text-[17px]">Notices</span>
              <div className="shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] bg-white border border-[#edf2f7] rounded-full px-5 py-1.5 h-auto font-bold text-[#1a202c] text-[13px] hover:bg-gray-50 transition-colors">
                View
              </div>
            </div>
          </div>

          {/* Performance Card */}
          <div 
            onClick={() => navigate("/student/performance")}
            className="bg-gradient-to-b from-[#fefce8]/80 to-white/90 backdrop-blur-xl rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-[4px] border-white hover:shadow-[0_8px_30px_rgba(251,191,36,0.12)] transition-all duration-300 cursor-pointer flex flex-col justify-between h-[130px]"
          >
            <div className="flex justify-between items-start mb-0">
               <div className="w-[42px] h-[42px] bg-[#fbbf24] rounded-[10px] flex items-center justify-center text-white shadow-sm">
                 <BarChart className="w-6 h-6" />
               </div>
               <span className="text-[17px] font-semibold text-[#1a202c]">View</span>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-[#1a202c] font-semibold text-[17px]">Performance</span>
              <div className="shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)] bg-white border border-[#edf2f7] rounded-full px-5 py-1.5 h-auto font-bold text-[#1a202c] text-[13px] hover:bg-gray-50 transition-colors">
                View
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Large Banner */}
        <div className="relative bg-gradient-to-r from-[#175cd3] via-[#2185ee] to-[#38bdf8] rounded-[24px] p-8 md:p-12 overflow-hidden shadow-[0_15px_40px_-15px_rgba(23,92,211,0.5)] flex items-center justify-between mt-2">
          {/* Banner Text Content */}
          <div className="relative z-10 max-w-[600px]">
             <h2 className="text-[32px] md:text-[38px] font-bold text-white mb-3 tracking-tight drop-shadow-sm">
               Welcome Back!
             </h2>
             <p className="text-white/90 text-sm md:text-[17px] font-medium leading-[1.6]">
               Track attendance, submit assignment and stay updated with college events and notices.
             </p>
          </div>
          
          {/* Abstract Decorative Elements (Light reflections / dots imitating the user's mockup) */}
          <div className="absolute top-[20%] right-[10%] w-3 h-3 bg-white rounded-full opacity-60 mix-blend-overlay"></div>
          <div className="absolute bottom-[20%] right-[30%] w-2 h-2 bg-white rounded-full opacity-40 mix-blend-overlay"></div>
          <div className="absolute top-[10%] left-[40%] w-2.5 h-2.5 bg-white rounded-full opacity-30 mix-blend-overlay"></div>
          <div className="absolute bottom-0 right-0 w-full h-[40%] bg-gradient-to-t from-white/10 to-transparent"></div>

          {/* Floating 3D Illustration */}
          <div className="absolute right-0 bottom-0 top-0 w-2/5 hidden md:flex items-center justify-end">
            <img 
              src="/assets/banner_illustration.png" 
              alt="Banner decoration" 
              className="h-[130%] w-auto object-contain mix-blend-multiply opacity-100 drop-shadow-2xl translate-x-[20%] translate-y-[10%]" 
            />
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
