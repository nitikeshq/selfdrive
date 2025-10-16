import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Check, Car, Bike, Shield, MapPin, TrendingUp, Wallet, Calculator, ArrowRight, DollarSign } from "lucide-react";

export default function BecomeOwner() {
  const [, setLocation] = useLocation();
  const [vehicleStatus, setVehicleStatus] = useState<"new" | "existing">("existing");
  const [pricePerHour, setPricePerHour] = useState("");
  const [emiAmount, setEmiAmount] = useState("");

  const calculateProfit = () => {
    const hourlyRate = parseFloat(pricePerHour) || 0;
    const monthlyEmi = vehicleStatus === "new" ? parseFloat(emiAmount) || 0 : 0;

    const hoursPerDay = 8;
    const daysPerMonth = 25;
    
    const monthlyRevenue = hourlyRate * hoursPerDay * daysPerMonth;
    
    const customerTax = monthlyRevenue * 0.05;
    const totalWithTax = monthlyRevenue + customerTax;
    
    const platformCommission = monthlyRevenue * 0.30;
    
    const ownerEarnings = monthlyRevenue - platformCommission;
    
    const netProfit = ownerEarnings - monthlyEmi;

    return {
      monthlyRevenue,
      customerTax,
      totalWithTax,
      platformCommission,
      ownerEarnings,
      monthlyEmi,
      netProfit,
      hoursPerDay,
      daysPerMonth
    };
  };

  const profit = calculateProfit();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700" data-testid="text-hero-title">
              Anyone Can Earn
            </h1>
            <p className="text-2xl md:text-3xl mb-8 font-light animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100" data-testid="text-hero-subtitle">
              Sit Back and Earn Passive Income
            </p>
            <div className="flex flex-wrap gap-4 justify-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full" data-testid="badge-car">
                <Car className="h-6 w-6" />
                <span className="text-lg font-medium">Have a car? Rent it</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full" data-testid="badge-bike">
                <Bike className="h-6 w-6" />
                <span className="text-lg font-medium">Have a bike? Rent it</span>
              </div>
            </div>
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-slate-100 text-lg px-8 py-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300"
              onClick={() => setLocation("/list-vehicle")}
              data-testid="button-start-earning"
            >
              Start Earning Today <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-slate-900 dark:text-white" data-testid="text-benefits-title">
            Why Rent Your Vehicle?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-2 hover:border-blue-500 transition-all duration-300 hover:shadow-xl" data-testid="card-benefit-income">
              <CardHeader>
                <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                  <Wallet className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-slate-900 dark:text-white">Be Your Own Boss</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Create your own passive income stream. Earn while your vehicle works for you.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-blue-500 transition-all duration-300 hover:shadow-xl" data-testid="card-benefit-protection">
              <CardHeader>
                <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-slate-900 dark:text-white">100% Protected</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Safeguard your vehicles from theft, damages, and problems with comprehensive insurance coverage.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-blue-500 transition-all duration-300 hover:shadow-xl" data-testid="card-benefit-tracking">
              <CardHeader>
                <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-slate-900 dark:text-white">Real-Time GPS Tracking</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Track your vehicle 24/7 with integrated GPS. Know exactly where your asset is at all times.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-slate-900 dark:text-white" data-testid="text-process-title">
            Simple 4-Step Process
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {[
                { step: 1, title: "List Your Vehicle", desc: "Upload photos and details of your car or bike in just 5 minutes" },
                { step: 2, title: "Set Your Price", desc: "You control the pricing - set hourly or daily rates based on your vehicle" },
                { step: 3, title: "Get Insurance & GPS", desc: "We help you get comprehensive insurance and GPS tracking for complete safety" },
                { step: 4, title: "Start Earning", desc: "Sit back and watch the earnings roll in. We handle everything else!" }
              ].map((item) => (
                <div key={item.step} className="flex gap-6 items-start" data-testid={`step-${item.step}`}>
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold text-xl">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">{item.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Profit Calculator */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center h-16 w-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6">
                <Calculator className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white" data-testid="text-calculator-title">
                Calculate Your Earnings
              </h2>
              <p className="text-xl text-slate-600 dark:text-slate-400">
                See how much you can earn with your vehicle
              </p>
            </div>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl text-slate-900 dark:text-white">Profit Calculator</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Enter your details to see potential earnings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-base font-medium text-slate-900 dark:text-white">Do you have a vehicle?</Label>
                  <RadioGroup value={vehicleStatus} onValueChange={(value) => setVehicleStatus(value as "new" | "existing")}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="existing" id="existing" data-testid="radio-existing" />
                      <Label htmlFor="existing" className="cursor-pointer text-slate-900 dark:text-white">
                        I already own a vehicle
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="new" id="new" data-testid="radio-new" />
                      <Label htmlFor="new" className="cursor-pointer text-slate-900 dark:text-white">
                        I want to buy a new vehicle
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricePerHour" className="text-slate-900 dark:text-white">
                    Set Per Hour Charges (₹)
                  </Label>
                  <Input
                    id="pricePerHour"
                    type="number"
                    placeholder="e.g., 150"
                    value={pricePerHour}
                    onChange={(e) => setPricePerHour(e.target.value)}
                    className="text-lg"
                    data-testid="input-price-per-hour"
                  />
                </div>

                {vehicleStatus === "new" && (
                  <div className="space-y-2">
                    <Label htmlFor="emiAmount" className="text-slate-900 dark:text-white">
                      Monthly EMI Amount (₹)
                    </Label>
                    <Input
                      id="emiAmount"
                      type="number"
                      placeholder="e.g., 15000"
                      value={emiAmount}
                      onChange={(e) => setEmiAmount(e.target.value)}
                      className="text-lg"
                      data-testid="input-emi-amount"
                    />
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Enter your expected monthly EMI payment
                    </p>
                  </div>
                )}

                {pricePerHour && (
                  <div className="mt-8 space-y-6 border-t pt-6">
                    <h3 className="text-xl font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Your Earnings Breakdown
                    </h3>

                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 space-y-4" data-testid="section-earnings-breakdown">
                      <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-slate-600 dark:text-slate-400">Rental Hours/Day:</span>
                        <span className="font-semibold text-slate-900 dark:text-white" data-testid="text-hours-per-day">{profit.hoursPerDay} hours</span>
                      </div>
                      
                      <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-slate-600 dark:text-slate-400">Active Days/Month:</span>
                        <span className="font-semibold text-slate-900 dark:text-white" data-testid="text-days-per-month">{profit.daysPerMonth} days</span>
                      </div>

                      <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-slate-600 dark:text-slate-400">Monthly Revenue (before tax):</span>
                        <span className="font-semibold text-slate-900 dark:text-white" data-testid="text-monthly-revenue">₹{profit.monthlyRevenue.toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-slate-600 dark:text-slate-400">Tax (5% - paid by customer):</span>
                        <span className="font-semibold text-green-600" data-testid="text-customer-tax">+ ₹{profit.customerTax.toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-slate-600 dark:text-slate-400">Total Customer Pays:</span>
                        <span className="font-semibold text-slate-900 dark:text-white" data-testid="text-total-with-tax">₹{profit.totalWithTax.toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-slate-600 dark:text-slate-400">Platform Commission (30%):</span>
                        <span className="font-semibold text-red-600" data-testid="text-platform-commission">- ₹{profit.platformCommission.toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-slate-600 dark:text-slate-400">Your Earnings:</span>
                        <span className="font-semibold text-blue-600" data-testid="text-owner-earnings">₹{profit.ownerEarnings.toFixed(2)}</span>
                      </div>

                      {vehicleStatus === "new" && profit.monthlyEmi > 0 && (
                        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
                          <span className="text-slate-600 dark:text-slate-400">Monthly EMI:</span>
                          <span className="font-semibold text-red-600" data-testid="text-monthly-emi">- ₹{profit.monthlyEmi.toFixed(2)}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 -mx-6 -mb-6 px-6 pb-6 pt-6 rounded-b-lg">
                        <span className="text-lg font-bold text-slate-900 dark:text-white">Net Monthly Profit:</span>
                        <span className="text-2xl font-bold text-green-600" data-testid="text-net-profit">
                          ₹{profit.netProfit.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex gap-3">
                        <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-slate-700 dark:text-slate-300">
                          <p className="font-semibold mb-1">Tax Information:</p>
                          <p>Customers pay 5% tax on top of your rental charges. You receive 70% of the rental revenue (30% platform commission). This is pure passive income!</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="text-center mt-12">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-12 py-6"
                onClick={() => setLocation("/list-vehicle")}
                data-testid="button-list-vehicle"
              >
                List Your Vehicle Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="mt-4 text-slate-600 dark:text-slate-400">
                Join thousands of vehicle owners earning passive income
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6" data-testid="text-cta-title">
            Be Your Own Owner. Be Your Own Passive Income.
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Start your journey to financial freedom today. Your vehicle can work for you!
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-slate-100 text-lg px-8 py-6"
              onClick={() => setLocation("/list-vehicle")}
              data-testid="button-get-started"
            >
              Get Started <Check className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6"
              onClick={() => setLocation("/contact-us")}
              data-testid="button-contact-us"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
