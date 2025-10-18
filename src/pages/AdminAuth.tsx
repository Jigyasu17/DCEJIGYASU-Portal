import AuthForm from "@/components/auth/AuthForm";

const AdminAuth = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background flex items-center justify-center p-4">
      <AuthForm mode="admin" />
    </div>
  );
};

export default AdminAuth;
