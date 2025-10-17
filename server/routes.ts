import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isAdmin, isOwner, hashPassword, comparePassword } from "./auth";
import { 
  insertVehicleSchema, 
  insertBookingSchema,
  insertRatingSchema,
  insertChallanSchema,
  insertVideoVerificationSchema,
  insertVehicleDocumentSchema,
  insertOwnerAddressSchema
} from "@shared/schema";
import { z } from "zod";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import crypto from "crypto";
import multer from "multer";
import { StorageFactory } from "./storage-providers";

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

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

  // Profile routes
  app.get("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post("/api/profile/documents", isAuthenticated, upload.fields([
    { name: 'aadhar', maxCount: 1 },
    { name: 'dl', maxCount: 1 },
    { name: 'profilePhoto', maxCount: 1 }
  ]), async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const storageProvider = StorageFactory.getProvider();
      
      const updates: any = {};

      // Upload Aadhar to storage
      if (files.aadhar && files.aadhar[0]) {
        const aadharFile = files.aadhar[0];
        const aadharKey = await storageProvider.upload(
          aadharFile.buffer,
          aadharFile.originalname,
          aadharFile.mimetype,
          `documents/aadhar/${userId}`
        );
        updates.aadharPhotoUrl = await storageProvider.getSignedUrl(aadharKey, 86400 * 30); // 30 days
      }

      // Upload DL to storage
      if (files.dl && files.dl[0]) {
        const dlFile = files.dl[0];
        const dlKey = await storageProvider.upload(
          dlFile.buffer,
          dlFile.originalname,
          dlFile.mimetype,
          `documents/dl/${userId}`
        );
        updates.dlPhotoUrl = await storageProvider.getSignedUrl(dlKey, 86400 * 30); // 30 days
      }

      // Upload Profile Photo to storage
      if (files.profilePhoto && files.profilePhoto[0]) {
        const photoFile = files.profilePhoto[0];
        const photoKey = await storageProvider.upload(
          photoFile.buffer,
          photoFile.originalname,
          photoFile.mimetype,
          `profile-photos/${userId}`
        );
        updates.profileImageUrl = await storageProvider.getSignedUrl(photoKey, 86400 * 30); // 30 days
      }

      // Update user in database
      const updatedUser = await storage.updateUser(userId, updates);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error uploading documents:", error);
      res.status(500).json({ message: "Failed to upload documents" });
    }
  });

  // Addon Products routes (Admin only)
  app.get("/api/addon-products", async (req, res) => {
    try {
      const products = await storage.getAllAddonProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching addon products:", error);
      res.status(500).json({ message: "Failed to fetch addon products" });
    }
  });

  app.post("/api/addon-products", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { name, description, category, price, imageUrl } = req.body;
      
      const product = await storage.createAddonProduct({
        name,
        description,
        category,
        price,
        imageUrl: imageUrl || null,
        isActive: true,
        createdByAdminId: req.session.userId,
      });
      
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating addon product:", error);
      res.status(500).json({ message: "Failed to create addon product" });
    }
  });

  app.patch("/api/addon-products/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const product = await storage.updateAddonProduct(id, updates);
      res.json(product);
    } catch (error) {
      console.error("Error updating addon product:", error);
      res.status(500).json({ message: "Failed to update addon product" });
    }
  });

  app.delete("/api/addon-products/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteAddonProduct(id);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting addon product:", error);
      res.status(500).json({ message: "Failed to delete addon product" });
    }
  });

  // Owner Addon Purchases routes
  app.get("/api/owner/addon-purchases", isAuthenticated, isOwner, async (req: any, res) => {
    try {
      const ownerId = req.session.userId;
      const purchases = await storage.getOwnerAddonPurchases(ownerId);
      res.json(purchases);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      res.status(500).json({ message: "Failed to fetch purchases" });
    }
  });

  app.post("/api/owner/addon-purchases", isAuthenticated, isOwner, async (req: any, res) => {
    try {
      const ownerId = req.session.userId;
      const { addonProductId, vehicleId, quantity } = req.body;
      
      // Get product details for price calculation
      const product = await storage.getAddonProduct(addonProductId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      const totalAmount = parseFloat(product.price) * quantity;
      
      const purchase = await storage.createOwnerAddonPurchase({
        ownerId,
        vehicleId: vehicleId || null,
        addonProductId,
        quantity,
        totalAmount: totalAmount.toString(),
        paymentStatus: "pending",
        paymentIntentId: null,
      });
      
      res.status(201).json(purchase);
    } catch (error) {
      console.error("Error creating purchase:", error);
      res.status(500).json({ message: "Failed to create purchase" });
    }
  });

  // Vehicles routes - Returns ALL vehicles with status badges
  app.get("/api/vehicles", async (req, res) => {
    try {
      const { search, location } = req.query;
      let vehicles = await storage.getAllVehicles();
      
      // Add status to each vehicle (Available, Paused, or Booked)
      const now = new Date();
      const vehiclesWithStatus = await Promise.all(vehicles.map(async (vehicle) => {
        let status = "Available";
        
        if (vehicle.isPaused) {
          status = "Paused";
        } else {
          // Check if currently rented
          const activeBookings = await storage.getActiveBookingsForVehicle(vehicle.id);
          const isCurrentlyRented = activeBookings.some((booking: typeof activeBookings[number]) => 
            booking.status !== 'cancelled' && 
            new Date(booking.startDate) <= now && 
            new Date(booking.endDate) >= now
          );
          if (isCurrentlyRented) {
            status = "Booked";
          }
        }
        
        return { ...vehicle, status };
      }));
      
      vehicles = vehiclesWithStatus;
      
      // Filter by location only if explicitly provided
      if (location && typeof location === 'string') {
        vehicles = vehicles.filter(v => 
          v.location.toLowerCase().includes(location.toLowerCase())
        );
      }
      
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

  app.post("/api/vehicles", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Add ownerId from authenticated session
      const dataWithOwner = {
        ...req.body,
        ownerId: userId,
      };

      const validatedData = insertVehicleSchema.parse(dataWithOwner);
      const vehicle = await storage.createVehicle(validatedData);
      res.status(201).json(vehicle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create vehicle" });
    }
  });

  app.patch("/api/vehicles/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const vehicleId = req.params.id;
      
      // Check if vehicle exists and user owns it
      const existingVehicle = await storage.getVehicle(vehicleId);
      if (!existingVehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      
      if (existingVehicle.ownerId !== userId) {
        return res.status(403).json({ error: "You don't have permission to update this vehicle" });
      }
      
      const vehicle = await storage.updateVehicle(vehicleId, req.body);
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ error: "Failed to update vehicle" });
    }
  });

  app.patch("/api/vehicles/:id/toggle-pause", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const vehicleId = req.params.id;
      
      const vehicle = await storage.getVehicle(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      
      // Verify ownership
      if (vehicle.ownerId !== userId) {
        return res.status(403).json({ error: "You don't have permission to modify this vehicle" });
      }
      
      const updatedVehicle = await storage.updateVehicle(vehicleId, { 
        isPaused: !vehicle.isPaused 
      });
      res.json(updatedVehicle);
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle vehicle status" });
    }
  });

  app.delete("/api/vehicles/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const vehicleId = req.params.id;
      
      // Check if vehicle exists and user owns it
      const vehicle = await storage.getVehicle(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      
      // Verify ownership
      if (vehicle.ownerId !== userId) {
        return res.status(403).json({ error: "You don't have permission to delete this vehicle" });
      }
      
      const deleted = await storage.deleteVehicle(vehicleId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete vehicle" });
    }
  });

  // Owner vehicles routes
  app.get("/api/owner/vehicles", isAuthenticated, async (req: any, res) => {
    try {
      const ownerId = req.session.userId;
      if (!ownerId) {
        return res.status(401).json({ error: "Unauthorized" });
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

  app.post("/api/bookings", async (req: any, res) => {
    try {
      console.log("Booking request body:", JSON.stringify(req.body, null, 2));
      
      const isAuthenticated = !!(req.session && req.session.userId);
      let bookingData: any;
      
      if (isAuthenticated) {
        // Authenticated user booking - use session userId, ignore any userId in request
        const authenticatedBookingSchema = insertBookingSchema.extend({
          userId: z.string().optional(), // Will be overridden
        });
        
        const validatedData = authenticatedBookingSchema.parse(req.body);
        bookingData = {
          ...validatedData,
          userId: req.session.userId, // Always use session userId for security
          isGuestBooking: false,
          guestEmail: null,
          guestPhone: null,
          guestName: null,
        };
      } else {
        // Guest booking - require all guest fields
        const guestBookingSchema = z.object({
          vehicleId: z.string(),
          startDate: z.coerce.date(),
          endDate: z.coerce.date(),
          pickupOption: z.string(),
          deliveryAddress: z.string().optional(),
          totalAmount: z.string(),
          deliveryCharge: z.string().optional(),
          hasExtraInsurance: z.boolean().optional(),
          insuranceAmount: z.string().optional(),
          platformCommission: z.string().optional(),
          ownerEarnings: z.string().optional(),
          // Guest required fields
          isGuestBooking: z.literal(true),
          guestEmail: z.string().email(),
          guestPhone: z.string().min(10),
          guestName: z.string().min(1),
        });
        
        const validatedData = guestBookingSchema.parse(req.body);
        bookingData = {
          ...validatedData,
          userId: null, // No userId for guest bookings
        };
      }
      
      // Check vehicle availability
      const isAvailable = await storage.checkVehicleAvailability(
        bookingData.vehicleId,
        bookingData.startDate,
        bookingData.endDate
      );

      if (!isAvailable) {
        return res.status(400).json({ error: "Vehicle is not available for selected dates" });
      }

      const booking = await storage.createBooking(bookingData);
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
  app.get("/api/owner/bookings", isAuthenticated, async (req: any, res) => {
    try {
      const ownerId = req.session.userId;
      if (!ownerId) {
        return res.status(401).json({ error: "Unauthorized" });
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

      const key = process.env.PAYUMONEY_MERCHANT_KEY;
      const salt = process.env.PAYUMONEY_SALT;
      
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

      // Generate hash using PayUMoney service
      const { generatePayUHash } = await import("./services/payumoney");
      const hash = generatePayUHash({
        txnid,
        amount: amount.toString(),
        productinfo,
        firstname,
        email,
        phone,
        surl,
        furl,
        udf1: bookingId,
      });

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
      const { txnid, status, hash: responseHash, mihpayid, udf1, udf2, udf3, udf4, udf5 } = req.body;
      
      // Verify hash using PayUMoney service
      const { verifyPayUHash } = await import("./services/payumoney");
      const isValid = verifyPayUHash(
        status,
        req.body.firstname,
        req.body.amount,
        txnid,
        req.body.productinfo,
        req.body.email,
        udf1 || "",
        udf2 || "",
        udf3 || "",
        udf4 || "",
        udf5 || "",
        responseHash
      );

      if (!isValid) {
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

  // Ratings routes
  app.post("/api/ratings", async (req, res) => {
    try {
      const validatedData = insertRatingSchema.parse(req.body);
      const rating = await storage.createRating(validatedData);
      res.status(201).json(rating);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create rating" });
    }
  });

  app.get("/api/ratings/:bookingId", async (req, res) => {
    try {
      const ratings = await storage.getRatingsByBooking(req.params.bookingId);
      res.json(ratings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ratings" });
    }
  });

  app.get("/api/ratings/user/:userId", async (req, res) => {
    try {
      const ratings = await storage.getRatingsByRatee(req.params.userId);
      res.json(ratings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user ratings" });
    }
  });

  // Challans routes
  app.post("/api/challans", async (req, res) => {
    try {
      const validatedData = insertChallanSchema.parse(req.body);
      const challan = await storage.createChallan(validatedData);
      res.status(201).json(challan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create challan" });
    }
  });

  app.get("/api/challans/vehicle/:vehicleId", async (req, res) => {
    try {
      const challans = await storage.getChallansByVehicle(req.params.vehicleId);
      res.json(challans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch challans" });
    }
  });

  app.get("/api/challans/booking/:bookingId", async (req, res) => {
    try {
      const challans = await storage.getChallansByBooking(req.params.bookingId);
      res.json(challans);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch booking challans" });
    }
  });

  app.patch("/api/challans/:id", async (req, res) => {
    try {
      const challan = await storage.updateChallan(req.params.id, req.body);
      if (!challan) {
        return res.status(404).json({ error: "Challan not found" });
      }
      res.json(challan);
    } catch (error) {
      res.status(500).json({ error: "Failed to update challan" });
    }
  });

  // Video Verification routes
  app.post("/api/video-verifications", async (req, res) => {
    try {
      const validatedData = insertVideoVerificationSchema.parse(req.body);
      const verification = await storage.createVideoVerification(validatedData);
      res.status(201).json(verification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create video verification" });
    }
  });

  app.get("/api/video-verifications/:bookingId", async (req, res) => {
    try {
      const verifications = await storage.getVideoVerificationsByBooking(req.params.bookingId);
      res.json(verifications);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch video verifications" });
    }
  });

  app.patch("/api/video-verifications/:id/approve", async (req, res) => {
    try {
      const { approvedBy } = req.body; // "customer" or "owner"
      
      const updateData: any = {};
      if (approvedBy === "customer") {
        updateData.approvedByCustomer = true;
        updateData.customerApprovedAt = new Date();
      } else if (approvedBy === "owner") {
        updateData.approvedByOwner = true;
        updateData.ownerApprovedAt = new Date();
      } else {
        return res.status(400).json({ error: "Invalid approvedBy value" });
      }

      const verification = await storage.updateVideoVerification(req.params.id, updateData);
      if (!verification) {
        return res.status(404).json({ error: "Video verification not found" });
      }
      res.json(verification);
    } catch (error) {
      res.status(500).json({ error: "Failed to approve video verification" });
    }
  });

  // Vehicle Documents routes
  app.post("/api/vehicles/:id/documents", async (req, res) => {
    try {
      const validatedData = insertVehicleDocumentSchema.parse({
        ...req.body,
        vehicleId: req.params.id
      });
      const document = await storage.createVehicleDocument(validatedData);
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create vehicle document" });
    }
  });

  app.get("/api/vehicles/:id/documents", async (req, res) => {
    try {
      const documents = await storage.getVehicleDocumentsByVehicle(req.params.id);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vehicle documents" });
    }
  });

  app.patch("/api/vehicle-documents/:id", async (req, res) => {
    try {
      const document = await storage.updateVehicleDocument(req.params.id, req.body);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to update vehicle document" });
    }
  });

  // Owner Addresses routes
  app.post("/api/owner/addresses", async (req, res) => {
    try {
      const validatedData = insertOwnerAddressSchema.parse(req.body);
      const address = await storage.createOwnerAddress(validatedData);
      res.status(201).json(address);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create owner address" });
    }
  });

  app.get("/api/owner/addresses", async (req, res) => {
    try {
      const ownerId = req.query.ownerId as string;
      if (!ownerId) {
        return res.status(400).json({ error: "Owner ID required" });
      }
      const addresses = await storage.getOwnerAddresses(ownerId);
      res.json(addresses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch owner addresses" });
    }
  });

  app.patch("/api/owner/addresses/:id", async (req, res) => {
    try {
      const address = await storage.updateOwnerAddress(req.params.id, req.body);
      if (!address) {
        return res.status(404).json({ error: "Address not found" });
      }
      res.json(address);
    } catch (error) {
      res.status(500).json({ error: "Failed to update owner address" });
    }
  });

  app.delete("/api/owner/addresses/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteOwnerAddress(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Address not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete owner address" });
    }
  });

  // KYC verification routes
  app.patch("/api/users/kyc", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { aadharNumber, panNumber, dlNumber, dlPhotoUrl, digilockerLinked } = req.body;

      const updateData: any = {};
      if (aadharNumber) updateData.aadharNumber = aadharNumber;
      if (panNumber) updateData.panNumber = panNumber;
      if (dlNumber) updateData.dlNumber = dlNumber;
      if (dlPhotoUrl) updateData.dlPhotoUrl = dlPhotoUrl;
      if (digilockerLinked !== undefined) updateData.digilockerLinked = digilockerLinked;

      const user = await storage.updateUser(userId, updateData);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update KYC details" });
    }
  });

  app.get("/api/users/kyc-status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const kycStatus = {
        aadharVerified: !!user.aadharNumber,
        panVerified: !!user.panNumber,
        dlVerified: !!user.dlNumber && !!user.dlPhotoUrl,
        digilockerLinked: user.digilockerLinked || false,
        isKycComplete: !!(user.aadharNumber && user.panNumber && user.dlNumber && user.dlPhotoUrl)
      };

      res.json(kycStatus);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch KYC status" });
    }
  });

  // Security Deposit routes
  app.post("/api/security-deposit", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { amount, transactionId } = req.body;

      if (!amount) {
        return res.status(400).json({ error: "Amount is required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const currentDeposit = parseFloat(user.securityDepositAmount || "0");
      const newDeposit = currentDeposit + parseFloat(amount);

      const updatedUser = await storage.updateUser(userId, {
        securityDepositAmount: newDeposit.toString(),
        securityDepositPaid: true,
      });

      res.json({
        message: "Security deposit added successfully",
        newDeposit: newDeposit.toString(),
        user: updatedUser
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to add security deposit" });
    }
  });

  // Admin routes - Vehicle verification
  app.get("/api/admin/vehicles/pending", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const vehicles = await storage.getVehiclesByStatus("pending");
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending vehicles" });
    }
  });

  app.post("/api/admin/vehicles/:id/approve", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const vehicleId = req.params.id;
      const adminId = req.session.userId;
      
      const vehicle = await storage.updateVehicle(vehicleId, {
        verificationStatus: "approved",
        verifiedAt: new Date(),
        verifiedByAdminId: adminId,
      });
      
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ error: "Failed to approve vehicle" });
    }
  });

  app.post("/api/admin/vehicles/:id/reject", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const vehicleId = req.params.id;
      const adminId = req.session.userId;
      const { reason } = req.body;
      
      const vehicle = await storage.updateVehicle(vehicleId, {
        verificationStatus: "rejected",
        verifiedAt: new Date(),
        verifiedByAdminId: adminId,
        rejectionReason: reason,
        available: false,
      });
      
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ error: "Failed to reject vehicle" });
    }
  });

  // Admin dashboard - Analytics
  app.get("/api/admin/analytics", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const analytics = await storage.getAdminAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Admin dashboard - User management
  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const role = req.query.role as string | undefined;
      const users = await storage.getAllUsers(role);
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Vehicle documents routes
  app.post("/api/vehicles/:id/documents", isAuthenticated, async (req: any, res) => {
    try {
      const vehicleId = req.params.id;
      const userId = req.session.userId;
      
      // Check if user owns this vehicle or is admin
      const vehicle = await storage.getVehicle(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      
      const user = await storage.getUser(userId);
      if (vehicle.ownerId !== userId && user?.role !== 'admin') {
        return res.status(403).json({ error: "Not authorized to upload documents for this vehicle" });
      }
      
      const validatedData = insertVehicleDocumentSchema.parse({
        ...req.body,
        vehicleId,
      });
      
      const document = await storage.createVehicleDocument(validatedData);
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to upload document" });
    }
  });

  app.get("/api/vehicles/:id/documents", async (req, res) => {
    try {
      const vehicleId = req.params.id;
      const documents = await storage.getVehicleDocuments(vehicleId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  // Guest booking - lookup bookings by email
  app.get("/api/guest-bookings", async (req, res) => {
    try {
      const email = req.query.email as string;
      if (!email) {
        return res.status(400).json({ error: "Email required" });
      }
      const bookings = await storage.getGuestBookingsByEmail(email);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch guest bookings" });
    }
  });

  // Update booking status (pickup/return)
  app.post("/api/bookings/:id/pickup", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const bookingDetails = await storage.getBooking(req.params.id);
      
      if (!bookingDetails) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      // Check if user is customer or owner
      const vehicle = await storage.getVehicle(bookingDetails.vehicleId);
      const isCustomer = bookingDetails.userId === userId;
      const isOwner = vehicle?.ownerId === userId;
      
      if (!isCustomer && !isOwner) {
        return res.status(403).json({ error: "Not authorized to complete pickup for this booking" });
      }
      
      const { odometerReading, fuelLevel, videoUrl } = req.body;
      const booking = await storage.updateBooking(req.params.id, {
        pickupCompletedAt: new Date(),
        pickupOdometerReading: odometerReading,
        fuelLevelAtPickup: fuelLevel,
        pickupVideoUrl: videoUrl,
        status: "active",
      });
      
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      // Update vehicle status
      if (booking.vehicleId) {
        await storage.updateVehicle(booking.vehicleId, {
          currentStatus: "rented",
        });
      }
      
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to complete pickup" });
    }
  });

  app.post("/api/bookings/:id/return", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const bookingDetails = await storage.getBooking(req.params.id);
      
      if (!bookingDetails) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      // Check if user is customer or owner
      const vehicle = await storage.getVehicle(bookingDetails.vehicleId);
      const isCustomer = bookingDetails.userId === userId;
      const isOwner = vehicle?.ownerId === userId;
      
      if (!isCustomer && !isOwner) {
        return res.status(403).json({ error: "Not authorized to complete return for this booking" });
      }
      
      const { odometerReading, fuelLevel, videoUrl } = req.body;
      const booking = await storage.updateBooking(req.params.id, {
        returnCompletedAt: new Date(),
        returnOdometerReading: odometerReading,
        fuelLevelAtReturn: fuelLevel,
        returnVideoUrl: videoUrl,
        status: "completed",
      });
      
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      
      // Update vehicle status
      if (booking.vehicleId) {
        await storage.updateVehicle(booking.vehicleId, {
          currentStatus: "idle",
        });
      }
      
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to complete return" });
    }
  });

  // Wallet & Referral Routes
  app.get("/api/wallet/balance", isAuthenticated, async (req: any, res) => {
    try {
      const { getActiveWalletBalance } = await import("./services/wallet");
      const balance = await getActiveWalletBalance(req.session.userId);
      res.json({ balance });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch wallet balance" });
    }
  });

  app.get("/api/wallet/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const { getWalletTransactions } = await import("./services/wallet");
      const transactions = await getWalletTransactions(req.session.userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.post("/api/referral/apply", isAuthenticated, async (req: any, res) => {
    try {
      const { referralCode } = req.body;
      const { processReferral } = await import("./services/wallet");
      
      await processReferral(referralCode, req.session.userId);
      res.json({ success: true, message: "Referral applied successfully! ₹50 credited to referrer's wallet." });
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to apply referral code" });
    }
  });

  app.post("/api/referral/generate", isAuthenticated, async (req: any, res) => {
    try {
      const { generateReferralCode } = await import("./services/wallet");
      const code = await generateReferralCode(req.session.userId);
      res.json({ referralCode: code });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate referral code" });
    }
  });

  // Membership Routes
  app.post("/api/membership/purchase", isAuthenticated, async (req: any, res) => {
    try {
      const { paymentMethod } = req.body; // "wallet" or "payu"
      const { purchaseMembership } = await import("./services/membership");
      
      if (paymentMethod === "wallet") {
        await purchaseMembership(req.session.userId, paymentMethod);
        res.json({ success: true, message: "Membership activated successfully!" });
      } else if (paymentMethod === "payu") {
        // Generate PayUMoney payment for membership
        const user = await storage.getUser(req.session.userId);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        const key = process.env.PAYUMONEY_MERCHANT_KEY;
        const salt = process.env.PAYUMONEY_SALT;
        
        if (!key || !salt) {
          return res.status(500).json({ error: "Payment gateway not configured" });
        }

        const amount = "999"; // Membership price
        const txnid = `MEMBERSHIP${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
        const productinfo = "DriveEase Premium Membership - 1 Year";
        const firstname = user.firstName || user.email.split('@')[0];
        const email = user.email;
        const phone = user.phone || "0000000000";
        
        const domain = process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000';
        const surl = `${domain}/api/membership-payment-success`;
        const furl = `${domain}/api/membership-payment-failure`;

        // Generate hash using PayUMoney service
        const { generatePayUHash } = await import("./services/payumoney");
        const hash = generatePayUHash({
          txnid,
          amount,
          productinfo,
          firstname,
          email,
          phone,
          surl,
          furl,
          udf1: req.session.userId,
        });

        const paymentData = {
          key,
          txnid,
          amount,
          productinfo,
          firstname,
          email,
          phone,
          surl,
          furl,
          hash,
          udf1: req.session.userId, // Store user ID for callback
          paymentUrl: process.env.NODE_ENV === 'production' 
            ? 'https://secure.payu.in/_payment'
            : 'https://test.payu.in/_payment'
        };

        res.json(paymentData);
      } else {
        res.status(400).json({ error: "Invalid payment method" });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to purchase membership" });
    }
  });

  // Membership payment success callback
  app.post("/api/membership-payment-success", async (req, res) => {
    try {
      const { txnid, status, hash: responseHash, udf1: userId, mihpayid, udf2, udf3, udf4, udf5 } = req.body;
      
      // Verify hash using PayUMoney service
      const { verifyPayUHash } = await import("./services/payumoney");
      const isValid = verifyPayUHash(
        status,
        req.body.firstname,
        req.body.amount,
        txnid,
        req.body.productinfo,
        req.body.email,
        userId || "",
        udf2 || "",
        udf3 || "",
        udf4 || "",
        udf5 || "",
        responseHash
      );

      if (!isValid) {
        return res.status(400).send("Invalid payment response");
      }

      if (status === "success" && userId) {
        // Activate membership
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 365);
        
        await db.update(users)
          .set({
            hasMembership: true,
            membershipPurchasedAt: new Date(),
            membershipExpiresAt: expiresAt,
          })
          .where(eq(users.id, userId));
      }

      res.redirect(`/membership?payment=success`);
    } catch (error) {
      console.error("Membership payment success error:", error);
      res.redirect("/membership?payment=error");
    }
  });

  // Membership payment failure callback
  app.post("/api/membership-payment-failure", async (req, res) => {
    try {
      res.redirect(`/membership?payment=failed`);
    } catch (error) {
      console.error("Membership payment failure error:", error);
      res.redirect("/membership?payment=error");
    }
  });

  app.get("/api/membership/status", isAuthenticated, async (req: any, res) => {
    try {
      const { hasActiveMembership } = await import("./services/membership");
      const isActive = await hasActiveMembership(req.session.userId);
      
      // Get user details for expiry date
      const user = await storage.getUser(req.session.userId);
      
      res.json({ 
        isActive, 
        expiresAt: user?.membershipExpiresAt,
        purchasedAt: user?.membershipPurchasedAt
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to check membership status" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
