import React, { useState } from 'react';
import axios from 'axios';

const Mission = ({ userid }) => {
  const [claimedMissions, setClaimedMissions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleClaimMissions = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`http://localhost:3000/missions/claim/${userid}`);
      setClaimedMissions(response.data.claimed);
    } catch (error) {
      console.error('Error claiming missions:', error);
      alert('Lỗi khi nhận nhiệm vụ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mission-container" style={{ padding: 20 }}>
      <h2>Nhiệm vụ hằng ngày</h2>
      <button onClick={handleClaimMissions} disabled={loading}>
        {loading ? 'Đang xử lý...' : 'Nhận nhiệm vụ'}
      </button>

      {claimedMissions.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>🎉 Đã nhận nhiệm vụ:</h3>
          <ul>
            {claimedMissions.map((m, index) => (
              <li key={index}>✅ Nhiệm vụ #{m.missionId} - Thưởng: {m.reward} điểm</li>
            ))}
          </ul>
        </div>
      )}

      {claimedMissions.length === 0 && !loading && (
        <p style={{ marginTop: 20 }}>Bạn chưa đủ điều kiện nhận nhiệm vụ nào.</p>
      )}
    </div>
  );
};

export default Mission;
