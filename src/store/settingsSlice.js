import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as settingsApi from "../api/settings";
import { getErrorMessage } from "../api/errors";

// اعدادات المتجر العامه: سعر الدولار - مصاريف الشحن - طرق الدفع المتاحه و بيانات حسابات انستاباى و البنك
export const fetchSettings = createAsyncThunk(
  "settings/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await settingsApi.getSettings();
      return res.data.data.settings;
    } catch (err) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

const settingsSlice = createSlice({
  name: "settings",
  // data = الاعدادات نفسها (null لحد ما توصل من السيرفر)
  initialState: { data: null, status: "idle", error: null },
  reducers: {
    // تحديث جزء من الاعدادات من غير ما نطلبها تانى من السيرفر
    settingsUpdated: (state, action) => {
      state.data = { ...state.data, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // جارى التحميل
      .addCase(fetchSettings.pending, (state) => {
        state.status = "loading";
      })
      // وصلت الاعدادات
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      // حصل خطأ
      .addCase(fetchSettings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const { settingsUpdated } = settingsSlice.actions;
export default settingsSlice.reducer;
