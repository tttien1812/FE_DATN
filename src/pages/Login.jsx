import { useState } from "react";
import { loginApi } from "../services/userService";
import { useNavigate } from "react-router-dom";
import "../styles/login.scss";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Vui lòng nhập đầy đủ email và password");
      return;
    }

    try {
      const res = await loginApi({ email, password });

      if (res.data.errCode === 0) {
        const user = res.data.user;

        localStorage.setItem("user", JSON.stringify(user));

        localStorage.setItem("userId", user.id);
        console.log("Login success, userId:", user.id);

        if (user.role === "ADMIN") {
          navigate("/admin");
        } else {
          navigate("/user");
        }
      } else {
        setError(res.data.errMessage);
      }
    } catch (e) {
      setError("Lỗi server");
      console.log(e);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="title">Đăng nhập</h2>

        <div className="form-group">
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="error">{error}</p>}

        <button className="btn-login" onClick={handleLogin}>
          Đăng nhập
        </button>

        <p className="register-text">
          Chưa có tài khoản?{" "}
          <span onClick={() => navigate("/register")}>Đăng ký</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
