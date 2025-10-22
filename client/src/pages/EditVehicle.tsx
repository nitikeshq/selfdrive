import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVehicleSchema, type InsertVehicle } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import GooglePlacesAutocomplete from "@/components/GooglePlacesAutocomplete";
import type { Vehicle } from "@shared/schema";

export default function EditVehicle() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: vehicle, isLoading } = useQuery<Vehicle>({
    queryKey: ["/api/vehicles", id],
  });

  type VehicleFormData = Omit<InsertVehicle, "ownerId">;

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(insertVehicleSchema.omit({ ownerId: true })),
    values: vehicle ? {
      name: vehicle.name,
      type: vehicle.type,
      category: vehicle.category,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      seats: vehicle.seats,
      fuelType: vehicle.fuelType,
      transmission: vehicle.transmission,
      registrationNumber: vehicle.registrationNumber,
      pricePerHour: vehicle.pricePerHour,
      pricePerDay: vehicle.pricePerDay,
      location: vehicle.location,
      locationPlaceId: vehicle.locationPlaceId,
      locationLat: vehicle.locationLat,
      locationLng: vehicle.locationLng,
      ownerLocation: vehicle.ownerLocation,
      imageUrl: vehicle.imageUrl,
      features: vehicle.features,
      hasExtraInsurance: vehicle.hasExtraInsurance,
      extraInsuranceCost: vehicle.extraInsuranceCost,
      hasGpsTracking: vehicle.hasGpsTracking,
      gpsDeviceId: vehicle.gpsDeviceId,
      available: vehicle.available,
      isPaused: vehicle.isPaused,
      availabilityType: vehicle.availabilityType || "always",
      availableFromTime: vehicle.availableFromTime || "09:00",
      availableToTime: vehicle.availableToTime || "17:00",
    } : undefined,
  });

  const vehicleType = form.watch("type");

  const updateVehicleMutation = useMutation({
    mutationFn: async (data: VehicleFormData) => {
      const response = await apiRequest("PATCH", `/api/vehicles/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/vehicles"] });
      toast({
        title: "Success",
        description: "Vehicle updated successfully",
      });
      setLocation("/owner-dashboard");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update vehicle",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: VehicleFormData) => {
    updateVehicleMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Vehicle Not Found</h2>
          <Button onClick={() => setLocation("/owner-dashboard")} className="mt-4">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setLocation("/owner-dashboard")}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2" data-testid="text-edit-vehicle-title">
            Edit Vehicle
          </h1>
          <p className="text-muted-foreground">Update your vehicle details</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Hyundai i20" {...field} data-testid="input-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-type">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="car">Car</SelectItem>
                            <SelectItem value="bike">Bike</SelectItem>
                          </SelectContent>
                        </Select>
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
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vehicleType === "car" ? (
                              <>
                                <SelectItem value="economy">Economy</SelectItem>
                                <SelectItem value="hatchback">Hatchback</SelectItem>
                                <SelectItem value="sedan">Sedan</SelectItem>
                                <SelectItem value="prime_sedan">Prime Sedan</SelectItem>
                                <SelectItem value="compact">Compact</SelectItem>
                                <SelectItem value="suv">SUV</SelectItem>
                                <SelectItem value="xuv">XUV</SelectItem>
                                <SelectItem value="muv">MUV</SelectItem>
                                <SelectItem value="compact_suv">Compact SUV</SelectItem>
                                <SelectItem value="premium">Premium</SelectItem>
                                <SelectItem value="luxury">Luxury</SelectItem>
                                <SelectItem value="luxury_sedan">Luxury Sedan</SelectItem>
                                <SelectItem value="supercars">Super Cars</SelectItem>
                                <SelectItem value="sports_car">Sports Car</SelectItem>
                                <SelectItem value="ev_car">EV Car</SelectItem>
                              </>
                            ) : (
                              <>
                                <SelectItem value="commuter_bike">Commuter Bike</SelectItem>
                                <SelectItem value="standard_bike">Standard Bike</SelectItem>
                                <SelectItem value="sports_bike">Sports Bike</SelectItem>
                                <SelectItem value="cruiser_bike">Cruiser Bike</SelectItem>
                                <SelectItem value="premium_bike">Premium Bike</SelectItem>
                                <SelectItem value="scooter">Scooter</SelectItem>
                                <SelectItem value="ev_bike">EV Bike</SelectItem>
                                <SelectItem value="ev_scooter">EV Scooter</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
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
                          <Input placeholder="e.g., Hyundai" {...field} data-testid="input-brand" />
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
                          <Input placeholder="e.g., i20" {...field} data-testid="input-model" />
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
                            placeholder="2024" 
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            data-testid="input-year"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fuelType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fuel Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-fuel-type">
                              <SelectValue placeholder="Select fuel type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="petrol">Petrol</SelectItem>
                            <SelectItem value="diesel">Diesel</SelectItem>
                            <SelectItem value="electric">Electric</SelectItem>
                          </SelectContent>
                        </Select>
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
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-transmission">
                              <SelectValue placeholder="Select transmission" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="manual">Manual</SelectItem>
                            <SelectItem value="automatic">Automatic</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="registrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Number</FormLabel>
                      <FormControl>
                        <Input placeholder="OD-01-AB-1234" {...field} data-testid="input-registration" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pricePerHour"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price Per Hour (₹)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="100" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value)}
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
                        <FormLabel>Price Per Day (₹)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="1500" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value)}
                            data-testid="input-price-day"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle>Parking Location</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Parking Location</FormLabel>
                      <FormControl>
                        <GooglePlacesAutocomplete
                          value={field.value}
                          onChange={(value: string, placeId?: string | null, lat?: string | null, lng?: string | null) => {
                            field.onChange(value);
                            form.setValue("locationPlaceId", placeId || null);
                            form.setValue("locationLat", lat || null);
                            form.setValue("locationLng", lng || null);
                          }}
                          placeholder="Search for parking location in Bhubaneswar"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Image URL */}
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Image</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} data-testid="input-image-url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Availability */}
            <Card>
              <CardHeader>
                <CardTitle>Vehicle Availability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="availabilityType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Availability Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-availability-type">
                            <SelectValue placeholder="Select availability type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="always">Always Available (system auto-checks bookings)</SelectItem>
                          <SelectItem value="specific_hours">Specific Hours Only</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("availabilityType") === "specific_hours" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              value={field.value || ""}
                              data-testid="input-available-from"
                            />
                          </FormControl>
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
                              value={field.value || ""}
                              data-testid="input-available-to"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/owner-dashboard")}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateVehicleMutation.isPending}
                data-testid="button-save"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
