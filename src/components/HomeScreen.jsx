import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/HomeScreen.css";

const API_BASE = "https://backend-chess-fjr7.onrender.com/api/missions/user";

function HomeScreen() {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const mode = searchParams.get("mode"); 

  const user = JSON.parse(localStorage.getItem("user"));
  
  useEffect(() => {
    if (showProfileModal && user?.userid) {
      axios.get(`${API_BASE}/${user.userid}`)
        .then((res) => {
          setUserStats({
            totalPoints: res.data.totalPoints || 0,
            level: res.data.level || 1,
          });
        })
        .catch((err) => {
          console.error("Lỗi khi tải dữ liệu người dùng:", err);
        });
    }
  }, [showProfileModal, user?.userid]);
  useEffect(() => {
  if (user?.avatar) {
    const savedUrl = `https://backend-chess-fjr7.onrender.com${user.avatar}`;
    setAvatarUrl(savedUrl);
  }
}, [user.avatar]);


  
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/auth");
  };

  const handleModeSelection = (selectedMode) => {
    navigate(`/game/${selectedMode}`, { replace: false });
  };

  const goToQuests = () => navigate("/missions");
  const goToGuide = () => navigate("/guide");
  const goToPlay = () => navigate("?mode=select");
  const goToAIDifficulty = () => navigate("?mode=ai");
  const resetMode = () => navigate("/");
  const handleAvatarChange = (event) => {
  const file = event.target.files[0];
  if (file && user?.userid) {
    const formData = new FormData();
    formData.append("avatar", file);

    axios
      .post(`https://backend-chess-fjr7.onrender.com/api/users/upload-avatar/${user.userid}`, formData)
      .then((res) => {
        const uploadedUrl = `https://backend-chess-fjr7.onrender.com${res.data.avatar}`;
        setAvatarUrl(uploadedUrl);

        // Cập nhật localStorage nếu cần
        const updatedUser = { ...user, avatar: res.data.avatar };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      })
      .catch((err) => console.error("Lỗi upload avatar:", err));
  }
};

  return (
    <div className="home">
      <div className="user-top-right">
        <label style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="avatar"
              style={{ width: "32px", height: "32px", borderRadius: "50%" }}
            />
          ) : (
            <span role="img" aria-label="user">👤</span>
          )}
          {user?.userid || "Người dùng"}
        </label>{" "}
        | <button onClick={handleLogout}>Đăng xuất</button>
      </div>

      <h1>♟️ Game Cờ Vua</h1>

      
      {!mode && (
        <button onClick={goToPlay}>Vào chơi</button>
      )}

      {mode === "select" && (
        <div className="mode-selection">
          <h2>Chọn chế độ chơi:</h2>
          <button onClick={() => handleModeSelection("2players")}>👥 Chơi 2 người</button>
          <button onClick={goToAIDifficulty}>🤖 Chơi với máy</button>
          <button onClick={resetMode}>⬅️ Quay lại</button>
        </div>
      )}

      {mode === "ai" && (
        <div className="mode-selection">
          <h2>🤖 Chọn độ khó:</h2>
          <button onClick={() => handleModeSelection("easy")}>🟢 Dễ</button>
          <button onClick={() => handleModeSelection("medium")}>🟡 Trung bình</button>
          <button onClick={() => handleModeSelection("hard")}>🔴 Khó</button>
          <button onClick={goToPlay}>⬅️ Quay lại</button>
        </div>
      )}

      {!mode && (
        <>
          <div className="extra-buttons">
            <button onClick={goToQuests}>📝 Nhiệm vụ & phần thưởng</button>
          </div>
          <div className="extra-buttons">
            <button onClick={goToGuide}>📖 Hướng dẫn chơi</button>
          </div>
        </>
      )}

      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Thông tin người chơi</h2>
            {avatarUrl && (
              <img src={avatarUrl} alt="avatar" style={{ width: "80px", borderRadius: "50%" }} />
            )}
            <p><strong>ID:</strong> {user?.userid}</p>
            <p><strong>Tổng điểm:</strong> {userStats?.totalPoints ?? "Đang tải..."}</p>
            <p><strong>Cấp độ:</strong> Level {userStats?.level ?? "..."}</p>
            <button onClick={() => setShowProfileModal(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomeScreen;
