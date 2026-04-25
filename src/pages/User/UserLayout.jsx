import { Layout, Menu } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import EmotionAnalysisPage from "./EmotionAnalysisPage.jsx";
import HistoryPage from "./HistoryPage.jsx";
import Profile from "../Profile.jsx";
import DashboardPage from "./DashboardPage.jsx";
import "../../styles/User/UserLayout.scss";

const { Sider, Content, Header } = Layout;

function UserLayout() {
  const [selectedKey, setSelectedKey] = useState("dashboard");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const renderContent = () => {
    switch (selectedKey) {
      case "dashboard":
        return <DashboardPage />;
      case "upload":
        return <EmotionAnalysisPage />;
      case "history":
        return <HistoryPage />;
      case "profile":
        return <Profile />;
      default:
        return <div>Coming soon...</div>;
    }
  };

  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
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
              { key: "upload", label: "Upload hội thoại" },
              { key: "dashboard", label: "Dashboard" },
              { key: "history", label: "Lịch sử phân tích" },
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
        <Header style={{ color: "#fff", flexShrink: 0 }}>User Panel</Header>

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

export default UserLayout;
