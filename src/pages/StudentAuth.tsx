import AuthForm from "@/components/auth/AuthForm";

const StudentAuth = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background flex items-center justify-center p-4">
      <AuthForm mode="student" />
    </div>
  );
};

export default StudentAuth;
