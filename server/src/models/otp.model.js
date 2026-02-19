import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: String,
    otp: String,
    expiresAt: Date,
    purpose: { type: String, enum: ["register", "login"] },

    // temp fields for register
    fullName: String,
    role: String,
  },
  { timestamps: true }
);

export default mongoose.model("Otp", otpSchema);
