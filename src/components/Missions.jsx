import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Missions.css"; // Đảm bảo file CSS tồn tại

// 💡 Mảng nhiệm vụ đặt ngoài component để tránh cảnh báo React
const missionConditions = [
  {
    id: 1,
    name: "🎯 Chơi 5 ván",
    description: "Chơi ít nhất 5 ván cờ",
    condition: (s) => s.games_played >= 5,
    rewardPoints: 10,
  },
  {
    id: 2,
    name: "🏆 Thắng 3 ván",
    description: "Thắng ít nhất 3 ván cờ",
    condition: (s) => s.games_won >= 3,
    rewardPoints: 20,
  },
  {
    id: 3,
    name: "⏱ Chơi 10 phút",
    description: "Chơi ít nhất 10 phút tổng cộng",
    condition: (s) => s.total_minutes >= 10,
    rewardPoints: 15,
  },
  {
    id: 4,
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

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.userid;

  useEffect(() => {
    if (!userId) return;

    axios
      .get(`https://backend-chess-fjr7.onrender.com/api/stats/${userId}`)
      .then((res) => {
        const userStats = res.data;
        setStats(userStats);

        const updatedMissions = missionConditions.map((m) => ({
          ...m,
          completed: m.condition(userStats),
          claimed: false,
        }));

        setMissions(updatedMissions);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy thống kê:", err);
      });
  }, [userId]);

  const claimReward = (missionId) => {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === missionId && m.completed && !m.claimed) {
          setMessage(`🎉 Bạn nhận được ${m.rewardPoints} điểm từ "${m.name}"!`);
          setTotalPoints((prevPoints) => prevPoints + m.rewardPoints);
          return { ...m, claimed: true };
        }
        return m;
      })
    );
  };

  return (
    <div className="missions-screen">
      <h1>🎯 Nhiệm Vụ & Phần Thưởng</h1>

      {stats ? (
        <div className="stats">
          <p>🎮 Ván đã chơi: {stats.games_played}</p>
          <p>🏆 Ván thắng: {stats.games_won}</p>
          <p>⏱ Thời gian chơi: {stats.total_minutes} phút</p>
          <p>🗡 Quân đã ăn: {stats.total_captured}</p>
        </div>
      ) : (
        <p>Đang tải thống kê...</p>
      )}

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

      {message && <div className="message">{message}</div>}

      <div className="points">
        🌟 Tổng điểm thưởng đã nhận: <strong>{totalPoints}</strong>
      </div>
    </div>
  );
}

export default QuestsScreen;
