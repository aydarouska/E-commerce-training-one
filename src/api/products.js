// طلبات المنتجات من السيرفر
import api from "./axios";

// كل المنتجات - params ممكن يكون فيها: { search, category, sort, page, limit, minPrice, maxPrice, featured }
export const getProducts = (params = {}) => api.get("/products", { params });
// التصنيفات بالعربى و الانجليزى
export const getCategories = () => api.get("/products/categories/list");
// منتج واحد بالـ id
export const getProductById = (id) => api.get(`/products/${id}`);
// المنتجات المميزه (اول 8)
export const getFeaturedProducts = () =>
  api.get("/products", { params: { featured: true, limit: 8 } });

// خاص بالادمن - data عباره عن FormData عشان نقدر نرفع صور
export const createProduct = (data) => api.post("/products", data); // اضافه
export const updateProduct = (id, data) => api.put(`/products/${id}`, data); // تعديل
export const deleteProduct = (id) => api.delete(`/products/${id}`); // حذف
