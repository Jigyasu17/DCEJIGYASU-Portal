import { useEffect, useState } from "react";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { app } from "@/integrations/firebase/client";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { Users, Loader2 } from "lucide-react";

interface Student {
  id: string;
  fullName: string;
  email: string;
}

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const db = getFirestore(app);
        const q = query(collection(db, "users"), where("role", "==", "student"));
        const querySnapshot = await getDocs(q);
        const studentsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Student[];
        
        setStudents(studentsData);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return (
    <AdminDashboardLayout title="Students">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Student Directory</h2>
          <p className="text-muted-foreground">Manage and view all registered students.</p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No students found</h3>
            <p className="text-sm text-gray-500 mt-1">There are currently no students registered in the system.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <Card key={student.id} className="p-6 flex items-start space-x-4 hover:shadow-md transition-shadow">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-lg">
                  {student.fullName ? student.fullName.charAt(0).toUpperCase() : 'S'}
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-semibold text-lg truncate whitespace-nowrap" title={student.fullName}>
                    {student.fullName || "Unknown Student"}
                  </h3>
                  <p className="text-gray-500 text-sm truncate whitespace-nowrap" title={student.email}>
                    {student.email}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  );
};

export default Students;
