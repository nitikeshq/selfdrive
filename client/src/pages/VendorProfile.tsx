import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { Building2, Star, Car, MapPin, Mail, Phone, ArrowLeft } from "lucide-react";

interface Vehicle {
  id: string;
  name: string;
  type: string;
  category: string;
  brand: string;
  model: string;
  year: number;
  pricePerDay: string;
  imageUrl: string;
  isAvailable: boolean;
}

interface VendorProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  isVendor: boolean;
  companyName: string | null;
  companyLogoUrl: string | null;
  averageRatingAsOwner: string;
  totalRatingsAsOwner: number;
  vehicles: Vehicle[];
  stats: {
    totalVehicles: number;
    availableVehicles: number;
  };
}

export default function VendorProfile() {
  const [, params] = useRoute("/vendor/:id");
  const vendorId = params?.id;

  const { data: vendor, isLoading } = useQuery<VendorProfile>({
    queryKey: [`/api/vendors/${vendorId}`],
    enabled: !!vendorId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Rental Partner Not Found</h2>
          <p className="text-muted-foreground mb-4">The rental partner you're looking for doesn't exist.</p>
          <Link href="/vendors">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Rental Partners
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const displayName = vendor.isVendor && vendor.companyName
    ? vendor.companyName
    : `${vendor.firstName} ${vendor.lastName}`;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${displayName} - Vehicle Fleet | SelfDriveKaro`}
        description={`Browse ${displayName}'s fleet of ${vendor.stats.totalVehicles} vehicles in Bhubaneswar. Rating: ${parseFloat(vendor.averageRatingAsOwner).toFixed(1)}/5 from ${vendor.totalRatingsAsOwner} reviews.`}
      />

      {/* Header Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background py-12">
        <div className="container mx-auto px-4">
          <Link href="/vendors">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to All Rental Partners
            </Button>
          </Link>

          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Logo/Avatar */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-32 w-32 mb-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      {vendor.companyLogoUrl ? (
                        <img
                          src={vendor.companyLogoUrl}
                          alt={displayName}
                          className="h-28 w-28 object-contain"
                        />
                      ) : vendor.isVendor ? (
                        <Building2 className="h-16 w-16 text-primary" />
                      ) : (
                        <div className="h-28 w-28 rounded-full bg-primary/20 flex items-center justify-center text-4xl font-bold text-primary">
                          {vendor.firstName.charAt(0)}{vendor.lastName.charAt(0)}
                        </div>
                      )}
                    </div>
                    {vendor.isVendor && (
                      <Badge variant="secondary">
                        <Building2 className="h-3 w-3 mr-1" />
                        Verified Vendor
                      </Badge>
                    )}
                  </div>

                  {/* Vendor Info */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <h1 className="text-3xl font-bold mb-2" data-testid="text-vendor-name">
                        {displayName}
                      </h1>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold text-xl">
                            {parseFloat(vendor.averageRatingAsOwner).toFixed(1)}
                          </span>
                        </div>
                        <span className="text-muted-foreground">
                          ({vendor.totalRatingsAsOwner} {vendor.totalRatingsAsOwner === 1 ? 'review' : 'reviews'})
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Car className="h-4 w-4" />
                          <span className="text-sm">Total Fleet</span>
                        </div>
                        <div className="text-2xl font-bold">{vendor.stats.totalVehicles}</div>
                      </div>
                      <div className="p-4 bg-green-500/10 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-400 mb-1">
                          <Car className="h-4 w-4" />
                          <span className="text-sm">Available Now</span>
                        </div>
                        <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                          {vendor.stats.availableVehicles}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>Bhubaneswar, Odisha</span>
                      </div>
                      {vendor.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>{vendor.email}</span>
                        </div>
                      )}
                      {vendor.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{vendor.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Vehicles Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">
            Available Vehicles ({vendor.vehicles.length})
          </h2>

          {vendor.vehicles.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Car className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Vehicles Listed</h3>
                <p className="text-muted-foreground">
                  This vendor hasn't listed any vehicles yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendor.vehicles.map((vehicle) => (
                <Link href={`/vehicles/${vehicle.id}`} key={vehicle.id}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full" data-testid={`card-vehicle-${vehicle.id}`}>
                    <div className="relative">
                      <img
                        src={vehicle.imageUrl}
                        alt={vehicle.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      {vehicle.isAvailable ? (
                        <Badge className="absolute top-2 right-2 bg-green-500">
                          Available
                        </Badge>
                      ) : (
                        <Badge className="absolute top-2 right-2 bg-red-500">
                          Booked
                        </Badge>
                      )}
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">{vehicle.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {vehicle.brand} {vehicle.model} • {vehicle.year}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-primary">
                            ₹{parseFloat(vehicle.pricePerDay).toFixed(0)}
                          </p>
                          <p className="text-xs text-muted-foreground">per day</p>
                        </div>
                        <Button size="sm">Book Now</Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
