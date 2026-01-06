# Smart Photography Sales Platform - Design Document

## 1. System Architecture

The system follows a standard Client-Server architecture with a decoupled frontend and backend.

**High-Level Overview:**
- **Frontend:** Next.js (React) application styled with Tailwind CSS. Handles user interface, client-side routing, and interactions.
- **Backend:** Node.js with Express.js. RESTful API to handle business logic, authentication, and database operations.
- **Database:** MongoDB. NoSQL database for flexible data storage (JSON-like documents).
- **Storage:** Cloudinary (recommended for easy image transformations like watermarking) or AWS S3.
- **Payment Processing:** Razorpay (preferred for India) or Stripe.
- **Authentication:** JWT (JSON Web Tokens) for stateless authentication.

**Data Flow:**
1.  **Upload:** Photographer uploads high-res image -> Backend -> Storage Service (Original) -> Generate Watermarked Version -> Save URLs to DB.
2.  **Purchase:** Customer selects image -> Payment Gateway -> Webhook/Success -> Backend updates Order status -> Generates Signed Download Link (Original) -> Customer Downloads.

## 2. Database Schema (MongoDB Mongoose Models)

### Users Collection
```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String",
  "passwordHash": "String",
  "role": "Enum('photographer', 'customer', 'admin')",
  "createdAt": "Date"
}
```

### Albums/Events Collection
```json
{
  "_id": "ObjectId",
  "photographerId": "Ref(User)",
  "title": "String",
  "description": "String",
  "coverImage": "String", // URL
  "eventDate": "Date",
  "isPrivate": "Boolean",
  "accessCode": "String", // Optional, for private events
  "pricePerPhoto": "Number", // Default price
  "priceFullAlbum": "Number", // Optional
  "createdAt": "Date"
}
```

### Photos Collection
```json
{
  "_id": "ObjectId",
  "albumId": "Ref(Album)",
  "originalUrl": "String", // Secure, not exposed publicly
  "watermarkedUrl": "String", // Publicly accessible
  "thumbnailUrl": "String",
  "price": "Number", // Override album defaults
  "metadata": {
    "width": "Number",
    "height": "Number",
    "size": "Number"
  },
  "tags": ["String"] // For search/AI
}
```

### Orders Collection
```json
{
  "_id": "ObjectId",
  "customerId": "Ref(User)", // Optional if guest checkout
  "customerEmail": "String",
  "items": [
    {
      "photoId": "Ref(Photo)",
      "price": "Number"
    }
  ],
  "totalAmount": "Number",
  "currency": "String",
  "paymentStatus": "Enum('pending', 'completed', 'failed')",
  "paymentGatewayId": "String", // Transaction ID
  "downloadLinks": [
    {
      "photoId": "Ref(Photo)",
      "token": "String",
      "expiresAt": "Date"
    }
  ],
  "createdAt": "Date"
}
```

## 3. API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT

### Photographers (Protected)
- `POST /api/albums` - Create new album
- `GET /api/albums` - List photographer's albums
- `POST /api/photos/upload` - Upload photo(s) to album
- `PUT /api/albums/:id` - Update album settings (pricing, privacy)

### Public / Customers
- `GET /api/public/albums/:id` - View album details (if public)
- `POST /api/public/albums/:id/access` - detailed view with password
- `GET /api/public/albums/:id/photos` - List watermarked photos

### Payments & Orders
- `POST /api/orders/create` - Initiate checkout session
- `POST /api/orders/webhook` - Payment gateway webhook
- `GET /api/orders/:id/download` - Get download links (after payment)

## 4. UI Flow

**Photographer Flow:**
1.  **Dashboard:** Sees summary of earnings, recent uploads.
2.  **Create Event:** Clicks "New Event" -> Enters Title, Date, Default Price -> Created.
3.  **Upload:** Drags & Drops multiple files into the event. System auto-watermarks in background.
4.  **Manage:** Sees gallery view of uploads, can delete or change individual prices.

**Customer Flow:**
1.  **Landing:** Searches for Event Name or enters Access Code.
2.  **Gallery:** Sees grid of Watermarked images.
3.  **Selection:** Clicks images to "Add to Cart".
4.  **Checkout:** reviews Cart -> "Pay Now" -> Redirected to Payment Gateway.
5.  **Success:** Redirected back to "Thank You" page with "Download All" button.

## 5. Deployment Guide

**Prerequisites:**
- Node.js installed locally.
- MongoDB Atlas account (free tier).
- Cloudinary account (for images).
- Vercel account (frontend).
- Render/Railway/Heroku account (backend).

**Steps:**
1.  **Backend Deployment (e.g., Render/Railway):**
    - Connect GitHub repo.
    - Set Environment variables: `MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_URL`, `PAYMENT_KEYS`.
    - Build Command: `npm install`
    - Start Command: `node server.js`
2.  **Frontend Deployment (Vercel):**
    - Import Next.js project from GitHub.
    - Set Environment variables: `NEXT_PUBLIC_API_URL` (pointing to backend logic).
    - Deploy.
3.  **DNS & Domain:**
    - Point custom domain to Vercel.
