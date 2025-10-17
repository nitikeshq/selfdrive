# Guest Checkout & Admin Features Implementation

## Overview
This document details the comprehensive features implemented for DriveEase, including guest checkout, admin verification workflow, document uploads, and post-booking activities.

## 🎯 Key Features Implemented

### 1. Guest Checkout System ✅
**Allows users to book vehicles without registration using only email and phone number**

#### Database Schema Updates
- Added guest booking fields to `bookings` table:
  - `isGuestBooking`: Boolean flag to identify guest bookings
  - `guestEmail`: Email address for guest bookings
  - `guestPhone`: Phone number for guest bookings
  - `guestName`: Guest customer name
  - `userId`: Made nullable to support guest bookings

#### API Endpoints
- `POST /api/bookings` - Now supports both authenticated and guest bookings (NO authentication required for guests)
  - For authenticated users: Include `userId`
  - For guest users: Include `isGuestBooking: true`, `guestEmail`, `guestPhone`, `guestName`
  - Validates that either userId OR all guest fields are provided
- `GET /api/guest-bookings?email={email}` - Retrieve bookings by guest email

#### How It Works
1. User selects a vehicle without logging in
2. Provides email, phone number, and name at checkout
3. Booking is created with guest information
4. Guest can track booking using their email

---

### 2. Admin Verification Workflow ✅
**All vehicles must be verified by admin before going live**

#### Database Schema Updates
Added to `vehicles` table:
- `verificationStatus`: pending | approved | rejected (default: pending)
- `verifiedAt`: Timestamp of verification
- `verifiedByAdminId`: Reference to admin who verified
- `rejectionReason`: Reason for rejection if rejected
- `currentStatus`: idle | rented | in_maintenance (tracks real-time status)

#### API Endpoints
- `GET /api/admin/vehicles/pending` - Get all pending vehicles for verification
- `POST /api/admin/vehicles/:id/approve` - Approve a vehicle (requires admin auth)
- `POST /api/admin/vehicles/:id/reject` - Reject a vehicle with reason (requires admin auth)

#### Workflow
1. Owner lists a vehicle → Status: **pending**
2. Admin reviews vehicle details and documents
3. Admin either:
   - **Approves** → Vehicle goes live, status: approved
   - **Rejects** → Vehicle hidden, owner notified with reason

---

### 3. Fallback Manual Address Entry ✅
**When Google Places API fails, owners can manually enter address**

#### Database Schema Updates
Added to `vehicles` table:
- `manualAddressLine1`: Street address line 1
- `manualAddressLine2`: Street address line 2 (optional)
- `manualCity`: City name
- `manualState`: State name
- `manualPincode`: PIN code

#### Implementation
- Vehicle listing form detects Google Places API failures
- Automatically shows manual address input fields
- Validates address completeness before submission
- Both Google Places and manual addresses supported

---

### 4. Vehicle Document Upload ✅
**Owners must upload vehicle documents during listing**

#### Database Schema
`vehicleDocuments` table stores:
- `documentType`: rc, insurance, puc, registration
- `documentUrl`: Uploaded document URL
- `documentNumber`: Document number (optional)
- `expiryDate`: Document expiry date
- `isVerified`: Admin verification status

#### API Endpoints
- `POST /api/vehicles/:id/documents` - Upload vehicle document (requires authentication + ownership verification)
  - Verifies user is either the vehicle owner OR admin
  - Returns 403 Forbidden if user doesn't own the vehicle
- `GET /api/vehicles/:id/documents` - Get all documents for a vehicle

#### Required Documents
1. **Registration Certificate (RC)**
2. **Insurance Policy**
3. **Pollution Under Control (PUC) Certificate**

---

### 5. Super Admin Dashboard ✅
**Complete control panel for platform management**

#### Features Implemented
1. **Analytics Overview**
   - Total users (customers vs owners)
   - Total vehicles (pending/approved/rejected)
   - Total bookings (active/completed/cancelled)
   - Platform earnings and total revenue

2. **Vehicle Verification**
   - View all pending vehicles
   - See owner details, vehicle info
   - Approve or reject with reason
   - Real-time updates

3. **User Management**
   - View all customers
   - View all vehicle owners
   - Check KYC status
   - Monitor user activities

#### API Endpoints
- `GET /api/admin/analytics` - Get platform analytics
- `GET /api/admin/users` - Get all users (with optional role filter)

#### Access
- Route: `/admin-dashboard`
- Authentication: Requires admin role
- Protected by `isAdmin` middleware

---

### 6. Post-Booking Activities & Status Tracking ✅
**Complete lifecycle tracking from pickup to return**

#### Database Schema Updates
Added to `bookings` table:
- **Pickup Tracking:**
  - `pickupCompletedAt`: Timestamp when pickup completed
  - `pickupOdometerReading`: Odometer reading at pickup
  - `fuelLevelAtPickup`: Fuel level at pickup
  - `pickupVideoUrl`: Pickup verification video

