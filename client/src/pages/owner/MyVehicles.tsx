import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Car, Plus, Edit, Trash2, Pause, Play, MapPin } from "lucide-react";
import { Link } from "wouter";
import type { Vehicle } from "@shared/schema";
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

export default function MyVehicles() {
  const { toast } = useToast();
  
  const { data: vehicles, isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/owner/vehicles"],
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

  const deleteVehicleMutation = useMutation({
    mutationFn: async (vehicleId: string) => {
      await apiRequest("DELETE", `/api/vehicles/${vehicleId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/owner/vehicles"] });
      toast({
        title: "Success",
        description: "Vehicle deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete vehicle",
        variant: "destructive",
      });
    },
  });

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
            <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2" data-testid="text-my-vehicles-title">
              My Vehicles
            </h1>
            <p className="text-muted-foreground">Manage your listed vehicles</p>
          </div>
          <Link href="/list-vehicle">
            <a>
              <Button size="lg" data-testid="button-add-new-vehicle">
                <Plus className="h-5 w-5 mr-2" />
                Add Vehicle
              </Button>
            </a>
          </Link>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Vehicles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-vehicles-count">{vehicles?.length || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-active-vehicles-count">
                {vehicles?.filter(v => v.available && !v.isPaused).length || 0}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Paused</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400" data-testid="text-paused-vehicles-count">
                {vehicles?.filter(v => v.isPaused).length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vehicles List */}
        {!vehicles || vehicles.length === 0 ? (
          <Card className="p-12 text-center">
            <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No vehicles listed</h3>
            <p className="text-muted-foreground mb-4">
              Start earning by listing your first vehicle
            </p>
            <Link href="/list-vehicle">
              <a>
                <Button data-testid="button-list-first-vehicle">
                  <Plus className="h-4 w-4 mr-2" />
                  List Your First Vehicle
                </Button>
              </a>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id} className="overflow-hidden hover-elevate transition-all" data-testid={`card-vehicle-${vehicle.id}`}>
                <div className="relative">
                  <img
                    src={vehicle.imageUrl}
                    alt={vehicle.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    {vehicle.isPaused ? (
                      <Badge variant="secondary" className="bg-yellow-500/90 text-white">
                        Paused
                      </Badge>
                    ) : vehicle.available ? (
                      <Badge variant="secondary" className="bg-green-500/90 text-white">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-red-500/90 text-white">
                        Unavailable
                      </Badge>
                    )}
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-1" data-testid={`text-vehicle-name-${vehicle.id}`}>
                    {vehicle.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {vehicle.brand} {vehicle.model} • {vehicle.year}
                  </p>
                  
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                    <MapPin className="h-4 w-4" />
                    <span>{vehicle.location}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Pricing</p>
                      <p className="font-bold">₹{vehicle.pricePerHour}/hr • ₹{vehicle.pricePerDay}/day</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href={`/edit-vehicle/${vehicle.id}`}>
                      <a className="flex-1">
                        <Button variant="outline" size="sm" className="w-full" data-testid={`button-edit-${vehicle.id}`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </a>
                    </Link>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAvailabilityMutation.mutate(vehicle.id)}
                      disabled={toggleAvailabilityMutation.isPending}
                      data-testid={`button-toggle-${vehicle.id}`}
                    >
                      {vehicle.isPaused ? (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause className="h-4 w-4 mr-1" />
                          Pause
                        </>
                      )}
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" data-testid={`button-delete-${vehicle.id}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{vehicle.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteVehicleMutation.mutate(vehicle.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
