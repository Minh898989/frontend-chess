import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/HomeScreen.css";

const API_BASE = "https://backend-chess-fjr7.onrender.com/api";

function HomeScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || null);
  const [userStats, setUserStats] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  const searchParams = new URLSearchParams(location.search);
  const mode = searchParams.get("mode");

  useEffect(() => {
    if (showProfileModal && user?.userid) {
      axios
        .get(`${API_BASE}/missions/user/${user.userid}`)
        .then((res) =>
          setUserStats({
            totalPoints: res.data.totalPoints || 0,
            level: res.data.level || 1,
          })
        )
        .catch((err) => console.error("Lỗi khi tải dữ liệu người dùng:", err));
    }
  }, [showProfileModal, user?.userid]);

  useEffect(() => {
    if (showLeaderboardModal) {
      axios
        .get(`${API_BASE}/leaderboard`)
        .then((res) => {
  console.log("Leaderboard data:", res.data);
  setLeaderboard(res.data.data || []);
})
        .catch((err) =>
          console.error("Lỗi khi tải bảng xếp hạng:", err)
        );
    }
  }, [showLeaderboardModal]);

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

  // Điều hướng phụ
  const goToQuests = () => navigate("/missions");
  const goToGuide = () => navigate("/guide");
  const goToPlay = () => navigate("?mode=select");
  const goToAIDifficulty = () => navigate("?mode=ai");
  const resetMode = () => navigate("/");

  return (
    <div className="home">
      {/* Thanh người dùng góc trên */}
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

        <span onClick={() => setShowProfileModal(true)} style={{ cursor: "pointer", fontWeight: "bold" }}>
          {user?.userid || "Người dùng"}
        </span>

        | <button onClick={handleLogout}>Đăng xuất</button>
      </div>

      {/* Nút leaderboard */}
      <div onClick={() => setShowLeaderboardModal(true)} style={{ cursor: "pointer", fontSize: "24px" }}>
        🏆
      </div>

      <h1>♟️ Game Cờ Vua</h1>

      {/* Hiển thị lựa chọn chế độ */}
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

      {/* Nút bổ sung */}
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

      {/* Modal thông tin người dùng */}
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
            <p><strong>Tổng điểm:</strong> {userStats?.totalPoints ?? "Đang tải..."}</p>
            <p><strong>Cấp độ:</strong> Level {userStats?.level ?? "..."}</p>
            <button onClick={() => setShowProfileModal(false)}>Đóng</button>
          </div>
        </div>
      )}

      {/* Modal bảng xếp hạng */}
      {showLeaderboardModal && (
        <div className="modal-overlay" onClick={() => setShowLeaderboardModal(false)}>
          <div className="modal-content leaderboard-modal" onClick={(e) => e.stopPropagation()}>
            <h2>🏆 Bảng xếp hạng</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#444", color: "white" }}>
                  <th>Hạng</th>
                  <th>Người chơi</th>
                  <th>Điểm</th>
                  <th>Level</th>
                  <th>Avatar</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((user, index) => (
                  <tr key={user.id}>
                    <td>{index + 1}</td>
                    <td>{user.userid}</td>
                    <td>{user.total_points}</td>
                    <td>{user.level}</td>
                    <td>
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt="avatar"
                          style={{ width: "32px", height: "32px", borderRadius: "50%" }}
                        />
                      ) : "👤"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={() => setShowLeaderboardModal(false)} style={{ marginTop: "12px" }}>
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomeScreen;
