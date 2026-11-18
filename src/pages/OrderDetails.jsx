import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import * as ordersApi from "../api/orders";
import * as paymentsApi from "../api/payments";
import { getErrorMessage } from "../api/errors";
import { toastError, toastSuccess, confirmDialog } from "../utils/toast";
import { resolveProductImage } from "../utils/image";
import { isOnlineMethod } from "../components/paymentMethods";
import useI18n from "../hooks/useI18n";
import Spinner from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";
import TransferInstructions from "../components/TransferInstructions";
import Icon from "../components/Icon";

// صفحه تفاصيل طلب واحد: الحاله + المنتجات + العنوان + الدفع (رفع ايصال او الدفع اونلاين)
export default function OrderDetails() {
  const { id } = useParams();
  // ?new=1 معناها الطلب لسه متعمل حالا (نعرض رساله شكر)
  const [searchParams] = useSearchParams();
  const isNew = searchParams.get("new") === "1";
  const { t, tr, price, date } = useI18n();

  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  // ملف الايصال اللى العميل اختاره + رقم العمليه
  const [file, setFile] = useState(null);
  const [reference, setReference] = useState("");
  // حاله ارسال الايصال / الدفع
  const [busy, setBusy] = useState(false);
  // رابط مؤقت لعرض صوره الايصال المرفوع
  const [receiptUrl, setReceiptUrl] = useState("");

  // جلب الطلب من السيرفر
  const load = useCallback(async () => {
    try {
      const res = await ordersApi.getOrder(id);
      setOrder(res.data.data.order);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // لما نخرج من الصفحه نمسح رابط صوره الايصال من الذاكره
  useEffect(() => () => receiptUrl && URL.revokeObjectURL(receiptUrl), [receiptUrl]);

  if (error) return <div className="container py-5"><div className="alert alert-danger">{error}</div></div>;
  if (!order) return <Spinner />;

  const online = isOnlineMethod(order.paymentMethod);
  const isClosed = order.orderStatus === "cancelled" || order.paymentStatus === "paid";
  // نعرض بيانات التحويل و رفع الايصال لو التحويل يدوى و الطلب لسه ماتدفعش
  const showTransfer = !online && !isClosed;
  // نعرض زرار "ادفع الآن" لو الدفع اونلاين و ماتدفعش (او فشل)
  const showPayNow = online && !isClosed && ["unpaid", "failed"].includes(order.paymentStatus);
  // العميل يقدر يلغى الطلب لو لسه pending و ماتدفعش
  const canCancel = order.orderStatus === "pending" && order.paymentStatus !== "paid";

  // رفع صوره الايصال
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toastError(t("order.chooseFile"));
    setBusy(true);
    try {
      // FormData عشان نبعت ملف
      const data = new FormData();
      data.append("receipt", file);
      data.append("transferReference", reference);
      const res = await ordersApi.uploadReceipt(order.id, data);
      setOrder(res.data.data.order);
      setFile(null);
      toastSuccess(t("order.receiptUploaded"));
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  // الدفع اونلاين (Paymob) - بيحول المتصفح لصفحه الدفع
  const handlePayNow = async () => {
    setBusy(true);
    try {
      const res = await paymentsApi.startPaymob(order.id);
      window.location.href = res.data.data.checkoutUrl;
    } catch (err) {
      toastError(getErrorMessage(err));
      setBusy(false);
    }
  };

  // الغاء الطلب بعد التأكيد
  const handleCancel = async () => {
    const ok = await confirmDialog({
      title: t("order.cancelConfirm"),
      confirmText: t("common.yes"),
      cancelText: t("common.no"),
      danger: true,
    });
    if (!ok) return;
    try {
      const res = await ordersApi.cancelOrder(order.id);
      setOrder(res.data.data.order);
      toastSuccess(t("order.cancelled"));
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  };

  // عرض صوره الايصال (بنجيبها كـ blob لانها محتاجه التوكن)
  const showReceipt = async () => {
    try {
      const res = await ordersApi.getReceiptBlob(order.id);
      setReceiptUrl(URL.createObjectURL(res.data));
    } catch (err) {
      toastError(getErrorMessage(err));
    }
  };

  return (
    <div className="container py-4">
      {/* رساله الشكر بعد انشاء الطلب */}
      {isNew && (
        <div className="alert alert-success d-flex gap-2 align-items-center">
          <Icon name="check" /> {online ? t("order.thanks") : t("order.thanksTransfer")}
        </div>
      )}

      {/* راس الصفحه: رقم الطلب و التاريخ و الحالات */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h1 className="h4 fw-bold mb-0">{t("order.title")} <span className="ltr-text">{order.orderNumber}</span></h1>
          <small className="text-secondary">{date(order.createdAt)}</small>
        </div>
        <div className="d-flex gap-2">
          <StatusBadge status={order.orderStatus} type="order" />
          <StatusBadge status={order.paymentStatus} type="payment" />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-7 d-grid gap-4">
          {/* قسم الدفع: تعليمات التحويل + رفع الايصال */}
          {showTransfer && (
            <>
              {order.paymentStatus === "under_review" && (
                <div className="alert alert-info mb-0"><Icon name="receipt" /> {t("order.underReview")}</div>
              )}
              <TransferInstructions method={order.paymentMethod} amount={order.totalPrice} orderNumber={order.orderNumber} />
              <form className="card" onSubmit={handleUpload}>
                <div className="card-body">
                  <h3 className="h6 fw-bold"><Icon name="upload" /> {order.hasReceipt ? t("order.replaceReceipt") : t("order.uploadReceipt")}</h3>
                  <input type="file" accept="image/*" className="form-control mb-2" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  <input type="text" className="form-control mb-2" placeholder={t("order.referencePlaceholder")} value={reference} onChange={(e) => setReference(e.target.value)} />
                  <button type="submit" className="btn btn-primary" disabled={busy}>
                    {busy ? <span className="spinner-border spinner-border-sm" /> : t("order.sendReceipt")}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* زرار الدفع اونلاين */}
          {showPayNow && (
            <div className="card border-warning">
              <div className="card-body d-flex flex-wrap justify-content-between align-items-center gap-2">
                <span>{order.paymentStatus === "failed" ? t("order.paymentFailed") : t("order.notPaidYet")}</span>
                <button type="button" className="btn btn-accent" onClick={handlePayNow} disabled={busy}>
                  {busy ? <span className="spinner-border spinner-border-sm" /> : t("order.payNow", { amount: price(order.totalPrice, { currency: "EGP" }) })}
                </button>
              </div>
            </div>
          )}

          {/* المنتجات */}
          <div className="card">
            <div className="card-body">
              <h2 className="h6 fw-bold mb-3">{t("order.items")}</h2>
              <ul className="list-unstyled d-grid gap-3 mb-0">
                {order.items.map((item, i) => (
                  <li key={i} className="d-flex gap-3 align-items-center">
                    <img src={resolveProductImage(item.image)} alt="" className="rounded tw:h-14 tw:w-14 tw:object-cover" />
                    <div className="flex-grow-1">
                      <div className="fw-semibold">{tr(item, "name")}</div>
                      <div className="small text-secondary">{price(item.price)} × {item.quantity}</div>
                    </div>
                    <span className="fw-semibold">{price(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="col-lg-5 d-grid gap-4 align-content-start">
          {/* الاجماليات */}
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between mb-1"><span>{t("cart.subtotal")}</span><span>{price(order.itemsPrice)}</span></div>
              <div className="d-flex justify-content-between mb-1"><span>{t("cart.shipping")}</span><span>{order.shippingPrice ? price(order.shippingPrice) : t("cart.free")}</span></div>
              <hr />
              <div className="d-flex justify-content-between fw-bold fs-5"><span>{t("cart.total")}</span><span className="price">{price(order.totalPrice)}</span></div>
              <div className="small text-secondary mt-2">{t("order.method")}: {t(`pay.${order.paymentMethod}`)}</div>
              {/* زرار عرض الايصال لو فيه ايصال مرفوع */}
              {order.hasReceipt && (
                <button type="button" className="btn btn-sm btn-outline-primary mt-2" onClick={showReceipt}>
                  <Icon name="eye" size={16} /> {t("order.viewReceipt")}
                </button>
              )}
              {receiptUrl && <img src={receiptUrl} alt="receipt" className="img-fluid rounded border mt-2" />}
            </div>
          </div>

          {/* عنوان الشحن */}
          <div className="card">
            <div className="card-body">
              <h2 className="h6 fw-bold">{t("checkout.shipping")}</h2>
              <p className="mb-1">{order.shippingAddress.fullName}</p>
              <p className="mb-1 ltr-text">{order.shippingAddress.phone}</p>
              <p className="mb-1">{order.shippingAddress.city} - {order.shippingAddress.address}</p>
              {order.shippingAddress.notes && <p className="small text-secondary mb-0">{order.shippingAddress.notes}</p>}
            </div>
          </div>

          {/* ملاحظه من الادمن لو موجوده */}
          {order.adminNote && <div className="alert alert-secondary mb-0">{t("order.adminNote")}: {order.adminNote}</div>}

          <div className="d-flex gap-2">
            <Link to="/orders" className="btn btn-light flex-grow-1">{t("order.backToOrders")}</Link>
            {canCancel && (
              <button type="button" className="btn btn-outline-danger" onClick={handleCancel}>{t("order.cancel")}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
