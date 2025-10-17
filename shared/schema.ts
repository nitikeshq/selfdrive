import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table - customers and vehicle owners
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phone: text("phone"),
  role: text("role").notNull().default("customer"), // customer, owner, admin
  
  // KYC Documents
  aadharNumber: text("aadhar_number"),
  aadharPhotoUrl: text("aadhar_photo_url"),
  panNumber: text("pan_number"),
  panPhotoUrl: text("pan_photo_url"),
  dlNumber: text("dl_number"),
  dlPhotoUrl: text("dl_photo_url"),
  
  // KYC Verification Status
  isKycVerified: boolean("is_kyc_verified").notNull().default(false),
  kycVerifiedAt: timestamp("kyc_verified_at"),
  digilockerLinked: boolean("digilocker_linked").notNull().default(false),
  
  // Wallet & Security Deposit
  walletBalance: decimal("wallet_balance", { precision: 10, scale: 2 }).notNull().default("0"),
  securityDepositPaid: boolean("security_deposit_paid").notNull().default(false),
  securityDepositAmount: decimal("security_deposit_amount", { precision: 10, scale: 2 }),
  
  // Membership
  hasMembership: boolean("has_membership").notNull().default(false),
  membershipPurchasedAt: timestamp("membership_purchased_at"),
  membershipExpiresAt: timestamp("membership_expires_at"),
  
  // Referral System
  referralCode: varchar("referral_code"),
  referredBy: varchar("referred_by").references(() => users.id), // Who referred this user
  
  // User Rating (as a customer)
  averageRatingAsCustomer: decimal("average_rating_as_customer", { precision: 3, scale: 2 }).default("0"),
  totalRatingsAsCustomer: integer("total_ratings_as_customer").default(0),
  
  // Owner Rating (if they're an owner)
  averageRatingAsOwner: decimal("average_rating_as_owner", { precision: 3, scale: 2 }).default("0"),
  totalRatingsAsOwner: integer("total_ratings_as_owner").default(0),
  
  // PayU Vendor/Settlement Details (for owners)
  payuVendorId: text("payu_vendor_id"), // PayU sub-merchant ID for direct settlement
  upiId: text("upi_id"), // UPI ID for payments
  bankAccountNumber: text("bank_account_number"),
  bankIfscCode: text("bank_ifsc_code"),
  bankAccountHolderName: text("bank_account_holder_name"),
  gstNumber: text("gst_number"), // Optional GST number
  isPayuVendorVerified: boolean("is_payu_vendor_verified").notNull().default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Owner Addresses table
export const ownerAddresses = pgTable("owner_addresses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  addressLine1: text("address_line_1").notNull(),
  addressLine2: text("address_line_2"),
  city: text("city").notNull().default("Bhubaneswar"),
  state: text("state").notNull().default("Odisha"),
  pincode: text("pincode").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Vehicles table
export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // car, bike
  category: text("category").notNull().default("economy"), // supercars, economy, premium, compact, suv, hatchback, sedan, luxury, sports_bike, cruiser_bike, commuter_bike
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  seats: integer("seats"),
  fuelType: text("fuel_type").notNull(), // petrol, diesel, electric
  transmission: text("transmission").notNull(), // manual, automatic
  registrationNumber: text("registration_number").notNull().unique(),
  pricePerHour: decimal("price_per_hour", { precision: 10, scale: 2 }).notNull(),
  pricePerDay: decimal("price_per_day", { precision: 10, scale: 2 }).notNull(),
  location: text("location").notNull(),
  locationPlaceId: text("location_place_id"), // Google Places ID for parking location
  locationLat: decimal("location_lat", { precision: 10, scale: 7 }),
  locationLng: decimal("location_lng", { precision: 10, scale: 7 }),
  
  // Manual address fallback (when Google Places fails)
  manualAddressLine1: text("manual_address_line_1"),
  manualAddressLine2: text("manual_address_line_2"),
  manualCity: text("manual_city"),
  manualState: text("manual_state"),
  manualPincode: text("manual_pincode"),
  
  ownerLocation: text("owner_location").notNull().default("Bhubaneswar"),
  imageUrl: text("image_url").notNull(),
  features: text("features").array(),
  
  // Vehicle Documents
  rcDocumentUrl: text("rc_document_url"),
  insuranceDocumentUrl: text("insurance_document_url"),
  pucDocumentUrl: text("puc_document_url"),
  
  // Insurance & GPS
  hasExtraInsurance: boolean("has_extra_insurance").notNull().default(false),
  extraInsuranceCost: decimal("extra_insurance_cost", { precision: 10, scale: 2 }).default("0"),
  hasGpsTracking: boolean("has_gps_tracking").notNull().default(false),
  gpsDeviceId: text("gps_device_id"),
  
  // Vehicle Rating
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0"),
  totalRatings: integer("total_ratings").default(0),
  
  // Admin Verification
  verificationStatus: text("verification_status").notNull().default("pending"), // pending, approved, rejected
  verifiedAt: timestamp("verified_at"),
  verifiedByAdminId: varchar("verified_by_admin_id").references(() => users.id),
  rejectionReason: text("rejection_reason"),
  
  available: boolean("available").notNull().default(true),
  isPaused: boolean("is_paused").notNull().default(false),
  currentStatus: text("current_status").notNull().default("idle"), // idle, rented, in_maintenance
  
  // Time-based Availability
  availabilityType: text("availability_type").notNull().default("always"), // always, specific_hours
  availableFromTime: text("available_from_time"), // HH:MM format (e.g., "09:00")
  availableToTime: text("available_to_time"), // HH:MM format (e.g., "17:00")
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  ownerIdx: index("vehicles_owner_idx").on(table.ownerId),
  availableIdx: index("vehicles_available_idx").on(table.available),
  typeIdx: index("vehicles_type_idx").on(table.type),
  verificationIdx: index("vehicles_verification_idx").on(table.verificationStatus),
}));

