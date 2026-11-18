import { useEffect } from "react";

// نافذه منبثقه (Modal) بشكل bootstrap من غير ما نحتاج ملف bootstrap.js
// show: تظهر ولا لا - onClose: تتقفل ازاى - title: العنوان - footer: الزراير تحت
export default function Modal({ show, onClose, title, children, footer, size = "lg" }) {
  // نقفل النافذه بزرار Escape و نمنع اسكرول الصفحه اللى وراها
  useEffect(() => {
    if (!show) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [show, onClose]);

  if (!show) return null;

  return (
    <>
      {/* الخلفيه الغامقه */}
      <div className="modal-backdrop fade show" onClick={onClose} />
      <div className="modal fade show d-block" tabIndex={-1} role="dialog" onClick={onClose}>
        {/* stopPropagation عشان الضغط جوه النافذه مايقفلهاش */}
        <div className={`modal-dialog modal-${size} modal-dialog-scrollable modal-dialog-centered`} onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title fw-bold">{title}</h5>
              <button type="button" className="btn-close m-0" style={{ marginInlineStart: "auto" }} onClick={onClose} aria-label="Close" />
            </div>
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-footer">{footer}</div>}
          </div>
        </div>
      </div>
    </>
  );
}
