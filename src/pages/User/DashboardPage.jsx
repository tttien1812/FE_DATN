import { useEffect, useState } from "react";
import {
  getDashboardDailyApi,
  getMonthlyKpiApi,
  getUserInsightApi,
} from "../../services/dashboardService";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

import totalRecordsIcon from "../../assets/play.png";
import avgScoreIcon from "../../assets/star.png";
import bestDayIcon from "../../assets/trophy.png";
import worstDayIcon from "../../assets/warning.png";

import "../../styles/User/DashboardPage.scss";

function DashboardPage() {
  const [dailyData, setDailyData] = useState([]);
  const [kpi, setKpi] = useState(null);
  const [insights, setInsights] = useState([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState("7");

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchDashboard();
  }, [userId, month]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [dailyRes, kpiRes, insightRes] = await Promise.all([
        getDashboardDailyApi(userId, month),
        getMonthlyKpiApi(userId, month),
        getUserInsightApi(userId, month),
      ]);

      if (dailyRes.data.errCode === 0) setDailyData(dailyRes.data.data);
      if (kpiRes.data.errCode === 0) setKpi(kpiRes.data.data);
      if (insightRes.data.errCode === 0) setInsights(insightRes.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const isSameMonth = (dateStr, selectedMonth) => {
    if (!dateStr || !selectedMonth) return false;

    return dateStr.slice(0, 7) === selectedMonth;
  };

  // const filteredData = summary.slice(-Number(range));
  // const filteredData = [...dailyData].slice(-Number(range));
  const monthData = dailyData.filter((item) => isSameMonth(item.date, month));

  let filteredData = [...monthData];

  if (range === "1") {
    // 🔥 chỉ lấy ngày mới nhất trong tháng
    filteredData = monthData.slice(-1);
  } else {
    filteredData = monthData.slice(-Number(range));
  }

  const sentimentPercentData = filteredData.map((item) => {
    const total =
      item.veryNegativeCount +
        item.negativeCount +
        item.neutralCount +
        item.positiveCount +
        item.veryPositiveCount || 1;

    return {
      date: item.date,
      very_negative: (item.veryNegativeCount / total) * 100,
      negative: (item.negativeCount / total) * 100,
      neutral: (item.neutralCount / total) * 100,
      positive: (item.positiveCount / total) * 100,
      very_positive: (item.veryPositiveCount / total) * 100,
    };
  });

  const sentimentKeys = [
    "very_negative",
    "negative",
    "neutral",
    "positive",
    "very_positive",
  ];

  const sentimentLabels = {
    very_positive: "Rất tích cực",
    positive: "Tích cực",
    neutral: "Trung lập",
    negative: "Tiêu cực",
    very_negative: "Rất tiêu cực",
  };

  // const renderInsightIcon = (type) => {
  //   switch (type) {
  //     case "good":
  //       return <i className="bi bi-rocket-takeoff-fill"></i>;
  //     case "danger":
  //       return <i className="bi bi-exclamation-triangle-fill"></i>;
  //     case "warning":
  //       return <i className="bi bi-lightbulb-fill"></i>;
  //     default:
  //       return <i className="bi bi-info-circle-fill"></i>;
  //   }
  // };

  const renderInsightIcon = (item) => {
    const group = item?.group;

    switch (group) {
      case "performance":
        return <i className="bi bi-speedometer2 icon-performance"></i>;

      case "customer":
        return <i className="bi bi-emoji-smile-fill icon-customer"></i>;

      case "staff":
        return <i className="bi bi-person-badge-fill icon-staff"></i>;

      case "risk":
        return <i className="bi bi-shield-exclamation icon-risk"></i>;

      default:
        return <i className="bi bi-info-circle-fill icon-default"></i>;
    }
  };
  const activeKeys = sentimentKeys.filter((key) =>
    sentimentPercentData.some((item) => item[key] > 0),
  );

  const colorMap = {
    very_negative: "#8B0000",
    negative: "#FF4D4F",
    neutral: "#FAAD14",
    positive: "#52C41A",
    very_positive: "#237804",
  };

  // Cải thiện Tooltip: Nền trắng, shadow đậm
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;
    return (
      <div className="custom-chart-tooltip">
        <p className="label">
          <b>{label}</b>
        </p>
        <p className="item">Tổng: {data.totalRecords}</p>
        <p className="item">Điểm: {Number(data.avgScore || 0).toFixed(2)}</p>
      </div>
    );
  };

  const CustomSentimentTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="custom-chart-tooltip">
        <p className="label">
          <b>{label}</b>
        </p>
        {payload.map((item) => (
          <p
            key={item.name}
            style={{ color: item.color, fontSize: "12px", margin: "4px 0" }}
          >
            {item.name}: {Number(item.value).toFixed(2)}%
          </p>
        ))}
      </div>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN");
  };

  // Hàm format riêng cho trục X (chỉ lấy ngày)
  const formatXAxis = (tickItem) => {
    if (!tickItem) return "";
    return tickItem.split("-")[2] || tickItem; // Giả định format là YYYY-MM-DD
  };

  const renderGrowth = (growth) => {
    if (growth == null) return null;
    const isUp = growth >= 0;
    return (
      <span className={isUp ? "up" : "down"}>
        {isUp ? "↑" : "↓"} {Math.abs(growth).toFixed(1)}% so với tháng trước
      </span>
    );
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-left">
          <h1 className="dashboard-title">Dashboard Tổng Quan</h1>
          <p className="dashboard-subtitle">
            Theo dõi xu hướng và phân bổ cảm xúc của khách hàng
          </p>
        </div>

        <div className="header-right-filters">
          {/* Khối nút chọn khoảng ngày (7 ngày, 30 ngày...) */}
          <div className="filter-group">
            {["1", "7", "30"].map((r) => (
              <button
                key={r}
                className={`filter-btn ${range === r ? "active" : ""}`}
                onClick={() => setRange(r)}
              >
                {r === "1" ? "Hôm nay" : `${r} ngày`}
              </button>
            ))}
          </div>

          {/* Khối chọn tháng được làm gọn và đẹp lại */}
          <div className="month-filter-box">
            <span className="month-label">
              <i className="bi bi-calendar3"></i> Tháng:
            </span>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="month-input-clean"
            />
          </div>
        </div>
      </div>

      {loading && <div className="loading-overlay">Đang tải dữ liệu...</div>}

      {/* KPI 4 Khối */}
      <div className="kpi-grid">
        <div className="kpi-card blue">
          <div className="kpi-icon">
            <img src={totalRecordsIcon} alt="icon" />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Tổng hội thoại</p>
            <h2 className="kpi-value">{kpi?.totalRecords || 0}</h2>
            <div className="kpi-status">{renderGrowth(kpi?.growth)}</div>
          </div>
        </div>

        <div className="kpi-card green">
          <div className="kpi-icon">
            <img src={avgScoreIcon} alt="icon" />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Điểm TB tháng</p>
            <h2 className="kpi-value">{kpi?.avgScore || 0}</h2>
            <div className="kpi-status">{renderGrowth(kpi?.growth)}</div>
          </div>
        </div>

        <div className="kpi-card orange">
          <div className="kpi-icon">
            <img src={bestDayIcon} alt="icon" />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Ngày tốt nhất</p>
            <h2 className="kpi-value">{formatXAxis(kpi?.bestDay?.date)}</h2>
            <span className="kpi-sub">
              Score: {Number(kpi?.bestDay?.avgScore || 0).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="kpi-card red">
          <div className="kpi-icon">
            <img src={worstDayIcon} alt="icon" />
          </div>
          <div className="kpi-content">
            <p className="kpi-label">Ngày tệ nhất</p>
            <h2 className="kpi-value">{formatXAxis(kpi?.worstDay?.date)}</h2>
            <span className="kpi-sub">
              Score: {Number(kpi?.worstDay?.avgScore || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="main-charts">
        {/* Chart 1: Xu hướng điểm */}
        <div className="chart-item">
          <h3 className="chart-title">📈 Xu hướng điểm (Daily)</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={filteredData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatXAxis}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} />
                <Line
                  name="Điểm trung bình"
                  type="monotone"
                  dataKey="avgScore"
                  stroke="#1254d8"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-item">
          <h3 className="chart-title">🧑‍💼 Cảm xúc Customer</h3>

          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={filteredData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />

                <XAxis
                  dataKey="date"
                  tickFormatter={formatXAxis}
                  tick={{ fontSize: 12 }}
                />

                <YAxis domain={[0, 1]} tick={{ fontSize: 12 }} />

                <Tooltip />

                <Legend verticalAlign="top" height={36} />

                <Line
                  name="Customer Score"
                  type="monotone"
                  dataKey="customerScore"
                  stroke="#fa8c16"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Cảm xúc */}
        <div className="chart-item">
          <h3 className="chart-title">😊 Phân bổ cảm xúc (%)</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sentimentPercentData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatXAxis}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip content={<CustomSentimentTooltip />} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                {activeKeys.map((key) => (
                  <Bar
                    key={key}
                    name={sentimentLabels[key] || key}
                    dataKey={key}
                    stackId="a"
                    fill={colorMap[key]}
                    barSize={25}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="bottom-content">
        <div className="table-section card">
          <h3 className="section-title">📋 Tổng hợp theo ngày</h3>
          {/* Thêm wrapper này để tạo scroll cho bảng */}
          <div className="table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Số cuộc hội thoại</th>
                  <th>Điểm trung bình</th>
                  <th>Tích cực</th>
                  <th>Trung lập</th>
                  <th>Tiêu cực</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr
                    key={item.date}
                    onClick={() => setSelectedDate(item.date)}
                    className={selectedDate === item.date ? "active-row" : ""}
                  >
                    <td>{item.date}</td>
                    <td>{item.totalRecords}</td>
                    <td>
                      <span className="badge-score">
                        {Number(item.avgScore || 0).toFixed(2)}
                      </span>
                    </td>
                    <td>{item.positiveCount}</td>
                    <td>{item.neutralCount}</td>
                    <td>
                      <span
                        className={item.negativeCount > 5 ? "text-danger" : ""}
                      >
                        {item.negativeCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="details-section card insight-card">
          <h3 className="section-title">💡 Insight & Phân tích</h3>

          <div className="table-wrapper">
            {/* Tận dụng table-wrapper để có scroll */}
            <div className="insights-list">
              {!insights.length ? (
                <div className="empty-state">
                  <i className="bi bi-inbox-fill"></i>{" "}
                  {/* Thêm icon cho trống trải */}
                  <p>Chưa có insight nào được ghi nhận</p>
                </div>
              ) : (
                insights.map((item, index) => (
                  <div
                    key={index}
                    className={`insight-item-modern ${item.type}`} // good, warning, danger
                  >
                    <div className="insight-icon">
                      {renderInsightIcon(item)}
                    </div>

                    <div className="insight-body">
                      <div className="insight-header">
                        <span className="insight-title">{item.title}</span>
                        {item.metric && (
                          <span className="insight-metric-tag">
                            {item.metric}
                          </span>
                        )}
                      </div>

                      <p className="insight-message">{item.message}</p>

                      {item.action && (
                        <div className="insight-action-box">
                          <i className="bi bi-lightbulb"></i>
                          <span>
                            <strong>Gợi ý:</strong> {item.action}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
