import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Spinner from "./Spinner";

// بيحمى الصفحات اللى محتاجه تسجيل دخول (السله - الدفع - طلباتى ...)
// adminOnly = true معناها الصفحه للادمن بس (لوحه التحكم)
export default function ProtectedRoute({ adminOnly = false }) {
  const { user, initializing } = useSelector((state) => state.auth);
  const location = useLocation();

  // لسه بنتأكد من التوكن المحفوظ - نستنى و نعرض لودر
  if (initializing) return <Spinner />;

  // مش مسجل دخول: نوديه لصفحه الدخول و نفتكر هو كان رايح فين عشان نرجعه بعدها
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;

  // مسجل بس مش ادمن و الصفحه للادمن بس: نرجعه للرئيسيه
  if (adminOnly && user.role !== "admin") return <Navigate to="/" replace />;

  // كل حاجه تمام: نعرض الصفحه المطلوبه
  return <Outlet />;
}
