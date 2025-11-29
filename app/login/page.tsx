"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Lock, AlertCircle } from "lucide-react";
import { login } from "@/actions/auth/login";
import { toast } from "sonner";
import AnimatedSection from "@/components/animated-section";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(username, password);

      if (result?.error) {
        // Show specific error messages with reddish toast
        if (
          result.error.toLowerCase().includes("invalid") ||
          result.error.toLowerCase().includes("incorrect") ||
          result.error.toLowerCase().includes("wrong")
        ) {
          toast.error(
            "Invalid username or password. Please check your credentials and try again.",
            {
              duration: 5000,
              description:
                "Make sure you're using the correct admin credentials.",
            }
          );
        } else if (result.error.toLowerCase().includes("many")) {
          toast.error(
            "Too many login attempts. Please wait before trying again.",
            {
              duration: 6000,
              description:
                "Your account has been temporarily locked for security.",
            }
          );
        } else if (
          result.error.toLowerCase().includes("network") ||
          result.error.toLowerCase().includes("connection")
        ) {
          toast.error(
            "Connection error. Please check your internet connection.",
            {
              duration: 5000,
              description: "Unable to connect to the authentication server.",
            }
          );
        } else {
          toast.error("Authentication failed", {
            duration: 5000,
            description: result.error,
          });
        }
        setIsLoading(false);
        return;
      }

      if (result?.success) {
        router.push("/admin");
        setIsLoading(false);
        return;
      }

      toast.error("Authentication failed", {
        duration: 5000,
        description: "Unexpected response received. Please try again.",
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An unexpected error occurred", {
        duration: 5000,
        description:
          "Please try again. If the problem persists, contact your system administrator.",
        action: {
          label: "Retry",
          onClick: () => {
            setIsLoading(false);
          },
        },
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AnimatedSection>
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-orange-500/20 text-orange-400 border-orange-500/30 text-sm">
              Admin Access
            </Badge>
            <h1 className="text-3xl font-bold mb-2">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                GTD Media Admin
              </span>
            </h1>
            <p className="text-gray-400">Sign in to access the admin panel</p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={100}>
          <Card className="bg-gradient-to-br from-gray-900 to-black border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-white">
                <Lock className="w-5 h-5 text-orange-400" />
                Admin Login
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-300">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-orange-500/50 focus:ring-orange-500/20"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-orange-500/50 focus:ring-orange-500/20 pr-10"
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !username || !password}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Signing in...
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </AnimatedSection>

        <AnimatedSection delay={200}>
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Authorized personnel only. Contact system administrator for
              access.
            </p>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
