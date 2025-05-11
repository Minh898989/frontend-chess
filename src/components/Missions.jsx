import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../styles/Missions.css';

const API_BASE = 'https://backend-chess-fjr7.onrender.com/api/missions';

const MissionsScreen = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const prevLevelRef = useRef(1); // Để so sánh khi lên cấp

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.userid) {
      setUserId(user.userid);
    }
  }, []);

  const calculateLevel = (points) => {
    const levelThresholds = [0, 25, 250, 500, 1000, 2000, 4000];
    for (let i = levelThresholds.length - 1; i >= 0; i--) {
      if (points >= levelThresholds[i]) {
        return i + 1;
      }
    }
    return 1;
  };

  const fetchMissions = async () => {
    try {
      const res = await axios.get(`${API_BASE}/${userId}`);
      const newTotalPoints = res.data.totalPoints || 0;
      const newLevel = calculateLevel(newTotalPoints);

      // Kiểm tra nếu lên cấp
      if (newLevel > prevLevelRef.current) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3000);
      }

      prevLevelRef.current = newLevel;
      setLevel(newLevel);
      setTotalPoints(newTotalPoints);
      setMissions(Array.isArray(res.data.missions) ? res.data.missions : []);
    } catch (error) {
      console.error('Lỗi khi tải nhiệm vụ:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchMissions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const claimReward = async (missionId) => {
    try {
      const res = await axios.post(`${API_BASE}/claim`, {
        userid: userId,
        missionId,
      });
      setMessage(res.data.message);
      await fetchMissions();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Lỗi không xác định khi nhận thưởng');
    }
  };

  if (loading) return <p>Đang tải danh sách nhiệm vụ...</p>;

  return (
    <div className="missions-screen">
      {showLevelUp && (
        <div className="level-up-popup">
          🎉 Lên cấp {level}!
        </div>
      )}
      <h1>Nhiệm vụ</h1>
      <p>Tổng điểm tích lũy: <strong>{totalPoints}</strong></p>
      <p>Cấp độ hiện tại: <strong>Level {level}</strong></p>
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
