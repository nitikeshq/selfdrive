import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CheckCircle, XCircle, Users, Car, TrendingUp, DollarSign, Calendar, AlertCircle } from "lucide-react";
import type { Vehicle, User } from "@shared/schema";

interface VehicleWithOwner extends Vehicle {
  owner: User;
}

interface Analytics {
  users: {
    total: number;
    customers: number;
    owners: number;
  };
  vehicles: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  bookings: {
    total: number;
    active: number;
    completed: number;
    cancelled: number;
  };
  revenue: {
    total: string;
    platformEarnings: string;
  };
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithOwner | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const { data: pendingVehicles, isLoading: loadingVehicles } = useQuery<VehicleWithOwner[]>({
    queryKey: ["/api/admin/vehicles/pending"],
  });

  const { data: analytics, isLoading: loadingAnalytics } = useQuery<Analytics>({
    queryKey: ["/api/admin/analytics"],
  });

  const { data: allUsers, isLoading: loadingUsers } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const approveMutation = useMutation({
    mutationFn: async (vehicleId: string) => {
      const response = await apiRequest("POST", `/api/admin/vehicles/${vehicleId}/approve`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vehicles/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics"] });
      toast({
        title: "Vehicle Approved",
        description: "The vehicle has been approved and is now live.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve vehicle",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ vehicleId, reason }: { vehicleId: string; reason: string }) => {
      const response = await apiRequest("POST", `/api/admin/vehicles/${vehicleId}/reject`, { reason });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vehicles/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/analytics"] });
      setShowRejectDialog(false);
      setRejectionReason("");
      setSelectedVehicle(null);
      toast({
        title: "Vehicle Rejected",
        description: "The vehicle has been rejected.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject vehicle",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (vehicle: VehicleWithOwner) => {
    approveMutation.mutate(vehicle.id);
  };

  const handleReject = (vehicle: VehicleWithOwner) => {
    setSelectedVehicle(vehicle);
    setShowRejectDialog(true);
  };

  const confirmReject = () => {
    if (selectedVehicle && rejectionReason.trim()) {
      rejectMutation.mutate({
        vehicleId: selectedVehicle.id,
        reason: rejectionReason,
      });
    }
  };

  const customers = allUsers?.filter(u => u.role === 'customer') || [];
  const owners = allUsers?.filter(u => u.role === 'owner' || u.role === 'admin') || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="text-admin-title">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage vehicles, users, and view analytics</p>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card data-testid="card-total-users">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-users">{analytics?.users.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.users.customers || 0} customers, {analytics?.users.owners || 0} owners
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-vehicles">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-vehicles">{analytics?.vehicles.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.vehicles.pending || 0} pending verification
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-bookings">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-bookings">{analytics?.bookings.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics?.bookings.active || 0} active
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-total-revenue">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Platform Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-platform-earnings">₹{analytics?.revenue.platformEarnings || "0"}</div>
            <p className="text-xs text-muted-foreground">
              Total revenue: ₹{analytics?.revenue.total || "0"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="vehicles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vehicles" data-testid="tab-vehicles">Vehicle Verification</TabsTrigger>
          <TabsTrigger value="users" data-testid="tab-users">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Vehicle Verifications</CardTitle>
              <CardDescription>Review and approve vehicles waiting for verification</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingVehicles ? (
                <div className="text-center py-8">Loading...</div>
              ) : !pendingVehicles || pendingVehicles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No pending vehicles
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Registration</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id} data-testid={`row-vehicle-${vehicle.id}`}>
                        <TableCell className="font-medium">{vehicle.name}</TableCell>
                        <TableCell>{vehicle.owner.firstName} {vehicle.owner.lastName}</TableCell>
                        <TableCell>{vehicle.registrationNumber}</TableCell>
                        <TableCell className="capitalize">{vehicle.type}</TableCell>
                        <TableCell>₹{vehicle.pricePerHour}/hr</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">{vehicle.currentStatus}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApprove(vehicle)}
                              disabled={approveMutation.isPending}
                              data-testid={`button-approve-${vehicle.id}`}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(vehicle)}
                              disabled={rejectMutation.isPending}
                              data-testid={`button-reject-${vehicle.id}`}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customers</CardTitle>
                <CardDescription>{customers.length} total customers</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>KYC</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.slice(0, 5).map((user) => (
                      <TableRow key={user.id} data-testid={`row-customer-${user.id}`}>
                        <TableCell>{user.firstName} {user.lastName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.isKycVerified ? "default" : "secondary"}>
                            {user.isKycVerified ? "Verified" : "Pending"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vehicle Owners</CardTitle>
                <CardDescription>{owners.length} total owners</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>KYC</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {owners.slice(0, 5).map((user) => (
                      <TableRow key={user.id} data-testid={`row-owner-${user.id}`}>
                        <TableCell>{user.firstName} {user.lastName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.isKycVerified ? "default" : "secondary"}>
                            {user.isKycVerified ? "Verified" : "Pending"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent data-testid="dialog-reject-vehicle">
          <DialogHeader>
            <DialogTitle>Reject Vehicle</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this vehicle listing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="mt-2"
                data-testid="textarea-rejection-reason"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} data-testid="button-cancel-reject">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={!rejectionReason.trim() || rejectMutation.isPending}
              data-testid="button-confirm-reject"
            >
              Reject Vehicle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
