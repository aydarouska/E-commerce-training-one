import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../store/authSlice";
import "./Auth.css";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submitting = status === "loading";

    // const handleSubmit = async (e) => {
    //   e.preventDefault();
    //   console.log("Submitting login for:", email); // لتتأكد في الـ Console أن الزر يعمل
    //   const result = await dispatch(loginUser({ email, password }));
    //   if (loginUser.fulfilled.match(result)) {
    //     navigate("/");
    //   }
    // };

    // هذا يقوم بتحديد اذا كان المستخدم يقوم بعملية تسجيل الدخول او تسجيل مستخدم جديد او تسجيل خروج وده بيتم عن طريق ال status state وده بيتم عن طريق ال extraReducers في authSlice.js
    const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // إرسال طلب تسجيل الدخول
      const actionResult = await dispatch(loginUser({ email, password }));
      
      // إذا تم التنفيد بنجاح في Redux Toolkit
      if (loginUser.fulfilled.match(actionResult)) {
        // حفظ التوكن في localStorage لتأمين الجلسة إن لم يكن يتحفظ تلقائياً
        const resData = actionResult.payload;
        const token = resData?.data?.token || resData?.token;
        if (token) {
          localStorage.setItem("token", token);
        }

        // التوجيه فوراً للصفحة الرئيسية
        navigate("/");
      } else {
        console.error("Login failed action:", actionResult);
      }
    } catch (err) {
      console.error("Login exception:", err);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="auth-subtitle">Log in to your account</p>
        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          
            <div className="form-field">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-field">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <button className="btn" type="submit" >
                {submitting ? "Logging in..." : "Log in"}
            </button>
        </form>
            <p className="auth-footer">Don't have an account? <Link to="/register">Sign Up</Link></p>
        </div>
    </div>
  );
}