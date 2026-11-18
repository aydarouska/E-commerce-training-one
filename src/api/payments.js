// طلبات الدفع (Paymob)
import api from "./axios";

// بيرجع { checkoutUrl } - بنحول المتصفح للرابط ده عشان العميل يدفع
export const startPaymob = (orderId) => api.post(`/payments/paymob/${orderId}`);

// بيبعت للسيرفر البيانات اللى Paymob حطها فى رابط صفحه /payment/result
// عشان السيرفر يتأكد منها و يحدث حاله الطلب
export const verifyPaymob = (queryString) => api.get(`/payments/paymob/verify${queryString}`);
