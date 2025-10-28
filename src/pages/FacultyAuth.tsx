import AuthForm from "@/components/auth/AuthForm";

const FacultyAuth = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <AuthForm mode="faculty" />
    </div>
  );
};

export default FacultyAuth;
