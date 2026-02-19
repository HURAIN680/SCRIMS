import User from "../models/user.model.js";
import Otp from "../models/otp.model.js";
import jwt from "jsonwebtoken";
import { generateOtp } from "../utils/generateotp.js";

/* ================= REGISTER ================= */

// SEND OTP FOR REGISTER
export const sendRegisterOtp = async (req, res) => {
  try {
    let { fullName, email, role } = req.body;

    if (!fullName || !email || !role)
      return res.status(400).json({ message: "fullName, email and role are required" });

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser)
      return res.status(400).json({ message: "User already exists. Please login." });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.findOneAndUpdate(
      { email: normalizedEmail, purpose: "register" },
      { otp, expiresAt, fullName, role },
      { upsert: true, new: true }
    );

    console.log("REGISTER OTP:", otp);

    res.json({ message: "OTP sent for registration" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// VERIFY REGISTER OTP
export const verifyRegisterOtp = async (req, res) => {
  try {
    let { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP are required" });

    const normalizedEmail = email.trim().toLowerCase();

    const otpRecord = await Otp.findOne({ email: normalizedEmail, purpose: "register" });
    if (!otpRecord) return res.status(400).json({ message: "OTP not found" });

    if (otpRecord.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (otpRecord.expiresAt < new Date())
      return res.status(400).json({ message: "OTP expired" });

    const user = await User.create({
      fullName: otpRecord.fullName,
      email: normalizedEmail,
      role: otpRecord.role,
    });

    await Otp.deleteOne({ email: normalizedEmail, purpose: "register" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Registered & logged in",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= LOGIN ================= */

// SEND OTP FOR LOGIN
export const sendLoginOtp = async (req, res) => {
  try {
    let { email } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ message: "User not found. Please register." });

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.findOneAndUpdate(
      { email: normalizedEmail, purpose: "login" },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    console.log("LOGIN OTP:", otp);

    res.json({ message: "OTP sent for login" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// VERIFY LOGIN OTP
export const verifyLoginOtp = async (req, res) => {
  try {
    let { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP are required" });

    const normalizedEmail = email.trim().toLowerCase();

    const otpRecord = await Otp.findOne({ email: normalizedEmail, purpose: "login" });
    if (!otpRecord) return res.status(400).json({ message: "OTP not found" });

    if (otpRecord.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (otpRecord.expiresAt < new Date())
      return res.status(400).json({ message: "OTP expired" });

    const user = await User.findOne({ email: normalizedEmail });

    await Otp.deleteOne({ email: normalizedEmail, purpose: "login" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus
      },
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
