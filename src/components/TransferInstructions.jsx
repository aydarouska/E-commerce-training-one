import { useSelector } from "react-redux";
import useI18n from "../hooks/useI18n";
import { toastSuccess } from "../utils/toast";
import Icon from "./Icon";

// صف فيه معلومه (رقم حساب مثلا) و زرار نسخ
function CopyRow({ label, value }) {
  const { t } = useI18n();
  // لو الادمن ماكتبش المعلومه دى مانعرضش الصف
  if (!value) return null;

  // نسخ القيمه للـ clipboard
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toastSuccess(t("common.copied"));
    } catch {
      /* المتصفح مش سامح بالنسخ */
    }
  };

  return (
    <div className="copy-row">
      <div>
        <div className="small text-secondary">{label}</div>
        <div className="fw-semibold ltr-text">{value}</div>
      </div>
      <button type="button" className="btn btn-sm btn-light" onClick={copy} aria-label={t("common.copy")}>
        <Icon name="copy" size={16} />
      </button>
    </div>
  );
}

// بيانات التحويل (انستاباى او حساب بنكى) اللى العميل يحول عليها
// البيانات دى الادمن بيكتبها من لوحه التحكم > الاعدادات
export default function TransferInstructions({ method, amount, orderNumber }) {
  const { t, price } = useI18n();
  const payments = useSelector((state) => state.settings.data?.payments);
  const info = payments?.[method] || {};

  return (
    <div className="card border-primary">
      <div className="card-body">
        <h3 className="h6 fw-bold mb-2">
          <Icon name={method === "instapay" ? "bolt" : "bank"} /> {t(`transfer.title.${method}`)}
        </h3>
        {/* المبلغ المطلوب تحويله - دايما بالجنيه */}
        <div className="alert alert-warning py-2 mb-2">
          {t("transfer.amount")}: <strong>{price(amount, { currency: "EGP" })}</strong>
        </div>

        {/* بيانات انستاباى */}
        {method === "instapay" && (
          <>
            <CopyRow label={t("transfer.instapayAddress")} value={info.address} />
            <CopyRow label={t("transfer.phone")} value={info.phone} />
            <CopyRow label={t("transfer.accountName")} value={info.accountName} />
          </>
        )}

        {/* بيانات الحساب البنكى */}
        {method === "bank_transfer" && (
          <>
            <CopyRow label={t("transfer.bankName")} value={info.bankName} />
            <CopyRow label={t("transfer.accountName")} value={info.accountName} />
            <CopyRow label={t("transfer.accountNumber")} value={info.accountNumber} />
            <CopyRow label={t("transfer.iban")} value={info.iban} />
          </>
        )}

        {/* رقم الطلب يكتبه فى ملاحظه التحويل عشان الادمن يعرف التحويل ده لانهى طلب */}
        <CopyRow label={t("transfer.reference")} value={orderNumber} />

        <ol className="small text-secondary mt-3 mb-0 ps-3">
          <li>{t("transfer.step1")}</li>
          <li>{t("transfer.step2")}</li>
          <li>{t("transfer.step3")}</li>
        </ol>
      </div>
    </div>
  );
}
