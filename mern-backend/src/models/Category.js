import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    image: String,
    banner: String,
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Category = mongoose.model("Category", categorySchema);
