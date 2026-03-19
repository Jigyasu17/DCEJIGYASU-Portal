import AuthForm from "@/components/auth/AuthForm";
import AuthLayout from "@/components/auth/AuthLayout";

const AdminAuth = () => {
  return (
    <AuthLayout 
      title="Admin Portal" 
      subtitle="Manage the institution, students, and faculties with powerful tools."
      characterImage="/assets/admin_character.png"
    >
      <AuthForm mode="admin" />
    </AuthLayout>
  );
};

export default AdminAuth;
