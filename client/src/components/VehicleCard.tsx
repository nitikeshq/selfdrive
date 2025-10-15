import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Fuel, Settings, MapPin } from "lucide-react";
import type { Vehicle } from "@shared/schema";

interface VehicleCardProps {
  vehicle: Vehicle;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <Card className="overflow-hidden hover-elevate active-elevate-2 transition-all" data-testid={`card-vehicle-${vehicle.id}`}>
      <div className="relative h-48 overflow-hidden">
        <img
          src={vehicle.imageUrl}
          alt={vehicle.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
            {vehicle.type === "car" ? "Car" : "Bike"}
          </Badge>
        </div>
        {!vehicle.available && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <Badge variant="destructive">Not Available</Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-lg mb-1" data-testid={`text-vehicle-name-${vehicle.id}`}>
            {vehicle.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {vehicle.brand} {vehicle.model} ({vehicle.year})
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {vehicle.seats && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{vehicle.seats} Seats</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Fuel className="h-4 w-4" />
            <span className="capitalize">{vehicle.fuelType}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Settings className="h-4 w-4" />
            <span className="capitalize">{vehicle.transmission}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{vehicle.location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-2xl font-bold text-primary" data-testid={`text-price-hour-${vehicle.id}`}>
              ₹{vehicle.pricePerHour}
            </div>
            <div className="text-xs text-muted-foreground">per hour</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold" data-testid={`text-price-day-${vehicle.id}`}>
              ₹{vehicle.pricePerDay}
            </div>
            <div className="text-xs text-muted-foreground">per day</div>
          </div>
        </div>

        <Link href={`/book/${vehicle.id}`}>
          <Button 
            className="w-full" 
            disabled={!vehicle.available}
            data-testid={`button-book-${vehicle.id}`}
          >
            Book Now
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
