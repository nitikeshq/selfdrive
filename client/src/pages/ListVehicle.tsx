import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car, Upload, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import GooglePlacesAutocomplete from "@/components/GooglePlacesAutocomplete";

const vehicleFormSchema = z.object({
  name: z.string().min(1, "Vehicle name is required"),
  type: z.enum(["car", "bike"]),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  seats: z.number().min(1).optional(),
  fuelType: z.enum(["petrol", "diesel", "electric"]),
  transmission: z.enum(["manual", "automatic"]),
  registrationNumber: z.string().min(1, "Registration number is required"),
  pricePerHour: z.number().min(1, "Hourly price is required"),
  pricePerDay: z.number().min(1, "Daily price is required"),
  location: z.string().min(1, "Parking location is required"),
  locationPlaceId: z.string().optional(),
  locationLat: z.number().optional(),
  locationLng: z.number().optional(),
  ownerLocation: z.string().min(1, "Owner location is required"),
  features: z.string().optional(),
  imageUrl: z.string().url("Valid image URL is required"),
});

const ownerRegistrationSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type VehicleFormData = z.infer<typeof vehicleFormSchema>;
type OwnerRegistrationForm = z.infer<typeof ownerRegistrationSchema>;
type LoginForm = z.infer<typeof loginSchema>;

