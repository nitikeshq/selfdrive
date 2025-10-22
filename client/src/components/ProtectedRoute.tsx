import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOwner?: boolean;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireOwner = false, 
  requireAdmin = false 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      // Not authenticated - redirect to login
      if (!isAuthenticated) {
        setLocation("/login");
        return;
      }

      // Require owner role
      if (requireOwner && user?.role !== "owner" && user?.role !== "admin") {
        setLocation("/dashboard");
        return;
      }

      // Require admin role
      if (requireAdmin && user?.role !== "admin") {
        setLocation("/dashboard");
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, requireOwner, requireAdmin, setLocation]);

  // Show loading skeleton while checking auth
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  // Not authenticated or wrong role - don't render children (redirect happening)
  if (!isAuthenticated) {
    return null;
  }

  if (requireOwner && user?.role !== "owner" && user?.role !== "admin") {
    return null;
  }

  if (requireAdmin && user?.role !== "admin") {
    return null;
  }

  // Authenticated and has correct role - render children
  return <>{children}</>;
}
