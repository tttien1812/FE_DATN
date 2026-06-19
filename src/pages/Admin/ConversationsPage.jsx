// import { useEffect, useState, useRef } from "react";
// import {
//   getAdminConversationsApi,
//   getAdminConversationDetailApi,
//   getAdminConversationInsightApi,
// } from "../../services/adminConversationService";
// import "../../styles/Admin/ConversationsPage.scss";
// import {
//   FiFilter,
//   FiPlayCircle,
//   FiPauseCircle,
//   FiSettings,
//   FiSearch,
//   FiRotateCcw,
//   FiChevronLeft,
//   FiRefreshCw,
//   FiPlay,
//   FiPause,
//   FiSkipBack,
//   FiSkipForward,
//   FiVolume2,
// } from "react-icons/fi";
// import WaveSurfer from "wavesurfer.js";
// const BASE_URL = "http://localhost:3000";

// const ConversationsPage = () => {
//   const [conversations, setConversations] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalRows, setTotalRows] = useState(0);
//   const [currentAudio, setCurrentAudio] = useState(null);
//   const [playingId, setPlayingId] = useState(null);
//   const [selectedConversation, setSelectedConversation] = useState(null);
//   const [conversationInsights, setConversationInsights] = useState([]);
//   const [activeInsight, setActiveInsight] = useState(null);
//   const [detailLoading, setDetailLoading] = useState(false);
//   const [showFilters, setShowFilters] = useState(false);
//   const waveformRef = useRef(null);
//   const waveSurferRef = useRef(null);
//   const segmentRefs = useRef([]);

//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const [playbackRate, setPlaybackRate] = useState(1);
//   const [volume, setVolume] = useState(1);
//   const [activeSegmentIndex, setActiveSegmentIndex] = useState(-1);
//   const [filters, setFilters] = useState({
//     sentiment: "",
//     emotion: "",
//     search: "",
//     month: "",
//   });

//   useEffect(() => {
//     fetchConversations();
//   }, [page, filters]);

//   const fetchConversations = async () => {
//     try {
//       setLoading(true);
//       const res = await getAdminConversationsApi({
//         page,
//         limit: 10,
//         sentiment: filters.sentiment,
//         emotion: filters.emotion,
//         search: filters.search,
//         month: filters.month,
//       });

