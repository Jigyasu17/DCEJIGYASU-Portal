import AuthForm from "@/components/auth/AuthForm";
import AuthLayout from "@/components/auth/AuthLayout";

const FacultyAuth = () => {
  return (
    <AuthLayout
      title="Faculty Portal"
      subtitle="Manage classes, mark attendance, and monitor students effortlessly."
      characterImage="/assets/faculty_character.png"
    >
      <AuthForm mode="faculty" />
    </AuthLayout>
  );
};

export default FacultyAuth;
