import { useEffect, useState } from "react";
import { getUserByIdApi, updateUserApi } from "../services/userService";
import "../styles/Profile.scss";

const BASE_URL = "http://localhost:3000";

function Profile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    id: "",
    email: "",
    fullName: "",
    role: "",
    status: "",
    image: "",
    imageFile: null,
  });

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (!userData?.id) return;

        const res = await getUserByIdApi(userData.id);

        if (res?.data?.errCode === 0) {
          setUser(res.data.user);
          setForm({ ...res.data.user, imageFile: null });
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
        setForm({ ...res.data.user, imageFile: null });
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) return <div className="profile-loading">Loading...</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-top">
          <div className="profile-avatar">
            {!isEditing && user.image && (
              <img src={`${BASE_URL}/uploads/${user.image}`} alt="avatar" />
            )}

            {isEditing && (
              <>
                <input type="file" onChange={handleImageChange} />
                {form.imageFile ? (
                  <img
                    src={URL.createObjectURL(form.imageFile)}
                    alt="preview"
                  />
                ) : (
                  form.image && (
                    <img
                      src={`${BASE_URL}/uploads/${form.image}`}
                      alt="avatar"
                    />
                  )
                )}
              </>
            )}
          </div>

          <div className="profile-info">
            <h2>Thông tin cá nhân</h2>
            <p>
              <b>Email:</b> {user.email}
            </p>

            <div className="profile-field">
              <label>Họ tên:</label>
              {isEditing ? (
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                />
              ) : (
                <span>{user.fullName}</span>
              )}
            </div>

            <div className="profile-field">
              <label>Role:</label>
              <span>{user.role}</span>
            </div>

            <div className="profile-field">
              <label>Trạng thái:</label>
              <span>{user.status}</span>
            </div>
          </div>

          <div className="profile-actions">
            {!isEditing ? (
              <button className="btn edit" onClick={() => setIsEditing(true)}>
                Chỉnh sửa
              </button>
            ) : (
              <>
                <button className="btn save" onClick={handleUpdate}>
                  Lưu
                </button>
                <button
                  className="btn cancel"
                  onClick={() => setIsEditing(false)}
                >
                  Hủy
                </button>
              </>
            )}
          </div>
        </div>
        <div className="profile-bottom">
          <p>comming soon...</p>
        </div>
      </div>
    </div>
  );
}

export default Profile;
