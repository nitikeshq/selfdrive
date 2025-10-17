import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Car, LogIn, ArrowRight, CheckCircle2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/login", data);
      const user = await response.json();
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.firstName}!`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Redirect based on user role
      if (user.role === "owner") {
        setLocation("/owner-dashboard");
      } else if (user.role === "customer") {
        setLocation("/vehicles");
      } else {
        setLocation("/");
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Image with Gradient Overlay */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary/90 to-primary">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070"
            alt="DriveEase vehicles"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <Link href="/">
              <div className="flex items-center gap-3 mb-8 cursor-pointer hover:opacity-80 transition-opacity">
                <Car className="h-10 w-10" />
                <h1 className="text-3xl font-display font-bold">DriveEase</h1>
              </div>
            </Link>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-display font-bold mb-4">
                Welcome Back to Your Journey
              </h2>
              <p className="text-lg text-white/90">
                Access thousands of verified vehicles in Bhubaneswar
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Instant Booking</h3>
                  <p className="text-white/80">Book any vehicle in seconds with real-time availability</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Verified Vehicles</h3>
                  <p className="text-white/80">All vehicles are verified with proper documentation</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Secure Payments</h3>
                  <p className="text-white/80">Safe and encrypted payment processing</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-6">
            <p className="text-white/60 text-sm">
              Trusted by 50,000+ riders across Bhubaneswar
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <Link href="/">
              <div className="flex items-center justify-center gap-2 mb-4 cursor-pointer">
                <Car className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-display font-bold">DriveEase</h1>
              </div>
            </Link>
          </div>

          <div>
            <h2 className="text-3xl font-display font-bold mb-2" data-testid="text-login-title">
              Login to Your Account
            </h2>
            <p className="text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>

          <Card className="border-2">
            <CardContent className="pt-6">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-5">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="your@email.com"
                            {...field}
                            className="h-11"
                            data-testid="input-login-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="text-base">Password</FormLabel>
                          <button
                            type="button"
                            className="text-sm text-primary hover:underline"
                            onClick={() => toast({ title: "Password reset coming soon!" })}
                          >
                            Forgot password?
                          </button>
                        </div>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            className="h-11"
                            data-testid="input-login-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full h-11 text-base"
                    disabled={isLoading}
                    data-testid="button-submit-login"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Logging in...
                      </>
                    ) : (
                      <>
                        <LogIn className="h-5 w-5 mr-2" />
                        Login
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/register">
                <span className="text-primary font-semibold hover:underline cursor-pointer" data-testid="link-register">
                  Create Account
                </span>
              </Link>
            </p>
            <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
              <span>Want to list your vehicle?</span>
              <Link href="/become-owner">
                <Button variant="outline" size="sm" className="gap-1" data-testid="link-become-owner">
                  Become an Owner
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
