import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "@shared/schema";
import { deductWalletBalance } from "./wallet";

const MEMBERSHIP_PRICE = "999"; // ₹999
const MEMBERSHIP_DURATION_DAYS = 365; // 1 year

// Purchase membership
export async function purchaseMembership(userId: string, paymentMethod: "wallet" | "online"): Promise<void> {
  // Get user
  const [user] = await db.select()
    .from(users)
    .where(eq(users.id, userId));
    
  if (!user) throw new Error("User not found");
  
  // Check if already has active membership
  if (user.hasMembership && user.membershipExpiresAt) {
    const now = new Date();
    if (new Date(user.membershipExpiresAt) > now) {
      throw new Error("You already have an active membership");
    }
  }
  
  // Process payment based on method
  if (paymentMethod === "wallet") {
    const walletBalance = parseFloat(user.walletBalance || "0");
    if (walletBalance < parseFloat(MEMBERSHIP_PRICE)) {
      throw new Error("Insufficient wallet balance");
    }
    
    // Deduct from wallet
    await deductWalletBalance(
      userId,
      MEMBERSHIP_PRICE,
      "membership_purchase",
      "DriveEase Premium Membership"
    );
  }
  // For "online" payment, assume it's already processed via Stripe/PayU
  
  // Set membership expiry to 1 year from now
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + MEMBERSHIP_DURATION_DAYS);
  
  // Update user membership
  await db.update(users)
    .set({
      hasMembership: true,
      membershipPurchasedAt: new Date(),
      membershipExpiresAt: expiresAt,
    })
    .where(eq(users.id, userId));
}

// Check if user has active membership
export async function hasActiveMembership(userId: string): Promise<boolean> {
  const [user] = await db.select()
    .from(users)
    .where(eq(users.id, userId));
    
  if (!user || !user.hasMembership || !user.membershipExpiresAt) {
    return false;
  }
  
  const now = new Date();
  return new Date(user.membershipExpiresAt) > now;
}

// Calculate membership benefits for a booking
export interface MembershipBenefits {
  hasFreeDelivery: boolean; // Free for 24h+ bookings
  hasLateFeeWaiver: boolean; // Waive up to 30 min late fee for <8h bookings
}

export async function calculateMembershipBenefits(
  userId: string,
  bookingStartDate: Date,
  bookingEndDate: Date
): Promise<MembershipBenefits> {
  const isMember = await hasActiveMembership(userId);
  
  if (!isMember) {
    return {
      hasFreeDelivery: false,
      hasLateFeeWaiver: false,
    };
  }
  
  // Calculate booking duration in hours
  const durationMs = bookingEndDate.getTime() - bookingStartDate.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);
  
  return {
    hasFreeDelivery: durationHours >= 24, // Free delivery for day-wise bookings (24h+)
    hasLateFeeWaiver: durationHours < 8, // Late fee waiver for <8h bookings
  };
}

// Calculate late return charges
export interface LateReturnCalculation {
  isLate: boolean;
  lateMinutes: number;
  lateCharge: string;
  lateFeeWaived: boolean;
  waivedMinutes: number;
}

export async function calculateLateReturnCharge(
  userId: string,
  scheduledReturnTime: Date,
  actualReturnTime: Date,
  hourlyRate: string,
  bookingDurationHours: number
): Promise<LateReturnCalculation> {
  const isMember = await hasActiveMembership(userId);
  
  // Calculate how late the return is
  const lateMs = actualReturnTime.getTime() - scheduledReturnTime.getTime();
  const lateMinutes = Math.floor(lateMs / (1000 * 60));
  
  if (lateMinutes <= 0) {
    return {
      isLate: false,
      lateMinutes: 0,
      lateCharge: "0",
      lateFeeWaived: false,
      waivedMinutes: 0,
    };
  }
  
  // Check if member gets late fee waiver (30 min waiver for <8h bookings)
  const hasWaiver = isMember && bookingDurationHours < 8;
  const waiverMinutes = 30;
  
  let chargeableMinutes = lateMinutes;
  let waivedMinutes = 0;
  
  if (hasWaiver && lateMinutes <= waiverMinutes) {
    // Full waiver - no charges
    return {
      isLate: true,
      lateMinutes,
      lateCharge: "0",
      lateFeeWaived: true,
      waivedMinutes: lateMinutes,
    };
  } else if (hasWaiver && lateMinutes > waiverMinutes) {
    // Partial waiver - charge only beyond 30 minutes
    chargeableMinutes = lateMinutes - waiverMinutes;
    waivedMinutes = waiverMinutes;
  }
  
  // Calculate charge: 2x hourly rate for late returns
  const hourlyRateNum = parseFloat(hourlyRate);
  const lateHourlyRate = hourlyRateNum * 2; // 2x penalty
  const chargeableHours = chargeableMinutes / 60;
  const lateCharge = (lateHourlyRate * chargeableHours).toFixed(2);
  
  return {
    isLate: true,
    lateMinutes,
    lateCharge,
    lateFeeWaived: hasWaiver,
    waivedMinutes,
  };
}
