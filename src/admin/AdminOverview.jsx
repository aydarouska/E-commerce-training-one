import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as ordersApi from "../api/orders";
import { getErrorMessage } from "../api/errors";
import useI18n from "../hooks/useI18n";
import Spinner from "../components/Spinner";
import Icon from "../components/Icon";

// الصفحه الاولى فى لوحه التحكم: ارقام سريعه عن المتجر
export default function AdminOverview() {
  const { t, price } = useI18n();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  // جلب الاحصائيات من السيرفر
  useEffect(() => {
    ordersApi
      .getStats()
      .then((res) => setStats(res.data.data))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!stats) return <Spinner />;

  // الكروت اللى هتظهر (الايراد بالجنيه دايما)
  const cards = [
    { icon: "money", label: t("admin.revenue"), value: price(stats.revenue, { currency: "EGP" }) },
    { icon: "box", label: t("admin.totalOrders"), value: stats.orders },
    { icon: "bag", label: t("admin.products"), value: stats.products },
    { icon: "users", label: t("admin.users"), value: stats.users },
  ];

  return (
    <>
      <h1 className="h4 fw-bold mb-3">{t("admin.overview")}</h1>
      <div className="row g-3 mb-4">
        {cards.map((c) => (
          <div className="col-6 col-xl-3" key={c.label}>
            <div className="card h-100">
              <div className="card-body">
                <div className="text-secondary small"><Icon name={c.icon} size={16} /> {c.label}</div>
                <div className="fs-4 fw-bold mt-1">{c.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* تنبيهات محتاجه تصرف من الادمن */}
      <div className="d-grid gap-2">
        {stats.awaitingReview > 0 && (
          <Link to="/admin/orders?paymentStatus=under_review" className="alert alert-info mb-0 text-decoration-none">
            <Icon name="receipt" /> {t("admin.awaitingReview", { n: stats.awaitingReview })}
          </Link>
        )}
        {stats.pending > 0 && (
          <Link to="/admin/orders" className="alert alert-secondary mb-0 text-decoration-none">
            <Icon name="truck" /> {t("admin.toShip", { n: stats.pending })}
          </Link>
        )}
        {stats.lowStock > 0 && (
          <Link to="/admin/products" className="alert alert-warning mb-0 text-decoration-none">
            <Icon name="alert" /> {t("admin.lowStock", { n: stats.lowStock })}
          </Link>
        )}
      </div>
    </>
  );
}
