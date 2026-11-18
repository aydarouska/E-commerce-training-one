// يستخرج رسالة الخطأ من رد السيرفر
// شكل الرد: { success: false, message: "...", errors: [{ field, message }] }
export function getErrorMessage(error) {
  const data = error?.response?.data;
  if (data?.errors?.length) return data.errors[0].message;
  if (data?.message) return data.message;
  if (error?.code === "ERR_NETWORK") return "NETWORK_ERROR";
  return "Something went wrong. Please try again later.";
}
