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
  Star,
  Phone,
  Mail,
  MessageCircle
} from "lucide-react";
import { VehicleCard } from "@/components/VehicleCard";
import { DateTimePicker } from "@/components/DateTimePicker";
import { SEO } from "@/components/SEO";
import { LocalBusinessSchema } from "@/components/LocalBusinessSchema";
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
    setLocation(`/vehicles?${params.toString()}`);
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="SelfDriveKaro.com - Self-Drive Car & Bike Rentals in Bhubaneswar, Odisha"
        description="Rent self-drive cars and bikes with instant confirmation in Bhubaneswar. Hourly, daily, or weekly rentals. Free home delivery available. Book now!"
        keywords="car rental Bhubaneswar, self drive cars, bike rental Odisha, car hire Bhubaneswar, vehicle rental India, hourly car rental"
        ogImage="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070"
        canonical="https://selfdrivekaro.com"
      />
      <LocalBusinessSchema />
      {/* Hero Section */}
      <section className="relative min-h-[70vh] md:h-[80vh] flex items-center py-12 md:py-0 pt-20 md:pt-0">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=60&w=800&auto=format&fit=crop"
            srcSet="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=60&w=400&auto=format&fit=crop 400w,
                    https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=60&w=800&auto=format&fit=crop 800w,
                    https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=60&w=1200&auto=format&fit=crop 1200w"
            sizes="100vw"
            alt="Hero"
            loading="eager"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/70" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold mb-4 md:mb-6 leading-tight" data-testid="text-hero-title">
              <span className="block text-white">Your Journey,</span>
              <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-green-400 bg-clip-text text-transparent animate-in slide-in-from-left duration-700">
                Your Vehicle,
              </span>
              <span className="block text-white">Your Schedule</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6 md:mb-8 font-medium" data-testid="text-hero-subtitle">
              Book self-drive cars & bikes with instant confirmation
            </p>

            {/* Search Bar */}
            <Card className="bg-white/95 dark:bg-card/95 backdrop-blur-md shadow-2xl">
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="w-full">
                    <label className="text-sm font-medium mb-2 block">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                      <select 
                        className="w-full h-11 md:h-10 rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm touch-manipulation"
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        data-testid="select-search-location"
                      >
                        <option value="Bhubaneswar">Bhubaneswar</option>
                      </select>
                    </div>
                  </div>
                  <div className="w-full">
                    <label className="text-sm font-medium mb-2 block">Pickup Date & Time</label>
                    <div className="w-full">
                      <DateTimePicker
                        value={pickupDateTime}
                        onChange={setPickupDateTime}
                        placeholder="Select pickup date & time"
                        data-testid="input-pickup-datetime"
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="w-full">
                    <label className="text-sm font-medium mb-2 block">Return Date & Time</label>
                    <div className="w-full">
                      <DateTimePicker
                        value={returnDateTime}
                        onChange={setReturnDateTime}
                        placeholder="Select return date & time"
                        data-testid="input-return-datetime"
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="w-full">
                    <label className="text-sm font-medium mb-2 block">Vehicle Type</label>
                    <select 
                      className="w-full h-11 md:h-10 rounded-md border border-input bg-background px-3 py-2 text-sm touch-manipulation"
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
                <Button size="lg" className="w-full mt-4 h-11 md:h-10" onClick={handleSearch} data-testid="button-search">
                  <Search className="h-5 w-5 mr-2" />
                  Search Vehicles
                </Button>
              </CardContent>
            </Card>

            {/* Contact Support Section */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white/90 dark:bg-card/90 backdrop-blur-sm border-green-200 dark:border-green-800">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-1">WhatsApp Booking</h3>
                      <a 
                        href="https://wa.me/919337912331" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-green-600 dark:text-green-400 hover:underline text-sm font-medium break-all"
                        data-testid="link-whatsapp"
                      >
                        +91 9337 912331
                      </a>
                      <p className="text-xs text-muted-foreground mt-1">Available 24/7</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 dark:bg-card/90 backdrop-blur-sm border-blue-200 dark:border-blue-800">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-1">Email Support</h3>
                      <a 
                        href="mailto:support@selfdrivekaro.com" 
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium break-all"
                        data-testid="link-email"
                      >
                        support@selfdrivekaro.com
                      </a>
                      <p className="text-xs text-muted-foreground mt-1">Always active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 dark:bg-card/90 backdrop-blur-sm border-orange-200 dark:border-orange-800">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-1">Call Support</h3>
                      <a 
                        href="tel:+919337912331" 
                        className="text-orange-600 dark:text-orange-400 hover:underline text-sm font-medium break-all"
                        data-testid="link-phone"
                      >
                        +91 9337 912331
                      </a>
                      <p className="text-xs text-muted-foreground mt-1">9 AM - 7 PM (Emergency: Anytime)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-white/80">
                Website booking available 24/7 • Need help? Visit our{" "}
                <Link href="/support">
                  <span className="text-white font-semibold underline cursor-pointer hover:text-white/90" data-testid="link-support-page">
                    Support Page
                  </span>
                </Link>
              </p>
            </div>
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
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-center mb-8" data-testid="text-how-it-works-title">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center hover-elevate transition-all">
              <CardContent className="p-6">
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
              <CardContent className="p-6">
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
              <CardContent className="p-6">
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
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
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
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-center mb-8" data-testid="text-pickup-options-title">
            Flexible Pickup Options
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 hover-elevate transition-all">
              <CardContent className="p-6">
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
              <CardContent className="p-6">
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
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-center mb-8" data-testid="text-why-choose-title">
            Why Choose SelfDriveKaro
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
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-center mb-8" data-testid="text-testimonials-title">
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
      <section className="py-12 md:py-16 bg-primary text-primary-foreground">
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
