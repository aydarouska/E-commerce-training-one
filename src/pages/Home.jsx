import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { fetchProducts, fetchFeaturedProducts } from "../store/productsSlice";
import useI18n from "../hooks/useI18n";
import BannerSlider from "../components/BannerSlider";
import ProductCard, { ProductCardSkeleton } from "../components/ProductCard";
import Pagination from "../components/Pagination";
import Icon from "../components/Icon";

// عدد المنتجات فى كل صفحه
const PAGE_SIZE = 12;

// الصفحه الرئيسيه: بانرات + مميزات المتجر + المنتجات المميزه + كل المنتجات (بحث/تصنيف/ترتيب/صفحات)
export default function Home() {
  const dispatch = useDispatch();
  const { t, tr } = useI18n();
  // كل الفلاتر محفوظه فى الرابط (URL) عشان لو المستخدم عمل refresh او بعت اللينك لحد يفضل نفس الفلتر
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = Number(searchParams.get("page")) || 1;

  // بيانات المنتجات من الـ redux
  const { items, status, error, totalPages, totalProducts, featuredItems, featuredStatus, categories } =
    useSelector((state) => state.products);

  // كل ما الفلاتر تتغير نطلب المنتجات من السيرفر من جديد
  useEffect(() => {
    dispatch(fetchProducts({ search, category, sort, page, limit: PAGE_SIZE }));
  }, [dispatch, search, category, sort, page]);

  // المنتجات المميزه بنجيبها مره واحده بس
  useEffect(() => {
    if (featuredStatus === "idle") dispatch(fetchFeaturedProducts());
  }, [dispatch, featuredStatus]);

  // بيغير قيمه فلتر فى الرابط - و بيرجع لاول صفحه لو الفلتر نفسه اتغير
  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setSearchParams(next);
  };

  // لما المستخدم يغير الصفحه: نحدث الرابط و نطلع لاول قسم المنتجات
  const handlePageChange = (nextPage) => {
    updateParam("page", String(nextPage));
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  // اسم التصنيف الحالى باللغه المختاره (عشان العنوان)
  const currentCategory = categories.find((c) => c.name === category);
  // لو فيه بحث او تصنيف مش هنعرض البانرات و المميز - نعرض النتايج على طول
  const isFiltering = Boolean(search || category);

  return (
    <>
      {!isFiltering && <BannerSlider />}

      {/* شريط مميزات المتجر (شحن - دفع آمن - طرق دفع مصريه) */}
      {!isFiltering && (
        <section className="container my-4">
          <div className="row g-3">
            {[
              { icon: "truck", title: t("home.feature.shipping"), text: t("home.feature.shippingText") },
              { icon: "shield", title: t("home.feature.secure"), text: t("home.feature.secureText") },
              { icon: "phone", title: t("home.feature.wallets"), text: t("home.feature.walletsText") },
            ].map((f) => (
              <div className="col-md-4" key={f.icon}>
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body d-flex gap-3 align-items-center">
                    <span className="tw:inline-flex tw:h-12 tw:w-12 tw:items-center tw:justify-center tw:rounded-xl bg-brand-soft text-brand">
                      <Icon name={f.icon} size={24} />
                    </span>
                    <div>
                      <h3 className="h6 fw-bold mb-1">{f.title}</h3>
                      <p className="small text-secondary mb-0">{f.text}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* المنتجات المميزه */}
      {!isFiltering && featuredItems.length > 0 && (
        <section className="container my-5">
          <h2 className="h4 fw-bold mb-3">{t("home.featured")}</h2>
          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
            {featuredItems.slice(0, 4).map((product) => (
              <div className="col" key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* كل المنتجات + الفلاتر */}
      <section className="container my-5" id="products">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <div>
            {/* العنوان بيتغير حسب البحث او التصنيف */}
            <h2 className="h4 fw-bold mb-0">
              {search
                ? t("home.searchResults", { q: search })
                : currentCategory
                ? tr(currentCategory, "name")
                : t("home.allProducts")}
            </h2>
            {status === "succeeded" && (
              <small className="text-secondary">{t("home.count", { n: totalProducts })}</small>
            )}
          </div>

          <div className="d-flex gap-2">
            {/* زرار مسح الفلاتر يظهر بس لو فيه فلتر */}
            {isFiltering && (
              <button type="button" className="btn btn-light btn-sm" onClick={() => setSearchParams({})}>
                <Icon name="x" size={16} /> {t("home.clearFilters")}
              </button>
            )}
            {/* اختيار الترتيب */}
            <select
              className="form-select form-select-sm tw:w-auto"
              value={sort}
              onChange={(e) => updateParam("sort", e.target.value)}
              aria-label={t("home.sort")}
            >
              <option value="newest">{t("sort.newest")}</option>
              <option value="price_asc">{t("sort.priceAsc")}</option>
              <option value="price_desc">{t("sort.priceDesc")}</option>
              <option value="rating">{t("sort.rating")}</option>
            </select>
          </div>
        </div>

        {/* رساله الخطأ لو السيرفر مش شغال او حصل مشكله */}
        {status === "failed" && (
          <div className="alert alert-danger">{error === "NETWORK_ERROR" ? t("error.network") : error}</div>
        )}

        <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
          {/* وقت التحميل نعرض كروت فاضيه (skeleton) */}
          {status === "loading" &&
            Array.from({ length: 8 }).map((_, i) => (
              <div className="col" key={i}>
                <ProductCardSkeleton />
              </div>
            ))}
          {/* بعد التحميل نعرض المنتجات */}
          {status === "succeeded" &&
            items.map((product) => (
              <div className="col" key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
        </div>

        {/* لو مفيش نتايج */}
        {status === "succeeded" && items.length === 0 && (
          <div className="text-center py-5 text-secondary">
            <Icon name="search" size={40} />
            <p className="mt-2">{t("home.noResults")}</p>
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
      </section>
    </>
  );
}
