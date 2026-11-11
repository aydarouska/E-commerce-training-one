import api from "./axios";


//هى داله لحصول على جميع المنتجات من السيرفر و يتم استخدامها في صفحة المنتجات  و بعد ذلك يتم استخدامها في صفحة التصنيفات و 
export const getProducts = (params = {}) => api.get("/products", { params });

//هى داله لحصول على جميع التصنيفات من السيرفر و يتم استخدامها في صفحة المنتجات و 
export const getCategories = () => api.get("/categories");


export const getProductById = (id) => api.get(`/products/${id}`);

export const getFeaturedProducts = () => api.get("/products", { params: { featured: true, limit: 4 } });

export const getLatestProducts = () => api.get("/products", { params: { sort: "newest", limit: 5 } });

// getProducts({ category: "Electronics" });
// getProducts();