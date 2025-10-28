import { useState } from "react";
import FacultyDashboardLayout from "@/components/faculty/FacultyDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Bell, Shield } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { app } from "@/integrations/firebase/client";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const FacultyDashboard = () => {
  const { toast } = useToast();
  const [isAssigning, setIsAssigning] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const [isComplaining, setIsComplaining] = useState(false);
  const [assignment, setAssignment] = useState({
    title: "",
    description: "",
    subject: "",
    deadline: "",
  });
  const [notice, setNotice] = useState({
    title: "",
    description: "",
  });
  const [complaint, setComplaint] = useState({
    title: "",
    description: "",
  });

  const handleAssign = async () => {
    if (!assignment.title || !assignment.subject || !assignment.deadline) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const db = getFirestore(app);
      await addDoc(collection(db, "assignments"), {
        ...assignment,
        deadline: new Date(assignment.deadline),
        created_at: serverTimestamp(),
      });
      toast({
        title: "Success",
        description: "Assignment created successfully.",
      });
      setIsAssigning(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create assignment. Please try again later.",
        variant: "destructive",
      });
    }
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

  const handleComplaint = async () => {
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
        created_at: serverTimestamp(),
        status: "pending",
      });
      toast({
        title: "Success",
        description: "Complaint raised successfully.",
      });
      setIsComplaining(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to raise complaint. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <FacultyDashboardLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Dialog open={isAssigning} onOpenChange={setIsAssigning}>
          <DialogTrigger asChild>
            <Card className="p-6 flex flex-col items-center justify-center cursor-pointer">
              <Plus className="w-12 h-12 text-blue-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Assign Assignments</h2>
              <Button>Assign</Button>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Assignment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Title"
                value={assignment.title}
                onChange={(e) => setAssignment({ ...assignment, title: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={assignment.description}
                onChange={(e) => setAssignment({ ...assignment, description: e.target.value })}
              />
              <Input
                placeholder="Subject"
                value={assignment.subject}
                onChange={(e) => setAssignment({ ...assignment, subject: e.target.value })}
              />
              <Input
                type="datetime-local"
                placeholder="Deadline"
                value={assignment.deadline}
                onChange={(e) => setAssignment({ ...assignment, deadline: e.target.value })}
              />
              <Button onClick={handleAssign}>Create Assignment</Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={isNotifying} onOpenChange={setIsNotifying}>
          <DialogTrigger asChild>
            <Card className="p-6 flex flex-col items-center justify-center cursor-pointer">
              <Bell className="w-12 h-12 text-yellow-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Provide Updates/Notices</h2>
              <Button>Provide</Button>
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
      </div>
    </FacultyDashboardLayout>
  );
};

export default FacultyDashboard;
