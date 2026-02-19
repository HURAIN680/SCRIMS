import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";

const app = express();

// middlewares
app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("SCRIMS API is running");
});

// routes
app.use("/api/auth", authRoutes);

export default app;
