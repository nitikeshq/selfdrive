import { Link, useLocation } from "wouter";
import { Car, Menu, X, User, LogOut, ArrowRightLeft, Gift, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Determine if user is in owner mode based on current route
  const isOwnerMode = location.startsWith('/owner') || 
                      location === '/owner-dashboard' || 
                      location === '/list-vehicle' ||
                      location.startsWith('/edit-vehicle');
  const hasVehicles = user && (user as any).role === 'owner';

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
            {!isLoading && isAuthenticated ? (
              <>
                {isOwnerMode ? (
                  // Owner Mode Navigation
                  <>
                    <Link href="/owner/vehicles">
                      <span className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-my-vehicles">
                        My Vehicles
                      </span>
                    </Link>
                    <Link href="/owner/transactions">
                      <span className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-transactions">
                        Transactions
                      </span>
                    </Link>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setLocation('/dashboard')}
                      data-testid="button-switch-customer"
                    >
                      <ArrowRightLeft className="h-4 w-4 mr-2" />
                      Switch to Customer
                    </Button>
                  </>
                ) : (
                  // Customer Mode Navigation
                  <>
                    <Link href="/vehicles">
                      <span className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-browse">
                        Browse Vehicles
                      </span>
                    </Link>
                    <Link href="/dashboard">
                      <span className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-dashboard">
                        My Bookings
                      </span>
                    </Link>
                    <Link href="/rewards">
                      <span className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-1" data-testid="link-rewards">
                        <Gift className="h-4 w-4" />
                        Rewards
                      </span>
                    </Link>
                    <Link href="/membership">
                      <span className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-1" data-testid="link-membership">
                        <Crown className="h-4 w-4" />
                        {(user as any).hasMembership ? (
                          <span className="flex items-center gap-1">
                            Membership
                            <Badge variant="default" className="bg-yellow-500 text-white text-xs px-1 py-0">Member</Badge>
                          </span>
                        ) : "Membership"}
                      </span>
                    </Link>
                    {hasVehicles && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setLocation('/owner-dashboard')}
                        data-testid="button-switch-owner"
                      >
                        <ArrowRightLeft className="h-4 w-4 mr-2" />
                        Switch to Owner
                      </Button>
                    )}
                    {!hasVehicles && (
                      <Link href="/become-owner">
                        <span className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-become-owner">
                          Become an Owner
                        </span>
                      </Link>
                    )}
                  </>
                )}
              </>
            ) : (
              // Not Authenticated Navigation
              <>
                <Link href="/vehicles">
                  <span className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-browse">
                    Browse Vehicles
                  </span>
                </Link>
                <Link href="/become-owner">
                  <span className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-become-owner">
                    Become an Owner
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
                      <AvatarImage src={(user as any).profileImageUrl || undefined} />
                      <AvatarFallback>
                        {(user as any).firstName?.charAt(0) || (user as any).email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{(user as any).firstName || "User"}</span>
                  </div>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await fetch("/api/logout", { method: "POST", credentials: "include" });
                    window.location.href = "/";
                  }}
                  data-testid="button-logout"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button
                  variant="default"
                  size="default"
                  data-testid="button-login"
                >
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </Link>
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
              {!isLoading && isAuthenticated ? (
                <>
                  {isOwnerMode ? (
                    // Owner Mode Navigation
                    <>
                      <Link href="/owner/vehicles">
                        <span className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-my-vehicles-mobile">
                          My Vehicles
                        </span>
                      </Link>
                      <Link href="/owner/transactions">
                        <span className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-transactions-mobile">
                          Transactions
                        </span>
                      </Link>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => {
                          setLocation('/dashboard');
                          setMobileMenuOpen(false);
                        }}
                        data-testid="button-switch-customer-mobile"
                      >
                        <ArrowRightLeft className="h-4 w-4 mr-2" />
                        Switch to Customer
                      </Button>
                    </>
                  ) : (
                    // Customer Mode Navigation
                    <>
                      <Link href="/vehicles">
                        <span className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-browse-mobile">
                          Browse Vehicles
                        </span>
                      </Link>
                      <Link href="/dashboard">
                        <span className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-dashboard-mobile">
                          My Bookings
                        </span>
                      </Link>
                      {hasVehicles && (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            setLocation('/owner-dashboard');
                            setMobileMenuOpen(false);
                          }}
                          data-testid="button-switch-owner-mobile"
                        >
                          <ArrowRightLeft className="h-4 w-4 mr-2" />
                          Switch to Owner
                        </Button>
                      )}
                      {!hasVehicles && (
                        <Link href="/become-owner">
                          <span className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-become-owner-mobile">
                            Become an Owner
                          </span>
                        </Link>
                      )}
                    </>
                  )}
                </>
              ) : (
                // Not Authenticated Navigation
                <>
                  <Link href="/vehicles">
                    <span className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-browse-mobile">
                      Browse Vehicles
                    </span>
                  </Link>
                  <Link href="/become-owner">
                    <span className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-become-owner-mobile">
                      Become an Owner
                    </span>
                  </Link>
                </>
              )}
              {!isLoading && isAuthenticated ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    await fetch("/api/logout", { method: "POST", credentials: "include" });
                    window.location.href = "/";
                  }}
                  data-testid="button-logout-mobile"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              ) : (
                <Link href="/login">
                  <Button
                    variant="default"
                    className="w-full"
                    data-testid="button-login-mobile"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
