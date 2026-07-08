import User from "../user/users.model.js";
import {
  accessCookieOptions,
  clearAuthCookieOptions,
  refreshCookieOptions,
} from "../../utils/cookieOptions.js";

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Profile from "../user/profile.model.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const signupHandler = asyncHandler(async (req, res) => {
  const { name, username, email, password, confirmPassword } = req.body;

  const normalizedEmail = String(email || "").toLowerCase().trim();
  const normalizedUsername = String(username || "").toLowerCase().trim();

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

    const accessToken = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_ACCESS_TOKEN,
      { expiresIn: "60m" },
    );
    const refreshToken = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_REFRESH_TOKEN,
      { expiresIn: "7d" },
    );

    newUser.refreshToken = refreshToken;

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
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) return res.status(400).json({ message: "User doesn't exist" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Wrong password" });

  const accessToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_ACCESS_TOKEN,
    { expiresIn: "60m" },
  );
  const refreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_REFRESH_TOKEN,
    { expiresIn: "7d" },
  );

  user.refreshToken = refreshToken;
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
    const user = await User.findOne({ refreshToken });

    if (user) {
      user.refreshToken = null;
      await user.save();
    }
  }

  return res
    .clearCookie("accessToken", clearAuthCookieOptions())
    .clearCookie("refreshToken", clearAuthCookieOptions())
    .clearCookie("csrfToken", clearAuthCookieOptions())
    .status(200)
    .json({ message: "Log out successful" });
});
