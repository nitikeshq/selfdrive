import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car } from "lucide-react";
import { Link } from "wouter";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Car className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-display">Welcome to DriveEase</CardTitle>
          <CardDescription>
            Sign in to book vehicles or manage your listings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full" size="lg" data-testid="button-login-replit">
            Continue with Replit
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              New to DriveEase?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/">
                <a className="w-full">
                  <Button variant="outline" className="w-full" data-testid="button-browse-as-customer">
                    Browse as Customer
                  </Button>
                </a>
              </Link>
              <Link href="/list-vehicle">
                <a className="w-full">
                  <Button variant="outline" className="w-full" data-testid="button-list-as-owner">
                    List as Owner
                  </Button>
                </a>
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              By continuing, you agree to our{" "}
              <Link href="/terms">
                <a className="text-primary hover:underline">Terms of Service</a>
              </Link>{" "}
              and{" "}
              <Link href="/privacy">
                <a className="text-primary hover:underline">Privacy Policy</a>
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
