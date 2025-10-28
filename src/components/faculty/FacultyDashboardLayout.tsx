import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X, User, Book, FileText, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/integrations/firebase/client";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

interface FacultyDashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

const FacultyDashboardLayout = ({ children, title }: FacultyDashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        if (userData?.role !== "faculty") {
          toast({
            variant: "destructive",
            title: "Access denied",
            description: "You don\'t have faculty permissions",
          });
          await signOut(auth);
          navigate("/");
          return;
        }
        setProfile(userData);
      } else {
        navigate("/faculty/auth");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    toast({
      title: "Logged out successfully",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X /> : <Menu />}
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-info rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-info-foreground" />
              </div>
              <h1 className="text-lg font-bold text-foreground">
                Faculty Portal
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-foreground">
                {profile?.fullName || "Faculty"}
              </p>
              <p className="text-xs text-muted-foreground">{profile?.email}</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleLogout}
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 fixed md:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-card border-r border-border transition-transform duration-200 ease-in-out z-30`}
        >
          <nav className="p-4 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate("/faculty")}
            >
              Dashboard
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate("/faculty/assignments")}
            >
              <Book className="mr-2 w-4 h-4" />
              Assignments
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate("/faculty/notices")}
            >
              <FileText className="mr-2 w-4 h-4" />
              Notices
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => navigate("/faculty/complaints")}
            >
              <ShieldAlert className="mr-2 w-4 h-4" />
              Complaints
            </Button>
            {/* Add more faculty-specific navigation buttons here */}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-foreground">{title}</h2>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};

export default FacultyDashboardLayout;
