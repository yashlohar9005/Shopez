# SHOPEZ — API Architecture & Documentation

## 1. Overview

SHOPEZ exposes a RESTful API built with Express.js. All endpoints follow consistent naming conventions, return standardized JSON responses, and use JWT-based authentication for protected routes.

**Base URL:** `/api`

---

## 2. Response Formats

### Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

> **Note:** The `pagination` field is only included for list endpoints that support pagination.

### Error Response

```json
{
  "success": false,
  "message": "Descriptive error message",
  "error": {
    "statusCode": 400,
    "details": [
      {
        "field": "email",
        "message": "Please provide a valid email address"
      }
    ]
  }
}
```

### HTTP Status Codes Used

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT requests |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Validation errors, malformed requests |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Insufficient role (non-admin accessing admin route) |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate resource (e.g., email already registered) |
| 500 | Server Error | Unexpected server-side errors |

---

## 3. Authentication

All protected endpoints require a JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

**Token Payload:**
```json
{
  "id": "64a1b2c3d4e5f6a7b8c9d0e1",
  "role": "user"
}
```

**Token Expiry:** 7 days

### Access Levels

| Level | Symbol | Description |
|-------|--------|-------------|
| Public | 🌐 | No authentication required |
| Private | 🔒 | Valid JWT token required |
| Admin | 🛡️ | Valid JWT + role === "admin" required |

---

## 4. API Endpoints

---

### 4.1 Authentication — `/api/auth`

#### 🌐 POST `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePass123",
  "phone": "9876543210"
}
```

**Validation Rules:**
| Field | Rules |
|-------|-------|
| name | Required, 2-50 characters |
| email | Required, valid email format |
| password | Required, min 6 characters |
| phone | Optional, 10-15 digits |

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
```

**Error Responses:**
- `400` — Validation errors
- `409` — Email already registered

---

#### 🌐 POST `/api/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePass123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
```

**Error Responses:**
- `400` — Validation errors
- `401` — Invalid email or password

---

#### 🔒 POST `/api/auth/logout`

Logout user (client-side token removal).

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### 🔒 GET `/api/auth/profile`

Get the authenticated user's profile.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "user": {
      "_id": "64a1b2c3d4e5f6a7b8c9d0e1",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "avatar": "https://res.cloudinary.com/...",
      "role": "user",
      "address": {
        "street": "123 Main St",
        "city": "Mumbai",
        "state": "Maharashtra",
        "zipCode": "400001",
        "country": "India"
      },
      "createdAt": "2026-06-17T06:00:00.000Z"
    }
  }
}
```

---

#### 🔒 PUT `/api/auth/profile`

Update the authenticated user's profile.

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "9876543211",
  "address": {
    "street": "456 New St",
    "city": "Delhi",
    "state": "Delhi",
    "zipCode": "110001",
    "country": "India"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { "user": { ... } }
}
```

---

#### 🔒 PUT `/api/auth/change-password`

Change the authenticated user's password.

**Request Body:**
```json
{
  "currentPassword": "securePass123",
  "newPassword": "newSecurePass456"
}
```

**Validation Rules:**
| Field | Rules |
|-------|-------|
| currentPassword | Required |
| newPassword | Required, min 6 characters, different from current |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Error Responses:**
- `400` — Validation errors
- `401` — Current password is incorrect

---

### 4.2 Products — `/api/products`

#### 🌐 GET `/api/products`

Get paginated list of products with optional filters.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | Number | 1 | Page number |
| limit | Number | 10 | Items per page (max: 50) |
| category | ObjectId | — | Filter by category ID |
| minPrice | Number | — | Minimum price filter |
| maxPrice | Number | — | Maximum price filter |
| rating | Number | — | Minimum average rating |
| sort | String | "-createdAt" | Sort field (prefix `-` for descending) |

**Example:** `GET /api/products?page=1&limit=12&category=64a...&minPrice=100&maxPrice=5000&sort=-price`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Products fetched successfully",
  "data": {
    "products": [
      {
        "_id": "64a...",
        "name": "Wireless Headphones",
        "description": "Premium noise-cancelling...",
        "price": 2999,
        "stock": 50,
        "images": ["https://res.cloudinary.com/..."],
        "category": {
          "_id": "64b...",
          "name": "Electronics"
        },
        "averageRating": 4.5,
        "numReviews": 12,
        "isActive": true
      }
    ]
  },
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 48,
    "pages": 4
  }
}
```

