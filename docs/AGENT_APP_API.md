# Agent App API Documentation

This document describes the API endpoints available for the Agent/Rider mobile application.

## Base URL
```
https://your-domain.com/api/agent
```

## Authentication

All endpoints (except login) require a Bearer token in the Authorization header:
```
Authorization: Bearer <session_token>
```

The session token is obtained during login and is valid for 30 days.

---

## Endpoints

### 1. Login

**POST** `/auth/login`

Authenticate a rider and get a session token.

**Request Body:**
```json
{
  "company_code": "string",     // Company identifier (required)
  "phone": "string",            // Rider's phone number (required)
  "pin_code": "string",         // 6-digit PIN (required)
  "device_id": "string",        // Unique device identifier (required)
  "device_type": "android|ios", // Device OS (optional)
  "device_model": "string",     // Device model (optional)
  "app_version": "string",      // App version (optional)
  "os_version": "string",       // OS version (optional)
  "push_token": "string"        // FCM/APNs token for notifications (optional)
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "session_token": "abc123...",
    "expires_at": "2025-01-28T12:00:00Z",
    "rider": {
      "id": "uuid",
      "name": "John Doe",
      "phone": "+1234567890",
      "email": "john@example.com",
      "vehicle_type": "motorcycle"
    },
    "company": {
      "id": "uuid",
      "name": "Acme Delivery"
    }
  }
}
```

**Error Responses:**
- `400` - Missing required fields
- `401` - Invalid company code, rider not found, or wrong PIN
- `423` - Account locked (too many failed attempts)

---

### 2. Logout

**POST** `/auth/logout`

Invalidate the current session and set rider status to offline.

**Headers:**
```
Authorization: Bearer <session_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 3. Update Location (Heartbeat)

**POST** `/location`

Update the rider's current location. Should be called every 10-30 seconds while the app is active.

**Headers:**
```
Authorization: Bearer <session_token>
```

**Request Body:**
```json
{
  "latitude": 40.7128,          // Required
  "longitude": -74.0060,        // Required
  "battery_level": 85,          // Optional (0-100)
  "speed": 25.5,                // Optional (km/h)
  "heading": 180,               // Optional (0-360 degrees)
  "accuracy": 10.0,             // Optional (meters)
  "altitude": 50.0              // Optional (meters)
}
```

**Response:**
```json
{
  "success": true,
  "message": "Location updated",
  "data": {
    "rider": {
      "id": "uuid",
      "name": "John Doe",
      "status": "active",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "battery_level": 85,
      "last_seen": "2025-12-29T10:30:00Z"
    },
    "timestamp": "2025-12-29T10:30:00Z"
  }
}
```

---

### 4. Get Current Location

**GET** `/location`

Get the rider's current stored location (for debugging).

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "battery_level": 85,
    "last_seen": "2025-12-29T10:30:00Z",
    "status": "active"
  }
}
```

---

### 5. Get Profile

**GET** `/profile`

Get the rider's profile and daily stats.

**Response:**
```json
{
  "success": true,
  "data": {
    "rider": {
      "id": "uuid",
      "name": "John Doe",
      "phone": "+1234567890",
      "email": "john@example.com",
      "vehicle_type": "motorcycle",
      "status": "active",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "battery_level": 85,
      "last_seen": "2025-12-29T10:30:00Z",
      "created_at": "2025-01-01T00:00:00Z"
    },
    "company": {
      "id": "uuid",
      "name": "Acme Delivery"
    },
    "stats": {
      "today_deliveries": 12,
      "active_orders": 2
    },
    "session": {
      "id": "uuid"
    }
  }
}
```

---

### 6. Update Profile/Status

**PATCH** `/profile`

Update the rider's status or push notification token.

**Request Body:**
```json
{
  "status": "active|busy|break|offline",  // Optional
  "push_token": "string"                   // Optional - FCM/APNs token
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "phone": "+1234567890",
    "status": "busy",
    "vehicle_type": "motorcycle"
  }
}
```

