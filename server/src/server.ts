import dotenv from "dotenv";
// Load environment variables FIRST, before any imports that depend on them
dotenv.config();

import express, { Application, Request, Response } from "express";
import cors from "cors";
import connectDB from "./config/database";
import videoRoutes from "./routes/video.routes";

// Import routes
import authRoutes from "./routes/auth.routes";
import courseRoutes from "./routes/course.routes";
import paymentRoutes from "./routes/payment.routes";
import enrollmentRoutes from "./routes/enrollment.routes";
import adminRoutes from "./routes/admin.routes";
import consultationRoutes from "./routes/consultation.routes";
import storeRoutes from "./routes/store.routes";

// Initialize express app
const app: Application = express();

// Connect to database
connectDB();

// Middleware
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:4000",
      "http://localhost:4000",
      "http://localhost:3001",
      "http://localhost:3002",
      "https://the-peters.onrender.com",
      "https://the-peters.netlify.app"
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware (development only)
if (process.env.NODE_ENV === "development") {
  app.use((req: Request, res: Response, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check route
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/store", storeRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error("Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("");
  console.log("🚀 ================================");
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log("🚀 ================================");
  console.log("");
});

export default app;
