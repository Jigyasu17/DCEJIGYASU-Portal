import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "@/integrations/firebase/client";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
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

          if (userData?.role !== mode) {
            await signOut(auth);
            toast({
              variant: "destructive",
              title: "Access Denied",
              description: `You don't have ${mode} access.`,
            });
            setLoggedInUser(null);
            setIsLoading(false);
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
    <Card className="p-8 max-w-md w-full shadow-elegant">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          {getPortalTitle()}
        </h2>
        <p className="text-muted-foreground">
          {isLogin ? "Sign in to continue" : "Create your account"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="mt-1"
            minLength={6}
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-primary"
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
          className="text-sm text-primary hover:underline"
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
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to home
        </button>
      </div>
    </Card>
  );
};

export default AuthForm;