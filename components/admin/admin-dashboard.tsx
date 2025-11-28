"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Image,
  Video,
  MessageSquare,
  LogOut,
  User,
  Mail,
  Database,
  Home,
} from "lucide-react";
import { logout } from "@/actions/auth/logout";
import { AdminUser } from "@/actions/auth/user";
import { toast } from "sonner";
import AnimatedSection from "@/components/animated-section";
import Link from "next/link";

interface AdminDashboardProps {
  admin: AdminUser;
  counts?: {
    authors?: number;
    team?: number;
    images?: number;
    videos?: number;
    testimonials?: number;
    blogs?: number;
  };
}

export default function AdminDashboard({ admin, counts }: AdminDashboardProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const result = await logout();
      if (result?.error) {
        toast.error(result.error);
        setIsLoggingOut(false);
      }
      // If no error returned, logout was successful and redirect will happen
    } catch (error: any) {
      // Check if it's a Next.js redirect error (this is expected for successful logout)
      if (
        error?.message?.includes("NEXT_REDIRECT") ||
        error?.digest?.includes("NEXT_REDIRECT")
      ) {
        // This is a successful redirect, not an actual error
        return;
      }

      console.error("Logout error:", error);
      toast.error("An unexpected error occurred during logout");
      setIsLoggingOut(false);
    }
  };

  const adminName =
    admin.user_metadata?.display_name ||
    admin.user_metadata?.full_name ||
    admin.email.split("@")[0];

  const managementCards = [
    {
      title: "Team Management",
      description: "Add, edit, and manage team members",
      icon: Users,
      href: "/admin/team",
      count: counts?.team ?? 0,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Authors",
      description: "Manage blog authors and profiles",
      icon: User,
      href: "/admin/authors",
      count: counts?.authors ?? 0,
      color: "from-indigo-500 to-indigo-600",
    },
    {
      title: "Gallery Images",
      description: "Manage behind-the-scenes images",
      icon: Image,
      href: "/admin/gallery/images",
      count: counts?.images ?? 0,
      color: "from-green-500 to-green-600",
    },
    {
      title: "Gallery Videos",
      description: "Manage video portfolio",
      icon: Video,
      href: "/admin/gallery/videos",
      count: counts?.videos ?? 0,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Blog Management",
      description: "Write, edit, and manage blog posts",
      icon: Database,
      href: "/admin/blog",
      count: counts?.blogs ?? 0,
      color: "from-pink-500 to-pink-600",
    },
    {
      title: "Testimonials",
      description: "Manage client testimonials",
      icon: MessageSquare,
      href: "/admin/testimonials",
      count: counts?.testimonials ?? 0,
      color: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors"
              >
                <Home className="w-5 h-5" />
                <span className="text-sm font-medium">Back to Website</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                Admin Panel
              </Badge>
              <Button
                onClick={handleLogout}
                disabled={isLoggingOut}
                variant="ghost"
                className="text-gray-300 hover:text-white hover:bg-gray-800"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {isLoggingOut ? "Signing out..." : "Sign Out"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <AnimatedSection>
          <div className="mb-8">
            <h1 className="text-3xl xs:text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Welcome back, {adminName}!
              </span>
            </h1>
            <p className="text-gray-400 text-lg">
              Manage your GTD Media website content from this dashboard.
            </p>
          </div>
        </AnimatedSection>

        {/* Admin Info Card */}
        <AnimatedSection delay={100}>
          <Card className="bg-gradient-to-br from-gray-900 to-black border-orange-500/20 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <User className="w-5 h-5 text-orange-400" />
                Admin Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Display Name</div>
                    <div className="text-white font-medium">{adminName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Email Address</div>
                    <div className="text-white font-medium">{admin.email}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Management Cards */}
        <AnimatedSection delay={200}>
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-white">
              Content Management
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {managementCards.map((card, index) => (
                <AnimatedSection key={card.title} delay={250 + index * 50}>
                  <Link href={card.href}>
                    <Card className="bg-gradient-to-br from-gray-900 to-black border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 group hover:scale-105 h-full cursor-pointer relative">
                      <CardContent className="p-6">
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                            {card.count}
                          </Badge>
                        </div>
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-12 h-12 bg-gradient-to-r ${card.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}
                          >
                            <card.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                              {card.title}
                            </h3>
                            <p className="text-gray-400 text-sm">
                              {card.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
