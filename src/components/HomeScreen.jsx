import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/HomeScreen.css";

const API_BASE = "https://backend-chess-fjr7.onrender.com/api/missions/user";

function HomeScreen() {
  const [showModes, setShowModes] = useState(false);
  const [showAIDifficulty, setShowAIDifficulty] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userStats, setUserStats] = useState(null);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const avatarKey = user ? `avatar_${user.userid}` : null;
  const [avatar, setAvatar] = useState(avatarKey ? localStorage.getItem(avatarKey) : null);

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

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file && avatarKey) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setAvatar(base64);
        localStorage.setItem(avatarKey, base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/auth");
  };

  const handleModeSelection = (selectedMode) => {
  navigate(`/game/${selectedMode}`, { replace: true });
};

  const goToQuests = () => navigate("/missions");
  const goToGuide = () => navigate("/guide");

  return (
    <div className="home">
      <div className="user-top-right">
        <label htmlFor="avatar-upload" style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
          {avatar ? (
            <img
              src={avatar}
              alt="avatar"
              className="user-avatar"
              style={{ width: 32, height: 32, borderRadius: "50%", marginRight: 8 }}
            />
          ) : (
            <span style={{ fontSize: 20, marginRight: 8 }}>👤</span>
          )}
          <span
            style={{ textDecoration: "underline" }}
            onClick={() => setShowProfileModal(true)}
          >
            {user?.userid || "Người dùng"}
          </span>
        </label>

        <input
          type="file"
          id="avatar-upload"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleAvatarChange}
        />

        <span style={{ marginLeft: 8 }}>|</span>
        <button style={{ marginLeft: 8 }} onClick={handleLogout}>Đăng xuất</button>
      </div>

      <h1>♟️ Game Cờ Vua</h1>

      {!showModes ? (
        <button onClick={() => setShowModes(true)}>Vào chơi</button>
      ) : showAIDifficulty ? (
        <div className="mode-selection">
          <h2>🤖 Chọn độ khó:</h2>
          <button onClick={() => handleModeSelection("easy")}>🟢 Dễ</button>
          <button onClick={() => handleModeSelection("medium")}>🟡 Trung bình</button>
          <button onClick={() => handleModeSelection("hard")}>🔴 Khó</button>
        </div>
      ) : (
        <div className="mode-selection">
          <h2>Chọn chế độ chơi:</h2>
          <button onClick={() => handleModeSelection("2players")}>👥 Chơi 2 người</button>
          <button onClick={() => setShowAIDifficulty(true)}>🤖 Chơi với máy</button>
        </div>
      )}

      {!showModes && (
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
