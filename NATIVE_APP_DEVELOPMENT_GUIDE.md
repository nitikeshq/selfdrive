# Native App Development Guide - DriveEase

## 📚 Documentation Files

I've created comprehensive documentation for building your native app:

1. **API_DOCUMENTATION.md** - Complete API reference with all endpoints
2. **API_REQUEST_RESPONSE_EXAMPLES.md** - Full request/response examples for every endpoint
3. **JWT_AUTH_IMPLEMENTATION.md** - JWT authentication implementation guide
4. **This file** - Quick start guide

---

## 🚀 Quick Start

### Step 1: Understand Current Authentication

**Current System**: Session-based (cookies)
- Works for web apps
- Not ideal for native mobile apps

**Recommended**: JWT Token-based authentication
- Stateless and scalable
- Perfect for mobile apps
- Easy to implement

### Step 2: Implement JWT Authentication

Follow the **JWT_AUTH_IMPLEMENTATION.md** guide to:

1. Install `jsonwebtoken` package
2. Create JWT utility functions
3. Update login/register endpoints to return tokens
4. Protect routes with JWT middleware
5. Handle token refresh and expiration

**Quick Implementation:**
```bash
# On backend
npm install jsonwebtoken @types/jsonwebtoken
```

### Step 3: API Integration in Your App

**Base URL**: `https://your-repl.replit.app`

**Authentication Flow:**
```javascript
// 1. Login
const response = await fetch('/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { token, user } = await response.json();

// 2. Store token securely
await SecureStorage.setItem('authToken', token);

// 3. Use token in subsequent requests
const vehicles = await fetch('/api/vehicles', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 📱 Native App Architecture

### Required Screens

1. **Authentication**
   - Login Screen
   - Register Screen
   - Profile Screen

2. **Customer Flow**
   - Vehicle Listing (Browse)
   - Vehicle Details
   - Booking Form
   - Payment Screen
   - My Bookings
   - Booking Details

3. **Owner Flow**
   - My Vehicles
   - Add/Edit Vehicle
   - Vehicle Bookings
   - Earnings Dashboard

4. **Common**
   - KYC Verification
   - Ratings & Reviews
   - Settings

### Key Features to Implement

#### 1. Authentication & User Management
- Login/Register with JWT
- Secure token storage
- Auto token refresh
- Logout functionality

#### 2. Vehicle Management
- Browse vehicles with filters (location, type, price)
- Search functionality
- Vehicle details with images
- Availability checking

#### 3. Booking System
- Date/time picker for booking
- Pickup option selection (parking/delivery)
- Insurance option
- Real-time availability check
- Booking confirmation

#### 4. Payment Integration
- PayU payment gateway integration
- Payment status tracking
- Transaction history
- Refund handling

#### 5. File Uploads
- Vehicle image upload
- KYC document upload (DL, Aadhar, PAN)
- Profile picture upload
- Video verification upload

#### 6. Ratings & Reviews
- Rate vehicles
- Rate owners/customers
- View ratings history

---

## 🔐 Security Implementation

### 1. Token Storage

**React Native:**
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Save
await AsyncStorage.setItem('authToken', token);

// Retrieve
const token = await AsyncStorage.getItem('authToken');
```

**Flutter:**
```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final storage = FlutterSecureStorage();
await storage.write(key: 'authToken', value: token);
String? token = await storage.read(key: 'authToken');
```

### 2. API Client Setup

**React Native (Axios):**
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://your-app.replit.app',
});

// Add auth token to all requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Token expired - logout or refresh
      await AsyncStorage.removeItem('authToken');
      // Navigate to login
    }
    return Promise.reject(error);
  }
);
```

### 3. Request Examples

See **API_REQUEST_RESPONSE_EXAMPLES.md** for complete examples of every endpoint.

---

## 💳 Payment Integration

### PayU Payment Flow

1. **Create Booking** → Get booking ID
2. **Initialize Payment** → Call `/api/create-payment`
3. **Get Payment Data** → Receive hash, transaction ID, etc.
4. **Open PayU WebView** → Load payment gateway
5. **Handle Redirect** → Success/failure callback
6. **Update Booking Status** → Confirm payment

**Example:**
```javascript
// 1. Create booking
const booking = await api.post('/api/bookings', bookingData);

