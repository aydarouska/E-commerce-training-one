import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import * as AuthApi from '../api/auth';
import { getErrorMessage } from "../api/errors";


export const loginUser = createAsyncThunk(
    "auth/login", 
    async ({email, password}, {rejectWithValue}) => {
        try {
            const res = await AuthApi.login({email, password});
            return res.data;// تم تعديلها منdata.data الى data لانها كانت تعيد كائن يحتوي على data وداخلها data اخرى
        } catch (error) {
            return rejectWithValue(getErrors(error));
        }
    }
)

export const registerUser = createAsyncThunk(
    "auth/register", 
    async ({name, email, password}, {rejectWithValue}) => {
        try {
            const res = await AuthApi.register({name, email, password});
            return res.data.data;// تم تعديلها منdata.data الى data لانها كانت تعيد كائن يحتوي على data وداخلها data اخرى 
        } catch (error) {
            return rejectWithValue(getErrors(error));
        }
    },
);

export const fetchMe = createAsyncThunk(
    "auth/fetchMe",
    async (_, {rejectWithValue}) => {
        try {
            const res = await AuthApi.getMe();
            return res.data.data.user;
        } catch (error) {
            return rejectWithValue(getErrors(error));
        }
    },
);

export const logoutUser = createAsyncThunk(
    "auth/logout",
    async () => {
        await AuthApi.logout();
    });

const initialState  = {
    user: null,
    initializing: Boolean(localStorage.getItem("token")),
    status: "idle",
    error: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState ,
   //   , و ده بيتم عن طريق redducers error state هى اشياء ليس علاقه بالسيرفر يعنى مثلا لو المستخدم ضغط على زر تسجيل الدخول وحدث خطأ فى البيانات المدخله يعنى مثلا الايميل او الباسورد غلط هيتم تخزين الخطأ فى ال state وده بيتم عن طريق ال reducers
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
   // هدى اشياء لها علاقه بالسيرفر يعنى مثلا لو المستخدم ضغط على زر تسجيل الدخول وحدث خطأ فى البيانات المدخله يعنى مثلا الايميل او الباسورد غلط هيتم تخزين الخطأ فى 
    extraReducers: (builder) => {
        builder
//دى الحاله بتاعه تسجيل الدخول 
            .addCase(loginUser.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.user = action.payload.user;
                localStorage.setItem("token", action.payload.token);
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
//دى الحاله بتاعه تسجيل مستخدم جديد
            .addCase(registerUser.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.user = action.payload.user;
                localStorage.setItem("token", action.payload.token);
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
//دى الحاله بتاعه جلب بيانات المستخدم الحالي بعد تسجيل الدخول مثلا فى حاله الضغط على البروفايل
            .addCase(fetchMe.pending, (state) => {
                state.initializing  = true;
                state.error = null;
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
//دى الحاله بتاعه تسجيل خروج المستخدم و بتنجح اذا تم تسجيل  الخروج بنجاح و بتفشل اذا حدث خطأ فى تسجيل الخروج 
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.status = "idle";
                localStorage.removeItem("token");
            })
            .addCase(logoutUser.rejected, (state) => {
                state.user = null;
                localStorage.removeItem("token");
            });
    },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;