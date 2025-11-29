import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import StudentAuth from "./pages/StudentAuth";
import AdminAuth from "./pages/AdminAuth";
import FacultyAuth from "./pages/FacultyAuth";

const StudentDashboard = lazy(() => import("./pages/student/StudentDashboard"));
const Attendance = lazy(() => import("./pages/student/Attendance"));
const Assignments = lazy(() => import("./pages/student/Assignments"));
const Events = lazy(() => import("./pages/student/Events"));
const Complaints = lazy(() => import("./pages/student/Complaints"));
const Notices = lazy(() => import("./pages/student/Notices"));
const Performance = lazy(() => import("./pages/student/Performance"));
const Timetable = lazy(() => import("./pages/student/Timetable"));

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminAssignments = lazy(() => import("./pages/admin/Assignments"));
const AdminAttendance = lazy(() => import("./pages/admin/Attendance"));
const AdminComplaints = lazy(() => import("./pages/admin/Complaints"));
const AdminEvents = lazy(() => import("./pages/admin/Events"));
const AdminNotices = lazy(() => import("./pages/admin/Notices"));
const AdminStudents = lazy(() => import("./pages/admin/Students"));

const FacultyDashboard = lazy(() => import("./pages/faculty/FacultyDashboard"));
const FacultyAssignments = lazy(() => import("./pages/faculty/Assignments"));
const FacultyNotices = lazy(() => import("./pages/faculty/Notices"));
const FacultyComplaints = lazy(() => import("./pages/faculty/Complaints"));

const Router = () => (
  <Suspense fallback={<div>Loading...</div>}>
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
      <Route path="/student/timetable" element={<Timetable />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/assignments" element={<AdminAssignments />} />
      <Route path="/admin/attendance" element={<AdminAttendance />} />
      <Route path="/admin/complaints" element={<AdminComplaints />} />
      <Route path="/admin/events" element={<AdminEvents />} />
      <Route path="/admin/notices" element={<AdminNotices />} />
      <Route path="/admin/students" element={<AdminStudents />} />
      <Route path="/faculty" element={<FacultyDashboard />} />
      <Route path="/faculty/assignments" element={<FacultyAssignments />} />
      <Route path="/faculty/notices" element={<FacultyNotices />} />
      <Route path="/faculty/complaints" element={<FacultyComplaints />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

export default Router;
