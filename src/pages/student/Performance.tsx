import { useEffect, useState } from "react";
import DashboardLayout from "@/components/student/DashboardLayout";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, TrendingUp } from "lucide-react";

interface Mark {
  id: string;
  subject: string;
  semester: number;
  marks_obtained: number;
  total_marks: number;
  exam_type: string;
}

const Performance = () => {
  const [marks, setMarks] = useState<Mark[]>([]);
  const [average, setAverage] = useState(0);

  useEffect(() => {
    fetchMarks();
  }, []);

  const fetchMarks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("marks")
      .select("*")
      .eq("student_id", user.id)
      .order("semester", { ascending: false });

    if (data) {
      setMarks(data);
      
      // Calculate average percentage
      if (data.length > 0) {
        const totalPercentage = data.reduce((sum, mark) => {
          const percentage = (mark.marks_obtained / mark.total_marks) * 100;
          return sum + percentage;
        }, 0);
        setAverage(Math.round(totalPercentage / data.length));
      }
    }
  };

  const getPercentage = (obtained: number, total: number) => {
    return Math.round((obtained / total) * 100);
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C";
    return "F";
  };

  return (
    <DashboardLayout title="Performance Analytics">
      {/* Summary Card */}
      <Card className="p-6 mb-6 bg-gradient-primary text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Overall Performance</h3>
            <p className="text-primary-foreground/90">
              Your average score across all subjects
            </p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold">{average}%</div>
            <div className="text-sm opacity-90">Average</div>
          </div>
        </div>
      </Card>

      {/* Marks Table */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold">Academic Records</h3>
        </div>

        {marks.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No performance data available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-sm font-semibold">Semester</th>
                  <th className="text-left p-3 text-sm font-semibold">Subject</th>
                  <th className="text-left p-3 text-sm font-semibold">Exam Type</th>
                  <th className="text-right p-3 text-sm font-semibold">Marks</th>
                  <th className="text-right p-3 text-sm font-semibold">Percentage</th>
                  <th className="text-right p-3 text-sm font-semibold">Grade</th>
                </tr>
              </thead>
              <tbody>
                {marks.map((mark) => {
                  const percentage = getPercentage(mark.marks_obtained, mark.total_marks);
                  const grade = getGrade(percentage);
                  
                  return (
                    <tr key={mark.id} className="border-b border-border hover:bg-secondary/30">
                      <td className="p-3 text-sm">{mark.semester}</td>
                      <td className="p-3 text-sm font-medium">{mark.subject}</td>
                      <td className="p-3 text-sm capitalize">{mark.exam_type}</td>
                      <td className="p-3 text-sm text-right">
                        {mark.marks_obtained}/{mark.total_marks}
                      </td>
                      <td className="p-3 text-sm text-right font-medium">{percentage}%</td>
                      <td className="p-3 text-sm text-right">
                        <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-semibold">
                          {grade}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
};

export default Performance;
