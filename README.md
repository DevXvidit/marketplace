# Akshar Jewellers — Luxury Jewelry E-Commerce Platform

A full-stack luxury jewelry web app with a premium storefront, live metal rates, and a powerful admin dashboard.

---

## Features

### Customer
- Premium hero + 3D jewelry showcase
- Live gold/silver rates (auto-refresh every 10 minutes)
- Dynamic pricing: (Live Rate × Weight) + Making % + Stone Price
- Shop with search, filters, and pagination
- Product pages with image zoom + 3D toggle
- Wishlist, login, and profile
- FAQ page with accordion + General Q&A form
- Privacy Policy and Terms pages
- Mobile responsive

### Admin
- Dashboard with live stats
- Product management (multi-image upload)
- Categories, metal rates, users
- Product Q&A and General Q&A management
- Real-time notifications for new questions

### Tech
- JWT auth + bcrypt
- MongoDB + Mongoose
- Cloudinary uploads
- Socket.IO for real-time alerts
- Framer Motion animations
- React Three Fiber

---

## Project Structure

```
jewelry-app/
├── server/
│   ├── controllers/
│   │   ├── productController.js
│   │   ├── qaController.js
│   │   └── generalQuestionController.js
│   ├── models/
│   │   ├── Product.js
│   │   ├── GeneralQuestion.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── productRoutes.js
│   │   ├── adminRoutes.js
│   │   └── generalQuestionRoutes.js
│   └── server.js
└── client/
    ├── src/pages/
    │   ├── HomePage.jsx
    │   ├── ShopPage.jsx
    │   ├── ProductPage.jsx
    │   ├── FaqPage.jsx
    │   ├── LegalPages.jsx
    │   └── admin/AdminQA.jsx
    └── src/components/layout/
        ├── AdminLayout.jsx
        └── Footer.jsx
```

---

## Quick Setup

### 1) Install

```bash
cd server
npm install
cd ../client
npm install
```

### 2) Environment

```bash
cd server
cp .env.example .env
```

Required keys in `server/.env`:

```env
PORT=5000
MONGO_URI=your_mongo_uri
JWT_SECRET=your_secret
JWT_EXPIRE=30d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

GOLD_API_KEY=your_goldapi_key

ADMIN_EMAIL=admin@yourshop.com
ADMIN_PASSWORD=SecureAdmin@123
```

### 3) Seed & Run

```bash
cd server
node seeder.js
npm run dev
```

```bash
cd client
npm run dev
```

Admin URL: `http://localhost:5173/admin`

---

## Q&A System

- Product Q&A: questions live under each product, answered by admin.
- General Q&A: users must log in to ask questions on the FAQ page.
- Admin receives real-time notifications for both.

---

## API Reference (Highlights)

### Products
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products/:id/question` (auth)
- `GET /api/products/:id/questions`

### General Q&A
- `GET /api/questions`
- `POST /api/questions` (auth)

### Admin
- `GET /api/admin/questions` (product Q&A)
- `GET /api/admin/general-questions`
- `PUT /api/admin/general-questions/:id`
- `GET /api/admin/notifications`

---

## Notes

- This business does not ship products; purchases are in-store only.
- FAQ and Q&A are intended for product details, purity, and pricing questions.

---

## License

MIT License.
