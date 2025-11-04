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
      getCountFromServer(collection(db, "profiles")),
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Dialog open={isNotifying} onOpenChange={setIsNotifying}>
          <DialogTrigger asChild>
            <Card className="p-6 flex flex-col items-center justify-center cursor-pointer">
              <Bell className="w-12 h-12 text-yellow-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Release Notices/Updates</h2>
              <Button>Release</Button>
            </Card>
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
            <Card className="p-6 flex flex-col items-center justify-center cursor-pointer">
              <Shield className="w-12 h-12 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Review Complaints ({stats.complaints})</h2>
              <Button>Review</Button>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pending Complaints</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {complaints.map((complaint) => (
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

      <Grid className="grid-cols-3 gap-6 mt-6">
        <Card className="p-6 flex items-center">
          <Users className="w-12 h-12 text-blue-500 mr-4" />
          <div>
            <h3 className="text-xl font-semibold">Total Students</h3>
            <p className="text-3xl font-bold">{stats.students}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center">
          <ClipboardCheck className="w-12 h-12 text-green-500 mr-4" />
          <div>
            <h3 className="text-xl font-semibold">Attendance</h3>
            <p className="text-3xl font-bold">{stats.attendance}%</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center">
          <BookOpen className="w-12 h-12 text-indigo-500 mr-4" />
          <div>
            <h3 className="text-xl font-semibold">Assignments</h3>
            <p className="text-3xl font-bold">{stats.assignments}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center">
          <Calendar className="w-12 h-12 text-purple-500 mr-4" />
          <div>
            <h3 className="text-xl font-semibold">Events</h3>
            <p className="text-3xl font-bold">{stats.events}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center">
          <MessageSquare className="w-12 h-12 text-pink-500 mr-4" />
          <div>
            <h3 className="text-xl font-semibold">Complaints</h3>
            <p className="text-3xl font-bold">{stats.complaints}</p>
          </div>
        </Card>
        <Card className="p-6 flex items-center">
          <Bell className="w-12 h-12 text-yellow-500 mr-4" />
          <div>
            <h3 className="text-xl font-semibold">Notices</h3>
            <p className="text-3xl font-bold">{stats.notices}</p>
          </div>
        </Card>
      </Grid>

      {/* Admin Message */}
      <Card className="mt-6 p-6 bg-warning text-warning-foreground">
        <h3 className="text-2xl font-bold mb-2">Admin Control Panel</h3>
        <p className="opacity-90">
          Manage all aspects of the college portal including students, attendance,
          assignments, events, complaints, and announcements.
        </p>
      </Card>
    </AdminDashboardLayout>
  );
};

export default AdminDashboard;
