import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { fetchCategories } from "../store/productsSlice";
import useI18n from "../hooks/useI18n";

// شريط التصنيفات تحت الناف بار - التصنيفات بتيجى من قاعده البيانات مش مكتوبه يدوى
export default function CategoryBar() {
  const dispatch = useDispatch();
  // التصنيفات و حالتها من الـ redux
  const { categories, categoriesStatus } = useSelector((state) => state.products);
  // بنقرا التصنيف الحالى من الرابط عشان نلونه
  const [searchParams] = useSearchParams();
  const active = searchParams.get("category");
  const { t, tr } = useI18n();

  // بنجيب التصنيفات مره واحده بس اول ما الصفحه تفتح
  useEffect(() => {
    if (categoriesStatus === "idle") dispatch(fetchCategories());
  }, [categoriesStatus, dispatch]);

  // لو مفيش تصنيفات مش هنعرض الشريط
  if (!categories.length) return null;

  return (
    <nav className="bg-white border-bottom">
      <div className="container d-flex gap-2 py-2 tw:overflow-x-auto category-scroll">
        {/* زرار "الكل" بيلغى فلتر التصنيف */}
        <Link to="/#products" className={`btn btn-sm rounded-pill text-nowrap ${!active ? "btn-primary" : "btn-light"}`}>
          {t("category.all")}
        </Link>
        {categories.map((category) => (
          // الرابط بيحط اسم التصنيف (العربى) فى الـ URL و الصفحه الرئيسيه بتفلتر بيه
          <Link
            key={category.name}
            to={`/?category=${encodeURIComponent(category.name)}#products`}
            className={`btn btn-sm rounded-pill text-nowrap ${active === category.name ? "btn-primary" : "btn-light"}`}
          >
            {tr(category, "name")}
          </Link>
        ))}
      </div>
    </nav>
  );
}
