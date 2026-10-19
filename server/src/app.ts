import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import adminCategoryRoutes from "./routes/admin-category.routes.js";
import productRoutes from "./routes/product.routes.js";
import adminProductRoutes from "./routes/admin-product.routes.js";
import adminInventoryRoutes from "./routes/admin-inventory.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import orderRoutes from "./routes/order.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import adminImageRoutes from "./routes/admin-image.routes.js";
import adminOrderRoutes from "./routes/admin-order.routes.js";
import adminCustomerRoutes from "./routes/admin-customer.routes.js";
import chatRoutes from "./routes/chat.routes.js";

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(cookieParser());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/admin/categories", adminCategoryRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/admin/products", adminProductRoutes);
app.use("/api/v1/admin/inventory", adminInventoryRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/admin/dashboard", dashboardRoutes);
app.use("/api/v1/admin/images", adminImageRoutes);
app.use("/api/v1/admin/orders", adminOrderRoutes);
app.use("/api/v1/admin/customers", adminCustomerRoutes);
app.use("/api/v1/chat", chatRoutes);

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Clothing Store API is running",
    timestamp: new Date().toISOString(),
  });
});

export default app;