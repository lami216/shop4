import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import categoryRoutes from "./routes/category.route.js";
import publicConfigRoutes from "./routes/publicConfig.route.js";
import orderRoutes from "./routes/order.route.js";

import { connectDB } from "./lib/db.js";

// جذر المشروع (repo root)
const ROOT_DIR = path.resolve();

// تحميل ملف .env من backend/.env بالنسبة لجذر المشروع
dotenv.config({ path: path.join(ROOT_DIR, "backend", ".env") });

const app = express();
const PORT = process.env.PORT || 5000;

/* ---------- CORS ---------- */
const allowedOrigins = (process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean)
  : []
);

// Fallback to CLIENT_URL if set
if (process.env.CLIENT_URL && !allowedOrigins.includes(process.env.CLIENT_URL)) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

// In dev, allow localhost:5173 by default
if (process.env.NODE_ENV !== "production" && !allowedOrigins.length) {
  allowedOrigins.push("http://localhost:5173");
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser/SSR requests with no Origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
};

app.use(cors(corsOptions));
// Explicitly handle preflight
app.options("*", cors(corsOptions));

/* ---------- Parsers & cookies ---------- */
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));
app.use(cookieParser());

/* ---------- API Routes ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/public-config", publicConfigRoutes);
app.use("/api/orders", orderRoutes);

/* ---------- Static (production) ---------- */
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(ROOT_DIR, "frontend", "dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(ROOT_DIR, "frontend", "dist", "index.html"));
  });
}

/* ---------- Start ---------- */
app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
  connectDB();
});
