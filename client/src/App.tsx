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
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

// Eager load landing page for better initial load
import Landing from "@/pages/Landing";

// Lazy load other pages for code splitting
const Vehicles = lazy(() => import("@/pages/Vehicles"));
const BookVehicle = lazy(() => import("@/pages/BookVehicle"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const OwnerDashboard = lazy(() => import("@/pages/OwnerDashboard"));
const MyVehicles = lazy(() => import("@/pages/owner/MyVehicles"));
const Transactions = lazy(() => import("@/pages/owner/Transactions"));
const PaymentDetails = lazy(() => import("@/pages/owner/PaymentDetails"));
const InsuranceRequest = lazy(() => import("@/pages/owner/InsuranceRequest"));
const ListVehicle = lazy(() => import("@/pages/ListVehicle"));
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const BookingDetails = lazy(() => import("@/pages/BookingDetails"));
const EditVehicle = lazy(() => import("@/pages/EditVehicle"));
const BecomeOwner = lazy(() => import("@/pages/BecomeOwner"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const TermsAndConditions = lazy(() => import("@/pages/TermsAndConditions"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const ContactUs = lazy(() => import("@/pages/ContactUs"));
const Support = lazy(() => import("@/pages/Support"));
const Profile = lazy(() => import("@/pages/Profile"));
const AdminAddons = lazy(() => import("@/pages/AdminAddons"));
const Rewards = lazy(() => import("@/pages/Rewards"));
const Membership = lazy(() => import("@/pages/Membership"));
const PickupVerification = lazy(() => import("@/pages/PickupVerification"));
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
        <Route path="/owner/vehicles" component={MyVehicles} />
        <Route path="/owner/transactions" component={Transactions} />
        <Route path="/owner/payment-details" component={PaymentDetails} />
        <Route path="/owner/insurance" component={InsuranceRequest} />
        <Route path="/list-vehicle" component={ListVehicle} />
        <Route path="/edit-vehicle/:id" component={EditVehicle} />
        <Route path="/become-owner" component={BecomeOwner} />
        <Route path="/admin-dashboard" component={AdminDashboard} />
        <Route path="/admin/addons" component={AdminAddons} />
        <Route path="/profile" component={Profile} />
        <Route path="/rewards" component={Rewards} />
        <Route path="/membership" component={Membership} />
        <Route path="/pickup-verification/:bookingId" component={PickupVerification} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/terms-and-conditions" component={TermsAndConditions} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/contact-us" component={ContactUs} />
        <Route path="/support" component={Support} />
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
          <PWAInstallPrompt />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
