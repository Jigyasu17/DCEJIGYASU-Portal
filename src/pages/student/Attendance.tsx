import { useEffect, useState } from "react";
import DashboardLayout from "@/components/student/DashboardLayout";
import { Card } from "@/components/ui/card";
import { app, auth } from "@/integrations/firebase/client";
import { getFirestore, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface AttendanceRecord {
  id: string;
  subject: string;
  date: string;
  status: string;
}

const Attendance = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, percentage: 0 });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchAttendance();
      } else {
        setAttendance([]);
        setStats({ present: 0, absent: 0, late: 0, percentage: 0 });
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchAttendance = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const db = getFirestore(app);
    const attendanceCol = collection(db, "attendance");
    const q = query(attendanceCol, where("student_id", "==", user.uid), orderBy("date", "desc"));
    const attendanceSnapshot = await getDocs(q);

    if (!attendanceSnapshot.empty) {
      const data = attendanceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AttendanceRecord));
      setAttendance(data);
      const present = data.filter((r) => r.status === "present").length;
      const absent = data.filter((r) => r.status === "absent").length;
      const late = data.filter((r) => r.status === "late").length;
      const total = data.length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

      setStats({ present, absent, late, percentage });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "absent":
        return <XCircle className="w-5 h-5 text-destructive" />;
      case "late":
        return <Clock className="w-5 h-5 text-warning" />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout title="Attendance Management">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-gradient-primary text-primary-foreground">
          <div className="text-3xl font-bold">{stats.percentage}%</div>
          <div className="text-sm opacity-90">Overall Attendance</div>
        </Card>
        <Card className="p-4">
          <div className="text-3xl font-bold text-success">{stats.present}</div>
          <div className="text-sm text-muted-foreground">Present</div>
        </Card>
        <Card className="p-4">
          <div className="text-3xl font-bold text-destructive">{stats.absent}</div>
          <div className="text-sm text-muted-foreground">Absent</div>
        </Card>
        <Card className="p-4">
          <div className="text-3xl font-bold text-warning">{stats.late}</div>
          <div className="text-sm text-muted-foreground">Late</div>
        </Card>
      </div>

      {/* Attendance Records */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Attendance History</h3>
        {attendance.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No attendance records found
          </p>
        ) : (
          <div className="space-y-3">
            {attendance.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(record.status)}
                  <div>
                    <p className="font-medium text-foreground">{record.subject}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(record.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="capitalize text-sm font-medium">
                  {record.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
};

export default Attendance;
