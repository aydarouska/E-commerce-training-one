import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as getproductsApi from "../api/products";
import { getErrorMessage } from "../api/errors";

// جلب المنتجات من السيرفر
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
   async (page, { rejectWithValue }) => {
  try {
    // تمرير رقم الصفحة لطلب الـ API
    const response = await getproductsApi.getproducts();
    return response.data;// تأكد هل البيانات المرجعة تحتاج .data أم .data.data حسب الـ Backend
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
},
);
// جلب التصنيفات (تمت إضافتها لحل الخطأ)
export const fetchCategories = createAsyncThunk(
  "products/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getproductsApi.getCategories(); // تأكد من اسم الدالة في ملف api/products
      return response.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);
// إضافة Thunk لجلب المنتجات المميزة
export const fetchFeaturedProducts = createAsyncThunk(
  "products/fetchFeaturedProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getproductsApi.getproducts({ isFeatured: true });
      return response.data;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);
//لجلب أحدث المنتجات
export const fetchLatestProducts = createAsyncThunk(
  "products/fetchLatest",
  async (_, { rejectWithValue }) => {
    try {
      const res = await productsApi.getLatestProducts();
      return res.data.data.products;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);
// لجلب منتج معين عن طريق الـ ID
export const fetchProductById = createAsyncThunk(
  "products/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await productsApi.getProductById(id);
      return res.data.data.product;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  },
);


const initialState = {
  items: [], // الحاله المبدئيه للمنتجات تكون مصفوفه فارغه
  page: 1, // الحاله المبدئيه للصفحه تكون 1
  totalPages: 1, // الحاله المبدئيه لعدد الصفحات تكون 1
  totalProducts: 0,// الحاله المبدئيه لعدد المنتجات تكون 0
  status: "idle", // الحاله المبدئيه للمنتجات تكون idle
  error: null, // الحاله المبدئيه للمنتجات تكون null
  // إضافة حالات التصنيفات
  categories: [],
  categoriesStatus: "idle",
  featuredItems: [],
  featuredStatus: "idle",
  latestItems: [],
  latestStatus: "idle",
  currentProduct: null,
  currentProductStatus: "idle",
  currentProductError: null,
};

const productSlice = createSlice({
  name: "products", // اسم السلايس يكون products لان هناك سلايس اخرى خاصه باشياء اخرى و كل منهم لها اسم معين
  initialState, // الحاله المبدئيه للمنتجات تكون كما هو موضح في initialState
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
      state.currentProductStatus = "idle";
      state.currentProductError = null;
    },
  }, 
  // هى خاصه بالتغيرات التى ليس لها علاقه بالسيرفر asyncThunk و لكن فى هذا المشروع لا يوجد تغيرات من هذا النوع
  extraReducers: (builder) => {
    builder
    // الحاله المبدئيه للمنتجات تكون loading
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading"; // تحميل المنتجات من السيرفر و يتم تغير الحاله الى loading و يتم غلق الزرار و اظهار لودر فى صفحه المنتجات
        state.error = null; // يتم حذف الاخطاء السابق
      })
      // هى حاله عند نجاح جلب المنتجات من السيرفر و يتم تغير الحاله الى succeeded و يتم حفظ المنتجات فى state.items و حفظ الصفحه الحاليه فى state.page و حفظ عدد الصفحات فى state.totalPages و حفظ عدد المنتجات فى state.totalProducts
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded"; // نجاح جلب المنتجات من السيرفر
        state.items = action.payload.products; // حفظ المنتجات فى state.items
        state.page = action.payload.page; // حفظ الصفحه الحاليه فى state.page
        state.totalPages = action.payload.totalPages; // حفظ عدد الصفحات فى state.totalPages
        state.totalProducts = action.payload.totalProducts; // حفظ عدد المنتجات فى state.totalProducts

      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })


      .addCase(fetchCategories.pending, (state) => {
        state.categoriesStatus = "loading";
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesStatus = "succeeded";
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state) => {
        state.categoriesStatus = "failed";
      })



      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.featuredStatus = "loading";
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featuredStatus = "succeeded";
        state.featuredItems = action.payload;
      })
      .addCase(fetchFeaturedProducts.rejected, (state) => {
        state.featuredStatus = "failed";
      })

      
      .addCase(fetchLatestProducts.pending, (state) => {
        state.latestStatus = "loading";
      })
      .addCase(fetchLatestProducts.fulfilled, (state, action) => {
        state.latestStatus = "succeeded";
        state.latestItems = action.payload;
      })
      .addCase(fetchLatestProducts.rejected, (state) => {
        state.latestStatus = "failed";
      })


      .addCase(fetchProductById.pending, (state) => {
        state.currentProductStatus = "loading";
        state.currentProductError = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.currentProductStatus = "succeeded";
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.currentProductStatus = "failed";
        state.currentProductError = action.payload;
      });
  },
});


export const { clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;