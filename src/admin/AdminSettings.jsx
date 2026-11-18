import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import * as settingsApi from "../api/settings";
import { getErrorMessage } from "../api/errors";
import { fetchSettings } from "../store/settingsSlice";
import { toastError, toastSuccess } from "../utils/toast";
import useI18n from "../hooks/useI18n";
import Spinner from "../components/Spinner";
import Icon from "../components/Icon";

// صفحه اعدادات المتجر: الاسم - سعر الدولار - الشحن - طرق الدفع و بيانات الحسابات
export default function AdminSettings() {
  const dispatch = useDispatch();
  const { t } = useI18n();
  // الاعدادات اللى بنعدل فيها
  const [form, setForm] = useState(null);
  // هل مفاتيح Paymob موجوده فى ملف .env فى السيرفر؟
  const [paymob, setPaymob] = useState({ card: false, vodafone_cash: false });
  const [saving, setSaving] = useState(false);
  // بيانات Paymob اللى الادمن بيعدلها (الخانات السريه بتبدأ فاضيه دايما و بتتبعت بس لو اتكتب فيها)
  const [pm, setPm] = useState({ publicKey: "", cardIntegrationId: "", walletIntegrationId: "", secretKey: "", hmacSecret: "" });
  // هل المفتاح السرى و HMAC محفوظين؟ + القيم اللى فى .env (تلميح)
  const [pmInfo, setPmInfo] = useState({ secretKeySet: false, hmacSecretSet: false, env: {} });

  // بيحط رد السيرفر فى الصفحه (بعد الجلب و بعد الحفظ)
  const applyPayload = (data) => {
    setForm(data.settings);
    setPaymob(data.paymob);
    const c = data.paymobConfig || {};
    setPm({
      publicKey: c.publicKey || "",
      cardIntegrationId: c.cardIntegrationId || "",
      walletIntegrationId: c.walletIntegrationId || "",
      secretKey: "",
      hmacSecret: "",
    });
    setPmInfo({ secretKeySet: !!c.secretKeySet, hmacSecretSet: !!c.hmacSecretSet, env: c.envFallback || {} });
  };

  // جلب الاعدادات الحاليه
  useEffect(() => {
    settingsApi
      .getAdminSettings()
      .then((res) => applyPayload(res.data.data))
      .catch((err) => toastError(getErrorMessage(err)));
  }, []);

  if (!form) return <Spinner />;

  // تحديث حقل عادى (اسم المتجر - سعر الدولار ...)
  const set = (name, value) => setForm({ ...form, [name]: value });
  // تحديث حقل جوه طريقه دفع معينه (مثلا عنوان انستاباى)
  const setPay = (method, name, value) =>
    setForm({ ...form, payments: { ...form.payments, [method]: { ...form.payments[method], [name]: value } } });

  // تحديث حقل من حقول Paymob
  const setPmField = (name, value) => setPm({ ...pm, [name]: value });

  // حفظ الاعدادات
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await settingsApi.updateSettings({
        ...form,
        usdRate: Number(form.usdRate),
        shippingFee: Number(form.shippingFee),
        freeShippingThreshold: Number(form.freeShippingThreshold),
        paymob: pm,
      });
      applyPayload(res.data.data);
      // نحدث الاعدادات اللى الموقع كله بيستخدمها (سعر الدولار مثلا)
      dispatch(fetchSettings());
      toastSuccess(t("admin.saved"));
    } catch (err) {
      toastError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // مكون صغير لحقل نص
  const Field = ({ label, value, onChange, type = "text", ltr = false, col = "col-md-6", ...rest }) => (
    <div className={col}>
      <label className="form-label small">{label}</label>
      <input type={type} dir={ltr ? "ltr" : undefined} className="form-control" value={value ?? ""} onChange={(e) => onChange(e.target.value)} {...rest} />
    </div>
  );

  // مفتاح تشغيل/ايقاف طريقه دفع
  const Toggle = ({ method }) => (
    <div className="form-check form-switch">
      <input id={`en-${method}`} type="checkbox" className="form-check-input" checked={form.payments[method].enabled} onChange={(e) => setPay(method, "enabled", e.target.checked)} />
      <label htmlFor={`en-${method}`} className="form-check-label fw-semibold">{t(`pay.${method}`)}</label>
    </div>
  );

  return (
    <form onSubmit={handleSave}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 fw-bold mb-0">{t("admin.settings")}</h1>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? <span className="spinner-border spinner-border-sm" /> : t("common.save")}
        </button>
      </div>

      {/* بيانات المتجر */}
      <div className="card mb-3">
        <div className="card-body row g-3">
          <h2 className="h6 fw-bold col-12 mb-0">{t("admin.storeInfo")}</h2>
          {Field({ label: t("admin.storeNameAr"), value: form.storeName, onChange: (v) => set("storeName", v) })}
          {Field({ label: t("admin.storeNameEn"), value: form.storeNameEn, onChange: (v) => set("storeNameEn", v), ltr: true })}
          {Field({ label: t("admin.supportPhone"), value: form.supportPhone, onChange: (v) => set("supportPhone", v), ltr: true })}
          {Field({ label: t("admin.supportEmail"), value: form.supportEmail, onChange: (v) => set("supportEmail", v), ltr: true, type: "email" })}
        </div>
      </div>

      {/* العمله و الشحن */}
      <div className="card mb-3">
        <div className="card-body row g-3">
          <h2 className="h6 fw-bold col-12 mb-0">{t("admin.pricing")}</h2>
          {Field({ label: t("admin.usdRate"), value: form.usdRate, onChange: (v) => set("usdRate", v), type: "number", min: "0.01", step: "0.01", col: "col-md-4" })}
          {Field({ label: t("admin.shippingFee"), value: form.shippingFee, onChange: (v) => set("shippingFee", v), type: "number", min: "0", step: "1", col: "col-md-4" })}
          {Field({ label: t("admin.freeShipping"), value: form.freeShippingThreshold, onChange: (v) => set("freeShippingThreshold", v), type: "number", min: "0", step: "1", col: "col-md-4" })}
          <div className="col-12 form-text mt-0">{t("admin.pricingHint")}</div>
        </div>
      </div>

      {/* طرق الدفع */}
      <div className="card mb-3">
        <div className="card-body">
          <h2 className="h6 fw-bold">{t("admin.paymentMethods")}</h2>

          {/* Paymob: كارت و فودافون كاش */}
          <div className="border rounded p-3 mb-3">
            <div className="d-flex flex-wrap gap-4 mb-2">
              {Toggle({ method: "card" })}
              {Toggle({ method: "vodafone_cash" })}
            </div>
            {/* حاله ربط Paymob (المفاتيح ممكن تتكتب هنا او فى ملف .env فى الباك اند) */}
            <div className="small">
              <Icon name={paymob.card ? "check" : "alert"} size={16} className={paymob.card ? "text-success" : "text-warning"} />{" "}
              {t("pay.card")}: {paymob.card ? t("admin.paymobReady") : t("admin.paymobMissing")}
            </div>
            <div className="small">
              <Icon name={paymob.vodafone_cash ? "check" : "alert"} size={16} className={paymob.vodafone_cash ? "text-success" : "text-warning"} />{" "}
              {t("pay.vodafone_cash")}: {paymob.vodafone_cash ? t("admin.paymobReady") : t("admin.paymobMissing")}
            </div>

            {/* مفاتيح Paymob: الخانات السريه بتتحفظ مشفره و مابتظهرش تانى بعد الحفظ */}
            <hr />
            <div className="small fw-semibold mb-2">{t("admin.paymobKeys")}</div>
            <div className="row g-3">
              {Field({ label: t("admin.paymobSecretKey"), value: pm.secretKey, onChange: (v) => setPmField("secretKey", v), type: "password", ltr: true, autoComplete: "new-password", placeholder: pmInfo.secretKeySet ? t("admin.paymobSaved") : t("admin.paymobNotSet") })}
              {Field({ label: t("admin.paymobHmac"), value: pm.hmacSecret, onChange: (v) => setPmField("hmacSecret", v), type: "password", ltr: true, autoComplete: "new-password", placeholder: pmInfo.hmacSecretSet ? t("admin.paymobSaved") : t("admin.paymobNotSet") })}
              {Field({ label: t("admin.paymobPublicKey"), value: pm.publicKey, onChange: (v) => setPmField("publicKey", v), ltr: true, placeholder: pmInfo.env.publicKey || t("admin.paymobNotSet") })}
              {Field({ label: t("admin.paymobCardId"), value: pm.cardIntegrationId, onChange: (v) => setPmField("cardIntegrationId", v), ltr: true, inputMode: "numeric", col: "col-md-3", placeholder: pmInfo.env.cardIntegrationId || t("admin.paymobNotSet") })}
              {Field({ label: t("admin.paymobWalletId"), value: pm.walletIntegrationId, onChange: (v) => setPmField("walletIntegrationId", v), ltr: true, inputMode: "numeric", col: "col-md-3", placeholder: pmInfo.env.walletIntegrationId || t("admin.paymobNotSet") })}
            </div>
            <div className="form-text">{t("admin.paymobHint")}</div>
          </div>

          {/* انستاباى */}
          <div className="border rounded p-3 mb-3">
            <div className="mb-2">{Toggle({ method: "instapay" })}</div>
            <div className="row g-3">
            {Field({ label: t("transfer.instapayAddress"), value: form.payments.instapay.address, onChange: (v) => setPay("instapay", "address", v), ltr: true, col: "col-md-4", placeholder: "name@instapay" })}
            {Field({ label: t("transfer.phone"), value: form.payments.instapay.phone, onChange: (v) => setPay("instapay", "phone", v), ltr: true, col: "col-md-4" })}
            {Field({ label: t("transfer.accountName"), value: form.payments.instapay.accountName, onChange: (v) => setPay("instapay", "accountName", v), col: "col-md-4" })}
            </div>
          </div>

          {/* التحويل البنكى */}
          <div className="border rounded p-3">
            <div className="mb-2">{Toggle({ method: "bank_transfer" })}</div>
            <div className="row g-3">
            {Field({ label: t("transfer.bankName"), value: form.payments.bank_transfer.bankName, onChange: (v) => setPay("bank_transfer", "bankName", v) })}
            {Field({ label: t("transfer.accountName"), value: form.payments.bank_transfer.accountName, onChange: (v) => setPay("bank_transfer", "accountName", v) })}
            {Field({ label: t("transfer.accountNumber"), value: form.payments.bank_transfer.accountNumber, onChange: (v) => setPay("bank_transfer", "accountNumber", v), ltr: true })}
            {Field({ label: t("transfer.iban"), value: form.payments.bank_transfer.iban, onChange: (v) => setPay("bank_transfer", "iban", v), ltr: true, placeholder: "EG..." })}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
