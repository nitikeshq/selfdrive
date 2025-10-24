import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Car, UserPlus, CheckCircle2, Shield, Clock, Zap, Building2, Upload } from "lucide-react";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional(),
  isVendor: z.boolean().default(false),
  companyName: z.string().optional(),
  companyLogoUrl: z.string().optional(),
}).refine((data) => {
  if (data.isVendor && !data.companyName) {
    return false;
  }
  return true;
}, {
  message: "Company name is required for vendor registration",
  path: ["companyName"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [isVendor, setIsVendor] = useState(false);

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      isVendor: false,
      companyName: "",
      companyLogoUrl: "",
    },
  });

  const onRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/register", data);
      const user = await response.json();
      
      toast({
        title: "Registration Successful",
        description: `Welcome to SelfDriveKaro, ${user.firstName}!`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Redirect customers to browse vehicles
      setLocation("/vehicles");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register",
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
            src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2070"
            alt="SelfDriveKaro vehicles"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <Link href="/">
              <div className="flex items-center gap-3 mb-8 cursor-pointer hover:opacity-80 transition-opacity">
                <Car className="h-10 w-10" />
                <h1 className="text-3xl font-display font-bold">SelfDriveKaro</h1>
              </div>
            </Link>
          </div>

          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-display font-bold mb-4">
                Start Your Journey Today
              </h2>
              <p className="text-lg text-white/90">
                Join thousands of riders in Bhubaneswar
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="h-6 w-6 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Book in 2 Minutes</h3>
                  <p className="text-white/80">Quick and easy booking process with instant confirmation</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Safe & Secure</h3>
                  <p className="text-white/80">All vehicles are verified and fully insured for your safety</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="h-6 w-6 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Flexible Pricing</h3>
                  <p className="text-white/80">Rent by the hour or by the day - your choice!</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-6">
            <div className="flex items-center gap-8">
              <div>
                <div className="text-3xl font-bold">10,000+</div>
                <div className="text-white/60 text-sm">Vehicles</div>
              </div>
              <div>
                <div className="text-3xl font-bold">50,000+</div>
                <div className="text-white/60 text-sm">Happy Riders</div>
              </div>
              <div>
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-white/60 text-sm">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <Link href="/">
              <div className="flex items-center justify-center gap-2 mb-4 cursor-pointer">
                <Car className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-display font-bold">SelfDriveKaro</h1>
              </div>
            </Link>
          </div>

          <div>
            <h2 className="text-3xl font-display font-bold mb-2" data-testid="text-register-title">
              Create Your Account
            </h2>
            <p className="text-muted-foreground">
              Join SelfDriveKaro to start renting vehicles instantly
            </p>
          </div>

          <Card className="border-2">
            <CardContent className="pt-6">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">First Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John"
                              {...field}
                              className="h-11"
                              data-testid="input-register-firstname"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Last Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Doe"
                              {...field}
                              className="h-11"
                              data-testid="input-register-lastname"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={registerForm.control}
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
                            data-testid="input-register-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            className="h-11"
                            data-testid="input-register-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Phone Number (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+91 9876543210"
                            {...field}
                            className="h-11"
                            data-testid="input-register-phone"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="isVendor"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/30">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              setIsVendor(!!checked);
                            }}
                            data-testid="checkbox-register-vendor"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-base flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Register as Vendor/Agency
                          </FormLabel>
                          <FormDescription>
                            Check this if you're a garage, rental business, or agency with multiple vehicles
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {isVendor && (
                    <div className="space-y-4 p-4 border border-primary/20 rounded-lg bg-primary/5">
                      <FormField
                        control={registerForm.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Company/Brand Name *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., ABC Rentals, Quick Drive"
                                {...field}
                                className="h-11"
                                data-testid="input-register-companyname"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="text-sm text-muted-foreground">
                        <p className="flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          Company logo can be uploaded later from your profile
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      By creating an account, you agree to our Terms of Service and Privacy Policy
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 text-base"
                    disabled={isLoading}
                    data-testid="button-submit-register"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-5 w-5 mr-2" />
                        Create Account
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login">
                <span className="text-primary font-semibold hover:underline cursor-pointer" data-testid="link-login">
                  Login here
                </span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