export default function ListVehicle() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [pendingVehicleData, setPendingVehicleData] = useState<VehicleFormData | null>(null);

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      name: "",
      type: "car",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      seats: 4,
      fuelType: "petrol",
      transmission: "manual",
      registrationNumber: "",
      pricePerHour: 0,
      pricePerDay: 0,
      location: "",
      locationPlaceId: "",
      locationLat: undefined,
      locationLng: undefined,
      ownerLocation: "",
      features: "",
      imageUrl: "",
    },
  });

  const registerForm = useForm<OwnerRegistrationForm>({
    resolver: zodResolver(ownerRegistrationSchema),
    defaultValues: { email: "", password: "", firstName: "", lastName: "" },
  });

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: OwnerRegistrationForm) => {
      const res = await apiRequest("POST", "/api/register", { ...data, role: "owner" });
      return res.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Success!", description: "Owner account created successfully" });
      setShowAuthModal(false);
      
      // Automatically submit vehicle after successful registration
      if (pendingVehicleData) {
        createVehicleMutation.mutate(pendingVehicleData);
        setPendingVehicleData(null);
      }
    },
    onError: (error: any) => {
      toast({ title: "Registration failed", description: error.message || "Please try again", variant: "destructive" });
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const res = await apiRequest("POST", "/api/login", data);
      return res.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: "Success!", description: "Logged in successfully" });
      setShowAuthModal(false);
      
      // Automatically submit vehicle after successful login
      if (pendingVehicleData) {
        createVehicleMutation.mutate(pendingVehicleData);
        setPendingVehicleData(null);
      }
    },
    onError: (error: any) => {
      toast({ title: "Login failed", description: error.message || "Please try again", variant: "destructive" });
    },
  });

  const createVehicleMutation = useMutation({
    mutationFn: async (data: VehicleFormData) => {
      const featuresArray = data.features
        ? data.features.split(",").map((f) => f.trim()).filter(Boolean)
        : [];
      
      const payload = {
        ...data,
        features: featuresArray,
      };
      
      const res = await apiRequest("POST", "/api/vehicles", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      toast({ title: "Success!", description: "Vehicle listed successfully" });
      setLocation("/owner-dashboard");
    },
    onError: (error: any) => {
      toast({ title: "Failed to list vehicle", description: error.message || "Please try again", variant: "destructive" });
    },
  });

  const onSubmit = (data: VehicleFormData) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Save vehicle data and show auth modal
      setPendingVehicleData(data);
      setShowAuthModal(true);
    } else {
      // User is authenticated, submit directly
      createVehicleMutation.mutate(data);
    }
  };

  const vehicleType = form.watch("type");

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2" data-testid="text-list-vehicle-title">
            List Your Vehicle
          </h1>
          <p className="text-muted-foreground">Fill in the details to list your vehicle for rent</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Honda City" {...field} data-testid="input-vehicle-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Type</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                            data-testid="select-vehicle-type"
                          >
                            <option value="car">Car</option>
                            <option value="bike">Bike</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Honda" {...field} data-testid="input-brand" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., City" {...field} data-testid="input-model" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            data-testid="input-year"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {vehicleType === "car" && (
                    <FormField
                      control={form.control}
                      name="seats"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Seats</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              data-testid="input-seats"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="fuelType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fuel Type</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                            data-testid="select-fuel-type"
                          >
                            <option value="petrol">Petrol</option>
                            <option value="diesel">Diesel</option>
                            <option value="electric">Electric</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="transmission"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Transmission</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                            data-testid="select-transmission"
                          >
                            <option value="manual">Manual</option>
                            <option value="automatic">Automatic</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="registrationNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Registration Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., MH 01 AB 1234" {...field} data-testid="input-registration" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Vehicle Parking Location
                        </FormLabel>
                        <FormControl>
                          <GooglePlacesAutocomplete
                            value={field.value}
                            onChange={(value, placeId, lat, lng) => {
                              field.onChange(value);
                              if (placeId) form.setValue("locationPlaceId", placeId);
                              if (lat) form.setValue("locationLat", parseFloat(lat));
                              if (lng) form.setValue("locationLng", parseFloat(lng));
                            }}
                            placeholder="Enter parking location"
                            restrictToBhubaneswar={true}
                            testId="input-location"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Enter the parking location for your vehicle
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ownerLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Owner Location</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                            data-testid="select-owner-location"
                          >
                            <option value="">Select your location</option>
                            <option value="Bhubaneswar">Bhubaneswar</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pricePerHour"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price per Hour (₹)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            data-testid="input-price-hour"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pricePerDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price per Day (₹)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            data-testid="input-price-day"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Image URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://example.com/image.jpg" 
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setImagePreview(e.target.value);
                          }}
                          data-testid="input-image-url"
                        />
                      </FormControl>
                      <FormDescription>
                        Enter a valid image URL for your vehicle
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {imagePreview && (
                  <div className="rounded-lg overflow-hidden border border-border">
                    <img
                      src={imagePreview}
                      alt="Vehicle preview"
                      className="w-full h-64 object-cover"
                      onError={() => setImagePreview("")}
                    />
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="features"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Features (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g., GPS, Bluetooth, Air Conditioning (comma separated)" 
                          {...field}
                          data-testid="textarea-features"
                        />
                      </FormControl>
                      <FormDescription>
                        List the key features of your vehicle, separated by commas
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full" 
                  disabled={createVehicleMutation.isPending}
                  data-testid="button-submit-vehicle"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  {createVehicleMutation.isPending ? "Listing Vehicle..." : "List Vehicle"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Auth Modal */}
      <Dialog open={showAuthModal} onOpenChange={setShowAuthModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Just One More Step!</DialogTitle>
            <DialogDescription>
              To list your vehicle, please create an account or login. Your vehicle details are saved.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="register" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="register">Register</TabsTrigger>
              <TabsTrigger value="login">Login</TabsTrigger>
            </TabsList>
            
            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit((data) => registerMutation.mutate(data))} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} data-testid="input-register-first-name" />
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
                            <Input placeholder="Doe" {...field} data-testid="input-register-last-name" />
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
                          <Input type="email" placeholder="owner@example.com" {...field} data-testid="input-register-email" />
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
                          <Input type="password" placeholder="Minimum 6 characters" {...field} data-testid="input-register-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={registerMutation.isPending}
                    data-testid="button-register"
                  >
                    {registerMutation.isPending ? "Creating Account..." : "Create Owner Account"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
            
            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="owner@example.com" {...field} data-testid="input-login-email" />
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
                          <Input type="password" placeholder="Your password" {...field} data-testid="input-login-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={loginMutation.isPending}
                    data-testid="button-login"
                  >
                    {loginMutation.isPending ? "Logging in..." : "Login as Owner"}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
