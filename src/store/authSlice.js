import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as AuthApi from "../api/auth";
import { getErrorMessage } from "../api/errors";

// تسجيل الدخول: بيرجع { user, token } ونخزن التوكن في localStorage
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await AuthApi.login({ email, password });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// إنشاء حساب جديد
export const registerUser = createAsyncThunk(
  "auth/register",
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const res = await AuthApi.register({ name, email, password });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

// جلب بيانات المستخدم الحالي لو فيه توكن محفوظ (عند فتح الموقع)
export const fetchMe = createAsyncThunk("auth/fetchMe", async (_, { rejectWithValue }) => {
  try {
    const res = await AuthApi.getMe();
    return res.data.data.user;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

// تسجيل الخروج: الخروج الحقيقي هو مسح التوكن من المتصفح
export const logoutUser = createAsyncThunk("auth/logout", async () => {
  try {
    await AuthApi.logout();
  } catch {
    /* حتى لو الطلب فشل بنعمل خروج من المتصفح عادى */
  }
});

const hasToken = () => {
  try {
    return Boolean(localStorage.getItem("token"));
  } catch {
    return false;
  }
};

const initialState = {
  user: null,
  // true أثناء التحقق من التوكن عند أول تحميل للموقع
  initializing: hasToken(),
  status: "idle",
  error: null,
};

const setSession = (state, action) => {
  state.status = "succeeded";
  state.user = action.payload.user;
  localStorage.setItem("token", action.payload.token);
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, setSession)
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, setSession)
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchMe.pending, (state) => {
        state.initializing = true;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.initializing = false;
        state.user = action.payload;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.initializing = false;
        state.user = null;
        localStorage.removeItem("token");
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.status = "idle";
        localStorage.removeItem("token");
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
