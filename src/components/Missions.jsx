import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Missions.css";
const Mission = () => {
  const [missions, setMissions] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const userid = user ? user.userid : null;  // Lấy userid từ localStorage

  useEffect(() => {
    if (!userid) {
      setError("User not found.");
      return;
    }

    // Lấy thông tin nhiệm vụ từ API
    const fetchMissions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://backend-chess-fjr7.onrender.com/api/missions/user/${userid}`);
        setMissions(response.data.missions);
        setTotalPoints(response.data.totalPoints);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch missions");
        setLoading(false);
      }
    };

    fetchMissions();
  }, [userid]);

  const handleClaimMission = async (missionId) => {
    if (!userid) return;

    try {
      const response = await axios.post("https://backend-chess-fjr7.onrender.com/api/missions/claim", {
        userid: userid,
        missionId: missionId,
      });

      alert(response.data.message);
      // Refresh missions after claim
      const fetchMissions = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`https://backend-chess-fjr7.onrender.com/api/missions/user/${userid}`);
          setMissions(response.data.missions);
          setTotalPoints(response.data.totalPoints);
          setLoading(false);
        } catch (err) {
          setError("Failed to fetch missions");
          setLoading(false);
        }
      };

      fetchMissions();
    } catch (err) {
      alert("Error claiming mission: " + err.response?.data?.error || err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="missions-screen">
      <h2>Your Missions</h2>
      <p>Total Points: {totalPoints}</p>
      <div className="missions-list">
        {missions.map((mission) => (
          <div
            key={mission.id}
            className={`mission-card ${mission.isClaimedToday || mission.isCompleted ? "claimed" : ""}`}
          >
            <h3>{mission.name}</h3>
            <p>{mission.description}</p>
            <p>{mission.isCompleted ? "Completed" : "Not completed"}</p>
            <p>{mission.isClaimedToday ? "Already claimed today" : "Not claimed yet"}</p>
            <button
              onClick={() => handleClaimMission(mission.id)}
              className="claim-button"
              disabled={mission.isClaimedToday || !mission.isCompleted}
            >
              Claim Reward
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Mission;
