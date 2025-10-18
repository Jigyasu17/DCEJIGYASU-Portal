import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import StudentAuth from "./pages/StudentAuth";
import AdminAuth from "./pages/AdminAuth";
import StudentDashboard from "./pages/student/StudentDashboard";
import Attendance from "./pages/student/Attendance";
import Assignments from "./pages/student/Assignments";
import Events from "./pages/student/Events";
import Complaints from "./pages/student/Complaints";
import Notices from "./pages/student/Notices";
import Performance from "./pages/student/Performance";
import AdminDashboard from "./pages/admin/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/student/auth" element={<StudentAuth />} />
          <Route path="/admin/auth" element={<AdminAuth />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/attendance" element={<Attendance />} />
          <Route path="/student/assignments" element={<Assignments />} />
          <Route path="/student/events" element={<Events />} />
          <Route path="/student/complaints" element={<Complaints />} />
          <Route path="/student/notices" element={<Notices />} />
          <Route path="/student/performance" element={<Performance />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
