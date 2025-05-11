import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/Missions.css';

const API_BASE = 'https://backend-chess-fjr7.onrender.com/api/missions';

const MissionsScreen = () => {
  const [missions, setMissions] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState('');
  const [claiming, setClaiming] = useState({});

  // Lấy userId từ localStorage
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.userid) {
      setUserId(user.userid);
    } else {
      setMessage('Không tìm thấy người dùng.');
      setLoading(false);
    }
  }, []);

  // Gọi API lấy nhiệm vụ khi có userId
  useEffect(() => {
    if (userId) fetchMissions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchMissions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/${userId}`);
      setMissions(res.data.missions || []);
      setTotalPoints(res.data.totalPoints || 0);
      setLevel(res.data.level || 1);
    } catch (err) {
      setMessage('Lỗi khi tải nhiệm vụ.');
    } finally {
      setLoading(false);
    }
  };

  const claimReward = async (missionId) => {
  if (claiming[missionId]) return;

  setClaiming(prev => ({ ...prev, [missionId]: true }));
  setMessage('');

  try {
    const res = await axios.post(`${API_BASE}/claim`, {
      userid: userId,
      missionId,
    });

    setMessage(res.data.message || 'Nhận thưởng thành công!');

    // ✅ Kiểm tra dữ liệu trả về và cập nhật nhiệm vụ đã nhận
    const updatedMission = res.data.updatedMission; // Nhiệm vụ đã được cập nhật
    setMissions(prevMissions =>
      prevMissions.map(m =>
        m.id === updatedMission.id ? { ...m, claimed: true } : m
      )
    );

    // Gọi lại fetchMissions để đồng bộ thêm
    await fetchMissions();

  } catch (err) {
    const msg = err.response?.data?.message || 'Lỗi khi nhận thưởng.';
    setMessage(msg);
  } finally {
    setClaiming(prev => ({ ...prev, [missionId]: false }));
  }
};



  if (loading) return <p>Đang tải dữ liệu nhiệm vụ...</p>;

  return (
    <div className="missions-screen">
      <h2>Nhiệm vụ hằng ngày</h2>
      <p>🌟 Tổng điểm: <strong>{totalPoints}</strong></p>
      <p>📈 Cấp độ hiện tại: <strong>Level {level}</strong></p>

      {message && <div className="message-box">{message}</div>}

      <div className="missions-list">
        {missions.map((m) => (
          <div key={m.id} className={`mission-card ${m.claimed ? 'claimed' : ''}`}>
            <h3>{m.name}</h3>
            <p>{m.description}</p>
            <p>🎁 Thưởng: {m.reward_points} điểm</p>
            <p>
              Trạng thái:{' '}
              {m.claimed
                ? '✅ Đã nhận thưởng'
                : m.eligible
                ? '🟢 Hoàn thành - Chưa nhận'
                : '🔒 Chưa hoàn thành'}
            </p>
            <button
              disabled={!m.eligible || m.claimed || claiming[m.id]}
              onClick={() => claimReward(m.id)}
              className="claim-button"
            >
              {m.claimed
                ? 'Đã nhận'
                : claiming[m.id]
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
