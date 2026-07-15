import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../user/users.model.js";
import { accessCookieOptions, refreshCookieOptions } from "../../utils/cookieOptions.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const refreshTokenHandler = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No refresh token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_TOKEN);

    const user = await User.findById(decoded.userId);

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    if (!user || !user.refreshToken || user.refreshToken !== tokenHash)
      return res.status(403).json({ message: "Invalid refresh token" });

    const newAccessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_ACCESS_TOKEN,
      { expiresIn: "60m" },
    );
    const newRefreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_TOKEN,
      { expiresIn: "7d" },
    );
    user.refreshToken = crypto.createHash("sha256").update(newRefreshToken).digest("hex");
    await user.save();

    return res
      .cookie("accessToken", newAccessToken, accessCookieOptions())
      .cookie("refreshToken", newRefreshToken, refreshCookieOptions())
      .status(200)
      .json({ message: "Access token Refreshed" });
  } catch (error) {

    return res.status(401).json({ message: "Refresh token expired or invalid" });
  }
});
