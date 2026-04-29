import { useEffect, useState } from "react";
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
} from "../../services/dashboardService";
import "../../styles/Admin/AdminDashboard.scss";

function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetail, setUserDetail] = useState(null);

  const [sortBy, setSortBy] = useState("totalConversations");
  const [order, setOrder] = useState("DESC");
  const [month, setMonth] = useState("");

  const UPLOAD_URL = "http://localhost:3000/uploads";

  useEffect(() => {
    fetchData();
  }, [sortBy, order, month]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getAdminDashboardApi({ sortBy, order, month });
      if (res.data.errCode === 0) setData(res.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetail = async (userId) => {
    try {
      setSelectedUser(userId);
      const res = await getAdminUserDetailApi({
        userId,
        month: month || data?.filter?.month,
      });
      if (res.data.errCode === 0) setUserDetail(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  if (!data)
    return <div className="loading-container">Đang tải dữ liệu...</div>;

  return (
    <div className="admin-dashboard-container">
      {/* (1) KPI TỔNG QUAN */}
      <section className="section-kpi">
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="icon blue">
              <i className="bi bi-mic-fill"></i>
            </div>
            <div className="info">
              <p>Tổng số audio</p>
              <h2>{data.totalSystem.totalAudio?.toLocaleString()}</h2>
            </div>
          </div>
          <div className="kpi-card">
            <div className="icon green">
              <i className="bi bi-star-fill"></i>
            </div>
            <div className="info">
              <p>Avg Score hệ thống</p>
              <h2>{Number(data.totalSystem.avgScore).toFixed(2)}/1</h2>
            </div>
          </div>
          <div className="kpi-card">
            <div className="icon red">
              <i className="bi bi-emoji-frown-fill"></i>
            </div>
            <div className="info">
              <p>Tỷ lệ negative</p>
              <h2>{data.totalSystem.totalNegative}%</h2>
            </div>
          </div>
          <div className="kpi-card highlight">
            <div className="icon gold">
              <i className="bi bi-trophy-fill"></i>
            </div>
            <div className="info">
              <p>User điểm cao nhất</p>
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
            <h3>BẢNG XẾP HẠNG</h3>
          </div>
          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nhân viên</th>
                  <th>Avg</th>
                  <th>Neg%</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map((u, i) => (
                  <tr
                    key={u.userId}
                    onClick={() => fetchUserDetail(u.userId)}
                    className={selectedUser === u.userId ? "active-row" : ""}
                  >
                    <td>{i + 1}</td>
                    <td className="user-cell">
                      <img
                        src={
                          u.image
                            ? `${UPLOAD_URL}/${u.image}`
                            : "/default-avatar.png"
                        }
                        alt=""
                      />
                      <span>{u.fullName}</span>
                    </td>
                    <td>
                      <b>{Number(u.avgScore).toFixed(2)}</b>
                    </td>
                    <td
                      className={
                        +u.negativeRate > 20 ? "text-danger" : "text-success"
                      }
                    >
                      {u.negativeRate}%
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
            <h3>CHI TIẾT NHÂN VIÊN</h3>
          </div>
          {!userDetail ? (
            <div className="empty-state">👉 Chọn nhân viên để xem chi tiết</div>
          ) : (
            <div className="user-detail-content">
              <div className="profile-header">
                <img
                  src={
                    userDetail.user.image
                      ? `${UPLOAD_URL}/${userDetail.user.image}`
                      : ""
                  }
                  alt=""
                  className="avatar-large"
                />
                <div className="meta">
                  <h4>{userDetail.user.fullName}</h4>
                  <p>{userDetail.user.email}</p>
                </div>
              </div>

              <div className="detail-kpi-grid">
                <div className="mini-card">
                  <p>Audio</p>
                  <h4>{userDetail.kpi.totalAudio}</h4>
                </div>
                <div className="mini-card">
                  <p>Avg Score</p>
                  <h4>{userDetail.kpi.avgScore}</h4>
                  <span
                    className={
                      userDetail.comparison.scoreDiff >= 0 ? "up" : "down"
                    }
                  >
                    {userDetail.comparison.scoreDiff >= 0 ? "↑" : "↓"}{" "}
                    {Math.abs(userDetail.comparison.scoreDiff)}
                  </span>
                </div>
                <div className="mini-card">
                  <p>Negative</p>
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
                      name="User"
                    />
                    <Line
                      type="monotone"
                      dataKey="systemScore"
                      stroke="#cbd5e1"
                      strokeDasharray="5 5"
                      name="Hệ thống"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* BẢNG SPEAKER PHÂN TÍCH */}
              <div className="speaker-analysis">
                <h5>Phân tích Speaker</h5>
                <table className="speaker-table">
                  <thead>
                    <tr>
                      <th>Speaker</th>
                      <th>Score</th>
                      <th>Negative</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userDetail.speaker.map((s, i) => (
                      <tr key={i}>
                        <td>{s.role}</td>
                        <td>
                          <span className="score-tag">
                            {s.avgScore.toFixed(2)}
                          </span>
                        </td>
                        <td>{(s.negativeRate * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* CÁC KHỐI PHÂN TÍCH KHÁC (4, 5, 7) GIỮ NGUYÊN BỐ CỤC HÌNH MẪU */}
        <div className="right-column-grid">
          <section className="section-sentiment">
            <div className="card-header">
              <h3>PHÂN TÍCH CẢM XÚC</h3>
            </div>
            <div className="sentiment-stats">
              <div className="stat-item neg">
                <h2>21.7%</h2>
                <p>Negative</p>
              </div>
              <div className="stat-item pos">
                <h2>52.3%</h2>
                <p>Positive</p>
              </div>
            </div>
          </section>

          <section className="section-issues">
            <div className="card-header">
              <h3>TOP VẤN ĐỀ</h3>
            </div>
            <div className="issue-list">
              <div className="issue-item">
                <span>Cuộc gọi tiêu cực</span>
                <strong>30%</strong>
              </div>
              <div className="issue-item">
                <span>User điểm thấp</span>
                <strong>3</strong>
              </div>
            </div>
          </section>

          <section className="section-drilldown">
            <div className="card-header">
              <h3>DRILL DOWN</h3>
            </div>
            <div className="drill-actions">
              <button>
                <i className="bi bi-person-badge"></i> Dashboard nhân viên
              </button>
              <button>
                <i className="bi bi-chat-dots"></i> Dashboard khách hàng
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
