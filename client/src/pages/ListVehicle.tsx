import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Car, Upload, MapPin } from "lucide-react";
import { useState } from "react";
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

type VehicleFormData = z.infer<typeof vehicleFormSchema>;

export default function ListVehicle() {
  const [imagePreview, setImagePreview] = useState<string>("");

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

  const onSubmit = (data: VehicleFormData) => {
    console.log("Vehicle data:", data);
    // This will be connected to backend in Phase 2
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
                            onChange={field.onChange}
                            onPlaceSelect={(details) => {
                              form.setValue("location", details.address);
                              form.setValue("locationPlaceId", details.placeId);
                              form.setValue("locationLat", details.lat);
                              form.setValue("locationLng", details.lng);
                            }}
                            placeholder="Search for parking location in Bhubaneswar"
                            restrictToBhubaneswar={true}
                            testId="input-location"
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Select precise parking location using Google Maps
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

                <Button type="submit" size="lg" className="w-full" data-testid="button-submit-vehicle">
                  <Upload className="h-5 w-5 mr-2" />
                  List Vehicle
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
