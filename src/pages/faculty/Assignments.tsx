import FacultyDashboardLayout from "@/components/faculty/FacultyDashboardLayout";
import AssignmentManager from "@/components/faculty/AssignmentManager";

const Assignments = () => {
  return (
    <FacultyDashboardLayout title="Assignments">
      <AssignmentManager />
    </FacultyDashboardLayout>
  );
};

export default Assignments;
