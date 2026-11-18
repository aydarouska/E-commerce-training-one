// بيانات طرق الدفع اللى بنعرضها فى صفحه الدفع
// online = true يعنى الدفع بيتم من خلال Paymob و بيتأكد تلقائى
// online = false يعنى العميل بيحول بنفسه و يرفع صوره الايصال و الادمن يأكد
export const PAYMENT_METHODS = [
  { key: "card", icon: "card", online: true },
  { key: "vodafone_cash", icon: "phone", online: true },
  { key: "instapay", icon: "bolt", online: false },
  { key: "bank_transfer", icon: "bank", online: false },
];

// هل طريقه الدفع دى اونلاين (Paymob)؟
export const isOnlineMethod = (key) => PAYMENT_METHODS.find((m) => m.key === key)?.online === true;
