# SHOPEZ — Project Roadmap

## Timeline Overview

```
Epic 1  ████░░░░░░░░░░░░░░░░░░░░░░░░░░  Project Architecture     (Day 1)
Epic 2  ░░░░████░░░░░░░░░░░░░░░░░░░░░░  Setup & Configuration    (Day 2)
Epic 3  ░░░░░░░░██████░░░░░░░░░░░░░░░░  Database Development     (Day 3-4)
Epic 4  ░░░░░░░░░░░░░░██████████░░░░░░  Backend Development      (Day 5-9)
Epic 5  ░░░░░░░░░░░░░░░░░░░░░░██████████  Frontend Development   (Day 10-14)
Epic 6  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░████  Image Upload           (Day 15)
Epic 7  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████████  Payment Gateway  (Day 16-17)
Epic 8  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████  Security       (Day 18)
Epic 9  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░██████  Testing  (Day 19-20)
Epic 10 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████  Deploy (Day 21)
Epic 11 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████  Docs (Day 22)
```

---

## Detailed Epic Breakdown

### EPIC 1: Project Architecture ✅ (Current)
**Duration:** 1 day | **Status:** In Progress

| Task | Deliverable | Status |
|------|-------------|--------|
| Define project requirements | Requirements document | ✅ |
| Create system architecture | Architecture diagrams | ✅ |
| Design application flow | Flow diagrams | ✅ |
| Create folder structure | Folder tree documentation | ✅ |
| Explain MERN architecture | Architecture explanation | ✅ |
| Create database architecture | ER diagram + schema docs | ✅ |
| Create API architecture | API endpoint documentation | ✅ |
| Create project roadmap | This document | ✅ |

---

### EPIC 2: Project Setup & Configuration
**Duration:** 1 day | **Status:** Pending

| Task | Deliverable |
|------|-------------|
| Initialize backend | `backend/package.json`, Express server |
| Initialize frontend | React app with folder structure |
| Install dependencies | All npm packages listed in tech stack |
| Configure MongoDB Atlas | Database connection module |
| Configure environment variables | `.env.example` files |
| Configure GitHub repository | `.gitignore`, initial commit |
| Configure VS Code | Recommended extensions & settings |
| Configure project scripts | `concurrently` for running both servers |

---

### EPIC 3: Database Development
**Duration:** 2 days | **Status:** Pending

| Task | Deliverable |
|------|-------------|
| User Model | Mongoose schema with auth methods |
| Product Model | Schema with text index, category ref |
| Category Model | Schema with unique name index |
| Cart Model | Schema with embedded items, auto-total |
| Order Model | Schema with embedded items, status enum |
| Review Model | Schema with compound unique index |

---

### EPIC 4: Backend Development
**Duration:** 5 days | **Status:** Pending

| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | Auth APIs | Register, Login, Logout, Profile, Change Password |
| 2 | Product APIs | CRUD, Search, Filter with pagination |
| 3 | Category & Cart APIs | Category CRUD, Cart operations |
| 4 | Order & Payment APIs | Order CRUD, Razorpay routes |
| 5 | Admin APIs | Dashboard, User/Order management |

---

### EPIC 5: Frontend Development
**Duration:** 5 days | **Status:** Pending

| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | Setup & Layout | Layouts, Navbar, Footer, routing |
| 2 | Auth Pages | Login, Register, Profile, Context |
| 3 | Product Pages | Home, Products list, Product detail |
| 4 | Cart & Checkout | Cart page, Checkout, Order history |
| 5 | Admin Pages | Dashboard, Manage Products/Orders/Users |

---

### EPIC 6: Image Upload (Cloudinary)
**Duration:** 1 day | **Status:** Pending

| Task | Deliverable |
|------|-------------|
| Cloudinary config | Backend configuration module |
| Upload API | Image upload endpoint |
| Delete API | Image deletion endpoint |
| Product images | Multi-image upload for products |
| Frontend integration | Image upload component |

---

### EPIC 7: Payment Gateway (Razorpay)
**Duration:** 2 days | **Status:** Pending

| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | Backend integration | Create order, verify payment APIs |
| 2 | Frontend integration | Checkout flow, success/failure pages |

---

### EPIC 8: Security Hardening
**Duration:** 1 day | **Status:** Pending

| Task | Deliverable |
|------|-------------|
| JWT hardening | Token rotation, secure storage |
| Helmet configuration | Security headers |
| Rate limiting | Express rate limiter |
| Input sanitization | MongoDB injection, XSS protection |
| CORS configuration | Whitelist production domains |

---

### EPIC 9: Testing
**Duration:** 2 days | **Status:** Pending

| Day | Task | Deliverable |
|-----|------|-------------|
| 1 | Backend testing | Postman collection, API test cases |
| 2 | Frontend testing | UI checklist, integration testing |

---

### EPIC 10: Deployment
**Duration:** 1 day | **Status:** Pending

| Task | Deliverable |
|------|-------------|
| Backend deployment | Deploy to Render |
| Frontend deployment | Deploy to Vercel |
| Database setup | MongoDB Atlas production cluster |
| Environment config | Production env variables |
| Troubleshooting | Common issues & fixes guide |

---

### EPIC 11: Documentation
**Duration:** 1 day | **Status:** Pending

| Task | Deliverable |
|------|-------------|
| README.md | Project overview & setup guide |
| Architecture docs | System, DB, API architecture |
| Installation guide | Step-by-step setup |
| Deployment guide | Production deployment steps |
| User manual | Feature walkthrough |

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|-----------|
| MongoDB Atlas connection issues | High | Test connection early, keep connection string updated |
| Razorpay integration complexity | Medium | Use test mode first, follow official docs |
| Cloudinary upload limits (free tier) | Low | Compress images before upload, limit to 5 per product |
| JWT token security | High | Use strong secret, implement token expiry |
| CORS configuration errors | Medium | Test with frontend URL, use environment variables |
| Render cold starts (free tier) | Low | Implement loading states in frontend |

---

## Definition of Done (Per Epic)

- [ ] All code files generated (no placeholders)
- [ ] Production-ready with error handling
- [ ] Git commit with descriptive message
- [ ] Folder tree documented
- [ ] Postman test cases provided
- [ ] API documentation updated
- [ ] Common errors & fixes listed
- [ ] Next epic previewed
