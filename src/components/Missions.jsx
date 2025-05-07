import React, { useEffect, useState } from "react";
import "../styles/Missions.css";

function MissionsScreen() {
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    gamesWon: 0,
    totalMinutes: 0,
    totalCaptured: 0,
  });

  const [claimedRewards, setClaimedRewards] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD

  useEffect(() => {
    const storedStats = JSON.parse(localStorage.getItem("chessStats")) || {
      gamesPlayed: 0,
      gamesWon: 0,
      totalMinutes: 0,
      totalCaptured: 0,
    };
    setStats(storedStats);

    const lastLogin = localStorage.getItem("lastLoginDate");
    if (lastLogin !== today) {
      // Reset claimed rewards mỗi ngày
      localStorage.setItem("claimedRewards", JSON.stringify([]));
      localStorage.setItem("lastLoginDate", today);
      setClaimedRewards([]);
    } else {
      const claimed = JSON.parse(localStorage.getItem("claimedRewards")) || [];
      setClaimedRewards(claimed);
    }

    const storedPoints = JSON.parse(localStorage.getItem("totalPoints")) || 0;
    setTotalPoints(storedPoints);
  }, [today]);

  const handleClaimReward = (id, reward) => {
    if (claimedRewards.includes(id)) return;

    const updated = [...claimedRewards, id];
    setClaimedRewards(updated);
    localStorage.setItem("claimedRewards", JSON.stringify(updated));

    const newTotalPoints = totalPoints + parseInt(reward, 10);
    setTotalPoints(newTotalPoints);
    localStorage.setItem("totalPoints", JSON.stringify(newTotalPoints));

    alert("🎉 Bạn đã nhận phần thưởng!");
  };

  const missions = [
    {
      id: "dailyLogin",
      title: "📅 Đăng nhập mỗi ngày",
      condition: true,
      reward: "+5",
    },
    {
      id: "play5",
      title: "🎯 Chơi 5 trận",
      condition: stats.gamesPlayed >= 5,
      reward: "+10",
    },
    {
      id: "win3",
      title: "🏆 Thắng 3 trận",
      condition: stats.gamesWon >= 3,
      reward: "+20",
    },
    {
      id: "play60min",
      title: "⏱ Chơi 10 phút",
      condition: stats.totalMinutes >= 10,
      reward: "+30",
    },
    {
      id: "capture50",
      title: "♟️ Ăn 50 quân cờ",
      condition: stats.totalCaptured >= 10,
      reward: "+40",
    },
  ];

  return (
    <div className="missions-screen">
      <h1>🎖 Nhiệm vụ & Phần thưởng</h1>

      <div className="stats">
        <p>🧮 Trận đã chơi: {stats.gamesPlayed}</p>
        <p>🏆 Trận thắng: {stats.gamesWon}</p>
        <p>⏱ Tổng phút chơi: {stats.totalMinutes}</p>
        <p>♟️ Quân đã ăn: {stats.totalCaptured}</p>
        <p>🏅 Tổng điểm: {totalPoints}</p>
      </div>

      <div className="missions-list">
        {missions.map((mission) => {
          const isCompleted = mission.condition;
          const isClaimed = claimedRewards.includes(mission.id);

          return (
            <div
              key={mission.id}
              className={`mission ${isCompleted ? "completed" : ""}`}
            >
              <h3>{mission.title}</h3>
              <p>🎁 Phần thưởng: {mission.reward}</p>
              {isClaimed ? (
                <button disabled>✅ Đã nhận</button>
              ) : isCompleted ? (
                <button onClick={() => handleClaimReward(mission.id, mission.reward)}>
                  🎁 Nhận
                </button>
              ) : (
                <button disabled>🔒 Chưa đủ</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MissionsScreen;
