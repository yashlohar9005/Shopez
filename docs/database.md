# SHOPEZ — Database Architecture

## 1. Overview

SHOPEZ uses **MongoDB Atlas** (cloud-hosted NoSQL database) with **Mongoose ODM** for schema definition, validation, and data access. The database consists of **6 collections** that model the complete e-commerce domain.

---

## 2. Entity-Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     SHOPEZ DATABASE SCHEMA                          │
└─────────────────────────────────────────────────────────────────────┘

    ┌──────────────────┐         ┌──────────────────┐
    │      USERS       │         │    CATEGORIES     │
    ├──────────────────┤         ├──────────────────┤
    │ _id       (PK)   │         │ _id       (PK)   │
    │ name      String │         │ name      String │
    │ email     String │◄──┐     │ description Str  │
    │ password  String │   │     │ image     String │
    │ phone     String │   │     │ isActive  Bool   │
    │ avatar    String │   │     │ createdAt Date   │
    │ role      Enum   │   │     │ updatedAt Date   │
    │ address   Object │   │     └────────┬─────────┘
    │ createdAt Date   │   │              │
    │ updatedAt Date   │   │              │ 1:N (category → products)
    └──┬───┬───┬───────┘   │              │
       │   │   │           │              ▼
       │   │   │           │     ┌──────────────────┐
       │   │   │           │     │    PRODUCTS       │
       │   │   │           │     ├──────────────────┤
       │   │   │           │     │ _id       (PK)   │
       │   │   │           │     │ name      String │
       │   │   │           │     │ description Str  │
       │   │   │           │     │ price     Number │
       │   │   │           │     │ stock     Number │
       │   │   │           │     │ images    [Str]  │
       │   │   │           │     │ category  (FK)───┘
       │   │   │           │     │ avgRating Number │
       │   │   │           │     │ numReviews Number│
       │   │   │           │     │ isActive  Bool   │
       │   │   │           │     │ createdAt Date   │
       │   │   │           │     │ updatedAt Date   │
       │   │   │           │     └───┬──────────────┘
       │   │   │           │         │
       │   │   │    1:N    │         │ 1:N (product → reviews)
       │   │   │  (user →  │         │
       │   │   │  reviews) │         ▼
       │   │   │           │  ┌──────────────────┐
       │   │   │           │  │    REVIEWS        │
       │   │   │           │  ├──────────────────┤
       │   │   └───────────┼─▶│ user     (FK)    │
       │   │               │  │ product  (FK)◄───┘
       │   │               │  │ rating   Number  │
       │   │               │  │ comment  String  │
       │   │               │  │ createdAt Date   │
       │   │               │  └──────────────────┘
       │   │               │
       │   │  1:1          │
       │   │ (user → cart) │
       │   │               │
       │   ▼               │
   ┌──────────────────┐    │
   │      CARTS        │    │
   ├──────────────────┤    │
   │ _id       (PK)   │    │
   │ user      (FK)───┘    │
   │ items     [Object]    │
   │  ├─ product (FK) ─────┼──▶ Products._id
   │  ├─ quantity Number   │
   │  └─ price   Number   │
   │ totalPrice Number     │
   │ createdAt Date        │
   │ updatedAt Date        │
   └──────────────────┘    │
       │                   │
       │  1:N              │
       │ (user → orders)   │
       ▼                   │
   ┌──────────────────┐    │
   │     ORDERS        │    │
   ├──────────────────┤    │
   │ _id          (PK) │    │
   │ user         (FK)─┘
   │ items       [Object]
   │  ├─ product   (FK) ──────▶ Products._id
   │  ├─ name      String
   │  ├─ quantity  Number
   │  ├─ price     Number
   │  └─ image     String
   │ shippingAddress Object
   │  ├─ street    String
   │  ├─ city      String
   │  ├─ state     String
   │  ├─ zipCode   String
   │  └─ country   String
   │ paymentMethod  String
   │ paymentStatus  Enum     ── "pending" | "paid" | "failed"
   │ razorpayOrderId   Str
   │ razorpayPaymentId Str
   │ totalPrice     Number
   │ taxPrice       Number
   │ shippingPrice  Number
   │ orderStatus    Enum     ── "processing"|"shipped"|"delivered"|"cancelled"
   │ paidAt         Date
   │ deliveredAt    Date
   │ createdAt      Date
   └──────────────────┘
