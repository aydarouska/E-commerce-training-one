import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { logoutUser } from "../store/authSlice";
import { selectCartCount } from "../store/cartSlice";
import { setCurrency, toggleLang } from "../store/uiSlice";
import useI18n from "../hooks/useI18n";
import Icon from "./Icon";

// الناف بار: اسم المتجر - البحث - تغيير اللغه و العمله - السله - الحساب
export default function Navbar() {
  // المستخدم و الاعدادات و عدد القطع فى السله من الـ redux
  const user = useSelector((state) => state.auth.user);
  const settings = useSelector((state) => state.settings.data);
  const cartCount = useSelector(selectCartCount);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { t, tr, currency, lang } = useI18n();

  // القائمه على الموبايل مفتوحه ولا لا
  const [menuOpen, setMenuOpen] = useState(false);
  // قائمه الحساب (حسابى - طلباتى - تسجيل خروج) مفتوحه ولا لا
  const [accountOpen, setAccountOpen] = useState(false);
  // كلمه البحث (بتبدأ بالكلمه اللى فى الرابط لو موجوده)
  const [search, setSearch] = useState(searchParams.get("search") || "");
  // ref لقائمه الحساب عشان نعرف لو المستخدم داس براها
  const accountRef = useRef(null);

  // لما الصفحه تتغير نقفل القوايم
  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  // لو كلمه البحث فى الرابط اتغيرت نحدث خانه البحث
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
  }, [searchParams]);

  // لو المستخدم داس فى اى حته بره قائمه الحساب نقفلها
  useEffect(() => {
    const onClick = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // البحث: بيودى للرئيسيه و يحط الكلمه فى الرابط و ينزل لقسم المنتجات
  const handleSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    navigate(q ? `/?search=${encodeURIComponent(q)}#products` : "/#products");
  };

  // تسجيل الخروج و الرجوع للرئيسيه
  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/");
  };

  // اسم المتجر من الاعدادات (عربى او انجليزى حسب اللغه)
  const storeName = settings ? tr(settings, "storeName") : t("brand");

  return (
    <header className="bg-white border-bottom sticky-top tw:z-40">
      <nav className="navbar navbar-expand-lg py-2">
        <div className="container">
          <Link to="/" className="navbar-brand fw-bold text-brand d-flex align-items-center gap-2">
            <span className="tw:inline-flex tw:h-9 tw:w-9 tw:items-center tw:justify-center tw:rounded-xl tw:text-white" style={{ background: "var(--brand)" }}>
              <Icon name="bag" size={20} />
            </span>
            {storeName}
          </Link>

          {/* على الموبايل: زرار السله و زرار فتح القائمه */}
          <div className="d-flex align-items-center gap-2 d-lg-none">
            <Link to="/cart" className="btn btn-light position-relative" aria-label={t("nav.cart")}>
              <Icon name="cart" />
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              className="navbar-toggler border-0"
              type="button"
              aria-label={t("nav.menu")}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className="navbar-toggler-icon" />
            </button>
          </div>

          {/* باقى الناف بار (على الموبايل بيظهر بس لما القائمه تتفتح) */}
          <div className={`collapse navbar-collapse ${menuOpen ? "show" : ""}`}>
            {/* فورم البحث */}
            <form className="d-flex flex-grow-1 mx-lg-4 my-3 my-lg-0" role="search" onSubmit={handleSearch}>
              <div className="input-group">
                <input
                  type="search"
                  className="form-control"
                  placeholder={t("nav.searchPlaceholder")}
                  aria-label={t("nav.search")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button className="btn btn-primary" type="submit" aria-label={t("nav.search")}>
                  <Icon name="search" />
                </button>
              </div>
            </form>

            <ul className="navbar-nav align-items-lg-center gap-1 gap-lg-2">
              {/* زرار تغيير اللغه و اختيار العمله */}
              <li className="nav-item d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => dispatch(toggleLang())}
                  title={t("nav.language")}
                >
                  <Icon name="globe" size={16} /> {lang === "ar" ? "English" : "عربي"}
                </button>
                <select
                  className="form-select form-select-sm tw:w-auto"
                  value={currency}
                  onChange={(e) => dispatch(setCurrency(e.target.value))}
                  aria-label={t("nav.currency")}
                >
                  <option value="EGP">{t("currency.EGP")}</option>
                  <option value="USD">{t("currency.USD")}</option>
                </select>
              </li>

              {/* زرار السله على الكمبيوتر و عليه عدد القطع */}
              <li className="nav-item d-none d-lg-block">
                <NavLink to="/cart" className="btn btn-light position-relative" aria-label={t("nav.cart")}>
                  <Icon name="cart" />
                  {cartCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark">
                      {cartCount}
                    </span>
                  )}
                </NavLink>
              </li>

              {/* لو مسجل دخول: قائمه الحساب - لو لا: زرار الدخول و التسجيل */}
              {user ? (
                <li className="nav-item position-relative" ref={accountRef}>
                  <button
                    type="button"
                    className="btn btn-light d-flex align-items-center gap-2 w-100"
                    onClick={() => setAccountOpen((v) => !v)}
                    aria-expanded={accountOpen}
                  >
                    <span className="tw:inline-flex tw:h-7 tw:w-7 tw:items-center tw:justify-center tw:rounded-full bg-brand-soft text-brand fw-bold small">
                      {user.name?.[0]?.toUpperCase()}
                    </span>
                    <span className="small">{user.name}</span>
                    <Icon name="chevron-down" size={14} />
                  </button>
                  {accountOpen && (
                    <div className="dropdown-menu show shadow-sm mt-1" style={{ insetInlineEnd: 0, insetInlineStart: "auto" }}>
                      <Link className="dropdown-item" to="/account">
                        <Icon name="user" size={16} /> {t("nav.account")}
                      </Link>
                      <Link className="dropdown-item" to="/orders">
                        <Icon name="box" size={16} /> {t("nav.myOrders")}
                      </Link>
                      {/* لوحه التحكم بتظهر للادمن بس */}
                      {user.role === "admin" && (
                        <Link className="dropdown-item" to="/admin">
                          <Icon name="dashboard" size={16} /> {t("nav.admin")}
                        </Link>
                      )}
                      <hr className="dropdown-divider" />
                      <button type="button" className="dropdown-item text-danger" onClick={handleLogout}>
                        <Icon name="logout" size={16} /> {t("nav.logout")}
                      </button>
                    </div>
                  )}
                </li>
              ) : (
                <li className="nav-item d-flex gap-2">
                  <Link to="/login" className="btn btn-outline-primary btn-sm">
                    {t("nav.login")}
                  </Link>
                  <Link to="/register" className="btn btn-primary btn-sm">
                    {t("nav.register")}
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
