import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import StudentAuth from "./pages/StudentAuth";
import AdminAuth from "./pages/AdminAuth";
import FacultyAuth from "./pages/FacultyAuth";
import StudentDashboard from "./pages/student/StudentDashboard";
import Attendance from "./pages/student/Attendance";
import Assignments from "./pages/student/Assignments";
import Events from "./pages/student/Events";
import Complaints from "./pages/student/Complaints";
import Notices from "./pages/student/Notices";
import Performance from "./pages/student/Performance";
import AdminDashboard from "./pages/admin/AdminDashboard";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import FacultyAssignments from "./pages/faculty/Assignments";
import FacultyNotices from "./pages/faculty/Notices";
import FacultyComplaints from "./pages/faculty/Complaints";

const Router = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/student/auth" element={<StudentAuth />} />
    <Route path="/admin/auth" element={<AdminAuth />} />
    <Route path="/faculty/auth" element={<FacultyAuth />} />
    <Route path="/student" element={<StudentDashboard />} />
    <Route path="/student/attendance" element={<Attendance />} />
    <Route path="/student/assignments" element={<Assignments />} />
    <Route path="/student/events" element={<Events />} />
    <Route path="/student/complaints" element={<Complaints />} />
    <Route path="/student/notices" element={<Notices />} />
    <Route path="/student/performance" element={<Performance />} />
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/faculty" element={<FacultyDashboard />} />
    <Route path="/faculty/assignments" element={<FacultyAssignments />} />
    <Route path="/faculty/notices" element={<FacultyNotices />} />
    <Route path="/faculty/complaints" element={<FacultyComplaints />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default Router;
