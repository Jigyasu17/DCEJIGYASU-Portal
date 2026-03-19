import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  LogOut, Menu, X, User,
  LayoutDashboard, CalendarCheck, Book, Bell, MessageSquareWarning
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/integrations/firebase/client";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

let cachedProfile: any = null;

interface FacultyDashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

const navItems = [
  { label: "Dashboard", path: "/faculty", icon: LayoutDashboard },
  { label: "Attendance", path: "/faculty/attendance", icon: CalendarCheck },
  { label: "Assignments", path: "/faculty/assignments", icon: Book },
  { label: "Notices", path: "/faculty/notices", icon: Bell },
  { label: "Complaints", path: "/faculty/complaints", icon: MessageSquareWarning },
];

const FacultyDashboardLayout = ({ children, title }: FacultyDashboardLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState<any>(cachedProfile);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        let userData = userDoc.data();
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

        if (userData.fullName === 'New User' || !userData.fullName) {
          const newName = user.email!.split('@')[0];
          await setDoc(userDocRef, { fullName: newName }, { merge: true });
          userData.fullName = newName;
        }

        cachedProfile = userData;
        setProfile(userData);
      } else {
        navigate("/faculty/auth");
      }
    });

    return () => unsubscribe();
  }, [navigate, toast]);

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to log out?")) {
      cachedProfile = null;
      await signOut(auth);
      toast({ title: "Logged out successfully" });
      navigate("/");
    }
  };

  const initials = profile?.fullName
    ? profile.fullName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
    : "FA";

  return (
    <div className="min-h-screen bg-[#f8fbff] relative z-0 flex flex-col">
      {/* Smooth Soft Gradient Background Blobs matching the reference */}
      <div className="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-[#e0e7ff] rounded-full blur-[120px] -z-10 pointer-events-none opacity-60"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] bg-[#f3e8ff] rounded-full blur-[150px] -z-10 pointer-events-none opacity-60"></div>
      <div className="absolute top-[40%] left-[30%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-[#e0f2fe] rounded-full blur-[120px] -z-10 pointer-events-none opacity-50"></div>

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
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 fixed md:sticky top-16 left-0
          h-[calc(100vh-4rem)] w-64 bg-card border-r border-border
          transition-transform duration-200 ease-in-out z-30
          flex flex-col
        `}>

          {/* Nav section label */}
          <div className="px-4 pt-5 pb-1">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/60">
              Navigation
            </p>
          </div>

          {/* Nav items */}
          <nav className="flex-1 px-3 py-2 space-y-0.5">
            {navItems.map(({ label, path, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <button
                  key={path}
                  onClick={() => { navigate(path); setIsSidebarOpen(false); }}
                  className={`
                    relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                    transition-all duration-150 group
                    ${isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }
                  `}
                >
                  {/* Active accent bar */}
                  {isActive && (
                    <span className="absolute left-0 top-[20%] h-[60%] w-[3px] rounded-r-full bg-primary" />
                  )}
                  <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>

          {/* User footer */}
          <div className="p-3 border-t border-border mt-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent transition-colors text-left outline-none focus-visible:ring-2 focus-visible:ring-primary">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-border flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{profile?.fullName || "Faculty"}</p>
                    <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="center" side="right" sideOffset={16}>
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer p-3">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span className="font-medium">Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 relative z-10 overflow-auto font-sans">
          <div className="w-full max-w-6xl mx-auto animate-in fade-in duration-700 pb-6">
            <div className="mb-6">
              <p className="text-[13px] font-bold tracking-widest uppercase text-[#a0aec0] mb-1">OVERVIEW</p>
              <h2 className="text-[34px] sm:text-[40px] font-bold text-[#1a202c] tracking-tight mb-1">
                Welcome Back, {profile?.fullName?.split(' ')[0] || "Faculty"}!
              </h2>
              <p className="text-[#718096] text-base sm:text-[17px]">
                Access all your teaching tools in one place
              </p>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default FacultyDashboardLayout;
