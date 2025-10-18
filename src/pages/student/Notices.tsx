import { useEffect, useState } from "react";
import DashboardLayout from "@/components/student/DashboardLayout";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Bell, AlertCircle } from "lucide-react";

interface Notice {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  created_at: string;
}

const Notices = () => {
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    const { data } = await supabase
      .from("notices")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setNotices(data);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-destructive text-destructive-foreground";
      case "high":
        return "bg-warning text-warning-foreground";
      case "normal":
        return "bg-primary text-primary-foreground";
      case "low":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-secondary";
    }
  };

  return (
    <DashboardLayout title="Notice Board">
      <div className="space-y-4">
        {notices.length === 0 ? (
          <Card className="p-12 text-center">
            <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No notices available</p>
          </Card>
        ) : (
          notices.map((notice) => (
            <Card key={notice.id} className="p-6 hover:shadow-elegant transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {notice.priority === "urgent" || notice.priority === "high" ? (
                    <AlertCircle className="w-6 h-6 text-destructive" />
                  ) : (
                    <Bell className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold text-foreground">
                      {notice.title}
                    </h3>
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(notice.priority)}`}>
                        {notice.priority}
                      </span>
                      <span className="text-xs bg-secondary px-2 py-1 rounded">
                        {notice.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-3 whitespace-pre-wrap">
                    {notice.content}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Posted on {new Date(notice.created_at).toLocaleDateString()} at{" "}
                    {new Date(notice.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notices;