```

---

## 3. Collection Schemas (Detailed)

### 3.1 Users Collection

```
Collection: users
Purpose: Stores registered user accounts (both customers and admins)

{
  _id:        ObjectId          (auto-generated)
  name:       String            (required, 2-50 chars, trimmed)
  email:      String            (required, unique, lowercase, valid email format)
  password:   String            (required, min 6 chars, hashed with bcryptjs)
  phone:      String            (optional, 10-15 digits)
  avatar:     String            (optional, Cloudinary URL, default: placeholder)
  role:       String            (enum: ["user", "admin"], default: "user")
  address: {
    street:   String            (optional)
    city:     String            (optional)
    state:    String            (optional)
    zipCode:  String            (optional)
    country:  String            (optional, default: "India")
  }
  createdAt:  Date              (auto, Mongoose timestamps)
  updatedAt:  Date              (auto, Mongoose timestamps)
}

Indexes:
  - { email: 1 } — unique index for fast lookup and duplicate prevention

Pre-save Hook:
  - Hash password with bcryptjs (salt rounds: 10) before saving

Instance Methods:
  - comparePassword(candidatePassword) — compares plain text with hashed password
  - generateAuthToken() — creates JWT with { id, role } payload
```

### 3.2 Products Collection

```
Collection: products
Purpose: Stores product catalog with pricing, stock, and image data

{
  _id:           ObjectId       (auto-generated)
  name:          String         (required, 3-200 chars, trimmed)
  description:   String         (required, 10-2000 chars)
  price:         Number         (required, min: 0)
  stock:         Number         (required, min: 0, default: 0)
  images:        [String]       (array of Cloudinary URLs, max: 5)
  category:      ObjectId       (required, ref: "Category")
  averageRating: Number         (default: 0, min: 0, max: 5)
  numReviews:    Number         (default: 0)
  isActive:      Boolean        (default: true)
  createdAt:     Date           (auto)
  updatedAt:     Date           (auto)
}

Indexes:
  - { name: "text", description: "text" } — full-text search index
  - { category: 1 }                       — filter by category
  - { price: 1 }                          — sort/filter by price
  - { averageRating: -1 }                 — sort by rating (descending)
  - { createdAt: -1 }                     — sort by newest
```

### 3.3 Categories Collection

```
Collection: categories
Purpose: Product categories for organization and filtering

{
  _id:         ObjectId         (auto-generated)
  name:        String           (required, unique, 2-50 chars, trimmed)
  description: String           (optional, max 500 chars)
  image:       String           (optional, Cloudinary URL)
  isActive:    Boolean          (default: true)
  createdAt:   Date             (auto)
  updatedAt:   Date             (auto)
}

Indexes:
  - { name: 1 } — unique index
```

### 3.4 Carts Collection

```
Collection: carts
Purpose: Persistent shopping cart, one per user

{
  _id:        ObjectId          (auto-generated)
  user:       ObjectId          (required, ref: "User", unique)
  items: [{
    product:  ObjectId          (required, ref: "Product")
    quantity: Number            (required, min: 1)
    price:    Number            (required, min: 0)
  }]
  totalPrice: Number            (default: 0)
  createdAt:  Date              (auto)
  updatedAt:  Date              (auto)
}

Indexes:
  - { user: 1 } — unique index (one cart per user)

Pre-save Hook:
  - Recalculate totalPrice from items (sum of quantity × price)
```

### 3.5 Orders Collection

```
Collection: orders
Purpose: Completed order records with payment and shipping details

