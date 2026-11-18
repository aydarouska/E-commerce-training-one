import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import useI18n from "../hooks/useI18n";
import Icon from "./Icon";

// الفوتر اللى بيظهر تحت فى كل الصفحات
export default function Footer() {
  // بنجيب اعدادات المتجر (اسم المتجر و رقم الدعم) من الـ redux
  const settings = useSelector((state) => state.settings.data);
  // t للترجمه و tr عشان نختار الاسم العربى او الانجليزى
  const { t, tr } = useI18n();

  return (
    <footer className="bg-white border-top mt-5">
      <div className="container py-4">
        <div className="row g-4">
          {/* العمود الاول: اسم المتجر و وصف بسيط */}
          <div className="col-md-5">
            <h5 className="fw-bold text-brand">{settings ? tr(settings, "storeName") : t("brand")}</h5>
            <p className="text-secondary small mb-0">{t("footer.about")}</p>
          </div>
          {/* العمود التانى: روابط سريعه */}
          <div className="col-6 col-md-3">
            <h6 className="fw-bold">{t("footer.links")}</h6>
            <ul className="list-unstyled small mb-0">
              <li><Link to="/">{t("nav.home")}</Link></li>
              <li><Link to="/cart">{t("nav.cart")}</Link></li>
              <li><Link to="/orders">{t("nav.myOrders")}</Link></li>
            </ul>
          </div>
          {/* العمود التالت: طرق الدفع المتاحه و رقم التواصل لو موجود */}
          <div className="col-12 col-md-4">
            <h6 className="fw-bold">{t("footer.payWith")}</h6>
            <div className="d-flex flex-wrap gap-2 small">
              <span className="badge bg-light text-dark border text-wrap"><Icon name="card" size={14} /> {t("pay.card")}</span>
              <span className="badge bg-light text-dark border text-wrap"><Icon name="phone" size={14} /> {t("pay.vodafone_cash")}</span>
              <span className="badge bg-light text-dark border text-wrap"><Icon name="bolt" size={14} /> {t("pay.instapay")}</span>
              <span className="badge bg-light text-dark border text-wrap"><Icon name="bank" size={14} /> {t("pay.bank_transfer")}</span>
            </div>
            {settings?.supportPhone && (
              <p className="small mt-2 mb-0">
                {t("footer.support")}: <span className="ltr-text">{settings.supportPhone}</span>
              </p>
            )}
          </div>
        </div>
        {/* سطر حقوق النشر و السنه بتتحسب تلقائى */}
        <p className="text-center text-secondary small mt-4 mb-0">
          © {new Date().getFullYear()} {settings ? tr(settings, "storeName") : t("brand")} — {t("footer.rights")}
        </p>
      </div>
    </footer>
  );
}
