import { Link } from "wouter";
import { Car, Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { useState } from "react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <a className="flex items-center gap-2 hover-elevate active-elevate-2 px-2 py-1 rounded-md transition-all" data-testid="link-home">
              <Car className="h-7 w-7 text-primary" />
              <span className="text-xl font-display font-bold text-foreground">DriveEase</span>
            </a>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/">
              <a className="text-sm font-medium text-foreground hover:text-primary transition-colors" data-testid="link-browse">
                Browse Vehicles
              </a>
            </Link>
            <Link href="/how-it-works">
              <a className="text-sm font-medium text-foreground hover:text-primary transition-colors" data-testid="link-how-it-works">
                How It Works
              </a>
            </Link>
            <Link href="/list-vehicle">
              <a className="text-sm font-medium text-foreground hover:text-primary transition-colors" data-testid="link-list-vehicle">
                List Your Vehicle
              </a>
            </Link>
            <ThemeToggle />
            <Link href="/login">
              <a>
                <Button variant="default" size="default" data-testid="button-login">
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </a>
            </Link>
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
              <Link href="/">
                <a className="text-sm font-medium text-foreground hover:text-primary transition-colors" data-testid="link-browse-mobile">
                  Browse Vehicles
                </a>
              </Link>
              <Link href="/how-it-works">
                <a className="text-sm font-medium text-foreground hover:text-primary transition-colors" data-testid="link-how-it-works-mobile">
                  How It Works
                </a>
              </Link>
              <Link href="/list-vehicle">
                <a className="text-sm font-medium text-foreground hover:text-primary transition-colors" data-testid="link-list-vehicle-mobile">
                  List Your Vehicle
                </a>
              </Link>
              <Link href="/login">
                <a>
                  <Button variant="default" className="w-full" data-testid="button-login-mobile">
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </a>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