- **Return Tracking:**
  - `returnCompletedAt`: Timestamp when return completed
  - `returnOdometerReading`: Odometer reading at return
  - `fuelLevelAtReturn`: Fuel level at return
  - `returnVideoUrl`: Return verification video

#### API Endpoints
- `POST /api/bookings/:id/pickup` - Mark pickup complete with details (requires authentication + authorization)
  - Verifies user is either the booking customer OR vehicle owner
  - Records odometer reading, fuel level, and video URL
  - Updates vehicle status to "rented"
- `POST /api/bookings/:id/return` - Mark return complete with details (requires authentication + authorization)
  - Verifies user is either the booking customer OR vehicle owner
  - Records odometer reading, fuel level, and video URL
  - Updates vehicle status to "idle"

#### Workflow
1. **Booking Created** → Status: pending
2. **Payment Complete** → Status: confirmed
3. **Vehicle Pickup** → Status: active
   - Record odometer, fuel level, video
   - Vehicle status: rented
4. **Vehicle Return** → Status: completed
   - Record odometer, fuel level, video
   - Vehicle status: idle

---

### 7. Owner Vehicle Status Visibility ✅
**Owners can see real-time status of their vehicles**

#### Vehicle Status Types
- `idle`: Available for rent
- `rented`: Currently rented out
- `in_maintenance`: Under maintenance

#### Implementation
- Owner dashboard shows current status for each vehicle
- Status automatically updates during booking lifecycle
- Visual badges for quick status identification

---

## 🔒 Security & Authentication

### Middleware Used
- `isAuthenticated`: Ensures user is logged in
- `isAdmin`: Ensures user has admin role
- `isOwner`: Ensures user is vehicle owner

### Protected Routes
- All admin routes require `isAdmin` middleware
- Vehicle document upload requires `isAuthenticated` + **ownership verification** (owner or admin only)
- Pickup/Return endpoints require `isAuthenticated` + **authorization check** (customer or owner only)
- Owner dashboard requires `isAuthenticated` + ownership verification

### Authorization Checks
1. **Document Uploads**: Verified that user owns the vehicle OR is admin
2. **Pickup/Return**: Verified that user is the booking customer OR vehicle owner
3. **Admin Actions**: Verified that user has admin role
4. **Guest Bookings**: No authentication required, validated by guest fields instead

---

## 📊 Database Indexes Added
For optimal query performance:
- `vehicles_verification_idx` on `verificationStatus`
- `bookings_guest_email_idx` on `guestEmail`

---

## 🎨 UI Components Created

### 1. Admin Dashboard (`/admin-dashboard`)
- Analytics cards with metrics
- Vehicle verification table
- User management tables
- Approve/Reject dialogs

### 2. Guest Booking Form
- Email, phone, name inputs
- Seamless checkout experience
- No login required

### 3. Owner Dashboard Updates
- Vehicle status badges
- Real-time status tracking
- Booking activities view

---

## 🚀 How to Use

### For Admins
1. Login with admin credentials
2. Navigate to `/admin-dashboard`
3. Review pending vehicles under "Vehicle Verification" tab
4. Approve or reject with reasons
5. Monitor analytics and users

### For Vehicle Owners
1. List a vehicle (automatically pending status)
2. Upload required documents
3. Wait for admin approval
4. Once approved, vehicle goes live
5. Track vehicle status in owner dashboard

### For Customers (Guest Checkout)
1. Browse vehicles
2. Select vehicle and dates
3. At checkout, choose "Book as Guest"
4. Enter email, phone, name
5. Complete payment
6. Track booking via email

---

## 📝 Important Notes

1. **Guest Bookings**
   - No account creation required
   - Tracked by email address
   - Can retrieve booking anytime using email

2. **Admin Verification**
   - All new vehicles start as "pending"
   - Only approved vehicles appear in search
   - Rejected vehicles hidden with reason provided

3. **Document Verification**
   - Documents required before listing
   - Admin reviews documents during verification
   - Expired documents flagged automatically

4. **Vehicle Status Tracking**
   - Real-time status updates
   - Owners see current status
   - Prevents double-booking

---

## 🔄 Status Flow Diagrams

### Vehicle Status Flow
```
Owner Lists Vehicle → pending
         ↓
Admin Reviews → approved OR rejected
         ↓
   If approved → live
         ↓
   Booking starts → rented
         ↓
   Booking ends → idle
```

### Booking Status Flow
```
Guest/User Books → pending
         ↓
Payment Complete → confirmed
         ↓
Vehicle Pickup → active (record details)
         ↓
Vehicle Return → completed (record details)
```

---

## 🎯 Success Metrics

All features have been successfully implemented with:
- ✅ Database schema properly migrated
- ✅ API routes created and tested
- ✅ Frontend components built
- ✅ Authentication & authorization in place
- ✅ Error handling implemented
- ✅ User-friendly interfaces created

---

## 📞 Support

For any issues or questions:
1. Check logs in browser console
2. Verify admin credentials
3. Ensure all migrations are applied
4. Contact platform administrator

---

**Implementation Status**: ✅ Complete
**Last Updated**: October 17, 2025
