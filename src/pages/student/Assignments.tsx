import { useEffect, useState } from "react";
import DashboardLayout from "@/components/student/DashboardLayout";
import { Card } from "@/components/ui/card";
import { app } from "@/integrations/firebase/client";
import { getFirestore, collection, getDocs, query } from "firebase/firestore";

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    const db = getFirestore(app);
    const q = query(collection(db, "assignments"));
    const querySnapshot = await getDocs(q);
    const assignmentsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setAssignments(assignmentsData);
  };

  return (
    <DashboardLayout title="Assignments">
      <div className="space-y-4">
        {assignments.map((assignment) => (
          <Card key={assignment.id} className="p-4">
            <h3 className="font-semibold">{assignment.title}</h3>
            <p>{assignment.description}</p>
            <p className="text-sm text-gray-500">Subject: {assignment.subject}</p>
            <p className="text-sm text-gray-500">Deadline: {new Date(assignment.deadline.seconds * 1000).toLocaleString()}</p>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Assignments;
