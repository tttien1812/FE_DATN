import { useEffect, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getAdminDashboardApi,
  getAdminUserDetailApi,
  getAdminInsightApi,
} from "../../services/dashboardService";
import "../../styles/Admin/AdminDashboard.scss";

function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [insights, setInsights] = useState([]);

  const [sortBy, setSortBy] = useState("totalConversations");
  const [order, setOrder] = useState("DESC");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  const UPLOAD_URL = "http://localhost:3000/uploads";

  useEffect(() => {
    fetchData();
  }, [sortBy, order, month]);

  useEffect(() => {
    if (selectedUser) {
      fetchUserDetail(selectedUser);
    }
  }, [month, selectedUser]);

  // const fetchData = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await getAdminDashboardApi({ sortBy, order, month });
  //     if (res.data.errCode === 0) setData(res.data.data);
  //   } catch (e) {
  //     console.error(e);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchData = async () => {
    try {
      setLoading(true);

      const [dashboardRes, insightRes] = await Promise.all([
        getAdminDashboardApi({ sortBy, order, month }),
        getAdminInsightApi(month),
      ]);

      if (dashboardRes.data.errCode === 0) {
        setData(dashboardRes.data.data);
      }

      if (insightRes.data.errCode === 0) {
        setInsights(insightRes.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetail = async (userId) => {
    try {
      // setSelectedUser(userId);
      const res = await getAdminUserDetailApi({
        userId,
        month: month || data?.filter?.month,
      });
      if (res.data.errCode === 0) {
        setUserDetail(res.data.data);
      } else {
        setUserDetail(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!data)
    return <div className="loading-container">Đang tải dữ liệu...</div>;

  const getInsightByGroup = (group) => {
    return insights.find((item) => item.group === group);
  };

  const performanceInsight = getInsightByGroup("performance");
  const sentimentInsight = getInsightByGroup("customer");
  const staffInsight = getInsightByGroup("staff");
  const issueInsight = getInsightByGroup("risk");
  const reliabilityInsight = getInsightByGroup("reliability");

  const recommendationItems = [
    performanceInsight,
    sentimentInsight,
    staffInsight,
    issueInsight,
    reliabilityInsight,
  ].filter(Boolean);

  const getScoreLabel = (score) => {
    const value = Number(score || 0);

    if (value >= 0.8) return "Xuất sắc";
    if (value >= 0.65) return "Tốt";
    if (value >= 0.5) return "Trung bình";
    if (value >= 0.4) return "Cần cải thiện";
    return "Rủi ro cao";
  };

  const getScoreClass = (score) => {
    const value = Number(score || 0);

    if (value >= 0.65) return "good";
    if (value >= 0.5) return "warning";
    return "danger";
  };

  const getRoleLabel = (role) => {
    if (role === "customer") return "Trải nghiệm khách hàng";
    if (role === "staff") return "Chất lượng xử lý của nhân viên";
    return "Vai trò chưa xác định";
  };

  const getRoleDescription = (role) => {
    if (role === "customer") {
      return "Phản ánh mức độ tích cực trong phản hồi của khách hàng.";
    }

    if (role === "staff") {
      return "Phản ánh cách nhân viên tư vấn và xử lý tình huống.";
    }

    return "Dữ liệu đang được hệ thống tổng hợp.";
  };

  const getInitials = (fullName = "") => {
    const parts = fullName.trim().split(" ");

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return (
      parts[parts.length - 2].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  return (
    <div className="admin-dashboard-container">
      <header className="dashboard-header">
        <div className="header-title">
          <h1>Dashboard Toàn Hệ Thống</h1>
          <p>Theo dõi và phân tích hiệu suất cuộc gọi của nhân viên</p>
        </div>

        <div className="dashboard-filter">
          <label>Chọn tháng:</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
      </header>
      {/* (1) KPI TỔNG QUAN */}
      <section className="section-kpi">
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="icon blue">
              <i className="bi bi-mic-fill"></i>
            </div>
            <div className="info">
              <p>Tổng cuộc gọi đã phân tích</p>
              <h2>{data.totalSystem.totalAudio?.toLocaleString()}</h2>
            </div>
          </div>
          <div className="kpi-card">
            <div className="icon green">
              <i className="bi bi-star-fill"></i>
            </div>
            <div className="info">
              <p>Điểm cảm xúc trung bình</p>
              <h2>{Number(data.totalSystem.avgScore).toFixed(2)}/1</h2>
            </div>
          </div>
          <div className="kpi-card">
            <div className="icon red">
              <i className="bi bi-emoji-frown-fill"></i>
            </div>
            <div className="info">
              <p>Tỷ lệ cuộc gọi tiêu cực</p>
              <h2>{(data.totalSystem.negativeRate * 100).toFixed(1)}%</h2>
            </div>
          </div>
          <div className="kpi-card highlight">
            <div className="icon gold">
              <i className="bi bi-trophy-fill"></i>
            </div>
            <div className="info">
              <p>Nhân viên có điểm cao nhất</p>
              <h2 className="user-name-highlight">
                {data.top.topScore[0]?.User?.fullName}
              </h2>
              <span className="sub-text">
                {data.top.topScore[0]?.avgScore} điểm
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="dashboard-main-grid">
        {/* (2) BẢNG XẾP HẠNG */}
        <section className="section-table">
          <div className="card-header">
            <h3>BẢNG XẾP HẠNG NHÂN VIÊN</h3>
          </div>
          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nhân viên</th>
                  <th>Điểm TB</th>
                  <th>Tỷ lệ tiêu cực</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((u, i) => (
                  <tr
                    key={u.userId}
                    onClick={() => setSelectedUser(u.userId)}
                    className={selectedUser === u.userId ? "active-row" : ""}
                  >
                    <td>{i + 1}</td>
                    <td className="user-cell">
                      {u.image ? (
                        <img
                          src={`${UPLOAD_URL}/${u.image}`}
                          alt={u.fullName}
                        />
                      ) : (
                        <div className="avatar-placeholder">
                          {getInitials(u.fullName)}
                        </div>
                      )}

                      <span>{u.fullName}</span>
                    </td>
                    <td>
                      <b>{Number(u.avgScore).toFixed(2)}</b>
                    </td>
                    <td
                      className={
                        +u.negativeRate > 0.2 ? "text-danger" : "text-success"
                      }
                    >
                      {(u.negativeRate * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* (3) CHI TIẾT USER - PHẦN BẠN CẦN ĐÃ QUAY LẠI */}
        <section className="section-user-detail">
          <div className="card-header">
            <h3>PHÂN TÍCH NHÂN VIÊN</h3>
          </div>
          {!userDetail ? (
            <div className="empty-state">
              👉 Chọn nhân viên để xem phân tích chi tiết
            </div>
          ) : (
            <div className="user-detail-content">
              <div className="profile-header">
                {userDetail.user.image ? (
                  <img
                    src={`${UPLOAD_URL}/${userDetail.user.image}`}
                    alt={userDetail.user.fullName}
                    className="avatar-large"
                  />
                ) : (
                  <div className="avatar-large-placeholder">
                    {getInitials(userDetail.user.fullName)}
                  </div>
                )}
                <div className="meta">
                  <h4>{userDetail.user.fullName}</h4>
                  <p>{userDetail.user.email}</p>

                  <span
                    className={`performance-badge ${getScoreClass(userDetail.kpi.avgScore)}`}
                  >
                    {getScoreLabel(userDetail.kpi.avgScore)}
                  </span>
                </div>
              </div>

              <div className="detail-kpi-grid">
                <div className="mini-card">
                  <p>Số lượng cuộc gọi</p>
                  <h4>{userDetail.kpi.totalAudio}</h4>
                </div>
                <div className="mini-card">
                  <p>Điểm trung bình</p>
                  <h4>{userDetail.kpi.avgScore}</h4>
                  <span
                    className={
                      userDetail.comparison.scoreDiff >= 0 ? "up" : "down"
                    }
                  >
                    {userDetail.comparison.scoreDiff >= 0 ? "↑" : "↓"}{" "}
                    {Math.abs(userDetail.comparison.scoreDiff)} so với hệ thống
                  </span>
                </div>
                <div className="mini-card">
                  <p>Tỷ lệ cuộc gọi tiêu cực</p>
                  <h4>{(userDetail.kpi.negativeRate * 100).toFixed(1)}%</h4>
                </div>
              </div>

              {/* BIỂU ĐỒ SO SÁNH */}
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={userDetail.chart}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="date"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="userScore"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      name="Nhân viên"
                    />
                    <Line
                      type="monotone"
                      dataKey="systemScore"
                      stroke="#cbd5e1"
                      strokeDasharray="5 5"
                      name="Trung bình hệ thống"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* BẢNG SPEAKER PHÂN TÍCH */}
              <div className="speaker-analysis">
                <h5>Phân tích hiệu suất theo góc nhìn</h5>

                <div className="role-score-list">
                  {userDetail.speaker.map((s, i) => {
                    const score = Number(s.avgScore || 0);
                    const percent = Math.max(0, Math.min(100, score * 100));

                    return (
                      <div className="role-score-item" key={i}>
                        <div className="role-score-header">
                          <div>
                            <strong>{getRoleLabel(s.role)}</strong>
                            <p>{getRoleDescription(s.role)}</p>
                          </div>

                          <span className={`score-tag ${getScoreClass(score)}`}>
                            {score.toFixed(2)}
                          </span>
                        </div>

                        <div className="progress-track">
                          <div
                            className={`progress-fill ${getScoreClass(score)}`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="employee-summary-note">
                  {userDetail.comparison.scoreDiff >= 0 ? (
                    <span className="up">
                      Nhân viên này đang cao hơn trung bình hệ thống{" "}
                      {Math.abs(userDetail.comparison.scoreDiff)} điểm.
                    </span>
                  ) : (
                    <span className="down">
                      Nhân viên này đang thấp hơn trung bình hệ thống{" "}
                      {Math.abs(userDetail.comparison.scoreDiff)} điểm.
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* CÁC KHỐI PHÂN TÍCH KHÁC (4, 5, 7) GIỮ NGUYÊN BỐ CỤC HÌNH MẪU */}
        <div className="right-column-grid">
          <section className="section-sentiment">
            <div className="card-header">
              <h3>SỨC KHỎE TRẢI NGHIỆM</h3>
            </div>

            <div className="sentiment-stats">
              <div className="stat-item neg">
                <h2>{(data.totalSystem.negativeRate * 100).toFixed(1)}%</h2>
                <p>Tỷ lệ tiêu cực</p>
              </div>

              <div className="stat-item pos">
                <h2>
                  {(
                    Math.max(0, 1 - data.totalSystem.negativeRate) * 100
                  ).toFixed(1)}
                  %
                </h2>
                <p>Tỷ lệ ổn định</p>
              </div>
            </div>

            {sentimentInsight && (
              <div className={`issue-item ${sentimentInsight.type}`}>
                <span>Đánh giá khách hàng</span>
                <strong>{sentimentInsight.metric}</strong>
              </div>
            )}
          </section>

          <section className="section-issues">
            <div className="card-header">
              <h3>CẢNH BÁO CẦN XỬ LÝ</h3>
            </div>

            <div className="issue-list">
              <div className="issue-item">
                <span>Cuộc gọi tiêu cực</span>
                <strong>
                  {data.totalSystem.totalNegative} /{" "}
                  {data.totalSystem.totalAudio}
                </strong>
              </div>

              {sentimentInsight && (
                <div className={`issue-item ${sentimentInsight.type}`}>
                  <span>Trải nghiệm khách hàng</span>
                  <strong>{sentimentInsight.metric}</strong>
                </div>
              )}

              {staffInsight && (
                <div className={`issue-item ${staffInsight.type}`}>
                  <span>Nhân viên cần theo dõi</span>
                  <strong>{staffInsight.metric}</strong>
                </div>
              )}
            </div>
          </section>

          {/* <section className="section-drilldown">
            <div className="card-header">
              <h3>HÀNH ĐỘNG GỢI Ý</h3>
            </div>

            <div className="drill-actions">
              <button>
                <i className="bi bi-person-badge"></i>{" "}
                {staffInsight?.action ||
                  "Kiểm tra nhân viên có điểm xử lý thấp"}
              </button>

              <button>
                <i className="bi bi-chat-dots"></i>{" "}
                {sentimentInsight?.action ||
                  "Xem lại các cuộc gọi khách hàng chưa hài lòng"}
              </button>
            </div>
          </section> */}
        </div>
      </div>

      <div className="dashboard-footer">
        <section className="section-drilldown-modern">
          <div className="card-header-modern">
            <div className="title-area">
              <i className="bi bi-lightbulb-fill text-warning"></i>
              <h3>PHÂN TÍCH & KHUYẾN NGHỊ CHIẾN LƯỢC</h3>
            </div>
            <span className="badge-count">
              Phát hiện {recommendationItems.length} vấn đề
            </span>
          </div>

          <div className="drill-actions-wrapper">
            {recommendationItems.length === 0 ? (
              <div className="empty-recommendation">
                <i className="bi bi-shield-check"></i>
                <p>Hệ thống chưa phát hiện vấn đề nổi bật trong tháng này.</p>
                <span>
                  Tiếp tục duy trì và theo dõi định kỳ dashboard hệ thống.
                </span>
              </div>
            ) : (
              <div className="recommendation-table-wrapper">
                <table className="recommendation-table">
                  <thead>
                    <tr>
                      <th width="12%">Mức độ</th>
                      <th width="38%">Nguyên nhân phát hiện từ hệ thống</th>
                      <th width="38%">Hành động & Giải pháp khuyến nghị</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recommendationItems.map((item, index) => (
                      <tr key={index} className={`rec-row ${item.type}`}>
                        <td>
                          {/* item.type nhận vào: 'danger', 'warning', 'good' hoặc 'info' */}
                          <span className={`status-badge ${item.type}`}>
                            {item.type === "danger" && "Nghiêm trọng"}
                            {item.type === "warning" && "Cần chú ý"}
                            {item.type === "good" && "Tích cực"}
                            {item.type === "info" && "Thông tin"}
                          </span>
                        </td>
                        <td className="message-cell">
                          <p>{item.message}</p>
                        </td>
                        <td className="action-cell">
                          <div className="action-box-inner">
                            <i className="bi bi-arrow-right-short text-primary"></i>
                            <span>{item.action}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