// 2. Initialize payment
const paymentData = await api.post('/api/create-payment', {
  amount: booking.totalAmount,
  bookingId: booking.id,
  userEmail: user.email,
  userFirstName: user.firstName,
  userPhone: user.phone
});

// 3. Open PayU in WebView
const paymentHTML = `
  <form action="${paymentData.paymentUrl}" method="post" id="payuForm">
    <input name="key" value="${paymentData.key}" />
    <input name="txnid" value="${paymentData.txnid}" />
    <input name="amount" value="${paymentData.amount}" />
    <!-- ... other fields ... -->
    <input name="hash" value="${paymentData.hash}" />
  </form>
  <script>document.getElementById('payuForm').submit();</script>
`;

// 4. Load in WebView and handle callbacks
```

---

## 📤 File Upload Flow

### Upload Vehicle Image or KYC Document

```javascript
// 1. Get upload URL from server
const { uploadURL } = await api.post('/api/objects/upload');

// 2. Upload file directly to Google Cloud Storage
const formData = new FormData();
formData.append('file', {
  uri: fileUri,
  type: 'image/jpeg',
  name: 'photo.jpg'
});

await fetch(uploadURL, {
  method: 'PUT',
  headers: { 'Content-Type': 'image/jpeg' },
  body: file
});

// 3. Extract object path from URL
const objectPath = new URL(uploadURL).pathname;

// 4. If private file (DL photo), set ACL
if (isPrivateDocument) {
  await api.put('/api/dl-photos', {
    dlPhotoURL: objectPath
  });
}

// 5. Save path in user/vehicle record
await api.patch(`/api/users/${userId}`, {
  dlPhotoUrl: objectPath
});
```

---

## 🔄 State Management

### Recommended Approach

**React Native:**
- Use **Redux Toolkit** or **Zustand** for global state
- Use **React Query** for API data caching
- Context API for theme/auth state

**Flutter:**
- Use **Riverpod** or **Provider** for state management
- Use **Dio** with interceptors for API calls
- Use **flutter_bloc** for complex state logic

### Example State Structure
```javascript
{
  auth: {
    token: 'jwt-token',
    user: { id, email, firstName, lastName, role },
    isAuthenticated: true
  },
  vehicles: {
    list: [...vehicles],
    selectedVehicle: {...},
    filters: { location: 'Bhubaneswar', type: 'car' }
  },
  bookings: {
    userBookings: [...],
    currentBooking: {...}
  }
}
```

---

## 🗺️ Key API Endpoints Summary

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login (returns JWT token)
- `GET /api/auth/user` - Get current user
- `POST /api/auth/refresh` - Refresh token

### Vehicles
- `GET /api/vehicles` - List vehicles (with filters)
- `GET /api/vehicles/:id` - Get vehicle details
- `POST /api/vehicles` - Create vehicle (owner only)
- `POST /api/vehicles/:id/check-availability` - Check availability

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings?userId=:id` - Get user bookings
- `POST /api/bookings/:id/cancel` - Cancel booking
- `GET /api/owner/bookings?ownerId=:id` - Get owner bookings

### Payments
- `POST /api/create-payment` - Initialize PayU payment
- Payment callbacks handled by server

### Users & KYC
- `PATCH /api/users/:id` - Update user
- `PATCH /api/users/kyc` - Update KYC details
- `GET /api/users/kyc-status` - Get KYC status

### Ratings
- `POST /api/ratings` - Create rating
- `GET /api/ratings/:bookingId` - Get booking ratings

### File Upload
- `POST /api/objects/upload` - Get upload URL
- `PUT /api/dl-photos` - Set DL photo ACL

---

## ⚙️ Environment Setup

### Required Environment Variables

On your Replit backend:
```bash
# Database
DATABASE_URL=postgresql://...

# Authentication
SESSION_SECRET=your-session-secret
JWT_SECRET=your-jwt-secret-min-32-chars
JWT_EXPIRES_IN=7d

# Payment Gateway (PayU)
PAYU_MERCHANT_KEY=your-merchant-key
PAYU_SALT=your-salt-key

# Object Storage
PUBLIC_OBJECT_SEARCH_PATHS=gs://bucket/public
PRIVATE_OBJECT_DIR=gs://bucket/private

# App Domain
REPLIT_DEV_DOMAIN=https://your-app.replit.app
```

