import { NavLink, Outlet } from "react-router-dom";
import useI18n from "../hooks/useI18n";
import Icon from "../components/Icon";

// روابط القائمه الجانبيه فى لوحه التحكم
const LINKS = [
  { to: "/admin", end: true, icon: "dashboard", key: "admin.overview" },
  { to: "/admin/orders", icon: "box", key: "admin.orders" },
  { to: "/admin/products", icon: "bag", key: "admin.products" },
  { to: "/admin/users", icon: "users", key: "admin.users" },
  { to: "/admin/settings", icon: "settings", key: "admin.settings" },
];

// الشكل العام للوحه التحكم: قائمه جانبيه + محتوى الصفحه (Outlet)
export default function AdminLayout() {
  const { t } = useI18n();
  return (
    <div className="container-fluid py-4">
      <div className="row g-4">
        <aside className="col-lg-2">
          <div className="card admin-sidebar">
            <div className="card-body p-2">
              <nav className="nav flex-lg-column gap-1 tw:overflow-x-auto tw:flex-nowrap">
                {LINKS.map((link) => (
                  // NavLink بيضيف كلاس active تلقائى للصفحه الحاليه
                  <NavLink key={link.to} to={link.to} end={link.end} className="nav-link text-nowrap">
                    <Icon name={link.icon} size={18} /> {t(link.key)}
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        </aside>
        <section className="col-lg-10">
          {/* هنا بتتعرض الصفحه الفرعيه (نظره عامه - الطلبات - المنتجات ...) */}
          <Outlet />
        </section>
      </div>
    </div>
  );
}
