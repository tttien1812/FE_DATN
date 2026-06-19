import { Layout, Menu, Avatar, Space } from "antd";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons";

import Dashboard from "./AdminDashboard.jsx";
import UserManage from "./UserManagement";
import Profile from "../Profile.jsx";
import Conversations from "./ConversationsPage.jsx";

// Import API service tương tự trang User để lấy ảnh đại diện
import { getUserByIdApi } from "../../services/userService";
import "../../styles/Admin/AdminLayout.scss";

const { Sider, Content, Header } = Layout;
const BASE_URL = "http://localhost:3000";

function AdminLayout() {
  const [selectedKey, setSelectedKey] = useState("dashboard");
  const [currentAdmin, setCurrentAdmin] = useState(null); // State lưu admin đăng nhập
  const navigate = useNavigate();

  // Gọi API lấy thông tin Admin để hiển thị trên Header
  useEffect(() => {
    const fetchHeaderAdmin = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (!userData?.id) return;

        const res = await getUserByIdApi(userData.id);
        if (res?.data?.errCode === 0) {
          setCurrentAdmin(res.data.user);
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin admin tại Header:", error);
      }
    };

    fetchHeaderAdmin();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const renderContent = () => {
    switch (selectedKey) {
      case "dashboard":
        return <Dashboard />;
      case "users":
        return <UserManage />;
      case "profile":
        return <Profile />;
      case "conversations":
        return <Conversations />;
      default:
        return <div>Coming soon...</div>;
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", overflow: "hidden" }}>
      {/* GIỮ NGUYÊN HOÀN TOÀN PHẦN GIAO DIỆN CỦA SIDER */}
      <Sider
        className="admin-sider"
        style={{ height: "100vh", overflow: "hidden" }}
      >
        <div className="menu-top">
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            onClick={(e) => {
              setSelectedKey(e.key);
            }}
            items={[
              { key: "dashboard", label: "Dashboard" },
              { key: "users", label: "Quản lý người dùng" },
              { key: "conversations", label: "Hội thoại" },
              { key: "analytics", label: "Phân tích" },
            ]}
          />
        </div>

        <div className="menu-profile">
          <Menu
            theme="dark"
            mode="inline"
            onClick={(e) => setSelectedKey(e.key)}
            items={[{ key: "profile", label: "Thông tin cá nhân" }]}
          />
        </div>

        <div className="menu-bottom">
          <Menu
            theme="dark"
            mode="inline"
            onClick={handleLogout}
            items={[{ key: "logout", label: "Đăng xuất" }]}
          />
        </div>
      </Sider>

      <Layout style={{ height: "100vh" }}>
        {/* ĐỔI MỚI PHẦN HEADER ĐỒNG BỘ VỀ MÀU SẮC, KIỂU CHỮ VÀ HIỂN THỊ AVATAR */}
        <Header className="custom-admin-header">
          <div className="header-logo-area">
            <span className="system-name">VoxSense</span>
            <span className="system-subtitle">Admin Panel</span>
          </div>

          <div
            className="header-user-area"
            onClick={() => setSelectedKey("profile")}
          >
            <Space size={12}>
              <span className="user-fullname">
                {currentAdmin ? currentAdmin.fullName : "Đang tải..."}
              </span>
              <Avatar
                size={40}
                className="user-avatar-img"
                src={
                  currentAdmin?.image
                    ? `${BASE_URL}/uploads/${currentAdmin.image}`
                    : null
                }
                icon={!currentAdmin?.image && <UserOutlined />}
              />
            </Space>
          </div>
        </Header>

        <Content
          style={{
            padding: 20,
            overflowY: "auto",
            height: "100%",
          }}
        >
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
}

export default AdminLayout;
