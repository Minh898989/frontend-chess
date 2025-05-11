import React, { useEffect, useState } from "react";
import axios from "axios";

const Mission = ({ userid }) => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMissions = async () => {
    try {
      const res = await axios.get(`/missions/status/${userid}`);
      setMissions(res.data);
    } catch (err) {
      console.error("Error fetching missions:", err);
    }
  };

  const claimReward = async (missionId) => {
    try {
      setLoading(true);
      await axios.post("/missions/claim", {
        userid,
        mission_id: missionId,
      });
      await fetchMissions(); // Refresh state after claiming
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi nhận thưởng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userid]);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Nhiệm vụ hôm nay</h1>
      <div className="space-y-4">
        {missions.map((mission) => (
          <div
            key={mission.id}
            className="p-4 rounded-xl shadow border bg-white flex justify-between items-center"
          >
            <div>
              <h2 className="font-semibold">{mission.name}</h2>
              <p className="text-gray-600 text-sm">{mission.description}</p>
              <p className="text-sm mt-1">
                🎁 Điểm thưởng:{" "}
                <span className="font-medium">{mission.reward_points}</span>
              </p>
            </div>
            <div>
              {mission.isClaimed ? (
                <span className="text-green-600 font-medium">Đã nhận</span>
              ) : mission.isCompleted ? (
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  onClick={() => claimReward(mission.id)}
                  disabled={loading}
                >
                  Nhận thưởng
                </button>
              ) : (
                <span className="text-gray-400 italic">Chưa hoàn thành</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Mission;
