import { useState } from "react";
import FacultyDashboardLayout from "@/components/faculty/FacultyDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Bell, Shield } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { app } from "@/integrations/firebase/client";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const FacultyDashboard = () => {
  const { toast } = useToast();
  const [isAssigning, setIsAssigning] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const [isComplaining, setIsComplaining] = useState(false);
  const [assignment, setAssignment] = useState({
    title: "",
    description: "",
    dueDate: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [notice, setNotice] = useState({
    title: "",
    description: "",
  });
  const [complaint, setComplaint] = useState({
    title: "",
    description: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleAssign = async () => {
    if (!assignment.title || !assignment.dueDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const db = getFirestore(app);
      let fileURL = "";
      if (file) {
        const storage = getStorage(app);
        const storageRef = ref(storage, `assignments/${file.name}`);
        await uploadBytes(storageRef, file);
        fileURL = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, "assignments"), {
        ...assignment,
        fileURL,
        createdAt: serverTimestamp(),
      });
      toast({
        title: "Success",
        description: "Assignment created successfully.",
      });
      setIsAssigning(false);
      setAssignment({ title: "", description: "", dueDate: "" });
      setFile(null);
    } catch (error) {
      console.error(error);
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
            <div className="bg-gradient-to-b from-[#eff6ff]/80 to-white/90 backdrop-blur-xl rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-[4px] border-white hover:shadow-[0_8px_30px_rgba(59,130,246,0.12)] transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between group h-[200px] relative overflow-hidden">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Plus className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-[22px] font-bold text-[#1a202c] mb-1">Assign Assignments</h3>
                <p className="text-[#a0aec0] text-sm font-medium">Create a new assignment</p>
              </div>
              <div className="absolute right-8 bottom-8 pb-2">
                <div className="bg-white/50 backdrop-blur-md border border-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-bold shadow-sm flex items-center space-x-2 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <span>Assign</span>
                  <Plus className="w-4 h-4" />
                </div>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Assignment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g. Maths Homework"
                value={assignment.title}
                onChange={(e) => setAssignment({ ...assignment, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="e.g. Complete exercises 1-5"
                value={assignment.description}
                onChange={(e) => setAssignment({ ...assignment, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={assignment.dueDate}
                onChange={(e) => setAssignment({ ...assignment, dueDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="file">Assignment File</Label>
              <Input id="file" type="file" onChange={handleFileChange} />
            </div>
              <Button onClick={handleAssign}>Create Assignment</Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={isNotifying} onOpenChange={setIsNotifying}>
          <DialogTrigger asChild>
            <div className="bg-gradient-to-b from-[#fefce8]/80 to-white/90 backdrop-blur-xl rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-[4px] border-white hover:shadow-[0_8px_30px_rgba(234,179,8,0.12)] transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between group h-[200px] relative overflow-hidden">
              <div className="w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Bell className="w-8 h-8 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-[22px] font-bold text-[#1a202c] mb-1">Updates/Notices</h3>
                <p className="text-[#a0aec0] text-sm font-medium">Broadcast new notices</p>
              </div>
              <div className="absolute right-8 bottom-8 pb-2">
                <div className="bg-white/50 backdrop-blur-md border border-yellow-100 text-yellow-600 px-4 py-2 rounded-full text-sm font-bold shadow-sm flex items-center space-x-2 group-hover:bg-yellow-500 group-hover:text-white transition-all duration-300">
                  <span>Provide</span>
                  <Bell className="w-4 h-4 line-clamp-1" />
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
        <Dialog open={isComplaining} onOpenChange={setIsComplaining}>
          <DialogTrigger asChild>
            <div className="bg-gradient-to-b from-[#fef2f2]/80 to-white/90 backdrop-blur-xl rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-[4px] border-white hover:shadow-[0_8px_30px_rgba(239,68,68,0.12)] transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between group h-[200px] relative overflow-hidden">
              <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-[22px] font-bold text-[#1a202c] mb-1">Raise a Complaint</h3>
                <p className="text-[#a0aec0] text-sm font-medium">Report an issue</p>
              </div>
              <div className="absolute right-8 bottom-8 pb-2">
                <div className="bg-white/50 backdrop-blur-md border border-red-100 text-red-600 px-4 py-2 rounded-full text-sm font-bold shadow-sm flex items-center space-x-2 group-hover:bg-red-500 group-hover:text-white transition-all duration-300">
                  <span>Raise</span>
                  <Shield className="w-4 h-4" />
                </div>
              </div>
            </div>
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

      {/* Bottom Banner */}
      <div className="mt-12 bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] rounded-[32px] p-8 sm:p-10 text-white relative overflow-hidden shadow-[0_15px_40px_-15px_rgba(59,130,246,0.3)]">
        <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute left-10 bottom-0 w-40 h-40 bg-blue-300 opacity-20 rounded-full blur-[50px] translate-y-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 max-w-lg">
            <h3 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight">Need help with your classes?</h3>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Contact the administration deck or reach out to IT support for any technical difficulties spanning the portal.
            </p>
          </div>
          <div className="flex-shrink-0">
            <button className="bg-white text-[#1e3a8a] hover:bg-blue-50 transition-colors px-6 py-3 rounded-full font-bold text-sm shadow-[0_4px_14px_0_rgba(255,255,255,0.3)]">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </FacultyDashboardLayout>
  );
};

export default FacultyDashboard;
