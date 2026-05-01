import DashboardLayout from "@/components/student/DashboardLayout";
import { Card } from "@/components/ui/card";

const schedule = [
  { day: "Monday", subjects: ["Mathematics", "Physics", "Computer Science"] },
  { day: "Tuesday", subjects: ["Chemistry", "English", "Mathematics"] },
  { day: "Wednesday", subjects: ["Physics", "Computer Science", "English"] },
  { day: "Thursday", subjects: ["Chemistry", "Mathematics", "Physics"] },
  { day: "Friday", subjects: ["Computer Science", "English", "Chemistry"] },
];

const Timetable = () => {
  return (
    <DashboardLayout title="Timetable">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {schedule.map((entry) => (
          <Card key={entry.day} className="p-6">
            <h3 className="text-lg font-semibold">{entry.day}</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {entry.subjects.map((subject) => (
                <li key={subject}>{subject}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Timetable;
