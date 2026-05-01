import { useEffect, useState } from "react";
import DashboardLayout from "@/components/student/DashboardLayout";
import { Card } from "@/components/ui/card";
import { auth, db } from "@/integrations/firebase/client";
import { collection, getDocs, query, where } from "firebase/firestore";

interface Complaint {
  id: string;
  title: string;
  description: string;
  status: string;
}

const Complaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        void fetchComplaints(user.uid);
      } else {
        setComplaints([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchComplaints = async (userId: string) => {
    const complaintsQuery = query(collection(db, "complaints"), where("student_id", "==", userId));
    const querySnapshot = await getDocs(complaintsQuery);
    const complaintsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setComplaints(complaintsData);
  };

  return (
    <DashboardLayout title="My Complaints">
      <div className="space-y-4">
        {complaints.map((complaint) => (
          <Card key={complaint.id} className="p-4">
            <h3 className="font-semibold">{complaint.title}</h3>
            <p>{complaint.description}</p>
            <p
              className={`text-sm ${
                complaint.status === "pending"
                  ? "text-yellow-500"
                  : complaint.status === "resolved"
                    ? "text-green-500"
                    : "text-red-500"
              }`}
            >
              Status: {complaint.status}
            </p>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Complaints;
