import { useEffect, useState } from "react";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { app } from "@/integrations/firebase/client";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { CheckCircle, XCircle, Clock, Loader2, Users, UserCheck } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FacultyAttendanceRecord {
  id: string;
  faculty_id: string;
  facultyName?: string;
  date: string;
  status: string;
  timestampValue: number;
}

interface StudentAttendanceRecord {
  id: string;
  student_id: string;
  studentName?: string;
  subject: string;
  date: string;
  status: string;
  timestampValue: number;
}

const Attendance = () => {
  const [facultyAttendance, setFacultyAttendance] = useState<FacultyAttendanceRecord[]>([]);
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const db = getFirestore(app);
      
      // Fetch users to map names
      const usersCol = collection(db, "users");
      const usersSnapshot = await getDocs(usersCol);
      const usersMap: Record<string, string> = {};
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        usersMap[doc.id] = data.fullName || data.email || "Unknown User";
      });

      // Fetch Faculty Attendance
      const facultyCol = collection(db, "faculty_attendance");
      const facultySnapshot = await getDocs(facultyCol);
      let facultyData: FacultyAttendanceRecord[] = [];
      if (!facultySnapshot.empty) {
        facultyData = facultySnapshot.docs.map(doc => {
          const recordData = doc.data();
          return {
            id: doc.id,
            ...recordData,
            facultyName: usersMap[recordData.faculty_id] || "Unknown Faculty",
            timestampValue: recordData.timestamp ? recordData.timestamp.toMillis() : 0
          } as FacultyAttendanceRecord;
        });
        facultyData.sort((a, b) => b.timestampValue - a.timestampValue);
      }
      setFacultyAttendance(facultyData);

      // Fetch Student Attendance
      const studentCol = collection(db, "attendance");
      const studentSnapshot = await getDocs(studentCol);
      let studentData: StudentAttendanceRecord[] = [];
      if (!studentSnapshot.empty) {
        studentData = studentSnapshot.docs.map(doc => {
          const recordData = doc.data();
          return {
            id: doc.id,
            ...recordData,
            studentName: usersMap[recordData.student_id] || "Unknown Student",
            timestampValue: recordData.timestamp ? recordData.timestamp.toMillis() : 0
          } as StudentAttendanceRecord;
        });
        studentData.sort((a, b) => b.timestampValue - a.timestampValue);
      }
      setStudentAttendance(studentData);

    } catch (error) {
      console.error("Error fetching attendance records:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present": return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "absent": return <XCircle className="w-5 h-5 text-red-500" />;
      case "late": return <Clock className="w-5 h-5 text-yellow-500" />;
      default: return null;
    }
  };

  return (
    <AdminDashboardLayout title="Attendance Records">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">System Attendance Records</h2>
          <p className="text-muted-foreground">Monitor attendance for both students and faculty members.</p>
        </div>
        
        {loading ? (
          <div className="flex justify-center flex-col items-center h-40 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-gray-500 font-medium">Loading records...</p>
          </div>
        ) : (
          <Tabs defaultValue="students" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
              <TabsTrigger value="students">Student Attendance ({studentAttendance.length})</TabsTrigger>
              <TabsTrigger value="faculty">Faculty Attendance ({facultyAttendance.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="students">
              <Card className="p-6">
                {studentAttendance.length === 0 ? (
                  <div className="text-center py-10">
                    <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No student records</h3>
                    <p className="text-sm text-gray-500 mt-1">Student attendance records will appear here once marked by faculty.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {studentAttendance.map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          {getStatusIcon(record.status)}
                          <div>
                            <p className="font-semibold text-gray-900">{record.studentName}</p>
                            <p className="text-sm text-gray-500 font-medium tracking-wide">
                              {record.subject} • {record.date ? new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
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
            </TabsContent>
            
            <TabsContent value="faculty">
              <Card className="p-6">
                {facultyAttendance.length === 0 ? (
                  <div className="text-center py-10">
                    <UserCheck className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No faculty records</h3>
                    <p className="text-sm text-gray-500 mt-1">Faculty attendance records will appear here once marked.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {facultyAttendance.map((record) => (
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
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default Attendance;