// Vehicle Documents table
export const vehicleDocuments = pgTable("vehicle_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  documentType: text("document_type").notNull(), // rc, registration, insurance, puc
  documentUrl: text("document_url").notNull(),
  documentNumber: text("document_number"),
  expiryDate: timestamp("expiry_date"),
  isVerified: boolean("is_verified").notNull().default(false),
  verifiedAt: timestamp("verified_at"),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // Nullable for guest bookings
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  
  // Guest booking fields (for non-registered users)
  isGuestBooking: boolean("is_guest_booking").notNull().default(false),
  guestEmail: varchar("guest_email"),
  guestPhone: varchar("guest_phone"),
  guestName: varchar("guest_name"),
  
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  pickupOption: text("pickup_option").notNull(), // parking, delivery
  deliveryAddress: text("delivery_address"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  deliveryCharge: decimal("delivery_charge", { precision: 10, scale: 2 }).default("0"),
  
  // Insurance
  hasExtraInsurance: boolean("has_extra_insurance").notNull().default(false),
  insuranceAmount: decimal("insurance_amount", { precision: 10, scale: 2 }).default("0"),
  
  // Payment Split (for PayU marketplace)
  platformCommission: decimal("platform_commission", { precision: 10, scale: 2 }).default("0"),
  ownerEarnings: decimal("owner_earnings", { precision: 10, scale: 2 }).default("0"),
  
  status: text("status").notNull().default("pending"), // pending, confirmed, active, completed, cancelled
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, paid, refunded, partially_refunded
  paymentIntentId: text("payment_intent_id"),
  refundAmount: decimal("refund_amount", { precision: 10, scale: 2 }),
  cancelledAt: timestamp("cancelled_at"),
  
  // Post-booking activities
  pickupCompletedAt: timestamp("pickup_completed_at"),
  returnCompletedAt: timestamp("return_completed_at"),
  pickupOdometerReading: integer("pickup_odometer_reading"),
  returnOdometerReading: integer("return_odometer_reading"),
  fuelLevelAtPickup: text("fuel_level_at_pickup"),
  fuelLevelAtReturn: text("fuel_level_at_return"),
  
  // Video verification
  pickupVideoUrl: text("pickup_video_url"),
  pickupVideoApprovedByCustomer: boolean("pickup_video_approved_by_customer").default(false),
  pickupVideoApprovedByOwner: boolean("pickup_video_approved_by_owner").default(false),
  pickupVideoApprovedAt: timestamp("pickup_video_approved_at"),
  
  returnVideoUrl: text("return_video_url"),
  returnVideoApprovedByCustomer: boolean("return_video_approved_by_customer").default(false),
  returnVideoApprovedByOwner: boolean("return_video_approved_by_owner").default(false),
  returnVideoApprovedAt: timestamp("return_video_approved_at"),
  
  // Late Return Charges
  actualReturnTime: timestamp("actual_return_time"), // When customer actually returned
  isLateReturn: boolean("is_late_return").default(false),
  lateReturnMinutes: integer("late_return_minutes").default(0),
  lateReturnCharge: decimal("late_return_charge", { precision: 10, scale: 2 }).default("0"), // 2x hourly rate
  lateFeeWaived: boolean("late_fee_waived").default(false), // If 30 min waived for members
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("bookings_user_idx").on(table.userId),
  vehicleIdx: index("bookings_vehicle_idx").on(table.vehicleId),
  statusIdx: index("bookings_status_idx").on(table.status),
  datesIdx: index("bookings_dates_idx").on(table.startDate, table.endDate),
  guestEmailIdx: index("bookings_guest_email_idx").on(table.guestEmail),
}));

