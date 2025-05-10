import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Missions.css";

const missionConditions = [
  {
    id: 1,
    name: "📅 Đăng nhập mỗi ngày",
    description: "Đăng nhập hôm nay để nhận thưởng",
    condition: () => true,
    rewardPoints: 5,
    daily: true,
  },
  {
    id: 2,
    name: "🎯 Chơi 5 ván",
    description: "Chơi ít nhất 5 ván cờ",
    condition: (s) => s.games_played >= 5,
    rewardPoints: 10,
  },
  {
    id: 3,
    name: "🏆 Thắng 3 ván",
    description: "Thắng ít nhất 3 ván cờ",
    condition: (s) => s.games_won >= 3,
    rewardPoints: 20,
  },
  {
    id: 4,
    name: "⏱ Chơi 10 phút",
    description: "Chơi ít nhất 10 phút tổng cộng",
    condition: (s) => s.total_minutes >= 10,
    rewardPoints: 15,
  },
  {
    id: 5,
    name: "🗡 Ăn 10 quân",
    description: "Ăn ít nhất 10 quân trong các ván đấu",
    condition: (s) => s.total_captured >= 10,
    rewardPoints: 25,
  },
];

function QuestsScreen() {
  const [stats, setStats] = useState(null);
  const [missions, setMissions] = useState([]);
  const [message, setMessage] = useState("");
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true); // Thêm trạng thái loading

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.userid;

  const today = new Date().toISOString().split("T")[0];
  const lastClaimDate = localStorage.getItem("lastClaimDate");

  useEffect(() => {
    if (!userId) return;

    // Bắt đầu tải dữ liệu
    setLoading(true);

    // Lấy thông tin thống kê người dùng
    axios
      .get(`https://backend-chess-fjr7.onrender.com/api/stats/${userId}`)
      .then((res) => {
        const userStats = res.data;
        setStats(userStats);

        const resetClaims = lastClaimDate !== today;

        const updatedMissions = missionConditions.map((m) => ({
          ...m,
          completed: m.condition(userStats),
          claimed: resetClaims
            ? false
            : JSON.parse(localStorage.getItem(`mission_${m.id}_claimed`) || "false"),
        }));

        setMissions(updatedMissions);

        if (resetClaims) {
          missionConditions.forEach((m) => {
            localStorage.setItem(`mission_${m.id}_claimed`, "false");
          });
          localStorage.setItem("lastClaimDate", today);
        }

        // Kết thúc tải dữ liệu
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy thống kê:", err);
        setLoading(false); // Kết thúc tải dù có lỗi
      });

    // Lấy tổng điểm từ backend
    axios
      .get(`https://backend-chess-fjr7.onrender.com/api/rewards/${userId}`)
      .then((res) => {
        setTotalPoints(res.data.points || 0);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy điểm:", err);
      });
  }, [userId, today, lastClaimDate]);

  const claimReward = async (missionId) => {
    const mission = missions.find((m) => m.id === missionId);
    if (!mission || !mission.completed || mission.claimed) return;

    try {
      // Gửi điểm về backend
      await axios.post(`https://backend-chess-fjr7.onrender.com/api/rewards/${userId}/add`, {
        points: mission.rewardPoints,
      });

      setMessage(`🎉 Bạn nhận được ${mission.rewardPoints} điểm từ "${mission.name}"!`);
      setTotalPoints((prev) => prev + mission.rewardPoints);
      localStorage.setItem(`mission_${mission.id}_claimed`, "true");

      // Cập nhật trạng thái mission
      setMissions((prev) =>
        prev.map((m) =>
          m.id === missionId ? { ...m, claimed: true } : m
        )
      );
    } catch (err) {
      console.error("Lỗi khi gửi điểm:", err.response ? err.response.data : err.message);
      setMessage("❌ Có lỗi khi nhận thưởng. Vui lòng thử lại.");
    }
  };

  return (
    <div className="missions-screen">
      <h1>🎯 Nhiệm Vụ & Phần Thưởng</h1>

      {loading ? (
        <p>Đang tải thống kê...</p> // Thông báo khi đang tải
      ) : (
        <>
          <div className="stats">
            <p>🎮 Ván đã chơi: {stats?.games_played || 0}</p>
            <p>🏆 Ván thắng: {stats?.games_won || 0}</p>
            <p>⏱ Thời gian chơi: {stats?.total_minutes || 0} phút</p>
            <p>🗡 Quân đã ăn: {stats?.total_captured || 0}</p>
            <div className="points">
              🌟 Tổng điểm thưởng đã nhận: <strong>{totalPoints}</strong>
            </div>
          </div>

          <div className="missions-list">
            {missions.map((mission) => (
              <div
                key={mission.id}
                className={`mission ${mission.claimed ? "completed" : ""}`}
              >
                <h3>{mission.name}</h3>
                <p>{mission.description}</p>
                <p>🎁 Thưởng: {mission.rewardPoints} điểm</p>
                <button
                  disabled={!mission.completed || mission.claimed}
                  onClick={() => claimReward(mission.id)}
                >
                  {mission.claimed
                    ? "✅ Đã nhận"
                    : mission.completed
                    ? "🎁 Nhận thưởng"
                    : "⏳ Chưa hoàn thành"}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {message && <div className="message">{message}</div>}
    </div>
  );
}

export default QuestsScreen;
