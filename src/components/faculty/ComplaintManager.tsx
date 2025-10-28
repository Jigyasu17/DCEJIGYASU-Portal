import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/integrations/firebase/client";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";

const ComplaintManager = () => {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [description, setDescription] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, "complaints"),
        where("userId", "==", user.uid)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const complaintsData = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setComplaints(complaintsData);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    await addDoc(collection(db, "complaints"), {
      description,
      userId: user.uid,
      userRole: "faculty",
      status: "pending",
      createdAt: Timestamp.now(),
    });

    // Reset form
    setDescription("");
    setIsOpen(false);
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button>Raise Complaint</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Raise a New Complaint</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="description">Complaint Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <Button type="submit">Submit Complaint</Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="mt-6">
        <h3 className="text-lg font-semibold">Your Complaints</h3>
        <div className="space-y-4 mt-4">
          {complaints.map((complaint) => (
            <div key={complaint.id} className="p-4 border rounded-lg">
              <p>{complaint.description}</p>
              <p className="text-sm text-muted-foreground">
                Status: {complaint.status}
              </p>
              <p className="text-sm text-muted-foreground">
                Submitted on: {new Date(complaint.createdAt.seconds * 1000).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComplaintManager;
