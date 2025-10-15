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
  users,
  vehicles,
  bookings
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
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, data: Partial<Booking>): Promise<Booking | undefined>;
  checkVehicleAvailability(vehicleId: string, startDate: Date, endDate: Date): Promise<boolean>;
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
}

export const storage = new DbStorage();
