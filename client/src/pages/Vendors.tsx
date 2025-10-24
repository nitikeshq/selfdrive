import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Building2, Search, Star, Car, MapPin } from "lucide-react";

interface Vendor {
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
  vehicleCount: number;
}

export default function Vendors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [minRating, setMinRating] = useState("");

  const { data: vendors, isLoading } = useQuery<Vendor[]>({
    queryKey: ["/api/vendors", { search: searchTerm, minRating }],
  });

  const filteredVendors = vendors || [];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="All Rental Partners & Agencies | SelfDriveKaro"
        description="Browse all trusted rental partners and agencies in Bhubaneswar. Compare prices, ratings, and fleet sizes to find the perfect rental provider."
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Building2 className="h-12 w-12 text-primary" />
              <h1 className="text-4xl md:text-5xl font-display font-bold">
                Our Rental Partners
              </h1>
            </div>
            <p className="text-lg text-muted-foreground mb-8">
              Browse trusted rental partners and agencies in Bhubaneswar
            </p>

            {/* Search and Filter */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by partner name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                  data-testid="input-search-vendors"
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Min rating"
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="h-12"
                  min="0"
                  max="5"
                  step="0.5"
                  data-testid="input-min-rating"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-24 bg-muted rounded-lg mb-4"></div>
                  <div className="h-6 bg-muted rounded mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="text-center py-16">
            <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-2xl font-semibold mb-2">No Rental Partners Found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || minRating
                ? "Try adjusting your search filters"
                : "No rental partners have registered yet"}
            </p>
            <Button onClick={() => { setSearchTerm(""); setMinRating(""); }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold">
                {filteredVendors.length} Rental Partner{filteredVendors.length !== 1 ? 's' : ''} Available
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVendors.map((vendor) => (
                <Link href={`/vendor/${vendor.id}`} key={vendor.id}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full" data-testid={`card-vendor-${vendor.id}`}>
                    <CardHeader className="space-y-4">
                      {/* Logo or Placeholder */}
                      <div className="flex items-center justify-center h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
                        {vendor.companyLogoUrl ? (
                          <img
                            src={vendor.companyLogoUrl}
                            alt={vendor.companyName || `${vendor.firstName} ${vendor.lastName}`}
                            className="h-20 w-20 object-contain"
                          />
                        ) : vendor.isVendor ? (
                          <Building2 className="h-12 w-12 text-primary" />
                        ) : (
                          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                            {vendor.firstName.charAt(0)}{vendor.lastName.charAt(0)}
                          </div>
                        )}
                      </div>

                      {/* Vendor Name */}
                      <div className="text-center">
                        <h3 className="text-xl font-bold mb-1" data-testid={`text-vendor-name-${vendor.id}`}>
                          {vendor.isVendor && vendor.companyName
                            ? vendor.companyName
                            : `${vendor.firstName} ${vendor.lastName}`}
                        </h3>
                        {vendor.isVendor && (
                          <Badge variant="secondary" className="mb-2">
                            <Building2 className="h-3 w-3 mr-1" />
                            Vendor
                          </Badge>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="flex items-center justify-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <span className="font-bold text-lg">
                            {parseFloat(vendor.averageRatingAsOwner).toFixed(1)}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          ({vendor.totalRatingsAsOwner} {vendor.totalRatingsAsOwner === 1 ? 'review' : 'reviews'})
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      {/* Vehicle Count */}
                      <div className="flex items-center justify-center gap-2 text-muted-foreground mb-4">
                        <Car className="h-4 w-4" />
                        <span className="text-sm">
                          {vendor.vehicleCount} {vendor.vehicleCount === 1 ? 'vehicle' : 'vehicles'} available
                        </span>
                      </div>

                      {/* Contact Info */}
                      {vendor.phone && (
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>Bhubaneswar</span>
                        </div>
                      )}

                      <Button className="w-full mt-4" data-testid={`button-view-vendor-${vendor.id}`}>
                        View Fleet
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
