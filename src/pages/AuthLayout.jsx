// الشكل المشترك لصفحتى تسجيل الدخول و انشاء الحساب (كارت فى نص الصفحه)
export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-sm-10 col-md-7 col-lg-5">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h1 className="h4 fw-bold mb-1">{title}</h1>
              <p className="text-secondary mb-4">{subtitle}</p>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
