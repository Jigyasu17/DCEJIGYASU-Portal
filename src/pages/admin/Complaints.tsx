import { useEffect, useState } from "react";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { app } from "@/integrations/firebase/client";
import { getFirestore, collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    const db = getFirestore(app);
    const q = query(collection(db, "complaints"), where("status", "==", "pending"));
    const querySnapshot = await getDocs(q);
    const complaintsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setComplaints(complaintsData);
  };

  const handleComplaintAction = async (id, status) => {
    const db = getFirestore(app);
    await updateDoc(doc(db, "complaints", id), {
      status,
    });
    fetchComplaints();
  };

  return (
    <AdminDashboardLayout title="Complaints">
      <div className="space-y-4">
        {complaints.map((complaint) => (
          <Card key={complaint.id} className="p-4">
            <h3 className="font-semibold">{complaint.title}</h3>
            <p>{complaint.description}</p>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => handleComplaintAction(complaint.id, "resolved")}>Resolve</Button>
              <Button variant="destructive" size="sm" onClick={() => handleComplaintAction(complaint.id, "rejected")}>Reject</Button>
            </div>
          </Card>
        ))}
      </div>
    </AdminDashboardLayout>
  );
};

export default Complaints;
