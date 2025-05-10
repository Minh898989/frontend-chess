import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Mission = ({ userid }) => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const res = await axios.get(`https://backend-chess-fjr7.onrender.com/missions/status/${userid}`);
      setMissions(res.data.missions); // Mỗi mission: { id, name, description, reward_points, is_claimable, is_claimed }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClaim = async (missionId) => {
    setLoading(true);
    try {
      await axios.post(`https://backend-chess-fjr7.onrender.com/missions/claim/${userid}`, { missionId });
      fetchMissions(); // cập nhật lại danh sách sau khi nhận
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi nhận nhiệm vụ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mission-container" style={{ padding: 20 }}>
      <h2>🎯 Danh sách nhiệm vụ</h2>
      {missions.map((m) => (
        <div key={m.id} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10, borderRadius: 8 }}>
          <h4>{m.name}</h4>
          <p>{m.description}</p>
          <p>🎁 Điểm thưởng: {m.reward_points}</p>
          {m.is_claimed ? (
            <button disabled style={{ backgroundColor: '#ccc' }}>✅ Đã nhận</button>
          ) : m.is_claimable ? (
            <button onClick={() => handleClaim(m.id)} disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Nhận thưởng'}
            </button>
          ) : (
            <button disabled style={{ backgroundColor: '#eee' }}>🚫 Chưa đủ điều kiện</button>
          )}
        </div>
      ))}
    </div>
  );
};

export default Mission;