// Ratings table (bidirectional - customer rates owner, owner rates customer)
export const ratings = pgTable("ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id),
  raterId: varchar("rater_id").notNull().references(() => users.id), // Who is giving the rating
  rateeId: varchar("ratee_id").notNull().references(() => users.id), // Who is being rated
  ratingType: text("rating_type").notNull(), // customer_to_owner, owner_to_customer, customer_to_vehicle
  rating: integer("rating").notNull(), // 1-5 stars
  review: text("review"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Challans table
export const challans = pgTable("challans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  bookingId: varchar("booking_id").references(() => bookings.id), // Matched booking based on date/time
  challanNumber: text("challan_number").notNull(),
  challanDate: timestamp("challan_date").notNull(),
  challanTime: text("challan_time").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  reason: text("reason").notNull(),
  proofUrl: text("proof_url").notNull(), // Upload by owner
  status: text("status").notNull().default("pending"), // pending, matched, paid, disputed
  paidByCustomer: boolean("paid_by_customer").default(false),
  uploadedByOwnerId: varchar("uploaded_by_owner_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Toll Fees table (submitted by owner after booking)
export const tollFees = pgTable("toll_fees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id),
  vehicleId: varchar("vehicle_id").notNull().references(() => vehicles.id),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  proofUrl: text("proof_url").notNull(), // Receipt/proof uploaded by owner
  description: text("description"), // e.g., "Highway toll - Bhubaneswar to Cuttack"
  status: text("status").notNull().default("pending"), // pending, paid, disputed
  paidAt: timestamp("paid_at"),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

// Addon Products table (GPS, insurance, helmets, etc.)
export const addonProducts = pgTable("addon_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // insurance, gps, accessories, safety
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdByAdminId: varchar("created_by_admin_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Owner Addon Purchases table (owners buy addons for their vehicles)
export const ownerAddonPurchases = pgTable("owner_addon_purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id), // Can be null if bought before listing
  addonProductId: varchar("addon_product_id").notNull().references(() => addonProducts.id),
  quantity: integer("quantity").notNull().default(1),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, paid, failed
  paymentIntentId: text("payment_intent_id"),
  purchasedAt: timestamp("purchased_at").notNull().defaultNow(),
});

// Video Verifications table
export const videoVerifications = pgTable("video_verifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: varchar("booking_id").notNull().references(() => bookings.id),
  videoUrl: text("video_url").notNull(),
  uploadedBy: varchar("uploaded_by").notNull(), // customer or owner
  approvedByCustomer: boolean("approved_by_customer").notNull().default(false),
  approvedByOwner: boolean("approved_by_owner").notNull().default(false),
  customerApprovedAt: timestamp("customer_approved_at"),
  ownerApprovedAt: timestamp("owner_approved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Referrals table - Track referral rewards
export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").notNull().references(() => users.id), // Who referred
  refereeId: varchar("referee_id").notNull().references(() => users.id), // Who was referred
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull().default("50"), // ₹50 referral bonus
  status: text("status").notNull().default("pending"), // pending, credited, expired
  expiresAt: timestamp("expires_at").notNull(), // 90 days from creation
  creditedAt: timestamp("credited_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  referrerIdx: index("referrals_referrer_idx").on(table.referrerId),
  refereeIdx: index("referrals_referee_idx").on(table.refereeId),
}));

// Wallet Transactions table - Track all wallet balance changes
export const walletTransactions = pgTable("wallet_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // credit, debit
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  balanceAfter: decimal("balance_after", { precision: 10, scale: 2 }).notNull(),
  source: text("source").notNull(), // referral, booking_refund, membership_purchase, booking_payment, etc.
  description: text("description").notNull(),
  referralId: varchar("referral_id").references(() => referrals.id), // If from referral
  bookingId: varchar("booking_id").references(() => bookings.id), // If related to booking
  expiresAt: timestamp("expires_at"), // For referral credits that expire
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("wallet_transactions_user_idx").on(table.userId),
  typeIdx: index("wallet_transactions_type_idx").on(table.type),
}));

// Agreement Acceptances table - Track legal agreement acceptances
export const agreementAcceptances = pgTable("agreement_acceptances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  agreementType: text("agreement_type").notNull(), // owner_terms, rental_agreement
  bookingId: varchar("booking_id").references(() => bookings.id), // For rental agreements
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  digitalSignature: text("digital_signature"), // Customer/owner name typed as signature
  agreedAt: timestamp("agreed_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("agreement_acceptances_user_idx").on(table.userId),
  bookingIdx: index("agreement_acceptances_booking_idx").on(table.bookingId),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertOwnerAddressSchema = createInsertSchema(ownerAddresses).omit({
  id: true,
  createdAt: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
}).extend({
  pricePerHour: z.union([z.string(), z.number()]).transform(val => String(val)),
  pricePerDay: z.union([z.string(), z.number()]).transform(val => String(val)),
  extraInsuranceCost: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  locationLat: z.union([z.string(), z.number(), z.null()]).transform(val => val === null ? null : String(val)).optional(),
  locationLng: z.union([z.string(), z.number(), z.null()]).transform(val => val === null ? null : String(val)).optional(),
});

export const insertVehicleDocumentSchema = createInsertSchema(vehicleDocuments).omit({
  id: true,
  uploadedAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
}).extend({
  startDate: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? new Date(val) : val),
  endDate: z.union([z.string(), z.date()]).transform(val => typeof val === 'string' ? new Date(val) : val),
  totalAmount: z.union([z.string(), z.number()]).transform(val => String(val)),
  deliveryCharge: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  insuranceCost: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  gpsCost: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  platformCommission: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
  ownerEarnings: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
});

export const insertRatingSchema = createInsertSchema(ratings).omit({
  id: true,
  createdAt: true,
});

export const insertChallanSchema = createInsertSchema(challans).omit({
  id: true,
  createdAt: true,
}).extend({
  fineAmount: z.union([z.string(), z.number()]).transform(val => String(val)),
});

export const insertVideoVerificationSchema = createInsertSchema(videoVerifications).omit({
  id: true,
  createdAt: true,
});

export const insertTollFeeSchema = createInsertSchema(tollFees).omit({
  id: true,
  submittedAt: true,
}).extend({
  amount: z.union([z.string(), z.number()]).transform(val => String(val)),
});

export const insertAddonProductSchema = createInsertSchema(addonProducts).omit({
  id: true,
  createdAt: true,
}).extend({
  price: z.union([z.string(), z.number()]).transform(val => String(val)),
});

export const insertOwnerAddonPurchaseSchema = createInsertSchema(ownerAddonPurchases).omit({
  id: true,
  purchasedAt: true,
}).extend({
  totalAmount: z.union([z.string(), z.number()]).transform(val => String(val)),
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
}).extend({
  amount: z.union([z.string(), z.number()]).transform(val => String(val)).optional(),
});

export const insertWalletTransactionSchema = createInsertSchema(walletTransactions).omit({
  id: true,
  createdAt: true,
}).extend({
  amount: z.union([z.string(), z.number()]).transform(val => String(val)),
  balanceAfter: z.union([z.string(), z.number()]).transform(val => String(val)),
});

export const insertAgreementAcceptanceSchema = createInsertSchema(agreementAcceptances).omit({
  id: true,
  agreedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;

export type OwnerAddress = typeof ownerAddresses.$inferSelect;
export type InsertOwnerAddress = z.infer<typeof insertOwnerAddressSchema>;

export type Vehicle = typeof vehicles.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;

export type VehicleDocument = typeof vehicleDocuments.$inferSelect;
export type InsertVehicleDocument = z.infer<typeof insertVehicleDocumentSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;

export type Challan = typeof challans.$inferSelect;
export type InsertChallan = z.infer<typeof insertChallanSchema>;

export type VideoVerification = typeof videoVerifications.$inferSelect;
export type InsertVideoVerification = z.infer<typeof insertVideoVerificationSchema>;

export type TollFee = typeof tollFees.$inferSelect;
export type InsertTollFee = z.infer<typeof insertTollFeeSchema>;

export type AddonProduct = typeof addonProducts.$inferSelect;
export type InsertAddonProduct = z.infer<typeof insertAddonProductSchema>;

export type OwnerAddonPurchase = typeof ownerAddonPurchases.$inferSelect;
export type InsertOwnerAddonPurchase = z.infer<typeof insertOwnerAddonPurchaseSchema>;

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;

export type WalletTransaction = typeof walletTransactions.$inferSelect;
export type InsertWalletTransaction = z.infer<typeof insertWalletTransactionSchema>;

export type AgreementAcceptance = typeof agreementAcceptances.$inferSelect;
export type InsertAgreementAcceptance = z.infer<typeof insertAgreementAcceptanceSchema>;

// Extended booking type with vehicle and user details
export type BookingWithDetails = Booking & {
  vehicle: Vehicle;
  user: User;
};

// Vehicle with owner details
export type VehicleWithOwner = Vehicle & {
  owner: User;
};
