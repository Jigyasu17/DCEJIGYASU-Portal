import { useEffect, useState } from "react";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { app } from "@/integrations/firebase/client";
import { getFirestore, collection, getCountFromServer, addDoc, serverTimestamp, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { Users, BookOpen, Calendar, MessageSquare, Bell, ClipboardCheck, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Grid } from "@/components/ui/grid"; 

const AdminDashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    students: 0,
    attendance: 0,
    assignments: 0,
    events: 0,
    complaints: 0,
    notices: 0,
  });
  const [isNotifying, setIsNotifying] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [notice, setNotice] = useState({
    title: "",
    description: "",
  });
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchComplaints();
  }, []);

  const fetchStats = async () => {
    const db = getFirestore(app);
    const [students, attendance, assignments, events, complaints, notices] = await Promise.all([
      getCountFromServer(query(collection(db, "users"), where("role", "==", "student"))),
      getCountFromServer(collection(db, "attendance")),
      getCountFromServer(collection(db, "assignments")),
      getCountFromServer(collection(db, "events")),
      getCountFromServer(query(collection(db, "complaints"), where("status", "==", "pending"))),
      getCountFromServer(collection(db, "notices")),
    ]);

    setStats({
      students: students.data().count,
      attendance: attendance.data().count,
      assignments: assignments.data().count,
      events: events.data().count,
      complaints: complaints.data().count,
      notices: notices.data().count,
    });
  };

  const fetchComplaints = async () => {
    const db = getFirestore(app);
    const q = query(collection(db, "complaints"), where("status", "==", "pending"));
    const querySnapshot = await getDocs(q);
    const complaintsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setComplaints(complaintsData);
  };

  const handleNotify = async () => {
    if (!notice.title || !notice.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const db = getFirestore(app);
      await addDoc(collection(db, "notices"), {
        ...notice,
        created_at: serverTimestamp(),
      });
      toast({
        title: "Success",
        description: "Notice released successfully.",
      });
      setIsNotifying(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to release notice. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleComplaintAction = async (id, status) => {
    const db = getFirestore(app);
    await updateDoc(doc(db, "complaints", id), {
      status,
    });
    fetchComplaints();
    fetchStats();
  };

  return (
    <AdminDashboardLayout title="Admin Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Dialog open={isNotifying} onOpenChange={setIsNotifying}>
          <DialogTrigger asChild>
            <div className="bg-gradient-to-b from-[#fefce8]/80 to-white/90 backdrop-blur-xl rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-[4px] border-white hover:shadow-[0_8px_30px_rgba(234,179,8,0.12)] transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between group h-[200px] relative overflow-hidden">
              <div className="w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Bell className="w-8 h-8 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-[22px] font-bold text-[#1a202c] mb-1">Release Notices</h3>
                <p className="text-[#a0aec0] text-sm font-medium">Broadcast new notices to all</p>
              </div>
              <div className="absolute right-8 bottom-8 pb-2">
                <div className="bg-white/50 backdrop-blur-md border border-yellow-100 text-yellow-600 px-4 py-2 rounded-full text-sm font-bold shadow-sm flex items-center space-x-2 group-hover:bg-yellow-500 group-hover:text-white transition-all duration-300">
                  <span>Release</span>
                  <Bell className="w-4 h-4" />
                </div>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Notice</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Title"
                value={notice.title}
                onChange={(e) => setNotice({ ...notice, title: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={notice.description}
                onChange={(e) => setNotice({ ...notice, description: e.target.value })}
              />
              <Button onClick={handleNotify}>Create Notice</Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={isReviewing} onOpenChange={setIsReviewing}>
          <DialogTrigger asChild>
            <div className="bg-gradient-to-b from-[#fef2f2]/80 to-white/90 backdrop-blur-xl rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-[4px] border-white hover:shadow-[0_8px_30px_rgba(239,68,68,0.12)] transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between group h-[200px] relative overflow-hidden">
              <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-[22px] font-bold text-[#1a202c] mb-1">Review Complaints</h3>
                <p className="text-[#a0aec0] text-sm font-medium">{stats.complaints} Pending Cases</p>
              </div>
              <div className="absolute right-8 bottom-8 pb-2">
                <div className="bg-white/50 backdrop-blur-md border border-red-100 text-red-600 px-4 py-2 rounded-full text-sm font-bold shadow-sm flex items-center space-x-2 group-hover:bg-red-500 group-hover:text-white transition-all duration-300">
                  <span>Review</span>
                  <Shield className="w-4 h-4" />
                </div>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pending Complaints</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {complaints.map((complaint: any) => (
                <Card key={complaint.id} className="p-4">
                  <h3 className="font-semibold">{complaint.title}</h3>
                  <p>{complaint.description}</p>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => handleComplaintAction(complaint.id, "resolved")}>Resolve</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleComplaintAction(complaint.id, "rejected")}>Reject</Button>
                  </div>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
        <div className="bg-gradient-to-b from-[#eff6ff]/80 to-white/90 backdrop-blur-xl rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-[4px] border-white hover:shadow-[0_8px_30px_rgba(59,130,246,0.12)] transition-all duration-300 flex flex-col justify-between h-[150px]">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 mb-2">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#a0aec0] uppercase tracking-wider mb-1">Total Students</p>
            <h3 className="text-3xl font-bold text-[#1a202c]">{stats.students}</h3>
          </div>
        </div>
        <div className="bg-gradient-to-b from-[#f0fdf4]/80 to-white/90 backdrop-blur-xl rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-[4px] border-white hover:shadow-[0_8px_30px_rgba(34,197,94,0.12)] transition-all duration-300 flex flex-col justify-between h-[150px]">
          <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 mb-2">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#a0aec0] uppercase tracking-wider mb-1">Attendance</p>
            <h3 className="text-3xl font-bold text-[#1a202c]">{stats.attendance}%</h3>
          </div>
        </div>
        <div className="bg-gradient-to-b from-[#e0e7ff]/80 to-white/90 backdrop-blur-xl rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-[4px] border-white hover:shadow-[0_8px_30px_rgba(99,102,241,0.12)] transition-all duration-300 flex flex-col justify-between h-[150px]">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 mb-2">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#a0aec0] uppercase tracking-wider mb-1">Assignments</p>
            <h3 className="text-3xl font-bold text-[#1a202c]">{stats.assignments}</h3>
          </div>
        </div>
        <div className="bg-gradient-to-b from-[#f3e8ff]/80 to-white/90 backdrop-blur-xl rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-[4px] border-white hover:shadow-[0_8px_30px_rgba(168,85,247,0.12)] transition-all duration-300 flex flex-col justify-between h-[150px]">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 mb-2">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#a0aec0] uppercase tracking-wider mb-1">Events</p>
            <h3 className="text-3xl font-bold text-[#1a202c]">{stats.events}</h3>
          </div>
        </div>
        <div className="bg-gradient-to-b from-[#fce7f3]/80 to-white/90 backdrop-blur-xl rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-[4px] border-white hover:shadow-[0_8px_30px_rgba(236,72,153,0.12)] transition-all duration-300 flex flex-col justify-between h-[150px]">
          <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-600 mb-2">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#a0aec0] uppercase tracking-wider mb-1">Complaints</p>
            <h3 className="text-3xl font-bold text-[#1a202c]">{stats.complaints}</h3>
          </div>
        </div>
        <div className="bg-gradient-to-b from-[#fefce8]/80 to-white/90 backdrop-blur-xl rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-[4px] border-white hover:shadow-[0_8px_30px_rgba(234,179,8,0.12)] transition-all duration-300 flex flex-col justify-between h-[150px]">
          <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center text-yellow-600 mb-2">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#a0aec0] uppercase tracking-wider mb-1">Notices</p>
            <h3 className="text-3xl font-bold text-[#1a202c]">{stats.notices}</h3>
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="mt-12 bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] rounded-[32px] p-8 sm:p-10 text-white relative overflow-hidden shadow-[0_15px_40px_-15px_rgba(59,130,246,0.3)]">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute left-10 bottom-0 w-40 h-40 bg-blue-300 opacity-20 rounded-full blur-[50px] translate-y-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 max-w-lg">
            <h3 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight">System Controls Active</h3>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              You are currently logged into the administrative portal. Access sensitive modules with caution and ensure changes are saved properly.
            </p>
          </div>
          <div className="flex-shrink-0">
            <button onClick={() => window.scrollTo(0,0)} className="bg-white text-[#1e3a8a] hover:bg-blue-50 transition-colors px-6 py-3 rounded-full font-bold text-sm shadow-[0_4px_14px_0_rgba(255,255,255,0.3)]">
              Back to Top
            </button>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminDashboard;