{
  _id:              ObjectId    (auto-generated)
  user:             ObjectId    (required, ref: "User")
  items: [{
    product:        ObjectId    (required, ref: "Product")
    name:           String      (required — snapshot at order time)
    quantity:       Number      (required, min: 1)
    price:          Number      (required, min: 0)
    image:          String      (required — snapshot at order time)
  }]
  shippingAddress: {
    street:         String      (required)
    city:           String      (required)
    state:          String      (required)
    zipCode:        String      (required)
    country:        String      (required, default: "India")
  }
  paymentMethod:    String      (default: "Razorpay")
  paymentStatus:    String      (enum: ["pending","paid","failed"], default: "pending")
  razorpayOrderId:  String      (optional)
  razorpayPaymentId:String      (optional)
  totalPrice:       Number      (required)
  taxPrice:         Number      (default: 0)
  shippingPrice:    Number      (default: 0)
  orderStatus:      String      (enum: ["processing","shipped","delivered","cancelled"],
                                 default: "processing")
  paidAt:           Date        (optional)
  deliveredAt:      Date        (optional)
  createdAt:        Date        (auto)
}

Indexes:
  - { user: 1 }           — fetch user's order history
  - { orderStatus: 1 }    — admin filter by status
  - { createdAt: -1 }     — sort by newest
```

### 3.6 Reviews Collection

```
Collection: reviews
Purpose: Product reviews and ratings by users

{
  _id:        ObjectId          (auto-generated)
  user:       ObjectId          (required, ref: "User")
  product:    ObjectId          (required, ref: "Product")
  rating:     Number            (required, min: 1, max: 5)
  comment:    String            (required, 5-500 chars)
  createdAt:  Date              (auto)
}

Indexes:
  - { product: 1, user: 1 } — compound unique index (one review per user per product)
  - { product: 1 }          — fetch all reviews for a product

Post-save / Post-remove Hook:
  - Recalculate Product.averageRating and Product.numReviews using aggregation
```

---

## 4. Relationships Summary

| Relationship | Type | Implementation | Rationale |
|-------------|------|---------------|-----------|
| User → Cart | 1:1 | Reference (unique) | Each user has exactly one cart |
| User → Orders | 1:N | Reference | Users can have many orders |
| User → Reviews | 1:N | Reference | Users can review many products |
| Category → Products | 1:N | Reference | Products belong to one category |
| Product → Reviews | 1:N | Reference | Products can have many reviews |
| Cart → Cart Items | 1:N | Embedded | Cart items always fetched with cart |
| Order → Order Items | 1:N | Embedded | Order items are immutable snapshots |

---

## 5. Data Validation Summary

| Collection | Field | Validation Rules |
|-----------|-------|-----------------|
| User | name | Required, 2-50 chars, trimmed |
| User | email | Required, unique, valid email, lowercase |
| User | password | Required, min 6 chars (stored as bcrypt hash) |
| User | role | Enum: `user`, `admin` |
| Product | name | Required, 3-200 chars |
| Product | price | Required, min: 0 |
| Product | stock | Required, min: 0 |
| Product | images | Array, max 5 items |
| Category | name | Required, unique, 2-50 chars |
| Cart | user | Required, unique reference |
| Cart Item | quantity | Required, min: 1 |
| Order | shippingAddress | All sub-fields required |
| Order | paymentStatus | Enum: `pending`, `paid`, `failed` |
| Order | orderStatus | Enum: `processing`, `shipped`, `delivered`, `cancelled` |
| Review | rating | Required, 1-5 |
| Review | comment | Required, 5-500 chars |
| Review | user+product | Compound unique (one review per user per product) |

---

## 6. MongoDB Atlas Configuration

```
Cluster Tier:     M0 (Free) or M10+ (Production)
Region:           Mumbai (ap-south-1) — closest to Indian users
Database Name:    shopez
Authentication:   Username + Password
Network Access:   IP Whitelist (production) or 0.0.0.0/0 (development)
Connection:       MongoDB Driver (Node.js 4.1+)

Connection String Format:
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/shopez?retryWrites=true&w=majority
```
