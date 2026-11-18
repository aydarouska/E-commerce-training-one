// طلبات اداره المستخدمين - للادمن بس
import api from "./axios";

export const getUsers = () => api.get("/users"); // كل المستخدمين
export const updateUserRole = (id, role) => api.patch(`/users/${id}/role`, { role }); // تغيير الصلاحيه
export const deleteUser = (id) => api.delete(`/users/${id}`); // حذف مستخدم
