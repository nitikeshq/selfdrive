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
  insertOwnerAddressSchema,
  insertAgreementAcceptanceSchema,
  insertInsuranceRequestSchema,
  users
} from "@shared/schema";
import { z } from "zod";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import crypto from "crypto";
import multer from "multer";
import { StorageFactory } from "./storage-providers";
import { db } from "./db";
import { eq } from "drizzle-orm";

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
      const { email, password, firstName, lastName, role, phone, isVendor, companyName, companyLogoUrl } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      // Validate vendor fields if registering as vendor
      if (isVendor && !companyName) {
        return res.status(400).json({ message: "Company name is required for vendor registration" });
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
        phone,
        role: role || "customer",
        isVendor: isVendor || false,
        companyName: isVendor ? companyName : null,
        companyLogoUrl: isVendor ? companyLogoUrl : null,
      });

      // Create session
      (req.session as any).userId = user.id;

      res.status(201).json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        isVendor: user.isVendor,
        companyName: user.companyName,
        companyLogoUrl: user.companyLogoUrl,
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
      
      // Get vehicle count for this owner
      const allVehicles = await storage.getAllVehicles();
      const vehicleCount = allVehicles.filter(v => v.ownerId === userId).length;
      
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        profileImageUrl: user.profileImageUrl,
        vehicleCount, // Add vehicle count for navbar logic
        // Vendor details
        isVendor: user.isVendor,
        companyName: user.companyName,
        companyLogoUrl: user.companyLogoUrl,
        averageRatingAsOwner: user.averageRatingAsOwner,
        totalRatingsAsOwner: user.totalRatingsAsOwner,
        // Payment details
        bankAccountHolderName: user.bankAccountHolderName,
        bankAccountNumber: user.bankAccountNumber,
        bankIfscCode: user.bankIfscCode,
        upiId: user.upiId,
        payuVendorId: user.payuVendorId,
        panNumber: user.panNumber,
        gstNumber: user.gstNumber,
        isPayuVendorVerified: user.isPayuVendorVerified,
        // KYC details
        aadharNumber: user.aadharNumber,
        dlNumber: user.dlNumber,
        // Membership & wallet
        hasMembership: user.hasMembership,
        membershipExpiresAt: user.membershipExpiresAt,
        walletBalance: user.walletBalance,
        referralCode: user.referralCode,
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

  // Update profile - comprehensive endpoint for all profile fields
  app.patch("/api/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const {
        firstName,
        lastName,
        phone,
        currentPassword,
        newPassword,
        bankAccountHolderName,
        bankAccountNumber,
        bankIfscCode,
        upiId,
        panNumber,
        gstNumber,
        companyName,
        isVendor,
      } = req.body;

      const updates: any = {};

      // Personal info updates
      if (firstName !== undefined) updates.firstName = firstName;
      if (lastName !== undefined) updates.lastName = lastName;
      if (phone !== undefined) updates.phone = phone;

      // Password change (requires current password validation)
      if (newPassword && currentPassword) {
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        // Verify current password
        const validPassword = await comparePassword(currentPassword, user.password);
        if (!validPassword) {
          return res.status(400).json({ message: "Current password is incorrect" });
        }

        // Hash and update new password
        updates.password = await hashPassword(newPassword);
      }

      // Bank details (for owners)
      if (bankAccountHolderName !== undefined) updates.bankAccountHolderName = bankAccountHolderName;
      if (bankAccountNumber !== undefined) updates.bankAccountNumber = bankAccountNumber;
      if (bankIfscCode !== undefined) updates.bankIfscCode = bankIfscCode;

      // Payment details
      if (upiId !== undefined) updates.upiId = upiId;
      if (panNumber !== undefined) updates.panNumber = panNumber;
      if (gstNumber !== undefined) updates.gstNumber = gstNumber;

      // Vendor info
      if (companyName !== undefined) updates.companyName = companyName;
      if (isVendor !== undefined) updates.isVendor = isVendor;
      
      // Company logo URL (from S3 upload)
      if (req.body.companyLogoUrl !== undefined) updates.companyLogoUrl = req.body.companyLogoUrl;

      // Update user in database
      const updatedUser = await storage.updateUser(userId, updates);

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't send password back
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
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

  // Vendor/Agency routes
  app.get("/api/vendors", async (req, res) => {
    try {
      const { search, minRating } = req.query;
      
      // Get all users who are vendors (isVendor = true) or have role = owner
      const allUsers = await storage.getAllUsers();
      let vendors = allUsers.filter(u => u.isVendor || u.role === "owner");
      
      // Apply search filter (company name or owner name)
      if (search && typeof search === "string") {
        const searchLower = search.toLowerCase();
        vendors = vendors.filter(v => 
          (v.companyName && v.companyName.toLowerCase().includes(searchLower)) ||
          (v.firstName && v.firstName.toLowerCase().includes(searchLower)) ||
          (v.lastName && v.lastName.toLowerCase().includes(searchLower))
        );
      }
      
      // Apply rating filter
      if (minRating && typeof minRating === "string") {
        const minRatingNum = parseFloat(minRating);
        vendors = vendors.filter(v => 
          v.averageRatingAsOwner && parseFloat(v.averageRatingAsOwner) >= minRatingNum
        );
      }
      
      // Get vehicle count for each vendor
      const vendorsWithStats = await Promise.all(vendors.map(async (vendor) => {
        const vehicles = await storage.getVehiclesByOwner(vendor.id);
        return {
          id: vendor.id,
          firstName: vendor.firstName,
          lastName: vendor.lastName,
          email: vendor.email,
          phone: vendor.phone,
          isVendor: vendor.isVendor,
          companyName: vendor.companyName,
          companyLogoUrl: vendor.companyLogoUrl,
          averageRatingAsOwner: vendor.averageRatingAsOwner || "0",
          totalRatingsAsOwner: vendor.totalRatingsAsOwner || 0,
          vehicleCount: vehicles.length,
        };
      }));
      
      res.json(vendorsWithStats);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });

  app.get("/api/vendors/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get vendor user details
      const vendor = await storage.getUser(id);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      
      // Get all vehicles owned by this vendor
      const vehicles = await storage.getVehiclesByOwner(id);
      
      // Calculate stats
      const totalVehicles = vehicles.length;
      const availableVehicles = vehicles.filter(v => v.available).length;
      
      res.json({
        id: vendor.id,
        firstName: vendor.firstName,
        lastName: vendor.lastName,
        email: vendor.email,
        phone: vendor.phone,
        isVendor: vendor.isVendor,
        companyName: vendor.companyName,
        companyLogoUrl: vendor.companyLogoUrl,
        averageRatingAsOwner: vendor.averageRatingAsOwner || "0",
        totalRatingsAsOwner: vendor.totalRatingsAsOwner || 0,
        vehicles: vehicles,
        stats: {
          totalVehicles,
          availableVehicles,
        }
      });
    } catch (error) {
      console.error("Error fetching vendor:", error);
      res.status(500).json({ message: "Failed to fetch vendor details" });
    }
  });

  app.patch("/api/user/vendor-info", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { companyName, companyLogoUrl } = req.body;
      
      // Update vendor information
      const updatedUser = await storage.updateUser(userId, {
        companyName,
        companyLogoUrl,
        isVendor: true, // Enable vendor mode when updating vendor info
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        id: updatedUser.id,
        companyName: updatedUser.companyName,
        companyLogoUrl: updatedUser.companyLogoUrl,
        isVendor: updatedUser.isVendor,
      });
    } catch (error) {
      console.error("Error updating vendor info:", error);
      res.status(500).json({ message: "Failed to update vendor information" });
    }
  });

  // Vehicles routes - Returns vehicles with status badges (excludes vehicles from owners without bank details)
  app.get("/api/vehicles", async (req, res) => {
    try {
      const { search, location } = req.query;
      let vehicles = await storage.getAllVehicles();
      
      // Add status to each vehicle and filter by owner's bank details
      const now = new Date();
      const vehiclesWithStatusAndValidation = await Promise.all(vehicles.map(async (vehicle) => {
        // Get owner information
        const owner = await storage.getUser(vehicle.ownerId);
        
        // Check if owner has provided required bank details
        const hasBankDetails = owner && 
                               owner.bankAccountNumber && 
                               owner.bankAccountHolderName && 
                               owner.bankIfscCode;
        
        // Skip vehicles from owners without bank details
        if (!hasBankDetails) {
          return null;
        }
        
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
      
      // Filter out null entries (vehicles from owners without bank details)
      vehicles = vehiclesWithStatusAndValidation.filter(v => v !== null);
      
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

  // Create booking lead (request callback before payment)
  app.post("/api/bookings/lead", async (req: any, res) => {
    try {
      const isAuthenticated = !!(req.session && req.session.userId);
      let bookingData: any;
      
      if (isAuthenticated) {
        const authenticatedBookingSchema = insertBookingSchema.extend({
          userId: z.string().optional(),
        });
        
        const validatedData = authenticatedBookingSchema.parse(req.body);
        bookingData = {
          ...validatedData,
          userId: req.session.userId,
          isGuestBooking: false,
          guestEmail: null,
          guestPhone: null,
          guestName: null,
          status: "lead", // Mark as lead, not pending
        };
      } else {
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
          isGuestBooking: z.literal(true),
          guestEmail: z.string().email(),
          guestPhone: z.string().min(10),
          guestName: z.string().min(1),
        });
        
        const validatedData = guestBookingSchema.parse(req.body);
        bookingData = {
          ...validatedData,
          userId: null,
          status: "lead", // Mark as lead for guest bookings too
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

      // Create booking with lead status
      const booking = await storage.createBooking(bookingData);
      
      // Get vehicle and owner details for notifications
      const vehicle = await storage.getVehicle(booking.vehicleId);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      
      const owner = await storage.getUser(vehicle.ownerId);
      if (!owner) {
        return res.status(404).json({ error: "Owner not found" });
      }
      
      // Get customer details
      let customerName, customerEmail, customerPhone;
      if (booking.isGuestBooking) {
        customerName = booking.guestName || "Guest";
        customerEmail = booking.guestEmail || "";
        customerPhone = booking.guestPhone || "";
      } else {
        const customer = await storage.getUser(booking.userId!);
        customerName = customer ? `${customer.firstName} ${customer.lastName}` : "Customer";
        customerEmail = customer?.email || "";
        customerPhone = customer?.phone || "";
      }
      
      // Format dates for email
      const pickupDate = new Date(booking.startDate).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kolkata"
      });
      const returnDate = new Date(booking.endDate).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kolkata"
      });
      
      // Send notifications
      const { emailTemplates } = await import("./email");
      
      // Notify owner
      await emailTemplates.leadNotificationOwner(
        owner.email,
        `${owner.firstName} ${owner.lastName}`,
        customerName,
        customerEmail,
        customerPhone,
        vehicle.name,
        booking.id,
        pickupDate,
        returnDate,
        booking.pickupOption === "delivery" ? "Doorstep Delivery" : "Parking Pickup",
        booking.totalAmount,
        booking.ownerEarnings || "0",
        booking.platformCommission || "0"
      );
      
      // Notify platform
      await emailTemplates.leadNotificationPlatform(
        customerName,
        customerEmail,
        customerPhone,
        vehicle.name,
        `${owner.firstName} ${owner.lastName}`,
        owner.email,
        owner.phone || "",
        booking.id,
        pickupDate,
        returnDate,
        booking.pickupOption === "delivery" ? "Doorstep Delivery" : "Parking Pickup",
        booking.totalAmount,
        booking.ownerEarnings || "0",
        booking.platformCommission || "0"
      );
      
      res.status(201).json({
        success: true,
        booking,
        message: "Booking inquiry submitted! The owner will contact you shortly."
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Lead validation error:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ error: error.errors });
      }
      console.error("Lead creation error:", error);
      res.status(500).json({ error: "Failed to create booking inquiry" });
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

      // Get booking ID from udf1
      const bookingId = udf1;
      
      if (bookingId && status === "success") {
        await storage.updateBooking(bookingId, {
          paymentStatus: "paid",
          status: "confirmed",
          paymentIntentId: mihpayid || txnid,
        });
      }

      // Redirect to success page
      res.redirect(`/?payment=success&bookingId=${bookingId}`);
    } catch (error) {
      console.error("Payment success callback error:", error);
      res.redirect("/?payment=error");
    }
  });

  // PayU failure callback
  app.post("/api/payment-failure", async (req, res) => {
    try {
      const { txnid, udf1 } = req.body;
      
      // Get booking ID from udf1
      const bookingId = udf1;

      if (bookingId) {
        await storage.updateBooking(bookingId, {
          paymentStatus: "failed",
        });
      }

      res.redirect(`/?payment=failed&bookingId=${bookingId}`);
    } catch (error) {
      console.error("Payment failure callback error:", error);
      res.redirect("/?payment=error");
    }
  });

  // Wallet payment for booking
  app.post("/api/booking/pay-with-wallet", isAuthenticated, async (req: any, res) => {
    try {
      const { bookingId } = req.body;
      const userId = req.session.userId;

      if (!bookingId) {
        return res.status(400).json({ error: "Booking ID required" });
      }

      // Get booking details
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      if (booking.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Get user's wallet balance
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { getActiveWalletBalance } = await import("./services/wallet");
      const availableBalance = await getActiveWalletBalance(userId);
      const totalAmount = parseFloat(booking.totalAmount);

      if (availableBalance < totalAmount) {
        return res.status(400).json({ 
          error: "Insufficient wallet balance",
          required: totalAmount,
          available: availableBalance
        });
      }

      // Deduct from wallet
      const { deductWalletBalance } = await import("./services/wallet");
      await deductWalletBalance(userId, totalAmount.toString(), "booking_payment", `Booking payment - ${bookingId}`, bookingId);

      // Calculate platform commission (30%) and owner earnings (70%)
      const PLATFORM_COMMISSION_RATE = 0.30;
      const platformCommission = totalAmount * PLATFORM_COMMISSION_RATE;
      const ownerEarnings = totalAmount * (1 - PLATFORM_COMMISSION_RATE);

      // Update booking status
      await storage.updateBooking(bookingId, {
        paymentStatus: "paid",
        status: "confirmed",
        paymentIntentId: `WALLET_${Date.now()}`,
        platformCommission: platformCommission.toFixed(2),
        ownerEarnings: ownerEarnings.toFixed(2),
      });

      res.json({ 
        success: true, 
        bookingId,
        message: "Booking confirmed! Payment deducted from wallet."
      });
    } catch (error: any) {
      console.error("Wallet payment error:", error);
      res.status(500).json({ error: error.message || "Failed to process wallet payment" });
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
    try {
      // Check if using AWS S3
      if (process.env.STORAGE_PROVIDER === 's3' || process.env.STORAGE_PROVIDER === 'aws') {
        const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
        const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
        const crypto = await import("crypto");
        
        const region = process.env.AWS_S3_REGION || process.env.AWS_REGION || 'us-east-1';
        const bucket = process.env.AWS_S3_BUCKET_NAME || process.env.AWS_S3_BUCKET || '';
        const accessKeyId = process.env.AWS_API_KEY || process.env.AWS_ACCESS_KEY_ID;
        const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
        
        if (!bucket) {
          return res.status(500).json({ error: "AWS S3 bucket not configured" });
        }
        
        if (!accessKeyId || !secretAccessKey) {
          return res.status(500).json({ error: "AWS S3 credentials not configured" });
        }
        
        const client = new S3Client({
          region,
          credentials: {
            accessKeyId,
            secretAccessKey,
          },
        });
        
        // Generate unique key for upload (accept any file type)
        const fileExtension = req.body.fileExtension || 'pdf';
        const uniqueKey = `documents/${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${fileExtension}`;
        
        const command = new PutObjectCommand({
          Bucket: bucket,
          Key: uniqueKey,
        });
        
        const uploadURL = await getSignedUrl(client, command, { expiresIn: 900 }); // 15 minutes
        res.json({ uploadURL });
      } else {
        // Fallback to Replit object storage
        const objectStorageService = new ObjectStorageService();
        const uploadURL = await objectStorageService.getObjectEntityUploadURL();
        res.json({ uploadURL });
      }
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
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

  // Agreement Acceptance routes
  app.post("/api/agreement-acceptances", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertAgreementAcceptanceSchema.parse({
        ...req.body,
        userId: (req.session as any).userId,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
      });
      const acceptance = await storage.createAgreementAcceptance(validatedData);
      res.status(201).json(acceptance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create agreement acceptance" });
    }
  });

  app.get("/api/agreement-acceptances/user/:userId", isAuthenticated, async (req, res) => {
    try {
      const acceptances = await storage.getAgreementAcceptancesByUser(req.params.userId);
      res.json(acceptances);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch agreement acceptances" });
    }
  });

  app.get("/api/agreement-acceptances/check/:agreementType", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const acceptance = await storage.getAgreementAcceptanceByType(userId, req.params.agreementType);
      res.json({ accepted: !!acceptance, acceptance });
    } catch (error) {
      res.status(500).json({ error: "Failed to check agreement acceptance" });
    }
  });

  app.get("/api/agreement-acceptances/booking/:bookingId", isAuthenticated, async (req, res) => {
    try {
      const acceptances = await storage.getAgreementAcceptanceByBooking(req.params.bookingId);
      res.json(acceptances);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch booking agreement acceptances" });
    }
  });

  // Insurance Request routes
  app.post("/api/insurance-requests", isOwner, async (req, res) => {
    try {
      const ownerId = (req.session as any).userId;
      const validatedData = insertInsuranceRequestSchema.parse({
        ...req.body,
        ownerId,
      });
      const request = await storage.createInsuranceRequest(validatedData);
      res.status(201).json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create insurance request" });
    }
  });

  app.get("/api/insurance-requests", isAdmin, async (req, res) => {
    try {
      const requests = await storage.getAllInsuranceRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch insurance requests" });
    }
  });

  app.get("/api/owner/insurance-requests", isOwner, async (req, res) => {
    try {
      const ownerId = (req.session as any).userId;
      const requests = await storage.getInsuranceRequestsByOwner(ownerId);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch owner insurance requests" });
    }
  });

  app.patch("/api/insurance-requests/:id", isAdmin, async (req, res) => {
    try {
      const request = await storage.updateInsuranceRequest(req.params.id, req.body);
      if (!request) {
        return res.status(404).json({ error: "Insurance request not found" });
      }
      res.json(request);
    } catch (error) {
      res.status(500).json({ error: "Failed to update insurance request" });
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

  // Owner payment details
  app.patch("/api/owner/payment-details", isAuthenticated, isOwner, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const { 
        bankAccountHolderName, 
        bankAccountNumber, 
        bankIfscCode, 
        upiId, 
        payuVendorId, 
        panNumber, 
        gstNumber 
      } = req.body;

      const updateData: any = {};
      if (bankAccountHolderName) updateData.bankAccountHolderName = bankAccountHolderName;
      if (bankAccountNumber) updateData.bankAccountNumber = bankAccountNumber;
      if (bankIfscCode) updateData.bankIfscCode = bankIfscCode;
      if (upiId !== undefined) updateData.upiId = upiId;
      if (payuVendorId !== undefined) updateData.payuVendorId = payuVendorId;
      if (panNumber) updateData.panNumber = panNumber;
      if (gstNumber !== undefined) updateData.gstNumber = gstNumber;

      const user = await storage.updateUser(userId, updateData);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error updating payment details:", error);
      res.status(500).json({ error: "Failed to update payment details" });
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
        const productinfo = "SelfDriveKaro Premium Membership - 1 Year";
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

  // Coupon validation route (for customers)
  app.post("/api/coupons/validate", async (req, res) => {
    try {
      const { code, bookingAmount, bookingHours } = req.body;

      if (!code) {
        return res.status(400).json({ error: "Coupon code is required" });
      }

      const coupon = await storage.getCouponByCode(code);

      if (!coupon) {
        return res.status(404).json({ error: "Invalid coupon code" });
      }

      if (!coupon.isActive) {
        return res.status(400).json({ error: "This coupon is no longer active" });
      }

      const now = new Date();
      if (coupon.validFrom && new Date(coupon.validFrom) > now) {
        return res.status(400).json({ error: "This coupon is not yet valid" });
      }

      if (coupon.validUntil && new Date(coupon.validUntil) < now) {
        return res.status(400).json({ error: "This coupon has expired" });
      }

      if (coupon.maxUsageCount && coupon.currentUsageCount >= coupon.maxUsageCount) {
        return res.status(400).json({ error: "This coupon has reached its usage limit" });
      }

      if (coupon.minBookingAmount && parseFloat(bookingAmount) < parseFloat(coupon.minBookingAmount)) {
        return res.status(400).json({ 
          error: `Minimum booking amount of ₹${coupon.minBookingAmount} required for this coupon` 
        });
      }

      // Calculate discount
      let discountAmount = 0;
      if (coupon.discountType === "percentage") {
        discountAmount = (parseFloat(bookingAmount) * parseFloat(coupon.discountValue)) / 100;
      } else if (coupon.discountType === "fixed_amount") {
        discountAmount = parseFloat(coupon.discountValue);
      } else if (coupon.discountType === "free_hours") {
        // For free hours, calculate the hourly rate
        const hourlyRate = bookingHours > 0 ? parseFloat(bookingAmount) / bookingHours : 0;
        discountAmount = hourlyRate * parseFloat(coupon.discountValue);
      }

      // Ensure discount doesn't exceed booking amount
      discountAmount = Math.min(discountAmount, parseFloat(bookingAmount));

      res.json({
        valid: true,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
        },
        discountAmount: discountAmount.toFixed(2),
        finalAmount: (parseFloat(bookingAmount) - discountAmount).toFixed(2),
      });
    } catch (error: any) {
      console.error("Coupon validation error:", error);
      res.status(500).json({ error: "Failed to validate coupon" });
    }
  });

  // Admin coupon routes
  app.get("/api/admin/coupons", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const coupons = await storage.getAllCoupons();
      res.json(coupons);
    } catch (error) {
      console.error("Get coupons error:", error);
      res.status(500).json({ error: "Failed to fetch coupons" });
    }
  });

  app.post("/api/admin/coupons", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { insertCouponSchema } = await import("@shared/schema");
      const couponData = insertCouponSchema.parse(req.body);
      
      const coupon = await storage.createCoupon(couponData);
      res.json(coupon);
    } catch (error: any) {
      console.error("Create coupon error:", error);
      res.status(400).json({ error: error.message || "Failed to create coupon" });
    }
  });

  app.patch("/api/admin/coupons/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const coupon = await storage.updateCoupon(id, req.body);
      
      if (!coupon) {
        return res.status(404).json({ error: "Coupon not found" });
      }
      
      res.json(coupon);
    } catch (error: any) {
      console.error("Update coupon error:", error);
      res.status(400).json({ error: error.message || "Failed to update coupon" });
    }
  });

  app.delete("/api/admin/coupons/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteCoupon(id);
      
      if (!success) {
        return res.status(404).json({ error: "Coupon not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Delete coupon error:", error);
      res.status(500).json({ error: "Failed to delete coupon" });
    }
  });

  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, phone, subject, message } = req.body;

      if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: "Please provide all required fields" });
      }

      // Send email to nitikesh@qwegle.com
      const { emailTemplates } = await import("./email");
      await emailTemplates.contactInquiry(name, email, phone || "", subject, message);

      res.json({ 
        success: true, 
        message: "Thank you for contacting us. We'll get back to you within 24 hours." 
      });
    } catch (error: any) {
      console.error("Contact form error:", error);
      res.status(500).json({ error: error.message || "Failed to send message. Please try again." });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
