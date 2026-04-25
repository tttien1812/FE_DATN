import { useEffect, useState, useCallback } from "react";
import {
  getAllUsersApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
} from "../../services/userService";
import "../../styles/Admin/UserManagement.scss";

const Admin = () => {
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [preview, setPreview] = useState(""); // ✅ thêm preview

  const [form, setForm] = useState({
    id: "",
    email: "",
    password: "",
    fullName: "",
    role: "USER",
    status: "ACTIVE",
    image: "", // giữ lại để tương thích BE cũ
    imageFile: null, // ✅ thêm file
  });

  const fetchUsers = useCallback(async () => {
    const res = await getAllUsersApi();
    if (res.data.errCode === 0) {
      setUsers(res.data.users);
    }
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      const res = await getAllUsersApi();
      if (res.data.errCode === 0) {
        setUsers(res.data.users);
      }
    };
    loadUsers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    await createUserApi(form);
    resetForm();
    fetchUsers();
    setShowModal(false);
  };

  // ✅ FIX: dùng FormData
  const handleUpdate = async () => {
    const formData = new FormData();

    formData.append("id", form.id);
    formData.append("fullName", form.fullName);
    formData.append("role", form.role);
    formData.append("status", form.status);

    if (form.imageFile) {
      formData.append("image", form.imageFile);
    }

    await updateUserApi(formData);

    resetForm();
    fetchUsers();
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xóa user này?")) {
      await deleteUserApi(id);
      fetchUsers();
    }
  };

  const resetForm = () => {
    setForm({
      id: "",
      email: "",
      password: "",
      fullName: "",
      role: "USER",
      status: "ACTIVE",
      image: "",
      imageFile: null,
    });
    setPreview("");
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setForm({
      ...user,
      password: "",
      imageFile: null,
    });

    // ✅ hiển thị ảnh cũ nếu có
    if (user.image) {
      setPreview(`http://localhost:3000/uploads/${user.image}`);
    } else {
      setPreview("");
    }

    setShowModal(true);
  };

  // ✅ FIX: dùng file thật + preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setForm({
      ...form,
      imageFile: file,
    });

    setPreview(URL.createObjectURL(file));
  };

  return (
    <>
      <div className="admin-page">
        <h2 className="admin-title">
          <i className="bi bi-people-fill"></i> User Management
        </h2>

        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <i className="bi bi-plus-circle"></i> Create User
        </button>

        <div className="admin-table-card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Full Name</th>
                <th>Avatar</th> {/* ✅ thêm cột */}
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.email}</td>
                  <td>{u.fullName}</td>

                  <td>
                    {u.image ? (
                      <img
                        src={`http://localhost:3000/uploads/${u.image}`}
                        alt="avatar"
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                        }}
                      />
                    ) : (
                      "No image"
                    )}
                  </td>

                  <td>
                    <span className={`role-badge ${u.role.toLowerCase()}`}>
                      {u.role}
                    </span>
                  </td>

                  <td>
                    <span className={`status-badge ${u.status.toLowerCase()}`}>
                      {u.status}
                    </span>
                  </td>

                  <td className="admin-actions">
                    <i
                      className="bi bi-pencil-square action-edit"
                      onClick={() => handleEdit(u)}
                    ></i>
                    <i
                      className="bi bi-trash action-delete"
                      onClick={() => handleDelete(u.id)}
                    ></i>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="modal-title">
              {form.id ? "Update User" : "Create User"}
            </h3>

            <div className="admin-form-grid">
              <input
                className="admin-input"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
              />

              {!form.id && (
                <input
                  className="admin-input"
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                />
              )}

              <input
                className="admin-input"
                name="fullName"
                placeholder="Full Name"
                value={form.fullName}
                onChange={handleChange}
              />

              <select
                className="admin-select"
                name="role"
                value={form.role}
                onChange={handleChange}
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>

              <select
                className="admin-select"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>

              {/* ✅ Upload ảnh */}
              <div>
                <input type="file" onChange={handleImageChange} />
              </div>

              {/* ✅ Preview */}
              {preview && (
                <img
                  src={preview}
                  alt="preview"
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    marginTop: 10,
                  }}
                />
              )}
            </div>

            <div className="admin-form-actions">
              {form.id ? (
                <button className="btn btn-primary" onClick={handleUpdate}>
                  Update
                </button>
              ) : (
                <button className="btn btn-primary" onClick={handleCreate}>
                  Create
                </button>
              )}

              <button
                className="btn btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Admin;
