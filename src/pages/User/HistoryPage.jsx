import { useEffect, useState, useRef } from "react";
import {
  getHistoryDays,
  getHistoryByDate,
  getHistoryDetail,
} from "../../services/historyService";
import WaveSurfer from "wavesurfer.js";
import staff from "../../assets/customer-care.png";
import customer from "../../assets/young-man.png";
import "../../styles/User/HistoryPage.scss";

const HistoryPage = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  const [days, setDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(null);
  const segmentRefs = useRef([]);
  const waveformRef = useRef(null);
  const waveSurferRef = useRef(null);

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

  const handleToggleAudio = () => {
    if (!waveSurferRef.current) return;
    waveSurferRef.current.playPause();
    setIsPlaying(waveSurferRef.current.isPlaying());
  };

  useEffect(() => {
    if (!selectedConversation?.audioUrl) return;

    // destroy cũ
    if (waveSurferRef.current) {
      waveSurferRef.current.destroy();
    }

    // tạo mới
    waveSurferRef.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#d1d5db",
      progressColor: "#22c55e",
      cursorColor: "#16a34a",
      barWidth: 3,
      barRadius: 999,
      cursorWidth: 2,
      height: 70,
      barGap: 2,
      responsive: true,
    });

    waveSurferRef.current.load(
      `http://localhost:3000/${selectedConversation.audioUrl?.replace(/\\/g, "/")}`,
    );
    // audio ready
    waveSurferRef.current.on("ready", () => {
      setDuration(waveSurferRef.current.getDuration());
    });
    // realtime current time
    waveSurferRef.current.on("audioprocess", () => {
      const time = waveSurferRef.current.getCurrentTime();

      setCurrentTime(time);

      // tìm segment active
      const activeIndex = selectedConversation?.segments?.findIndex(
        (seg) => time >= seg.startTime && time <= seg.endTime,
      );

      setActiveSegmentIndex(activeIndex);

      // auto scroll
      if (activeIndex !== -1 && segmentRefs.current[activeIndex]) {
        segmentRefs.current[activeIndex].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    });
    // pause state
    waveSurferRef.current.on("finish", () => {
      setIsPlaying(false);
    });

    return () => {
      if (waveSurferRef.current) {
        waveSurferRef.current.destroy();
      }
    };
  }, [selectedConversation]);

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
  const getSpeakerRole = (speakerLabel) => {
    const speaker = selectedConversation?.SpeakerAnalysisResult?.find(
      (s) => s.speakerLabel === speakerLabel,
    );

    return speaker?.role || "customer";
  };

  if (!userId) return <div className="no-login">Bạn chưa đăng nhập</div>;
  return (
    <div className="history-container">
      {/* LEFT SIDEBAR: CALL LIST */}
      <aside className="call-sidebar">
        <div className="sidebar-header">
          <h2 className="title">Lịch sử cuộc gọi</h2>
          <div className="search-box">
            <input type="text" placeholder="Tìm kiếm theo nội dung, ID..." />
            <i className="filter-icon">🔍</i>
          </div>
        </div>

        <div className="scroll-area">
          {days.map((day) => (
            <div key={day} className="date-group">
              <div
                className={`date-label ${selectedDate === day ? "active" : ""}`}
                onClick={() => handleSelectDate(day)}
              >
                {day === new Date().toISOString().split("T")[0]
                  ? "Hôm nay - "
                  : ""}
                {day}
              </div>
              {selectedDate === day &&
                conversations.map((item) => (
                  <div
                    key={item.id}
                    className={`call-card ${selectedConversation?.id === item.id ? "active" : ""}`}
                    onClick={() => handleSelectConversation(item.id)}
                  >
                    <div className="card-row">
                      <span className="call-id">#{item.id}</span>
                      <span className="call-time">
                        {new Date(item.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="call-duration">
                        {Math.floor(item.duration / 60)}:
                        {(item.duration % 60).toString().padStart(2, "0")}
                      </span>
                    </div>
                    <div className="card-tags">
                      <span
                        className={`badge emotion ${item.analysis?.emotion}`}
                      >
                        {item.analysis?.emotion}
                      </span>
                      <span
                        className={`badge sentiment ${item.analysis?.sentiment}`}
                      >
                        {item.analysis?.sentiment}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </aside>

      {/* CENTER & RIGHT: DETAIL */}
      <main className="call-detail-wrapper">
        {selectedConversation ? (
          <>
            <header className="detail-top-nav">
              <span className="breadcrumb">
                Lịch sử &gt;{" "}
                <strong>Chi tiết cuộc gọi #{selectedConversation.id}</strong>
              </span>
              <button className="btn-back">← Quay lại danh sách</button>
            </header>

            <div className="detail-layout">
              {/* MAIN CONTENT */}
              <section className="main-content">
                <div className="audio-player-card">
                  <div className="audio-header-info">
                    <div className="left-meta">
                      <span className="id-tag">
                        ID: <strong>#{selectedConversation.id}</strong>
                      </span>
                      <span className="time-tag">
                        <i className="bi bi-clock me-1"></i>
                        {new Date(
                          selectedConversation.createdAt,
                        ).toLocaleString()}
                      </span>
                    </div>
                    <a href="#" className="download-btn-link">
                      <i className="bi bi-download me-1"></i>
                      {selectedConversation.audioUrl?.split("\\").pop()}
                    </a>
                  </div>

                  <div className="custom-audio-wrapper">
                    {/* Nút Play/Pause dùng Bootstrap Icon */}
                    <button className="play-btn" onClick={handleToggleAudio}>
                      <i
                        className={`bi ${isPlaying ? "bi-pause-fill" : "bi-play-fill"}`}
                      ></i>
                    </button>

                    <div className="player-main">
                      <div className="waveform-container">
                        {/* Container cho Wavesurfer */}
                        <div ref={waveformRef} className="real-waveform" />
                      </div>

                      <div className="player-controls">
                        <button
                          className="control-node"
                          onClick={() => skipTime(-10)}
                        >
                          <i className="bi bi-arrow-counterclockwise"></i> 10s
                        </button>

                        <span className="current-time">
                          {formatTime(currentTime)} / {formatTime(duration)}
                        </span>

                        <button
                          className="control-node"
                          onClick={() => skipTime(10)}
                        >
                          10s <i className="bi bi-arrow-clockwise"></i>
                        </button>

                        <button
                          className="speed-badge"
                          onClick={handleSpeedChange}
                        >
                          {playbackRate}x
                        </button>

                        <div className="volume-wrapper">
                          <i
                            className={`bi ${volume === 0 ? "bi-volume-mute" : "bi-volume-up"}`}
                          ></i>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="volume-slider"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Score Summary */}
                  <div className="score-summary">
                    <div className="score-item">
                      <p>Final Score (AI)</p>
                      <h2
                        className={
                          selectedConversation.analysis?.score < 0.5
                            ? "text-danger"
                            : "text-success"
                        }
                      >
                        {selectedConversation.analysis?.score?.toFixed(2)} /
                        1.00
                      </h2>
                      <div className="progress-bar">
                        <div
                          className={`fill ${selectedConversation.analysis?.score < 0.5 ? "bg-danger" : "bg-success"}`}
                          style={{
                            width: `${selectedConversation.analysis?.score * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="score-item">
                      <p>AI Confidence</p>
                      <h2 className="text-dark">
                        {Math.round(
                          selectedConversation.analysis?.confidence * 100,
                        )}
                        %
                      </h2>
                      <div className="progress-bar confidence">
                        <div
                          className="fill bg-confidence"
                          style={{
                            width: `${selectedConversation.analysis?.confidence * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="transcript-container">
                  <div className="title-with-icon">
                    <div className="chat-icon-bg">
                      <i className="bi bi-chat-left-text-fill"></i>{" "}
                      {/* Icon Bootstrap */}
                    </div>
                    <h3 style={{ margin: 0 }}>Transcript (Diarization)</h3>
                  </div>
                  <div className="chat-window">
                    {selectedConversation.segments?.map((seg, idx) => (
                      <div
                        key={idx}
                        ref={(el) => (segmentRefs.current[idx] = el)}
                        onClick={() => {
                          if (!waveSurferRef.current || !duration) return;
                          waveSurferRef.current.seekTo(
                            seg.startTime / duration,
                          );
                          waveSurferRef.current.play();
                          setIsPlaying(true);
                        }}
                        className={`chat-msg ${getSpeakerRole(seg.speaker)} ${activeSegmentIndex === idx ? "active-segment" : ""}`}
                      >
                        <div className="avatar">
                          <img
                            src={
                              getSpeakerRole(seg.speaker) === "staff"
                                ? staff
                                : customer
                            }
                            alt="avatar"
                          />
                        </div>
                        <div className="msg-content">
                          <div className="msg-meta">
                            <strong>
                              {getSpeakerRole(seg.speaker) === "staff"
                                ? "Staff"
                                : "Customer"}
                            </strong>
                            <span>[{seg.startTime.toFixed(2)}s]</span>
                          </div>
                          <div className="bubble">{seg.text || "..."}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* RIGHT SIDEBAR */}
              <aside className="analysis-sidebar">
                <h3>Phân tích chuyên sâu</h3>
                {/* SPEAKER BREAKDOWN */}
                <div className="analysis-section">
                  <h4>Speaker Breakdown</h4>
                  {selectedConversation.SpeakerAnalysisResult?.map((s, i) => (
                    <div key={i} className="speaker-card">
                      <div className="speaker-main">
                        {/* Avatar giả lập theo hình */}
                        <div className="speaker-avatar">
                          <img
                            src={s.role === "staff" ? staff : customer}
                            alt="avatar"
                          />
                        </div>
                        <div className="speaker-info">
                          <div className="speaker-title">
                            <strong>
                              {s.role === "staff" ? "Staff" : "Customer"}
                            </strong>
                            <span className="speaker-id">
                              (SPEAKER_{i.toString().padStart(2, "0")})
                            </span>
                            <span className={`role-badge ${s.role}`}>
                              {s.role}
                            </span>
                          </div>

                          <div className="emotion-row">
                            <span className="label">Emotion:</span>
                            <span className={`emotion-badge ${s.emotion}`}>
                              {s.emotion}
                            </span>
                          </div>

                          <div className="score-row">
                            <span className="label">Score:</span>
                            <strong>{s.score?.toFixed(2)} / 1.00</strong>
                          </div>

                          <div className="progress-container">
                            <div className="progress-bar">
                              <div
                                className="fill"
                                style={{ width: `${s.score * 100}%` }}
                              />
                            </div>
                          </div>

                          <div className="confidence-row">
                            <span className="label">Confidence:</span>
                            <strong>{Math.round(s.confidence * 100)}%</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* VOICE TONE ANALYSIS */}
                <div className="analysis-section">
                  <h4>Voice Tone Analysis</h4>
                  {selectedConversation?.voiceTone &&
                  selectedConversation.voiceTone.length > 0 ? (
                    selectedConversation.voiceTone.map((tone, index) => {
                      // === FIX MATCHING ===
                      const speakerLabel = String(tone.speakerLabel || "")
                        .trim()
                        .toUpperCase();

                      const speakerData =
                        selectedConversation?.SpeakerAnalysisResult?.find(
                          (s) => {
                            const sLabel = String(s.speakerLabel || "")
                              .trim()
                              .toUpperCase();
                            return sLabel === speakerLabel;
                          },
                        );

                      const confidencePercent = Math.round(
                        (tone.toneConfidence || 0) * 100,
                      );

                      return (
                        <div
                          key={tone.speakerLabel || index}
                          className="tone-card-v2"
                        >
                          {" "}
                          {/* Dùng key tốt hơn */}
                          {/* HEADER */}
                          <div className="tone-header">
                            <div className="speaker-role-info">
                              <strong>
                                {speakerData?.role === "staff"
                                  ? "Staff"
                                  : "Customer"}
                              </strong>
                              <span
                                className={`role-badge ${speakerData?.role || "customer"}`}
                              >
                                {speakerData?.role || "customer"}
                              </span>
                            </div>

                            {/* CONFIDENCE CIRCLE */}
                            <div
                              className="confidence-circle-v2"
                              style={{
                                background: `conic-gradient(#22c55e ${confidencePercent * 3.6}deg, #e2e8f0 0deg)`,
                              }}
                            >
                              <div className="inner-white-circle">
                                {confidencePercent}%
                              </div>
                            </div>
                          </div>
                          {/* DETAILS */}
                          <div className="tone-details">
                            <div className="detail-item">
                              <span>Tone Emotion</span>
                              <span
                                className={`tone-badge ${tone.toneEmotion || "neutral"}`}
                              >
                                {tone.toneEmotion || "neutral"}
                              </span>
                            </div>

                            <div className="detail-item">
                              <span>Sentiment</span>
                              <strong>
                                {(tone.toneSentiment || "neutral").replace(
                                  "_",
                                  " ",
                                )}
                              </strong>
                            </div>

                            <div className="detail-item">
                              <span>Tone Score</span>
                              <strong>
                                {(tone.toneScore ?? 0).toFixed(2)}
                              </strong>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p>Không có dữ liệu voice tone</p>
                  )}
                </div>
              </aside>
            </div>
          </>
        ) : (
          <div className="empty-state">Chọn một cuộc gọi để xem chi tiết</div>
        )}
      </main>
    </div>
  );
};

export default HistoryPage;
