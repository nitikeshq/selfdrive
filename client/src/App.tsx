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
import { ProtectedRoute } from "@/components/ProtectedRoute";

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
const AdminCoupons = lazy(() => import("@/pages/AdminCoupons"));
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
        {/* Public Routes */}
        <Route path="/" component={Landing} />
        <Route path="/vehicles" component={Vehicles} />
        <Route path="/book/:id" component={BookVehicle} />
        <Route path="/become-owner" component={BecomeOwner} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/terms-and-conditions" component={TermsAndConditions} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/contact-us" component={ContactUs} />
        <Route path="/support" component={Support} />

        {/* Protected Routes - Require Login */}
        <Route path="/booking/:id">
          <ProtectedRoute>
            <BookingDetails />
          </ProtectedRoute>
        </Route>
        <Route path="/dashboard">
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/profile">
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        </Route>
        <Route path="/rewards">
          <ProtectedRoute>
            <Rewards />
          </ProtectedRoute>
        </Route>
        <Route path="/membership">
          <ProtectedRoute>
            <Membership />
          </ProtectedRoute>
        </Route>
        <Route path="/pickup-verification/:bookingId">
          <ProtectedRoute>
            <PickupVerification />
          </ProtectedRoute>
        </Route>

        {/* Owner Routes - Require Owner Role */}
        <Route path="/owner-dashboard">
          <ProtectedRoute requireOwner>
            <OwnerDashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/owner/vehicles">
          <ProtectedRoute requireOwner>
            <MyVehicles />
          </ProtectedRoute>
        </Route>
        <Route path="/owner/transactions">
          <ProtectedRoute requireOwner>
            <Transactions />
          </ProtectedRoute>
        </Route>
        <Route path="/owner/payment-details">
          <ProtectedRoute requireOwner>
            <PaymentDetails />
          </ProtectedRoute>
        </Route>
        <Route path="/owner/insurance">
          <ProtectedRoute requireOwner>
            <InsuranceRequest />
          </ProtectedRoute>
        </Route>
        <Route path="/list-vehicle">
          <ProtectedRoute>
            <ListVehicle />
          </ProtectedRoute>
        </Route>
        <Route path="/edit-vehicle/:id">
          <ProtectedRoute requireOwner>
            <EditVehicle />
          </ProtectedRoute>
        </Route>

        {/* Admin Routes - Require Admin Role */}
        <Route path="/admin-dashboard">
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/addons">
          <ProtectedRoute requireAdmin>
            <AdminAddons />
          </ProtectedRoute>
        </Route>
        <Route path="/admin/coupons">
          <ProtectedRoute requireAdmin>
            <AdminCoupons />
          </ProtectedRoute>
        </Route>

        {/* 404 Not Found */}
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
