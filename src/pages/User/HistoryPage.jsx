import { useEffect, useState } from "react";
import {
  getHistoryDays,
  getHistoryByDate,
  getHistoryDetail,
} from "../../services/historyService";
import "../../styles/User/HistoryPage.scss";

const HistoryPage = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  const [days, setDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);

  // 🔥 load ngày
  useEffect(() => {
    if (!userId) return;

    const fetchDays = async () => {
      const res = await getHistoryDays(userId);
      console.log("DAYS RES:", res);
      if (res.data.errCode === 0) {
        setDays(res.data.data);
        console.log("SET DAYS:", res.data.data);
      }
    };

    fetchDays();
  }, [userId]);

  // 🔥 chọn ngày
  const handleSelectDate = async (date) => {
    setSelectedDate(date);
    setSelectedConversation(null);

    const res = await getHistoryByDate(userId, date);
    if (res.data.errCode === 0) {
      setConversations(res.data.data);
    }
  };

  // 🔥 chọn conversation
  const handleSelectConversation = async (id) => {
    const res = await getHistoryDetail(id);
    if (res.data.errCode === 0) {
      setSelectedConversation(res.data.data);
    }
  };

  if (!userId) {
    return <p>Bạn chưa đăng nhập</p>;
  }

  return (
    <div className="history-container">
      {/* LEFT PANEL */}
      <div className="sidebar">
        <h2>Lịch sử</h2>

        {/* Ngày */}
        <div className="section">
          <p className="title">Ngày</p>
          <div className="list">
            {days.map((day) => (
              <div
                key={day}
                className={`item ${selectedDate === day ? "active" : ""}`}
                onClick={() => handleSelectDate(day)}
              >
                📅 {day}
              </div>
            ))}
          </div>
        </div>

        {/* Conversations */}
        <div className="section">
          <p className="title">Hội thoại</p>
          <div className="list">
            {conversations.map((item) => (
              <div
                key={item.id}
                className={`item ${
                  selectedConversation?.id === item.id ? "active" : ""
                }`}
                onClick={() => handleSelectConversation(item.id)}
              >
                🕒 {new Date(item.createdAt).toLocaleTimeString()}
                <span className="emotion">
                  {item.analysis?.emotion || "N/A"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="content">
        {selectedConversation ? (
          <div className="detail-card">
            <h2>Chi tiết hội thoại</h2>

            <div className="analysis">
              <div className="box emotion">
                <p>Emotion</p>
                <span>{selectedConversation.analysis?.emotion}</span>
              </div>

              <div className="box sentiment">
                <p>Sentiment</p>
                <span>{selectedConversation.analysis?.sentiment}</span>
              </div>
            </div>

            <div className="transcript">
              <p>Nội dung</p>
              <div className="text">
                {selectedConversation.transcript?.content}
              </div>
            </div>
          </div>
        ) : (
          <div className="empty">Chọn 1 hội thoại để xem</div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
