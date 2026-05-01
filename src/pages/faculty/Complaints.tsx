import { useEffect, useState } from "react";
import FacultyDashboardLayout from "@/components/faculty/FacultyDashboardLayout";
import { Card } from "@/components/ui/card";
import { app, auth } from "@/integrations/firebase/client";
import { getFirestore, collection, getDocs, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const Complaints = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const { toast } = useToast();
  const [isComplaining, setIsComplaining] = useState(false);
  const [complaintForm, setComplaintForm] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const db = getFirestore(app);
    const q = query(collection(db, "complaints"), where("faculty_id", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const complaintsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    // Sort by created_at descending if available
    complaintsData.sort((a: any, b: any) => {
      const timeA = a.created_at ? a.created_at.toMillis() : 0;
      const timeB = b.created_at ? b.created_at.toMillis() : 0;
      return timeB - timeA;
    });
    setComplaints(complaintsData);
  };

  const handleComplaint = async () => {
    if (!complaintForm.title || !complaintForm.description) {
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
        ...complaintForm,
        created_at: serverTimestamp(),
        faculty_id: auth.currentUser?.uid,
        status: "pending",
      });
      toast({
        title: "Success",
        description: "Complaint raised successfully.",
      });
      setIsComplaining(false);
      setComplaintForm({ title: "", description: "" });
      fetchComplaints();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to raise complaint. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <FacultyDashboardLayout title="My Complaints">
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Complaints Records</h2>
        <Dialog open={isComplaining} onOpenChange={setIsComplaining}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700 text-white font-semibold shadow-sm">
              Raise a Complaint
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Complaint</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Title"
                value={complaintForm.title}
                onChange={(e) => setComplaintForm({ ...complaintForm, title: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                className="min-h-[100px]"
                value={complaintForm.description}
                onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
              />
              <Button onClick={handleComplaint} className="w-full bg-red-600 hover:bg-red-700 h-12 text-lg">
                Submit Complaint
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {complaints.length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground border-dashed">
          No complaints found.
        </Card>
      ) : (
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <Card key={complaint.id} className="p-5 hover:shadow-md transition-shadow border-l-4" style={{ borderLeftColor: complaint.status === 'pending' ? '#eab308' : complaint.status === 'resolved' ? '#22c55e' : '#ef4444' }}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{complaint.title}</h3>
                <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : complaint.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {complaint.status}
                </span>
              </div>
              <p className="text-gray-600">{complaint.description}</p>
              {complaint.created_at && (
                <p className="text-xs text-gray-400 mt-4">
                  {new Date(complaint.created_at.toMillis()).toLocaleDateString()}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </FacultyDashboardLayout>
  );
};

export default Complaints;