---

#### 🌐 GET `/api/products/search?q=`

Search products by keyword (uses MongoDB text index).

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | String | Yes | Search keyword |
| page | Number | No | Page number (default: 1) |
| limit | Number | No | Items per page (default: 10) |

**Example:** `GET /api/products/search?q=headphones&page=1`

---

#### 🌐 GET `/api/products/:id`

Get a single product by ID, including populated category and reviews.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Product fetched successfully",
  "data": {
    "product": {
      "_id": "64a...",
      "name": "Wireless Headphones",
      "description": "Premium noise-cancelling headphones...",
      "price": 2999,
      "stock": 50,
      "images": ["https://res.cloudinary.com/..."],
      "category": { "_id": "64b...", "name": "Electronics" },
      "averageRating": 4.5,
      "numReviews": 12,
      "reviews": [
        {
          "_id": "64c...",
          "user": { "_id": "64d...", "name": "Jane Doe" },
          "rating": 5,
          "comment": "Excellent sound quality!",
          "createdAt": "2026-06-16T10:00:00.000Z"
        }
      ]
    }
  }
}
```

**Error Responses:**
- `404` — Product not found

---

#### 🛡️ POST `/api/products`

Create a new product (admin only).

**Request Body:**
```json
{
  "name": "Wireless Headphones",
  "description": "Premium noise-cancelling headphones with 30hr battery",
  "price": 2999,
  "stock": 50,
  "images": ["https://res.cloudinary.com/..."],
  "category": "64b..."
}
```

**Validation Rules:**
| Field | Rules |
|-------|-------|
| name | Required, 3-200 characters |
| description | Required, 10-2000 characters |
| price | Required, min: 0 |
| stock | Required, min: 0 |
| images | Array, max 5 URLs |
| category | Required, valid ObjectId |

**Success Response (201):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": { "product": { ... } }
}
```

---

#### 🛡️ PUT `/api/products/:id`

Update an existing product (admin only).

**Request Body:** Same fields as POST (all optional for partial update).

**Success Response (200):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": { "product": { ... } }
}
```

---

#### 🛡️ DELETE `/api/products/:id`

Delete a product (admin only). Soft-delete by setting `isActive: false`.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

### 4.3 Categories — `/api/categories`

#### 🌐 GET `/api/categories`

Get all active categories.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Categories fetched successfully",
  "data": {
    "categories": [
      {
        "_id": "64b...",
        "name": "Electronics",
        "description": "Electronic gadgets and devices",
        "image": "https://res.cloudinary.com/...",
        "isActive": true
      }
    ]
  }
}
```

---

#### 🌐 GET `/api/categories/:id`

Get a single category by ID.

---

#### 🛡️ POST `/api/categories`

Create a new category (admin only).

**Request Body:**
```json
{
  "name": "Electronics",
  "description": "Electronic gadgets and devices",
  "image": "https://res.cloudinary.com/..."
}
```

---

#### 🛡️ PUT `/api/categories/:id`

Update a category (admin only).

---

#### 🛡️ DELETE `/api/categories/:id`

Delete a category (admin only). Fails if products are linked.

---

### 4.4 Cart — `/api/cart`

#### 🔒 GET `/api/cart`

