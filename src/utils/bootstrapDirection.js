// بيحمل ملف CSS بتاع bootstrap بالاتجاه الصح
// bootstrap عنده نسخه مخصوص للعربى (rtl) - فلما اللغه تتغير بنبدل الملف
// و بنحطه فى طبقه "bootstrap" عشان ستايلاتنا و كلاسات Tailwind تغلبه دايما (شوف styles/index.css)

// ?url معناها: Vite يرجعلنا رابط الملف بدل ما يحمله على طول
import ltrHref from "bootstrap/dist/css/bootstrap.min.css?url";
import rtlHref from "bootstrap/dist/css/bootstrap.rtl.min.css?url";

// id بتاع عنصر الـ style اللى هنحط فيه bootstrap
const STYLE_ID = "bootstrap-css";

// dir = "rtl" او "ltr"
export function applyBootstrapDirection(dir) {
  // نختار الملف حسب الاتجاه
  const href = dir === "rtl" ? rtlHref : ltrHref;
  // ندور على عنصر الـ style - و لو مش موجود نعمله
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    // بنحطه اول حاجه فى الـ head عشان يبقى اضعف ستايل
    document.head.prepend(style);
  }
  // @import ... layer(bootstrap) بيحمل الملف جوه طبقه bootstrap
  const css = `@import url("${href}") layer(bootstrap);`;
  // نغير بس لو الاتجاه اتغير فعلا (عشان مانحملش الملف من جديد على الفاضى)
  if (style.textContent !== css) style.textContent = css;
}
