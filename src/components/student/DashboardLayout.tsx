import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut, Menu, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/integrations/firebase/client";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        let userData = userDoc.data();
        if (userData?.role !== "student") {
          navigate("/");
          return;
        }
        
        if (userData.fullName === 'New User' || !userData.fullName) {
          const newName = user.email!.split('@')[0];
          await setDoc(userDocRef, { fullName: newName }, { merge: true });
          userData.fullName = newName;
        }
        setProfile(userData);
        setIsLoading(false);
      } else {
        navigate("/student/auth");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await signOut(auth);
      toast({
        title: "Logged out successfully",
      });
      navigate("/");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500 dark:text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
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
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-lg font-bold text-gray-800 dark:text-white">
                Dronacharya Portal
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {profile?.fullName || "Student"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{profile?.email}</p>
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
          } md:translate-x-0 fixed md:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-200 ease-in-out z-30`}
        >
          <nav className="p-4 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => navigate("/student")}
            >
              Dashboard
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => navigate("/student/attendance")}
            >
              Attendance
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => navigate("/student/assignments")}
            >
              Assignments
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => navigate("/student/events")}
            >
              Events
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => navigate("/student/complaints")}
            >
              Complaints
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => navigate("/student/notices")}
            >
              Notices
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => navigate("/student/performance")}
            >
              Performance
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{title}</h2>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
