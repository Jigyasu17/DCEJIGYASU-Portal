import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/integrations/firebase/client";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

type AuthMode = "student" | "admin" | "faculty";

interface AuthFormProps {
  mode: AuthMode;
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong. Please try again.";

const AuthForm = ({ mode }: AuthFormProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const portalTitle =
    mode === "admin" ? "Admin Portal" : mode === "student" ? "Student Portal" : "Faculty Portal";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setLoggedInUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loggedInUser) {
      return;
    }

    const checkUserAndRedirect = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", loggedInUser.uid));

        if (!userDoc.exists()) {
          toast({
            variant: "destructive",
            title: "Profile missing",
            description: "Your account exists, but the portal profile was not found. Please contact support.",
          });
          await signOut(auth);
          setLoggedInUser(null);
          setIsLoading(false);
          return;
        }

        const userData = userDoc.data();

        if (userData?.role && userData.role !== mode) {
          toast({
            title: "Already Logged In",
            description: `You are logged in as a ${userData.role}. Redirecting to your dashboard...`,
          });
          setIsLoading(false);
          navigate(`/${userData.role}`);
          return;
        }

        toast({
          title: "Login Successful!",
          description: `Welcome back to ${portalTitle}. Redirecting...`,
        });
        setIsLoading(false);
        navigate(`/${mode}`);
      } catch (error: unknown) {
        toast({
          variant: "destructive",
          title: "Error",
          description: getErrorMessage(error),
        });
        await signOut(auth);
        setLoggedInUser(null);
        setIsLoading(false);
      }
    };

    void checkUserAndRedirect();
  }, [loggedInUser, mode, navigate, portalTitle, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setLoggedInUser(userCredential.user);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user) {
        await setDoc(doc(db, "users", user.uid), {
          role: mode,
          fullName,
          email,
        });
        setLoggedInUser(user);
      }
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: isLogin ? "Login failed" : "Signup failed",
        description: getErrorMessage(error),
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_10px_40px_-15px_rgba(0,0,0,0.3)]">
      <div className="bg-[#5648f5] px-6 py-5 text-center">
        <h2 className="mb-1 text-xl font-bold uppercase tracking-widest text-white">
          {isLogin ? "LOG IN" : "SIGN UP"}
        </h2>
        <p className="text-sm font-medium text-blue-200">{portalTitle}</p>
      </div>

      <div className="p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={isLoading}
                className="mt-1"
              />
            </div>
          )}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="pr-10"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-[#5648f5] focus:outline-none"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#5648f5] text-white hover:bg-[#4a3fe0]"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait...
              </>
            ) : (
              <>{isLogin ? "Sign In" : "Sign Up"}</>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-[#5648f5] hover:underline"
            disabled={isLoading}
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-sm font-medium text-gray-400 transition-colors hover:text-gray-600"
          >
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
