import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = 'https://backend-chess-fjr7.onrender.com/api/missions';

const MissionsScreen = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
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
    <div style={{ padding: '1rem' }}>
      <h2>Nhiệm vụ</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {missions.map((mission) => (
        <div key={mission.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', borderRadius: '8px' }}>
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
            <p>Tiến độ: {mission.progress.current} / {mission.progress.required}</p>
          )}
          {mission.eligible && !mission.claimed && (
            <button onClick={() => claimReward(mission.id)}>Nhận thưởng</button>
          )}
        </div>
      ))}
    </div>
  );
};

export default MissionsScreen;
