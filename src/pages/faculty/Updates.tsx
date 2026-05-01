import { useEffect, useState } from "react";
import FacultyDashboardLayout from "@/components/faculty/FacultyDashboardLayout";
import { Card } from "@/components/ui/card";
import { db } from "@/integrations/firebase/client";
import { collection, getDocs, query } from "firebase/firestore";

interface UpdateItem {
  id: string;
  title?: string;
  description?: string;
  content?: string;
  createdAt?: { seconds?: number };
  created_at?: { seconds?: number };
}

const Updates = () => {
  const [updates, setUpdates] = useState<UpdateItem[]>([]);

  useEffect(() => {
    void fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    const snapshot = await getDocs(query(collection(db, "notices")));
    const updatesData = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => {
        const aDate = a.createdAt || a.created_at;
        const bDate = b.createdAt || b.created_at;
        if (aDate?.seconds && bDate?.seconds) {
          return bDate.seconds - aDate.seconds;
        }
        return 0;
      });

    setUpdates(updatesData);
  };

  return (
    <FacultyDashboardLayout title="Updates">
      <div className="space-y-4">
        {updates.length === 0 ? (
          <Card className="p-6">
            <p className="text-muted-foreground">No updates have been posted yet.</p>
          </Card>
        ) : (
          updates.map((update) => (
            <Card key={update.id} className="p-6">
              <h3 className="font-semibold">{update.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {update.description || update.content}
              </p>
            </Card>
          ))
        )}
      </div>
    </FacultyDashboardLayout>
  );
};

export default Updates;
