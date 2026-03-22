import { useEffect, useState } from "react";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { app } from "@/integrations/firebase/client";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { CheckCircle, XCircle, Clock, Loader2, Users } from "lucide-react";

interface FacultyAttendanceRecord {
  id: string;
  faculty_id: string;
  facultyName?: string;
  date: string;
  status: string;
  timestampValue: number;
}

const Attendance = () => {
  const [attendance, setAttendance] = useState<FacultyAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const db = getFirestore(app);
      
      // Fetch users to map faculty names
      const usersCol = collection(db, "users");
      const usersSnapshot = await getDocs(usersCol);
      const usersMap: Record<string, string> = {};
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        usersMap[doc.id] = data.fullName || data.email || "Unknown Faculty";
      });

      const attendanceCol = collection(db, "faculty_attendance");
      const attendanceSnapshot = await getDocs(attendanceCol);

      if (!attendanceSnapshot.empty) {
        let data = attendanceSnapshot.docs.map(doc => {
          const recordData = doc.data();
          return {
            id: doc.id,
            ...recordData,
            facultyName: usersMap[recordData.faculty_id] || "Unknown Faculty",
            timestampValue: recordData.timestamp ? recordData.timestamp.toMillis() : 0
          } as FacultyAttendanceRecord;
        });
        
        // Sort client-side by newest first
        data.sort((a, b) => b.timestampValue - a.timestampValue);
        
        setAttendance(data);
      } else {
        setAttendance([]);
      }
    } catch (error) {
      console.error("Error fetching faculty attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "absent":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "late":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <AdminDashboardLayout title="Faculty Attendance">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Faculty Attendance Records</h2>
          <p className="text-muted-foreground">Monitor daily attendance marked by the faculty.</p>
        </div>
        
        {loading ? (
          <div className="flex justify-center flex-col items-center h-40 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-500 font-medium">Loading records...</p>
          </div>
        ) : (
          <Card className="p-6">
            {attendance.length === 0 ? (
              <div className="text-center py-10">
                <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900">No records found</h3>
                <p className="text-sm text-gray-500 mt-1">Faculty attendance records will appear here once marked.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {attendance.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {getStatusIcon(record.status)}
                      <div>
                        <p className="font-semibold text-gray-900">{record.facultyName}</p>
                        <p className="text-sm text-gray-500 font-medium tracking-wide">
                          {record.date ? new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="capitalize text-sm font-bold text-gray-700 bg-gray-100 px-4 py-1.5 rounded-full">
                         {record.status}
                       </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default Attendance;
