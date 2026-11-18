import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as ordersApi from "../api/orders";
import { getErrorMessage } from "../api/errors";
import useI18n from "../hooks/useI18n";
import Spinner from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";
import Icon from "../components/Icon";

// صفحه "طلباتى": كل طلبات المستخدم من الاحدث للاقدم
export default function MyOrders() {
  const { t, price, date } = useI18n();
  // null = لسه بيحمل
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");

  // جلب الطلبات اول ما الصفحه تفتح
  useEffect(() => {
    ordersApi
      .getMyOrders()
      .then((res) => setOrders(res.data.data.orders))
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  if (error) return <div className="container py-5"><div className="alert alert-danger">{error}</div></div>;
  if (!orders) return <Spinner />;

  return (
    <div className="container py-4">
      <h1 className="h4 fw-bold mb-3">{t("nav.myOrders")}</h1>

      {/* مفيش طلبات */}
      {orders.length === 0 ? (
        <div className="text-center py-5">
          <Icon name="box" size={48} className="text-secondary" />
          <p className="text-secondary mt-2">{t("orders.empty")}</p>
          <Link to="/" className="btn btn-primary">{t("cart.continue")}</Link>
        </div>
      ) : (
        <div className="d-grid gap-3">
          {orders.map((order) => (
            // كل طلب كارت بيودى لصفحه التفاصيل
            <Link key={order.id} to={`/orders/${order.id}`} className="card card-hover text-reset text-decoration-none">
              <div className="card-body d-flex flex-wrap justify-content-between align-items-center gap-2">
                <div>
                  <div className="fw-bold ltr-text">{order.orderNumber}</div>
                  <small className="text-secondary">
                    {date(order.createdAt)} · {t("orders.itemsCount", { n: order.items.reduce((s, i) => s + i.quantity, 0) })}
                  </small>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <StatusBadge status={order.orderStatus} type="order" />
                  <StatusBadge status={order.paymentStatus} type="payment" />
                  <span className="price">{price(order.totalPrice)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
