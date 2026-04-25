import { useState } from "react";
import { createUserApi } from "../services/userService";
import { useNavigate } from "react-router-dom";
import "../styles/Register.scss";

const Register = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");

    if (!email || !password || !fullName) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      const res = await createUserApi({
        email,
        password,
        fullName,
      });

      if (res.data.errCode === 0) {
        alert("Đăng ký thành công");
        navigate("/login");
      } else {
        setError(res.data.errMessage);
      }
    } catch (e) {
      setError("Lỗi server");
      console.log(e);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h2 className="title">Đăng ký</h2>

        <div className="form-group">
          <input
            type="text"
            placeholder="Họ tên"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

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

        <button className="btn-register" onClick={handleRegister}>
          Đăng ký
        </button>

        <p className="login-text">
          Đã có tài khoản?{" "}
          <span onClick={() => navigate("/login")}>Đăng nhập</span>
        </p>
      </div>
    </div>
  );
};

export default Register;
