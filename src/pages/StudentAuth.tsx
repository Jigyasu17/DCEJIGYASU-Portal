import AuthForm from "@/components/auth/AuthForm";
import AuthLayout from "@/components/auth/AuthLayout";

const StudentAuth = () => {
  return (
    <AuthLayout 
      title="Student Portal" 
      subtitle="Access your courses, attendance, and grades in a modern 3D experience."
    >
      <AuthForm mode="student" />
    </AuthLayout>
  );
};

export default StudentAuth;
