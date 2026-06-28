# SHOPEZ — System Architecture

## 1. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                 │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                   React.js SPA (Vercel)                        │ │
│  │                                                                │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │ │
│  │  │  Pages   │  │Components│  │ Context  │  │   Services   │  │ │
│  │  │          │  │          │  │ (State)  │  │ (Axios HTTP) │  │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────┬───────┘  │ │
│  │                                                    │          │ │
│  └────────────────────────────────────────────────────┼──────────┘ │
│                                                       │            │
│  ┌────────────────────────┐                          │            │
│  │     Cloudinary CDN     │◄─── Image Upload ────────┤            │
│  │   (Image Storage)      │                          │            │
│  └────────────────────────┘                          │            │
│                                                       │            │
│  ┌────────────────────────┐                          │            │
│  │    Razorpay Gateway    │◄─── Payment Flow ────────┤            │
│  │   (Payment Processing) │                          │            │
│  └────────────────────────┘                          │            │
└──────────────────────────────────────────────────────┼────────────┘
                                                       │
                                          REST API (JSON)
                                          JWT Bearer Token
                                                       │
┌──────────────────────────────────────────────────────┼────────────┐
│                        SERVER LAYER                   │            │
│                                                       ▼            │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │                Express.js Server (Render)                      ││
│  │                                                                ││
│  │  ┌──────────────────── Middleware Pipeline ──────────────────┐ ││
│  │  │                                                          │ ││
│  │  │  CORS → Helmet → Rate Limiter → Body Parser → Logger    │ ││
│  │  │                                                          │ ││
│  │  └──────────────────────────┬───────────────────────────────┘ ││
│  │                             │                                  ││
│  │                             ▼                                  ││
│  │  ┌──────────────────── Route Layer ─────────────────────────┐ ││
│  │  │                                                          │ ││
│  │  │  /api/auth    /api/products   /api/cart   /api/orders    │ ││
│  │  │  /api/categories   /api/payments   /api/admin            │ ││
│  │  │                                                          │ ││
│  │  └──────────────────────────┬───────────────────────────────┘ ││
│  │                             │                                  ││
│  │                             ▼                                  ││
│  │  ┌──────────── Auth & Validation Middleware ────────────────┐ ││
│  │  │                                                          │ ││
│  │  │  JWT Verify → Role Check → Input Validation              │ ││
│  │  │                                                          │ ││
│  │  └──────────────────────────┬───────────────────────────────┘ ││
│  │                             │                                  ││
│  │                             ▼                                  ││
│  │  ┌──────────────── Controller Layer ────────────────────────┐ ││
│  │  │                                                          │ ││
│  │  │  authCtrl · productCtrl · cartCtrl · orderCtrl · adminCtrl││
│  │  │                                                          │ ││
│  │  └──────────────────────────┬───────────────────────────────┘ ││
│  │                             │                                  ││
│  │                             ▼                                  ││
│  │  ┌──────────────── Service Layer ───────────────────────────┐ ││
│  │  │                                                          │ ││
│  │  │  authService · productService · cartService              │ ││
│  │  │  orderService · paymentService · categoryService         │ ││
│  │  │                                                          │ ││
│  │  └──────────────────────────┬───────────────────────────────┘ ││
│  │                             │                                  ││
│  │                             ▼                                  ││
│  │  ┌──────────────── Model Layer (Mongoose) ──────────────────┐ ││
│  │  │                                                          │ ││
│  │  │  User · Product · Category · Cart · Order · Review       │ ││
│  │  │                                                          │ ││
│  │  └──────────────────────────┬───────────────────────────────┘ ││
│  │                             │                                  ││
│  └─────────────────────────────┼──────────────────────────────────┘│
│                                │                                   │
└────────────────────────────────┼───────────────────────────────────┘
                                 │
                          Mongoose ODM
                                 │
┌────────────────────────────────┼───────────────────────────────────┐
│                        DATA LAYER                                  │
│                                ▼                                   │
│  ┌────────────────────────────────────────────────────────────────┐│
│  │              MongoDB Atlas (Cloud Cluster)                     ││
│  │                                                                ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         ││
│  │  │  users   │ │ products │ │  carts   │ │  orders  │         ││
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘         ││
│  │  ┌──────────┐ ┌──────────┐                                    ││
│  │  │categories│ │ reviews  │                                    ││
│  │  └──────────┘ └──────────┘                                    ││
│  │                                                                ││
│  └────────────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────────┘
```

---

## 2. Request-Response Flow

```
CLIENT REQUEST
    │
    ▼
┌─────────────────────┐
│   Express Router    │  ← Matches URL pattern to route handler
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   Auth Middleware    │  ← Verifies JWT token from Authorization header
│   (if protected)    │     Attaches req.user with { id, role }
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Admin Middleware    │  ← Checks req.user.role === 'admin'
│  (if admin route)   │     Returns 403 if not admin
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Validation Middleware│  ← Runs express-validator rules
│                     │     Returns 400 with errors if invalid
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│    Controller       │  ← Extracts request data (params, body, query)
│                     │     Calls service layer method
│                     │     Sends formatted response
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│    Service          │  ← Contains business logic
│                     │     Calls Mongoose model methods
│                     │     Handles data transformation
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│    Model (Mongoose) │  ← Interacts with MongoDB
│                     │     Validates schema constraints
│                     │     Returns documents
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   MongoDB Atlas     │  ← Stores/retrieves data
└─────────┬───────────┘
          │
          ▼
     RESPONSE (JSON)
```

---

## 3. Authentication Flow

```
REGISTRATION FLOW:
──────────────────

User Submits Form → POST /api/auth/register
    │
    ▼
Validate Input (name, email, password)
    │
    ▼
