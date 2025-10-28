import { useEffect, useState } from "react";
import FacultyDashboardLayout from "@/components/faculty/FacultyDashboardLayout";
import { Card } from "@/components/ui/card";
import { app, auth } from "@/integrations/firebase/client";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const db = getFirestore(app);
    const q = query(collection(db, "complaints"), where("faculty_id", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const complaintsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setComplaints(complaintsData);
  };

  return (
    <FacultyDashboardLayout title="My Complaints">
      <div className="space-y-4">
        {complaints.map((complaint) => (
          <Card key={complaint.id} className="p-4">
            <h3 className="font-semibold">{complaint.title}</h3>
            <p>{complaint.description}</p>
            <p className={`text-sm ${complaint.status === 'pending' ? 'text-yellow-500' : complaint.status === 'resolved' ? 'text-green-500' : 'text-red-500'}`}>
              Status: {complaint.status}
            </p>
          </Card>
        ))}
      </div>
    </FacultyDashboardLayout>
  );
};

export default Complaints;
