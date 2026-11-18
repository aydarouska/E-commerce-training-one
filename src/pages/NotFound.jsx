import { Link } from "react-router-dom";
import useI18n from "../hooks/useI18n";

// صفحه 404 لاى رابط مش موجود
export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="container py-5 text-center">
      <h1 className="display-3 fw-bold text-brand">404</h1>
      <p className="text-secondary">{t("notFound.text")}</p>
      <Link to="/" className="btn btn-primary">{t("common.backHome")}</Link>
    </div>
  );
}
