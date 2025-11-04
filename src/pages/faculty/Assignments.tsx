import FacultyDashboardLayout from "@/components/faculty/FacultyDashboardLayout";
import { useState } from "react";
import { getFirestore, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "@/integrations/firebase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

const Assignments = () => {
  const [assignment, setAssignment] = useState({ title: "", description: "", dueDate: "" });
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleCreateAssignment = async () => {
    if (!assignment.title || !assignment.dueDate || !file) {
      toast({
        title: "Error",
        description: "Please fill all fields and select a file.",
        variant: "destructive",
      });
      return;
    }

    try {
      const db = getFirestore(app);
      const storage = getStorage(app);

      const storageRef = ref(storage, `assignments/${file.name}`);
      await uploadBytes(storageRef, file);
      const fileURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, "assignments"), {
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate,
        fileURL,
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Success",
        description: "Assignment created successfully.",
      });
      setAssignment({ title: "", description: "", dueDate: "" });
      setFile(null);
      const fileInput = document.getElementById("file") as HTMLInputElement;
      if(fileInput) fileInput.value = "";

    } catch (error) {
      console.error("Error creating assignment:", error);
      toast({
        title: "Error",
        description: "Failed to create assignment. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <FacultyDashboardLayout title="Assignments">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Create New Assignment</h2>
          <div className="space-y-4 mt-4">
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
              <Input
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
            <Button onClick={handleCreateAssignment}>Create Assignment</Button>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Existing Assignments</h2>
          <p>A list of all assignments will be displayed here.</p>
        </div>
      </div>
    </FacultyDashboardLayout>
  );
};

export default Assignments;
