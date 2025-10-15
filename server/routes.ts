import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin, isOwner, hashPassword, comparePassword } from "./auth";
import { insertVehicleSchema, insertBookingSchema } from "@shared/schema";
import { z } from "zod";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import crypto from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup auth middleware
  await setupAuth(app);

  // Auth routes
  app.post("/api/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName, role } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || "customer",
      });

      // Create session
      (req.session as any).userId = user.id;

      res.status(201).json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ message: "Failed to register" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      // Get user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const validPassword = await comparePassword(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create session
      (req.session as any).userId = user.id;

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profileImageUrl: user.profileImageUrl,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  // Vehicles routes
  app.get("/api/vehicles", async (req, res) => {
    try {
      const { search, location } = req.query;
      let vehicles = await storage.getAllVehicles();
      
      // Filter out paused vehicles
      vehicles = vehicles.filter(v => !v.isPaused);
      
      // Filter out currently rented vehicles
      const now = new Date();
      const availableVehicles = [];
      for (const vehicle of vehicles) {
        const activeBookings = await storage.getActiveBookingsForVehicle(vehicle.id);
        const isCurrentlyRented = activeBookings.some((booking: typeof activeBookings[number]) => 
          booking.status !== 'cancelled' && 
          new Date(booking.startDate) <= now && 
          new Date(booking.endDate) >= now
        );
        if (!isCurrentlyRented) {
          availableVehicles.push(vehicle);
        }
      }
      vehicles = availableVehicles;
      
      // Filter by location (default to Bhubaneswar)
      const filterLocation = (location as string) || "Bhubaneswar";
      vehicles = vehicles.filter(v => 
        v.location.toLowerCase().includes(filterLocation.toLowerCase())
      );
      
      // Filter by search query
      if (search && typeof search === 'string') {
        const searchLower = search.toLowerCase();
        vehicles = vehicles.filter(v => 
          v.name.toLowerCase().includes(searchLower) ||
          v.brand.toLowerCase().includes(searchLower) ||
          v.model.toLowerCase().includes(searchLower) ||
          v.type.toLowerCase().includes(searchLower)
        );
      }
      
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vehicles" });
    }
  });

  app.get("/api/vehicles/:id", async (req, res) => {
    try {
      const vehicle = await storage.getVehicle(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vehicle" });
    }
  });

  app.post("/api/vehicles", async (req, res) => {
    try {
      const validatedData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(validatedData);
      res.status(201).json(vehicle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create vehicle" });
    }
  });

  app.patch("/api/vehicles/:id", async (req, res) => {
    try {
      const vehicle = await storage.updateVehicle(req.params.id, req.body);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ error: "Failed to update vehicle" });
    }
  });

  app.patch("/api/vehicles/:id/toggle-pause", async (req, res) => {
    try {
      const vehicle = await storage.getVehicle(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      const updatedVehicle = await storage.updateVehicle(req.params.id, { 
        isPaused: !vehicle.isPaused 
      });
      res.json(updatedVehicle);
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle vehicle status" });
    }
  });

  app.delete("/api/vehicles/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteVehicle(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete vehicle" });
    }
  });

  // Owner vehicles routes
  app.get("/api/owner/vehicles", async (req, res) => {
    try {
      // TODO: Get ownerId from authenticated session
      const ownerId = req.query.ownerId as string;
      if (!ownerId) {
        return res.status(400).json({ error: "Owner ID required" });
      }
      const vehicles = await storage.getVehiclesByOwner(ownerId);
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch owner vehicles" });
    }
  });

  // Bookings routes
  app.get("/api/bookings", async (req, res) => {
    try {
      // TODO: Get userId from authenticated session
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "User ID required" });
      }
      const bookings = await storage.getBookingsByUser(userId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch booking" });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      console.log("Booking request body:", JSON.stringify(req.body, null, 2));
      const validatedData = insertBookingSchema.parse(req.body);
      
      // Check vehicle availability
      const isAvailable = await storage.checkVehicleAvailability(
        validatedData.vehicleId,
        validatedData.startDate,
        validatedData.endDate
      );

      if (!isAvailable) {
        return res.status(400).json({ error: "Vehicle is not available for selected dates" });
      }

      const booking = await storage.createBooking(validatedData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ error: error.errors });
      }
      console.error("Booking creation error:", error);
      res.status(500).json({ error: "Failed to create booking" });
    }
  });

  app.patch("/api/bookings/:id", async (req, res) => {
    try {
      const booking = await storage.updateBooking(req.params.id, req.body);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to update booking" });
    }
  });

  app.post("/api/bookings/:id/cancel", async (req, res) => {
    try {
      const bookingDetails = await storage.getBooking(req.params.id);
      if (!bookingDetails) {
        return res.status(404).json({ error: "Booking not found" });
      }

      const booking = bookingDetails;
      if (booking.status === 'cancelled') {
        return res.status(400).json({ error: "Booking already cancelled" });
      }

      const now = new Date();
      const startDate = new Date(booking.startDate);
      const hoursUntilStart = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      let refundPercentage = 0;
      let refundAmount = 0;
      const totalAmount = parseFloat(booking.totalAmount);
      const processingFee = totalAmount * 0.02; // 2% processing fee

      if (hoursUntilStart < 24) {
        // Less than 24 hours: 60% refund
        refundPercentage = 60;
        refundAmount = totalAmount * 0.6;
      } else if (hoursUntilStart >= 72) {
        // 3+ days (72+ hours): 100% refund minus processing fee
        refundPercentage = 100;
        refundAmount = totalAmount - processingFee;
      } else {
        // Between 24-72 hours: 80% refund
        refundPercentage = 80;
        refundAmount = totalAmount * 0.8;
      }

      const updatedBooking = await storage.updateBooking(req.params.id, {
        status: 'cancelled',
        paymentStatus: 'partially_refunded',
        refundAmount: refundAmount.toString(),
        cancelledAt: now,
      });

      res.json({
        booking: updatedBooking,
        refundAmount,
        refundPercentage,
        message: `Booking cancelled. Refund of ₹${refundAmount.toFixed(2)} (${refundPercentage}%) will be processed.`
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to cancel booking" });
    }
  });

  // Owner bookings routes
  app.get("/api/owner/bookings", async (req, res) => {
    try {
      // TODO: Get ownerId from authenticated session
      const ownerId = req.query.ownerId as string;
      if (!ownerId) {
        return res.status(400).json({ error: "Owner ID required" });
      }
      const bookings = await storage.getBookingsByOwner(ownerId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch owner bookings" });
    }
  });

  // PayU payment initialization with split payment (30% commission)
  app.post("/api/create-payment", async (req, res) => {
    try {
      const { amount, bookingId, userEmail, userFirstName, userPhone } = req.body;

      if (!amount || !bookingId || !userEmail || !userFirstName) {
        return res.status(400).json({ error: "Required payment details missing" });
      }

      const key = process.env.PAYU_MERCHANT_KEY;
      const salt = process.env.PAYU_SALT;
      
      if (!key || !salt) {
        return res.status(500).json({ error: "Payment gateway not configured" });
      }

      // Get booking with vehicle and owner details
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      const vehicle = await storage.getVehicle(booking.vehicleId);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }

      const owner = await storage.getUser(vehicle.ownerId);
      if (!owner) {
        return res.status(404).json({ error: "Owner not found" });
      }

      // Calculate platform commission (30%) and owner earnings (70%)
      const PLATFORM_COMMISSION_RATE = 0.30;
      const totalAmount = parseFloat(amount);
      const platformCommission = totalAmount * PLATFORM_COMMISSION_RATE;
      const ownerEarnings = totalAmount * (1 - PLATFORM_COMMISSION_RATE);

      // Validate owner has PayU vendor ID for split payment
      if (!owner.payuVendorId) {
        return res.status(400).json({ 
          error: "Owner payment details not configured. Please contact support." 
        });
      }

      // Generate unique transaction ID
      const txnid = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      
      const productinfo = `Vehicle Booking - ${bookingId}`;
      const firstname = userFirstName;
      const email = userEmail;
      const phone = userPhone || "0000000000";
      
      // Success and failure URLs
      const surl = `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/api/payment-success`;
      const furl = `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/api/payment-failure`;

      // Generate hash: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
      const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
      const hash = crypto.createHash('sha512').update(hashString).digest('hex');

      // Store txnid and payment split details with bookingId
      await storage.updateBooking(bookingId, {
        paymentIntentId: txnid,
        platformCommission: platformCommission.toFixed(2),
        ownerEarnings: ownerEarnings.toFixed(2),
      });

      const paymentData = {
        key,
        txnid,
        amount: amount.toString(),
        productinfo,
        firstname,
        email,
        phone,
        surl,
        furl,
        hash,
        // PayU Marketplace Split Payment - owner gets 70% after 7 days
        split_info: JSON.stringify({
          vendor_id: owner.payuVendorId,
          vendor_amount: ownerEarnings.toFixed(2),
          platform_amount: platformCommission.toFixed(2),
        }),
        // Use test environment if in development
        paymentUrl: process.env.NODE_ENV === 'production' 
          ? 'https://secure.payu.in/_payment'
          : 'https://test.payu.in/_payment'
      };

      res.json(paymentData);
    } catch (error) {
      console.error("PayU payment creation error:", error);
      res.status(500).json({ error: "Failed to create payment" });
    }
  });

  // PayU success callback
  app.post("/api/payment-success", async (req, res) => {
    try {
      const { txnid, status, hash: responseHash, mihpayid } = req.body;
      
      const salt = process.env.PAYU_SALT;
      const key = process.env.PAYU_MERCHANT_KEY;

      // Verify hash to ensure response is authentic
      const hashString = `${salt}|${status}|||||||||||${req.body.email}|${req.body.firstname}|${req.body.productinfo}|${req.body.amount}|${txnid}|${key}`;
      const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');

      if (calculatedHash !== responseHash) {
        return res.status(400).send("Invalid payment response");
      }

      // Find booking by transaction ID
      const bookings = await storage.getBookingsByUser(""); // Get all bookings
      const booking = bookings.find((b: any) => b.paymentIntentId === txnid);

      if (booking && status === "success") {
        await storage.updateBooking(booking.id, {
          paymentStatus: "paid",
          status: "confirmed",
          paymentIntentId: mihpayid || txnid,
        });
      }

      // Redirect to success page
      res.redirect(`/?payment=success&bookingId=${booking?.id}`);
    } catch (error) {
      console.error("Payment success callback error:", error);
      res.redirect("/?payment=error");
    }
  });

  // PayU failure callback
  app.post("/api/payment-failure", async (req, res) => {
    try {
      const { txnid } = req.body;
      
      // Find booking by transaction ID and mark as failed
      const bookings = await storage.getBookingsByUser(""); // Get all bookings
      const booking = bookings.find((b: any) => b.paymentIntentId === txnid);

      if (booking) {
        await storage.updateBooking(booking.id, {
          paymentStatus: "failed",
        });
      }

      res.redirect(`/?payment=failed&bookingId=${booking?.id}`);
    } catch (error) {
      console.error("Payment failure callback error:", error);
      res.redirect("/?payment=error");
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Check vehicle availability
  app.post("/api/vehicles/:id/check-availability", async (req, res) => {
    try {
      const { startDate, endDate } = req.body;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ error: "Start and end dates required" });
      }

      const isAvailable = await storage.checkVehicleAvailability(
        req.params.id,
        new Date(startDate),
        new Date(endDate)
      );

      res.json({ available: isAvailable });
    } catch (error) {
      res.status(500).json({ error: "Failed to check availability" });
    }
  });

  // Object storage routes for serving protected files (DL photos)
  app.get("/objects/:objectPath(*)", isAuthenticated, async (req: any, res) => {
    const userId = req.session.userId;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Object storage upload URL endpoint
  app.post("/api/objects/upload", isAuthenticated, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  });

  // Update DL photo with ACL policy after upload
  app.put("/api/dl-photos", isAuthenticated, async (req: any, res) => {
    if (!req.body.dlPhotoURL) {
      return res.status(400).json({ error: "dlPhotoURL is required" });
    }

    const userId = req.session.userId;

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.dlPhotoURL,
        {
          owner: userId,
          visibility: "private",
        },
      );

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting DL photo:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
