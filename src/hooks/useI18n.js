import { useCallback } from "react";
import { useSelector } from "react-redux";
import translations from "../i18n/translations";

// hook واحد لكل حاجه ليها علاقه باللغه و العمله:
//   t("cart.title")                 -> النص المترجم
//   t("product.onlyLeft", { n: 3 }) -> بيحط 3 مكان {n} فى النص
//   tr(product, "name")             -> فى الانجليزى بيرجع product.nameEn (و لو فاضى يرجع العربى)
//   price(1250)                     -> "1,250 ج.م" او "$25.00" حسب العمله المختاره
//   date(order.createdAt)           -> التاريخ مكتوب حسب اللغه
export default function useI18n() {
  // اللغه و العمله من uiSlice
  const lang = useSelector((state) => state.ui.lang);
  const currency = useSelector((state) => state.ui.currency);
  // سعر الدولار من اعدادات المتجر (و لو لسه ماوصلتش نستخدم 50 مؤقتا)
  const usdRate = useSelector((state) => state.settings.data?.usdRate) || 50;

  // داله الترجمه
  // useCallback عشان الداله ماتتعملش من جديد غير لما اللغه تتغير
  const t = useCallback(
    (key, vars) => {
      // ندور على النص فى اللغه الحاليه - و لو مش موجود ناخد العربى - و لو مش موجود نرجع المفتاح نفسه
      let text = translations[lang]?.[key] ?? translations.ar[key] ?? key;
      // نبدل {n} و {name} ... بالقيم
      if (vars) {
        Object.entries(vars).forEach(([k, v]) => {
          text = text.replaceAll(`{${k}}`, v);
        });
      }
      return text;
    },
    [lang]
  );

  // بيختار الحقل العربى او الانجليزى من object (منتج - تصنيف - اعدادات ...)
  const tr = useCallback(
    (obj, field) => {
      if (!obj) return "";
      if (lang === "en" && obj[`${field}En`]) return obj[`${field}En`];
      return obj[field] ?? "";
    },
    [lang]
  );

  // عرض السعر: egp دايما مبلغ بالجنيه (لان الاسعار متخزنه بالجنيه)
  // لو عايز تعرض بالجنيه غصب عن اختيار المستخدم (زى المبلغ المطلوب تحويله) ابعت { currency: "EGP" }
  const price = useCallback(
    (egp, options = {}) => {
      const cur = options.currency || currency;
      // لو دولار نقسم على سعر الصرف
      const amount = cur === "USD" ? egp / usdRate : egp;
      // ar-EG-u-nu-latn = تنسيق مصرى بس بالارقام العاديه (1,2,3) مش الهنديه (١،٢،٣)
      const locale = lang === "ar" ? "ar-EG-u-nu-latn" : "en-US";
      // لو المبلغ بالجنيه رقم صحيح مانعرضش .00
      const isWhole = cur === "EGP" && Number.isInteger(Math.round(amount * 100) / 100);
      // Intl.NumberFormat بيكتب الرقم بالعمله و الفواصل الصح
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: cur,
        minimumFractionDigits: isWhole ? 0 : 2,
        maximumFractionDigits: 2,
      }).format(amount || 0);
    },
    [currency, usdRate, lang]
  );

  // عرض التاريخ و الوقت حسب اللغه
  const date = useCallback(
    (value) =>
      new Intl.DateTimeFormat(lang === "ar" ? "ar-EG-u-nu-latn" : "en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value)),
    [lang]
  );

  // dir = اتجاه الصفحه: rtl للعربى و ltr للانجليزى
  return { t, tr, price, date, lang, currency, dir: lang === "ar" ? "rtl" : "ltr" };
}
