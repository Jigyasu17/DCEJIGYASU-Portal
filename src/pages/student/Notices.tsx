import { useEffect, useState } from "react";
import DashboardLayout from "@/components/student/DashboardLayout";
import { Card } from "@/components/ui/card";
import { app } from "@/integrations/firebase/client";
import { getFirestore, collection, getDocs, query } from "firebase/firestore";
import { Button } from "@/components/ui/button";

const Notices = () => {
  const [notices, setNotices] = useState<any[]>([]);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    const db = getFirestore(app);
    const q = query(collection(db, "notices"));
    const querySnapshot = await getDocs(q);
    const noticesData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    // Sort client-side for compatibility with both createdAt and created_at
    noticesData.sort((a, b) => {
        const aDate = a.createdAt || a.created_at;
        const bDate = b.createdAt || b.created_at;
        if (aDate && bDate) {
            return bDate.seconds - aDate.seconds;
        }
        return 0;
    });
    setNotices(noticesData);
  };

  return (
    <DashboardLayout title="Notices">
      <div className="space-y-4">
        {notices.map((notice) => (
          <Card key={notice.id} className="p-4">
            <h3 className="font-semibold">{notice.title}</h3>
            <p>{notice.content || notice.description}</p>
            {notice.fileURL && (
                <a href={notice.fileURL} target="_blank" rel="noopener noreferrer">
                  <Button variant="link">View Circular</Button>
                </a>
              )}
            {(notice.createdAt || notice.created_at) && (
                <p className="text-sm text-muted-foreground">
                  Posted on: {new Date((notice.createdAt || notice.created_at).seconds * 1000).toLocaleDateString()}
                </p>
            )}
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Notices;
