import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import { registerUser } from "../store/authSlice";
import "./Auth.css";

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // هذا يقوم بتحديد اذا كان المستخدم يقوم بعملية تسجيل الدخول او تسجيل مستخدم جديد او تسجيل خروج وده بيتم عن طريق ال status state وده بيتم عن طريق ال extraReducers في authSlice.js
  const submitting = status === "loading";

    const handleSubmit = async (e) => {
      // هذا يقوم بمنع الصفحة من التحديث عند الضغط على زر تسجيل الدخول وده بيتم عن طريق ال preventDefault() method
      e.preventDefault();
      const result = await dispatch(registerUser({ name, email, password }));
      // هذا يقوم بتحديد اذا كان المستخدم قام بتسجيل مستخدم جديد بنجاح وده بيتم عن طريق استخدام ال match method وده بيتم عن طريق ال registerUser async thunk
      if (registerUser.fulfilled.match(result)) {
        navigate("/");
      }
    };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create an account</h1>
        <p className="auth-subtitle">Sign up to get started</p>
        {error && <div className="error-banner">{typeof error === 'object' ? error.message : error}</div>}
        <form onSubmit={handleSubmit}>
            <div className="form-field">
                <label htmlFor="name">Name</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-field">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-field">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <button className="btn" type="submit" disabled={submitting}>
                {submitting ? "Creating account..." : "Sign Up"}
            </button>
        </form>
            <p className="auth-footer">Already have an account? <Link to="/login">Login</Link></p>
        </div>
    </div>
  );
}
    


