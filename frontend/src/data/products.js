export const fallbackImage = "https://picsum.photos/seed/fallback/800/800";

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function normalizeProduct(raw = {}) {
  const basePrice = toNumber(raw.price, 0);
  const discountPrice = raw.discount_price != null ? toNumber(raw.discount_price, basePrice) : null;
  const currentPrice = discountPrice != null && discountPrice > 0 ? discountPrice : basePrice;
  const oldPrice = discountPrice != null && basePrice > currentPrice ? basePrice : currentPrice;

  const primaryImage = raw.thumbnail || raw.image || raw.image_url || fallbackImage;
  const images = Array.isArray(raw.images) && raw.images.length ? raw.images : [primaryImage];

  return {
    id: toNumber(raw.id || raw.product_id, 0),
    title: raw.name || raw.title || "Product",
    category: raw.category_name || raw.category || "General",
    vendor: raw.store_name || raw.vendor || "BlueMart Vendor",
    price: currentPrice,
    oldPrice,
    rating: toNumber(raw.rating || raw.rating_avg, 4),
    reviews: toNumber(raw.reviews || raw.review_count, 0),
    stock: toNumber(raw.stock, 0),
    description: raw.description || "No description provided.",
    images,
    badge: raw.badge || "Featured",
    brand: raw.brand || "BlueMart",
    sku: raw.sku || `BM-${toNumber(raw.id || raw.product_id, 0) || "NA"}`,
    specifications: {
      Category: raw.category_name || raw.category || "General",
      Brand: raw.brand || "BlueMart",
      Stock: toNumber(raw.stock, 0) > 0 ? "In Stock" : "Out of Stock",
    },
  };
}

export function normalizeProducts(items = []) {
  return (items || []).map((item) => normalizeProduct(item)).filter((item) => item.id > 0);
}

export function getProductById(list = [], id) {
  return (list || []).find((item) => Number(item.id) === Number(id)) || null;
}

export function getProductCategories(products = []) {
  return [...new Set((products || []).map((item) => item.category).filter(Boolean))];
}

export function getProductBrands(products = []) {
  return [...new Set((products || []).map((item) => item.brand).filter(Boolean))];
}
