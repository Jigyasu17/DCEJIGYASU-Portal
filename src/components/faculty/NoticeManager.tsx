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

const NoticeManager = () => {
  const [notices, setNotices] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, "notices"),
        where("department", "==", user.department) // Filter by faculty's department
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const noticesData = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setNotices(noticesData);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    await addDoc(collection(db, "notices"), {
      title,
      content,
      department: user.department,
      createdAt: Timestamp.now(),
    });

    // Reset form
    setTitle("");
    setContent("");
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
              <p className="text-sm text-muted-foreground">
                Posted on: {new Date(notice.createdAt.seconds * 1000).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NoticeManager;
