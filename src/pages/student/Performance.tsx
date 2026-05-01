import { useEffect, useState } from "react";
import DashboardLayout from "@/components/student/DashboardLayout";
import { Card } from "@/components/ui/card";
import { auth, db } from "@/integrations/firebase/client";
import { collection, getDocs, query, where } from "firebase/firestore";

interface AttendanceRecord {
  status: string;
}

interface SubmissionRecord {
  assignment_id: string;
}

const Performance = () => {
  const [summary, setSummary] = useState({
    attendanceRate: 0,
    assignmentsSubmitted: 0,
    attendanceCount: 0,
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        void fetchPerformance(user.uid);
      } else {
        setSummary({ attendanceRate: 0, assignmentsSubmitted: 0, attendanceCount: 0 });
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchPerformance = async (userId: string) => {
    const [attendanceSnapshot, submissionSnapshot] = await Promise.all([
      getDocs(query(collection(db, "attendance"), where("student_id", "==", userId))),
      getDocs(query(collection(db, "submissions"), where("student_id", "==", userId))),
    ]);

    const attendance = attendanceSnapshot.docs.map((doc) => doc.data() as AttendanceRecord);
    const presentCount = attendance.filter((record) => record.status === "present").length;
    const totalAttendance = attendance.length;
    const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

    const submittedAssignments = new Set(
      submissionSnapshot.docs.map((doc) => (doc.data() as SubmissionRecord).assignment_id)
    );

    setSummary({
      attendanceRate,
      assignmentsSubmitted: submittedAssignments.size,
      attendanceCount: totalAttendance,
    });
  };

  return (
    <DashboardLayout title="Performance">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Attendance Rate</p>
          <p className="mt-2 text-3xl font-bold">{summary.attendanceRate}%</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Assignments Submitted</p>
          <p className="mt-2 text-3xl font-bold">{summary.assignmentsSubmitted}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">Attendance Records</p>
          <p className="mt-2 text-3xl font-bold">{summary.attendanceCount}</p>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Performance;
