import { useEffect, useState } from "react";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { app } from "@/integrations/firebase/client";
import { getFirestore, collection, getDocs, query, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Bell, LinkIcon, Calendar } from "lucide-react";

interface Notice {
  id: string;
  title: string;
  description?: string;
  content?: string;
  fileURL?: string;
  created_at?: any;
  createdAt?: any;
}

const Notices = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: "",
    description: "",
    fileURL: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const db = getFirestore(app);
      // Wait! Admin notices usually use created_at, faculty NoticeManager uses createdAt.
      // Fetch without orderby to avoid missing index errors since there are mixed timestamp fields
      const q = query(collection(db, "notices"));
      const querySnapshot = await getDocs(q);
      const noticesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Notice));
      
      // Sort client-side by newest
      noticesData.sort((a, b) => {
        const timeA = (a.created_at?.toMillis?.() || a.createdAt?.toMillis?.() || 0);
        const timeB = (b.created_at?.toMillis?.() || b.createdAt?.toMillis?.() || 0);
        return timeB - timeA;
      });
      
      setNotices(noticesData);
    } catch (error) {
      console.error("Error fetching notices:", error);
    }
  };

  const handleCreateNotice = async () => {
    if (!newNotice.title || !newNotice.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Title, Description).",
        variant: "destructive",
      });
      return;
    }

    try {
      const db = getFirestore(app);
      await addDoc(collection(db, "notices"), {
        title: newNotice.title,
        description: newNotice.description,
        content: newNotice.description, // For backward compatibility with Faculty NoticeManager
        fileURL: newNotice.fileURL,
        created_at: serverTimestamp(),
        createdAt: serverTimestamp(), // For backward compatibility with Faculty NoticeManager
        department: "General" // Admin notices default to General
      });
      
      toast({
        title: "Success",
        description: "Notice released successfully.",
      });
      
      setIsOpen(false);
      setNewNotice({ title: "", description: "", fileURL: "" });
      fetchNotices();
    } catch (error) {
      console.error("Error creating notice:", error);
      toast({
        title: "Error",
        description: "Failed to release notice. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminDashboardLayout title="System Notices">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Notices</h2>
          <p className="text-muted-foreground">Manage and view all broadcasted notices.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">Create Notice</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Broadcast New Notice</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Notice Title *</Label>
                <Input 
                  placeholder="e.g. End Semester Exam Schedule" 
                  value={newNotice.title}
                  onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description / Content *</Label>
                <Textarea 
                  placeholder="Details about the notice..." 
                  value={newNotice.description}
                  onChange={(e) => setNewNotice({ ...newNotice, description: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Resource Link (Optional)</Label>
                <Input 
                  placeholder="e.g. Google Drive Link to Circular PDF" 
                  value={newNotice.fileURL}
                  onChange={(e) => setNewNotice({ ...newNotice, fileURL: e.target.value })}
                />
              </div>
              <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white" onClick={handleCreateNotice}>
                Publish Notice
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {notices.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="mx-auto mb-4 h-16 w-16 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground text-lg">No notices have been broadcasted yet.</p>
          </Card>
        ) : (
          notices.map((notice) => (
            <Card key={notice.id} className="p-6 transition-all duration-300 hover:shadow-md">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{notice.title}</h3>
                  <p className="text-gray-600 mb-4 whitespace-pre-wrap">
                    {notice.description || notice.content || "No description provided."}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                    {notice.fileURL && (
                      <a 
                        href={notice.fileURL} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-1.5 rounded-full"
                      >
                        <LinkIcon className="w-4 h-4" />
                        View Circular / Resource
                      </a>
                    )}
                    
                    {(notice.created_at || notice.createdAt) && (
                      <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
                        <Calendar className="w-4 h-4" />
                        Posted: {new Date(
                          (notice.created_at?.toMillis?.() || notice.createdAt?.toMillis?.())
                        ).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default Notices;