---

### 7. Get Orders

**GET** `/orders`

Get orders assigned to this rider.

**Query Parameters:**
- `status` - Filter by status: `assigned`, `picked_up`, `in_transit`, `all` (default: active orders)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "external_id": "ORD-12345",
      "status": "assigned",
      "pickup_address": "123 Pickup St",
      "delivery_address": "456 Delivery Ave",
      "items": [...],
      "total": 45.99,
      "payment_method": "card",
      "payment_status": "paid",
      "notes": "Leave at door",
      "scheduled_at": null,
      "created_at": "2025-12-29T10:00:00Z",
      "customers": {
        "id": "uuid",
        "name": "Jane Smith",
        "phone": "+1987654321"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

---

### 8. Get Order Details

**GET** `/orders/:id`

Get detailed information about a specific order.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "external_id": "ORD-12345",
    "status": "assigned",
    "pickup_address": "123 Pickup St",
    "delivery_address": "456 Delivery Ave",
    "items": [
      {
        "name": "Product A",
        "quantity": 2,
        "price": 19.99
      }
    ],
    "subtotal": 39.98,
    "delivery_fee": 5.99,
    "total": 45.97,
    "payment_method": "card",
    "payment_status": "paid",
    "notes": "Leave at door",
    "scheduled_at": null,
    "picked_up_at": null,
    "delivered_at": null,
    "created_at": "2025-12-29T10:00:00Z",
    "customers": {
      "id": "uuid",
      "name": "Jane Smith",
      "phone": "+1987654321",
      "email": "jane@example.com"
    }
  }
}
```

---

### 9. Update Order Status

**PATCH** `/orders/:id`

Update the status of an order (mark as picked up, in transit, delivered, or failed).

**Request Body:**
```json
{
  "status": "picked_up|in_transit|delivered|failed",  // Required
  "notes": "string",                                   // Optional - Add delivery notes
  "signature_url": "string",                           // Optional - URL to signature image
  "photo_proof_url": "string",                         // Optional - URL to proof of delivery photo
  "latitude": 40.7128,                                 // Optional - Current location
  "longitude": -74.0060                                // Optional - Current location
}
```

**Status Flow:**
- `assigned` → `picked_up` or `failed`
- `picked_up` → `in_transit` or `failed`
- `in_transit` → `delivered` or `failed`

**Response:**
```json
{
  "success": true,
  "message": "Order delivered successfully",
  "data": {
    "id": "uuid",
    "status": "delivered",
    "delivered_at": "2025-12-29T11:30:00Z",
    ...
  }
}
```

---

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `400` - Bad Request (missing or invalid parameters)
- `401` - Unauthorized (missing or invalid session token)
- `404` - Not Found (resource doesn't exist)
- `423` - Locked (account locked due to failed login attempts)
- `500` - Internal Server Error

---

## Recommended Implementation Flow

### App Startup
1. Check for stored session token
2. If exists, call `GET /profile` to validate
3. If valid, proceed to home screen
4. If invalid (401), redirect to login

### Location Updates
1. Start location updates when app becomes active
2. Send `POST /location` every 15-30 seconds
3. Include battery level for low-battery alerts
4. Stop updates when app goes to background (optional)

### Order Delivery Flow
1. Fetch orders with `GET /orders`
2. When arriving at pickup: `PATCH /orders/:id` with `status: "picked_up"`
3. When leaving pickup: `PATCH /orders/:id` with `status: "in_transit"`
4. When delivered: `PATCH /orders/:id` with `status: "delivered"` + optional signature/photo
5. If failed: `PATCH /orders/:id` with `status: "failed"` + notes explaining why

### Status Management
- Set status to `busy` when actively delivering
- Set status to `break` when on break
- Status automatically sets to `active` when updating location
- Status sets to `offline` on logout

---

## Company Code

The `company_code` for login can be:
- The first part of the company's API key
- The company name (partial match)

This allows different companies' riders to use the same app while connecting to their specific company's system.
