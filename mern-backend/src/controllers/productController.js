import { Product } from "../models/Product.js";
import { Category } from "../models/Category.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listProducts = asyncHandler(async (req, res) => {
  const { q, category, brand, minPrice, maxPrice, sort = "latest" } = req.query;
  const query = { status: "approved" };

  if (q) query.title = { $regex: q, $options: "i" };
  if (category) query.category = category;
  if (brand) query.brand = { $regex: brand, $options: "i" };
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const sortMap = {
    latest: { createdAt: -1 },
    priceLow: { price: 1 },
    priceHigh: { price: -1 },
    topRated: { ratingAvg: -1 },
  };

  const products = await Product.find(query)
    .populate("category", "name slug")
    .populate("sellerId", "name vendorProfile.storeName")
    .sort(sortMap[sort] || sortMap.latest);

  res.json({ products });
});

export const createProduct = asyncHandler(async (req, res) => {
  const { title, slug, description, price, category, stock = 0, images = [] } = req.body;
  if (!title || !slug || !description || !price || !category) {
    throw new ApiError(400, "Missing required fields");
  }

  const categoryExists = await Category.findById(category);
  if (!categoryExists) throw new ApiError(400, "Invalid category");

  const isAdmin = req.user.role === "admin";
  const isVendor = req.user.role === "vendor";
  if (!isAdmin && !isVendor) throw new ApiError(403, "Only admin or vendor can create product");

  const status = isAdmin || env.autoApproveVendorProducts ? "approved" : "pending";

  const product = await Product.create({
    title,
    slug,
    description,
    price: Number(price),
    stock: Number(stock),
    images,
    category,
    brand: req.body.brand || "",
    sellerType: isAdmin ? "admin" : "vendor",
    sellerId: req.user._id,
    status,
  });

  const io = req.app.get("io");
  io.emit("product:changed", { action: "created", productId: product._id, status: product.status });

  res.status(201).json({ product });
});

export const approveProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  product.status = "approved";
  await product.save();

  const io = req.app.get("io");
  io.emit("product:changed", { action: "approved", productId: product._id, status: "approved" });

  res.json({ product });
});
