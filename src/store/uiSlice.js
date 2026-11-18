import { createSlice } from "@reduxjs/toolkit";

// slice خاص باختيارات المستخدم: اللغه و العمله
// بيتحفظوا فى localStorage عشان لو عمل refresh يفضل نفس الاختيار
// الافتراضى: عربى + جنيه مصرى

// بيقرا قيمه من localStorage - و لو مش موجوده او مش من القيم المسموحه يرجع الافتراضى
const read = (key, allowed, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return allowed.includes(value) ? value : fallback;
  } catch {
    return fallback;
  }
};

// بيحفظ قيمه فى localStorage
const save = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* لو التخزين مش متاح نكمل عادى */
  }
};

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    lang: read("lang", ["ar", "en"], "ar"), // اللغه
    currency: read("currency", ["EGP", "USD"], "EGP"), // العمله
  },
  reducers: {
    // تحديد لغه معينه
    setLang: (state, action) => {
      state.lang = action.payload;
      save("lang", action.payload);
    },
    // التبديل بين العربى و الانجليزى (زرار الناف بار)
    toggleLang: (state) => {
      state.lang = state.lang === "ar" ? "en" : "ar";
      save("lang", state.lang);
    },
    // تغيير العمله (جنيه / دولار)
    setCurrency: (state, action) => {
      state.currency = action.payload;
      save("currency", action.payload);
    },
  },
});

export const { setLang, toggleLang, setCurrency } = uiSlice.actions;
export default uiSlice.reducer;
