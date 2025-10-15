import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar, MapPin, TruckIcon, FileUp, CreditCard, Users, Fuel, Settings } from "lucide-react";
import type { Vehicle } from "@shared/schema";

const bookingFormSchema = z.object({
  startDate: z.string().min(1, "Pickup date is required"),
  endDate: z.string().min(1, "Return date is required"),
  pickupOption: z.enum(["parking", "delivery"]),
  deliveryAddress: z.string().optional(),
  dlPhoto: z.instanceof(File).optional(),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

export default function BookVehicle() {
  const [, params] = useRoute("/book/:id");
  const vehicleId = params?.id;
  const [selectedOption, setSelectedOption] = useState<"parking" | "delivery">("parking");
  const [dlPreview, setDlPreview] = useState<string>("");

  const { data: vehicle, isLoading } = useQuery<Vehicle>({
    queryKey: ["/api/vehicles", vehicleId],
    enabled: !!vehicleId,
  });

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      pickupOption: "parking",
      startDate: "",
      endDate: "",
      deliveryAddress: "",
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
  const totalAmount = calculateTotal(watchedStartDate, watchedEndDate);
  const deliveryCharge = selectedOption === "delivery" ? 200 : 0;

  const handleDlUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("dlPhoto", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setDlPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: BookingFormData) => {
    console.log("Booking data:", data);
    // This will be connected to backend in Phase 2
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
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Vehicle not found</h2>
          <p className="text-muted-foreground">The vehicle you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2" data-testid="text-booking-title">Book Your Vehicle</h1>
          <p className="text-muted-foreground">Complete the details below to confirm your booking</p>
        </div>

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
                              }}
                              value={field.value}
                              className="space-y-4"
                            >
                              <div
                                className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer hover-elevate ${
                                  selectedOption === "parking" ? "border-primary bg-primary/5" : "border-border"
                                }`}
                                onClick={() => {
                                  field.onChange("parking");
                                  setSelectedOption("parking");
                                }}
                              >
                                <RadioGroupItem value="parking" id="parking" data-testid="radio-parking" />
                                <div className="flex-1">
                                  <Label htmlFor="parking" className="flex items-center gap-2 cursor-pointer">
                                    <MapPin className="h-5 w-5 text-accent-foreground" />
                                    <span className="font-semibold">Self-Pickup from Parking</span>
                                  </Label>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Pick up from {vehicle.location}
                                  </p>
                                  <Badge variant="secondary" className="mt-2">Standard Pricing</Badge>
                                </div>
                              </div>

                              <div
                                className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer hover-elevate ${
                                  selectedOption === "delivery" ? "border-primary bg-primary/5" : "border-border"
                                }`}
                                onClick={() => {
                                  field.onChange("delivery");
                                  setSelectedOption("delivery");
                                }}
                              >
                                <RadioGroupItem value="delivery" id="delivery" data-testid="radio-delivery" />
                                <div className="flex-1">
                                  <Label htmlFor="delivery" className="flex items-center gap-2 cursor-pointer">
                                    <TruckIcon className="h-5 w-5 text-primary" />
                                    <span className="font-semibold">Doorstep Delivery</span>
                                  </Label>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Get vehicle delivered to your address
                                  </p>
                                  <Badge className="mt-2">+ ₹200 Delivery Charge</Badge>
                                </div>
                              </div>
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

                {/* DL Upload */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileUp className="h-5 w-5" />
                      Driver's License Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Please upload a clear photo of your driver's license for verification
                      </p>
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover-elevate transition-all">
                        {dlPreview ? (
                          <div className="space-y-4">
                            <img
                              src={dlPreview}
                              alt="DL Preview"
                              className="max-h-48 mx-auto rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById("dl-upload")?.click()}
                              data-testid="button-change-dl"
                            >
                              Change Photo
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <FileUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById("dl-upload")?.click()}
                              data-testid="button-upload-dl"
                            >
                              Upload Driver's License
                            </Button>
                          </div>
                        )}
                        <input
                          id="dl-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleDlUpload}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button type="submit" size="lg" className="w-full" data-testid="button-proceed-payment">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Proceed to Payment
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
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-semibold">Total Amount</span>
                  <span className="text-2xl font-bold text-primary" data-testid="text-total-amount">
                    ₹{totalAmount}
                  </span>
                </div>

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
    </div>
  );
}
