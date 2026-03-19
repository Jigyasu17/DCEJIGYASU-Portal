import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
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

  const getPortalTitle = () => {
    switch (mode) {
      case "admin":
        return "Admin Portal";
      case "student":
        return "Student Portal";
      case "faculty":
        return "Faculty Portal";
      default:
        return "";
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setLoggedInUser(user);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loggedInUser) {
      const checkUserAndRedirect = async () => {
        try {
          const userDoc = await getDoc(doc(db, "users", loggedInUser.uid));

          if (!userDoc.exists()) {
            await setDoc(doc(db, "users", loggedInUser.uid), {
              role: mode,
              email: loggedInUser.email,
              fullName: loggedInUser.email?.split('@')[0] || "New User",
            });

            toast({
              title: "Account Finalized",
              description: `Your account is now active. Welcome to ${getPortalTitle()}.`,
            });
            setIsLoading(false);
            navigate(`/${mode}`);
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
          } else {
            toast({
              title: "Login Successful!",
              description: `Welcome back to ${getPortalTitle()}. Redirecting...`,
            });
            setIsLoading(false);
            navigate(`/${mode}`);
          }
        } catch (error: any) {
          toast({
            variant: "destructive",
            title: "Error",
            description: error.message,
          });
          await signOut(auth);
          setLoggedInUser(null);
          setIsLoading(false);
        }
      };
      checkUserAndRedirect();
    }
  }, [loggedInUser, mode, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        setLoggedInUser(userCredential.user);
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        if (user) {
          await setDoc(doc(db, "users", user.uid), {
            role: mode,
            fullName: fullName,
            email: email,
          });
          setLoggedInUser(user);
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: isLogin ? "Login failed" : "Signup failed",
        description: error.message,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.3)] w-full overflow-hidden border border-gray-100">
      {/* Distinct Blue Header */}
      <div className="bg-[#5648f5] py-5 px-6 text-center">
        <h2 className="text-xl font-bold text-white tracking-widest uppercase mb-1">
          {isLogin ? "LOG IN" : "SIGN UP"}
        </h2>
        <p className="text-blue-200 text-sm font-medium">
          {getPortalTitle()}
        </p>
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#5648f5] focus:outline-none transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#5648f5] hover:bg-[#4a3fe0] text-white"
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
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors"
          >
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;