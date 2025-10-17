import { eq, and, gte, or } from "drizzle-orm";
import { db } from "../db";
import { users, walletTransactions, referrals } from "@shared/schema";
import type { InsertWalletTransaction } from "@shared/schema";

// Generate unique referral code for user
export async function generateReferralCode(userId: string): Promise<string> {
  // Generate a simple 6-character code from user ID hash
  const code = `DRV${userId.slice(0, 6).toUpperCase()}`;
  
  // Update user with referral code
  await db.update(users)
    .set({ referralCode: code })
    .where(eq(users.id, userId));
    
  return code;
}

// Add credit to wallet and record transaction
export async function addWalletCredit(
  userId: string,
  amount: string,
  source: string,
  description: string,
  expiresAt?: Date,
  referralId?: string,
  bookingId?: string
): Promise<void> {
  // Get current balance
  const [user] = await db.select({ walletBalance: users.walletBalance })
    .from(users)
    .where(eq(users.id, userId));
    
  if (!user) throw new Error("User not found");
  
  const currentBalance = parseFloat(user.walletBalance || "0");
  const creditAmount = parseFloat(amount);
  const newBalance = currentBalance + creditAmount;
  
  // Update wallet balance
  await db.update(users)
    .set({ walletBalance: newBalance.toFixed(2) })
    .where(eq(users.id, userId));
    
  // Record transaction
  await db.insert(walletTransactions).values({
    userId,
    type: "credit",
    amount: amount,
    balanceAfter: newBalance.toFixed(2),
    source,
    description,
    expiresAt,
    referralId,
    bookingId,
  });
}

// Deduct from wallet and record transaction
export async function deductWalletBalance(
  userId: string,
  amount: string,
  source: string,
  description: string,
  bookingId?: string
): Promise<void> {
  // Get current balance
  const [user] = await db.select({ walletBalance: users.walletBalance })
    .from(users)
    .where(eq(users.id, userId));
    
  if (!user) throw new Error("User not found");
  
  const currentBalance = parseFloat(user.walletBalance || "0");
  const debitAmount = parseFloat(amount);
  
  if (currentBalance < debitAmount) {
    throw new Error("Insufficient wallet balance");
  }
  
  const newBalance = currentBalance - debitAmount;
  
  // Update wallet balance
  await db.update(users)
    .set({ walletBalance: newBalance.toFixed(2) })
    .where(eq(users.id, userId));
    
  // Record transaction
  await db.insert(walletTransactions).values({
    userId,
    type: "debit",
    amount: amount,
    balanceAfter: newBalance.toFixed(2),
    source,
    description,
    bookingId,
  });
}

// Get wallet balance with active (non-expired) credits
export async function getActiveWalletBalance(userId: string): Promise<number> {
  const [user] = await db.select({ walletBalance: users.walletBalance })
    .from(users)
    .where(eq(users.id, userId));
    
  if (!user) return 0;
  
  const currentBalance = parseFloat(user.walletBalance || "0");
  
  // Get all expired credit transactions that haven't been deducted yet
  const now = new Date();
  const expiredCredits = await db.select()
    .from(walletTransactions)
    .where(
      and(
        eq(walletTransactions.userId, userId),
        eq(walletTransactions.type, "credit"),
        walletTransactions.expiresAt !== null
      )
    );
  
  // Calculate total expired amount (credits with expiresAt in the past)
  let totalExpiredAmount = 0;
  for (const credit of expiredCredits) {
    if (credit.expiresAt && new Date(credit.expiresAt) < now) {
      totalExpiredAmount += parseFloat(credit.amount);
    }
  }
  
  // Return balance minus expired credits (but never go below 0)
  const activeBalance = Math.max(0, currentBalance - totalExpiredAmount);
  
  // TODO: In production, track which specific credits have been used/expired
  // For now, we deduct the total expired amount from the balance
  
  return activeBalance;
}

// Get wallet transaction history
export async function getWalletTransactions(userId: string, limit = 50) {
  return await db.select()
    .from(walletTransactions)
    .where(eq(walletTransactions.userId, userId))
    .orderBy(walletTransactions.createdAt)
    .limit(limit);
}

// Process referral when new user signs up with a referral code
export async function processReferral(referralCode: string, newUserId: string): Promise<void> {
  // Find referrer by code
  const [referrer] = await db.select()
    .from(users)
    .where(eq(users.referralCode, referralCode));
    
  if (!referrer) {
    throw new Error("Invalid referral code");
  }
  
  // Check if user already used a referral
  const [newUser] = await db.select()
    .from(users)
    .where(eq(users.id, newUserId));
    
  if (newUser?.referredBy) {
    throw new Error("User already used a referral code");
  }
  
  // Update new user with referrer
  await db.update(users)
    .set({ referredBy: referrer.id })
    .where(eq(users.id, newUserId));
  
  // Create referral record with 90-day expiry
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 90);
  
  const [referralRecord] = await db.insert(referrals)
    .values({
      referrerId: referrer.id,
      refereeId: newUserId,
      amount: "50",
      status: "pending",
      expiresAt,
    })
    .returning();
  
  // Credit ₹50 to referrer's wallet
  await addWalletCredit(
    referrer.id,
    "50",
    "referral",
    `Referral bonus for inviting ${newUser.firstName || newUser.email}`,
    expiresAt,
    referralRecord.id
  );
  
  // Mark referral as credited
  await db.update(referrals)
    .set({ 
      status: "credited",
      creditedAt: new Date()
    })
    .where(eq(referrals.id, referralRecord.id));
}
