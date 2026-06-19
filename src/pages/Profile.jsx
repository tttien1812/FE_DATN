import { useEffect, useState, useRef } from "react";
import { getUserByIdApi, updateUserApi } from "../services/userService";
import "../styles/Profile.scss";

const BASE_URL = "http://localhost:3000";

function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);

  // Form state giữ nguyên các trường cũ và mock thêm các trường mới theo hình
  const [form, setForm] = useState({
    id: "",
    email: "",
    fullName: "",
    role: "",
    status: "",
    image: "",
    imageFile: null,
    // Các trường thêm mới (Mock dữ liệu)
    phone: "0366 843 567",
    dob: "2004-01-01",
    gender: "Nam",
    password: "••••••••",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (!userData?.id) return;

        const res = await getUserByIdApi(userData.id);

        if (res?.data?.errCode === 0) {
          setUser(res.data.user);
          setForm((prev) => ({
            ...prev,
            ...res.data.user,
            imageFile: null,
          }));
        }
      } catch (error) {
        console.error("Lỗi:", error);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setForm({
      ...form,
      imageFile: file,
    });
  };

  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("id", form.id);
      formData.append("fullName", form.fullName);
      formData.append("role", form.role);
      formData.append("status", form.status);

      if (form.imageFile) {
        formData.append("image", form.imageFile);
      }

      await updateUserApi(formData);
      alert("Cập nhật thành công!");
      setIsEditing(false);

      const res = await getUserByIdApi(form.id);
      if (res?.data?.errCode === 0) {
        setUser(res.data.user);
        setForm((prev) => ({
          ...prev,
          ...res.data.user,
          imageFile: null,
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setForm((prev) => ({
        ...prev,
        ...user,
        imageFile: null,
      }));
    }
  };

  if (!user) return <div className="profile-loading">Loading...</div>;

  // Xử lý lấy ảnh preview hiển thị linh hoạt
  const getAvatarSrc = () => {
    if (form.imageFile) {
      return URL.createObjectURL(form.imageFile);
    }
    if (user.image) {
      return `${BASE_URL}/uploads/${user.image}`;
    }
    return null;
  };

  return (
    <div className="profile-page-wrapper">
      {/* TIÊU ĐỀ TRANG CHUẨN ĐỒNG BỘ */}
      <div className="profile-page-header">
        <h2>Thông tin cá nhân</h2>
        <p className="subtitle">
          Quản lý và cập nhật thông tin tài khoản của bạn
        </p>
      </div>

      <div className="profile-layout-container">
        {/* ================= CỘT TRÁI: TỔNG QUAN TÀI KHOẢN ================= */}
        <div className="profile-sidebar-card">
          <div className="avatar-overview-section">
            <div className="avatar-wrapper-large">
              {getAvatarSrc() ? (
                <img src={getAvatarSrc()} alt="avatar" />
              ) : (
                <div className="avatar-initial-placeholder">
                  {user.fullName?.charAt(0).toUpperCase()}
                </div>
              )}
              {isEditing && (
                <button
                  className="btn-change-avatar-overlay"
                  onClick={() => fileInputRef.current.click()}
                >
                  <i className="bi bi-camera-fill"></i>
                </button>
              )}
            </div>

            <h3 className="user-display-name">
              {user.fullName || "Chưa cập nhật"}
            </h3>
            <span className="user-role-badge">{user.role || "USER"}</span>
          </div>

          <div className="quick-info-list">
            <div className="info-row">
              <i className="bi bi-envelope icon-muted"></i>
              <div className="info-content">
                <span className="label">Email</span>
                <span className="value">{user.email}</span>
              </div>
            </div>
            <div className="info-row">
              <i className="bi bi-telephone icon-muted"></i>
              <div className="info-content">
                <span className="label">Số điện thoại</span>
                <span className="value">{form.phone}</span>
              </div>
            </div>
            <div className="info-row">
              <i className="bi bi-calendar-event icon-muted"></i>
              <div className="info-content">
                <span className="label">Ngày tham gia</span>
                <span className="value">06/05/2026</span>
              </div>
            </div>
            <div className="info-row">
              <i className="bi bi-shield-check icon-muted"></i>
              <div className="info-content">
                <span className="label">Trạng thái</span>
                <span
                  className={`status-tag ${user.status?.toLowerCase() === "active" ? "active" : ""}`}
                >
                  {user.status?.toLowerCase() === "active"
                    ? "Hoạt động"
                    : "Tạm khóa"}
                </span>
              </div>
            </div>
            <div className="info-row">
              <i className="bi bi-person-badge icon-muted"></i>
              <div className="info-content">
                <span className="label">Vai trò</span>
                <span className="role-tag-sub">{user.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= CỘT PHẢI: FORM CHI TIẾT TÀI KHOẢN ================= */}
        <div className="profile-main-form-card">
          <div className="form-card-header">
            <h3>Cập nhật thông tin</h3>
            {!isEditing && (
              <button
                className="btn-trigger-edit"
                onClick={() => setIsEditing(true)}
              >
                <i className="bi bi-pencil"></i> Chỉnh sửa
              </button>
            )}
          </div>

          <div className="form-grid-content">
            {/* Họ và tên */}
            <div className="form-field-group">
              <label>Họ và tên</label>
              <input
                type="text"
                name="fullName"
                className="custom-form-input"
                value={form.fullName}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Nhập họ và tên..."
              />
            </div>

            {/* Email (Khóa không cho sửa giống hình mẫu) */}
            <div className="form-field-group">
              <label>Email</label>
              <input
                type="email"
                className="custom-form-input input-disabled"
                value={form.email}
                disabled
              />
            </div>

            {/* Số điện thoại */}
            <div className="form-field-group">
              <label>Số điện thoại</label>
              <input
                type="text"
                name="phone"
                className="custom-form-input"
                value={form.phone}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            {/* Ngày sinh */}
            <div className="form-field-group">
              <label>Ngày sinh</label>
              <input
                type="date"
                name="dob"
                className="custom-form-input"
                value={form.dob}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>

            {/* Giới tính */}
            <div className="form-field-group">
              <label>Giới tính</label>
              <select
                name="gender"
                className="custom-form-select"
                value={form.gender}
                onChange={handleChange}
                disabled={!isEditing}
              >
                <option value="Nam">♂ Nam</option>
                <option value="Nữ">♀ Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            {/* Ảnh đại diện (Phía cột form) */}
            <div className="form-field-group">
              <label>Ảnh đại diện</label>
              <div className="form-avatar-action-row">
                <div className="mini-avatar-preview">
                  {getAvatarSrc() ? (
                    <img src={getAvatarSrc()} alt="mini avatar" />
                  ) : (
                    <i className="bi bi-person"></i>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                  accept="image/*"
                />
                <button
                  type="button"
                  className="btn-upload-action"
                  onClick={() => fileInputRef.current.click()}
                  disabled={!isEditing}
                >
                  <i className="bi bi-upload"></i> Đổi ảnh
                </button>
              </div>
            </div>

            {/* Mật khẩu */}
            <div className="form-field-group full-width-field">
              <label>Mật khẩu</label>
              <div className="password-input-wrapper">
                <input
                  type="password"
                  className="custom-form-input input-disabled"
                  value={form.password}
                  disabled
                />
                <button
                  type="button"
                  className="btn-inner-password"
                  disabled={!isEditing}
                >
                  <i className="bi bi-lock"></i> Đổi mật khẩu
                </button>
              </div>
            </div>
          </div>

          {/* Dòng Alert thông báo */}
          <div className="form-info-alert">
            <i className="bi bi-info-circle-fill"></i>
            <span>
              Email không thể thay đổi. Vui lòng liên hệ Admin nếu bạn cần cập
              nhật.
            </span>
          </div>

          {/* Nhóm Button hành động chân trang */}
          {isEditing && (
            <div className="form-actions-footer">
              <button className="btn-form-cancel" onClick={handleCancel}>
                Hủy
              </button>
              <button className="btn-form-submit" onClick={handleUpdate}>
                Lưu thay đổi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
