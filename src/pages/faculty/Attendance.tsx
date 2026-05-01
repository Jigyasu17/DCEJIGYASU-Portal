import { useEffect, useState } from "react";
import FacultyDashboardLayout from "@/components/faculty/FacultyDashboardLayout";
import { Card } from "@/components/ui/card";
import { app, auth, db } from "@/integrations/firebase/client";
import { getFirestore, collection, getDocs, addDoc, serverTimestamp, query, where } from "firebase/firestore";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface AttendanceRecord {
  id: string;
  student_id: string;
  studentName?: string;
  subject: string;
  date: string;
  status: string;
}

const FacultyAttendance = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const { toast } = useToast();
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);
  const [isMarkingStudent, setIsMarkingStudent] = useState(false);
  const [studentForm, setStudentForm] = useState({
    student_id: "",
    subject: "",
    date: new Date().toISOString().split("T")[0],
    status: "present"
  });

  const handleStudentAttendance = async () => {
    try {
      if (!studentForm.student_id || !studentForm.subject || !studentForm.date || !studentForm.status) {
        toast({ title: "Error", description: "Please fill all fields.", variant: "destructive" });
        return;
      }
      
      const existingAttendance = await getDocs(
        query(
          collection(db, "attendance"),
          where("student_id", "==", studentForm.student_id),
          where("subject", "==", studentForm.subject),
          where("date", "==", studentForm.date)
        )
      );

      if (!existingAttendance.empty) {
        toast({
          title: "Already marked",
          description: "Attendance for this student and subject is already recorded today.",
          variant: "destructive",
        });
        return;
      }

      await addDoc(collection(db, "attendance"), {
        student_id: studentForm.student_id,
        subject: studentForm.subject,
        date: studentForm.date,
        timestamp: serverTimestamp(),
        status: studentForm.status,
      });

      toast({ title: "Success", description: "Student attendance marked successfully." });
      setIsMarkingStudent(false);
      setStudentForm({ ...studentForm, student_id: "", subject: "" });
      fetchAttendance();
    } catch (error) {
      toast({ title: "Error", description: "Failed to mark student attendance.", variant: "destructive" });
    }
  };

  const handleAttendance = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
        return;
      }

      const currentDate = new Date().toISOString().split("T")[0];

      const existingAttendance = await getDocs(
        query(
          collection(db, "faculty_attendance"),
          where("faculty_id", "==", user.uid),
          where("date", "==", currentDate)
        )
      );

      if (!existingAttendance.empty) {
        toast({
          title: "Already marked",
          description: "Your attendance has already been recorded today.",
          variant: "destructive",
        });
        return;
      }

      await addDoc(collection(db, "faculty_attendance"), {
        faculty_id: user.uid,
        date: currentDate,
        timestamp: serverTimestamp(),
        status: "present",
      });

      toast({
        title: "Success",
        description: "Attendance marked successfully.",
      });
      setIsMarkingAttendance(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark attendance. Please try again later.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        void fetchAttendance();
      } else {
        setAttendance([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchAttendance = async () => {
    const firestore = getFirestore(app);
    const usersSnapshot = await getDocs(collection(firestore, "users"));
    const usersMap: Record<string, string> = {};
    const studentsList: { id: string; name: string }[] = [];
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      const name = data.fullName || data.email || "Unknown Student";
      usersMap[doc.id] = name;
      if (data.role === "student") {
        studentsList.push({ id: doc.id, name });
      }
    });
    setStudents(studentsList);

    const attendanceSnapshot = await getDocs(collection(firestore, "attendance"));

    if (attendanceSnapshot.empty) {
      setAttendance([]);
      return;
    }

    const data = attendanceSnapshot.docs
      .map((doc) => {
        const recordData = doc.data();
        return {
          id: doc.id,
          ...recordData,
          studentName: usersMap[recordData.student_id] || "Unknown Student",
          timestampValue: recordData.timestamp ? recordData.timestamp.toMillis() : 0,
        } as AttendanceRecord & { timestampValue: number };
      })
      .sort((a, b) => b.timestampValue - a.timestampValue);

    setAttendance(data);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "absent":
        return <XCircle className="h-5 w-5 text-destructive" />;
      case "late":
        return <Clock className="h-5 w-5 text-warning" />;
      default:
        return null;
    }
  };

  return (
    <FacultyDashboardLayout title="Student Attendance Records">
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-end">
        <Dialog open={isMarkingStudent} onOpenChange={setIsMarkingStudent}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm">
              Mark Student Attendance
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark Student Attendance</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid gap-2">
                <Label>Student</Label>
                <Select onValueChange={(val) => setStudentForm({ ...studentForm, student_id: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Subject</Label>
                <Select onValueChange={(val) => setStudentForm({ ...studentForm, subject: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Date</Label>
                <Input type="date" value={studentForm.date} onChange={(e) => setStudentForm({ ...studentForm, date: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={studentForm.status} onValueChange={(val) => setStudentForm({ ...studentForm, status: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleStudentAttendance} className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg">
                Submit Attendance
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isMarkingAttendance} onOpenChange={setIsMarkingAttendance}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow-sm">
              Mark My Attendance
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mark Attendance</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-gray-600">Click below to mark your attendance for today.</p>
              <Button onClick={handleAttendance} className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg">
                Mark Present
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <h3 className="mb-4 text-xl font-semibold">All Attendance Records</h3>
        {attendance.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No attendance records found</p>
        ) : (
          <div className="space-y-3">
            {attendance.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-secondary/50"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(record.status)}
                  <div>
                    <p className="font-medium text-foreground">{record.studentName}</p>
                    <p className="text-sm text-muted-foreground">
                      {record.subject} | {record.date ? new Date(record.date).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="text-sm font-medium capitalize">{record.status}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </FacultyDashboardLayout>
  );
};

export default FacultyAttendance;
