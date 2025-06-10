import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Missions.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import confetti from "canvas-confetti";
import { ArrowLeftOutlined,CheckCircleTwoTone, CloseCircleTwoTone , GiftTwoTone, ClockCircleTwoTone } from "@ant-design/icons";

const Mission = () => {
  const [missions, setMissions] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const userid = user?.userid;

  useEffect(() => {
    if (!userid) {
      setError("Không tìm thấy người dùng.");
      setLoading(false);
      return;
    }

    const fetchMissions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `https://backend-chess-va97.onrender.com/api/missions/user/${userid}`
        );
        setMissions(response.data.missions);
        setTotalPoints(response.data.totalPoints);
      } catch (err) {
        setError("Không thể tải nhiệm vụ.");
      } finally {
        setLoading(false);
      }
    };

    fetchMissions();
  }, [userid]);

  const handleClaimMission = async (missionId) => {
    if (!userid) return;

    try {
      const response = await axios.post(
        "https://backend-chess-va97.onrender.com/api/missions/claim",
        {
          userid,
          missionId,
        }
      );

      toast.success(response.data.message);

      confetti({
        particleCount: 200,    
        spread: 100,         
        startVelocity: 45,      
        gravity: 0.8,           
        scalar: 1.2,            
        ticks: 200,         
        origin: { y: 0.6 },     
        colors: ['#00C9A7', '#FFD93D', '#FF6B6B', '#6A67CE', '#FFC75F'], 
      });


      // ✅ Cập nhật trạng thái của mission đã nhận
      setMissions((prevMissions) =>
        prevMissions.map((mission) =>
          mission.id === missionId
            ? { ...mission, isClaimedToday: true }
            : mission
        )
      );

      
      if (response.data.newTotalPoints !== undefined) {
        setTotalPoints(response.data.newTotalPoints);
      }

    } catch (err) {
      toast.error(
        "Lỗi khi nhận thưởng: " +
          (err.response?.data?.error || err.message)
      );
    }
  };

  if (loading) return <div className="status-message">Đang tải nhiệm vụ...</div>;
  if (error) return <div className="status-message error">{error}</div>;

  return (
    <div className="missions-screen">
      <button className="back-button" onClick={() => window.history.back()}>
         <ArrowLeftOutlined /> Back
      </button>

      <h2>Nhiệm vụ của bạn</h2>
      <p className="total-points">
        Tổng điểm: <strong>{totalPoints}</strong>
      </p>

      <div className="missions-list">
        {missions.map((mission) => (
          <div
            key={mission.id}
            className={`mission-card ${
              mission.isClaimedToday || mission.isCompleted ? "claimed" : ""
            }`}
          >
            <h3>{mission.name}</h3>
            <p>{mission.description}</p>
            <p>Điểm thưởng: {mission.reward_points}</p>
            <p>
              Trạng thái:{" "}
              <span
                className={
                  mission.isCompleted
                    ? "status-completed"
                    : "status-incomplete"
                }
              >
                {mission.isCompleted ? (
  <>
    <CheckCircleTwoTone twoToneColor="#52c41a" /> Hoàn thành
  </>
) : (
  <>
    <CloseCircleTwoTone twoToneColor="#ff4d4f" /> Chưa hoàn thành
  </>
)}
              </span>
            </p>
            <p>
              Nhận thưởng:{" "}
              <span
                className={
                  mission.isClaimedToday
                    ? "status-claimed"
                    : "status-unclaimed"
                }
              >
                {mission.isClaimedToday ? (
  <>
    <GiftTwoTone twoToneColor="#faad14" /> Đã nhận
  </>
) : (
  <>
    <ClockCircleTwoTone twoToneColor="#1890ff" /> Chưa nhận
  </>
)}
              </span>
            </p>
            <button
              onClick={() => handleClaimMission(mission.id)}
              className="claim-button"
              disabled={mission.isClaimedToday || !mission.isCompleted}
            >
              Nhận thưởng
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Mission;
