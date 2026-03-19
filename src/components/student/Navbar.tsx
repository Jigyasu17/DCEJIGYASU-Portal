import React from "react";
import { Bell, RefreshCw, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavbarProps {
  profile: any;
  onOpenSidebar: () => void;
}

const Navbar = ({ profile, onOpenSidebar }: NavbarProps) => {
  const initials = profile?.fullName
    ? profile.fullName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
    : "ST";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between xl:justify-end px-4 sm:px-8 bg-transparent">
      {/* Mobile Menu Button - Left Side */}
      <button 
        onClick={onOpenSidebar}
        className="md:hidden flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 text-gray-600 hover:text-[#4f46e5]"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Right Side Tools */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 text-gray-500 hover:text-[#4f46e5] transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ef4444] border-2 border-white"></span>
          </span>
        </button>

        {/* Refresh / Sync Action */}
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 text-gray-500 hover:text-[#4f46e5] transition-all hover:rotate-180 duration-500">
          <RefreshCw className="h-4 w-4" />
        </button>

        {/* User Mini Profile Avatar */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 border border-white shadow-sm text-[#4f46e5] font-bold text-sm cursor-pointer hover:shadow-md transition-shadow">
          {initials}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
