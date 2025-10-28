import { useEffect, useState } from "react";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card } from "@/components/ui/card";
import { app } from "@/integrations/firebase/client";
import { getFirestore, collection, getDocs, query, orderBy } from "firebase/firestore";

const Notices = () => {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    const db = getFirestore(app);
    const q = query(collection(db, "notices"), orderBy("created_at", "desc"));
    const querySnapshot = await getDocs(q);
    const noticesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setNotices(noticesData);
  };

  return (
    <AdminDashboardLayout title="Notices">
      <div className="space-y-4">
        {notices.map((notice) => (
          <Card key={notice.id} className="p-4">
            <h3 className="font-semibold">{notice.title}</h3>
            <p>{notice.description}</p>
          </Card>
        ))}
      </div>
    </AdminDashboardLayout>
  );
};

export default Notices;
