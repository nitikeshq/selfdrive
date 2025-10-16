# Complete API Request & Response Examples

## Authentication Endpoints

### 1. Register User

**Endpoint:** `POST /api/register`

**Request Headers:**
```http
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "customer"
}
```

**Success Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "customer"
}
```

**Error Responses:**
```json
// 400 - Missing fields
{
  "message": "Email and password required"
}

// 400 - User exists
{
  "message": "User already exists"
}

// 500 - Server error
{
  "message": "Failed to register"
}
```

---

### 2. Login

**Endpoint:** `POST /api/login`

**Request Headers:**
```http
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "customer"
}
```

**With JWT (after implementation):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJlbWFpbCI6ImpvaG4uZG9lQGV4YW1wbGUuY29tIiwicm9sZSI6ImN1c3RvbWVyIiwiaWF0IjoxNzM2OTM4ODAwLCJleHAiOjE3Mzc1NDM2MDB9.1234567890abcdefghijklmnopqrstuvwxyz",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "customer"
  }
}
```

---

### 3. Get Current User

**Endpoint:** `GET /api/auth/user`

**Request Headers (Current - Session-based):**
```http
Cookie: connect.sid=s%3A1234567890abcdef...
```

**Request Headers (With JWT):**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "customer",
  "profileImageUrl": "https://storage.googleapis.com/bucket/profile.jpg"
}
```

---

## Vehicle Endpoints

### 1. Get All Vehicles

**Endpoint:** `GET /api/vehicles?search=honda&location=Bhubaneswar`

**Request Headers:**
```http
Content-Type: application/json
```

**Query Parameters:**
- `search` (optional): "honda", "city", "bike", etc.
- `location` (optional): "Bhubaneswar", "Delhi", etc.

**Success Response (200):**
```json
[
  {
    "id": "vehicle-uuid-1",
    "ownerId": "owner-uuid",
    "name": "Honda City VX",
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
    "location": "Patia, Bhubaneswar",
    "locationPlaceId": "ChIJ...",
    "locationLat": "20.296100",
    "locationLng": "85.824500",
    "ownerLocation": "Bhubaneswar",
    "imageUrl": "https://images.unsplash.com/...",
    "features": ["AC", "GPS", "Music System", "Bluetooth"],
    "hasExtraInsurance": true,
    "extraInsuranceCost": "200.00",
    "hasGpsTracking": true,
    "gpsDeviceId": "GPS123456",
    "averageRating": "4.5",
    "totalRatings": 12,
    "available": true,
    "isPaused": false,
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
]
```

---

### 2. Get Single Vehicle

**Endpoint:** `GET /api/vehicles/:id`

**Success Response (200):**
```json
{
  "id": "vehicle-uuid-1",
  "ownerId": "owner-uuid",
  "name": "Honda City VX",
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
  "location": "Patia, Bhubaneswar",
  "locationPlaceId": "ChIJ...",
  "locationLat": "20.296100",
  "locationLng": "85.824500",
  "ownerLocation": "Bhubaneswar",
  "imageUrl": "https://images.unsplash.com/...",
  "features": ["AC", "GPS", "Music System"],
  "hasExtraInsurance": true,
  "extraInsuranceCost": "200.00",
  "hasGpsTracking": true,
  "gpsDeviceId": "GPS123456",
  "averageRating": "4.5",
  "totalRatings": 12,
  "available": true,
  "isPaused": false,
  "createdAt": "2024-01-01T10:00:00.000Z"
}
```

---

### 3. Create Vehicle

**Endpoint:** `POST /api/vehicles`

**Request Headers:**
```http
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "ownerId": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Honda City VX",
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
  "location": "Patia, Bhubaneswar",
  "locationPlaceId": "ChIJjU0idR7QGToRYGf7EfkZKUk",
  "locationLat": "20.296100",
  "locationLng": "85.824500",
  "ownerLocation": "Bhubaneswar",
  "imageUrl": "https://storage.googleapis.com/bucket/vehicle.jpg",
  "features": ["AC", "GPS", "Music System", "Bluetooth"],
  "hasExtraInsurance": true,
  "extraInsuranceCost": "200.00",
  "hasGpsTracking": true,
  "gpsDeviceId": "GPS123456"
}
```

**Success Response (201):** Same as vehicle object above

---

### 4. Check Vehicle Availability

**Endpoint:** `POST /api/vehicles/:id/check-availability`

**Request Body:**
```json
{
  "startDate": "2024-01-15T10:00:00.000Z",
  "endDate": "2024-01-17T18:00:00.000Z"
}
```

**Success Response (200):**
```json
{
  "available": true
}
```

---

## Booking Endpoints

### 1. Create Booking

**Endpoint:** `POST /api/bookings`

**Request Headers:**
```http
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "vehicleId": "vehicle-uuid-1",
  "startDate": "2024-01-15T10:00:00.000Z",
  "endDate": "2024-01-17T18:00:00.000Z",
  "pickupOption": "parking",
  "deliveryAddress": null,
  "totalAmount": "5000.00",
  "deliveryCharge": "0.00",
  "hasExtraInsurance": true,
  "insuranceAmount": "200.00"
}
```

**For Delivery Option:**
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "vehicleId": "vehicle-uuid-1",
  "startDate": "2024-01-15T10:00:00.000Z",
  "endDate": "2024-01-17T18:00:00.000Z",
  "pickupOption": "delivery",
  "deliveryAddress": "123 Main Street, Bhubaneswar, Odisha 751024",
  "totalAmount": "5200.00",
  "deliveryCharge": "200.00",
  "hasExtraInsurance": true,
  "insuranceAmount": "200.00"
}
```

