import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import useI18n from "../hooks/useI18n";
import Icon from "../components/Icon";

// صفحه "حسابى": بيانات المستخدم و روابط سريعه
export default function Dashboard() {
  // بيانات المستخدم من الـ redux (الصفحه محميه فالمستخدم موجود اكيد)
  const user = useSelector((state) => state.auth.user);
  const { t } = useI18n();

  return (
    <div className="container py-4" style={{ maxWidth: 720 }}>
      <h1 className="h4 fw-bold mb-3">{t("nav.account")}</h1>
      <div className="card mb-3">
        <div className="card-body d-flex gap-3 align-items-center">
          {/* اول حرف من الاسم فى دايره */}
          <span className="tw:inline-flex tw:h-14 tw:w-14 tw:items-center tw:justify-center tw:rounded-full bg-brand-soft text-brand fw-bold fs-4">
            {user.name?.[0]?.toUpperCase()}
          </span>
          <div>
            <div className="fw-bold">{user.name}</div>
            <div className="text-secondary small">{user.email}</div>
            {/* نوع الحساب: مستخدم او ادمن */}
            <span className="badge bg-light text-dark border mt-1">{t(`role.${user.role}`)}</span>
          </div>
        </div>
      </div>
      {/* روابط سريعه */}
      <div className="row g-3">
        <div className="col-sm-6">
          <Link to="/orders" className="card card-hover text-reset text-decoration-none h-100">
            <div className="card-body"><Icon name="box" /> {t("nav.myOrders")}</div>
          </Link>
        </div>
        {user.role === "admin" && (
          <div className="col-sm-6">
            <Link to="/admin" className="card card-hover text-reset text-decoration-none h-100">
              <div className="card-body"><Icon name="dashboard" /> {t("nav.admin")}</div>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
