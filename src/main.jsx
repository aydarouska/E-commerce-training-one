import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import "./styles/index.css";
import { store } from "./store/store";
import { applyBootstrapDirection } from "./utils/bootstrapDirection";
import App from "./App.jsx";

// بنحمل ملف bootstrap بالاتجاه الصح (عربى = rtl) قبل ما الصفحه تترسم عشان مايحصلش "نطه" فى الشكل
applyBootstrapDirection(store.getState().ui.lang === "ar" ? "rtl" : "ltr");

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* Provider بيدى الـ redux store لكل المكونات */}
    <Provider store={store}>
      {/* basename = /E-commerce-training-one/ (من vite.config.js) */}
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
