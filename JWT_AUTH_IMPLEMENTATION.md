# JWT Authentication Implementation Guide

## Current Authentication System

**Current**: Session-based authentication using cookies
- Not ideal for native mobile apps
- Requires cookie management
- Session stored in PostgreSQL

**Recommended for Native Apps**: JWT (JSON Web Token) authentication
- Stateless and scalable
- Easy to implement in mobile apps
- Secure token-based system

---

## JWT Implementation Plan

### 1. Install Required Package

```bash
npm install jsonwebtoken
npm install @types/jsonwebtoken --save-dev
```

### 2. Environment Variables

Add to your environment:
```bash
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRES_IN=7d  # Token expiration time
```

### 3. Create JWT Utility Functions

Create `server/jwt.ts`:

```typescript
import jwt from 'jsonwebtoken';
import type { RequestHandler } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

// Generate JWT token
export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

// Verify JWT token
export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

// Middleware to authenticate JWT
export const authenticateJWT: RequestHandler = (req: any, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // Attach user info to request
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Middleware to check user role
export const requireRole = (roles: string[]): RequestHandler => {
  return (req: any, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
};
```

### 4. Update Authentication Routes

Modify `server/routes.ts`:

```typescript
import { generateToken, authenticateJWT, requireRole } from './jwt';

// REGISTER - Returns JWT token
app.post("/api/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const user = await storage.createUser({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: role || "customer",
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      }
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Failed to register" });
  }
});

// LOGIN - Returns JWT token
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Failed to login" });
  }
});

// GET CURRENT USER - Using JWT
app.get("/api/auth/user", authenticateJWT, async (req: any, res) => {
  try {
    const userId = req.user.userId; // From JWT payload
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      profileImageUrl: user.profileImageUrl,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

// REFRESH TOKEN - Optional: Get new token before expiration
app.post("/api/auth/refresh", authenticateJWT, async (req: any, res) => {
  try {
    const user = await storage.getUser(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({ token: newToken });
  } catch (error) {
    res.status(500).json({ message: "Failed to refresh token" });
  }
});
```

### 5. Protect Routes with JWT

Replace `isAuthenticated` middleware with `authenticateJWT`:

```typescript
// Before (session-based):
app.post("/api/bookings", isAuthenticated, async (req, res) => { ... });

// After (JWT-based):
app.post("/api/bookings", authenticateJWT, async (req, res) => {
  const userId = req.user.userId; // From JWT payload
  // ... rest of the code
});

// For role-based access:
app.get("/api/admin/users", authenticateJWT, requireRole(['admin']), async (req, res) => {
  // Only admins can access
});

app.post("/api/vehicles", authenticateJWT, requireRole(['owner', 'admin']), async (req, res) => {
  // Only owners and admins can add vehicles
});
```

---

## Native App Implementation

### 1. Login/Register Flow

**Request:**
```http
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "customer"
  }
}
```

### 2. Store Token Securely

**React Native Example:**
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Save token after login
await AsyncStorage.setItem('authToken', response.token);
await AsyncStorage.setItem('user', JSON.stringify(response.user));

// Retrieve token
const token = await AsyncStorage.getItem('authToken');
```

**Flutter Example:**
```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final storage = FlutterSecureStorage();

// Save token
await storage.write(key: 'authToken', value: response.token);

// Retrieve token
String? token = await storage.read(key: 'authToken');
```

### 3. Include Token in API Requests

**Example API Call:**
```javascript
// JavaScript/React Native
const token = await AsyncStorage.getItem('authToken');

fetch('https://your-app.replit.app/api/bookings', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

**Example with Axios:**
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://your-app.replit.app',
});

// Add token to all requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Use it
const response = await api.get('/api/bookings');
```

### 4. Handle Token Expiration

```javascript
// Intercept 401 responses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      // Try to refresh token first
      try {
        const refreshResponse = await api.post('/api/auth/refresh');
        const newToken = refreshResponse.data.token;
        
        // Save new token
        await AsyncStorage.setItem('authToken', newToken);
        
        // Retry original request with new token
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return axios.request(error.config);
      } catch (refreshError) {
        // Refresh failed, logout user
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('user');
        // Navigate to login screen
        navigation.navigate('Login');
      }
    }
    return Promise.reject(error);
  }
);
```

---

## Security Best Practices

### 1. Token Storage
- **DO**: Use secure storage (Keychain on iOS, Keystore on Android)
- **DON'T**: Store tokens in localStorage or plain AsyncStorage on production

### 2. HTTPS Only
- Always use HTTPS in production
- Tokens should never be sent over HTTP

### 3. Token Expiration
- Set reasonable expiration times (7 days recommended)
- Implement refresh token mechanism for better UX

### 4. Logout
```javascript
// Clear token on logout
await AsyncStorage.removeItem('authToken');
await AsyncStorage.removeItem('user');

// Optional: Call logout endpoint to invalidate token on server
// (requires maintaining a token blacklist on backend)
```

### 5. Validate Token on Server
- Always verify token signature
- Check expiration time
- Validate user exists in database

---

## Complete Authentication Flow

```
1. User enters credentials
   ↓
2. App sends POST /api/login
   ↓
3. Server validates credentials
   ↓
4. Server generates JWT token
   ↓
5. App receives token + user data
   ↓
6. App stores token securely
   ↓
7. App includes token in Authorization header for all API calls
   ↓
8. Server validates token on each request
   ↓
9. If token valid: Process request
   If token invalid/expired: Return 401
   ↓
10. App handles 401 by refreshing token or logging out
```

---

## Migration from Session to JWT

### Dual Support (Transition Period)

You can support both session and JWT authentication:

```typescript
// Dual authentication middleware
export const authenticate: RequestHandler = async (req: any, res, next) => {
  // Try JWT first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      req.user = decoded;
      return next();
    } catch (error) {
      // JWT failed, try session
    }
  }

  // Fall back to session
  if (req.session && req.session.userId) {
    const user = await storage.getUser(req.session.userId);
    if (user) {
      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role,
      };
      return next();
    }
  }

  return res.status(401).json({ message: 'Unauthorized' });
};
```

---

## Testing JWT Authentication

### Using curl:
```bash
# Login and get token
curl -X POST https://your-app.replit.app/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Response: {"token":"eyJhbG...","user":{...}}

# Use token in subsequent requests
curl -X GET https://your-app.replit.app/api/auth/user \
  -H "Authorization: Bearer eyJhbG..."
```

### Using Postman:
1. POST to `/api/login` with credentials
2. Copy the `token` from response
3. Go to Headers tab in next request
4. Add: `Authorization: Bearer <your-token>`

---

## Summary

**For your native app:**

1. **Implement JWT on backend** (follow steps above)
2. **Login flow**: POST credentials → Receive token
3. **Store token**: Use secure storage (Keychain/Keystore)
4. **API calls**: Include `Authorization: Bearer <token>` header
5. **Handle expiration**: Implement refresh token or re-login flow

This provides a secure, stateless authentication system perfect for native mobile apps!
