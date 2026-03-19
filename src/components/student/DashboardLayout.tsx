import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/integrations/firebase/client";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

let cachedProfile: any = null;

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<any>(cachedProfile);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        const userData = userDoc.data();
        if (userData?.role !== "student") {
          navigate("/");
          return;
        }
        cachedProfile = userData;
        setProfile(userData);
      } else {
        navigate("/student/auth");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      cachedProfile = null;
      await signOut(auth);
      toast({ title: "Logged out successfully" });
      navigate("/");
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fbff] overflow-hidden font-sans relative z-0">
      
      {/* Smooth Soft Gradient Background Blobs matching the reference */}
      <div className="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-[#e0e7ff] rounded-full blur-[120px] -z-10 pointer-events-none opacity-60"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] bg-[#f3e8ff] rounded-full blur-[150px] -z-10 pointer-events-none opacity-60"></div>
      <div className="absolute top-[40%] left-[30%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-[#e0f2fe] rounded-full blur-[120px] -z-10 pointer-events-none opacity-50"></div>

      {/* Sidebar Navigation */}
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen} 
        profile={profile} 
        handleLogout={handleLogout} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        {/* Top Navbar */}
        <Navbar 
          profile={profile} 
          onOpenSidebar={() => setIsSidebarOpen(true)} 
        />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-auto bg-transparent px-4 sm:px-8 pb-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;