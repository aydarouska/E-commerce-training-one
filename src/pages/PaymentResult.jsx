import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import * as paymentsApi from "../api/payments";
import { getErrorMessage } from "../api/errors";
import useI18n from "../hooks/useI18n";
import Spinner from "../components/Spinner";
import Icon from "../components/Icon";

// الصفحه اللى Paymob بيرجع العميل ليها بعد الدفع
// Paymob بيضيف فى الرابط بيانات العمليه + hmac، و احنا بنبعتهم للسيرفر يتأكد منهم
export default function PaymentResult() {
  const location = useLocation();
  const { t } = useI18n();
  // حاله الصفحه: loading (بيتحقق) - paid (اتدفع) - failed (فشل) - error (خطأ)
  const [state, setState] = useState({ status: "loading", orderId: null, message: "" });
  // عشان التحقق مايتنفذش مرتين (StrictMode بيشغل الـ effect مرتين فى التطوير)
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    paymentsApi
      .verifyPaymob(location.search)
      .then((res) => {
        const { orderId, paymentStatus } = res.data.data;
        setState({ status: paymentStatus === "paid" ? "paid" : "failed", orderId, message: "" });
      })
      .catch((err) => setState({ status: "error", orderId: null, message: getErrorMessage(err) }));
  }, [location.search]);

  if (state.status === "loading") return <Spinner />;

  // الدفع نجح
  const success = state.status === "paid";
  return (
    <div className="container py-5 text-center">
      <span className={`tw:inline-flex tw:h-20 tw:w-20 tw:items-center tw:justify-center tw:rounded-full mb-3 ${success ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}>
        <Icon name={success ? "check" : "x"} size={40} />
      </span>
      <h1 className="h4 fw-bold">{success ? t("paymentResult.success") : t("paymentResult.failed")}</h1>
      <p className="text-secondary">{success ? t("paymentResult.successText") : state.message || t("paymentResult.failedText")}</p>
      <div className="d-flex justify-content-center gap-2">
        {state.orderId && <Link to={`/orders/${state.orderId}`} className="btn btn-primary">{t("paymentResult.viewOrder")}</Link>}
        <Link to="/orders" className="btn btn-light">{t("nav.myOrders")}</Link>
      </div>
    </div>
  );
}
