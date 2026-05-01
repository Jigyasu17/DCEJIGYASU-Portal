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
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

const AssignmentManager = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [fileURL, setFileURL] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

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

    try {
      await addDoc(collection(db, "assignments"), {
        title,
        description,
        dueDate: Timestamp.fromDate(new Date(dueDate)),
        facultyId: user.uid,
        department: user.department || "General",
        fileURL,
        createdAt: Timestamp.now(),
      });

      toast({
        title: "Success",
        description: "Assignment created successfully.",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setDueDate("");
      setFileURL("");
      setIsOpen(false);
    } catch (error: any) {
      console.error("Error creating assignment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create assignment",
        variant: "destructive",
      });
    }
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
            <div>
              <Label htmlFor="fileURL">Resource Link (Optional)</Label>
              <Input
                id="fileURL"
                type="url"
                placeholder="e.g. Google Drive Link"
                value={fileURL}
                onChange={(e) => setFileURL(e.target.value)}
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
              {assignment.fileURL && (
                <div className="mt-2">
                  <a href={assignment.fileURL} target="_blank" rel="noopener noreferrer">
                    <Button variant="link" className="px-0">View Resource</Button>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssignmentManager;
