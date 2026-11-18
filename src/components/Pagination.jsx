import useI18n from "../hooks/useI18n";

// بيرجع ارقام الصفحات اللى هتظهر - مثال: 1 ... 4 5 6 ... 10
function getPageNumbers(page, totalPages) {
  // عدد الصفحات اللى تظهر جنب الصفحه الحاليه من كل ناحيه
  const delta = 1;
  const pages = [];

  for (let i = 1; i <= totalPages; i += 1) {
    // بنعرض اول صفحه و اخر صفحه و الصفحات القريبه من الحاليه
    if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      // غير كده بنحط "..." مره واحده بس
      pages.push("...");
    }
  }

  return pages;
}

// مكون الترقيم (Pagination) بشكل bootstrap
export default function Pagination({ page, totalPages, onPageChange }) {
  const { t } = useI18n();

  // لو صفحه واحده بس مش محتاجين ترقيم
  if (totalPages <= 1) return null;

  return (
    <nav aria-label={t("pagination.label")} className="d-flex justify-content-center mt-4">
      <ul className="pagination mb-0">
        {/* زرار السابق - بيتقفل فى اول صفحه */}
        <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
          <button type="button" className="page-link" onClick={() => onPageChange(page - 1)}>
            {t("pagination.prev")}
          </button>
        </li>

        {/* ارقام الصفحات */}
        {getPageNumbers(page, totalPages).map((n, index) =>
          n === "..." ? (
            <li key={`dots-${index}`} className="page-item disabled">
              <span className="page-link">…</span>
            </li>
          ) : (
            <li key={n} className={`page-item ${n === page ? "active" : ""}`}>
              <button type="button" className="page-link" onClick={() => onPageChange(n)}>
                {n}
              </button>
            </li>
          )
        )}

        {/* زرار التالى - بيتقفل فى اخر صفحه */}
        <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
          <button type="button" className="page-link" onClick={() => onPageChange(page + 1)}>
            {t("pagination.next")}
          </button>
        </li>
      </ul>
    </nav>
  );
}
