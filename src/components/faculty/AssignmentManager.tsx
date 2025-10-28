import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { useAuth } from "@/hooks/useAuth"; // You might need a custom hook for auth state

const AssignmentManager = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth(); // Assuming useAuth provides the logged-in user

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, "assignments"),
        where("facultyId", "==", user.uid)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const assignmentsData = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setAssignments(assignmentsData);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    await addDoc(collection(db, "assignments"), {
      title,
      description,
      dueDate: Timestamp.fromDate(new Date(dueDate)),
      facultyId: user.uid,
      department: user.department, // Assuming user has a department field
    });

    // Reset form
    setTitle("");
    setDescription("");
    setDueDate("");
    setIsOpen(false);
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button>Create Assignment</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Assignment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
            <Button type="submit">Create</Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="mt-6">
        <h3 className="text-lg font-semibold">Your Assignments</h3>
        <div className="space-y-4 mt-4">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="p-4 border rounded-lg">
              <h4 className="font-bold">{assignment.title}</h4>
              <p>{assignment.description}</p>
              <p className="text-sm text-muted-foreground">
                Due: {new Date(assignment.dueDate.seconds * 1000).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssignmentManager;
