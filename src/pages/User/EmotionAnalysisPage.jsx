// import { useState } from "react";
// import { uploadAudioApi } from "../../services/speechService";
// import "../../styles/User/EmotionAnalysisPage.scss";

// function EmotionAnalysisPage() {
//   const [file, setFile] = useState(null);
//   const [audioUrl, setAudioUrl] = useState(null);
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleFileChange = (e) => {
//     const selectedFile = e.target.files[0];

//     if (selectedFile) {
//       setFile(selectedFile);
//       setAudioUrl(URL.createObjectURL(selectedFile));
//       setData(null); // reset result khi chọn file mới
//     }
//   };

//   const handleAnalyze = async () => {
//     if (!file) {
//       alert("Vui lòng chọn file audio!");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("audio", file);

//     const userId = localStorage.getItem("userId");
//     formData.append("userId", userId);

//     try {
//       setLoading(true);

//       const res = await uploadAudioApi(formData);

//       if (res.data.errCode === 0) {
//         setData(res.data.data);

//         // reset file
//         setFile(null);
//         const fileInput = document.querySelector('input[type="file"]');
//         if (fileInput) fileInput.value = "";
//       }
//     } catch (e) {
//       console.error(e);
//       alert("Lỗi khi phân tích audio!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getEmoji = (emotion) => {
//     switch (emotion) {
//       case "happy":
//         return "😊";
//       case "sad":
//         return "😢";
//       case "angry":
//         return "😡";
//       case "fear":
//         return "😨";
//       case "surprise":
//         return "😲";
//       case "disgust":
//         return "🤢";
//       default:
//         return "😐";
//     }
//   };

//   return (
//     <div className="emotion_page_container">
//       <h1 className="emotion_page_title">🎙️ Speech Emotion Analysis</h1>

//       {/* UPLOAD */}
//       <div className="emotion_upload_box">
//         <input type="file" accept="audio/*" onChange={handleFileChange} />

//         <button
//           className="emotion_upload_button"
//           onClick={handleAnalyze}
//           disabled={!file || loading}
//         >
//           {loading ? "🤖 Đang phân tích..." : "Phân tích"}
//         </button>
//       </div>

//       {/* AUDIO PREVIEW */}
//       {audioUrl && (
//         <div className="emotion_audio_preview">
//           <audio controls src={audioUrl}></audio>
//         </div>
//       )}

//       {/* LOADING */}
//       {loading && (
//         <div className="emotion_loading">AI đang xử lý dữ liệu...</div>
//       )}

//       {/* RESULT */}
//       {data && (
//         <div className="emotion_result">
//           {/* Transcript */}
//           <div className="emotion_card emotion_transcript">
//             <h3>📝 Transcript</h3>
//             <p>{data?.transcript?.content}</p>
//           </div>
//           // 🔥 NEW BLOCK HERE
//           {data?.speakerSegments && data.speakerSegments.length > 0 && (
//             <div className="emotion_card">
//               <h3>🗣️ Conversation</h3>

//               <div className="chat_container">
//                 {data.speakerSegments.map((seg, index) => {
//                   const isSpeaker1 = seg.speaker === "SPEAKER_00";

//                   return (
//                     <div
//                       key={index}
//                       className={`chat_message ${
//                         isSpeaker1 ? "left" : "right"
//                       }`}
//                     >
//                       <div className="chat_bubble">
//                         <div className="chat_meta">
//                           <span className="speaker">{seg.speaker}</span>
//                           <span className="time">
//                             {seg.start.toFixed(1)}s - {seg.end.toFixed(1)}s
//                           </span>
//                         </div>

//                         <div className="chat_text">{seg.text}</div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           )}
//           {/* Analysis */}
//           <div
//             className={`emotion_card emotion_analysis emotion_${data?.analysis?.sentiment}`}
//           >
//             <h3>📊 Analysis</h3>

//             <p>
//               Emotion: {getEmoji(data?.analysis?.emotion)}{" "}
//               <b>{data?.analysis?.emotion}</b>
//             </p>

//             <p>
//               Sentiment: <b>{data?.analysis?.sentiment}</b>
//             </p>

//             <p>
//               Voice Tone: <b>{data?.analysis?.voiceTone}</b>
//             </p>

//             <p>
//               Confidence:{" "}
//               <b>
//                 {data?.analysis?.confidence
//                   ? (data.analysis.confidence * 100).toFixed(0)
//                   : 0}
//                 %
//               </b>
//             </p>

//             <p>
//               Processing Time: <b>{data?.analysis?.processingTime || 0}s</b>
//             </p>

//             {/* SCORE */}
//             <div className="emotion_progress">
//               <div
//                 className="emotion_progress_bar"
//                 style={{
//                   width: `${(data?.analysis?.score || 0) * 100}%`,
//                 }}
//               />
//             </div>

//             <p>Score: {((data?.analysis?.score || 0) * 100).toFixed(0)}%</p>

//             {/* EMOTION BREAKDOWN */}
//             <div className="emotion_breakdown">
//               <h4>Emotion Details</h4>

//               {Object.entries(data?.analysis?.emotionDetail || {})
//                 .sort((a, b) => b[1] - a[1])
//                 .map(([key, value]) => (
//                   <div key={key} className="emotion_item">
//                     <span className="emotion_label">
//                       {getEmoji(key)} {key}
//                     </span>

//                     <div className="emotion_bar">
//                       <div
//                         className="emotion_fill"
//                         style={{
//                           width: `${value * 100}%`,
//                         }}
//                       />
//                     </div>

//                     <span className="emotion_percent">
//                       {(value * 100).toFixed(0)}%
//                     </span>
//                   </div>
//                 ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default EmotionAnalysisPage;

import { useState } from "react";
import {
  uploadAudioApi,
  analyzeEmotionApi, // 🔥 thêm API mới
} from "../../services/speechService";
import "../../styles/User/EmotionAnalysisPage.scss";

function EmotionAnalysisPage() {
  const [file, setFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

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

      /* =========================
         🔥 STEP 1: UPLOAD AUDIO
      ========================= */
      const uploadRes = await uploadAudioApi(formData);

      if (uploadRes.data.errCode !== 0) {
        throw new Error("Upload audio failed");
      }

      const uploadData = uploadRes.data.data;
      const conversationId = uploadData.conversationId;

      await new Promise((resolve) => setTimeout(resolve, 500));
      /* =========================
         🔥 STEP 2: ANALYZE EMOTION
         (CHẠY SAU KHI UPLOAD XONG)
      ========================= */
      const emotionRes = await analyzeEmotionApi(conversationId);

      if (emotionRes.data.errCode !== 0) {
        throw new Error("Analyze emotion failed");
      }

      const analysisData = emotionRes.data.data;

      /* =========================
         🔥 MERGE DATA (GIỮ UI CŨ)
      ========================= */
      const finalData = {
        ...uploadData,
        analysis: analysisData.analysis,
        speakerAnalysis: analysisData.speakerAnalysis || [],
      };

      setData(finalData);

      // reset file
      setFile(null);
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";
    } catch (e) {
      console.error(e);
      alert("Lỗi khi phân tích audio!");
    } finally {
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
          {loading ? "🤖 Đang phân tích..." : "Phân tích"}
        </button>
      </div>

      {/* AUDIO PREVIEW */}
      {audioUrl && (
        <div className="emotion_audio_preview">
          <audio controls src={audioUrl}></audio>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="emotion_loading">AI đang xử lý dữ liệu...</div>
      )}

      {/* RESULT */}
      {data && (
        <div className="emotion_result">
          {/* Transcript */}
          <div className="emotion_card emotion_transcript">
            <h3>📝 Transcript</h3>
            <p>{data?.transcript?.content}</p>
          </div>

          {/* 🔥 SPEAKER */}
          {data?.speakerSegments && data.speakerSegments.length > 0 && (
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
                            {seg.startTime?.toFixed(1) || seg.start?.toFixed(1)}
                            s{" - "}
                            {seg.endTime?.toFixed(1) || seg.end?.toFixed(1)}s
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

          {/* Analysis */}
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
              <b>
                {data?.analysis?.confidence
                  ? (data.analysis.confidence * 100).toFixed(0)
                  : 0}
                %
              </b>
            </p>

            <p>
              Processing Time: <b>{data?.analysis?.processingTime || 0}s</b>
            </p>

            {/* SCORE */}
            <div className="emotion_progress">
              <div
                className="emotion_progress_bar"
                style={{
                  width: `${(data?.analysis?.score || 0) * 100}%`,
                }}
              />
            </div>

            <p>Score: {((data?.analysis?.score || 0) * 100).toFixed(0)}%</p>

            {/* EMOTION BREAKDOWN */}
            <div className="emotion_breakdown">
              <h4>Emotion Details</h4>

              {Object.entries(data?.analysis?.emotionDetail || {})
                .sort((a, b) => b[1] - a[1])
                .map(([key, value]) => (
                  <div key={key} className="emotion_item">
                    <span className="emotion_label">
                      {getEmoji(key)} {key}
                    </span>

                    <div className="emotion_bar">
                      <div
                        className="emotion_fill"
                        style={{
                          width: `${value * 100}%`,
                        }}
                      />
                    </div>

                    <span className="emotion_percent">
                      {(value * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
          {/* 🔥 SPEAKER EMOTION */}
          {data?.speakerAnalysis && data.speakerAnalysis.length > 0 && (
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
                      Emotion: {getEmoji(sp.emotion)} <b>{sp.emotion}</b>
                    </p>

                    <p>
                      Sentiment: <b>{sp.sentiment}</b>
                    </p>

                    <p>
                      Voice Tone: <b>{sp.voiceTone}</b>
                    </p>

                    <p>
                      Confidence: <b>{(sp.confidence * 100).toFixed(0)}%</b>
                    </p>

                    {/* SCORE */}
                    <div className="emotion_progress">
                      <div
                        className="emotion_progress_bar"
                        style={{
                          width: `${(sp.score || 0) * 100}%`,
                        }}
                      />
                    </div>

                    <p>Score: {((sp.score || 0) * 100).toFixed(0)}%</p>
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
