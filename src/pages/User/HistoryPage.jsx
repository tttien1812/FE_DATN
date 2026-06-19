import { useEffect, useState, useRef } from "react";
import {
  getHistoryDays,
  getHistoryByDate,
  getHistoryDetail,
  getHistoryInsight,
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

  const [callInsights, setCallInsights] = useState([]);
  const [activeInsight, setActiveInsight] = useState(null);

  const [showAnalysis, setShowAnalysis] = useState(true);
  const [showInsights, setShowInsights] = useState(true);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(null);

  const segmentRefs = useRef([]);
  const waveformRef = useRef(null);
  const waveSurferRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const fetchDays = async () => {
      const res = await getHistoryDays(userId);

      if (res.data.errCode === 0) {
        setDays(res.data.data);
      }
    };

    fetchDays();
  }, [userId]);

  const handleSelectDate = async (date) => {
    setSelectedDate(date);
    setSelectedConversation(null);
    setCallInsights([]);
    setActiveInsight(null);

    const res = await getHistoryByDate(userId, date);

    if (res.data.errCode === 0) {
      setConversations(res.data.data);
    }
  };

  const handleSelectConversation = async (id) => {
    try {
      const [detailRes, insightRes] = await Promise.all([
        getHistoryDetail(id),
        getHistoryInsight(id, "user"),
      ]);

      if (detailRes.data.errCode === 0) {
        setSelectedConversation(detailRes.data.data);
        setActiveInsight(null);
        setActiveSegmentIndex(null);
        setCurrentTime(0);
        setIsPlaying(false);
      }

      if (insightRes.data.errCode === 0) {
        setCallInsights(insightRes.data.data);
      } else {
        setCallInsights([]);
      }
    } catch (error) {
      console.error("Select conversation error:", error);
    }
  };

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

    if (waveSurferRef.current && duration) {
      waveSurferRef.current.seekTo(targetSegment.startTime / duration);
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

  useEffect(() => {
    if (!selectedConversation?.audioUrl) return;

    if (waveSurferRef.current) {
      waveSurferRef.current.destroy();
    }

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
      `http://localhost:3000/${selectedConversation.audioUrl?.replace(
        /\\/g,
        "/",
      )}`,
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
      if (waveSurferRef.current) {
        waveSurferRef.current.destroy();
      }
    };
  }, [selectedConversation]);

  const formatTime = (time) => {
    if (!time && time !== 0) return "00:00";

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

    if (waveSurferRef.current) {
      waveSurferRef.current.setVolume(value);
    }
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

  const getInsightIcon = (item) => {
    if (item.group === "segment") return "bi-chat-left-text-fill";
    if (item.group === "voice") return "bi-soundwave";
    if (item.group === "staff") return "bi-person-badge-fill";
    if (item.group === "customer") return "bi-people-fill";
    if (item.group === "overall") return "bi-clipboard-data-fill";

    if (item.type === "danger") return "bi-exclamation-triangle-fill";
    if (item.type === "warning") return "bi-exclamation-circle-fill";

    return "bi-check-circle-fill";
  };

  const getInsightMainLabel = (item) => {
    if (item.group === "overall") return "Đánh giá tổng thể";
    if (item.group === "customer") return "Trải nghiệm khách hàng";
    if (item.group === "staff") return "Chất lượng nhân viên";
    if (item.group === "segment") return "Đoạn hội thoại cần xem";
    if (item.group === "voice") return "Sắc thái giọng nói";

    return "Nhận xét hệ thống";
  };

  const getInsightMetricLabel = (item) => {
    if (item.metric?.includes("đoạn")) return item.metric;
    if (item.metric?.includes("cuộc gọi")) return item.metric;

    return `${item.metric} / 1.00`;
  };

  if (!userId) return <div className="no-login">Bạn chưa đăng nhập</div>;

  return (
    <div className="history-container">
      <aside className="call-sidebar">
        <div className="sidebar-header">
          <h2 className="title">Lịch sử cuộc gọi</h2>

          <div className="search-box">
            <input type="text" placeholder="Tìm kiếm theo nội dung, ID..." />
            <i className="bi bi-search filter-icon"></i>
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
                    className={`call-card ${
                      selectedConversation?.id === item.id ? "active" : ""
                    }`}
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
                    <button className="play-btn" onClick={handleToggleAudio}>
                      <i
                        className={`bi ${
                          isPlaying ? "bi-pause-fill" : "bi-play-fill"
                        }`}
                      ></i>
                    </button>

                    <div className="player-main">
                      <div className="waveform-container">
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
                            className={`bi ${
                              volume === 0 ? "bi-volume-mute" : "bi-volume-up"
                            }`}
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
                          className={`fill ${
                            selectedConversation.analysis?.score < 0.5
                              ? "bg-danger"
                              : "bg-success"
                          }`}
                          style={{
                            width: `${
                              selectedConversation.analysis?.score * 100
                            }%`,
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
                            width: `${
                              selectedConversation.analysis?.confidence * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="transcript-container">
                  <div className="title-with-icon">
                    <div className="chat-icon-bg">
                      <i className="bi bi-chat-left-text-fill"></i>
                    </div>

                    <h3 style={{ margin: 0 }}>Transcript (Diarization)</h3>
                  </div>

                  <div className="chat-window">
                    {selectedConversation.segments?.map((seg, idx) => {
                      const isInsightHighlighted =
                        activeInsight?.segmentIds?.includes(seg.id);

                      return (
                        <div
                          key={seg.id || idx}
                          ref={(el) => (segmentRefs.current[idx] = el)}
                          onClick={() => {
                            if (!waveSurferRef.current || !duration) return;

                            waveSurferRef.current.seekTo(
                              seg.startTime / duration,
                            );
                            waveSurferRef.current.play();
                            setIsPlaying(true);
                          }}
                          className={`chat-msg ${getSpeakerRole(seg.speaker)} ${
                            activeSegmentIndex === idx ? "active-segment" : ""
                          } ${
                            isInsightHighlighted
                              ? "insight-highlight-segment"
                              : ""
                          }`}
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
                      );
                    })}
                  </div>
                </div>
              </section>

              <aside className="analysis-sidebar">
                <div
                  className="section-dropdown-header"
                  onClick={() => setShowAnalysis(!showAnalysis)}
                >
                  <h3>
                    <i className="bi bi-bar-chart-line-fill"></i>
                    Phân tích chuyên sâu
                  </h3>

                  <i
                    className={`bi ${
                      showAnalysis ? "bi-chevron-up" : "bi-chevron-down"
                    }`}
                  ></i>
                </div>

                {showAnalysis && (
                  <>
                    <div className="analysis-section">
                      <h4>Speaker Breakdown</h4>

                      {selectedConversation.SpeakerAnalysisResult?.map(
                        (s, i) => (
                          <div key={i} className="speaker-card">
                            <div className="speaker-main">
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
                                    ({s.speakerLabel})
                                  </span>

                                  <span className={`role-badge ${s.role}`}>
                                    {s.role}
                                  </span>
                                </div>

                                <div className="emotion-row">
                                  <span className="label">Emotion:</span>

                                  <span
                                    className={`emotion-badge ${s.emotion}`}
                                  >
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

                                  <strong>
                                    {Math.round(s.confidence * 100)}%
                                  </strong>
                                </div>
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>

                    <div className="analysis-section">
                      <h4>Voice Tone Analysis</h4>

                      {selectedConversation?.voiceTone &&
                      selectedConversation.voiceTone.length > 0 ? (
                        selectedConversation.voiceTone.map((tone, index) => {
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
                              <div className="tone-header">
                                <div className="speaker-role-info">
                                  <strong>
                                    {speakerData?.role === "staff"
                                      ? "Staff"
                                      : "Customer"}
                                  </strong>

                                  <span
                                    className={`role-badge ${
                                      speakerData?.role || "customer"
                                    }`}
                                  >
                                    {speakerData?.role || "customer"}
                                  </span>
                                </div>

                                <div
                                  className="confidence-circle-v2"
                                  style={{
                                    background: `conic-gradient(#22c55e ${
                                      confidencePercent * 3.6
                                    }deg, #e2e8f0 0deg)`,
                                  }}
                                >
                                  <div className="inner-white-circle">
                                    {confidencePercent}%
                                  </div>
                                </div>
                              </div>

                              <div className="tone-details">
                                <div className="detail-item">
                                  <span>Tone Emotion</span>

                                  <span
                                    className={`tone-badge ${
                                      tone.toneEmotion || "neutral"
                                    }`}
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
                  </>
                )}

                <div
                  className="section-dropdown-header insight-header-dropdown"
                  onClick={() => setShowInsights(!showInsights)}
                >
                  <h3>
                    <i className="bi bi-lightbulb-fill"></i>
                    Insight cuộc gọi
                  </h3>

                  <i
                    className={`bi ${
                      showInsights ? "bi-chevron-up" : "bi-chevron-down"
                    }`}
                  ></i>
                </div>

                {showInsights && (
                  <div className="analysis-section insight-sidebar-section">
                    <div className="call-insight-list">
                      {callInsights.length > 0 ? (
                        callInsights.map((item, index) => (
                          <div
                            key={index}
                            className={`call-insight-item ${item.type}`}
                            onClick={() => handleClickInsight(item)}
                          >
                            <div className="call-insight-header">
                              <div className="insight-title-wrapper">
                                <div className={`insight-icon ${item.type}`}>
                                  <i
                                    className={`bi ${getInsightIcon(item)}`}
                                  ></i>
                                </div>

                                <div className="insight-title-content">
                                  <span className="insight-group-label">
                                    {getInsightMainLabel(item)}
                                  </span>

                                  <h5>{item.title}</h5>

                                  {item.metric && (
                                    <span className="insight-metric">
                                      {getInsightMetricLabel(item)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="insight-body">
                              <div className="insight-section">
                                <span className="section-label">
                                  Nguyên nhân
                                </span>

                                <p>{item.message}</p>
                              </div>

                              <div className="insight-section action">
                                <span className="section-label">
                                  Hành động đề xuất
                                </span>

                                <p>
                                  <i className="bi bi-arrow-right-circle-fill"></i>
                                  {item.action}
                                </p>
                              </div>
                            </div>

                            {item.segmentIds?.length > 0 && (
                              <div className="segment-hint">
                                <i className="bi bi-play-circle-fill"></i>
                                Đã đánh dấu {item.segmentIds.length} đoạn trên
                                transcript. Nhấn để xem.
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="empty-state">
                          Chưa có insight cho cuộc gọi này
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
