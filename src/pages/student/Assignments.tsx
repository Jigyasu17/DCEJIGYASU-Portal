import { useEffect, useState } from "react";
import DashboardLayout from "@/components/student/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, FileText, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  deadline: string;
  file_url?: string;
}

const Assignments = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    const { data } = await supabase
      .from("assignments")
      .select("*")
      .order("deadline", { ascending: true });

    if (data) {
      setAssignments(data);
    }
  };

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  return (
    <DashboardLayout title="Assignments & Tasks">
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No assignments available</p>
          </Card>
        ) : (
          assignments.map((assignment) => (
            <Card key={assignment.id} className="p-6 hover:shadow-elegant transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-foreground">
                      {assignment.title}
                    </h3>
                    {isOverdue(assignment.deadline) && (
                      <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded">
                        Overdue
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-primary font-medium mb-2">
                    {assignment.subject}
                  </p>
                  <p className="text-muted-foreground mb-3">
                    {assignment.description || "No description provided"}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Due: {new Date(assignment.deadline).toLocaleDateString()} at{" "}
                      {new Date(assignment.deadline).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {assignment.file_url && (
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                  <Button size="sm" className="bg-gradient-accent">
                    <Upload className="w-4 h-4 mr-2" />
                    Submit
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
};

export default Assignments;
