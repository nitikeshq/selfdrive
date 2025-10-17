import { Link } from "wouter";
import { Car, Facebook, Twitter, Instagram, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  return (
    <footer className="bg-card border-t border-card-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link href="/">
              <div className="flex items-center gap-2 mb-4 cursor-pointer">
                <Car className="h-6 w-6 text-primary" />
                <span className="text-lg font-display font-bold">DriveEase</span>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Your journey, your vehicle, your schedule. Book self-drive cars & bikes with instant confirmation.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="button-facebook">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="button-twitter">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="button-instagram">
                <Instagram className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/vehicles">
                  <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-vehicles-footer">
                    Browse Vehicles
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard">
                  <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-dashboard-footer">
                    My Bookings
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/contact-us">
                  <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-contact">
                    Contact Us
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* For Owners */}
          <div>
            <h3 className="font-semibold mb-4">For Vehicle Owners</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/list-vehicle">
                  <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-list-vehicle-footer">
                    List Your Vehicle
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/owner-dashboard">
                  <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-owner-dashboard">
                    Owner Dashboard
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold mb-4">Stay Updated</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to get special offers and updates.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="text-sm"
                data-testid="input-newsletter-email"
              />
              <Button size="icon" data-testid="button-newsletter-subscribe">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-card-border">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <p className="text-sm text-muted-foreground">
                © 2025 DriveEase. All rights reserved.
              </p>
              <div className="flex gap-2 items-center">
                <span className="text-xs px-2 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-md border border-orange-500/20 font-medium">
                  🇮🇳 Made in India
                </span>
                <span className="text-xs px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-md border border-green-500/20 font-medium">
                  Made in Odisha
                </span>
              </div>
            </div>
            <div className="flex gap-6">
              <Link href="/terms-and-conditions">
                <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-terms">
                  Terms of Service
                </span>
              </Link>
              <Link href="/privacy-policy">
                <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer" data-testid="link-privacy">
                  Privacy Policy
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
