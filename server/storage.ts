import { 
  type User, 
  type InsertUser,
  type UpsertUser,
  type Vehicle, 
  type InsertVehicle,
  type Booking,
  type InsertBooking,
  type BookingWithDetails,
  type VehicleWithOwner,
  type Rating,
  type InsertRating,
  type Challan,
  type InsertChallan,
  type VideoVerification,
  type InsertVideoVerification,
  type VehicleDocument,
  type InsertVehicleDocument,
  type OwnerAddress,
  type InsertOwnerAddress,
  type AddonProduct,
  type InsertAddonProduct,
  type OwnerAddonPurchase,
  type InsertOwnerAddonPurchase,
  type TollFee,
  type InsertTollFee,
  users,
  vehicles,
  bookings,
  ratings,
  challans,
  videoVerifications,
  vehicleDocuments,
  ownerAddresses,
  addonProducts,
  ownerAddonPurchases,
  tollFees
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;

  // Vehicle methods
  getAllVehicles(): Promise<Vehicle[]>;
  getVehicle(id: string): Promise<Vehicle | undefined>;
  getVehiclesByOwner(ownerId: string): Promise<Vehicle[]>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: string): Promise<boolean>;

  // Booking methods
  getBooking(id: string): Promise<BookingWithDetails | undefined>;
  getBookingsByUser(userId: string): Promise<BookingWithDetails[]>;
  getBookingsByOwner(ownerId: string): Promise<BookingWithDetails[]>;
  getActiveBookingsForVehicle(vehicleId: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, data: Partial<Booking>): Promise<Booking | undefined>;
  checkVehicleAvailability(vehicleId: string, startDate: Date, endDate: Date): Promise<boolean>;

  // Rating methods
  getRating(id: string): Promise<Rating | undefined>;
  getRatingsByBooking(bookingId: string): Promise<Rating[]>;
  getRatingsByRatee(rateeId: string): Promise<Rating[]>;
  createRating(rating: InsertRating): Promise<Rating>;

  // Challan methods
  getChallan(id: string): Promise<Challan | undefined>;
  getChallansByVehicle(vehicleId: string): Promise<Challan[]>;
  getChallansByBooking(bookingId: string): Promise<Challan[]>;
  createChallan(challan: InsertChallan): Promise<Challan>;
  updateChallan(id: string, data: Partial<Challan>): Promise<Challan | undefined>;

  // Video Verification methods
  getVideoVerification(id: string): Promise<VideoVerification | undefined>;
  getVideoVerificationsByBooking(bookingId: string): Promise<VideoVerification[]>;
  createVideoVerification(verification: InsertVideoVerification): Promise<VideoVerification>;
  updateVideoVerification(id: string, data: Partial<VideoVerification>): Promise<VideoVerification | undefined>;

  // Vehicle Document methods
  getVehicleDocument(id: string): Promise<VehicleDocument | undefined>;
  getVehicleDocumentsByVehicle(vehicleId: string): Promise<VehicleDocument[]>;
  getVehicleDocuments(vehicleId: string): Promise<VehicleDocument[]>;
  createVehicleDocument(document: InsertVehicleDocument): Promise<VehicleDocument>;
  updateVehicleDocument(id: string, data: Partial<VehicleDocument>): Promise<VehicleDocument | undefined>;

  // Owner Address methods
  getOwnerAddress(id: string): Promise<OwnerAddress | undefined>;
  getOwnerAddresses(ownerId: string): Promise<OwnerAddress[]>;
  createOwnerAddress(address: InsertOwnerAddress): Promise<OwnerAddress>;
  updateOwnerAddress(id: string, data: Partial<OwnerAddress>): Promise<OwnerAddress | undefined>;
  deleteOwnerAddress(id: string): Promise<boolean>;

  // Admin methods
  getVehiclesByStatus(status: string): Promise<VehicleWithOwner[]>;
  getAllUsers(role?: string): Promise<User[]>;
  getAdminAnalytics(): Promise<any>;
  getGuestBookingsByEmail(email: string): Promise<BookingWithDetails[]>;

  // Addon Product methods
  getAllAddonProducts(): Promise<AddonProduct[]>;
  getAddonProduct(id: string): Promise<AddonProduct | undefined>;
  createAddonProduct(product: InsertAddonProduct): Promise<AddonProduct>;
  updateAddonProduct(id: string, data: Partial<AddonProduct>): Promise<AddonProduct | undefined>;
  deleteAddonProduct(id: string): Promise<boolean>;

  // Owner Addon Purchase methods
  getOwnerAddonPurchases(ownerId: string): Promise<OwnerAddonPurchase[]>;
  createOwnerAddonPurchase(purchase: InsertOwnerAddonPurchase): Promise<OwnerAddonPurchase>;

  // Toll Fee methods
  getTollFeesByBooking(bookingId: string): Promise<TollFee[]>;
  createTollFee(tollFee: InsertTollFee): Promise<TollFee>;
  updateTollFee(id: string, data: Partial<TollFee>): Promise<TollFee | undefined>;
}

