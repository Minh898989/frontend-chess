import React, { useState, useEffect } from 'react';

const Mission = () => {
  const [missions, setMissions] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Lấy thông tin người dùng từ localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const userid = user ? user.userid : null;

  useEffect(() => {
    if (!userid) {
      setError('User not found');
      setLoading(false);
      return;
    }

    // Gọi API để lấy các nhiệm vụ và tổng điểm người chơi
    const fetchMissions = async () => {
      try {
        const response = await fetch(`https://backend-chess-fjr7.onrender.com/missions/user/${userid}`);
        const data = await response.json();
        
        if (response.ok) {
          setMissions(data.missions);
          setTotalPoints(data.totalPoints);
        } else {
          setError(data.error || 'Something went wrong');
        }
      } catch (err) {
        setError('Failed to fetch missions');
      } finally {
        setLoading(false);
      }
    };

    fetchMissions();
  }, [userid]);

  const claimMission = async (missionId) => {
    try {
      const response = await fetch('https://backend-chess-fjr7.onrender.com/missions/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userid: userid,
          missionId: missionId,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Mission claimed successfully!');
        // Refresh mission data to reflect changes
        setLoading(true);
      } else {
        alert(data.error || 'Failed to claim mission');
      }
    } catch (err) {
      alert('Error claiming mission');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Your Missions</h1>
      <p>Total Points: {totalPoints}</p>
      <ul>
        {missions.map((mission) => (
          <li key={mission.id}>
            <h3>{mission.name}</h3>
            <p>{mission.description}</p>
            <p>Status: {mission.isCompleted ? 'Completed' : 'Not Completed'}</p>
            {mission.isClaimedToday ? (
              <p>You have already claimed this mission today.</p>
            ) : (
              <button onClick={() => claimMission(mission.id)} disabled={mission.isCompleted === false}>
                Claim Reward
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Mission;
