import { useEffect, useState } from "react";
import FacultyDashboardLayout from "@/components/faculty/FacultyDashboardLayout";
import { Card } from "@/components/ui/card";
import { app, auth } from "@/integrations/firebase/client";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface AttendanceRecord {
  id: string;
  student_id: string;
  studentName?: string;
  subject: string;
  date: string;
  status: string;
}

const FacultyAttendance = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchAttendance();
      } else {
        setAttendance([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchAttendance = async () => {
    const db = getFirestore(app);
    
    // Fetch users for mapping
    const usersCol = collection(db, "users");
    const usersSnapshot = await getDocs(usersCol);
    const usersMap: Record<string, string> = {};
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      usersMap[doc.id] = data.fullName || data.email || "Unknown Student";
    });

    const attendanceCol = collection(db, "attendance");
    const attendanceSnapshot = await getDocs(attendanceCol);

    if (!attendanceSnapshot.empty) {
      let data = attendanceSnapshot.docs.map(doc => {
        const recordData = doc.data();
        return {
          id: doc.id,
          ...recordData,
          studentName: usersMap[recordData.student_id] || "Unknown Student",
          timestampValue: recordData.timestamp ? recordData.timestamp.toMillis() : 0
        } as AttendanceRecord & { timestampValue: number };
      });
      
      // Sort client-side so documents missing timestamp are not dropped
      data.sort((a, b) => b.timestampValue - a.timestampValue);
      
      setAttendance(data);
    } else {
      setAttendance([]);
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
    <FacultyDashboardLayout title="Student Attendance Records">
      {/* Attendance Records */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">All Attendance Records</h3>
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
                    <p className="font-medium text-foreground">{record.studentName}</p>
                    <p className="text-sm text-muted-foreground">
                      {record.subject} • {record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}
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
    </FacultyDashboardLayout>
  );
};

export default FacultyAttendance;
