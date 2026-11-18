import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, useLocation } from "react-router-dom";
import { fetchCart, resetCart } from "./store/cartSlice";
import { fetchMe } from "./store/authSlice";
import { fetchSettings } from "./store/settingsSlice";
import { applyBootstrapDirection } from "./utils/bootstrapDirection";
import useI18n from "./hooks/useI18n";
import Navbar from "./components/Navbar";
import CategoryBar from "./components/CategoryBar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/protectedRoute";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderDetails from "./pages/OrderDetails";
import MyOrders from "./pages/MyOrders";
import PaymentResult from "./pages/PaymentResult";
import Account from "./pages/DashBoard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import AdminLayout from "./admin/AdminLayout";
import AdminOverview from "./admin/AdminOverview";
import AdminProducts from "./admin/AdminProducts";
import AdminOrders from "./admin/AdminOrders";
import AdminUsers from "./admin/AdminUsers";
import AdminSettings from "./admin/AdminSettings";

function App() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { lang, dir, t } = useI18n();
  const location = useLocation();

  // اول ما الموقع يفتح: لو فيه token محفوظ فى localStorage نجيب بيانات المستخدم
  // و كمان نجيب اعدادات المتجر (سعر الدولار - مصاريف الشحن - طرق الدفع)
  useEffect(() => {
    if (localStorage.getItem("token")) dispatch(fetchMe());
    dispatch(fetchSettings());
  }, [dispatch]);

  // السله محفوظه فى قاعده البيانات لكل مستخدم:
  // لو فيه مستخدم نجيب سلته - و لو عمل خروج نفضى السله من المتصفح
  useEffect(() => {
    if (user) dispatch(fetchCart());
    else dispatch(resetCart());
  }, [user, dispatch]);

  // كل ما اللغه تتغير: نغير اتجاه الصفحه (rtl/ltr) و ملف bootstrap و عنوان التاب
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    applyBootstrapDirection(dir);
  }, [lang, dir]);

  // لما الصفحه تتغير نطلع لفوق (الا لو الرابط فيه # زى #products)
  useEffect(() => {
    if (!location.hash) window.scrollTo(0, 0);
  }, [location.pathname, location.hash]);

  // صفحات لوحه التحكم ليها شكل مختلف (من غير شريط التصنيفات)
  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <>
      <Navbar />
      {!isAdmin && <CategoryBar />}
      <main>
        <Routes>
          {/* صفحات متاحه لاى حد */}
          <Route path="/" element={<Home />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* صفحات محتاجه تسجيل دخول */}
          <Route element={<ProtectedRoute />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<MyOrders />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
            <Route path="/payment/result" element={<PaymentResult />} />
            <Route path="/account" element={<Account />} />
          </Route>

          {/* لوحه التحكم - للادمن بس */}
          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>

          {/* اى رابط غير معروف */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
      {/* عنوان التاب فى المتصفح */}
      <title>{t("brand")}</title>
    </>
  );
}

export default App;
