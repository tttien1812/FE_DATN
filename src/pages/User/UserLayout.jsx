// import { Layout, Menu } from "antd";
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// import EmotionAnalysisPage from "./EmotionAnalysisPage.jsx";
// import HistoryPage from "./HistoryPage.jsx";
// import Profile from "../Profile.jsx";
// import DashboardPage from "./DashboardPage.jsx";
// import "../../styles/User/UserLayout.scss";

// const { Sider, Content, Header } = Layout;

// function UserLayout() {
//   const [selectedKey, setSelectedKey] = useState("dashboard");
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     navigate("/login");
//   };

//   const renderContent = () => {
//     switch (selectedKey) {
//       case "dashboard":
//         return <DashboardPage />;
//       case "upload":
//         return <EmotionAnalysisPage />;
//       case "history":
//         return <HistoryPage />;
//       case "profile":
//         return <Profile />;
//       default:
//         return <div>Coming soon...</div>;
//     }
//   };

//   return (
//     <Layout style={{ height: "100vh", overflow: "hidden" }}>
//       <Sider
//         className="admin-sider"
//         style={{ height: "100vh", overflow: "hidden" }}
//       >
//         <div className="menu-top">
//           <Menu
//             theme="dark"
//             mode="inline"
//             selectedKeys={[selectedKey]}
//             onClick={(e) => {
//               setSelectedKey(e.key);
//             }}
//             items={[
//               { key: "upload", label: "Upload hội thoại" },
//               { key: "dashboard", label: "Dashboard" },
//               { key: "history", label: "Lịch sử phân tích" },
//             ]}
//           />
//         </div>

//         <div className="menu-profile">
//           <Menu
//             theme="dark"
//             mode="inline"
//             onClick={(e) => setSelectedKey(e.key)}
//             items={[{ key: "profile", label: "Thông tin cá nhân" }]}
//           />
//         </div>

//         <div className="menu-bottom">
//           <Menu
//             theme="dark"
//             mode="inline"
//             onClick={handleLogout}
//             items={[{ key: "logout", label: "Đăng xuất" }]}
//           />
//         </div>
//       </Sider>

//       <Layout style={{ height: "100vh" }}>
//         <Header style={{ color: "#fff", flexShrink: 0 }}>
//           VoxSense User Panel
//         </Header>

//         <Content
//           style={{
//             padding: 20,
//             overflowY: "auto",
//             height: "100%",
//           }}
//         >
//           {renderContent()}
//         </Content>
//       </Layout>
//     </Layout>
//   );
// }

// export default UserLayout;

import { Layout, Menu, Avatar, Space } from "antd";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserOutlined } from "@ant-design/icons"; // Thêm icon fallback nếu chưa có ảnh

import EmotionAnalysisPage from "./EmotionAnalysisPage.jsx";
import HistoryPage from "./HistoryPage.jsx";
import Profile from "../Profile.jsx";
import DashboardPage from "./DashboardPage.jsx";

// Import API service
import { getUserByIdApi } from "../../services/userService";
import "../../styles/User/UserLayout.scss";

const { Sider, Content, Header } = Layout;
const BASE_URL = "http://localhost:3000";

function UserLayout() {
  const [selectedKey, setSelectedKey] = useState("dashboard");
  const [currentUser, setCurrentUser] = useState(null); // State lưu user đăng nhập
  const navigate = useNavigate();

  // Gọi API lấy thông tin User để hiển thị trên Header
  useEffect(() => {
    const fetchHeaderUser = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (!userData?.id) return;

        const res = await getUserByIdApi(userData.id);
        if (res?.data?.errCode === 0) {
          setCurrentUser(res.data.user);
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin user tại Header:", error);
      }
    };

    fetchHeaderUser();
  }, []);

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
      {/* GIỮ NGUYÊN HOÀN TOÀN PHẦN GIAO DIỆN SIDER */}
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
        {/* DESIGN LẠI PHẦN HEADER THAY VÌ CHỈ CHỨA CHỮ ĐƠN THUẦN */}
        <Header className="custom-user-header">
          <div className="header-logo-area">
            <span className="system-name">VoxSense</span>
            <span className="system-subtitle">User Panel</span>
          </div>

          <div
            className="header-user-area"
            onClick={() => setSelectedKey("profile")}
          >
            <Space size={12}>
              <span className="user-fullname">
                {currentUser ? currentUser.fullName : "Đang tải..."}
              </span>
              <Avatar
                size={40}
                className="user-avatar-img"
                src={
                  currentUser?.image
                    ? `${BASE_URL}/uploads/${currentUser.image}`
                    : null
                }
                icon={!currentUser?.image && <UserOutlined />}
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

export default UserLayout;
