import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Missions.css';

const API_BASE = 'https://backend-chess-fjr7.onrender.com/api/missions';

const MissionsScreen = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState(null);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.userid) {
      setUserId(user.userid);
    }
  }, []);

  useEffect(() => {
    if (!userId) return; // Don't fetch missions if userId is not set

    const fetchMissions = async () => {
      try {
        const res = await axios.get(`${API_BASE}/${userId}`);
        setMissions(res.data);
        setTotalPoints(res.data.totalPoints);
      } catch (error) {
        console.error('Lỗi khi tải nhiệm vụ:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMissions();
  }, [userId]);

  const claimReward = async (missionId) => {
    try {
      const res = await axios.post(`${API_BASE}/claim`, {
        userid: userId,
        missionId,
      });
      setMessage(res.data.message);

      // Refresh mission list
      const refreshed = await axios.get(`${API_BASE}/${userId}`);
      setMissions(refreshed.data);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Lỗi không xác định khi nhận thưởng');
    }
  };

  if (loading) return <p>Đang tải danh sách nhiệm vụ...</p>;

  return (
    <div className="missions-screen">
      <h1>Nhiệm vụ</h1>
      <p>Tổng điểm tích lũy: <strong>{totalPoints}</strong></p>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      <div className="missions-list">
        {missions.map((mission) => (
          <div
            key={mission.id}
            className={`mission ${mission.claimed ? 'completed' : ''}`}
          >
            <h3>{mission.name}</h3>
            <p>{mission.description}</p>
            <p>Thưởng: {mission.reward_points} điểm</p>
            <p>
              Trạng thái:{' '}
              {mission.claimed
                ? '✅ Đã nhận thưởng'
                : mission.eligible
                ? '🎯 Hoàn thành - Chưa nhận thưởng'
                : '🔄 Chưa hoàn thành'}
            </p>
            {mission.progress !== undefined && (
              <p>
                Tiến độ: {mission.progress.current} / {mission.progress.required}
              </p>
            )}
            {mission.eligible && !mission.claimed && (
              <button onClick={() => claimReward(mission.id)}>Nhận thưởng</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MissionsScreen;
