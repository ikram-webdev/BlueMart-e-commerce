import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function signAccessToken(userId, role) {
  return jwt.sign({ sub: userId, role }, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn,
  });
}

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role = "customer", storeName } = req.body;
  if (!name || !email || !password) throw new ApiError(400, "Missing required fields");

  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(409, "Email already registered");

  const isVendor = role === "vendor";
  const user = await User.create({
    name,
    email,
    password,
    role,
    vendorProfile: isVendor
      ? {
          storeName: storeName || "",
          storeSlug: (storeName || "").toLowerCase().replace(/\s+/g, "-"),
          isApproved: false,
        }
      : undefined,
  });

  const token = signAccessToken(user._id.toString(), user.role);
  res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, "Email and password are required");

  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new ApiError(401, "Invalid credentials");

  const valid = await user.comparePassword(password);
  if (!valid) throw new ApiError(401, "Invalid credentials");

  const token = signAccessToken(user._id.toString(), user.role);
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});
