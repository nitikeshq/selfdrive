import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VehicleCard } from "@/components/VehicleCard";
import { DateTimePicker } from "@/components/DateTimePicker";
import { SEO } from "@/components/SEO";
import { Search, Filter, X } from "lucide-react";
import type { Vehicle } from "@shared/schema";

export default function Vehicles() {
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [pickupDateTime, setPickupDateTime] = useState<string>("");
  const [returnDateTime, setReturnDateTime] = useState<string>("");

  // Initialize filters from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const urlLocation = params.get('location');
    const urlType = params.get('type');
    const urlPickupTime = params.get('pickupTime');
    const urlReturnTime = params.get('returnTime');
    
    if (urlLocation) setSelectedLocation(urlLocation);
    if (urlType) setSelectedType(urlType);
    if (urlPickupTime) setPickupDateTime(urlPickupTime);
    if (urlReturnTime) setReturnDateTime(urlReturnTime);
  }, [location]);
  
  const { data: vehicles, isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  // Helper function to check if vehicle is available at requested time
  const isVehicleAvailableAtTime = (vehicle: Vehicle): boolean => {
    if (!pickupDateTime) return true; // No time filter, show all vehicles
    
    // If vehicle has specific hours restriction
    if (vehicle.availabilityType === "specific_hours" && vehicle.availableFromTime && vehicle.availableToTime) {
      const pickupDate = new Date(pickupDateTime);
      const pickupHour = pickupDate.getHours();
      const pickupMinute = pickupDate.getMinutes();
      
      // Convert availability times to minutes from midnight
      const [fromHour, fromMin] = vehicle.availableFromTime.split(':').map(Number);
      const [toHour, toMin] = vehicle.availableToTime.split(':').map(Number);
      
      const pickupMinutes = pickupHour * 60 + pickupMinute;
      const fromMinutes = fromHour * 60 + fromMin;
      const toMinutes = toHour * 60 + toMin;
      
      // Check if availability window crosses midnight
      const crossesMidnight = toMinutes < fromMinutes;
      
      let pickupValid = false;
      if (crossesMidnight) {
        // Available from fromMinutes to 23:59 AND from 00:00 to toMinutes
        pickupValid = pickupMinutes >= fromMinutes || pickupMinutes <= toMinutes;
      } else {
        // Normal case: available from fromMinutes to toMinutes
        pickupValid = pickupMinutes >= fromMinutes && pickupMinutes <= toMinutes;
      }
      
      if (!pickupValid) return false;
      
      // Also check return time if provided
      if (returnDateTime) {
        const returnDate = new Date(returnDateTime);
        const returnHour = returnDate.getHours();
        const returnMinute = returnDate.getMinutes();
        const returnMinutes = returnHour * 60 + returnMinute;
        
        let returnValid = false;
        if (crossesMidnight) {
          returnValid = returnMinutes >= fromMinutes || returnMinutes <= toMinutes;
        } else {
          returnValid = returnMinutes >= fromMinutes && returnMinutes <= toMinutes;
        }
        
        if (!returnValid) return false;
      }
    }
    
    return true;
  };

  const filteredVehicles = vehicles?.filter((vehicle) => {
    const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || vehicle.type === selectedType;
    const matchesLocation = !selectedLocation || vehicle.location === selectedLocation;
    const matchesTime = isVehicleAvailableAtTime(vehicle);
    
    return matchesSearch && matchesType && matchesLocation && matchesTime;
  }) || [];

  const uniqueLocations = Array.from(new Set(vehicles?.map(v => v.location) || []));

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("");
    setSelectedLocation("");
    setPickupDateTime("");
    setReturnDateTime("");
  };

  const hasActiveFilters = searchTerm || selectedType || selectedLocation || pickupDateTime || returnDateTime;

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Browse Vehicles - Find Your Perfect Ride"
        description="Explore our wide range of self-drive cars and bikes available for rent. Filter by location, type, and availability. Book instantly with hourly or daily rates."
        keywords="available cars, bike rentals, vehicle search, car booking, hourly rental, daily rental"
      />
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2" data-testid="text-vehicles-title">
            Browse Vehicles
          </h1>
          <p className="text-muted-foreground">Find the perfect vehicle for your journey</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, brand, or model"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-vehicles"
                  />
                </div>
              </div>
              <div>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  data-testid="select-vehicle-type-filter"
                >
                  <option value="">All Types</option>
                  <option value="car">Cars</option>
                  <option value="bike">Bikes</option>
                </select>
              </div>
              <div>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  data-testid="select-location-filter"
                >
                  <option value="">All Locations</option>
                  {uniqueLocations.map((location) => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
              <div>
                <DateTimePicker
                  value={pickupDateTime}
                  onChange={setPickupDateTime}
                  placeholder="Pickup date & time"
                  data-testid="input-pickup-filter"
                />
              </div>
              <div>
                <DateTimePicker
                  value={returnDateTime}
                  onChange={setReturnDateTime}
                  placeholder="Return date & time"
                  data-testid="input-return-filter"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {searchTerm && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {searchTerm}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm("")} />
                  </Badge>
                )}
                {selectedType && (
                  <Badge variant="secondary" className="gap-1">
                    Type: {selectedType}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedType("")} />
                  </Badge>
                )}
                {selectedLocation && (
                  <Badge variant="secondary" className="gap-1">
                    Location: {selectedLocation}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedLocation("")} />
                  </Badge>
                )}
                {pickupDateTime && (
                  <Badge variant="secondary" className="gap-1">
                    Pickup: {new Date(pickupDateTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setPickupDateTime("")} />
                  </Badge>
                )}
                {returnDateTime && (
                  <Badge variant="secondary" className="gap-1">
                    Return: {new Date(returnDateTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setReturnDateTime("")} />
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
                  Clear All
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-96 animate-pulse bg-muted" />
            ))}
          </div>
        ) : filteredVehicles.length > 0 ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground" data-testid="text-results-count">
                Showing {filteredVehicles.length} {filteredVehicles.length === 1 ? "vehicle" : "vehicles"}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicles.map((vehicle) => (
                <VehicleCard 
                  key={vehicle.id} 
                  vehicle={vehicle} 
                  pickupDateTime={pickupDateTime}
                  returnDateTime={returnDateTime}
                />
              ))}
            </div>
          </>
        ) : (
          <Card className="p-12 text-center">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No vehicles found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or search terms
            </p>
            {hasActiveFilters && (
              <Button onClick={clearFilters} data-testid="button-clear-filters-empty">
                Clear Filters
              </Button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
