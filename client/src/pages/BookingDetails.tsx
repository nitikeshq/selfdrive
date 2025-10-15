import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, TruckIcon, FileCheck, AlertCircle, ArrowLeft } from "lucide-react";
import type { BookingWithDetails } from "@shared/schema";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function BookingDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: booking, isLoading } = useQuery<BookingWithDetails>({
    queryKey: ["/api/bookings", id],
  });

  const cancelBookingMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/bookings/${id}/cancel`, {});
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings", id] });
      toast({
        title: "Booking Cancelled",
        description: data.message,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cancel booking",
        variant: "destructive",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "active":
        return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "completed":
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
      case "cancelled":
        return "bg-red-500/10 text-red-600 dark:text-red-400";
      default:
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Booking Not Found</h2>
          <Button onClick={() => setLocation("/dashboard")} className="mt-4">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const canCancel = booking.status !== "cancelled" && booking.status !== "completed";

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setLocation("/dashboard")}
          className="mb-6"
          data-testid="button-back-to-dashboard"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl sm:text-4xl font-display font-bold" data-testid="text-booking-details-title">
              Booking Details
            </h1>
            <Badge className={getStatusColor(booking.status)}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Badge>
          </div>
          <p className="text-muted-foreground">Booking ID: {booking.id}</p>
        </div>

        {/* Vehicle Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={booking.vehicle.imageUrl}
                alt={booking.vehicle.name}
                loading="lazy"
                className="w-full md:w-64 h-48 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="text-2xl font-semibold mb-2">{booking.vehicle.name}</h3>
                <p className="text-muted-foreground mb-4">
                  {booking.vehicle.brand} {booking.vehicle.model} ({booking.vehicle.year})
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Fuel Type</p>
                    <p className="font-medium capitalize">{booking.vehicle.fuelType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Transmission</p>
                    <p className="font-medium capitalize">{booking.vehicle.transmission}</p>
                  </div>
                  {booking.vehicle.seats && (
                    <div>
                      <p className="text-sm text-muted-foreground">Seats</p>
                      <p className="font-medium">{booking.vehicle.seats}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium capitalize">{booking.vehicle.type}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Booking Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <p className="font-medium">Pickup Date & Time</p>
                  <p className="text-muted-foreground">
                    {format(new Date(booking.startDate), "PPp")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <p className="font-medium">Return Date & Time</p>
                  <p className="text-muted-foreground">
                    {format(new Date(booking.endDate), "PPp")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                {booking.pickupOption === "parking" ? (
                  <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                ) : (
                  <TruckIcon className="h-5 w-5 text-muted-foreground mt-1" />
                )}
                <div>
                  <p className="font-medium">
                    {booking.pickupOption === "parking" ? "Self-Pickup Location" : "Delivery Address"}
                  </p>
                  <p className="text-muted-foreground">
                    {booking.pickupOption === "parking" 
                      ? booking.vehicle.location 
                      : booking.deliveryAddress || "Home"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileCheck className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <p className="font-medium">Payment Status</p>
                  <p className="text-muted-foreground capitalize">{booking.paymentStatus}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rental Amount</span>
                <span className="font-medium">₹{(parseFloat(booking.totalAmount) - parseFloat(booking.deliveryCharge)).toFixed(2)}</span>
              </div>
              {parseFloat(booking.deliveryCharge || "0") > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Charge</span>
                  <span className="font-medium">₹{booking.deliveryCharge || "0"}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between">
                <span className="text-lg font-semibold">Total Amount</span>
                <span className="text-2xl font-bold text-primary">₹{booking.totalAmount}</span>
              </div>
              {booking.refundAmount && parseFloat(booking.refundAmount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Refund Amount</span>
                  <span className="font-semibold">₹{booking.refundAmount}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {canCancel && (
          <Card>
            <CardHeader>
              <CardTitle>Cancellation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Cancellation Policy:</strong>
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>3+ days before pickup: 100% refund (minus 2% processing fee)</li>
                  <li>1-3 days before pickup: 80% refund</li>
                  <li>Less than 24 hours: 60% refund</li>
                </ul>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    disabled={cancelBookingMutation.isPending}
                    data-testid="button-cancel-booking"
                  >
                    Cancel Booking
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. Your refund will be processed according to our cancellation policy.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => cancelBookingMutation.mutate()}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Yes, Cancel Booking
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
