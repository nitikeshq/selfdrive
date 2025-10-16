# DriveEase - Complete API Documentation for Native App Development

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Data Models](#data-models)
5. [Payment Integration](#payment-integration)
6. [Object Storage](#object-storage)
7. [Business Logic](#business-logic)

---

## Overview

**Base URL**: Your Replit deployment URL (e.g., `https://your-repl.replit.app`)

**Authentication**: Session-based using cookies
- Cookie name: `connect.sid`
- Session TTL: 7 days
- All authenticated routes require valid session cookie

**Content-Type**: `application/json` for all requests and responses

---

## Authentication

### 1. Register User
```
POST /api/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "customer"  // Options: "customer", "owner", "admin"
}
```

**Response (201):**
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "customer"
}
```

**Errors:**
- 400: Email and password required / User already exists
- 500: Failed to register

---

### 2. Login
```
POST /api/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "customer"
}
```

**Errors:**
- 400: Email and password required
- 401: Invalid credentials
- 500: Failed to login

---

### 3. Logout
```
POST /api/logout
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### 4. Get Current User
```
GET /api/auth/user
```
**Authentication**: Required

**Response (200):**
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "customer",
  "profileImageUrl": "https://..."
}
```

**Errors:**
- 401: Unauthorized (no valid session)
- 404: User not found
- 500: Failed to fetch user

---

## API Endpoints

### Vehicles

#### 1. Get All Vehicles
```
GET /api/vehicles?search={query}&location={city}
```

**Query Parameters:**
- `search` (optional): Search by name, brand, model, or type
- `location` (optional): Filter by location (default: "Bhubaneswar")

**Response (200):**
```json
[
  {
    "id": "uuid",
    "ownerId": "owner-uuid",
    "name": "Honda City",
    "type": "car",  // "car" or "bike"
    "brand": "Honda",
    "model": "City",
    "year": 2023,
    "seats": 5,
    "fuelType": "petrol",  // "petrol", "diesel", "electric"
    "transmission": "automatic",  // "manual" or "automatic"
    "registrationNumber": "OD05AB1234",
    "pricePerHour": "150.00",
    "pricePerDay": "2500.00",
    "location": "Bhubaneswar",
    "locationPlaceId": "ChIJ...",
    "locationLat": "20.2961",
    "locationLng": "85.8245",
    "ownerLocation": "Bhubaneswar",
    "imageUrl": "https://...",
    "features": ["AC", "GPS", "Music System"],
    "hasExtraInsurance": true,
    "extraInsuranceCost": "200.00",
    "hasGpsTracking": true,
    "gpsDeviceId": "GPS123",
    "averageRating": "4.5",
    "totalRatings": 10,
    "available": true,
    "isPaused": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

**Note**: This endpoint automatically filters out:
- Paused vehicles
- Currently rented vehicles
- Vehicles not matching location/search criteria

---

#### 2. Get Single Vehicle
```
GET /api/vehicles/:id
```

**Response (200):** Same structure as vehicle object above

**Errors:**
- 404: Vehicle not found
- 500: Failed to fetch vehicle

---

#### 3. Create Vehicle
```
POST /api/vehicles
```

**Request Body:**
```json
{
  "ownerId": "owner-uuid",
  "name": "Honda City",
  "type": "car",
  "brand": "Honda",
  "model": "City",
  "year": 2023,
  "seats": 5,
  "fuelType": "petrol",
  "transmission": "automatic",
  "registrationNumber": "OD05AB1234",
  "pricePerHour": "150.00",
  "pricePerDay": "2500.00",
  "location": "Bhubaneswar",
  "locationPlaceId": "ChIJ...",
  "locationLat": "20.2961",
  "locationLng": "85.8245",
  "ownerLocation": "Bhubaneswar",
  "imageUrl": "https://...",
  "features": ["AC", "GPS", "Music System"],
  "hasExtraInsurance": true,
  "extraInsuranceCost": "200.00",
  "hasGpsTracking": true,
  "gpsDeviceId": "GPS123"
}
```

**Response (201):** Created vehicle object

**Errors:**
- 400: Validation errors (Zod)
- 500: Failed to create vehicle

---

#### 4. Update Vehicle
```
PATCH /api/vehicles/:id
```

**Request Body:** Partial vehicle object (only fields to update)

**Response (200):** Updated vehicle object

---

#### 5. Toggle Vehicle Pause Status
```
PATCH /api/vehicles/:id/toggle-pause
```

**Response (200):** Updated vehicle with toggled `isPaused` status

---

#### 6. Delete Vehicle
```
DELETE /api/vehicles/:id
```

**Response (204):** No content

---

#### 7. Get Owner Vehicles
```
GET /api/owner/vehicles?ownerId={ownerId}
```

**Query Parameters:**
- `ownerId` (required): Owner's user ID

**Response (200):** Array of vehicles owned by the owner

---

#### 8. Check Vehicle Availability
```
POST /api/vehicles/:id/check-availability
```

**Request Body:**
```json
{
  "startDate": "2024-01-15T10:00:00.000Z",
  "endDate": "2024-01-17T18:00:00.000Z"
}
```

**Response (200):**
```json
{
  "available": true
}
```

---

### Bookings

#### 1. Get User Bookings
```
GET /api/bookings?userId={userId}
```

**Query Parameters:**
- `userId` (required): User's ID

**Response (200):**
```json
[
  {
    "id": "booking-uuid",
    "userId": "user-uuid",
    "vehicleId": "vehicle-uuid",
    "startDate": "2024-01-15T10:00:00.000Z",
    "endDate": "2024-01-17T18:00:00.000Z",
    "pickupOption": "parking",  // "parking" or "delivery"
    "deliveryAddress": null,
    "totalAmount": "5000.00",
    "deliveryCharge": "0.00",
    "hasExtraInsurance": true,
    "insuranceAmount": "200.00",
    "platformCommission": "1500.00",  // 30% commission
    "ownerEarnings": "3500.00",       // 70% to owner
    "status": "confirmed",  // "pending", "confirmed", "active", "completed", "cancelled"
    "paymentStatus": "paid",  // "pending", "paid", "refunded", "partially_refunded"
    "paymentIntentId": "TXN...",
    "refundAmount": null,
    "cancelledAt": null,
    "pickupVideoUrl": null,
    "pickupVideoApprovedByCustomer": false,
    "pickupVideoApprovedByOwner": false,
    "pickupVideoApprovedAt": null,
    "createdAt": "2024-01-14T10:00:00.000Z"
  }
]
```

---

#### 2. Get Single Booking
```
GET /api/bookings/:id
```

**Response (200):** Booking object

---

#### 3. Create Booking
```
POST /api/bookings
```

**Request Body:**
```json
{
  "userId": "user-uuid",
  "vehicleId": "vehicle-uuid",
  "startDate": "2024-01-15T10:00:00.000Z",
  "endDate": "2024-01-17T18:00:00.000Z",
  "pickupOption": "parking",
  "deliveryAddress": "123 Main St, Bhubaneswar",  // Required if pickupOption is "delivery"
  "totalAmount": "5000.00",
  "deliveryCharge": "200.00",
  "hasExtraInsurance": true,
  "insuranceAmount": "200.00"
}
```

**Response (201):** Created booking object

**Errors:**
- 400: Vehicle not available for selected dates / Validation errors
- 500: Failed to create booking

---

#### 4. Update Booking
```
PATCH /api/bookings/:id
```

**Request Body:** Partial booking object

**Response (200):** Updated booking object

---

#### 5. Cancel Booking
```
POST /api/bookings/:id/cancel
```

**Cancellation Policy:**
- **72+ hours before start**: 100% refund minus 2% processing fee
- **24-72 hours before start**: 80% refund
- **Less than 24 hours**: 60% refund

**Response (200):**
```json
{
  "booking": { /* updated booking object */ },
  "refundAmount": 4900.00,
  "refundPercentage": 100,
  "message": "Booking cancelled. Refund of ₹4900.00 (100%) will be processed."
}
```

---

#### 6. Get Owner Bookings
```
GET /api/owner/bookings?ownerId={ownerId}
```

**Query Parameters:**
- `ownerId` (required): Owner's user ID

**Response (200):** Array of bookings for owner's vehicles

---

### Users

#### 1. Get User by ID
```
GET /api/users/:id
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "profileImageUrl": "https://...",
  "phone": "+91 9876543210",
  "role": "customer",
  "aadharNumber": "1234-5678-9012",
  "aadharPhotoUrl": "https://...",
  "panNumber": "ABCDE1234F",
  "panPhotoUrl": "https://...",
  "dlNumber": "OD05 12345678901",
  "dlPhotoUrl": "https://...",
  "isKycVerified": false,
  "kycVerifiedAt": null,
  "digilockerLinked": false,
  "walletBalance": "1000.00",
  "securityDepositPaid": false,
  "securityDepositAmount": null,
  "averageRatingAsCustomer": "4.5",
  "totalRatingsAsCustomer": 10,
  "averageRatingAsOwner": "4.8",
  "totalRatingsAsOwner": 25,
  "payuVendorId": "VENDOR123",
  "bankAccountNumber": "1234567890",
  "bankIfscCode": "SBIN0001234",
  "bankAccountHolderName": "John Doe",
  "isPayuVendorVerified": false,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

#### 2. Update User
```
PATCH /api/users/:id
```

**Request Body:** Partial user object

**Response (200):** Updated user object

---

### Ratings

#### 1. Create Rating
```
POST /api/ratings
```

**Request Body:**
```json
{
  "bookingId": "booking-uuid",
  "vehicleId": "vehicle-uuid",  // Optional, only for vehicle ratings
  "raterId": "user-uuid",  // Who is giving the rating
  "rateeId": "user-uuid",  // Who is being rated
  "ratingType": "customer_to_owner",  // "customer_to_owner", "owner_to_customer", "customer_to_vehicle"
  "rating": 5,  // 1-5 stars
  "review": "Great experience!"
}
```

**Response (201):** Created rating object

---

#### 2. Get Ratings by Booking
```
GET /api/ratings/:bookingId
```

**Response (200):** Array of ratings for the booking

---

#### 3. Get Ratings for User
```
GET /api/ratings/user/:userId
```

**Response (200):** Array of ratings received by the user

---

### Payments (PayU Integration)

#### 1. Create Payment
```
POST /api/create-payment
```

**Request Body:**
```json
{
  "amount": 5000.00,
  "bookingId": "booking-uuid",
  "userEmail": "user@example.com",
  "userFirstName": "John",
  "userPhone": "9876543210"
}
```

**Response (200):**
```json
{
  "key": "MERCHANT_KEY",
  "txnid": "TXN1234567890",
  "amount": "5000.00",
  "productinfo": "Vehicle Booking - booking-uuid",
  "firstname": "John",
  "email": "user@example.com",
  "phone": "9876543210",
  "surl": "https://your-app.com/api/payment-success",
  "furl": "https://your-app.com/api/payment-failure",
  "hash": "sha512-hash-string",
  "split_info": "{\"vendor_id\":\"VENDOR123\",\"vendor_amount\":\"3500.00\",\"platform_amount\":\"1500.00\"}",
  "paymentUrl": "https://test.payu.in/_payment"  // or production URL
}
```

**Usage**: Use the returned data to initiate PayU payment on client side

**Platform Commission**: 30% of total amount
**Owner Earnings**: 70% of total amount (transferred to owner's PayU vendor account)

---

#### 2. Payment Success Callback
```
POST /api/payment-success
```
**Note**: This is called by PayU, not your app

---

#### 3. Payment Failure Callback
```
POST /api/payment-failure
```
**Note**: This is called by PayU, not your app

---

### Object Storage

#### 1. Get Upload URL
```
POST /api/objects/upload
```
**Authentication**: Required

**Response (200):**
```json
{
  "uploadURL": "https://storage.googleapis.com/..."
}
```

**Usage**: Use this pre-signed URL to upload files directly to Google Cloud Storage

---

#### 2. Set DL Photo ACL
```
PUT /api/dl-photos
```
**Authentication**: Required

**Request Body:**
```json
{
  "dlPhotoURL": "/objects/path/to/file.jpg"
}
```

**Response (200):**
```json
{
  "objectPath": "/objects/path/to/file.jpg"
}
```

**Purpose**: Sets privacy ACL on driver's license photo so only the owner can access it

---

#### 3. Download Protected File
```
GET /objects/:objectPath
```
**Authentication**: Required

**Response**: File stream with appropriate Content-Type

**Purpose**: Serves protected files (like DL photos) with ACL checking

---

## Data Models

### User Roles
- **customer**: Can browse and book vehicles
- **owner**: Can list vehicles and manage bookings
- **admin**: Full platform access

### Vehicle Types
- **car**: 4-wheeler vehicles
- **bike**: 2-wheeler vehicles

### Fuel Types
- **petrol**
- **diesel**
- **electric**

### Transmission Types
- **manual**
- **automatic**

### Pickup Options
- **parking**: Customer picks up from parking location
- **delivery**: Vehicle delivered to customer's address

### Booking Status
- **pending**: Awaiting payment
- **confirmed**: Payment successful
- **active**: Booking period started
- **completed**: Booking period ended
- **cancelled**: Cancelled by user

### Payment Status
- **pending**: Payment not initiated
- **paid**: Payment successful
- **refunded**: Full refund processed
- **partially_refunded**: Partial refund processed

### Rating Types
- **customer_to_owner**: Customer rates owner
- **owner_to_customer**: Owner rates customer
- **customer_to_vehicle**: Customer rates vehicle

---

## Payment Integration

### PayU Marketplace Model
- **Platform Commission**: 30% of booking amount
- **Owner Earnings**: 70% of booking amount
- **Split Payment**: Automatic settlement to owner's PayU vendor account after 7 days
- **Payment Gateway**: PayU (test/production environments)

### Payment Flow
1. Create booking (status: pending, paymentStatus: pending)
2. Call `/api/create-payment` with booking details
3. Get PayU payment data with hash
4. Redirect user to PayU payment page
5. PayU redirects to success/failure callback
6. Update booking status based on payment result

---

## Object Storage

### Google Cloud Storage Integration
- **Authentication**: Replit sidecar service
- **Required Environment Variables**:
  - `PUBLIC_OBJECT_SEARCH_PATHS`: Comma-separated GCS paths for public files
  - `PRIVATE_OBJECT_DIR`: GCS path for private files (DL photos, etc.)

### File Upload Flow
1. Call `/api/objects/upload` to get pre-signed URL
2. Upload file directly to GCS using the URL
3. Call `/api/dl-photos` to set ACL if file is private
4. Store returned object path in database

### ACL System
- **Public**: Readable by anyone
- **Private**: Readable only by owner
- Permissions: READ, WRITE

---

## Business Logic

### Booking Cancellation Policy
```javascript
const hoursUntilStart = (startDate - now) / (1000 * 60 * 60);

if (hoursUntilStart >= 72) {
  // 3+ days: 100% refund minus 2% processing fee
  refundAmount = totalAmount - (totalAmount * 0.02);
} else if (hoursUntilStart >= 24) {
  // 1-3 days: 80% refund
  refundAmount = totalAmount * 0.8;
} else {
  // < 24 hours: 60% refund
  refundAmount = totalAmount * 0.6;
}
```

### Vehicle Availability Check
A vehicle is available if:
1. Not paused (`isPaused = false`)
2. No active bookings overlapping requested dates
3. Booking status is not 'cancelled'

### Platform Commission Split
```javascript
const PLATFORM_COMMISSION_RATE = 0.30; // 30%
platformCommission = totalAmount * 0.30;
ownerEarnings = totalAmount * 0.70;
```

---

## Additional Endpoints

### Challans (Traffic Violations)
```
POST /api/challans
GET /api/challans/vehicle/:vehicleId
GET /api/challans/booking/:bookingId
```

### Vehicle Documents
```
POST /api/vehicle-documents
GET /api/vehicle-documents/:vehicleId
```

### Owner Addresses
```
POST /api/owner-addresses
GET /api/owner-addresses/:ownerId
PATCH /api/owner-addresses/:id
DELETE /api/owner-addresses/:id
```

### Video Verifications
```
POST /api/video-verifications
GET /api/video-verifications/:bookingId
PATCH /api/video-verifications/:id/approve
```

---

## Error Handling

All endpoints return standard HTTP status codes:
- **200**: Success
- **201**: Created
- **204**: No Content (successful deletion)
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (no session)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **500**: Internal Server Error

Error response format:
```json
{
  "error": "Error message",
  "message": "Detailed message"
}
```

For validation errors (Zod):
```json
{
  "error": [
    {
      "path": ["fieldName"],
      "message": "Validation message"
    }
  ]
}
```

---

## Session Management

### Cookie-based Authentication
- Cookie name: `connect.sid`
- HttpOnly: true (prevents XSS)
- Secure: true (in production, HTTPS only)
- SameSite: Lax
- Max Age: 7 days

### For Native Apps
Since native apps can't use browser cookies:
1. After login/register, store the session cookie from response headers
2. Include cookie in subsequent requests:
   ```
   Cookie: connect.sid=s%3A...
   ```
3. Or implement token-based auth (requires backend modification)

---

## Environment Variables Required

```bash
# Database
DATABASE_URL=postgresql://...

# Session
SESSION_SECRET=your-secret-key

# PayU Payment Gateway
PAYU_MERCHANT_KEY=your-merchant-key
PAYU_SALT=your-salt-key

# Object Storage
PUBLIC_OBJECT_SEARCH_PATHS=gs://bucket/public
PRIVATE_OBJECT_DIR=gs://bucket/private

# App URL
REPLIT_DEV_DOMAIN=https://your-app.replit.app
```

---

## Next Steps for Native App Development

1. **Authentication**: Implement cookie/session handling or switch to JWT tokens
2. **API Client**: Create a REST client with base URL configuration
3. **State Management**: Use Redux/MobX/Context for managing user session
4. **File Uploads**: Implement multipart upload to GCS using pre-signed URLs
5. **Payment Integration**: Integrate PayU SDK for mobile payments
6. **Real-time Updates**: Consider WebSocket for live booking updates
7. **Offline Support**: Cache vehicle data and implement sync mechanism

---

## Support

For questions or issues, contact the development team or refer to the codebase documentation in `replit.md`.
