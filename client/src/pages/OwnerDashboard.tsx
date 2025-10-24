import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, DollarSign, Calendar, TrendingUp, Plus } from "lucide-react";
import { Link, useLocation } from "wouter";
import type { Vehicle, BookingWithDetails } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function OwnerDashboard() {
  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const { data: vehicles, isLoading: vehiclesLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/owner/vehicles"],
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/owner/bookings"],
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: async (vehicleId: string) => {
      const response = await apiRequest("PATCH", `/api/vehicles/${vehicleId}/toggle-pause`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/vehicles"] });
      toast({
        title: "Success",
        description: "Vehicle availability updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update vehicle availability",
        variant: "destructive",
      });
    },
  });

  const totalEarnings = bookings?.reduce((sum, booking) => {
    if (booking.paymentStatus === "paid") {
      return sum + parseFloat(booking.totalAmount);
    }
    return sum;
  }, 0) || 0;

  // Calculate commission (30% to platform, 70% to owner)
  const platformCommission = totalEarnings * 0.3;
  const netEarnings = totalEarnings * 0.7;

  const activeBookings = bookings?.filter(b => b.status === "active" || b.status === "confirmed").length || 0;
  const totalVehicles = vehicles?.length || 0;
  const availableVehicles = vehicles?.filter(v => v.available).length || 0;

  const isLoading = vehiclesLoading || bookingsLoading;

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2" data-testid="text-owner-dashboard-title">
              Owner Dashboard
            </h1>
            <p className="text-muted-foreground">Manage your vehicles and track earnings</p>
          </div>
          <Link href="/list-vehicle" asChild>
            <Button size="lg" data-testid="button-add-vehicle">
              <Plus className="h-5 w-5 mr-2" />
              Add Vehicle
            </Button>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card 
            className="hover-elevate cursor-pointer transition-all border-2 hover:border-primary"
            onClick={() => setLocation('/owner/vehicles')}
            data-testid="card-quick-action-vehicles"
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Car className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">My Vehicles</h3>
                  <p className="text-sm text-muted-foreground">Manage your vehicle listings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="hover-elevate cursor-pointer transition-all border-2 hover:border-primary"
            onClick={() => setLocation('/owner/transactions')}
            data-testid="card-quick-action-transactions"
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Transactions</h3>
                  <p className="text-sm text-muted-foreground">View earnings and commission</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="hover-elevate transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-net-earnings">₹{netEarnings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Net earnings (70%)
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Commission</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-platform-commission">₹{platformCommission.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                30% platform fee
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-vehicles">{totalVehicles}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Listed vehicles
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-active-bookings">{activeBookings}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Current rentals
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Your Vehicles */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6" data-testid="text-your-vehicles-title">
            Your Vehicles
          </h2>
          {vehicles && vehicles.length === 0 ? (
            <Card className="p-12 text-center">
              <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No vehicles listed</h3>
              <p className="text-muted-foreground mb-4">
                Start earning by listing your first vehicle
              </p>
              <Link href="/list-vehicle" asChild>
                <Button data-testid="button-list-first-vehicle">
                  <Plus className="h-4 w-4 mr-2" />
                  List Your Vehicle
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles?.map((vehicle) => (
                <Card key={vehicle.id} className="hover-elevate transition-all" data-testid={`card-owner-vehicle-${vehicle.id}`}>
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={vehicle.imageUrl}
                      alt={vehicle.name}
                      className="w-full h-full object-cover"
                    />
                    {vehicle.available ? (
                      <Badge className="absolute top-3 right-3 bg-green-500">Available</Badge>
                    ) : (
                      <Badge variant="destructive" className="absolute top-3 right-3">Unavailable</Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{vehicle.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {vehicle.brand} {vehicle.model}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Hourly</p>
                        <p className="font-bold">₹{vehicle.pricePerHour}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Daily</p>
                        <p className="font-bold">₹{vehicle.pricePerDay}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/edit-vehicle/${vehicle.id}`} asChild>
                        <Button variant="outline" className="flex-1" data-testid={`button-edit-vehicle-${vehicle.id}`}>
                          Edit
                        </Button>
                      </Link>
                      <Button 
                        variant={vehicle.available ? "secondary" : "default"} 
                        className="flex-1"
                        onClick={() => toggleAvailabilityMutation.mutate(vehicle.id)}
                        disabled={toggleAvailabilityMutation.isPending}
                        data-testid={`button-toggle-availability-${vehicle.id}`}
                      >
                        {vehicle.available ? "Mark Unavailable" : "Mark Available"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings */}
        <div>
          <h2 className="text-2xl font-semibold mb-6" data-testid="text-recent-bookings-title">
            Recent Bookings
          </h2>
          {bookings && bookings.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No bookings yet</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings?.slice(0, 5).map((booking) => (
                <Card 
                  key={booking.id} 
                  className={`hover-elevate transition-all ${
                    booking.status === "pending" ? "border-2 border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20" : ""
                  }`}
                  data-testid={`card-owner-booking-${booking.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <img
                          src={booking.vehicle.imageUrl}
                          alt={booking.vehicle.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{booking.vehicle.name}</h4>
                            {booking.status === "pending" && (
                              <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-full font-medium border border-orange-500/30 animate-pulse">
                                💰 Lead - Follow Up!
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            By {booking.user.firstName} {booking.user.lastName}
                          </p>
                          {booking.status === "pending" && (booking.user.phone || booking.user.email) && (
                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                              📞 Contact: {booking.user.phone || booking.user.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">₹{booking.totalAmount}</p>
                        <Badge className={
                          booking.status === "confirmed" ? "bg-blue-500/10 text-blue-600" :
                          booking.status === "active" ? "bg-green-500/10 text-green-600" :
                          booking.status === "completed" ? "bg-gray-500/10 text-gray-600" :
                          booking.status === "lead" ? "bg-purple-500/10 text-purple-600" :
                          booking.status === "pending" ? "bg-orange-500/10 text-orange-600 border border-orange-500/30" :
                          "bg-yellow-500/10 text-yellow-600"
                        }>
                          {booking.status === "pending" ? "Payment Pending" : booking.status}
                        </Badge>
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
