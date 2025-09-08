import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { Eye, EyeOff, BookOpen, ArrowRight } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { TextureButton } from "../ui/texture-button";
import {
  TextureCardContent,
  TextureCardFooter,
  TextureCardHeader,
  TextureCardStyled,
  TextureCardTitle,
  TextureSeparator,
} from "../ui/texture-card";

const StyledLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      showToast("Login successful!", "success");

      // Wait a bit longer to ensure state is properly updated
      await new Promise((resolve) => setTimeout(resolve, 500));

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      console.log("Login successful, user role:", user.role);

      // Navigate based on role with proper error handling
      switch (user.role) {
        case "STUDENT":
          console.log("Redirecting to student dashboard");
          navigate("/student");
          break;
        case "PROFESSOR":
          console.log("Redirecting to professor dashboard");
          navigate("/professor");
          break;
        case "MANAGEMENT":
          console.log("Redirecting to management dashboard");
          navigate("/management");
          break;
        case "ALUMNI":
          console.log("Redirecting to alumni dashboard");
          navigate("/alumni");
          break;
        default:
          console.log("Unknown role:", user.role, "redirecting to login");
          showToast("Invalid user role. Please contact support.", "error");
          navigate("/login");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      showToast(error.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-green-50 to-emerald-50">
      <div className="w-full max-w-lg">
        <TextureCardStyled className="max-w-lg">
          <TextureCardHeader className="flex flex-col gap-1 items-center justify-center">
            <div className="p-3 bg-emerald-600 rounded-full mb-3">
              <BookOpen className="h-7 w-7 text-white" />
            </div>
            <TextureCardTitle>Welcome Back</TextureCardTitle>
            <p className="text-center text-emerald-600">
              Sign in to your assessment portal
            </p>
          </TextureCardHeader>

          <TextureSeparator />

          <TextureCardContent>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
              id="loginForm"
            >
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Enter your college email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-12"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-emerald-400" />
                    )}
                  </button>
                </div>
              </div>
            </form>
          </TextureCardContent>

          <TextureSeparator />

          <TextureCardFooter>
            <TextureButton
              variant="accent"
              className="w-full"
              type="submit"
              disabled={loading}
              onClick={() => {
                const form = document.getElementById(
                  "loginForm"
                ) as HTMLFormElement;
                if (form) {
                  form.requestSubmit();
                }
              }}
            >
              <div className="flex gap-2 items-center justify-center">
                {loading ? "Signing in..." : "Sign In"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </div>
            </TextureButton>
          </TextureCardFooter>

          <div className="bg-emerald-50 pt-px rounded-b-3xl overflow-hidden">
            <div className="flex flex-col items-center justify-center">
              <div className="py-3 px-6">
                <div className="text-center text-sm text-emerald-700">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </TextureCardStyled>
      </div>
    </div>
  );
};

export default StyledLogin;
