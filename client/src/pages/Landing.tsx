import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Car, 
  FileCheck, 
  MapPin, 
  TruckIcon, 
  Clock, 
  Shield, 
  Zap,
  CheckCircle2,
  Star
} from "lucide-react";
import { VehicleCard } from "@/components/VehicleCard";
import { useQuery } from "@tanstack/react-query";
import type { Vehicle } from "@shared/schema";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [searchLocation, setSearchLocation] = useState("Bhubaneswar");
  const [pickupDateTime, setPickupDateTime] = useState("");
  const [returnDateTime, setReturnDateTime] = useState("");
  const [searchType, setSearchType] = useState("");

  const { data: vehicles, isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const featuredVehicles = vehicles?.slice(0, 6) || [];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchLocation) params.append("location", searchLocation);
    if (pickupDateTime) params.append("pickupTime", pickupDateTime);
    if (returnDateTime) params.append("returnTime", returnDateTime);
    if (searchType) params.append("type", searchType);
    setLocation(`/browse-vehicles?${params.toString()}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070"
            alt="Hero"
            loading="eager"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/70" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-white mb-6" data-testid="text-hero-title">
              Your Journey, Your Vehicle, Your Schedule
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 mb-8" data-testid="text-hero-subtitle">
              Book self-drive cars & bikes with instant confirmation
            </p>

            {/* Search Bar */}
            <Card className="bg-white/95 dark:bg-card/95 backdrop-blur-md shadow-2xl">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                      <select 
                        className="w-full h-9 rounded-md border border-input bg-background pl-10 pr-3 text-sm"
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        data-testid="select-search-location"
                      >
                        <option value="Bhubaneswar">Bhubaneswar</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Pickup Date & Time</label>
                    <Input 
                      type="datetime-local"
                      value={pickupDateTime}
                      onChange={(e) => setPickupDateTime(e.target.value)}
                      data-testid="input-pickup-datetime"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Return Date & Time</label>
                    <Input 
                      type="datetime-local"
                      value={returnDateTime}
                      onChange={(e) => setReturnDateTime(e.target.value)}
                      data-testid="input-return-datetime"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Vehicle Type</label>
                    <select 
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value)}
                      data-testid="select-vehicle-type"
                    >
                      <option value="">All Types</option>
                      <option value="car">Cars</option>
                      <option value="bike">Bikes</option>
                    </select>
                  </div>
                </div>
                <Button size="lg" className="w-full mt-4" onClick={handleSearch} data-testid="button-search">
                  <Search className="h-5 w-5 mr-2" />
                  Search Vehicles
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-card border-y border-card-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2" data-testid="text-stat-vehicles">10,000+</div>
              <div className="text-sm text-muted-foreground">Vehicles Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2" data-testid="text-stat-riders">50,000+</div>
              <div className="text-sm text-muted-foreground">Happy Riders</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2" data-testid="text-stat-support">24/7</div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2" data-testid="text-stat-owners">100%</div>
              <div className="text-sm text-muted-foreground">Verified Owners</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-center mb-12" data-testid="text-how-it-works-title">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center hover-elevate transition-all">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Car className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Browse & Select</h3>
                <p className="text-muted-foreground">
                  Choose from thousands of verified vehicles in your area
                </p>
              </CardContent>
            </Card>
            <Card className="text-center hover-elevate transition-all">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileCheck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Book & Pay</h3>
                <p className="text-muted-foreground">
                  Instant booking confirmation with secure advance payment
                </p>
              </CardContent>
            </Card>
            <Card className="text-center hover-elevate transition-all">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TruckIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Choose Pickup Option</h3>
                <p className="text-muted-foreground">
                  Self-pickup from parking or doorstep delivery
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold" data-testid="text-featured-vehicles-title">
              Featured Vehicles
            </h2>
            <Link href="/vehicles">
              <Button variant="outline" data-testid="button-view-all">
                View All
              </Button>
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="h-96 animate-pulse bg-muted" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Pickup Options Highlight */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-center mb-12" data-testid="text-pickup-options-title">
            Flexible Pickup Options
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-2 hover-elevate transition-all">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="h-8 w-8 text-accent-foreground" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Self-Pickup from Parking</h3>
                <p className="text-muted-foreground mb-4">
                  Pick up the vehicle from designated parking locations at standard rates
                </p>
                <Badge variant="secondary" className="text-lg px-4 py-1">Standard Pricing</Badge>
              </CardContent>
            </Card>
            <Card className="border-2 border-primary/20 hover-elevate transition-all">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <TruckIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Doorstep Delivery</h3>
                <p className="text-muted-foreground mb-4">
                  Get the vehicle delivered to your home or any location of your choice
                </p>
                <Badge className="text-lg px-4 py-1">+ Delivery Charges</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-center mb-12" data-testid="text-why-choose-title">
            Why Choose DriveEase
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover-elevate transition-all">
              <CardContent className="p-6">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Verified DL Check</h3>
                <p className="text-sm text-muted-foreground">
                  Secure driver's license verification for all bookings
                </p>
              </CardContent>
            </Card>
            <Card className="text-center hover-elevate transition-all">
              <CardContent className="p-6">
                <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Instant Booking</h3>
                <p className="text-sm text-muted-foreground">
                  Book and confirm your ride in seconds
                </p>
              </CardContent>
            </Card>
            <Card className="text-center hover-elevate transition-all">
              <CardContent className="p-6">
                <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Flexible Hours</h3>
                <p className="text-sm text-muted-foreground">
                  Hourly, daily, or weekly rental options
                </p>
              </CardContent>
            </Card>
            <Card className="text-center hover-elevate transition-all">
              <CardContent className="p-6">
                <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Transparent Pricing</h3>
                <p className="text-sm text-muted-foreground">
                  No hidden fees, what you see is what you pay
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-center mb-12" data-testid="text-testimonials-title">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Rajesh Kumar",
                text: "Amazing service! The doorstep delivery option saved me so much time. Highly recommended!",
                rating: 5
              },
              {
                name: "Priya Sharma",
                text: "Clean vehicles, transparent pricing, and super easy booking process. Will use again!",
                rating: 5
              },
              {
                name: "Amit Patel",
                text: "The DL verification made me feel secure. Great selection of vehicles too!",
                rating: 5
              }
            ].map((testimonial, i) => (
              <Card key={i} className="hover-elevate transition-all">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.text}"</p>
                  <p className="font-semibold">{testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Owner CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-display font-bold mb-6" data-testid="text-owner-cta-title">
                Own a Vehicle? Earn Extra Income
              </h2>
              <ul className="space-y-4 mb-8">
                {[
                  "List your vehicle in minutes",
                  "Set your own pricing",
                  "Track earnings in real-time",
                  "Secure payment processing",
                  "24/7 support for owners"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/list-vehicle">
                <Button size="lg" variant="secondary" data-testid="button-list-vehicle-cta">
                  List Your Vehicle
                </Button>
              </Link>
            </div>
            <div className="relative h-80 rounded-xl overflow-hidden bg-muted">
              <img
                src="https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=2069"
                alt="Owner Dashboard"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
