import User from "../user/users.model.js";
import {
  accessCookieOptions,
  clearAuthCookieOptions,
  clearCsrfCookieOptions,
  refreshCookieOptions,
} from "../../utils/cookieOptions.js";

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Profile from "../user/profile.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { asyncHandler } from "../../utils/asyncHandler.js";

const hashRefreshToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const createTokens = (userId) => ({
  accessToken: jwt.sign({ userId }, process.env.JWT_ACCESS_TOKEN, { expiresIn: "60m" }),
  refreshToken: jwt.sign({ userId }, process.env.JWT_REFRESH_TOKEN, { expiresIn: "7d" }),
});

export const signupHandler = asyncHandler(async (req, res) => {
  const { name, username, email, password, confirmPassword } = req.body;

  const normalizedEmail = String(email || "").toLowerCase().trim();
  const normalizedUsername = String(username || "").toLowerCase().trim();

  if (!name?.trim() || !normalizedEmail || !normalizedUsername || typeof password !== "string") {
    return res.status(400).json({ message: "Name, username, email, and password are required" });
  }
  if (password.length < 12 || password.length > 128) {
    return res.status(400).json({ message: "Password must be between 12 and 128 characters" });
  }
  if (!/^[a-z0-9_]{3,30}$/.test(normalizedUsername)) {
    return res.status(400).json({ message: "Username must be 3-30 lowercase letters, numbers, or underscores" });
  }

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser)
    return res
      .status(400)
      .json({ message: "User with this email already exists" });

  const existingUsername = await User.findOne({ username: normalizedUsername });

  if (existingUsername) {
    return res
      .status(400)
      .json({ message: "User with this username already exists" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const newUser = new User({
      name,
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
    });

    const { accessToken, refreshToken } = createTokens(newUser._id);

    newUser.refreshToken = hashRefreshToken(refreshToken);

    await newUser.save({ session });

    const profile = new Profile({
      userId: newUser._id,
    });

    await profile.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res
      .cookie("accessToken", accessToken, accessCookieOptions())
      .cookie("refreshToken", refreshToken, refreshCookieOptions())
      .status(201)
      .json({
        message: "User Created Successfully",
        userName: newUser.username,
      });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
});

export const loginHandler = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "All fields are required " });

  const normalizedEmail = String(email || "").toLowerCase().trim();
  if (!normalizedEmail || typeof password !== "string") {
    return res.status(400).json({ message: "All fields are required" });
  }
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) return res.status(400).json({ message: "User doesn't exist" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Wrong password" });

  const { accessToken, refreshToken } = createTokens(user._id);

  user.refreshToken = hashRefreshToken(refreshToken);
  await user.save();

  return res
    .cookie("accessToken", accessToken, accessCookieOptions())
    .cookie("refreshToken", refreshToken, refreshCookieOptions())
    .status(200)
    .json({ message: "Login Successfully" });
});

export const logoutHandler = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    let user = null;
    try {
      const { userId } = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN);
      user = await User.findById(userId);
    } catch (_) {
      // An invalid token is still cleared below.
    }

    if (user && user.refreshToken === hashRefreshToken(refreshToken)) {
      user.refreshToken = null;
      await user.save();
    }
  }

  return res
    .clearCookie("accessToken", clearAuthCookieOptions())
    .clearCookie("refreshToken", clearAuthCookieOptions())
    .clearCookie("csrfToken", clearCsrfCookieOptions())
    .status(200)
    .json({ message: "Log out successful" });
});