---

## 🧪 Testing Your Integration

### 1. Test Authentication
```bash
curl -X POST https://your-app.replit.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 2. Test Protected Endpoint
```bash
curl -X GET https://your-app.replit.app/api/auth/user \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Test Vehicle Listing
```bash
curl -X GET "https://your-app.replit.app/api/vehicles?location=Bhubaneswar"
```

---

## 📊 Data Models Reference

### User Object
```typescript
{
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "customer" | "owner" | "admin";
  phone: string;
  profileImageUrl: string;
  // KYC fields
  aadharNumber: string;
  panNumber: string;
  dlNumber: string;
  dlPhotoUrl: string;
  isKycVerified: boolean;
  // Wallet & ratings
  walletBalance: string;
  averageRatingAsCustomer: string;
  averageRatingAsOwner: string;
}
```

### Vehicle Object
```typescript
{
  id: string;
  ownerId: string;
  name: string;
  type: "car" | "bike";
  brand: string;
  model: string;
  year: number;
  seats: number;
  fuelType: "petrol" | "diesel" | "electric";
  transmission: "manual" | "automatic";
  registrationNumber: string;
  pricePerHour: string;
  pricePerDay: string;
  location: string;
  locationLat: string;
  locationLng: string;
  imageUrl: string;
  features: string[];
  hasExtraInsurance: boolean;
  extraInsuranceCost: string;
  averageRating: string;
  totalRatings: number;
  available: boolean;
  isPaused: boolean;
}
```

### Booking Object
```typescript
{
  id: string;
  userId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  pickupOption: "parking" | "delivery";
  deliveryAddress: string | null;
  totalAmount: string;
  deliveryCharge: string;
  hasExtraInsurance: boolean;
  insuranceAmount: string;
  platformCommission: string;
  ownerEarnings: string;
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "refunded" | "partially_refunded";
  paymentIntentId: string;
  refundAmount: string | null;
  cancelledAt: string | null;
}
```

---

## 🎯 Implementation Checklist

### Backend Setup
- [ ] Implement JWT authentication
- [ ] Update all routes to use JWT middleware
- [ ] Test all endpoints with Postman
- [ ] Set up object storage environment variables
- [ ] Configure PayU payment gateway

### Mobile App Setup
- [ ] Set up API client with base URL
- [ ] Implement secure token storage
- [ ] Add authentication screens
- [ ] Add interceptors for auth token
- [ ] Handle token expiration

### Core Features
- [ ] Vehicle listing with filters
- [ ] Vehicle details screen
- [ ] Booking flow (dates, options, payment)
- [ ] Payment integration (PayU WebView)
- [ ] My bookings screen
- [ ] Rating system
- [ ] KYC upload and verification
- [ ] File upload functionality

### Testing
- [ ] Test complete user journey
- [ ] Test payment flow end-to-end
- [ ] Test file uploads
- [ ] Handle edge cases and errors
- [ ] Test offline scenarios

---

## 📞 Support & Resources

### Documentation Files
1. **API_DOCUMENTATION.md** - Full API reference
2. **API_REQUEST_RESPONSE_EXAMPLES.md** - Complete request/response examples
3. **JWT_AUTH_IMPLEMENTATION.md** - JWT setup guide

### Platform Details
- **Payment Gateway**: PayU Marketplace (30% platform commission, 70% to owner)
- **Cancellation Policy**: 100% refund (72+ hrs), 80% (24-72 hrs), 60% (<24 hrs)
- **Object Storage**: Google Cloud Storage via Replit sidecar
- **Database**: PostgreSQL (Neon serverless)

---

## 🚀 Next Steps

1. **Read JWT_AUTH_IMPLEMENTATION.md** - Implement JWT authentication first
2. **Review API_REQUEST_RESPONSE_EXAMPLES.md** - Understand all endpoints
3. **Set up your mobile project** - React Native or Flutter
4. **Implement authentication** - Login/register with JWT
5. **Build core screens** - Vehicles, booking, payments
6. **Test thoroughly** - Use Postman and your app
7. **Deploy** - Connect to production Replit app

Good luck with your native app development! 🎉
