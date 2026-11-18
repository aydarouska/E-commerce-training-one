import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { updateQuantity, removeFromCart, clearCart, selectCartItems, selectCartTotal } from "../store/cartSlice";
import { resolveProductImage } from "../utils/image";
import { toastError, confirmDialog } from "../utils/toast";
import useI18n from "../hooks/useI18n";
import Spinner from "../components/Spinner";
import Icon from "../components/Icon";

// حساب مصاريف الشحن حسب اعدادات المتجر (بتستخدم هنا و فى صفحه الدفع)
export const calcShipping = (subtotal, settings) => {
  if (!settings) return 0;
  // لو فيه حد للشحن المجانى و الطلب وصله يبقى الشحن ببلاش
  if (settings.freeShippingThreshold > 0 && subtotal >= settings.freeShippingThreshold) return 0;
  return settings.shippingFee || 0;
};

// صفحه سله المشتريات
export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, tr, price } = useI18n();
  // المنتجات اللى فى السله و الاجمالى
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartTotal);
  const status = useSelector((state) => state.cart.status);
  const settings = useSelector((state) => state.settings.data);

  const shipping = calcShipping(subtotal, settings);
  // كام فاضل عشان الشحن يبقى مجانى (لو الميزه دى شغاله)
  const remainingForFree =
    settings?.freeShippingThreshold > 0 ? Math.max(settings.freeShippingThreshold - subtotal, 0) : 0;

  // تغيير الكميه - لو حصل خطأ (مثلا الكميه اكبر من المخزن) نعرض رساله
  const changeQty = (productId, quantity) => {
    if (quantity < 1) return;
    dispatch(updateQuantity({ productId, quantity }))
      .unwrap()
      .catch((msg) => toastError(msg));
  };

  // تفضيه السله بعد تأكيد المستخدم
  const handleClear = async () => {
    const ok = await confirmDialog({
      title: t("cart.clearConfirm"),
      confirmText: t("common.yes"),
      cancelText: t("common.cancel"),
      danger: true,
    });
    if (ok) dispatch(clearCart());
  };

  // اول تحميل للسله
  if (status === "loading" && !items.length) return <Spinner />;

  // السله فاضيه
  if (!items.length) {
    return (
      <div className="container py-5 text-center">
        <span className="tw:inline-flex tw:h-20 tw:w-20 tw:items-center tw:justify-center tw:rounded-full bg-brand-soft text-brand mb-3">
          <Icon name="cart" size={40} />
        </span>
        <h1 className="h4 fw-bold">{t("cart.empty")}</h1>
        <p className="text-secondary">{t("cart.emptyText")}</p>
        <Link to="/" className="btn btn-primary">{t("cart.continue")}</Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 fw-bold mb-0">{t("cart.title")} ({items.length})</h1>
        <button type="button" className="btn btn-link text-danger text-decoration-none" onClick={handleClear}>
          <Icon name="trash" size={16} /> {t("cart.clear")}
        </button>
      </div>

      <div className="row g-4">
        {/* قائمه المنتجات */}
        <div className="col-lg-8">
          <div className="card">
            <ul className="list-group list-group-flush">
              {items.map(({ product, quantity, subtotal: lineTotal }) => (
                <li key={product.id} className="list-group-item py-3">
                  <div className="d-flex gap-3">
                    {/* صوره المنتج */}
                    <Link to={`/products/${product.id}`} className="tw:shrink-0">
                      <img src={resolveProductImage(product.image)} alt={tr(product, "name")} className="rounded tw:h-20 tw:w-20 tw:object-cover" />
                    </Link>
                    <div className="flex-grow-1">
                      {/* الاسم و سعر الوحده */}
                      <Link to={`/products/${product.id}`} className="fw-semibold text-reset text-decoration-none">
                        {tr(product, "name")}
                      </Link>
                      <div className="small text-secondary">{price(product.price)} / {t("cart.unit")}</div>

                      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-2">
                        {/* زرار - و + لتغيير الكميه */}
                        <div className="input-group input-group-sm tw:w-32">
                          <button type="button" className="btn btn-outline-secondary" disabled={quantity <= 1} onClick={() => changeQty(product.id, quantity - 1)} aria-label="-">
                            <Icon name="minus" size={14} />
                          </button>
                          <input type="text" readOnly className="form-control text-center" value={quantity} aria-label={t("product.quantity")} />
                          <button type="button" className="btn btn-outline-secondary" disabled={quantity >= product.countInStock} onClick={() => changeQty(product.id, quantity + 1)} aria-label="+">
                            <Icon name="plus" size={14} />
                          </button>
                        </div>
                        {/* اجمالى السطر و زرار الحذف */}
                        <div className="d-flex align-items-center gap-3">
                          <span className="price">{price(lineTotal)}</span>
                          <button type="button" className="btn btn-sm btn-light text-danger" onClick={() => dispatch(removeFromCart(product.id))} aria-label={t("cart.remove")}>
                            <Icon name="trash" size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ملخص الطلب */}
        <div className="col-lg-4">
          <div className="card tw:sticky tw:top-24">
            <div className="card-body">
              <h2 className="h5 fw-bold mb-3">{t("cart.summary")}</h2>
              <div className="d-flex justify-content-between mb-2">
                <span>{t("cart.subtotal")}</span>
                <span>{price(subtotal)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>{t("cart.shipping")}</span>
                <span>{shipping === 0 ? <span className="text-success">{t("cart.free")}</span> : price(shipping)}</span>
              </div>
              {/* رساله "فاضلك كذا للشحن المجانى" */}
              {remainingForFree > 0 && (
                <div className="alert alert-warning py-2 small">{t("cart.freeShippingHint", { amount: price(remainingForFree) })}</div>
              )}
              <hr />
              <div className="d-flex justify-content-between fw-bold fs-5 mb-3">
                <span>{t("cart.total")}</span>
                <span className="price">{price(subtotal + shipping)}</span>
              </div>
              <button type="button" className="btn btn-primary btn-lg w-100" onClick={() => navigate("/checkout")}>
                {t("cart.checkout")}
              </button>
              <Link to="/" className="btn btn-link w-100 mt-1">{t("cart.continue")}</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
