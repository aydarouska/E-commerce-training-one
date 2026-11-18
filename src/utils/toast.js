import Swal from "sweetalert2";

// رسايل صغيره (toast) بتظهر فوق فى الركن و تختفى لوحدها بعد ثانيتين
const base = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2200,
  timerProgressBar: true,
  // لما الماوس يقف على الرساله التايمر يقف
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

// رساله نجاح (خضرا)
export const toastSuccess = (title) => base.fire({ icon: "success", title });
// رساله خطأ (حمرا)
export const toastError = (title) => base.fire({ icon: "error", title });

// نافذه تأكيد (متأكد؟ نعم / لا) - بترجع true لو المستخدم وافق
// danger = true بتخلى الزرار احمر (للحذف و الالغاء)
export const confirmDialog = async ({ title, text, confirmText, cancelText, danger }) => {
  const result = await Swal.fire({
    title,
    text,
    icon: danger ? "warning" : "question",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: danger ? "#dc2626" : "#4F46E5",
  });
  return result.isConfirmed;
};
