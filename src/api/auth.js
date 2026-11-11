//هو ملف لطلب اشياء من السيرفر و الباك ايند و هو خاص بعمليات تسجيل الدخول و التسجيل كمستخدم جديد و تسجيل الخروج و استرجاع بيانات المستخدم

import api from "./axios";

// تم تعديلها لتستقبل الكائن كاملاً وعمل return للطلب
export const register = (userData) => {
   return api.post("auth/register", userData);
};

export const login = (userData) => {
   return api.post("auth/login", userData);
};

export const logout = () => {
   return api.post("auth/logout");
};

// هذه الدالة لجلب بيانات المستخدم الحالي بعد تسجيل الدخول
export const getMe = () => {
   return api.get("auth/me");
};

// تم عملها زيادة لتنشيط الصفحة لكنها غير مذكورة في المحاضرة 
export const refresh = () => {
   return api.post("auth/refresh");
};

