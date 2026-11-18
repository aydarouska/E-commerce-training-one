// صور المنتجات اللى اترفعت على السيرفر بتتخزن كده: "/uploads/products/x.jpg"
// الداله دى بتحولها لرابط كامل: http://localhost:5000/uploads/products/x.jpg
// و لو الصوره رابط خارجى (https://...) بتسيبه زى ما هو

// رابط السيرفر من غير /api فى الاخر
const SERVER_ORIGIN = (import.meta.env.VITE_API_URL || "").replace(/\/api\/?$/, "");

export const resolveProductImage = (path) => {
  // لو مفيش صوره نعرض صوره افتراضيه
  if (!path) return "https://placehold.co/600x600?text=No+Image";
  return /^https?:\/\//.test(path) ? path : `${SERVER_ORIGIN}${path}`;
};
