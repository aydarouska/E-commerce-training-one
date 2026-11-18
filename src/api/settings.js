// طلبات اعدادات المتجر
import api from "./axios";

export const getSettings = () => api.get("/settings"); // الاعدادات العامه (لاى حد)
export const getAdminSettings = () => api.get("/settings/admin"); // الاعدادات كامله (ادمن)
export const updateSettings = (data) => api.put("/settings", data); // تعديل (ادمن)
