import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { banners } from "../data/banners";
import useI18n from "../hooks/useI18n";
import Icon from "./Icon";

// مده عرض كل بانر قبل ما يقلب للى بعده (5 ثوانى)
const AUTOPLAY_DELAY = 5000;

// سلايدر البانرات فى اول الصفحه الرئيسيه
export default function BannerSlider() {
  // رقم البانر المعروض حاليا
  const [index, setIndex] = useState(0);
  // بنوقف التقليب التلقائى لما الماوس يكون على السلايدر
  const [isPaused, setIsPaused] = useState(false);
  // مكان بدايه اللمس على الموبايل (عشان نعرف المستخدم سحب يمين ولا شمال)
  const touchStartX = useRef(null);
  const { tr, dir } = useI18n();

  // يروح لبانر معين - و لو عدى الاخر يرجع للاول و العكس
  const goTo = useCallback((i) => setIndex((i + banners.length) % banners.length), []);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // التقليب التلقائى كل 5 ثوانى (و بيتوقف لما isPaused = true)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % banners.length), AUTOPLAY_DELAY);
    // بنلغى التايمر لما المكون يتشال او isPaused يتغير
    return () => clearInterval(timer);
  }, [isPaused]);

  // بدايه اللمس على الموبايل
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  // نهايه اللمس: لو المسافه اكبر من 50 بكسل نقلب البانر
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta > 50) prev();
    else if (delta < -50) next();
    touchStartX.current = null;
  };

  return (
    // dir="ltr" هنا مهم: عشان حركه السلايدر (translateX) تشتغل صح حتى لو الموقع عربى
    <section
      dir="ltr"
      className="position-relative tw:overflow-hidden tw:h-[300px] tw:md:h-[420px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
    >
      {/* الشريط اللى فيه كل البانرات جنب بعض و بيتحرك حسب index */}
      <div className="d-flex h-100 tw:transition-transform tw:duration-500" style={{ transform: `translateX(-${index * 100}%)` }}>
        {banners.map((banner, i) => (
          <div key={banner.id} className="position-relative h-100 tw:shrink-0 tw:w-full" aria-hidden={i !== index}>
            {/* صوره البانر */}
            <img
              src={banner.image}
              alt={tr(banner, "title")}
              loading={i === 0 ? "eager" : "lazy"}
              className="position-absolute w-100 h-100 tw:inset-0 tw:object-cover"
            />
            {/* طبقه سودا شفافه فوق الصوره عشان الكلام يبان */}
            <div className="position-absolute tw:inset-0 tw:bg-black/45" />
            {/* الكلام و الزرار - بياخد اتجاه اللغه الحاليه */}
            <div dir={dir} className="container position-relative h-100 d-flex flex-column justify-content-center text-white px-4 px-md-5">
              <h2 className="fw-bold display-6">{tr(banner, "title")}</h2>
              <p className="lead mb-3">{tr(banner, "subtitle")}</p>
              <div>
                <Link to={`/?category=${encodeURIComponent(banner.category)}#products`} className="btn btn-accent btn-lg">
                  {tr(banner, "cta")}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* زرار البانر السابق */}
      <button type="button" onClick={prev} aria-label="Previous" className="btn btn-light rounded-circle position-absolute top-50 translate-middle-y tw:left-3 tw:opacity-80 d-none d-md-inline-block">
        <Icon name="chevron-left" />
      </button>
      {/* زرار البانر التالى */}
      <button type="button" onClick={next} aria-label="Next" className="btn btn-light rounded-circle position-absolute top-50 translate-middle-y tw:right-3 tw:opacity-80 d-none d-md-inline-block">
        <Icon name="chevron-right" />
      </button>

      {/* النقط تحت - كل نقطه بتودى لبانر */}
      <div className="position-absolute bottom-0 start-50 translate-middle-x d-flex gap-2 mb-3">
        {banners.map((banner, i) => (
          <button
            key={banner.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            className={`border-0 rounded-pill tw:h-2 tw:transition-all ${i === index ? "bg-white tw:w-6" : "bg-white tw:w-2 tw:opacity-50"}`}
          />
        ))}
      </div>
    </section>
  );
}
