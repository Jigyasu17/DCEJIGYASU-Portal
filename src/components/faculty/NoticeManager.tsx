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
import { app } from "@/integrations/firebase/client";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/hooks/useAuth";

const NoticeManager = () => {
  const [notices, setNotices] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.department) {
      const db = getFirestore(app);
      const q = query(
        collection(db, "notices"),
        where("department", "==", user.department)
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const noticesData = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setNotices(noticesData);
      }, (error) => {
        console.error("Error fetching notices:", error);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const db = getFirestore(app);
    let fileURL = "";

    if (file) {
      const storage = getStorage(app);
      const storageRef = ref(storage, `notices/${file.name}`);
      await uploadBytes(storageRef, file);
      fileURL = await getDownloadURL(storageRef);
    }

    await addDoc(collection(db, "notices"), {
      title,
      content,
      department: user.department,
      createdAt: Timestamp.now(),
      fileURL,
    });

    // Reset form
    setTitle("");
    setContent("");
    setFile(null);
    setIsOpen(false);
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button>Create Notice</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Notice</DialogTitle>
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
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="file">Attach Circular</Label>
              <Input id="file" type="file" onChange={handleFileChange} />
            </div>
            <Button type="submit">Post Notice</Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="mt-6">
        <h3 className="text-lg font-semibold">Department Notices</h3>
        <div className="space-y-4 mt-4">
          {notices.map((notice) => (
            <div key={notice.id} className="p-4 border rounded-lg">
              <h4 className="font-bold">{notice.title}</h4>
              <p>{notice.content}</p>
              {notice.fileURL && (
                <a href={notice.fileURL} target="_blank" rel="noopener noreferrer">
                  <Button variant="link">View Circular</Button>
                </a>
              )}
              {notice.createdAt && (
                <p className="text-sm text-muted-foreground">
                  Posted on: {new Date(notice.createdAt.seconds * 1000).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NoticeManager;
