import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  CalendarCheck,
  FileText,
  CalendarDays,
  MessageSquareWarning,
  HelpCircle,
  BarChart2,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (val: boolean) => void;
  profile: any;
  handleLogout: () => void;
}

const navItems = [
  { label: "Dashboard", path: "/student", icon: LayoutDashboard, color: "text-[#1e50ff]", activeColor: "text-[#1e50ff]" },
  { label: "Attendance", path: "/student/attendance", icon: CalendarCheck, color: "text-[#22c55e]", activeColor: "text-[#1e50ff]" },
  { label: "Assignments", path: "/student/assignments", icon: FileText, color: "text-[#ef4444]", activeColor: "text-[#1e50ff]" },
  { label: "Events", path: "/student/events", icon: CalendarDays, color: "text-[#0ea5e9]", activeColor: "text-[#1e50ff]" },
  { label: "Complaints", path: "/student/complaints", icon: MessageSquareWarning, color: "text-[#eab308]", activeColor: "text-[#1e50ff]" },
  { label: "Notices", path: "/student/notices", icon: HelpCircle, color: "text-[#06b6d4]", activeColor: "text-[#1e50ff]" },
  { label: "Performance", path: "/student/performance", icon: BarChart2, color: "text-[#3b82f6]", activeColor: "text-[#1e50ff]" },
];

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen, profile, handleLogout }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const initials = profile?.fullName
    ? profile.fullName
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase()
    : "ST";

  return (
    <>
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-[260px] bg-white border-r border-[#f0f0f0] flex flex-col transition-transform duration-300 ease-in-out z-50 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
      >
        {/* Logo Section */}
        <div className="flex items-center gap-3 px-6 py-6">
          <div className="w-10 h-10 bg-[#1e44c2] rounded-full flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-xl">D</span>
          </div>
          <h1 className="text-[17px] font-bold text-[#1a202c] tracking-tight">Dronacharya Portal</h1>
        </div>

        {/* Navigation Category */}
        <div className="px-6 mb-2 mt-2">
          <p className="text-[12px] font-semibold tracking-wider uppercase text-[#a0aec0]">Navigation</p>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto w-full">
          {navItems.map(({ label, path, icon: Icon, color, activeColor }) => {
            const isActive = location.pathname === path;
            const itemColor = isActive ? activeColor : color;
            
            return (
              <button
                key={path}
                onClick={() => {
                  navigate(path);
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
                className={`relative w-full flex items-center gap-4 px-4 py-3 rounded-[14px] text-[15px] transition-all duration-200 group ${isActive
                  ? "text-[#1e50ff] font-bold"
                  : "text-[#4a5568] font-medium hover:bg-gray-50"
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-[#eef2ff] rounded-[14px] -z-10"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon
                  id={label}
                  className={`w-[22px] h-[22px] shrink-0 transition-colors ${itemColor}`}
                  strokeWidth={isActive ? 2.5 : 2}
                  fill={isActive ? "#eef2ff" : "none"}
                />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-[#f0f0f0] mt-auto bg-white">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-gray-50 transition-all text-left outline-none group border border-transparent">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-sm overflow-hidden bg-blue-500">
                  {profile?.photoURL ? (
                    <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-[#1a202c] truncate">
                    {profile?.fullName || "Student User"}
                  </p>
                  <p className="text-[12px] text-[#718096] truncate">
                    {profile?.email || "student@example.com"}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" side="right" sideOffset={16}>
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-500 hover:bg-red-50 hover:text-red-600 cursor-pointer p-3 font-semibold"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
