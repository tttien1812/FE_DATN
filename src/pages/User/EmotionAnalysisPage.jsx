import { useState, useRef, useEffect } from "react";
import {
  uploadAudioApi,
  getStatusApi,
  getResultApi,
} from "../../services/speechService";

import "../../styles/User/EmotionAnalysisPage.scss";

function EmotionAnalysisPage() {
  const [file, setFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const intervalRef = useRef(null);

  /* =========================
     CLEANUP (tránh memory leak)
  ========================= */
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);
      setAudioUrl(URL.createObjectURL(selectedFile));
      setData(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      alert("Vui lòng chọn file audio!");
      return;
    }

    const formData = new FormData();
    formData.append("audio", file);

    const userId = localStorage.getItem("userId");
    formData.append("userId", userId);

    try {
      setLoading(true);
      setData(null);

      /* =========================
         🔥 STEP 1: UPLOAD
      ========================= */
      const uploadRes = await uploadAudioApi(formData);

      if (uploadRes.data.errCode !== 0) {
        throw new Error("Upload failed");
      }

      const conversationId = uploadRes.data.data.conversationId;

      /* =========================
         🔥 STEP 2: POLLING
      ========================= */
      intervalRef.current = setInterval(async () => {
        try {
          const statusRes = await getStatusApi(conversationId);
          const status = statusRes.data.data.status;

          console.log("⏳ Status:", status);

          if (status === "done") {
            clearInterval(intervalRef.current);

            /* =========================
               🔥 STEP 3: GET RESULT
            ========================= */
            const resultRes = await getResultApi(conversationId);

            if (resultRes.data.errCode === 0) {
              setData(resultRes.data.data);
            } else {
              alert("Không thể lấy kết quả phân tích");
            }

            setLoading(false);

            // reset file
            setFile(null);
            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput) fileInput.value = "";
          }

          if (status === "failed") {
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
    } catch (e) {
      console.error(e);
      alert("Lỗi khi upload!");
      setLoading(false);
    }
  };

  const getEmoji = (emotion) => {
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

  return (
    <div className="emotion_page_container">
      <h1 className="emotion_page_title">🎙️ Speech Emotion Analysis</h1>

      {/* UPLOAD */}
      <div className="emotion_upload_box">
        <input type="file" accept="audio/*" onChange={handleFileChange} />

        <button
          className="emotion_upload_button"
          onClick={handleAnalyze}
          disabled={!file || loading}
        >
          {loading ? "🤖 Đang xử lý..." : "Phân tích"}
        </button>
      </div>

      {/* AUDIO */}
      {audioUrl && (
        <div className="emotion_audio_preview">
          <audio controls src={audioUrl}></audio>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="emotion_loading">
          🔄 Đang xử lý audio... (có thể mất vài giây)
        </div>
      )}

      {/* RESULT */}
      {data && (
        <div className="emotion_result">
          {/* Transcript */}
          <div className="emotion_card emotion_transcript">
            <h3>📝 Transcript</h3>
            <p>{data?.transcript?.content}</p>
          </div>

          {/* SPEAKER */}
          {data?.speakerSegments?.length > 0 && (
            <div className="emotion_card">
              <h3>🗣️ Conversation</h3>

              <div className="chat_container">
                {data.speakerSegments.map((seg, index) => {
                  const isSpeaker1 = seg.speaker === "SPEAKER_0";

                  return (
                    <div
                      key={index}
                      className={`chat_message ${
                        isSpeaker1 ? "left" : "right"
                      }`}
                    >
                      <div className="chat_bubble">
                        <div className="chat_meta">
                          <span className="speaker">{seg.speaker}</span>
                          <span className="time">
                            {(seg.startTime || seg.start)?.toFixed(1)}s -{" "}
                            {(seg.endTime || seg.end)?.toFixed(1)}s
                          </span>
                        </div>

                        <div className="chat_text">{seg.text}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ANALYSIS */}
          <div
            className={`emotion_card emotion_analysis emotion_${data?.analysis?.sentiment}`}
          >
            <h3>📊 Analysis</h3>

            <p>
              Emotion: {getEmoji(data?.analysis?.emotion)}{" "}
              <b>{data?.analysis?.emotion}</b>
            </p>

            <p>
              Sentiment: <b>{data?.analysis?.sentiment}</b>
            </p>

            <p>
              Voice Tone: <b>{data?.analysis?.voiceTone}</b>
            </p>

            <p>
              Confidence:{" "}
              <b>{((data?.analysis?.confidence || 0) * 100).toFixed(0)}%</b>
            </p>

            <div className="emotion_progress">
              <div
                className="emotion_progress_bar"
                style={{
                  width: `${(data?.analysis?.score || 0) * 100}%`,
                }}
              />
            </div>

            <p>Score: {((data?.analysis?.score || 0) * 100).toFixed(0)}%</p>
          </div>

          {/* SPEAKER ANALYSIS */}
          {data?.speakerAnalysis?.length > 0 && (
            <div className="emotion_card">
              <h3>🧠 Speaker Emotion</h3>

              <div className="speaker_analysis_container">
                {data.speakerAnalysis.map((sp, index) => (
                  <div
                    key={index}
                    className={`speaker_card emotion_${sp.sentiment}`}
                  >
                    <h4>{sp.speakerLabel}</h4>

                    <p>
                      {getEmoji(sp.emotion)} <b>{sp.emotion}</b>
                    </p>

                    <p>Sentiment: {sp.sentiment}</p>
                    <p>Voice: {sp.voiceTone}</p>

                    <div className="emotion_progress">
                      <div
                        className="emotion_progress_bar"
                        style={{
                          width: `${(sp.score || 0) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default EmotionAnalysisPage;
