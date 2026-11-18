import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { fetchCart, selectCartItems, selectCartTotal } from "../store/cartSlice";
import * as ordersApi from "../api/orders";
import * as paymentsApi from "../api/payments";
import { getErrorMessage } from "../api/errors";
import { toastError } from "../utils/toast";
import { resolveProductImage } from "../utils/image";
import { calcShipping } from "./Cart";
import { PAYMENT_METHODS, isOnlineMethod } from "../components/paymentMethods";
import useI18n from "../hooks/useI18n";
import Icon from "../components/Icon";

// المحافظات المصريه (لاختيار المدينه)
const GOVERNORATES = [
  ["القاهرة", "Cairo"], ["الجيزة", "Giza"], ["الإسكندرية", "Alexandria"], ["القليوبية", "Qalyubia"],
  ["الشرقية", "Sharqia"], ["الدقهلية", "Dakahlia"], ["الغربية", "Gharbia"], ["المنوفية", "Monufia"],
  ["البحيرة", "Beheira"], ["كفر الشيخ", "Kafr El Sheikh"], ["دمياط", "Damietta"], ["بورسعيد", "Port Said"],
  ["الإسماعيلية", "Ismailia"], ["السويس", "Suez"], ["الفيوم", "Faiyum"], ["بني سويف", "Beni Suef"],
  ["المنيا", "Minya"], ["أسيوط", "Asyut"], ["سوهاج", "Sohag"], ["قنا", "Qena"], ["الأقصر", "Luxor"],
  ["أسوان", "Aswan"], ["البحر الأحمر", "Red Sea"], ["الوادي الجديد", "New Valley"], ["مطروح", "Matrouh"],
  ["شمال سيناء", "North Sinai"], ["جنوب سيناء", "South Sinai"],
];

