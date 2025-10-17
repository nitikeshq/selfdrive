import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Wallet, Calendar, Car, User } from "lucide-react";
import type { BookingWithDetails } from "@shared/schema";
import { format } from "date-fns";

export default function Transactions() {
  const { data: bookings, isLoading } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/owner/bookings"],
  });

  const paidBookings = bookings?.filter(b => b.paymentStatus === "paid") || [];
  const totalRevenue = paidBookings.reduce((sum, b) => sum + parseFloat(b.totalAmount), 0);
  const platformCommission = totalRevenue * 0.3;
  const netEarnings = totalRevenue * 0.7;
  const walletBalance = netEarnings; // In real app, this would be actual wallet balance

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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "failed":
        return "bg-red-500/10 text-red-600 dark:text-red-400";
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
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
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2" data-testid="text-transactions-title">
            Transactions & Earnings
          </h1>
          <p className="text-muted-foreground">Track your revenue and commission</p>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="hover-elevate transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-revenue">₹{totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                From {paidBookings.length} bookings
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-net-earnings">
                ₹{netEarnings.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                70% of revenue
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Commission</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-commission">₹{platformCommission.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                30% platform fee
              </p>
            </CardContent>
          </Card>

          <Card className="hover-elevate transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-wallet-balance">
                ₹{walletBalance.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Available to withdraw
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <div>
          <h2 className="text-2xl font-semibold mb-6" data-testid="text-transaction-history-title">
            Transaction History
          </h2>
          
          {!bookings || bookings.length === 0 ? (
            <Card className="p-8 text-center">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No transactions yet</h3>
              <p className="text-muted-foreground">
                Your earnings will appear here once you receive bookings
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className="hover-elevate transition-all" data-testid={`card-transaction-${booking.id}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 rounded-lg overflow-hidden">
                            <img
                              src={booking.vehicle.imageUrl}
                              alt={booking.vehicle.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg truncate" data-testid={`text-booking-vehicle-${booking.id}`}>
                              {booking.vehicle.name}
                            </h3>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>Customer: {(booking as any).customer?.firstName || 'Guest'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {format(new Date(booking.startDate), "MMM d")} - {format(new Date(booking.endDate), "MMM d, yyyy")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total Amount</p>
                          <p className="text-2xl font-bold" data-testid={`text-amount-${booking.id}`}>₹{booking.totalAmount}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Your Earnings</p>
                          <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                            ₹{(parseFloat(booking.totalAmount) * 0.7).toLocaleString()}
                          </p>
                        </div>
                        <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                          {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
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
