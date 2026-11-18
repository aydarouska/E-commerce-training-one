import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { registerUser, clearError } from "../store/authSlice";
import useI18n from "../hooks/useI18n";
import AuthLayout from "./AuthLayout";

// صفحه انشاء حساب جديد
export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const { user, status, error } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  // خطأ محلى (قبل الارسال للسيرفر)
  const [localError, setLocalError] = useState("");
  const from = location.state?.from || "/";

  // بعد انشاء الحساب بنجاح المستخدم بيبقى مسجل دخول تلقائى فنحوله
  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, from, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setLocalError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // الباسورد لازم 6 حروف على الاقل (نفس شرط السيرفر)
    if (form.password.length < 6) return setLocalError(t("auth.passwordMin"));
    dispatch(registerUser(form));
  };

  const shownError = localError || (error === "NETWORK_ERROR" ? t("error.network") : error);

  return (
    <AuthLayout title={t("auth.registerTitle")} subtitle={t("auth.registerSubtitle")}>
      {shownError && <div className="alert alert-danger py-2">{shownError}</div>}
      <form onSubmit={handleSubmit} className="d-grid gap-3">
        <div>
          <label className="form-label" htmlFor="name">{t("auth.name")}</label>
          <input id="name" name="name" required className="form-control" value={form.name} onChange={handleChange} autoComplete="name" />
        </div>
        <div>
          <label className="form-label" htmlFor="email">{t("auth.email")}</label>
          <input id="email" name="email" type="email" dir="ltr" required className="form-control" value={form.email} onChange={handleChange} autoComplete="email" />
        </div>
        <div>
          <label className="form-label" htmlFor="password">{t("auth.password")}</label>
          <input id="password" name="password" type="password" dir="ltr" required className="form-control" value={form.password} onChange={handleChange} autoComplete="new-password" />
          <div className="form-text">{t("auth.passwordMin")}</div>
        </div>
        <button type="submit" className="btn btn-primary btn-lg" disabled={status === "loading"}>
          {status === "loading" ? <span className="spinner-border spinner-border-sm" /> : t("auth.createAccount")}
        </button>
      </form>
      <p className="text-center mt-3 mb-0 small">
        {t("auth.haveAccount")} <Link to="/login" state={{ from }}>{t("nav.login")}</Link>
      </p>
    </AuthLayout>
  );
}