**Success Response (201):**
```json
{
  "id": "booking-uuid-1",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "vehicleId": "vehicle-uuid-1",
  "startDate": "2024-01-15T10:00:00.000Z",
  "endDate": "2024-01-17T18:00:00.000Z",
  "pickupOption": "parking",
  "deliveryAddress": null,
  "totalAmount": "5000.00",
  "deliveryCharge": "0.00",
  "hasExtraInsurance": true,
  "insuranceAmount": "200.00",
  "platformCommission": "0.00",
  "ownerEarnings": "0.00",
  "status": "pending",
  "paymentStatus": "pending",
  "paymentIntentId": null,
  "refundAmount": null,
  "cancelledAt": null,
  "pickupVideoUrl": null,
  "pickupVideoApprovedByCustomer": false,
  "pickupVideoApprovedByOwner": false,
  "pickupVideoApprovedAt": null,
  "createdAt": "2024-01-14T10:00:00.000Z"
}
```

---

### 2. Get User Bookings

**Endpoint:** `GET /api/bookings?userId=550e8400-e29b-41d4-a716-446655440000`

**Request Headers:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
[
  {
    "id": "booking-uuid-1",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "vehicleId": "vehicle-uuid-1",
    "startDate": "2024-01-15T10:00:00.000Z",
    "endDate": "2024-01-17T18:00:00.000Z",
    "pickupOption": "parking",
    "deliveryAddress": null,
    "totalAmount": "5000.00",
    "deliveryCharge": "0.00",
    "hasExtraInsurance": true,
    "insuranceAmount": "200.00",
    "platformCommission": "1500.00",
    "ownerEarnings": "3500.00",
    "status": "confirmed",
    "paymentStatus": "paid",
    "paymentIntentId": "TXN1234567890",
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

### 3. Cancel Booking

**Endpoint:** `POST /api/bookings/:id/cancel`

**Request Headers:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "booking": {
    "id": "booking-uuid-1",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "vehicleId": "vehicle-uuid-1",
    "startDate": "2024-01-15T10:00:00.000Z",
    "endDate": "2024-01-17T18:00:00.000Z",
    "status": "cancelled",
    "paymentStatus": "partially_refunded",
    "refundAmount": "4900.00",
    "cancelledAt": "2024-01-10T15:30:00.000Z",
    "totalAmount": "5000.00"
  },
  "refundAmount": 4900.00,
  "refundPercentage": 100,
  "message": "Booking cancelled. Refund of ₹4900.00 (100%) will be processed."
}
```

---

## Payment Endpoints

### 1. Create Payment (PayU)

**Endpoint:** `POST /api/create-payment`

**Request Headers:**
```http
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "amount": 5000.00,
  "bookingId": "booking-uuid-1",
  "userEmail": "john.doe@example.com",
  "userFirstName": "John",
  "userPhone": "9876543210"
}
```

**Success Response (200):**
```json
{
  "key": "gtKFFx",
  "txnid": "TXN17369388001234567",
  "amount": "5000.00",
  "productinfo": "Vehicle Booking - booking-uuid-1",
  "firstname": "John",
  "email": "john.doe@example.com",
  "phone": "9876543210",
  "surl": "https://your-app.replit.app/api/payment-success",
  "furl": "https://your-app.replit.app/api/payment-failure",
  "hash": "b14ca5898a4e4133bbce2ea2315a1916c6ca87aefb9d17d5e7c2d5f5e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5",
  "split_info": "{\"vendor_id\":\"VENDOR123\",\"vendor_amount\":\"3500.00\",\"platform_amount\":\"1500.00\"}",
  "paymentUrl": "https://test.payu.in/_payment"
}
```

**How to use in Native App:**
```javascript
// 1. Get payment data from API
const paymentData = await createPayment(bookingId);

