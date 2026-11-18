import useI18n from "../hooks/useI18n";

// لون كل حاله من حالات الطلب و الدفع (الوان bootstrap)
const COLORS = {
  // حالات الطلب
  pending: "bg-secondary",
  confirmed: "bg-primary",
  shipped: "bg-info text-dark",
  delivered: "bg-success",
  cancelled: "bg-danger",
  // حالات الدفع
  unpaid: "bg-warning text-dark",
  under_review: "bg-info text-dark",
  paid: "bg-success",
  failed: "bg-danger",
  refunded: "bg-dark",
};

// شاره ملونه بتعرض حاله الطلب او الدفع
// type = "order" او "payment" عشان نجيب الترجمه الصح
export default function StatusBadge({ status, type = "order" }) {
  const { t } = useI18n();
  return <span className={`badge ${COLORS[status] || "bg-secondary"}`}>{t(`${type}Status.${status}`)}</span>;
}