Get the authenticated user's cart with populated product details.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Cart fetched successfully",
  "data": {
    "cart": {
      "_id": "64e...",
      "user": "64a...",
      "items": [
        {
          "product": {
            "_id": "64f...",
            "name": "Wireless Headphones",
            "price": 2999,
            "images": ["https://..."],
            "stock": 50
          },
          "quantity": 2,
          "price": 2999
        }
      ],
      "totalPrice": 5998
    }
  }
}
```

---

#### 🔒 POST `/api/cart`

Add an item to the cart. If the product already exists in the cart, quantity is incremented.

**Request Body:**
```json
{
  "productId": "64f...",
  "quantity": 1
}
```

**Validation Rules:**
| Field | Rules |
|-------|-------|
| productId | Required, valid ObjectId |
| quantity | Required, min: 1 |

**Error Responses:**
- `400` — Insufficient stock
- `404` — Product not found

---

#### 🔒 PUT `/api/cart/:itemId`

Update quantity of an item in the cart.

**Request Body:**
```json
{
  "quantity": 3
}
```

---

#### 🔒 DELETE `/api/cart/:itemId`

Remove a single item from the cart.

---

#### 🔒 DELETE `/api/cart`

Clear the entire cart.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

---

### 4.5 Orders — `/api/orders`

#### 🔒 POST `/api/orders`

Create a new order from the user's cart.

**Request Body:**
```json
{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  }
}
```

**Business Logic:**
1. Fetch user's cart (must not be empty)
2. Verify all products are in stock
3. Snapshot product name, price, image into order items
4. Calculate taxPrice (18% GST) and shippingPrice (free above ₹500)
5. Create order with `paymentStatus: "pending"`
6. Return order for payment processing

---

#### 🔒 GET `/api/orders`

Get the authenticated user's order history (newest first).

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | Number | 1 | Page number |
| limit | Number | 10 | Items per page |

---

#### 🔒 GET `/api/orders/:id`

Get a single order by ID (must belong to the authenticated user, or user is admin).

---

#### 🛡️ PUT `/api/orders/:id/status`

Update order status (admin only).

**Request Body:**
```json
{
  "orderStatus": "shipped"
}
```

**Valid Transitions:**
- `processing` → `shipped` → `delivered`
- Any status → `cancelled`

---

### 4.6 Payments — `/api/payments`

#### 🔒 POST `/api/payments/create-order`

Create a Razorpay payment order.

**Request Body:**
```json
{
  "orderId": "64g...",
  "amount": 5998
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Razorpay order created",
  "data": {
    "razorpayOrderId": "order_LxYz...",
    "amount": 599800,
    "currency": "INR",
    "key_id": "rzp_test_..."
  }
}
```

> **Note:** Amount is in paise (₹5998 = 599800 paise).

---

#### 🔒 POST `/api/payments/verify`

Verify Razorpay payment signature and finalize order.

**Request Body:**
```json
{
  "razorpay_order_id": "order_LxYz...",
  "razorpay_payment_id": "pay_AbCd...",
  "razorpay_signature": "a1b2c3d4e5f6...",
  "orderId": "64g..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "order": {
      "_id": "64g...",
      "paymentStatus": "paid",
      "razorpayPaymentId": "pay_AbCd...",
      "paidAt": "2026-06-17T08:00:00.000Z"
    }
  }
}
```

---

### 4.7 Admin — `/api/admin`

#### 🛡️ GET `/api/admin/dashboard`

Get dashboard statistics.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Dashboard data fetched",
  "data": {
    "stats": {
      "totalUsers": 150,
      "totalProducts": 85,
      "totalOrders": 320,
      "totalRevenue": 1250000,
      "pendingOrders": 15,
      "recentOrders": [ ... ],
      "monthlySales": [
        { "month": "Jan", "revenue": 85000 },
        { "month": "Feb", "revenue": 92000 }
      ]
    }
  }
}
```

---

#### 🛡️ GET `/api/admin/users`

Get all registered users (paginated).

---

#### 🛡️ PUT `/api/admin/users/:id`

Update a user's role.

**Request Body:**
```json
{
  "role": "admin"
}
```

---

#### 🛡️ DELETE `/api/admin/users/:id`

Delete a user account. Cannot delete own account.

---

#### 🛡️ GET `/api/admin/orders`

Get all orders across all users (paginated, filterable by status).

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | Number | 1 | Page number |
| limit | Number | 10 | Items per page |
| status | String | — | Filter by orderStatus |

---

## 5. Middleware Pipeline

```
Incoming Request
       │
       ▼
┌──────────────┐
│    CORS      │  ← Cross-origin requests allowed from frontend domain
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Helmet     │  ← Security headers (XSS, HSTS, etc.)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Rate Limiter │  ← 100 requests per 15 min per IP
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Body Parser  │  ← Parse JSON body (limit: 10mb for images)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Morgan     │  ← HTTP request logging (dev mode)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Routes     │  ← Match URL to route handler
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Auth MW      │  ← Verify JWT, attach req.user (protected routes)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Admin MW     │  ← Check role === "admin" (admin routes)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Validation   │  ← Run express-validator rules, return errors
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Controller   │  ← Handle request, call service, send response
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Error MW     │  ← Catch errors, format response, log
└──────────────┘
```

---

## 6. API Versioning Strategy

For future scalability, the API is designed to support versioning:

```
Current:  /api/products        (v1 implicit)
Future:   /api/v2/products     (when breaking changes are needed)
```

The initial release uses unversioned paths for simplicity. Versioned routes can be introduced later by prefixing route groups.