// صفحه اتمام الطلب: بيانات الشحن + اختيار طريقه الدفع + ملخص الطلب
export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, tr, price, lang, currency } = useI18n();
  const user = useSelector((state) => state.auth.user);
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartTotal);
  const settings = useSelector((state) => state.settings.data);

  // بيانات فورم الشحن (الاسم بيتملى تلقائى من حساب المستخدم)
  const [form, setForm] = useState({ fullName: user?.name || "", phone: "", city: "", address: "", notes: "" });
  // طريقه الدفع المختاره
  const [method, setMethod] = useState("");
  // اخطاء الفورم و حاله الارسال
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // طرق الدفع اللى الادمن فعلها بس
  const availableMethods = PAYMENT_METHODS.filter((m) => settings?.payments?.[m.key]?.enabled);

  // نختار اول طريقه متاحه تلقائى
  useEffect(() => {
    if (!method && availableMethods.length) setMethod(availableMethods[0].key);
  }, [availableMethods, method]);

  // لو السله فاضيه نرجعه للسله
  useEffect(() => {
    if (!submitting && items.length === 0) navigate("/cart", { replace: true });
  }, [items.length, navigate, submitting]);

  const shipping = calcShipping(subtotal, settings);
  const total = subtotal + shipping;

  // تحديث اى حقل فى الفورم و مسح الخطأ بتاعه
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // التحقق من البيانات قبل الارسال
  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = t("checkout.required");
    // رقم موبايل مصرى: 010 / 011 / 012 / 015 و بعدهم 8 ارقام
    if (!/^(\+?20)?0?1[0125][0-9]{8}$/.test(form.phone.trim())) next.phone = t("checkout.invalidPhone");
    if (!form.city) next.city = t("checkout.required");
    if (!form.address.trim()) next.address = t("checkout.required");
    if (!method) next.method = t("checkout.chooseMethod");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // ارسال الطلب
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      // 1- انشاء الطلب فى السيرفر (السيرفر بيحسب الاسعار بنفسه و بيفضى السله)
      const res = await ordersApi.createOrder({ shippingAddress: form, paymentMethod: method });
      const order = res.data.data.order;
      // نحدث السله فى المتصفح (بقت فاضيه)
      dispatch(fetchCart());

      // 2- لو الدفع اونلاين (كارت / فودافون كاش) نروح لصفحه Paymob
      if (isOnlineMethod(method)) {
        try {
          const pay = await paymentsApi.startPaymob(order.id);
          window.location.href = pay.data.data.checkoutUrl;
          return;
        } catch (err) {
          // لو Paymob فشل الطلب لسه موجود و يقدر يدفع تانى من صفحه الطلب
          toastError(getErrorMessage(err));
        }
      }
      // 3- تحويل يدوى (انستاباى / بنك): نروح لصفحه الطلب عشان يشوف بيانات التحويل و يرفع الايصال
      navigate(`/orders/${order.id}?new=1`, { replace: true });
    } catch (err) {
      toastError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  // كلاس الحقل: احمر لو فيه خطأ
  const fieldClass = (name) => `form-control ${errors[name] ? "is-invalid" : ""}`;

  return (
    <div className="container py-4">
      <h1 className="h4 fw-bold mb-3">{t("checkout.title")}</h1>
      <form className="row g-4" onSubmit={handleSubmit} noValidate>
        <div className="col-lg-7">
          {/* بيانات الشحن */}
          <div className="card mb-4">
            <div className="card-body">
              <h2 className="h5 fw-bold mb-3"><Icon name="truck" /> {t("checkout.shipping")}</h2>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="fullName">{t("checkout.fullName")}</label>
                  <input id="fullName" name="fullName" className={fieldClass("fullName")} value={form.fullName} onChange={handleChange} autoComplete="name" />
                  <div className="invalid-feedback">{errors.fullName}</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="phone">{t("checkout.phone")}</label>
                  <input id="phone" name="phone" dir="ltr" inputMode="tel" placeholder="01xxxxxxxxx" className={fieldClass("phone")} value={form.phone} onChange={handleChange} autoComplete="tel" />
                  <div className="invalid-feedback">{errors.phone}</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="city">{t("checkout.city")}</label>
                  <select id="city" name="city" className={`form-select ${errors.city ? "is-invalid" : ""}`} value={form.city} onChange={handleChange}>
                    <option value="">{t("checkout.chooseCity")}</option>
                    {GOVERNORATES.map(([ar, en]) => (
                      <option key={en} value={ar}>{lang === "ar" ? ar : en}</option>
                    ))}
                  </select>
                  <div className="invalid-feedback">{errors.city}</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="address">{t("checkout.address")}</label>
                  <input id="address" name="address" placeholder={t("checkout.addressPlaceholder")} className={fieldClass("address")} value={form.address} onChange={handleChange} autoComplete="street-address" />
                  <div className="invalid-feedback">{errors.address}</div>
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="notes">{t("checkout.notes")}</label>
                  <textarea id="notes" name="notes" rows={2} className="form-control" value={form.notes} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>

          {/* طرق الدفع */}
          <div className="card">
            <div className="card-body">
              <h2 className="h5 fw-bold mb-3"><Icon name="money" /> {t("checkout.payment")}</h2>
              {availableMethods.length === 0 && <div className="alert alert-warning mb-0">{t("checkout.noMethods")}</div>}
              <div className="d-grid gap-2">
                {availableMethods.map((m) => (
                  // كل طريقه دفع كارت قابل للاختيار
                  <label key={m.key} className={`pay-option p-3 d-flex gap-3 align-items-center ${method === m.key ? "selected" : ""}`}>
                    <input type="radio" name="method" className="form-check-input mt-0" checked={method === m.key} onChange={() => { setMethod(m.key); setErrors({ ...errors, method: "" }); }} />
                    <span className="tw:inline-flex tw:h-10 tw:w-10 tw:items-center tw:justify-center tw:rounded-lg bg-white border text-brand">
                      <Icon name={m.icon} />
                    </span>
                    <span className="flex-grow-1">
                      <span className="d-block fw-semibold">{t(`pay.${m.key}`)}</span>
                      <span className="d-block small text-secondary">{t(`pay.${m.key}.desc`)}</span>
                    </span>
                    {/* شاره توضح لو التأكيد فورى ولا محتاج مراجعه */}
                    <span className={`badge ${m.online ? "bg-success" : "bg-info text-dark"}`}>
                      {m.online ? t("pay.instant") : t("pay.manual")}
                    </span>
                  </label>
                ))}
              </div>
              {errors.method && <div className="text-danger small mt-2">{errors.method}</div>}
            </div>
          </div>
        </div>

        {/* ملخص الطلب */}
        <div className="col-lg-5">
          <div className="card tw:sticky tw:top-24">
            <div className="card-body">
              <h2 className="h5 fw-bold mb-3">{t("cart.summary")}</h2>
              <ul className="list-unstyled mb-3 d-grid gap-2">
                {items.map(({ product, quantity, subtotal: line }) => (
                  <li key={product.id} className="d-flex gap-2 align-items-center">
                    <img src={resolveProductImage(product.image)} alt="" className="rounded tw:h-12 tw:w-12 tw:object-cover" />
                    <span className="flex-grow-1 small">{tr(product, "name")} × {quantity}</span>
                    <span className="small fw-semibold">{price(line)}</span>
                  </li>
                ))}
              </ul>
              <div className="d-flex justify-content-between mb-1"><span>{t("cart.subtotal")}</span><span>{price(subtotal)}</span></div>
              <div className="d-flex justify-content-between mb-1">
                <span>{t("cart.shipping")}</span>
                <span>{shipping === 0 ? t("cart.free") : price(shipping)}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between fw-bold fs-5">
                <span>{t("cart.total")}</span>
                <span className="price">{price(total)}</span>
              </div>
              {/* الدفع دايما بالجنيه حتى لو العرض بالدولار */}
              {currency === "USD" && (
                <p className="small text-secondary mt-1 mb-0">{t("checkout.chargedInEgp", { egp: price(total, { currency: "EGP" }) })}</p>
              )}
              <button type="submit" className="btn btn-primary btn-lg w-100 mt-3" disabled={submitting || !availableMethods.length}>
                {submitting ? <span className="spinner-border spinner-border-sm" /> : isOnlineMethod(method) ? t("checkout.payNow") : t("checkout.placeOrder")}
              </button>
              <Link to="/cart" className="btn btn-link w-100 mt-1">{t("checkout.backToCart")}</Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
