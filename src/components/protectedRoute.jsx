import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

// هذا يقوم بتحديد اذا كان المستخدم مسجل الدخول او لا وده بيتم عن طريق ال user state وده بيتم عن طريق ال extraReducers في authSlice.js
export default function ProtectedRoute() {
  const { user, initializing } = useSelector((state) => state.auth);
// هذه الحاله لاشرطيه يقوم بفحص اذا كان هناك token موجود فى localStorage وده بيتم عن طريق ال initializing state وده بيتم عن طريق ال extraReducers في authSlice.js 
  if (initializing) return null;
// هذه يكون اذا كان المستخدم مسجل الدخول يتم تحويله الى الصفحة الرئيسية واذا لم يكن مسجل الدخول يتم تحويله الى صفحة تسجيل الدخول وده بيتم عن طريق ال Navigate وده بيتم عن طريق ال Outlet
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
