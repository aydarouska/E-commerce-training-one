import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { fetchProductById, clearCurrentProduct } from "../store/productsSlice";
import { resolveProductImage } from "../utils/image";
import useI18n from "../hooks/useI18n";
import useAddToCart from "../hooks/useAddToCart";
import Spinner from "../components/Spinner";
import Icon from "../components/Icon";

// صفحه تفاصيل المنتج: صور + وصف + سعر + اختيار الكميه + اضافه للسله
export default function ProductDetails() {
  // id المنتج من الرابط /products/:id
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, tr, price, currency } = useI18n();
  const addToCart = useAddToCart();
  const { currentProduct: product, currentProductStatus: status, currentProductError: error } = useSelector(
    (state) => state.products
  );
  // الصوره الكبيره المختاره
  const [activeImage, setActiveImage] = useState(null);
  // الكميه اللى المستخدم عايزها
  const [quantity, setQuantity] = useState(1);
  // بنقفل الزرار وقت الاضافه عشان مايدوسش مرتين
  const [adding, setAdding] = useState(false);

  // نجيب المنتج كل ما الـ id يتغير - و لما نخرج من الصفحه نمسحه من الـ redux
  useEffect(() => {
    dispatch(fetchProductById(id));
    setQuantity(1);
    setActiveImage(null);
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch, id]);

  if (status === "loading" || status === "idle") return <Spinner />;

  // المنتج مش موجود او حصل خطأ
  if (status === "failed" || !product) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger d-inline-block">{error || t("product.notFound")}</div>
        <div>
          <Link to="/" className="btn btn-primary mt-3">{t("common.backHome")}</Link>
        </div>
      </div>
    );
  }

  // كل الصور: الصوره الاساسيه + الصور الاضافيه
  const gallery = [product.image, ...(product.images || [])].filter(Boolean);
  const mainImage = activeImage || gallery[0];
  const outOfStock = product.countInStock === 0;
  const stars = Math.round(product.rating || 0);

  // اضافه للسله - و لو اختار "اشترى الآن" نوديه للسله على طول
  const handleAdd = async (buyNow = false) => {
    setAdding(true);
    const ok = await addToCart(product, quantity);
    setAdding(false);
    if (ok && buyNow) navigate("/cart");
  };

  return (
    <div className="container py-4">
      {/* مسار الصفحه (breadcrumb) */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/">{t("nav.home")}</Link></li>
          <li className="breadcrumb-item">
            <Link to={`/?category=${encodeURIComponent(product.category)}#products`}>{tr(product, "category")}</Link>
          </li>
          <li className="breadcrumb-item active">{tr(product, "name")}</li>
        </ol>
      </nav>

      <div className="row g-4">
        {/* الصور */}
        <div className="col-lg-6">
          <div className="card tw:overflow-hidden">
            <img src={resolveProductImage(mainImage)} alt={tr(product, "name")} className="tw:aspect-square tw:w-full tw:object-cover" />
          </div>
          {/* الصور الصغيره - لما يدوس على واحده تبقى هى الكبيره */}
          {gallery.length > 1 && (
            <div className="d-flex gap-2 mt-2">
              {gallery.map((img) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={`p-0 border rounded tw:overflow-hidden ${img === mainImage ? "border-primary border-2" : ""}`}
                  style={{ width: 72, height: 72 }}
                >
                  <img src={resolveProductImage(img)} alt="" className="w-100 h-100 tw:object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* البيانات */}
        <div className="col-lg-6">
          <span className="badge bg-brand-soft text-brand mb-2">{tr(product, "category")}</span>
          <h1 className="h3 fw-bold">{tr(product, "name")}</h1>
          {product.brand && <p className="text-secondary mb-2">{t("product.brand")}: {product.brand}</p>}

          {/* التقييم */}
          <div className="mb-3">
            <span className="text-warning fs-5">{"★".repeat(stars)}{"☆".repeat(5 - stars)}</span>{" "}
            <span className="text-secondary small">
              {Number(product.rating || 0).toFixed(1)} ({t("product.reviews", { n: product.numReviews || 0 })})
            </span>
          </div>

          {/* السعر - و لو العمله دولار نوضح ان الدفع بالجنيه */}
          <p className="price display-6 mb-1">{price(product.price)}</p>
          {currency === "USD" && (
            <p className="small text-secondary">{t("product.paidInEgp", { egp: price(product.price, { currency: "EGP" }) })}</p>
          )}

          {/* حاله المخزن */}
          <p className={`fw-semibold ${outOfStock ? "text-danger" : product.countInStock < 10 ? "text-warning" : "text-success"}`}>
            {outOfStock
              ? t("product.outOfStock")
              : product.countInStock < 10
              ? t("product.onlyLeft", { n: product.countInStock })
              : t("product.inStock")}
          </p>

          {/* الوصف */}
          <p className="text-secondary" style={{ whiteSpace: "pre-line" }}>{tr(product, "description")}</p>

          {!outOfStock && (
            <>
              {/* اختيار الكميه (من 1 لحد المتاح فى المخزن) */}
              <div className="d-flex align-items-center gap-2 mb-3">
                <span className="fw-semibold">{t("product.quantity")}:</span>
                <div className="input-group tw:w-36">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="-">
                    <Icon name="minus" size={16} />
                  </button>
                  <input type="text" readOnly className="form-control text-center" value={quantity} aria-label={t("product.quantity")} />
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setQuantity((q) => Math.min(product.countInStock, q + 1))} aria-label="+">
                    <Icon name="plus" size={16} />
                  </button>
                </div>
              </div>

              {/* زرار اضافه للسله و زرار اشترى الآن */}
              <div className="d-flex flex-wrap gap-2">
                <button type="button" className="btn btn-primary btn-lg flex-grow-1" disabled={adding} onClick={() => handleAdd(false)}>
                  <Icon name="cart" /> {t("product.addToCart")}
                </button>
                <button type="button" className="btn btn-accent btn-lg flex-grow-1" disabled={adding} onClick={() => handleAdd(true)}>
                  {t("product.buyNow")}
                </button>
              </div>
            </>
          )}

          {/* مميزات الشراء */}
          <ul className="list-unstyled small text-secondary mt-4 mb-0 d-grid gap-1">
            <li><Icon name="truck" size={16} /> {t("product.perk.shipping")}</li>
            <li><Icon name="shield" size={16} /> {t("product.perk.secure")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
