import { Link } from "react-router-dom";
import { resolveProductImage } from "../utils/image";
import useI18n from "../hooks/useI18n";
import useAddToCart from "../hooks/useAddToCart";
import Icon from "./Icon";

// كارت التحميل (Skeleton) بيظهر مكان المنتج لحد ما البيانات توصل من السيرفر
export function ProductCardSkeleton() {
  return (
    <div className="card h-100 tw:animate-pulse">
      <div className="tw:aspect-square bg-light tw:rounded-t-xl" />
      <div className="card-body">
        <div className="bg-light rounded mb-2" style={{ height: 12, width: "40%" }} />
        <div className="bg-light rounded mb-2" style={{ height: 16, width: "80%" }} />
        <div className="bg-light rounded" style={{ height: 32 }} />
      </div>
    </div>
  );
}

// كارت المنتج اللى بيظهر فى الصفحه الرئيسيه و المنتجات المميزه
export default function ProductCard({ product }) {
  // t للترجمه - tr لاختيار الاسم حسب اللغه - price لعرض السعر بالعمله المختاره
  const { t, tr, price } = useI18n();
  // داله الاضافه للسله (بتحول الزائر لتسجيل الدخول لو مش مسجل)
  const addToCart = useAddToCart();

  // هل المنتج خلص من المخزن؟
  const outOfStock = product.countInStock === 0;
  // عدد النجوم المليانه (التقييم مقرب لاقرب رقم صحيح)
  const stars = Math.round(product.rating || 0);

  return (
    <div className="card h-100 card-hover tw:overflow-hidden">
      {/* الصوره و الاسم لينك بيودى لصفحه تفاصيل المنتج */}
      <Link to={`/products/${product.id}`} className="text-decoration-none text-reset d-flex flex-column flex-grow-1">
        <div className="position-relative tw:aspect-square bg-light tw:overflow-hidden">
          <img
            src={resolveProductImage(product.image)}
            alt={tr(product, "name")}
            loading="lazy"
            className="tw:h-full tw:w-full tw:object-cover tw:transition-transform tw:duration-300 tw:hover:scale-105"
          />
          {/* علامه "مميز" لو المنتج isFeatured */}
          {product.isFeatured && (
            <span className="badge bg-warning text-dark position-absolute top-0 start-0 m-2">{t("product.featured")}</span>
          )}
          {/* علامه "نفذت الكميه" لو المخزن صفر */}
          {outOfStock && (
            <span className="badge bg-dark position-absolute top-0 end-0 m-2">{t("product.outOfStock")}</span>
          )}
        </div>

        <div className="card-body d-flex flex-column gap-1 pb-0">
          {/* التصنيف و البراند */}
          <div className="d-flex justify-content-between small text-secondary">
            <span>{tr(product, "category")}</span>
            {product.brand && <span>{product.brand}</span>}
          </div>
          {/* اسم المنتج (سطرين بالكتير) */}
          <h3 className="h6 fw-bold mb-0 line-clamp-2">{tr(product, "name")}</h3>
          {/* التقييم بالنجوم و عدد المراجعات */}
          <div className="small">
            <span className="text-warning" aria-hidden="true">
              {"★".repeat(stars)}
              {"☆".repeat(5 - stars)}
            </span>{" "}
            <span className="text-secondary">({product.numReviews || 0})</span>
          </div>
          {/* السعر بالجنيه او الدولار حسب اختيار المستخدم */}
          <p className="price fs-5 mt-auto mb-0 pt-1">{price(product.price)}</p>
        </div>
      </Link>

      {/* زرار الاضافه للسله - بيتقفل لو المنتج خلص */}
      <div className="card-body pt-2">
        <button
          type="button"
          className="btn btn-primary w-100"
          disabled={outOfStock}
          onClick={() => addToCart(product)}
        >
          <Icon name="cart" size={18} /> {outOfStock ? t("product.outOfStock") : t("product.addToCart")}
        </button>
      </div>
    </div>
  );
}