Check if email already exists in DB
    │
    ├── Exists → Return 409 "Email already registered"
    │
    └── New → Hash password with bcryptjs (salt rounds: 10)
              │
              ▼
         Create User document in MongoDB
              │
              ▼
         Generate JWT token (payload: { id, role }, expires: 7d)
              │
              ▼
         Return { success: true, token, user }


LOGIN FLOW:
───────────

User Submits Form → POST /api/auth/login
    │
    ▼
Validate Input (email, password)
    │
    ▼
Find user by email in DB
    │
    ├── Not Found → Return 401 "Invalid credentials"
    │
    └── Found → Compare password with bcryptjs
                   │
                   ├── Mismatch → Return 401 "Invalid credentials"
                   │
                   └── Match → Generate JWT token
                                │
                                ▼
                          Return { success: true, token, user }


PROTECTED ROUTE ACCESS:
───────────────────────

Request with Authorization: Bearer <token>
    │
    ▼
Auth Middleware extracts token from header
    │
    ├── No token → Return 401 "Not authenticated"
    │
    └── Token found → Verify with jwt.verify(token, JWT_SECRET)
                         │
                         ├── Invalid/Expired → Return 401 "Token invalid"
                         │
                         └── Valid → Decode payload { id, role }
                                      │
                                      ▼
                                 Find user by id in DB
                                      │
                                      ├── Not found → Return 401
                                      │
                                      └── Found → Attach to req.user
                                                   │
                                                   ▼
                                              next() → Controller
```

---

## 4. Payment Flow (Razorpay)

```
CHECKOUT FLOW:
──────────────

1. User clicks "Place Order"
       │
       ▼
2. Frontend → POST /api/payments/create-order
       │        (sends: amount, currency)
       │
       ▼
3. Backend creates Razorpay Order via Razorpay SDK
       │        razorpay.orders.create({ amount, currency, receipt })
       │
       ▼
4. Backend returns { orderId, amount, currency, key_id }
       │
       ▼
5. Frontend opens Razorpay Checkout modal
       │        (pre-filled with order details)
       │
       ▼
6. User completes payment on Razorpay
       │
       ├── Payment Failed → Show failure page, allow retry
       │
       └── Payment Success → Razorpay returns:
                              { razorpay_order_id,
                                razorpay_payment_id,
                                razorpay_signature }
                                    │
                                    ▼
7. Frontend → POST /api/payments/verify
       │        (sends all three Razorpay values)
       │
       ▼
8. Backend verifies signature using HMAC SHA256:
       │   generated_signature = HMAC_SHA256(
       │       razorpay_order_id + "|" + razorpay_payment_id,
       │       razorpay_key_secret
       │   )
       │
       ├── Mismatch → Return 400 "Payment verification failed"
       │
       └── Match → Create Order in DB with paymentStatus: "paid"
                    │
                    ▼
              Clear user's cart
                    │
                    ▼
              Return { success: true, order }
                    │
                    ▼
              Frontend shows Order Confirmation page
```

---

## 5. Component Architecture (Frontend)

```
App.jsx
├── AuthContext.Provider
│   └── CartContext.Provider
│       └── AppRoutes
│           │
│           ├── MainLayout (Navbar + Footer)
│           │   ├── HomePage
│           │   ├── ProductsPage
│           │   │   ├── SearchBar
│           │   │   ├── ProductFilters
│           │   │   ├── ProductCard (×n)
│           │   │   └── Pagination
│           │   ├── ProductDetailPage
│           │   ├── LoginPage
│           │   └── RegisterPage
│           │
│           ├── ProtectedRoute (requires auth)
│           │   └── MainLayout
│           │       ├── CartPage
│           │       │   └── CartItem (×n)
│           │       ├── CheckoutPage
│           │       ├── OrdersPage
│           │       └── ProfilePage
│           │
│           └── AdminRoute (requires admin role)
│               └── AdminLayout (Sidebar + Header)
│                   ├── DashboardPage
│                   │   └── StatsCard (×n)
│                   ├── ManageProductsPage
│                   ├── ManageOrdersPage
│                   └── ManageUsersPage
```

---

## 6. Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│                    INTERNET                          │
│                                                     │
│    ┌──────────────────┐    ┌──────────────────┐    │
│    │   shopez.vercel   │    │ shopez-api.render │    │
│    │     .app          │    │    .com           │    │
│    │                   │    │                   │    │
│    │   VERCEL          │    │   RENDER          │    │
│    │   ┌────────────┐  │    │   ┌────────────┐  │    │
│    │   │ React SPA  │──┼────┼──▶│ Express.js │  │    │
│    │   │ (Static)   │  │    │   │  (Node.js) │  │    │
│    │   └────────────┘  │    │   └─────┬──────┘  │    │
│    │                   │    │         │         │    │
│    └──────────────────┘    └─────────┼─────────┘    │
│                                      │              │
│                                      │              │
│    ┌──────────────────┐    ┌────────┼─────────┐    │
│    │   CLOUDINARY     │    │  MONGODB ATLAS   │    │
│    │   ┌────────────┐ │    │   ┌──────────┐   │    │
│    │   │ Image CDN  │ │    │   │ Cluster  │   │    │
│    │   │ (Storage)  │ │    │   │ (Cloud)  │◄──┘    │
│    │   └────────────┘ │    │   └──────────┘   │    │
│    │                  │    │                   │    │
│    └──────────────────┘    └───────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 7. Environment Variables Map

```
BACKEND (.env):                          FRONTEND (.env):
─────────────────                        ─────────────────
NODE_ENV=production                      REACT_APP_API_URL=https://shopez-api.render.com/api
PORT=5000                                REACT_APP_RAZORPAY_KEY_ID=rzp_live_xxx
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=your-secret
```
