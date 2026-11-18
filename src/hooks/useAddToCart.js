import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { addToCart } from "../store/cartSlice";
import { toastError, toastSuccess } from "../utils/toast";
import useI18n from "./useI18n";

// السلة محفوظة في قاعدة البيانات لكل مستخدم، فلازم يكون مسجل دخول.
// الزائر بيتحول لصفحة تسجيل الدخول وبعدها يرجع لنفس الصفحة.
export default function useAddToCart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const { t, tr } = useI18n();

  return (product, quantity = 1) => {
    if (!user) {
      navigate("/login", { state: { from: location.pathname + location.search } });
      return Promise.resolve(false);
    }

    return dispatch(addToCart({ productId: product.id, quantity }))
      .unwrap()
      .then(() => {
        toastSuccess(t("cart.added", { name: tr(product, "name") }));
        return true;
      })
      .catch((message) => {
        toastError(message || t("cart.updateError"));
        return false;
      });
  };
}
