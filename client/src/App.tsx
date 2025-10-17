import { Switch, Route } from "wouter";
import { lazy, Suspense } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";

// Eager load landing page for better initial load
import Landing from "@/pages/Landing";

// Lazy load other pages for code splitting
const Vehicles = lazy(() => import("@/pages/Vehicles"));
const BookVehicle = lazy(() => import("@/pages/BookVehicle"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const OwnerDashboard = lazy(() => import("@/pages/OwnerDashboard"));
const ListVehicle = lazy(() => import("@/pages/ListVehicle"));
const Login = lazy(() => import("@/pages/Login"));
const BookingDetails = lazy(() => import("@/pages/BookingDetails"));
const EditVehicle = lazy(() => import("@/pages/EditVehicle"));
const BecomeOwner = lazy(() => import("@/pages/BecomeOwner"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const TermsAndConditions = lazy(() => import("@/pages/TermsAndConditions"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const ContactUs = lazy(() => import("@/pages/ContactUs"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Loading skeleton component
function PageLoader() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-4">
      <Skeleton className="h-12 w-64" />
      <Skeleton className="h-64 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/vehicles" component={Vehicles} />
        <Route path="/book/:id" component={BookVehicle} />
        <Route path="/booking/:id" component={BookingDetails} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/owner-dashboard" component={OwnerDashboard} />
        <Route path="/list-vehicle" component={ListVehicle} />
        <Route path="/edit-vehicle/:id" component={EditVehicle} />
        <Route path="/become-owner" component={BecomeOwner} />
        <Route path="/admin-dashboard" component={AdminDashboard} />
        <Route path="/login" component={Login} />
        <Route path="/terms-and-conditions" component={TermsAndConditions} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/contact-us" component={ContactUs} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Router />
            </main>
            <Footer />
          </div>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
