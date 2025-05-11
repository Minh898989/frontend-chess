import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Missions = ({ userid }) => {
  const [missions, setMissions] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);

  useEffect(() => {
    fetchMissions();
  }, [userid]);

  const fetchMissions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/missions/user/${userid}`);
      setMissions(res.data.missions);
      setTotalPoints(res.data.totalPoints);
    } catch (err) {
      console.error('Lỗi tải nhiệm vụ:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (missionId) => {
    try {
      setClaimingId(missionId);
      const res = await axios.post('/api/missions/claim', { userid, missionId });
      alert(res.data.message || 'Nhận thưởng thành công!');
      await fetchMissions(); // cập nhật lại sau khi claim
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi nhận thưởng');
    } finally {
      setClaimingId(null);
    }
  };

  if (loading) return <p>Đang tải nhiệm vụ...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Nhiệm vụ hôm nay</h2>
      <p><strong>Tổng điểm:</strong> {totalPoints}</p>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {missions.map((m) => (
          <li key={m.id} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h4>{m.name}</h4>
            <p>{m.description}</p>
            <p>🎁 Thưởng: {m.reward_points} điểm</p>
            <p>📌 Trạng thái: {m.isCompleted ? '✅ Hoàn thành' : '❌ Chưa xong'}</p>
            <p>📆 Đã nhận hôm nay: {m.isClaimedToday ? '🟢 Rồi' : '⚪ Chưa'}</p>

            {m.isCompleted && !m.isClaimedToday && (
              <button
                onClick={() => handleClaim(m.id)}
                disabled={claimingId === m.id}
                style={{ marginTop: '10px', padding: '8px 12px', cursor: 'pointer' }}
              >
                {claimingId === m.id ? 'Đang nhận...' : 'Nhận thưởng'}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Missions;
