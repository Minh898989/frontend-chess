import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Missions.css';

const API_BASE = 'https://backend-chess-fjr7.onrender.com/api/missions';

const MissionsScreen = () => {
  const [missions, setMissions] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);
  const [message, setMessage] = useState('');
  const [userId, setUserId] = useState(null);

  // Lấy userId từ localStorage khi component mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.userid) {
      setUserId(user.userid);
    } else {
      setMessage('Không tìm thấy người dùng.');
      setLoading(false);
    }
  }, []);

  // Gọi API để lấy nhiệm vụ
  const fetchMissions = async () => {
    try {
      const res = await axios.get(`${API_BASE}/${userId}`);
      setMissions(Array.isArray(res.data.missions) ? res.data.missions : []);
      setTotalPoints(res.data.totalPoints || 0);
      setLevel(res.data.level || 1);
    } catch (error) {
      console.error('Lỗi khi tải nhiệm vụ:', error);
      setMessage('Lỗi khi tải nhiệm vụ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchMissions();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Xử lý nhận thưởng
  const claimReward = async (missionId) => {
    if (claimingId !== null) return; // Ngăn spam click
    setClaimingId(missionId);
    setMessage('');
    try {
      const res = await axios.post(`${API_BASE}/claim`, {
        userid: userId,
        missionId,
      });
      setMessage(res.data.message || 'Đã nhận thưởng thành công');
      await fetchMissions(); // Cập nhật lại danh sách nhiệm vụ
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Lỗi khi nhận thưởng.';
      setMessage(errMsg);
    } finally {
      setClaimingId(null);
    }
  };

  if (loading) return <p>Đang tải dữ liệu nhiệm vụ...</p>;

  return (
    <div className="missions-screen">
      <h2>Nhiệm vụ hằng ngày</h2>
      <p>🌟 Tổng điểm: <strong>{totalPoints}</strong></p>
      <p>📈 Cấp độ hiện tại: <strong>Level {level}</strong></p>

      {message && (
        <div className="message-box">
          {message}
        </div>
      )}

      <div className="missions-list">
        {missions.map((mission) => (
          <div
            key={mission.id}
            className={`mission-card ${mission.claimed ? 'claimed' : ''}`}
          >
            <h3>{mission.name}</h3>
            <p>{mission.description}</p>
            <p>🎁 Thưởng: {mission.reward_points} điểm</p>
            <p>
              Trạng thái:{' '}
              {mission.claimed
                ? '✅ Đã nhận thưởng'
                : mission.eligible
                ? '🟢 Hoàn thành - Chưa nhận'
                : '🔒 Chưa hoàn thành'}
            </p>
            <button
              disabled={
                !mission.eligible ||
                mission.claimed ||
                claimingId !== null
              }
              onClick={() => claimReward(mission.id)}
              className="claim-button"
            >
              {mission.claimed
                ? 'Đã nhận'
                : claimingId === mission.id
                ? 'Đang xử lý...'
                : 'Nhận thưởng'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MissionsScreen;
