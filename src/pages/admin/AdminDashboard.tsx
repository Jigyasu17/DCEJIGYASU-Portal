import { useEffect, useState } from "react";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, BookOpen, Calendar, MessageSquare, Bell, ClipboardCheck } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    students: 0,
    attendance: 0,
    assignments: 0,
    events: 0,
    complaints: 0,
    notices: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [students, attendance, assignments, events, complaints, notices] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("attendance").select("*", { count: "exact", head: true }),
      supabase.from("assignments").select("*", { count: "exact", head: true }),
      supabase.from("events").select("*", { count: "exact", head: true }),
      supabase.from("complaints").select("*", { count: "exact", head: true }),
      supabase.from("notices").select("*", { count: "exact", head: true }),
    ]);

    setStats({
      students: students.count || 0,
      attendance: attendance.count || 0,
      assignments: assignments.count || 0,
      events: events.count || 0,
      complaints: complaints.count || 0,
      notices: notices.count || 0,
    });
  };

  const cards = [
    {
      title: "Total Students",
      value: stats.students,
      icon: Users,
      color: "bg-gradient-primary",
      link: "/admin/students",
    },
    {
      title: "Attendance Records",
      value: stats.attendance,
      icon: BookOpen,
      color: "bg-gradient-accent",
      link: "/admin/attendance",
    },
    {
      title: "Assignments",
      value: stats.assignments,
      icon: ClipboardCheck,
      color: "bg-gradient-gold",
      link: "/admin/assignments",
    },
    {
      title: "Events",
      value: stats.events,
      icon: Calendar,
      color: "bg-gradient-primary",
      link: "/admin/events",
    },
    {
      title: "Pending Complaints",
      value: stats.complaints,
      icon: MessageSquare,
      color: "bg-gradient-accent",
      link: "/admin/complaints",
    },
    {
      title: "Notices",
      value: stats.notices,
      icon: Bell,
      color: "bg-gradient-gold",
      link: "/admin/notices",
    },
  ];

  return (
    <AdminDashboardLayout title="Admin Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card
              key={index}
              className="p-6 hover:shadow-elegant transition-all cursor-pointer"
              onClick={() => window.location.href = card.link}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-foreground">
                  {card.value}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground">{card.title}</h3>
            </Card>
          );
        })}
      </div>

      {/* Admin Message */}
      <Card className="mt-6 p-6 bg-warning text-warning-foreground">
        <h3 className="text-2xl font-bold mb-2">Admin Control Panel</h3>
        <p className="opacity-90">
          Manage all aspects of the college portal including students, attendance,
          assignments, events, complaints, and announcements.
        </p>
      </Card>
    </AdminDashboardLayout>
  );
};

export default AdminDashboard;
