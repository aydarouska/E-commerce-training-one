//هو ملف للاتصال بالسيرفر باستخدام مكتبة axios.
// يتم إنشاء نسخة من axios مع إعدادات أساسية مثل عنوان URL الأساسي للواجهة البرمجية. كما يتم إضافة معترض للطلبات لإضافة رمز التوثيق (token) إلى رؤوس الطلبات إذا كان موجودًا في التخزين المحلي (localStorage).

import axios from "axios";

const api = axios.create({
  // رابط السيرفر من ملف .env (VITE_API_URL)
  baseURL: import.meta.env.VITE_API_URL,
});

// قبل اى طلب: لو فيه token نضيفه فى الـ header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // بنقول للسيرفر لغه المستخدم (ممكن نستخدمها بعدين لترجمه رسايل الاخطاء)
  config.headers["Accept-Language"] = localStorage.getItem("lang") || "ar";
  return config;
});

export default api;
