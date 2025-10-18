import { useEffect, useState } from "react";
import DashboardLayout from "@/components/student/DashboardLayout";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Calendar, MessageSquare, ClipboardCheck, Bell, BarChart } from "lucide-react";

const StudentDashboard = () => {
  const [stats, setStats] = useState({
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [attendance, assignments, events, complaints, notices] = await Promise.all([
      supabase.from("attendance").select("*", { count: "exact", head: true }).eq("student_id", user.id),
      supabase.from("assignments").select("*", { count: "exact", head: true }),
      supabase.from("events").select("*", { count: "exact", head: true }),
      supabase.from("complaints").select("*", { count: "exact", head: true }).eq("student_id", user.id),
      supabase.from("notices").select("*", { count: "exact", head: true }),
    ]);

    setStats({
      attendance: attendance.count || 0,
      assignments: assignments.count || 0,
      events: events.count || 0,
      complaints: complaints.count || 0,
      notices: notices.count || 0,
    });
  };

  const cards = [
    {
      title: "Attendance Records",
      value: stats.attendance,
      icon: BookOpen,
      color: "bg-gradient-primary",
      link: "/student/attendance",
    },
    {
      title: "Active Assignments",
      value: stats.assignments,
      icon: ClipboardCheck,
      color: "bg-gradient-accent",
      link: "/student/assignments",
    },
    {
      title: "Upcoming Events",
      value: stats.events,
      icon: Calendar,
      color: "bg-gradient-gold",
      link: "/student/events",
    },
    {
      title: "My Complaints",
      value: stats.complaints,
      icon: MessageSquare,
      color: "bg-gradient-primary",
      link: "/student/complaints",
    },
    {
      title: "Notices",
      value: stats.notices,
      icon: Bell,
      color: "bg-gradient-accent",
      link: "/student/notices",
    },
    {
      title: "Performance",
      value: "View",
      icon: BarChart,
      color: "bg-gradient-gold",
      link: "/student/performance",
    },
  ];

  return (
    <DashboardLayout title="Student Dashboard">
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

      {/* Welcome Message */}
      <Card className="mt-6 p-6 bg-gradient-primary text-primary-foreground">
        <h3 className="text-2xl font-bold mb-2">Welcome Back!</h3>
        <p className="text-primary-foreground/90">
          Access all your academic resources, track attendance, submit assignments,
          and stay updated with college events and notices.
        </p>
      </Card>
    </DashboardLayout>
  );
};

export default StudentDashboard;
