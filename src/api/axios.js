//هو ملف للاتصال بالسيرفر باستخدام مكتبة axios. 
// يتم إنشاء نسخة من axios مع إعدادات أساسية مثل عنوان URL الأساسي للواجهة البرمجية. كما يتم إضافة معترض للطلبات لإضافة رمز التوثيق (token) إلى رؤوس الطلبات إذا كان موجودًا في التخزين المحلي (localStorage).

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true // <-- أضف هذا السطر هنا 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;