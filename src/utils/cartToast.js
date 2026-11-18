// الملف ده قديم - سايبينه عشان لو فيه ملف لسه بيستورد منه مايحصلش خطأ
// الرسايل الجديده كلها فى utils/toast.js
import { toastError, toastSuccess } from "./toast";

export const notifyAddedToCart = (message) => toastSuccess(message);
export const notifyCartError = (message) => toastError(message);
