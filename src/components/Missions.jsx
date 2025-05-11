import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Missions = () => {
  const [missions, setMissions] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);

  // Lấy userid từ localStorage
  const userid = JSON.parse(localStorage.getItem('user'))?.userid;

  useEffect(() => {
    if (userid) {
      fetchMissions();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userid]);

  const fetchMissions = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/missions/user/${userid}`);
      const missionList = res.data.missions || [];
      setMissions(missionList);
      setTotalPoints(res.data.totalPoints || 0);
    } catch (err) {
      console.error('Lỗi khi tải nhiệm vụ:', err);
      setMissions([]);
      setTotalPoints(0);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (missionId) => {
    try {
      setClaimingId(missionId);
      const res = await axios.post('/api/missions/claim', { userid, missionId });
      alert(res.data.message || 'Nhận thưởng thành công!');
      await fetchMissions();
    } catch (err) {
      alert(err.response?.data?.error || 'Lỗi nhận thưởng');
    } finally {
      setClaimingId(null);
    }
  };

  if (!userid) return <p>❗ Không tìm thấy thông tin người dùng.</p>;
  if (loading) return <p>⏳ Đang tải nhiệm vụ...</p>;

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>📋 Nhiệm vụ hôm nay</h2>
      <p><strong>🏆 Tổng điểm:</strong> {totalPoints}</p>

      {missions.length === 0 ? (
        <p>Không có nhiệm vụ nào.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {missions.map((m) => (
            <li key={m.id} style={{
              marginBottom: '15px',
              padding: '15px',
              border: '1px solid #ccc',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }}>
              <h4>{m.name}</h4>
              <p>{m.description}</p>
              <p>🎁 Thưởng: <strong>{m.reward_points}</strong> điểm</p>
              <p>📌 Trạng thái: {m.isCompleted ? '✅ Đã hoàn thành' : '❌ Chưa xong'}</p>
              <p>📆 Đã nhận hôm nay: {m.isClaimedToday ? '🟢 Rồi' : '⚪ Chưa'}</p>

              {m.isCompleted && !m.isClaimedToday && (
                <button
                  onClick={() => handleClaim(m.id)}
                  disabled={claimingId === m.id}
                  style={{
                    marginTop: '10px',
                    padding: '8px 14px',
                    backgroundColor: '#28a745',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  {claimingId === m.id ? 'Đang nhận...' : '🎉 Nhận thưởng'}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Missions;
