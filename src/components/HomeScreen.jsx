import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/HomeScreen.css";

const API_BASE = "https://backend-chess-fjr7.onrender.com/api";

function HomeScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || null);

  // Profile modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [errorStats, setErrorStats] = useState("");

  // Leaderboard modal states
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [errorLeaderboard, setErrorLeaderboard] = useState("");

  const searchParams = new URLSearchParams(location.search);
  const mode = searchParams.get("mode");

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/auth");
  };

  const handleModeSelection = (selectedMode) => {
    navigate(`/game/${selectedMode}`);
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file && user?.userid) {
      const formData = new FormData();
      formData.append("avatar", file);

      axios
        .post(`${API_BASE}/users/upload-avatar/${user.userid}`, formData)
        .then((res) => {
          const uploadedUrl = res.data.avatar;
          setAvatarUrl(uploadedUrl);
          localStorage.setItem("user", JSON.stringify({ ...user, avatar: uploadedUrl }));
        })
        .catch((err) => console.error("Lỗi upload avatar:", err));
    }
  };

  const goToQuests = () => navigate("/missions");
  const goToGuide = () => navigate("/guide");
  const goToPlay = () => navigate("?mode=select");
  const goToAIDifficulty = () => navigate("?mode=ai");
  const resetMode = () => navigate("/");

  const openProfileModal = () => {
    setShowProfileModal(true);
    setLoadingStats(true);
    setErrorStats("");
    axios
      .get(`${API_BASE}/missions/user/${user.userid}`)
      .then((res) => {
        setUserStats({
          totalPoints: res.data.totalPoints || 0,
          level: res.data.level || 1,
        });
        setLoadingStats(false);
      })
      .catch((err) => {
        setErrorStats("Không thể tải thông tin người dùng.");
        setLoadingStats(false);
      });
  };

  const openLeaderboardModal = () => {
    setShowLeaderboardModal(true);
    setLoadingLeaderboard(true);
    setErrorLeaderboard("");
    axios
      .get(`${API_BASE}/leaderboard`)
      .then((res) => {
        setLeaderboard(res.data || []);
        setLoadingLeaderboard(false);
      })
      .catch((err) => {
        setErrorLeaderboard("Không thể tải bảng xếp hạng.");
        setLoadingLeaderboard(false);
      });
  };

  return (
    <div className="home">
      {/* Top-right user bar */}
      <div className="user-top-right" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <label style={{ cursor: "pointer" }}>
          <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="avatar"
              style={{ width: "32px", height: "32px", borderRadius: "50%" }}
              onClick={(e) => {
                e.stopPropagation();
                e.target.previousSibling.click();
              }}
            />
          ) : (
            <span role="img" aria-label="user" onClick={(e) => {
              e.stopPropagation();
              e.target.previousSibling.click();
            }}>👤</span>
          )}
        </label>

        <span onClick={openProfileModal} style={{ cursor: "pointer", fontWeight: "bold" }}>
          {user?.userid || "Người dùng"}
        </span>

        | <button onClick={handleLogout}>Đăng xuất</button>
      </div>

      <h1>♟️ Game Cờ Vua</h1>

      {/* Mode selection */}
      {!mode && <button onClick={goToPlay}>Vào chơi</button>}

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

      {/* Extra buttons */}
      {!mode && (
        <>
          <div className="extra-buttons">
            <button onClick={goToQuests}>📝 Nhiệm vụ & phần thưởng</button>
          </div>
          <div className="extra-buttons">
            <button onClick={goToGuide}>📖 Hướng dẫn chơi</button>
          </div>
          <div className="extra-buttons">
            <button onClick={openLeaderboardModal}>🏆 Bảng xếp hạng</button>
          </div>
        </>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Thông tin người chơi</h2>
            {avatarUrl && (
              <img
                src={avatarUrl}
                alt="avatar"
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  objectFit: "cover"
                }}
              />
            )}
            <p><strong>ID:</strong> {user?.userid}</p>
            {loadingStats ? (
              <p>Đang tải thông tin...</p>
            ) : errorStats ? (
              <p style={{ color: "red" }}>{errorStats}</p>
            ) : (
              <>
                <p><strong>Tổng điểm:</strong> {userStats?.totalPoints}</p>
                <p><strong>Cấp độ:</strong> Level {userStats?.level}</p>
              </>
            )}
            <button onClick={() => setShowProfileModal(false)}>Đóng</button>
          </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      {showLeaderboardModal && (
        <div className="modal-overlay" onClick={() => setShowLeaderboardModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>🏆 Bảng xếp hạng</h2>
            {loadingLeaderboard ? (
              <p>Đang tải dữ liệu...</p>
            ) : errorLeaderboard ? (
              <p style={{ color: "red" }}>{errorLeaderboard}</p>
            ) : leaderboard.length > 0 ? (
              <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th>Hạng</th>
                    <th>Người chơi</th>
                    <th>Điểm</th>
                    <th>Cấp độ</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((user, index) => (
                    <tr key={user.userid}>
                      <td>{index + 1}</td>
                      <td>{user.username || user.userid}</td>
                      <td>{user.totalPoints}</td>
                      <td>{user.level}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Không có dữ liệu.</p>
            )}
            <button onClick={() => setShowLeaderboardModal(false)}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomeScreen;