//       if (res?.data?.errCode === 0) {
//         setConversations(res.data.data.rows || []);
//         setTotalPages(res.data.data.totalPages || 1);
//         setTotalRows(res.data.data.total || 0); // Giả sử API trả về tổng số dòng
//       }
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleReset = () => {
//     setFilters({ sentiment: "", emotion: "", search: "", month: "" });
//     setPage(1);
//   };

//   const handlePlayAudio = (audioUrl, id) => {
//     if (!audioUrl) return;

//     // nếu đang play audio này => pause
//     if (playingId === id && currentAudio) {
//       currentAudio.pause();
//       setPlayingId(null);
//       return;
//     }
//     // pause audio cũ
//     if (currentAudio) {
//       currentAudio.pause();
//     }
//     const formattedUrl = audioUrl.replace(/\\/g, "/");
//     const audio = new Audio(`${BASE_URL}/${formattedUrl}`);
//     audio.play();
//     audio.onended = () => {
//       setPlayingId(null);
//     };
//     setCurrentAudio(audio);
//     setPlayingId(id);
//   };

//   const handleSelectConversation = async (id) => {
//     try {
//       setDetailLoading(true);
//       setActiveInsight(null);

//       const [detailRes, insightRes] = await Promise.all([
//         getAdminConversationDetailApi(id),
//         getAdminConversationInsightApi(id),
//       ]);

//       if (detailRes?.data?.errCode === 0) {
//         setSelectedConversation(detailRes.data.data);
//       }

//       if (insightRes?.data?.errCode === 0) {
//         setConversationInsights(insightRes.data.data || []);
//       } else {
//         setConversationInsights([]);
//       }
//     } catch (error) {
//       console.error(error);
//       setConversationInsights([]);
//     } finally {
//       setDetailLoading(false);
//     }
//   };

//   const getSpeakerRole = (speakerLabel) => {
//     const speaker = selectedConversation?.speakers?.find(
//       (sp) => sp.speakerLabel === speakerLabel,
//     );
//     const role = speaker?.role || speakerLabel;
//     return role.charAt(0).toUpperCase() + role.slice(1);
//   };

//   useEffect(() => {
//     if (!selectedConversation?.audioUrl) return;

//     if (waveSurferRef.current) {
//       waveSurferRef.current.destroy();
//     }

//     waveSurferRef.current = WaveSurfer.create({
//       container: waveformRef.current,
//       waveColor: "#d1d5db",
//       progressColor: "#3861fb",
//       cursorColor: "#1d4ed8",
//       barWidth: 3,
//       barRadius: 999,
//       cursorWidth: 2,
//       height: 70,
//       barGap: 2,
//       responsive: true,
//     });

//     waveSurferRef.current.load(
//       `${BASE_URL}/${selectedConversation.audioUrl.replace(/\\/g, "/")}`,
//     );

//     waveSurferRef.current.on("ready", () => {
//       setDuration(waveSurferRef.current.getDuration());
//     });

//     waveSurferRef.current.on("audioprocess", () => {
//       const time = waveSurferRef.current.getCurrentTime();
//       setCurrentTime(time);
//       const activeIndex = selectedConversation?.segments?.findIndex(
//         (seg) => time >= seg.startTime && time <= seg.endTime,
//       );

//       setActiveSegmentIndex(activeIndex);

//       if (activeIndex !== -1 && segmentRefs.current[activeIndex]) {
//         segmentRefs.current[activeIndex].scrollIntoView({
//           behavior: "smooth",
//           block: "center",
//         });
//       }
//     });

//     waveSurferRef.current.on("finish", () => {
//       setIsPlaying(false);
//     });
//     return () => {
//       waveSurferRef.current?.destroy();
//     };
//   }, [selectedConversation]);

//   const handleToggleAudio = () => {
//     if (!waveSurferRef.current) return;
//     waveSurferRef.current.playPause();
//     setIsPlaying(waveSurferRef.current.isPlaying());
//   };

//   const handleClickInsight = (insight) => {
//     setActiveInsight(insight);

//     const firstSegmentId = insight.segmentIds?.[0];
//     if (!firstSegmentId) return;

//     const targetIndex = selectedConversation?.segments?.findIndex(
//       (seg) => seg.id === firstSegmentId,
//     );

//     if (targetIndex === -1 || targetIndex === undefined) return;

//     const targetSegment = selectedConversation.segments[targetIndex];

//     if (waveSurferRef.current) {
//       waveSurferRef.current.setTime(targetSegment.startTime);
//       waveSurferRef.current.play();
//       setIsPlaying(true);
//     }

//     setTimeout(() => {
//       segmentRefs.current[targetIndex]?.scrollIntoView({
//         behavior: "smooth",
//         block: "center",
//       });
//     }, 100);
//   };

//   const formatTime = (time) => {
//     if (!time) return "00:00";
//     const mins = Math.floor(time / 60);
//     const secs = Math.floor(time % 60);
//     return `${mins.toString().padStart(2, "0")}:${secs
//       .toString()
//       .padStart(2, "0")}`;
//   };

//   const handleSpeedChange = () => {
//     if (!waveSurferRef.current) return;
//     const speeds = [1, 1.25, 1.5, 1.75, 2];
//     const currentIndex = speeds.indexOf(playbackRate);
//     const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
//     setPlaybackRate(nextSpeed);
//     waveSurferRef.current.setPlaybackRate(nextSpeed);
//   };

//   const handleVolumeChange = (e) => {
//     const value = Number(e.target.value);
//     setVolume(value);
//     waveSurferRef.current.setVolume(value);
//   };

//   const skipTime = (seconds) => {
//     if (!waveSurferRef.current) return;
//     const current = waveSurferRef.current.getCurrentTime();
//     waveSurferRef.current.setTime(current + seconds);
//   };

//   return (
//     <div className="admin-container">
//       {/* FLOATING FILTER BUTTON */}
//       <button
//         className={`floating-filter-btn ${showFilters ? "hide" : ""}`}
//         onClick={() => setShowFilters(true)}
//       >
//         <FiFilter />
//       </button>
//       {/* SIDEBAR BỘ LỌC */}
//       <aside className={`filter-sidebar ${showFilters ? "open" : "closed"}`}>
//         <div className="sidebar-top-actions">
//           <button
//             className="btn-close-sidebar"
//             onClick={() => setShowFilters(false)}
//             title="Đóng bộ lọc"
//           >
//             <FiChevronLeft /> Thu gọn
//           </button>
//         </div>
//         <div className="sidebar-header">
//           <h3>BỘ LỌC</h3>
//           <button className="btn-reset-text" onClick={handleReset}>
//             <FiRefreshCw /> Reset
//           </button>
//         </div>

//         <div className="filter-group">
//           <label>Thời gian</label>
//           <input
//             type="month"
//             value={filters.month}
//             onChange={(e) => setFilters({ ...filters, month: e.target.value })}
//           />
//         </div>

//         <div className="filter-group">
//           <label>Sentiment</label>
//           <div className="tag-cloud">
//             {[
//               "",
//               "positive",
//               "neutral",
//               "negative",
//               "very_negative",
//               "very_positive",
//             ].map((s) => (
//               <button
//                 key={s}
//                 className={`tag-btn ${filters.sentiment === s ? "active" : ""}`}
//                 onClick={() => setFilters({ ...filters, sentiment: s })}
//               >
//                 {s === "" ? "Tất cả" : s.charAt(0).toUpperCase() + s.slice(1)}
//               </button>
//             ))}
//           </div>
//         </div>

//         <div className="filter-group">
//           <label>Emotion</label>
//           <select
//             value={filters.emotion}
//             onChange={(e) =>
//               setFilters({ ...filters, emotion: e.target.value })
//             }
//           >
//             <option value="">Tất cả</option>
//             <option value="happy">Happy</option>
//             <option value="sad">Sad</option>
//             <option value="angry">Angry</option>
//           </select>
//         </div>

//         <div className="filter-group">
//           <label>Keyword Transcript</label>
//           <div className="search-input-wrapper">
//             <FiSearch className="icon" />
//             <input
//               type="text"
//               placeholder="Nhập từ khóa..."
//               value={filters.search}
//               onChange={(e) =>
//                 setFilters({ ...filters, search: e.target.value })
//               }
//             />
//           </div>
//         </div>
//       </aside>

//       {/* CONTENT CHÍNH */}
//       <main className={`main-content ${showFilters ? "dimmed" : ""}`}>
//         <header className="content-header">
//           <div className="title-area">
//             <h3>Danh sách cuộc gọi ({totalRows})</h3>
//           </div>
//         </header>

//         <div className="table-card">
//           <table className="custom-table">
//             <thead>
//               <tr>
//                 <th>ID</th>
//                 <th>User / Staff</th>
//                 <th>Score</th>
//                 <th>Sentiment</th>
//                 <th>Emotion</th>
//                 <th>Date & Time</th>
//                 {/* <th>Action</th> */}
//               </tr>
//             </thead>
//             <tbody>
//               {!loading &&
//                 conversations.map((item) => (
//                   <tr
//                     key={item.id}
//                     onClick={() => handleSelectConversation(item.id)}
//                     className={
//                       selectedConversation?.id === item.id ? "active-row" : ""
//                     }
//                   >
//                     <td className="text-muted">#{item.id}</td>
//                     <td>
//                       <div className="user-info">
//                         {item.user?.image ? (
//                           <img
//                             src={`${BASE_URL}/uploads/${item.user.image}`}
//                             alt="avatar"
//                             className="avatar"
//                           />
//                         ) : (
//                           <div className="avatar">
//                             {item.user?.fullName?.charAt(0) || "U"}
//                           </div>
//                         )}

//                         <div className="user-meta">
//                           <span className="user-name">
//                             {item.user?.fullName || "N/A"}
//                           </span>
//                         </div>
//                       </div>
//                     </td>
//                     <td>
//                       <span
//                         className={`score-text ${parseFloat(item.analysis?.score) > 0.5 ? "high" : "low"}`}
//                       >
//                         {item.analysis?.score || "0.00"}
//                       </span>
//                     </td>
//                     <td>
//                       <span
//                         className={`badge-sentiment ${item.analysis?.sentiment}`}
//                       >
//                         {item.analysis?.sentiment || "neutral"}
//                       </span>
//                     </td>
//                     <td>
//                       <span className="emotion-cell">
//                         {item.analysis?.emotion || "neutral"}
//                       </span>
//                     </td>
//                     <td className="text-muted">
//                       {new Date(item.createdAt).toLocaleString("vi-VN", {
//                         dateStyle: "short",
//                         timeStyle: "short",
//                       })}
//                     </td>
//                     {/* <td>
//                       <button
//                         className={`btn-play ${
//                           playingId === item.id ? "playing" : ""
//                         }`}
//                         onClick={() => handlePlayAudio(item.audioUrl, item.id)}
//                       >
//                         {playingId === item.id ? (
//                           <FiPauseCircle />
//                         ) : (
//                           <FiPlayCircle />
//                         )}
//                       </button>
//                     </td> */}
//                   </tr>
//                 ))}
//             </tbody>
//           </table>

//           {loading && <div className="loading-overlay">Đang tải...</div>}
//         </div>

//         {/* PAGINATION */}
//         <footer className="pagination-footer">
//           <div className="pagination-controls">
//             <button disabled={page === 1} onClick={() => setPage(page - 1)}>
//               &lt;
//             </button>
//             {[...Array(totalPages)].map((_, i) => (
//               <button
//                 key={i}
//                 className={page === i + 1 ? "active" : ""}
//                 onClick={() => setPage(i + 1)}
//               >
//                 {i + 1}
//               </button>
//             ))}
//             <button
//               disabled={page === totalPages}
//               onClick={() => setPage(page + 1)}
//             >
//               &gt;
//             </button>
//           </div>
//           <div className="pagination-info">
//             Hiển thị {conversations.length} / {totalRows} kết quả
//           </div>
//         </footer>
//       </main>

//       <aside className="conversation-detail-panel">
//         {detailLoading ? (
//           <div className="detail-loading">...Loading...</div>
//         ) : selectedConversation ? (
//           <>
//             {/* Header & User Info bọc chung để làm nổi bật */}
//             <div className="detail-top-section">
//               <div className="detail-header">
//                 <div>
//                   <h3>Cuộc gọi #{selectedConversation.id}</h3>
//                   <p className="call-date">24 May 2024, 10:30 AM</p>
//                 </div>
//                 <span
//                   className={`detail-status ${selectedConversation.status.toLowerCase()}`}
//                 >
//                   {selectedConversation.status}
//                 </span>
//               </div>

//               <div className="detail-user-card">
//                 <div className="avatar-circle">
//                   {selectedConversation.user?.fullName?.charAt(0)}
//                 </div>
//                 <div className="user-info-text">
//                   <div className="user-name">
//                     {selectedConversation.user?.fullName}
//                   </div>
//                   <div className="user-email">
//                     {selectedConversation.user?.email}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="detail-scroll-content">
//               {/* SCORE GRID - Làm dạng thẻ mỏng */}
//               <div className="detail-score-grid">
//                 <div className="score-box">
//                   <span className="label">Final Score</span>
//                   <span className="value">
//                     {selectedConversation.analysis?.score?.toFixed(2)}
//                   </span>
//                 </div>
//                 <div className="score-box">
//                   <span className="label">Confidence</span>
//                   <span className="value">
//                     {Math.round(
//                       selectedConversation.analysis?.confidence * 100,
//                     )}
//                     %
//                   </span>
//                 </div>
//               </div>
//               <div className="admin-call-insight-section">
//                 <h4>Insight cuộc gọi</h4>

//                 {conversationInsights.length > 0 ? (
//                   <div className="admin-call-insight-list">
//                     {conversationInsights.map((item, index) => (
//                       <div
//                         key={index}
//                         className={`admin-call-insight-item ${item.type}`}
//                         onClick={() => handleClickInsight(item)}
//                       >
//                         <div className="insight-top">
//                           <span>{item.title}</span>
//                           <strong>{item.metric}</strong>
//                         </div>

//                         <p>{item.message}</p>

//                         <div className="insight-action">
//                           <i className="bi bi-arrow-right-circle"></i>
//                           {item.action}
//                         </div>

//                         {item.segmentIds?.length > 0 && (
//                           <div className="segment-jump-hint">
//                             Đã đánh dấu {item.segmentIds.length} đoạn. Nhấn để
//                             xem.
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="empty-state">
//                     Chưa có insight cho cuộc gọi này
//                   </div>
//                 )}
//               </div>

//               {/* AUDIO PLAYER - Trái tim của Panel */}
//               <div className="audio-player-card">
//                 <div ref={waveformRef} className="waveform-container" />
//                 <div className="time-display">
//                   {formatTime(currentTime)}{" "}
//                   <span>/ {formatTime(duration)}</span>
//                 </div>

//                 <div className="audio-controls">
//                   <div className="control-group">
//                     <button className="skip-btn" onClick={() => skipTime(-5)}>
//                       <FiSkipBack />
//                     </button>
//                     <button
//                       className="play-pause-btn"
//                       onClick={handleToggleAudio}
//                     >
//                       {isPlaying ? <FiPause /> : <FiPlay />}
//                     </button>
//                     <button className="skip-btn" onClick={() => skipTime(5)}>
//                       <FiSkipForward />
//                     </button>
//                   </div>

//                   <div className="extra-group">
//                     <button className="speed-tag" onClick={handleSpeedChange}>
//                       {playbackRate}x
//                     </button>
//                     <div className="volume-popover">
//                       <FiVolume2 />
//                       <input
//                         type="range"
//                         min="0"
//                         max="1"
//                         step="0.1"
//                         value={volume}
//                         onChange={handleVolumeChange}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* SPEAKER ANALYSIS */}
//               <div className="speaker-analysis-section">
//                 <h4>Phân tích giọng nói</h4>
//                 <div className="speaker-grid">
//                   {selectedConversation.speakers?.map((speaker, index) => {
//                     const tone = selectedConversation.voiceTone?.find(
//                       (t) => t.speakerLabel === speaker.speakerLabel,
//                     );
//                     return (
//                       <div
//                         className={`speaker-card ${speaker.role.toLowerCase()}`}
//                         key={index}
//                       >
//                         <div className="role-tag">{speaker.role}</div>
//                         <div className="metric-row">
//                           <span className="m-label">Cảm xúc:</span>
//                           <span
//                             className={`m-value sentiment-${speaker.sentiment.toLowerCase()}`}
//                           >
//                             {speaker.sentiment}
//                           </span>
//                         </div>
//                         <div className="metric-row">
//                           <span className="m-label">Âm điệu:</span>
//                           <span className="m-value">
//                             {tone?.toneEmotion || "Neutral"}
//                           </span>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>

//               {/* TRANSCRIPT */}
//               <div className="transcript-box">
//                 <h4>Bản ghi hội thoại</h4>
//                 <div className="transcript-scroll">
//                   {selectedConversation.segments?.map((seg, index) => (
//                     <div
//                       key={index}
//                       ref={(el) => (segmentRefs.current[index] = el)}
//                       className={`transcript-segment ${getSpeakerRole(
//                         seg.speaker,
//                       ).toLowerCase()} ${activeSegmentIndex === index ? "active" : ""} ${
//                         activeInsight?.segmentIds?.includes(seg.id)
//                           ? "insight-highlight"
//                           : ""
//                       }`}
//                       onClick={() =>
//                         waveSurferRef.current?.setTime(seg.startTime)
//                       }
//                     >
//                       <div className="seg-header">
//                         <span className="seg-speaker">
//                           {getSpeakerRole(seg.speaker)}
//                         </span>
//                         <span className="seg-time">
//                           {seg.startTime?.toFixed(1)}s
//                         </span>
//                       </div>
//                       <div className="seg-content">{seg.text}</div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </>
//         ) : (
//           <div className="empty-state">
//             chọn một cuộc trò chuyện để xem chi tiết
//           </div>
//         )}
//       </aside>
//     </div>
//   );
// };

// export default ConversationsPage;

import { useEffect, useState, useRef } from "react";
import {
  getAdminConversationsApi,
  getAdminConversationDetailApi,
  getAdminConversationInsightApi,
} from "../../services/adminConversationService";
import "../../styles/Admin/ConversationsPage.scss";
import {
  FiFilter,
  FiSearch,
  FiRefreshCw,
  FiPlay,
  FiPause,
  FiSkipBack,
  FiSkipForward,
  FiVolume2,
  FiX,
  FiCheckCircle,
  FiInfo,
} from "react-icons/fi";
import WaveSurfer from "wavesurfer.js";

const BASE_URL = "http://localhost:3000";

const ConversationsPage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationInsights, setConversationInsights] = useState([]);
  const [activeInsight, setActiveInsight] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const waveformRef = useRef(null);
  const waveSurferRef = useRef(null);
  const segmentRefs = useRef([]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(-1);
  const [filters, setFilters] = useState({
    sentiment: "",
    emotion: "",
    search: "",
    month: "",
  });

  useEffect(() => {
    fetchConversations();
  }, [page, filters]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await getAdminConversationsApi({
        page,
        limit: 10,
        sentiment: filters.sentiment,
        emotion: filters.emotion,
        search: filters.search,
        month: filters.month,
      });
      if (res?.data?.errCode === 0) {
        setConversations(res.data.data.rows || []);
        setTotalPages(res.data.data.totalPages || 1);
        setTotalRows(res.data.data.total || 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters({ sentiment: "", emotion: "", search: "", month: "" });
    setPage(1);
  };

  const handlePlayAudio = (audioUrl, id) => {
    if (!audioUrl) return;
    if (playingId === id && currentAudio) {
      currentAudio.pause();
      setPlayingId(null);
      return;
    }
    if (currentAudio) {
      currentAudio.pause();
    }
    const formattedUrl = audioUrl.replace(/\\/g, "/");
    const audio = new Audio(`${BASE_URL}/${formattedUrl}`);
    audio.play();
    audio.onended = () => {
      setPlayingId(null);
    };
    setCurrentAudio(audio);
    setPlayingId(id);
  };

  const handleSelectConversation = async (id) => {
    try {
      setDetailLoading(true);
      setActiveInsight(null);
      const [detailRes, insightRes] = await Promise.all([
        getAdminConversationDetailApi(id),
        getAdminConversationInsightApi(id),
      ]);
      if (detailRes?.data?.errCode === 0) {
        setSelectedConversation(detailRes.data.data);
      }
      if (insightRes?.data?.errCode === 0) {
        setConversationInsights(insightRes.data.data || []);
      } else {
        setConversationInsights([]);
      }
    } catch (error) {
      console.error(error);
      setConversationInsights([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const getSpeakerRole = (speakerLabel) => {
    const speaker = selectedConversation?.speakers?.find(
      (sp) => sp.speakerLabel === speakerLabel,
    );
    const role = speaker?.role || speakerLabel;
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  useEffect(() => {
    if (!selectedConversation?.audioUrl) return;

    if (waveSurferRef.current) {
      waveSurferRef.current.destroy();
    }

    waveSurferRef.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "rgba(255, 255, 255, 0.2)",
      progressColor: "#3861fb",
      cursorColor: "#ffffff",
      barWidth: 2,
      barRadius: 4,
      cursorWidth: 2,
      height: 45,
      barGap: 3,
      responsive: true,
    });

    waveSurferRef.current.load(
      `${BASE_URL}/${selectedConversation.audioUrl.replace(/\\/g, "/")}`,
    );

    waveSurferRef.current.on("ready", () => {
      setDuration(waveSurferRef.current.getDuration());
    });

    waveSurferRef.current.on("audioprocess", () => {
      const time = waveSurferRef.current.getCurrentTime();
      setCurrentTime(time);
      const activeIndex = selectedConversation?.segments?.findIndex(
        (seg) => time >= seg.startTime && time <= seg.endTime,
      );

      setActiveSegmentIndex(activeIndex);
      if (activeIndex !== -1 && segmentRefs.current[activeIndex]) {
        segmentRefs.current[activeIndex].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    });

    waveSurferRef.current.on("finish", () => {
      setIsPlaying(false);
    });

    return () => {
      waveSurferRef.current?.destroy();
    };
  }, [selectedConversation]);

  const handleToggleAudio = () => {
    if (!waveSurferRef.current) return;
    waveSurferRef.current.playPause();
    setIsPlaying(waveSurferRef.current.isPlaying());
  };

  const handleClickInsight = (insight) => {
    setActiveInsight(insight);
    const firstSegmentId = insight.segmentIds?.[0];
    if (!firstSegmentId) return;
    const targetIndex = selectedConversation?.segments?.findIndex(
      (seg) => seg.id === firstSegmentId,
    );
    if (targetIndex === -1 || targetIndex === undefined) return;

    const targetSegment = selectedConversation.segments[targetIndex];
    if (waveSurferRef.current) {
      waveSurferRef.current.setTime(targetSegment.startTime);
      waveSurferRef.current.play();
      setIsPlaying(true);
    }

    setTimeout(() => {
      segmentRefs.current[targetIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  };

  const formatTime = (time) => {
    if (!time) return "00:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSpeedChange = () => {
    if (!waveSurferRef.current) return;
    const speeds = [1, 1.25, 1.5, 1.75, 2];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    waveSurferRef.current.setPlaybackRate(nextSpeed);
  };

  const handleVolumeChange = (e) => {
    const value = Number(e.target.value);
    setVolume(value);
    waveSurferRef.current.setVolume(value);
  };

  const skipTime = (seconds) => {
    if (!waveSurferRef.current) return;
    const current = waveSurferRef.current.getCurrentTime();
    waveSurferRef.current.setTime(current + seconds);
  };

  return (
    <div className="admin-dashboard-layout">
      {/* MASTER WORKSPACE - BẢNG ĐỨNG YÊN KHÔNG THAY ĐỔI CẤU TRÚC */}
      <div className="master-workspace">
        <header className="workspace-header">
          <div className="title-block">
            <h2>Quản lý hội thoại</h2>
            <span className="count-badge">{totalRows} cuộc gọi</span>
          </div>
          <div className="action-block">
            <button
              className="btn-secondary-filter"
              onClick={() => setShowFilters(true)}
            >
              <FiFilter /> Bộ lọc nâng cao
            </button>
          </div>
        </header>

        <div className="table-container-card">
          <table className="business-table">
            <thead>
              <tr>
                <th>Mã cuộc gọi</th>
                <th>Nhân viên</th>
                <th>Điểm số</th>
                <th>Thái độ (Sentiment)</th>
                <th>Cảm xúc</th>
                <th>Thời gian gọi</th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                conversations.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => handleSelectConversation(item.id)}
                    className={
                      selectedConversation?.id === item.id ? "selected-row" : ""
                    }
                  >
                    <td className="col-id">#{item.id}</td>
                    <td>
                      <div className="identity-cell">
                        {item.user?.image ? (
                          <img
                            src={`${BASE_URL}/uploads/${item.user.image}`}
                            alt="avatar"
                            className="cell-avatar"
                          />
                        ) : (
                          <div className="cell-avatar-placeholder">
                            {item.user?.fullName?.charAt(0) || "U"}
                          </div>
                        )}
                        <span className="cell-name">
                          {item.user?.fullName || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`score-indicator ${parseFloat(item.analysis?.score) > 0.5 ? "positive" : "negative"}`}
                      >
                        {item.analysis?.score || "0.00"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-pill tone-${item.analysis?.sentiment || "neutral"}`}
                      >
                        {item.analysis?.sentiment || "neutral"}
                      </span>
                    </td>
                    <td>
                      <span className="emotion-txt">
                        {item.analysis?.emotion || "neutral"}
                      </span>
                    </td>
                    <td className="col-time">
                      {new Date(item.createdAt).toLocaleString("vi-VN", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {loading && (
            <div className="table-loader-overlay">Đang đồng bộ dữ liệu...</div>
          )}
        </div>

        <footer className="workspace-pagination">
          <div className="pagination-buttons">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              &lt;
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={page === i + 1 ? "active-page" : ""}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              &gt;
            </button>
          </div>
          <div className="pagination-summary">
            Hiển thị {conversations.length} trong số {totalRows} bản ghi
          </div>
        </footer>
      </div>

      {/* DETAILED MODAL WORKSPACE - KHỐI CHI TIẾT HIỂN THỊ CHÍNH GIỮA MÀN HÌNH */}
      {selectedConversation && (
        <div
          className="center-modal-backdrop"
          onClick={() => setSelectedConversation(null)}
        >
          <div
            className="center-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            {detailLoading ? (
              <div className="modal-loading-state">
                Đang xử lý dữ liệu cuộc gọi...
              </div>
            ) : (
              <>
                {/* 1. CỘT TRÁI - KHU VỰC TRUNG TÂM (TRANSCRIPT & AUDIO WAVERSURFER) */}
                <div className="modal-main-content">
                  <div className="modal-inner-header">
                    <div className="user-profile-meta">
                      <div className="profile-circle">
                        {selectedConversation.user?.fullName?.charAt(0)}
                      </div>
                      <div>
                        <h3>Cuộc gọi #{selectedConversation.id}</h3>
                        <p>
                          {selectedConversation.user?.fullName} —{" "}
                          {selectedConversation.user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="modal-inner-body">
                    {/* TRÌNH PHÁT ĐOẠN AUDIO NGHE LẠI (WAVESURFER) */}
                    <div className="biz-audio-deck">
                      <div ref={waveformRef} className="wavesurfer-target" />
                      <div className="audio-meta-row">
                        <div className="timer-badge">
                          {formatTime(currentTime)}{" "}
                          <span className="sl">/</span> {formatTime(duration)}
                        </div>
                        <div className="controls-group">
                          <button
                            className="btn-skip"
                            onClick={() => skipTime(-5)}
                          >
                            <FiSkipBack />
                          </button>
                          <button
                            className="btn-master-play"
                            onClick={handleToggleAudio}
                          >
                            {isPlaying ? <FiPause /> : <FiPlay />}
                          </button>
                          <button
                            className="btn-skip"
                            onClick={() => skipTime(5)}
                          >
                            <FiSkipForward />
                          </button>
                        </div>
                        <div className="audio-addons">
                          <button
                            className="btn-rate"
                            onClick={handleSpeedChange}
                          >
                            {playbackRate}x
                          </button>
                          <div className="vol-slider">
                            <FiVolume2 />
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={volume}
                              onChange={handleVolumeChange}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SẮC THÁI GIỌNG NÓI (SPEAKERS) */}
                    <div className="speakers-analysis-grid">
                      {selectedConversation.speakers?.map((speaker, index) => {
                        const tone = selectedConversation.voiceTone?.find(
                          (t) => t.speakerLabel === speaker.speakerLabel,
                        );
                        return (
                          <div
                            key={index}
                            className={`speaker-tag-card role-${speaker.role.toLowerCase()}`}
                          >
                            <span className="role-lbl">{speaker.role}</span>
                            <span className="meta-txt">
                              Thái độ:{" "}
                              <strong
                                className={`s-${speaker.sentiment.toLowerCase()}`}
                              >
                                {speaker.sentiment}
                              </strong>
                            </span>
                            <span className="meta-txt">
                              Âm điệu:{" "}
                              <strong>{tone?.toneEmotion || "Neutral"}</strong>
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* BẢN GHI HỘI THOẠI TRANSCRIPT */}
                    <div className="transcript-flow-section">
                      <h4>Nội dung hội thoại bản ghi</h4>
                      <div className="transcript-scroll-area">
                        {selectedConversation.segments?.map((seg, index) => (
                          <div
                            key={index}
                            ref={(el) => (segmentRefs.current[index] = el)}
                            className={`transcript-bubble speaker-${getSpeakerRole(seg.speaker).toLowerCase()} ${
                              activeSegmentIndex === index
                                ? "bubble-current-playing"
                                : ""
                            } ${activeInsight?.segmentIds?.includes(seg.id) ? "bubble-insight-highlighted" : ""}`}
                            onClick={() =>
                              waveSurferRef.current?.setTime(seg.startTime)
                            }
                          >
                            <div className="bubble-header">
                              <span className="name">
                                {getSpeakerRole(seg.speaker)}
                              </span>
                              <span className="time">
                                {seg.startTime?.toFixed(1)}s
                              </span>
                            </div>
                            <p className="text">{seg.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. CỘT PHẢI - THANH THÔNG BÁO / NHẬN ĐỊNH BÊN LỀ (INSIGHTS PANELS) */}
                <div className="modal-side-notifications">
                  <div className="side-header">
                    <span>
                      <FiInfo /> Trung tâm phân tích
                    </span>
                    <button
                      className="btn-close-modal"
                      onClick={() => setSelectedConversation(null)}
                    >
                      <FiX />
                    </button>
                  </div>

                  <div className="side-body-widgets">
                    {/* THẺ ĐIỂM SỐ NHANH */}
                    <div className="widget-score-card">
                      <div className="score-tile">
                        <label>Chỉ số cuộc gọi</label>
                        <var>
                          {selectedConversation.analysis?.score?.toFixed(2)}
                        </var>
                      </div>
                      <div className="score-tile">
                        <label>Độ chính xác AI</label>
                        <var>
                          {Math.round(
                            selectedConversation.analysis?.confidence * 100,
                          )}
                          %
                        </var>
                      </div>
                    </div>

                    {/* THÀNH PHẦN THÔNG BÁO INSIGHTS NẰM RIÊNG VỀ MỘT BÊN */}
                    <div className="widget-insights-notification-stack">
                      <h5>Nhận định cuộc gọi (Insights)</h5>
                      {conversationInsights.length > 0 ? (
                        <div className="notification-list">
                          {conversationInsights.map((item, index) => (
                            <div
                              key={index}
                              className={`insight-notify-card type-${item.type} ${activeInsight === item ? "is-focused" : ""}`}
                              onClick={() => handleClickInsight(item)}
                            >
                              <div className="notify-top">
                                <span className="lbl">{item.title}</span>
                                <span className="val">{item.metric}</span>
                              </div>
                              <p className="msg">{item.message}</p>
                              {item.segmentIds?.length > 0 && (
                                <span className="anchor-hint">
                                  Nhấp để xem {item.segmentIds.length} đoạn liên
                                  quan
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="notification-empty">
                          Không phát hiện cảnh báo hay insight đặc biệt nào.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* DRAWER BỘ LỌC */}
      <div
        className={`filter-drawer-backdrop ${showFilters ? "show" : ""}`}
        onClick={() => setShowFilters(false)}
      >
        <div
          className="filter-drawer-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="drawer-header">
            <h3>Bộ lọc nâng cao</h3>
            <button
              className="btn-close-drawer"
              onClick={() => setShowFilters(false)}
            >
              <FiX />
            </button>
          </div>
          <div className="drawer-body">
            <div className="form-item">
              <label>Thời gian</label>
              <input
                type="month"
                value={filters.month}
                onChange={(e) =>
                  setFilters({ ...filters, month: e.target.value })
                }
              />
            </div>
            <div className="form-item">
              <label>Thái độ (Sentiment)</label>
              <div className="sentiment-chip-grid">
                {[
                  "",
                  "positive",
                  "neutral",
                  "negative",
                  "very_negative",
                  "very_positive",
                ].map((s) => (
                  <button
                    key={s}
                    className={`filter-chip ${filters.sentiment === s ? "active" : ""}`}
                    onClick={() => setFilters({ ...filters, sentiment: s })}
                  >
                    {s === "" ? "Tất cả" : s.replace("_", " ").toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-item">
              <label>Cảm xúc chính (Emotion)</label>
              <select
                value={filters.emotion}
                onChange={(e) =>
                  setFilters({ ...filters, emotion: e.target.value })
                }
              >
                <option value="">Tất cả cảm xúc</option>
                <option value="happy">Vui vẻ</option>
                <option value="sad">Buồn bã</option>
                <option value="angry">Tức giận</option>
              </select>
            </div>
            <div className="form-item">
              <label>Từ khóa trong bản ghi</label>
              <div className="input-with-icon">
                <FiSearch />
                <input
                  type="text"
                  placeholder="Tìm kiếm nội dung text..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <div className="drawer-footer">
            <button className="btn-reset-drawer" onClick={handleReset}>
              Làm mới
            </button>
            <button
              className="btn-apply-drawer"
              onClick={() => setShowFilters(false)}
            >
              Áp dụng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationsPage;