// 2. Open PayU payment gateway
// For web view:
const paymentForm = `
  <form action="${paymentData.paymentUrl}" method="post" id="payuForm">
    <input type="hidden" name="key" value="${paymentData.key}" />
    <input type="hidden" name="txnid" value="${paymentData.txnid}" />
    <input type="hidden" name="amount" value="${paymentData.amount}" />
    <input type="hidden" name="productinfo" value="${paymentData.productinfo}" />
    <input type="hidden" name="firstname" value="${paymentData.firstname}" />
    <input type="hidden" name="email" value="${paymentData.email}" />
    <input type="hidden" name="phone" value="${paymentData.phone}" />
    <input type="hidden" name="surl" value="${paymentData.surl}" />
    <input type="hidden" name="furl" value="${paymentData.furl}" />
    <input type="hidden" name="hash" value="${paymentData.hash}" />
  </form>
  <script>document.getElementById('payuForm').submit();</script>
`;

// 3. Load in WebView and handle redirect back to app
```

---

## Rating Endpoints

### 1. Create Rating

**Endpoint:** `POST /api/ratings`

**Request Headers:**
```http
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body (Customer rates Owner):**
```json
{
  "bookingId": "booking-uuid-1",
  "raterId": "customer-user-id",
  "rateeId": "owner-user-id",
  "ratingType": "customer_to_owner",
  "rating": 5,
  "review": "Excellent service! The owner was very helpful and the vehicle was in great condition."
}
```

**Request Body (Customer rates Vehicle):**
```json
{
  "bookingId": "booking-uuid-1",
  "vehicleId": "vehicle-uuid-1",
  "raterId": "customer-user-id",
  "rateeId": "owner-user-id",
  "ratingType": "customer_to_vehicle",
  "rating": 4,
  "review": "Good car, smooth drive. AC could be better."
}
```

**Success Response (201):**
```json
{
  "id": "rating-uuid-1",
  "bookingId": "booking-uuid-1",
  "vehicleId": "vehicle-uuid-1",
  "raterId": "customer-user-id",
  "rateeId": "owner-user-id",
  "ratingType": "customer_to_vehicle",
  "rating": 5,
  "review": "Excellent service!",
  "createdAt": "2024-01-18T10:00:00.000Z"
}
```

---

## Object Storage Endpoints

### 1. Get Upload URL

**Endpoint:** `POST /api/objects/upload`

**Request Headers:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "uploadURL": "https://storage.googleapis.com/bucket-name/private/abc123.jpg?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=..."
}
```

**How to use:**
```javascript
// 1. Get upload URL
const { uploadURL } = await fetch('/api/objects/upload', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());