export class DbStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return result[0];
  }

  // Vehicle methods
  async getAllVehicles(): Promise<Vehicle[]> {
    return await db.select().from(vehicles);
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    const result = await db.select().from(vehicles).where(eq(vehicles.id, id)).limit(1);
    return result[0];
  }

  async getVehiclesByOwner(ownerId: string): Promise<Vehicle[]> {
    return await db.select().from(vehicles).where(eq(vehicles.ownerId, ownerId));
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const result = await db.insert(vehicles).values(insertVehicle).returning();
    return result[0];
  }

  async updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle | undefined> {
    const result = await db.update(vehicles).set(data).where(eq(vehicles.id, id)).returning();
    return result[0];
  }

  async deleteVehicle(id: string): Promise<boolean> {
    const result = await db.delete(vehicles).where(eq(vehicles.id, id)).returning();
    return result.length > 0;
  }

  // Booking methods
  async getBooking(id: string): Promise<BookingWithDetails | undefined> {
    const result = await db
      .select()
      .from(bookings)
      .leftJoin(vehicles, eq(bookings.vehicleId, vehicles.id))
      .leftJoin(users, eq(bookings.userId, users.id))
      .where(eq(bookings.id, id))
      .limit(1);

    if (result.length === 0 || !result[0].vehicles || !result[0].users) {
      return undefined;
    }

    return {
      ...result[0].bookings,
      vehicle: result[0].vehicles,
      user: result[0].users,
    };
  }

  async getBookingsByUser(userId: string): Promise<BookingWithDetails[]> {
    const result = await db
      .select()
      .from(bookings)
      .leftJoin(vehicles, eq(bookings.vehicleId, vehicles.id))
      .leftJoin(users, eq(bookings.userId, users.id))
      .where(eq(bookings.userId, userId));

    return result
      .filter(r => r.vehicles && r.users)
      .map(r => ({
        ...r.bookings,
        vehicle: r.vehicles!,
        user: r.users!,
      }));
  }

  async getBookingsByOwner(ownerId: string): Promise<BookingWithDetails[]> {
    const result = await db
      .select()
      .from(bookings)
      .leftJoin(vehicles, eq(bookings.vehicleId, vehicles.id))
      .leftJoin(users, eq(bookings.userId, users.id))
      .where(eq(vehicles.ownerId, ownerId));

    return result
      .filter(r => r.vehicles && r.users)
      .map(r => ({
        ...r.bookings,
        vehicle: r.vehicles!,
        user: r.users!,
      }));
  }

  async getActiveBookingsForVehicle(vehicleId: string): Promise<Booking[]> {
    const result = await db
      .select()
      .from(bookings)
      .where(eq(bookings.vehicleId, vehicleId));
    return result;
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const result = await db.insert(bookings).values(insertBooking).returning();
    return result[0];
  }

  async updateBooking(id: string, data: Partial<Booking>): Promise<Booking | undefined> {
    const result = await db.update(bookings).set(data).where(eq(bookings.id, id)).returning();
    return result[0];
  }

  async checkVehicleAvailability(vehicleId: string, startDate: Date, endDate: Date): Promise<boolean> {
    const overlappingBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.vehicleId, vehicleId),
          eq(bookings.status, "confirmed"),
          gte(bookings.endDate, startDate),
          lte(bookings.startDate, endDate)
        )
      );

    return overlappingBookings.length === 0;
  }

  // Rating methods
  async getRating(id: string): Promise<Rating | undefined> {
    const result = await db.select().from(ratings).where(eq(ratings.id, id)).limit(1);
    return result[0];
  }

  async getRatingsByBooking(bookingId: string): Promise<Rating[]> {
    return await db.select().from(ratings).where(eq(ratings.bookingId, bookingId));
  }

  async getRatingsByRatee(rateeId: string): Promise<Rating[]> {
    return await db.select().from(ratings).where(eq(ratings.rateeId, rateeId));
  }

  async createRating(insertRating: InsertRating): Promise<Rating> {
    const result = await db.insert(ratings).values(insertRating).returning();
    return result[0];
  }

  // Challan methods
  async getChallan(id: string): Promise<Challan | undefined> {
    const result = await db.select().from(challans).where(eq(challans.id, id)).limit(1);
    return result[0];
  }

  async getChallansByVehicle(vehicleId: string): Promise<Challan[]> {
    return await db.select().from(challans).where(eq(challans.vehicleId, vehicleId));
  }

  async getChallansByBooking(bookingId: string): Promise<Challan[]> {
    return await db.select().from(challans).where(eq(challans.bookingId, bookingId));
  }

  async createChallan(insertChallan: InsertChallan): Promise<Challan> {
    const result = await db.insert(challans).values(insertChallan).returning();
    return result[0];
  }

  async updateChallan(id: string, data: Partial<Challan>): Promise<Challan | undefined> {
    const result = await db.update(challans).set(data).where(eq(challans.id, id)).returning();
    return result[0];
  }

  // Video Verification methods
  async getVideoVerification(id: string): Promise<VideoVerification | undefined> {
    const result = await db.select().from(videoVerifications).where(eq(videoVerifications.id, id)).limit(1);
    return result[0];
  }

  async getVideoVerificationsByBooking(bookingId: string): Promise<VideoVerification[]> {
    return await db.select().from(videoVerifications).where(eq(videoVerifications.bookingId, bookingId));
  }

  async createVideoVerification(insertVerification: InsertVideoVerification): Promise<VideoVerification> {
    const result = await db.insert(videoVerifications).values(insertVerification).returning();
    return result[0];
  }

  async updateVideoVerification(id: string, data: Partial<VideoVerification>): Promise<VideoVerification | undefined> {
    const result = await db.update(videoVerifications).set(data).where(eq(videoVerifications.id, id)).returning();
    return result[0];
  }

  // Vehicle Document methods
  async getVehicleDocument(id: string): Promise<VehicleDocument | undefined> {
    const result = await db.select().from(vehicleDocuments).where(eq(vehicleDocuments.id, id)).limit(1);
    return result[0];
  }

  async getVehicleDocumentsByVehicle(vehicleId: string): Promise<VehicleDocument[]> {
    return await db.select().from(vehicleDocuments).where(eq(vehicleDocuments.vehicleId, vehicleId));
  }

  async createVehicleDocument(insertDocument: InsertVehicleDocument): Promise<VehicleDocument> {
    const result = await db.insert(vehicleDocuments).values(insertDocument).returning();
    return result[0];
  }

  async updateVehicleDocument(id: string, data: Partial<VehicleDocument>): Promise<VehicleDocument | undefined> {
    const result = await db.update(vehicleDocuments).set(data).where(eq(vehicleDocuments.id, id)).returning();
    return result[0];
  }

  // Owner Address methods
  async getOwnerAddress(id: string): Promise<OwnerAddress | undefined> {
    const result = await db.select().from(ownerAddresses).where(eq(ownerAddresses.id, id)).limit(1);
    return result[0];
  }

  async getOwnerAddresses(ownerId: string): Promise<OwnerAddress[]> {
    return await db.select().from(ownerAddresses).where(eq(ownerAddresses.ownerId, ownerId));
  }

  async createOwnerAddress(insertAddress: InsertOwnerAddress): Promise<OwnerAddress> {
    const result = await db.insert(ownerAddresses).values(insertAddress).returning();
    return result[0];
  }

  async updateOwnerAddress(id: string, data: Partial<OwnerAddress>): Promise<OwnerAddress | undefined> {
    const result = await db.update(ownerAddresses).set(data).where(eq(ownerAddresses.id, id)).returning();
    return result[0];
  }

  async deleteOwnerAddress(id: string): Promise<boolean> {
    const result = await db.delete(ownerAddresses).where(eq(ownerAddresses.id, id)).returning();
    return result.length > 0;
  }

  // Admin methods
  async getVehiclesByStatus(status: string): Promise<VehicleWithOwner[]> {
    const result = await db
      .select()
      .from(vehicles)
      .leftJoin(users, eq(vehicles.ownerId, users.id))
      .where(eq(vehicles.verificationStatus, status));
    
    return result.map((row) => ({
      ...row.vehicles,
      owner: row.users!,
    }));
  }

  async getAllUsers(role?: string): Promise<User[]> {
    if (role) {
      return await db.select().from(users).where(eq(users.role, role));
    }
    return await db.select().from(users);
  }

  async getAdminAnalytics(): Promise<any> {
    const totalUsers = await db.select().from(users);
    const totalVehicles = await db.select().from(vehicles);
    const totalBookings = await db.select().from(bookings);
    const pendingVehicles = await db.select().from(vehicles).where(eq(vehicles.verificationStatus, 'pending'));
    
    const customers = totalUsers.filter(u => u.role === 'customer');
    const owners = totalUsers.filter(u => u.role === 'owner' || u.role === 'admin');
    
    const activeBookings = totalBookings.filter(b => b.status === 'active' || b.status === 'confirmed');
    const completedBookings = totalBookings.filter(b => b.status === 'completed');
    
    let totalRevenue = 0;
    let platformEarnings = 0;
    
    completedBookings.forEach(booking => {
      const amount = parseFloat(booking.totalAmount || '0');
      totalRevenue += amount;
      platformEarnings += parseFloat(booking.platformCommission || '0');
    });
    
    return {
      users: {
        total: totalUsers.length,
        customers: customers.length,
        owners: owners.length,
      },
      vehicles: {
        total: totalVehicles.length,
        pending: pendingVehicles.length,
        approved: totalVehicles.filter(v => v.verificationStatus === 'approved').length,
        rejected: totalVehicles.filter(v => v.verificationStatus === 'rejected').length,
      },
      bookings: {
        total: totalBookings.length,
        active: activeBookings.length,
        completed: completedBookings.length,
        cancelled: totalBookings.filter(b => b.status === 'cancelled').length,
      },
      revenue: {
        total: totalRevenue.toFixed(2),
        platformEarnings: platformEarnings.toFixed(2),
      },
    };
  }

  async getGuestBookingsByEmail(email: string): Promise<BookingWithDetails[]> {
    const result = await db
      .select()
      .from(bookings)
      .leftJoin(vehicles, eq(bookings.vehicleId, vehicles.id))
      .leftJoin(users, eq(bookings.userId, users.id))
      .where(eq(bookings.guestEmail, email));
    
    return result.map((row) => ({
      ...row.bookings,
      vehicle: row.vehicles!,
      user: row.users || { id: '', email: row.bookings.guestEmail || '', firstName: row.bookings.guestName || 'Guest', lastName: '', role: 'customer' } as User,
    }));
  }

  async getVehicleDocuments(vehicleId: string): Promise<VehicleDocument[]> {
    return await db.select().from(vehicleDocuments).where(eq(vehicleDocuments.vehicleId, vehicleId));
  }

  // Addon Product methods
  async getAllAddonProducts(): Promise<AddonProduct[]> {
    return await db.select().from(addonProducts);
  }

  async getAddonProduct(id: string): Promise<AddonProduct | undefined> {
    const result = await db.select().from(addonProducts).where(eq(addonProducts.id, id)).limit(1);
    return result[0];
  }

  async createAddonProduct(product: InsertAddonProduct): Promise<AddonProduct> {
    const result = await db.insert(addonProducts).values(product).returning();
    return result[0];
  }

  async updateAddonProduct(id: string, data: Partial<AddonProduct>): Promise<AddonProduct | undefined> {
    const result = await db.update(addonProducts).set(data).where(eq(addonProducts.id, id)).returning();
    return result[0];
  }

  async deleteAddonProduct(id: string): Promise<boolean> {
    await db.delete(addonProducts).where(eq(addonProducts.id, id));
    return true;
  }

  // Owner Addon Purchase methods
  async getOwnerAddonPurchases(ownerId: string): Promise<OwnerAddonPurchase[]> {
    return await db.select().from(ownerAddonPurchases).where(eq(ownerAddonPurchases.ownerId, ownerId));
  }

  async createOwnerAddonPurchase(purchase: InsertOwnerAddonPurchase): Promise<OwnerAddonPurchase> {
    const result = await db.insert(ownerAddonPurchases).values(purchase).returning();
    return result[0];
  }

  // Toll Fee methods
  async getTollFeesByBooking(bookingId: string): Promise<TollFee[]> {
    return await db.select().from(tollFees).where(eq(tollFees.bookingId, bookingId));
  }

  async createTollFee(tollFee: InsertTollFee): Promise<TollFee> {
    const result = await db.insert(tollFees).values(tollFee).returning();
    return result[0];
  }

  async updateTollFee(id: string, data: Partial<TollFee>): Promise<TollFee | undefined> {
    const result = await db.update(tollFees).set(data).where(eq(tollFees.id, id)).returning();
    return result[0];
  }
}

export const storage = new DbStorage();
