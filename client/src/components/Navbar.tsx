import { Link } from "wouter";
import { Car, Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2 hover-elevate active-elevate-2 px-2 py-1 rounded-md transition-all cursor-pointer" data-testid="link-home">
              <Car className="h-7 w-7 text-primary" />
              <span className="text-xl font-display font-bold text-foreground">DriveEase</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/vehicles">
              <span className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-browse">
                Browse Vehicles
              </span>
            </Link>
            {!isLoading && isAuthenticated && (
              <>
                <Link href="/dashboard">
                  <span className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-dashboard">
                    My Bookings
                  </span>
                </Link>
                <Link href="/list-vehicle">
                  <span className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-list-vehicle">
                    List Vehicle
                  </span>
                </Link>
              </>
            )}
            <ThemeToggle />
            {isLoading ? (
              <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard">
                  <div className="flex items-center gap-2 cursor-pointer hover-elevate px-2 py-1 rounded-md transition-all">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profileImageUrl || undefined} />
                      <AvatarFallback>
                        {user.firstName?.charAt(0) || user.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{user.firstName || "User"}</span>
                  </div>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = "/api/logout"}
                  data-testid="button-logout"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                variant="default"
                size="default"
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-login"
              >
                <User className="h-4 w-4 mr-2" />
                Login
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <Link href="/vehicles">
                <span className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-browse-mobile">
                  Browse Vehicles
                </span>
              </Link>
              {!isLoading && isAuthenticated && (
                <>
                  <Link href="/dashboard">
                    <span className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-dashboard-mobile">
                      My Bookings
                    </span>
                  </Link>
                  <Link href="/list-vehicle">
                    <span className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-list-vehicle-mobile">
                      List Vehicle
                    </span>
                  </Link>
                </>
              )}
              {!isLoading && isAuthenticated ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.location.href = "/api/logout"}
                  data-testid="button-logout-mobile"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              ) : (
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="button-login-mobile"
                >
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
