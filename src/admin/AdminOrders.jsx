import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import * as ordersApi from "../api/orders";
import { getErrorMessage } from "../api/errors";
import { toastError, toastSuccess } from "../utils/toast";
import { resolveProductImage } from "../utils/image";
import { isOnlineMethod } from "../components/paymentMethods";
import useI18n from "../hooks/useI18n";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import Spinner from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";
import Icon from "../components/Icon";

// كل حالات الطلب و الدفع (لازم تكون نفس اللى فى الباك اند)
const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["unpaid", "under_review", "paid", "failed", "refunded"];

// صفحه اداره الطلبات: فلتره - عرض التفاصيل - مراجعه الايصال - تغيير الحاله
export default function AdminOrders() {
  const { t, tr, price, date } = useI18n();
  // الفلاتر محفوظه فى الرابط (عشان لينك "ايصالات محتاجه مراجعه" من الصفحه الرئيسيه يشتغل)
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get("status") || "";
  const paymentStatus = searchParams.get("paymentStatus") || "";
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [data, setData] = useState({ orders: [], totalPages: 1 });
  const [loading, setLoading] = useState(true);
  // الطلب المفتوح فى النافذه
  const [selected, setSelected] = useState(null);
  // صوره الايصال للطلب المفتوح
  const [receiptUrl, setReceiptUrl] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  // جلب الطلبات حسب الفلاتر
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ordersApi.getAllOrders({ status, paymentStatus, page, search });
      setData(res.data.data);
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [status, paymentStatus, page, search]);

  useEffect(() => {
    load();
  }, [load]);

  // تغيير فلتر فى الرابط
  const setFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
    setPage(1);
  };

  // فتح تفاصيل طلب - و لو فيه ايصال نجيب صورته
  const openOrder = async (order) => {
    setSelected(order);
    setNote(order.adminNote || "");
    if (receiptUrl) URL.revokeObjectURL(receiptUrl);
    setReceiptUrl("");
    if (order.hasReceipt) {
      try {
        const res = await ordersApi.getReceiptBlob(order.id);
        setReceiptUrl(URL.createObjectURL(res.data));
      } catch {
        /* الصوره مش موجوده */
      }
    }
  };

  // تحديث الطلب (حاله الطلب / حاله الدفع / ملاحظه)
  const update = async (changes) => {
    setSaving(true);
    try {
      const res = await ordersApi.updateOrder(selected.id, changes);
      const updated = res.data.data.order;
      setSelected(updated);
      // نحدث الطلب فى الجدول من غير ما نعيد التحميل
      setData((d) => ({ ...d, orders: d.orders.map((o) => (o.id === updated.id ? updated : o)) }));
      toastSuccess(t("admin.saved"));
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <h1 className="h4 fw-bold mb-3">{t("admin.orders")}</h1>

      {/* الفلاتر */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        <input type="search" className="form-control form-control-sm tw:w-48" placeholder={t("admin.searchOrder")} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        <select className="form-select form-select-sm tw:w-auto" value={status} onChange={(e) => setFilter("status", e.target.value)}>
          <option value="">{t("admin.allOrderStatuses")}</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{t(`orderStatus.${s}`)}</option>)}
        </select>
        <select className="form-select form-select-sm tw:w-auto" value={paymentStatus} onChange={(e) => setFilter("paymentStatus", e.target.value)}>
          <option value="">{t("admin.allPaymentStatuses")}</option>
          {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{t(`paymentStatus.${s}`)}</option>)}
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>{t("admin.orderNo")}</th>
                  <th>{t("admin.customer")}</th>
                  <th>{t("admin.total")}</th>
                  <th>{t("order.method")}</th>
                  <th>{t("admin.status")}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data.orders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <div className="fw-semibold ltr-text">{o.orderNumber}</div>
                      <small className="text-secondary">{date(o.createdAt)}</small>
                    </td>
                    <td>{o.user?.name || o.shippingAddress.fullName}</td>
                    <td>{price(o.totalPrice, { currency: "EGP" })}</td>
                    <td className="small">{t(`pay.${o.paymentMethod}`)}</td>
                    <td>
                      <div className="d-flex flex-column gap-1 align-items-start">
                        <StatusBadge status={o.orderStatus} type="order" />
                        <StatusBadge status={o.paymentStatus} type="payment" />
                      </div>
                    </td>
                    <td className="text-end">
                      <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => openOrder(o)}>
                        <Icon name="eye" size={16} /> {t("admin.details")}
                      </button>
                    </td>
                  </tr>
                ))}
                {data.orders.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-secondary py-4">{t("admin.noOrders")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />

      {/* نافذه تفاصيل الطلب */}
      <Modal show={Boolean(selected)} onClose={() => setSelected(null)} title={selected ? `${t("order.title")} ${selected.orderNumber}` : ""} size="xl">
        {selected && (
          <div className="row g-4">
            <div className="col-lg-7">
              {/* المنتجات */}
              <ul className="list-unstyled d-grid gap-2">
                {selected.items.map((item, i) => (
                  <li key={i} className="d-flex gap-2 align-items-center">
                    <img src={resolveProductImage(item.image)} alt="" className="rounded tw:h-12 tw:w-12 tw:object-cover" />
                    <span className="flex-grow-1">{tr(item, "name")} × {item.quantity}</span>
                    <span>{price(item.price * item.quantity, { currency: "EGP" })}</span>
                  </li>
                ))}
              </ul>
              <hr />
              <div className="d-flex justify-content-between"><span>{t("cart.shipping")}</span><span>{price(selected.shippingPrice, { currency: "EGP" })}</span></div>
              <div className="d-flex justify-content-between fw-bold fs-5"><span>{t("cart.total")}</span><span>{price(selected.totalPrice, { currency: "EGP" })}</span></div>

              {/* بيانات العميل و العنوان */}
              <div className="card bg-light border-0 mt-3">
                <div className="card-body small">
                  <div><strong>{selected.shippingAddress.fullName}</strong> — <span className="ltr-text">{selected.shippingAddress.phone}</span></div>
                  <div>{selected.shippingAddress.city} - {selected.shippingAddress.address}</div>
                  {selected.shippingAddress.notes && <div className="text-secondary">{selected.shippingAddress.notes}</div>}
                  {selected.user?.email && <div className="text-secondary">{selected.user.email}</div>}
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              {/* طريقه الدفع و الايصال */}
              <div className="mb-3">
                <div className="small text-secondary">{t("order.method")}</div>
                <div className="fw-semibold">{t(`pay.${selected.paymentMethod}`)}</div>
                {isOnlineMethod(selected.paymentMethod) && selected.paymob?.transactionId && (
                  <div className="small text-secondary">Paymob #{selected.paymob.transactionId}</div>
                )}
                {selected.transferReference && <div className="small">{t("admin.transferRef")}: <span className="ltr-text">{selected.transferReference}</span></div>}
              </div>
              {receiptUrl && (
                <a href={receiptUrl} target="_blank" rel="noreferrer" className="d-block mb-3">
                  <img src={receiptUrl} alt="receipt" className="img-fluid rounded border" />
                </a>
              )}

              {/* زرار سريع لتأكيد الدفع لما الايصال يكون تحت المراجعه */}
              {selected.paymentStatus === "under_review" && (
                <div className="d-flex gap-2 mb-3">
                  <button type="button" className="btn btn-success flex-grow-1" disabled={saving} onClick={() => update({ paymentStatus: "paid" })}>
                    <Icon name="check" /> {t("admin.confirmPayment")}
                  </button>
                  <button type="button" className="btn btn-outline-danger" disabled={saving} onClick={() => update({ paymentStatus: "failed" })}>
                    {t("admin.rejectPayment")}
                  </button>
                </div>
              )}

              {/* تغيير حاله الطلب و حاله الدفع */}
              <label className="form-label small">{t("admin.orderStatus")}</label>
              <select className="form-select mb-2" value={selected.orderStatus} disabled={saving || selected.orderStatus === "cancelled"} onChange={(e) => update({ orderStatus: e.target.value })}>
                {ORDER_STATUSES.map((s) => <option key={s} value={s}>{t(`orderStatus.${s}`)}</option>)}
              </select>
              <label className="form-label small">{t("admin.paymentStatus")}</label>
              <select className="form-select mb-2" value={selected.paymentStatus} disabled={saving} onChange={(e) => update({ paymentStatus: e.target.value })}>
                {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{t(`paymentStatus.${s}`)}</option>)}
              </select>

              {/* ملاحظه للعميل بتظهر فى صفحه الطلب عنده */}
              <label className="form-label small">{t("admin.noteForCustomer")}</label>
              <textarea className="form-control mb-2" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
              <button type="button" className="btn btn-primary btn-sm" disabled={saving} onClick={() => update({ adminNote: note })}>
                {t("common.save")}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
