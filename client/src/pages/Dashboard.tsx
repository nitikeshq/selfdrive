import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Car, Clock, MapPin, TruckIcon, FileCheck } from "lucide-react";
import type { BookingWithDetails } from "@shared/schema";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: bookings, isLoading } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/bookings"],
  });

  const activeBookings = bookings?.filter(b => b.status === "active" || b.status === "confirmed") || [];
  const pastBookings = bookings?.filter(b => b.status === "completed") || [];

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

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2" data-testid="text-dashboard-title">
            My Bookings
          </h1>
          <p className="text-muted-foreground">Manage your vehicle bookings</p>
        </div>

        {/* Active Bookings */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6" data-testid="text-active-bookings-title">
            Active Bookings
          </h2>
          {activeBookings.length === 0 ? (
            <Card className="p-12 text-center">
              <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No active bookings</h3>
              <p className="text-muted-foreground mb-4">
                You don't have any active bookings at the moment
              </p>
              <Button data-testid="button-browse-vehicles">Browse Vehicles</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {activeBookings.map((booking) => (
                <Card key={booking.id} className="hover-elevate transition-all" data-testid={`card-booking-${booking.id}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <img
                        src={booking.vehicle.imageUrl}
                        alt={booking.vehicle.name}
                        className="w-full md:w-48 h-32 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold mb-1">{booking.vehicle.name}</h3>
                            <p className="text-muted-foreground">
                              {booking.vehicle.brand} {booking.vehicle.model}
                            </p>
                          </div>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Pickup</p>
                              <p className="text-muted-foreground">
                                {format(new Date(booking.startDate), "PPp")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Return</p>
                              <p className="text-muted-foreground">
                                {format(new Date(booking.endDate), "PPp")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            {booking.pickupOption === "parking" ? (
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <TruckIcon className="h-4 w-4 text-muted-foreground" />
                            )}
                            <div>
                              <p className="font-medium">
                                {booking.pickupOption === "parking" ? "Self-Pickup" : "Delivery"}
                              </p>
                              <p className="text-muted-foreground">
                                {booking.pickupOption === "parking" 
                                  ? booking.vehicle.location 
                                  : booking.deliveryAddress || "Home"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <FileCheck className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Payment</p>
                              <p className="text-muted-foreground capitalize">{booking.paymentStatus}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <div className="text-2xl font-bold text-primary">
                            ₹{booking.totalAmount}
                          </div>
                          <Button variant="outline" data-testid={`button-view-details-${booking.id}`}>
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Past Bookings */}
        <div>
          <h2 className="text-2xl font-semibold mb-6" data-testid="text-past-bookings-title">
            Past Bookings
          </h2>
          {pastBookings.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No past bookings</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pastBookings.map((booking) => (
                <Card key={booking.id} className="hover-elevate transition-all" data-testid={`card-past-booking-${booking.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src={booking.vehicle.imageUrl}
                          alt={booking.vehicle.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div>
                          <h4 className="font-semibold">{booking.vehicle.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(booking.startDate), "PP")} - {format(new Date(booking.endDate), "PP")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{booking.totalAmount}</p>
                        <Badge variant="secondary" className="mt-1">Completed</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
