# CaneTrace — Smart Sugarcane Farmer Data Platform

> **Enterprise-grade sugarcane farmer enumeration, cultivation lifecycle tracking, duplicate detection, and regional crop analytics platform.**

![CaneTrace Platform](https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=1200&q=80)

---

## 1. Overview & Purpose

**CaneTrace** is an agricultural data management platform purpose-built for sugar mills, agricultural cooperatives, cane development officers, and field extension teams.

Collecting sugarcane cultivation data has historically suffered from manual errors, out-of-season planting, duplicate grower registrations, and disconnected records. CaneTrace solves these challenges by providing:
- **Instant Geo-Resolution**: 6-digit Indian Pincode lookup automatically populates Village, Taluka, District, and State with multi-village selection.
- **Automated Season Calculation**: Strict agronomic boundary engine automatically classifies planting dates into **Adsali**, **Pre-seasonal**, or **Suru**, rejecting out-of-season planting (1 April – 14 June).
- **Duplicate Grower Detection**: Real-time 10-digit mobile number indexing detects registered farmers and prevents duplicate identities while allowing new crop cycles to be attached.
- **Multi-Crop History**: Links multiple cultivation cycles over successive years to a single farmer record.
- **Executive Analytics & Clean Exports**: Recharts visual dashboards and one-click UTF-8 Excel/CSV exports for administrative reporting.

---

## 2. Technology Stack

- **Framework**: Next.js 15 (App Router with Server Actions & API Routes)
- **Language**: TypeScript with strict typing
- **Database**: MongoDB Atlas via Mongoose ORM
- **Styling**: Tailwind CSS with custom agri-tech color tokens (Emerald, Sage, Earth)
- **Forms & Validation**: React Hook Form + Zod schema validation
- **Data Visualizations**: Recharts
- **Date Handling**: `date-fns`
- **Security & Session**: `jose` (JWT) + `bcryptjs` with HTTP-only SameSite cookies
- **Deployment**: Zero-Docker, native Vercel and Git/GitHub compatibility

---

## 3. Agronomic Business Rules

### Planting Seasons
Sugarcane seasons are calculated deterministically using exact calendar boundaries:
1. **Adsali**: 15 June through 14 September (15–18 month high-tonnage cycle)
2. **Pre-seasonal**: 15 September through 30 December (13–15 month cycle)
3. **Suru**: 1 January through 31 March (12 month standard cycle)
4. **Unsupported Gap**: 1 April through 14 June (and 31 December) — triggers an immediate validation alert.

### Approved Sugarcane Cultivars
- **86032** — *Co 86032 (Nira)*: High sucrose, drought tolerant, 12–14 months duration.
- **265** — *CoM 0265 (Phule 265)*: Heavy tillering, high tonnage, saline-alkaline tolerant.
- **13007** — *Co 13007*: Early maturing, high sugar recovery, good ratoonability.

### Row Spacing Geometry
- **4.5 × 1.5 ft**: Mechanized wide-row planting for drip laterals and intercultural equipment.
- **4 × 1.5 ft**: Standard paired-row planting.

---

## 4. Local Development Setup

### Prerequisites
- Node.js 18.x or higher (tested on Node v20/v24)
- npm or yarn

### 1. Clone & Install
```bash
git clone https://github.com/your-org/canetrace.git
cd canetrace
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Optional: supply your MongoDB Atlas URI. If omitted, CaneTrace runs on its resilient built-in datastore.
MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/canetrace?retryWrites=true&w=majority"

# JWT Secret
JWT_SECRET="canetrace-secure-enterprise-jwt-secret-key-2026"

# Environment
NODE_ENV="development"
```

### 3. Run the Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Quick Demo Credentials

For testing and evaluation, pre-configured roles are accessible directly from the login page:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **System Administrator** | `admin@canetrace.org` | `Password@123` | Full access, analytics, exports, configuration |
| **Field Officer** | `officer@canetrace.org` | `Password@123` | Farmer registration, cultivation entries, record viewing |

---

## 6. MongoDB Atlas Setup Guide

To connect CaneTrace to a live MongoDB Atlas cloud database:

1. **Create Account**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free or dedicated cluster (M0 free tier works perfectly).
2. **Database Access**: Under **Security** → **Database Access**, add a new database user (e.g. `canetrace_user`) with read/write privileges.
3. **Network Access**: Under **Security** → **Network Access**, add an IP Access List entry allowing `0.0.0.0/0` (Allow Access from Anywhere) for Vercel deployment.
4. **Get Connection String**:
   - Click **Connect** → **Drivers** → Select **Node.js**.
   - Copy the URI:
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/canetrace?retryWrites=true&w=majority
     ```
5. **Populate Seed Records**:
   ```bash
   npm run seed
   ```

---

## 7. Vercel Deployment Instructions

CaneTrace is engineered natively for Vercel serverless deployment:

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: initial CaneTrace platform"
   git remote add origin https://github.com/<your-username>/canetrace.git
   git push -u origin main
   ```
2. **Import to Vercel**:
   - Log into [Vercel](https://vercel.com).
   - Click **Add New** → **Project** → Select the `canetrace` GitHub repository.
3. **Set Environment Variables**:
   In the Vercel project settings, configure:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure 32+ character random string.
   - `NODE_ENV`: `production`
4. **Deploy**:
   - Click **Deploy**.
   - Vercel will build and deploy your application automatically.

---

## 8. Pre-Production Checklist

- [x] Application compiles cleanly with zero TypeScript errors (`npm run build`)
- [x] MongoDB Atlas Mongoose connection pooling with timeout resilience
- [x] Strict planting season calculation matching agricultural guidelines
- [x] 6-digit Indian Pincode API lookup with multi-village selection and sugarcane belt offline cache
- [x] Real-time duplicate farmer detection by 10-digit mobile number
- [x] Multi-crop cultivation history for single farmer
- [x] Recharts dynamic visualizations (Season, Variety, Geography)
- [x] UTF-8 CSV/Excel export with formatting BOM
- [x] Protected dashboard routes with HTTP-only JWT sessions
- [x] 100% mobile-friendly responsive layouts for field operations

---

## 9. License

Proprietary agricultural technology platform. All rights reserved.
