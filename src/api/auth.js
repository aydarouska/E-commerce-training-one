// طلبات تسجيل الدخول وإنشاء الحساب وتسجيل الخروج وبيانات المستخدم الحالي
import api from "./axios";

export const register = (userData) => api.post("/auth/register", userData);
export const login = (userData) => api.post("/auth/login", userData);
export const logout = () => api.post("/auth/logout");
export const getMe = () => api.get("/auth/me");
