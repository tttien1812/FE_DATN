import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import {
  uploadAudioApi,
  getStatusApi,
  getResultApi,
} from "../../services/speechService";
import customerAvatar from "../../assets/young-man.png";
import staffAvatar from "../../assets/customer-care.png";
import starIcon from "../../assets/star.png";
import playIcon from "../../assets/play.png";

import {
  BsCloudUpload,
  BsLightningCharge,
  BsArrowClockwise,
  BsClock,
  BsExclamationTriangle,
  BsPlayFill,
  BsPauseFill,
} from "react-icons/bs";

import "../../styles/User/EmotionAnalysisPage.scss";

function EmotionAnalysisPage() {
  const [file, setFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);
  const [currentSegment, setCurrentSegment] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioContainerRef = useRef(null);
  const wavesurferRef = useRef(null);
  const intervalRef = useRef(null);

  // Khởi tạo WaveSurfer khi có audioUrl
  useEffect(() => {
    if (!audioUrl || !audioContainerRef.current) return;

    // Nếu đã tồn tại instance cũ thì hủy để tạo mới
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    wavesurferRef.current = WaveSurfer.create({
      container: audioContainerRef.current,
      waveColor: "#cbd5e1",
      progressColor: "#7c3aed",
      cursorColor: "#7c3aed",
      barWidth: 2,
      barGap: 3,
      barRadius: 3,
      height: 80,
      responsive: true,
    });

    wavesurferRef.current.load(audioUrl);

    // Lắng nghe sự kiện cập nhật thời gian từ sóng âm
    wavesurferRef.current.on("audioprocess", () => {
      setCurrentTime(wavesurferRef.current.getCurrentTime());
    });

    wavesurferRef.current.on("seek", () => {
      setCurrentTime(wavesurferRef.current.getCurrentTime());
    });

    wavesurferRef.current.on("play", () => setIsPlaying(true));
    wavesurferRef.current.on("pause", () => setIsPlaying(false));
    wavesurferRef.current.on("finish", () => setIsPlaying(false));

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!data?.speakerSegments?.length) return;

    const seg = data.speakerSegments.find(
      (s) => currentTime >= s.startTime && currentTime <= s.endTime,
    );

    setCurrentSegment(seg || null);
  }, [currentTime, data]);

  const handleTogglePlay = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setAudioUrl(URL.createObjectURL(selectedFile));
    setData(null);
    setIsAnalyzed(false);
  };

  const handleResetUpload = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
      wavesurferRef.current = null;
    }
    setFile(null);
    setAudioUrl(null);
    setData(null);
    setLoading(false);
    setStatus("");
    setIsAnalyzed(false);
    setCurrentTime(0);
    setCurrentSegment(null);
    setIsPlaying(false);
  };

  const handleAnalyze = async () => {
    if (!file) {
      alert("Vui lòng chọn file audio!");
      return;
    }

    const formData = new FormData();
    formData.append("audio", file);
    formData.append("userId", localStorage.getItem("userId"));

    try {
      setLoading(true);
      setData(null);
      setIsAnalyzed(true);

      const uploadRes = await uploadAudioApi(formData);

      if (uploadRes.data.errCode !== 0) {
        throw new Error("Upload failed");
      }

      const conversationId = uploadRes.data.data.conversationId;
      setStatus("uploading");

      intervalRef.current = setInterval(async () => {
        try {
          const statusRes = await getStatusApi(conversationId);
          const currentStatus = statusRes.data.data.status;

          setStatus(currentStatus);

          if (currentStatus === "done") {
            clearInterval(intervalRef.current);

            const resultRes = await getResultApi(conversationId);

            if (resultRes.data.errCode === 0) {
              setData(resultRes.data.data);
            }

            setLoading(false);
          }

          if (currentStatus === "failed") {
            clearInterval(intervalRef.current);
            setLoading(false);
            alert("Xử lý thất bại!");
          }
        } catch (err) {
          clearInterval(intervalRef.current);
          setLoading(false);
          console.error(err);
        }
      }, 2000);
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Upload thất bại!");
    }
  };

  const formatPercent = (value) => `${Math.round((Number(value) || 0) * 100)}%`;

  const formatScore = (value) => (Number(value) || 0).toFixed(2);

  const formatTime = (time) => {
    if (!time && time !== 0) return "00:00";

    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);

    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getEmotionColor = (emotion) => {
    switch (emotion) {
      case "happy":
        return "#22c55e";
      case "sad":
        return "#3b82f6";
      case "angry":
        return "#ef4444";
      case "fear":
        return "#f97316";
      case "surprise":
        return "#eab308";
      case "disgust":
        return "#a855f7";
      case "neutral":
      default:
        return "#94a3b8";
    }
  };

  const getEmotionEmoji = (emotion) => {
    switch (emotion) {
      case "happy":
        return "😊";
      case "sad":
        return "😢";
      case "angry":
        return "😡";
      case "fear":
        return "😨";
      case "surprise":
        return "😲";
      case "disgust":
        return "🤢";
      default:
        return "😐";
    }
  };

  const getEmotionVi = (emotion) => {
    const map = {
      happy: "Vui vẻ",
      sad: "Buồn bã",
      angry: "Tức giận",
      fear: "Sợ hãi",
      surprise: "Ngạc nhiên",
      disgust: "Ghê tởm",
      neutral: "Trung lập",
    };
    return map[emotion] || emotion || "Trung lập";
  };

  const getRoleData = (speakerLabel) => {
    return data?.speakerAnalysis?.find((s) => s.speakerLabel === speakerLabel);
  };

  const getSpeakerByRole = (role) => {
    return data?.speakerAnalysis?.find((s) => s.role === role);
  };

  const getVoiceToneBySpeaker = (speakerLabel) => {
    return data?.voiceTone?.find((v) => v.speakerLabel === speakerLabel);
  };

  const getRoleScore = (role) => {
    if (role === "staff") return data?.analysis?.staffScore;
    if (role === "customer") return data?.analysis?.customerScore;
    return 0;
  };

  const getSentimentVi = (sentiment) => {
    const map = {
      very_positive: "Rất tích cực",
      positive: "Tích cực",
      neutral: "Trung lập",
      negative: "Tiêu cực",
      very_negative: "Rất tiêu cực",
    };

    return map?.[sentiment] || sentiment || "Chưa có dữ liệu";
  };

  const getScoreBadge = (score) => {
    const value = Number(score) || 0;

    if (value >= 0.8) return { label: "Rất tốt", className: "success" };
    if (value >= 0.6) return { label: "Tốt", className: "success" };
    if (value >= 0.4) return { label: "Trung bình", className: "warning" };
    return { label: "Cần chú ý", className: "danger" };
  };

  const getStatusStep = (status) => {
    switch (status) {
      case "uploading":
        return "Đang tải tệp lên hệ thống...";
      case "processing":
        return "Đang nhận diện giọng nói...";
      case "completed":
        return "Đang phân tích sắc thái cảm xúc...";
      case "done":
        return "Phân tích hoàn tất!";
      case "failed":
        return "Xử lý thất bại";
      default:
        return "Quá trình phân tích có thể mất từ 30 giây đến vài phút.";
    }
  };

  const getToneWarning = (seg) => {
    if (!seg) return null;

    if (seg.toneScore < 0.35 && seg.toneConfidence >= 0.6) {
      return "Giọng nói có dấu hiệu tiêu cực";
    }

    if (
      ["angry", "disgust", "fear"].includes(seg.toneEmotion) &&
      seg.toneConfidence >= 0.75
    ) {
      return "Cần kiểm tra lại sắc thái giọng nói";
    }

    return null;
  };

  const seekAudio = (time) => {
    if (!wavesurferRef.current) return;
    wavesurferRef.current.setTime(time);
    wavesurferRef.current.play();
  };

  const totalDuration =
    Math.max(...(data?.speakerSegments?.map((s) => s.endTime) || [1])) || 1;

  const finalBadge = getScoreBadge(data?.analysis?.score);
  const customerBadge = getScoreBadge(data?.analysis?.customerScore);
  const staffBadge = getScoreBadge(data?.analysis?.staffScore);

  return (
    <div className="vox-analytics-container">
      {/* ĐÃ BỎ TOÀN BỘ KHỐI HEADER/TÊN HỆ THỐNG THEO YÊU CẦU */}

      <section className="analysis-trigger-section">
        <div className="trigger-left">
          <h2>Phân tích hội thoại bằng AI</h2>
          <p>
            Tải lên file audio để phân tích cảm xúc, giọng nói và chất lượng
            cuộc hội thoại.
          </p>
          <div className="supported-formats">Hỗ trợ: MP3, WAV, M4A, FLAC</div>
        </div>

        <div className="trigger-right">
          {!isAnalyzed ? (
            <>
              <div className="dropzone-box">
                <input
                  type="file"
                  id="audio-upload"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="hidden-file-input"
                />

                <label htmlFor="audio-upload" className="dropzone-label">
                  <div className="upload-icon">
                    <BsCloudUpload />
                  </div>
                  <p>
                    {file
                      ? `Đã chọn: ${file.name}`
                      : "Kéo & thả file audio vào đây hoặc"}
                  </p>

                  {!file && (
                    <span className="browse-btn">Chọn file từ máy tính</span>
                  )}
                </label>
              </div>

              <div className="action-area">
                <button
                  className="btn-primary-analyze"
                  disabled={!file || loading}
                  onClick={handleAnalyze}
                >
                  <BsLightningCharge style={{ marginRight: "6px" }} /> Phân tích
                  ngay
                </button>

                <p className="notice-text">
                  Quá trình phân tích có thể mất từ 30 giây đến vài phút.
                </p>
              </div>
            </>
          ) : (
            <div className="status-fixed-box">
              <div className="status-display">
                <div
                  className={`status-spinner ${loading ? "spinning" : "done"}`}
                ></div>

                <div className="status-info">
                  <h4>Trạng thái xử lý tệp</h4>
                  <p>{getStatusStep(status)}</p>
                </div>
              </div>

              {!loading && status === "done" && (
                <button
                  className="btn-secondary-reload"
                  onClick={handleResetUpload}
                >
                  <BsArrowClockwise style={{ marginRight: "6px" }} /> Tiếp tục
                  tải lên file
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {(audioUrl || data) && (
        <main className="vox-dashboard-grid">
          <div className="grid-row-double">
            {audioUrl && (
              <div className="vox-card audio-player-card">
                <div className="card-header">
                  <h3>Trình phát Audio</h3>
                </div>

                <div className="audio-player-body">
                  {/* SỬ DỤNG THƯ VIỆN WAVESURFER THAY THẾ CHO MOCK WAVE cũ */}
                  <div className="wavesurfer-outer">
                    <div
                      ref={audioContainerRef}
                      className="wavesurfer-container"
                    ></div>
                    <span className="time-tooltip">
                      {formatTime(currentTime)}
                    </span>
                  </div>

                  <div className="audio-controls-area">
                    <button
                      className="btn-play-pause"
                      onClick={handleTogglePlay}
                    >
                      {isPlaying ? (
                        <BsPauseFill size={20} />
                      ) : (
                        <BsPlayFill size={20} />
                      )}
                    </button>
                    <div className="file-meta-tag">
                      <span>
                        {file?.name} ({(file?.size / 1024 / 1024).toFixed(2)}{" "}
                        MB)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="vox-card live-segment-card">
              <div className="card-header-flex">
                <h3>Phân đoạn hiện tại</h3>
                <span className="live-badge">● TRỰC TIẾP</span>
              </div>

              <div className="card-body">
                {currentSegment ? (
                  <>
                    <div className="segment-speaker-meta">
                      {/* THÊM HÌNH ẢNH AVATAR CHO KHỐI LIVE */}
                      <img
                        src={
                          getRoleData(currentSegment.speaker)?.role === "staff"
                            ? staffAvatar
                            : customerAvatar
                        }
                        alt="Avatar"
                        className="avatar-mini-img"
                      />
                      <div>
                        <h4>
                          {getRoleData(currentSegment.speaker)?.role === "staff"
                            ? "Nhân viên"
                            : "Khách hàng"}
                        </h4>
                        <span>
                          <BsClock
                            style={{
                              marginRight: "4px",
                              display: "inline-block",
                              verticalAlign: "middle",
                            }}
                          />{" "}
                          {formatTime(currentSegment.startTime)} -{" "}
                          {formatTime(currentSegment.endTime)}
                        </span>
                      </div>
                    </div>

                    <div className="segment-metrics-bars">
                      <div className="metric-progress-item">
                        <div className="label-row">
                          <span>
                            Cảm xúc văn bản (
                            {getEmotionVi(currentSegment.emotion)})
                          </span>
                          <span>
                            {formatPercent(currentSegment.emotionScore)}
                          </span>
                        </div>

                        <div className="bar-bg">
                          <div
                            className="bar-fill"
                            style={{
                              width: formatPercent(currentSegment.emotionScore),
                              backgroundColor: getEmotionColor(
                                currentSegment.emotion,
                              ),
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="metric-progress-item">
                        <div className="label-row">
                          <span>
                            Giọng điệu cuộc gọi (
                            {getEmotionVi(currentSegment.toneEmotion)})
                          </span>
                          <span>{formatPercent(currentSegment.toneScore)}</span>
                        </div>

                        <div className="bar-bg">
                          <div
                            className="bar-fill"
                            style={{
                              width: formatPercent(currentSegment.toneScore),
                              backgroundColor: getEmotionColor(
                                currentSegment.toneEmotion,
                              ),
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {getToneWarning(currentSegment) && (
                      <div className="warning-alert-box">
                        <BsExclamationTriangle
                          style={{
                            marginRight: "6px",
                            display: "inline-block",
                          }}
                        />{" "}
                        {getToneWarning(currentSegment)}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="empty-state">
                    Audio chưa tới phân đoạn nào hoặc đang tải dữ liệu...
                  </div>
                )}
              </div>
            </div>
          </div>

          {data && (
            <div className="four-columns-summary">
              {/* KHỐI 1: ĐIỂM SỐ TỔNG KẾT (Thêm starIcon) */}
              <div className="summary-stat-card role-card-with-img">
                <img
                  src={playIcon}
                  alt="Tổng kết"
                  className="summary-role-img"
                />
                <div className="summary-content">
                  <span className="stat-label">Điểm số tổng kết</span>
                  <div className="stat-value-group">
                    <span className="main-val">
                      {formatScore(data?.analysis?.score)}
                    </span>
                    <span className="sub-val">/ 1.00</span>
                    <span className={`badge-status ${finalBadge.className}`}>
                      {finalBadge.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* KHỐI 2: ĐIỂM KHÁCH HÀNG (Giữ nguyên) */}
              <div className="summary-stat-card role-card-with-img">
                <img
                  src={customerAvatar}
                  alt="Khách hàng"
                  className="summary-role-img"
                />
                <div className="summary-content">
                  <span className="stat-label">Điểm khách hàng</span>
                  <div className="stat-value-group">
                    <span className="main-val">
                      {formatScore(data?.analysis?.customerScore)}
                    </span>
                    <span className="sub-val">/ 1.00</span>
                    <span className={`badge-status ${customerBadge.className}`}>
                      {customerBadge.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* KHỐI 3: ĐIỂM NHÂN VIÊN (Giữ nguyên) */}
              <div className="summary-stat-card role-card-with-img">
                <img
                  src={staffAvatar}
                  alt="Nhân viên"
                  className="summary-role-img"
                />
                <div className="summary-content">
                  <span className="stat-label">Điểm nhân viên</span>
                  <div className="stat-value-group">
                    <span className="main-val">
                      {formatScore(data?.analysis?.staffScore)}
                    </span>
                    <span className="sub-val">/ 1.00</span>
                    <span className={`badge-status ${staffBadge.className}`}>
                      {staffBadge.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* KHỐI 4: ĐÁNH GIÁ CHUNG / SENTIMENT (Thêm playIcon) */}
              <div className="summary-stat-card role-card-with-img">
                <img
                  src={starIcon}
                  alt="Đánh giá"
                  className="summary-role-img"
                />
                <div className="summary-content">
                  <span className="stat-label">Đánh giá chung</span>
                  <div className="stat-value-group">
                    <span className="main-val text-capitalize">
                      {getSentimentVi(data?.analysis?.sentiment)}
                    </span>
                    <span className="percentage-badge">
                      {getEmotionVi(data?.analysis?.emotion)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {data && (
            <div className="vox-card timeline-full-card">
              <div className="card-header">
                <h3>Dòng thời gian cảm xúc</h3>
              </div>

              <div className="timeline-container-body">
                {["staff", "customer"].map((role) => {
                  const roleSpeaker = getSpeakerByRole(role);
                  const speakerLabel = roleSpeaker?.speakerLabel;

                  const roleSegments = data?.speakerSegments?.filter(
                    (seg) => seg.speaker === speakerLabel,
                  );

                  return (
                    <div key={role} className="timeline-swimlane">
                      <div className="swimlane-label">
                        {role === "staff" ? "NHÂN VIÊN" : "KHÁCH HÀNG"}
                      </div>

                      <div className="swimlane-track">
                        {roleSegments?.map((seg) => {
                          const isActive =
                            currentTime >= seg.startTime &&
                            currentTime <= seg.endTime;

                          return (
                            <div
                              key={seg.id}
                              className={`timeline-chunk ${
                                isActive ? "is-active" : ""
                              }`}
                              onClick={() => seekAudio(seg.startTime)}
                              style={{
                                left: `${(seg.startTime / totalDuration) * 100}%`,
                                width: `${
                                  ((seg.endTime - seg.startTime) /
                                    totalDuration) *
                                  100
                                }%`,
                                backgroundColor: getEmotionColor(
                                  seg.emotion || "neutral",
                                ),
                              }}
                              title={`${formatTime(seg.startTime)} - ${formatTime(
                                seg.endTime,
                              )} | Nội dung: ${getEmotionVi(seg.emotion)}`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                <div className="timeline-axis-labels">
                  <span>00:00</span>
                  <span>{formatTime(totalDuration * 0.25)}</span>
                  <span>{formatTime(totalDuration * 0.5)}</span>
                  <span>{formatTime(totalDuration * 0.75)}</span>
                  <span>{formatTime(totalDuration)}</span>
                </div>

                <div className="timeline-legends">
                  {[
                    "happy",
                    "neutral",
                    "sad",
                    "angry",
                    "fear",
                    "surprise",
                    "disgust",
                  ].map((emotion) => (
                    <span
                      key={emotion}
                      className="legend-dot"
                      style={{ "--dot-clr": getEmotionColor(emotion) }}
                    >
                      {getEmotionVi(emotion)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {data && (
            <div className="speaker-summary-twocol">
              {["staff", "customer"].map((role) => {
                const speaker = getSpeakerByRole(role);
                const voice = getVoiceToneBySpeaker(speaker?.speakerLabel);
                const roleScore = getRoleScore(role);
                const roleBadge = getScoreBadge(roleScore);

                return (
                  <div
                    key={role}
                    className={`vox-card speaker-summary-box ${
                      role === "staff" ? "staff-theme" : "customer-theme"
                    }`}
                  >
                    <div className="speaker-header">
                      {/* CHÈN ẢNH THAY EMOTICON CHO KHỐI SUMMARY CHI TIẾT */}
                      <img
                        src={role === "staff" ? staffAvatar : customerAvatar}
                        alt="Avatar"
                        className="avatar-circle-img"
                      />

                      <div>
                        <h3>
                          {role === "staff"
                            ? "Tổng kết của Nhân viên"
                            : "Tổng kết của Khách hàng"}
                        </h3>

                        <span
                          className={`badge-role ${
                            role === "staff" ? "purple" : "green"
                          }`}
                        >
                          {role === "staff" ? "Nhân viên" : "Khách hàng"}
                        </span>
                      </div>
                    </div>

                    <div className="speaker-body-stats">
                      <div className="stat-line">
                        <span>Cảm xúc văn bản</span>
                        <span
                          className={`badge-tag ${speaker?.emotion || "neutral"}`}
                        >
                          {getEmotionEmoji(speaker?.emotion)}{" "}
                          {getEmotionVi(speaker?.emotion)}
                        </span>
                      </div>

                      <div className="stat-line">
                        <span>Sắc thái văn bản</span>
                        <span
                          className={`badge-tag ${speaker?.sentiment || "neutral"}`}
                        >
                          {getSentimentVi(speaker?.sentiment)}
                        </span>
                      </div>

                      <div className="stat-line">
                        <span>Giọng điệu cuộc gọi</span>
                        <span
                          className={`badge-tag ${voice?.toneEmotion || "neutral"}`}
                        >
                          {getEmotionEmoji(voice?.toneEmotion)}{" "}
                          {getEmotionVi(voice?.toneEmotion)}
                        </span>
                      </div>

                      <div className="stat-line">
                        <span>Sắc thái giọng điệu</span>
                        <span
                          className={`badge-tag ${
                            voice?.toneSentiment || "neutral"
                          }`}
                        >
                          {getSentimentVi(voice?.toneSentiment)}
                        </span>
                      </div>

                      <div className="stat-line-progress">
                        <div className="txt">
                          <span>Điểm số vai trò</span>
                          <span>{formatPercent(roleScore)}</span>
                        </div>

                        <div className="bar-mini-bg">
                          <div
                            className="bar-mini-fill"
                            style={{
                              width: formatPercent(roleScore),
                              backgroundColor: getEmotionColor(
                                voice?.toneEmotion || speaker?.emotion,
                              ),
                            }}
                          ></div>
                        </div>

                        <div className={`badge-status ${roleBadge.className}`}>
                          {roleBadge.label}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      )}
    </div>
  );
}

export default EmotionAnalysisPage;