// 2. Upload file directly to GCS
const file = // ... file from device
await fetch(uploadURL, {
  method: 'PUT',
  headers: { 'Content-Type': file.type },
  body: file
});

// 3. Extract object path from URL
const objectPath = new URL(uploadURL).pathname;

// 4. Set ACL if private (e.g., DL photo)
await fetch('/api/dl-photos', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ dlPhotoURL: objectPath })
});
```

---

### 2. Set DL Photo ACL

**Endpoint:** `PUT /api/dl-photos`

**Request Headers:**
```http
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "dlPhotoURL": "/objects/private/dl-photo-abc123.jpg"
}
```

**Success Response (200):**
```json
{
  "objectPath": "/objects/private/dl-photo-abc123.jpg"
}
```

---

## KYC Endpoints

### 1. Update KYC Details

**Endpoint:** `PATCH /api/users/kyc`

**Request Headers:**
```http
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "aadharNumber": "1234-5678-9012",
  "panNumber": "ABCDE1234F",
  "dlNumber": "OD05 12345678901",
  "dlPhotoUrl": "/objects/private/dl-photo.jpg",
  "digilockerLinked": false
}
```

**Success Response (200):** Full user object with updated KYC details

---

### 2. Get KYC Status

**Endpoint:** `GET /api/users/kyc-status`

**Request Headers:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "aadharVerified": true,
  "panVerified": true,
  "dlVerified": true,
  "digilockerLinked": false,
  "isKycComplete": true
}
```

---

## Error Response Format

All endpoints return consistent error format:

**Validation Error (400):**
```json
{
  "error": [
    {
      "path": ["email"],
      "message": "Invalid email format"
    },
    {
      "path": ["pricePerDay"],
      "message": "Price must be a positive number"
    }
  ]
}
```

**Unauthorized (401):**
```json
{
  "message": "Unauthorized"
}
```

**Forbidden (403):**
```json
{
  "message": "Forbidden: Owner access required"
}
```

**Not Found (404):**
```json
{
  "error": "Vehicle not found"
}
```

**Server Error (500):**
```json
{
  "error": "Failed to create booking"
}
```

---

## Complete Mobile App Flow Example

### 1. User Registration/Login
```javascript
// Register
const registerResponse = await fetch('/api/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!',
    firstName: 'John',
    lastName: 'Doe',
    role: 'customer'
  })
});

const { token, user } = await registerResponse.json();
await AsyncStorage.setItem('authToken', token);
```

### 2. Browse Vehicles
```javascript
const token = await AsyncStorage.getItem('authToken');
const vehicles = await fetch('/api/vehicles?location=Bhubaneswar', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());
```

### 3. Check Availability
```javascript
const available = await fetch(`/api/vehicles/${vehicleId}/check-availability`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    startDate: '2024-01-15T10:00:00.000Z',
    endDate: '2024-01-17T18:00:00.000Z'
  })
}).then(r => r.json());
```

### 4. Create Booking
```javascript
const booking = await fetch('/api/bookings', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: user.id,
    vehicleId: vehicleId,
    startDate: '2024-01-15T10:00:00.000Z',
    endDate: '2024-01-17T18:00:00.000Z',
    pickupOption: 'parking',
    totalAmount: '5000.00',
    deliveryCharge: '0.00',
    hasExtraInsurance: true,
    insuranceAmount: '200.00'
  })
}).then(r => r.json());
```

### 5. Process Payment
```javascript
const paymentData = await fetch('/api/create-payment', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: 5000.00,
    bookingId: booking.id,
    userEmail: user.email,
    userFirstName: user.firstName,
    userPhone: user.phone
  })
}).then(r => r.json());

// Open PayU in WebView
// ...handle payment redirect
```

### 6. View Bookings
```javascript
const bookings = await fetch(`/api/bookings?userId=${user.id}`, {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json());
```

---

This document provides complete request/response examples for all major endpoints in your DriveEase API!
