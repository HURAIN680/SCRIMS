
import express from "express";
import upload from "../config/multer.js";
import { protect } from "../middleware/auth.middleware.js";
import {
  getMyProfile,
  updateProfile,
} from "../controllers/profile.controller.js";

const router = express.Router();

/* ================= GET MY PROFILE ================= */
router.get("/me", protect, getMyProfile);

/* ================= UPDATE PROFILE ================= */
router.put(
  "/update",
  protect,
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "collegeIdImage", maxCount: 1 },
  ]),
  updateProfile
);

export default router;
