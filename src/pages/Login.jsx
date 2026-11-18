import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginUser, clearError } from "../store/authSlice";
import useI18n from "../hooks/useI18n";
import AuthLayout from "./AuthLayout";

// صفحه تسجيل الدخول
export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const { user, status, error } = useSelector((state) => state.auth);
  // بيانات الفورم
  const [form, setForm] = useState({ email: "", password: "" });
  // الصفحه اللى المستخدم كان رايحلها قبل ما نحوله لتسجيل الدخول
  const from = location.state?.from || "/";

  // اول ما يسجل دخول بنجاح نرجعه للصفحه اللى كان رايحلها
  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, from, navigate]);

  // نمسح اى خطأ قديم لما الصفحه تفتح
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ارسال الفورم
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(form));
  };

  return (
    <AuthLayout title={t("auth.loginTitle")} subtitle={t("auth.loginSubtitle")}>
      {/* رساله الخطأ (ايميل او باسورد غلط) */}
      {error && <div className="alert alert-danger py-2">{error === "NETWORK_ERROR" ? t("error.network") : error}</div>}
      <form onSubmit={handleSubmit} className="d-grid gap-3">
        <div>
          <label className="form-label" htmlFor="email">{t("auth.email")}</label>
          <input id="email" name="email" type="email" dir="ltr" required className="form-control" value={form.email} onChange={handleChange} autoComplete="email" />
        </div>
        <div>
          <label className="form-label" htmlFor="password">{t("auth.password")}</label>
          <input id="password" name="password" type="password" dir="ltr" required className="form-control" value={form.password} onChange={handleChange} autoComplete="current-password" />
        </div>
        <button type="submit" className="btn btn-primary btn-lg" disabled={status === "loading"}>
          {status === "loading" ? <span className="spinner-border spinner-border-sm" /> : t("nav.login")}
        </button>
      </form>
      <p className="text-center mt-3 mb-0 small">
        {t("auth.noAccount")} <Link to="/register" state={{ from }}>{t("nav.register")}</Link>
      </p>
    </AuthLayout>
  );
}
