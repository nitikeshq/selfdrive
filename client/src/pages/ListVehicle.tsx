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
import { Car, Upload, MapPin, FileText, Shield, Leaf, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import GooglePlacesAutocomplete from "@/components/GooglePlacesAutocomplete";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";
import OwnerTermsDialog from "@/components/legal/OwnerTermsDialog";

const vehicleFormSchema = z.object({
  name: z.string().min(1, "Vehicle name is required"),
  type: z.enum(["car", "bike"]),
  category: z.string().min(1, "Category is required"),
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
  availabilityType: z.enum(["always", "specific_hours"]).default("always"),
  availableFromTime: z.string().optional(),
  availableToTime: z.string().optional(),
  rcDocumentUrl: z.string().optional(),
  insuranceDocumentUrl: z.string().optional(),
  pucDocumentUrl: z.string().optional(),
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
  const [showOwnerTerms, setShowOwnerTerms] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [pendingVehicleData, setPendingVehicleData] = useState<VehicleFormData | null>(null);
  
  // Document upload states
  const [rcDocUrl, setRcDocUrl] = useState<string>("");
  const [insuranceDocUrl, setInsuranceDocUrl] = useState<string>("");
  const [pucDocUrl, setPucDocUrl] = useState<string>("");

  // Check if owner has accepted terms
  const { data: termsAcceptance, isLoading: isCheckingTerms } = useQuery({
    queryKey: ["/api/agreement-acceptances/check/owner_terms"],
    enabled: isAuthenticated && !!user,
  });

  // Show terms dialog if authenticated and terms not accepted
  useEffect(() => {
    if (isAuthenticated && termsAcceptance && !(termsAcceptance as any).accepted && !isLoading && !isCheckingTerms) {
      setShowOwnerTerms(true);
    }
  }, [isAuthenticated, termsAcceptance, isLoading, isCheckingTerms]);

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      name: "",
      type: "car",
      category: "economy",
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
      availabilityType: "always",
      availableFromTime: "09:00",
      availableToTime: "17:00",
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
        rcDocumentUrl: rcDocUrl,
        insuranceDocumentUrl: insuranceDocUrl,
        pucDocumentUrl: pucDocUrl || undefined,
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
    // Validate required documents
    if (!rcDocUrl || !insuranceDocUrl) {
      toast({ 
        title: "Missing Documents", 
        description: "Please upload RC and Insurance documents before submitting", 
        variant: "destructive" 
      });
      return;
    }
    
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
                            className="w-full h-10 md:h-9 rounded-md border border-input bg-background px-3 py-2 text-sm md:text-base touch-manipulation"
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
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full h-10 md:h-9 rounded-md border border-input bg-background px-3 py-2 text-sm md:text-base touch-manipulation"
                            data-testid="select-category"
                          >
                            {vehicleType === "car" ? (
                              <>
                                <option value="economy">Economy Cars</option>
                                <option value="hatchback">Hatchback</option>
                                <option value="sedan">Sedan</option>
                                <option value="compact">Compact Cars</option>
                                <option value="suv">SUV/XUV</option>
                                <option value="premium">Premium Cars</option>
                                <option value="luxury">Luxury Cars</option>
                                <option value="supercars">Super Cars</option>
                              </>
                            ) : (
                              <>
                                <option value="commuter_bike">Commuter Bikes</option>
                                <option value="sports_bike">Sports Bikes</option>
                                <option value="cruiser_bike">Cruiser Bikes</option>
                                <option value="premium_bike">Premium Bikes</option>
                              </>
                            )}
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
                            className="w-full h-10 md:h-9 rounded-md border border-input bg-background px-3 py-2 text-sm md:text-base touch-manipulation"
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
                            className="w-full h-10 md:h-9 rounded-md border border-input bg-background px-3 py-2 text-sm md:text-base touch-manipulation"
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
                            className="w-full h-10 md:h-9 rounded-md border border-input bg-background px-3 py-2 text-sm md:text-base touch-manipulation"
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

                {/* Availability Section */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold">Vehicle Availability</h3>
                  
                  <FormField
                    control={form.control}
                    name="availabilityType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Availability Type</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="w-full h-10 md:h-9 rounded-md border border-input bg-background px-3 py-2 text-sm md:text-base touch-manipulation"
                            data-testid="select-availability-type"
                          >
                            <option value="always">Always Available (system auto-checks bookings)</option>
                            <option value="specific_hours">Specific Hours Only</option>
                          </select>
                        </FormControl>
                        <FormDescription>
                          Choose "Always Available" if vehicle can be rented anytime, or "Specific Hours" for limited availability
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("availabilityType") === "specific_hours" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="availableFromTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Available From</FormLabel>
                            <FormControl>
                              <Input 
                                type="time" 
                                {...field} 
                                data-testid="input-available-from"
                              />
                            </FormControl>
                            <FormDescription>
                              e.g., 09:00 AM
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="availableToTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Available To</FormLabel>
                            <FormControl>
                              <Input 
                                type="time" 
                                {...field} 
                                data-testid="input-available-to"
                              />
                            </FormControl>
                            <FormDescription>
                              e.g., 05:00 PM
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </div>

                {/* Vehicle Documents Section */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Vehicle Documents
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isAuthenticated 
                      ? "Upload required documents for vehicle verification" 
                      : "Please login or register to upload vehicle documents"}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* RC Document */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        RC (Registration Certificate) *
                      </label>
                      {rcDocUrl ? (
                        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm text-green-700 dark:text-green-300">Document uploaded</span>
                        </div>
                      ) : isAuthenticated ? (
                        <ObjectUploader
                          maxNumberOfFiles={1}
                          maxFileSize={5242880}
                          onGetUploadParameters={async () => {
                            const response = await apiRequest("POST", "/api/objects/upload", {});
                            const data = await response.json();
                            return { method: "PUT" as const, url: data.uploadURL };
                          }}
                          onComplete={(result) => {
                            if (result.successful && result.successful[0]) {
                              setRcDocUrl(result.successful[0].uploadURL || "");
                              toast({ title: "RC Document uploaded successfully" });
                            }
                          }}
                          buttonClassName="w-full"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload RC
                        </ObjectUploader>
                      ) : (
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full" 
                          onClick={() => setShowAuthModal(true)}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Login to Upload
                        </Button>
                      )}
                    </div>

                    {/* Insurance Document */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Insurance Certificate *
                      </label>
                      {insuranceDocUrl ? (
                        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm text-green-700 dark:text-green-300">Document uploaded</span>
                        </div>
                      ) : isAuthenticated ? (
                        <ObjectUploader
                          maxNumberOfFiles={1}
                          maxFileSize={5242880}
                          onGetUploadParameters={async () => {
                            const response = await apiRequest("POST", "/api/objects/upload", {});
                            const data = await response.json();
                            return { method: "PUT" as const, url: data.uploadURL };
                          }}
                          onComplete={(result) => {
                            if (result.successful && result.successful[0]) {
                              setInsuranceDocUrl(result.successful[0].uploadURL || "");
                              toast({ title: "Insurance document uploaded successfully" });
                            }
                          }}
                          buttonClassName="w-full"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Insurance
                        </ObjectUploader>
                      ) : (
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full" 
                          onClick={() => setShowAuthModal(true)}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Login to Upload
                        </Button>
                      )}
                    </div>

                    {/* PUC Document */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Leaf className="h-4 w-4" />
                        PUC (Optional)
                      </label>
                      {pucDocUrl ? (
                        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md">
                          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm text-green-700 dark:text-green-300">Document uploaded</span>
                        </div>
                      ) : isAuthenticated ? (
                        <ObjectUploader
                          maxNumberOfFiles={1}
                          maxFileSize={5242880}
                          onGetUploadParameters={async () => {
                            const response = await apiRequest("POST", "/api/objects/upload", {});
                            const data = await response.json();
                            return { method: "PUT" as const, url: data.uploadURL };
                          }}
                          onComplete={(result) => {
                            if (result.successful && result.successful[0]) {
                              setPucDocUrl(result.successful[0].uploadURL || "");
                              toast({ title: "PUC document uploaded successfully" });
                            }
                          }}
                          buttonClassName="w-full"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload PUC
                        </ObjectUploader>
                      ) : (
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full" 
                          onClick={() => setShowAuthModal(true)}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Login to Upload
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full" 
                  disabled={createVehicleMutation.isPending || !rcDocUrl || !insuranceDocUrl}
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

      <OwnerTermsDialog 
        open={showOwnerTerms} 
        onAccepted={() => setShowOwnerTerms(false)} 
      />
    </div>
  );
}
