// طلبات الـ orders من السيرفر
import api from "./axios";

export const createOrder = (data) => api.post("/orders", data); // انشاء طلب
export const getMyOrders = () => api.get("/orders/mine"); // طلباتى
export const getOrder = (id) => api.get(`/orders/${id}`); // تفاصيل طلب
export const cancelOrder = (id) => api.patch(`/orders/${id}/cancel`); // الغاء طلب

// رفع صوره الايصال - formData فيها "receipt" (الصوره) و "transferReference" (اختيارى)
export const uploadReceipt = (id, formData) => api.post(`/orders/${id}/receipt`, formData);
// صوره الايصال كـ Blob (ملف) - لانها محتاجه التوكن فمينفعش نحط الرابط فى <img> على طول
export const getReceiptBlob = (id) => api.get(`/orders/${id}/receipt`, { responseType: "blob" });

// خاص بالادمن
export const getAllOrders = (params) => api.get("/orders", { params }); // كل الطلبات
export const updateOrder = (id, data) => api.patch(`/orders/${id}`, data); // تغيير الحاله
export const getStats = () => api.get("/orders/admin/stats"); // احصائيات
