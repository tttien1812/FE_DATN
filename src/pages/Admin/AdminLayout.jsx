import { Layout, Menu } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Dashboard from "./AdminDashboard.jsx";
import UserManage from "./UserManagement";
import Profile from "../Profile.jsx";
import "../../styles/Admin/AdminLayout.scss";

const { Sider, Content, Header } = Layout;

function AdminLayout() {
  const [selectedKey, setSelectedKey] = useState("dashboard");

  const navigate = useNavigate();

  const handleLogout = () => {
    // Xóa thông tin đăng nhập
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
      default:
        return <div>Coming soon...</div>;
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", overflow: "hidden" }}>
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
        <Header style={{ color: "#fff", flexShrink: 0 }}>Admin Panel</Header>

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
