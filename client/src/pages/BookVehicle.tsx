import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar, MapPin, TruckIcon, CreditCard, Users, Fuel, Settings, AlertCircle, Tag, Check, X, UserPlus, LogIn } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Vehicle } from "@shared/schema";

const bookingFormSchema = z.object({
  startDate: z.string().min(1, "Pickup date is required"),
  endDate: z.string().min(1, "Return date is required"),
  pickupOption: z.enum(["parking", "delivery"]),
  deliveryAddress: z.string().optional(),
}).refine(
  (data) => {
    if (data.pickupOption === "delivery") {
      return data.deliveryAddress && data.deliveryAddress.trim().length > 0;
    }
    return true;
  },
  {
    message: "Delivery address is required for doorstep delivery",
    path: ["deliveryAddress"],
  }
);

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;
type LoginFormData = z.infer<typeof loginSchema>;


export default function BookVehicle() {
  const [, params] = useRoute("/book/:id");
  const [, setLocation] = useLocation();
  const vehicleId = params?.id;
  const [selectedOption, setSelectedOption] = useState<"parking" | "delivery">("parking");
  const [paymentData, setPaymentData] = useState<any | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Get pickup/return times from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const pickupFromUrl = urlParams.get('pickup') || "";
  const returnFromUrl = urlParams.get('return') || "";

  const { data: vehicle, isLoading } = useQuery<Vehicle>({
    queryKey: ["/api/vehicles", vehicleId],
    enabled: !!vehicleId,
  });

  const { data: rewardsData } = useQuery<{ balance: number }>({
    queryKey: ["/api/wallet/balance"],
    enabled: isAuthenticated,
  });

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      pickupOption: "parking",
      startDate: pickupFromUrl,
      endDate: returnFromUrl,
      deliveryAddress: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
    },
  });

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const calculateTotal = (start: string, end: string) => {
    if (!start || !end || !vehicle) return 0;
    
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const hours = Math.ceil((endTime - startTime) / (1000 * 60 * 60));
    
    let total = hours * parseFloat(vehicle.pricePerHour);
    
    // Add delivery charge if delivery option selected
    if (selectedOption === "delivery") {
      total += 200; // Fixed delivery charge
    }
    
    return total;
  };

  const watchedStartDate = form.watch("startDate");
  const watchedEndDate = form.watch("endDate");
  const baseTotal = calculateTotal(watchedStartDate, watchedEndDate);
  const totalAmount = baseTotal - couponDiscount;
  const deliveryCharge = selectedOption === "delivery" ? 200 : 0;

  // Calculate booking hours for coupon validation
  const bookingHours = watchedStartDate && watchedEndDate 
    ? Math.ceil((new Date(watchedEndDate).getTime() - new Date(watchedStartDate).getTime()) / (1000 * 60 * 60))
    : 0;

  const validateCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/coupons/validate", {
        code,
        bookingAmount: baseTotal,
        bookingHours,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setAppliedCoupon(data.coupon);
      setCouponDiscount(parseFloat(data.discountAmount));
      toast({
        title: "Coupon Applied!",
        description: `You saved ₹${data.discountAmount} with code ${data.coupon.code}`,
      });
    },
    onError: (error: any) => {
      setCouponDiscount(0);
      setAppliedCoupon(null);
      toast({
        title: "Invalid Coupon",
        description: error.message || "This coupon code is not valid",
        variant: "destructive",
      });
    },
  });

  const applyCoupon = () => {
    if (!couponCode.trim()) {
      toast({
        title: "Enter Coupon Code",
        description: "Please enter a coupon code",
        variant: "destructive",
      });
      return;
    }
    validateCouponMutation.mutate(couponCode.toUpperCase());
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode("");
  };

  const createBookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      if (!isAuthenticated || !user) {
        throw new Error("User not authenticated");
      }

      const bookingData = {
        userId: (user as any).id,
        vehicleId: vehicleId!,
        startDate: data.startDate, // Send as ISO string directly
        endDate: data.endDate, // Send as ISO string directly
        pickupOption: data.pickupOption,
        deliveryAddress: data.deliveryAddress || null,
        totalAmount: totalAmount.toString(),
        deliveryCharge: deliveryCharge.toString(),
        hasExtraInsurance: false,
        insuranceAmount: "0",
        platformCommission: "0",
        ownerEarnings: "0",
        status: "pending",
        paymentStatus: "pending",
      };

      const response = await apiRequest("POST", "/api/bookings", bookingData);

      return response.json();
    },
    onSuccess: async (booking) => {
      // Always use PayUMoney - rewards are auto-applied as discount
      const response = await apiRequest("POST", "/api/create-payment", {
        amount: totalAmount,
        bookingId: booking.id,
        userEmail: (user as any).email,
        userFirstName: (user as any).firstName,
        userPhone: (user as any).phone || "0000000000",
      });
      const data = await response.json();
      setPaymentData(data);
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create booking",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const response = await apiRequest("POST", "/api/register", {
        ...data,
        role: "customer",
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account Created!",
        description: "You can now complete your booking",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setShowAuthForm(false);
      // After successful registration, the booking form will auto-submit
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await apiRequest("POST", "/api/login", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Logged In!",
        description: "You can now complete your booking",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setShowAuthForm(false);
      // After successful login, the booking form will auto-submit
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: BookingFormData) => {
    if (!isAuthenticated) {
      setShowAuthForm(true);
      toast({
        title: "Authentication Required",
        description: "Please login or create an account to continue",
      });
      return;
    }

    createBookingMutation.mutate(data);
  };

  const onRegister = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  const onLogin = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SEO
          title="Loading Booking..."
          description="Please wait while we load your vehicle booking details"
        />
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SEO
          title="Vehicle Not Found"
          description="The vehicle you're looking for doesn't exist or has been removed"
        />
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Vehicle not found</h2>
          <p className="text-muted-foreground">The vehicle you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <SEO
        title={vehicle ? `Book ${vehicle.name} - ${vehicle.type === 'car' ? 'Car' : 'Bike'} Rental` : 'Book Vehicle'}
        description={vehicle ? `Book ${vehicle.name} for hourly or daily rental. ${vehicle.brand} ${vehicle.model} available for self-drive. Instant confirmation with flexible payment options.` : 'Complete your vehicle booking'}
        keywords="book car, book bike, vehicle booking, rental confirmation, payment options"
        ogImage={vehicle?.imageUrl}
        canonical={vehicle ? `https://selfdrivekaro.com/book/${vehicle.id}` : undefined}
      />
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2" data-testid="text-booking-title">Book Your Vehicle</h1>
          <p className="text-muted-foreground">Complete the details below to confirm your booking</p>
        </div>

        {/* Guest Authentication Form */}
        {!isAuthenticated && showAuthForm && (
          <Card className="mb-8 border-primary">
            <CardHeader>
              <CardTitle>Login or Create Account</CardTitle>
              <CardDescription>
                Please login to your existing account or create a new one to continue booking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login" data-testid="tab-login">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </TabsTrigger>
                  <TabsTrigger value="register" data-testid="tab-register">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Account
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" placeholder="your@email.com" data-testid="input-login-email" />
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
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" placeholder="••••••••" data-testid="input-login-password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowAuthForm(false)}
                          className="flex-1"
                          data-testid="button-cancel-login"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={loginMutation.isPending}
                          className="flex-1"
                          data-testid="button-submit-login"
                        >
                          {loginMutation.isPending ? (
                            <>
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                              Logging in...
                            </>
                          ) : (
                            "Login"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="John" data-testid="input-first-name" />
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
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Doe" data-testid="input-last-name" />
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
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" placeholder="your@email.com" data-testid="input-register-email" />
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
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field} type="tel" placeholder="+91 9999999999" data-testid="input-phone" />
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
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" placeholder="Minimum 6 characters" data-testid="input-register-password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowAuthForm(false)}
                          className="flex-1"
                          data-testid="button-cancel-register"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={registerMutation.isPending}
                          className="flex-1"
                          data-testid="button-submit-register"
                        >
                          {registerMutation.isPending ? (
                            <>
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                              Creating Account...
                            </>
                          ) : (
                            "Create Account"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Vehicle Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Vehicle Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4">
                      <img
                        src={vehicle.imageUrl}
                        alt={vehicle.name}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{vehicle.name}</h3>
                        <p className="text-muted-foreground mb-3">
                          {vehicle.brand} {vehicle.model} ({vehicle.year})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {vehicle.seats && (
                            <Badge variant="secondary">
                              <Users className="h-3 w-3 mr-1" />
                              {vehicle.seats} Seats
                            </Badge>
                          )}
                          <Badge variant="secondary">
                            <Fuel className="h-3 w-3 mr-1" />
                            {vehicle.fuelType}
                          </Badge>
                          <Badge variant="secondary">
                            <Settings className="h-3 w-3 mr-1" />
                            {vehicle.transmission}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Date & Time */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Rental Period
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pickup Date & Time</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} data-testid="input-start-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Return Date & Time</FormLabel>
                          <FormControl>
                            <Input type="datetime-local" {...field} data-testid="input-end-date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Pickup Options */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pickup Option</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="pickupOption"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedOption(value as "parking" | "delivery");
                                // Clear delivery address when switching to parking
                                if (value === "parking") {
                                  form.setValue("deliveryAddress", "");
                                }
                              }}
                              value={field.value}
                              className="space-y-4"
                            >
                              <Label
                                htmlFor="parking"
                                className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer hover-elevate ${
                                  selectedOption === "parking" ? "border-primary bg-primary/5" : "border-border"
                                }`}
                              >
                                <RadioGroupItem value="parking" id="parking" data-testid="radio-parking" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-accent-foreground" />
                                    <span className="font-semibold">Self-Pickup from Parking</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Pick up from {vehicle.location}
                                  </p>
                                  <Badge variant="secondary" className="mt-2">Standard Pricing</Badge>
                                </div>
                              </Label>

                              <Label
                                htmlFor="delivery"
                                className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer hover-elevate ${
                                  selectedOption === "delivery" ? "border-primary bg-primary/5" : "border-border"
                                }`}
                              >
                                <RadioGroupItem value="delivery" id="delivery" data-testid="radio-delivery" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <TruckIcon className="h-5 w-5 text-primary" />
                                    <span className="font-semibold">Doorstep Delivery</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Get vehicle delivered to your address
                                  </p>
                                  <Badge className="mt-2">+ ₹200 Delivery Charge</Badge>
                                </div>
                              </Label>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {selectedOption === "delivery" && (
                      <FormField
                        control={form.control}
                        name="deliveryAddress"
                        render={({ field }) => (
                          <FormItem className="mt-4">
                            <FormLabel>Delivery Address</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter complete delivery address"
                                {...field}
                                data-testid="textarea-delivery-address"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Important Reminder */}
                <Alert className="border-primary/50 bg-primary/5">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  <AlertTitle className="text-primary font-semibold">Important Reminder</AlertTitle>
                  <AlertDescription className="mt-2 text-muted-foreground">
                    Please bring your <strong>valid driver's license</strong> with you when picking up the {vehicle.type}. 
                    The license must match the vehicle category you're renting. Rental cannot proceed without proper license verification at pickup.
                  </AlertDescription>
                </Alert>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full" 
                  data-testid="button-proceed-payment"
                  disabled={createBookingMutation.isPending}
                >
                  {createBookingMutation.isPending ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                      Creating Booking...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Proceed to Payment
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">{vehicle.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {vehicle.brand} {vehicle.model}
                  </p>
                </div>

                <div className="space-y-2 py-4 border-y border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Base Rate</span>
                    <span className="font-medium">₹{vehicle.pricePerHour}/hour</span>
                  </div>
                  {deliveryCharge > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery Charge</span>
                      <span className="font-medium">₹{deliveryCharge}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm pt-2 border-t">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-medium">₹{baseTotal}</span>
                  </div>
                </div>

                {/* Coupon Code Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">Have a coupon code?</span>
                  </div>
                  
                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                        className="flex-1"
                        data-testid="input-coupon-code"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={applyCoupon}
                        disabled={validateCouponMutation.isPending || !couponCode.trim()}
                        data-testid="button-apply-coupon"
                      >
                        {validateCouponMutation.isPending ? (
                          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                        ) : (
                          "Apply"
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <div>
                          <p className="text-sm font-medium text-green-600 dark:text-green-400">
                            {appliedCoupon.code}
                          </p>
                          <p className="text-xs text-green-600/80 dark:text-green-400/80">
                            {appliedCoupon.description}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeCoupon}
                        data-testid="button-remove-coupon"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 dark:text-green-400 font-medium">Coupon Discount</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        - ₹{couponDiscount.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-lg font-semibold">Total Amount</span>
                  <span className="text-2xl font-bold text-primary" data-testid="text-total-amount">
                    ₹{totalAmount.toFixed(2)}
                  </span>
                </div>

                {/* Rewards Discount (if applicable) */}
                {rewardsData && rewardsData.balance > 0 && (
                  <div className="space-y-2 py-4 border-y border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 dark:text-green-400 font-medium">Rewards Discount</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        - ₹{Math.min(rewardsData.balance, totalAmount).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your rewards balance of ₹{rewardsData.balance.toFixed(2)} will be automatically applied to this booking
                    </p>
                  </div>
                )}

                {/* Final Payment Amount */}
                {rewardsData && rewardsData.balance > 0 && (
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-semibold">Final Payment Amount</span>
                    <span className="text-2xl font-bold text-primary">
                      ₹{Math.max(0, totalAmount - rewardsData.balance).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> Amount will be charged as advance payment upon confirmation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Modal - PayU Integration */}
      {paymentData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Complete Payment</h2>
            <p className="text-muted-foreground mb-4">
              You will be redirected to PayU secure payment gateway
            </p>
            <div className="bg-muted/50 p-4 rounded-lg mb-6">
              <p className="text-sm mb-2">
                <strong>Amount:</strong> ₹{paymentData.amount}
              </p>
              <p className="text-sm mb-2">
                <strong>Transaction ID:</strong> {paymentData.txnid}
              </p>
            </div>
            <form 
              action={paymentData.paymentUrl} 
              method="post" 
              id="payuForm"
              ref={(form) => {
                if (form) {
                  // Auto-submit after a brief delay
                  setTimeout(() => form.submit(), 1000);
                }
              }}
            >
              <input type="hidden" name="key" value={paymentData.key} />
              <input type="hidden" name="txnid" value={paymentData.txnid} />
              <input type="hidden" name="amount" value={paymentData.amount} />
              <input type="hidden" name="productinfo" value={paymentData.productinfo} />
              <input type="hidden" name="firstname" value={paymentData.firstname} />
              <input type="hidden" name="email" value={paymentData.email} />
              <input type="hidden" name="phone" value={paymentData.phone} />
              <input type="hidden" name="surl" value={paymentData.surl} />
              <input type="hidden" name="furl" value={paymentData.furl} />
              <input type="hidden" name="hash" value={paymentData.hash} />
              <Button 
                type="submit" 
                className="w-full" 
                data-testid="button-confirm-payment"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Proceed to Payment
              </Button>
            </form>
            <Button 
              variant="outline" 
              className="w-full mt-3"
              onClick={() => setPaymentData(null)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
