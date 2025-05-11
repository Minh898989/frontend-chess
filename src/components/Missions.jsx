// Missions.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Missions = ({ userid }) => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchMissions = async () => {
      try {
        const res = await axios.get(`/missions/status/${userid}`);
        if (Array.isArray(res.data)) {
          setMissions(res.data);
        } else {
          console.warn("API didn't return an array", res.data);
          setMissions([]);
        }
      } catch (err) {
        console.error('Failed to fetch missions', err);
        setMissions([]);
      } finally {
        setLoading(false);
      }
    };

    if (userid) {
      fetchMissions();
    }
  }, [userid]);

  const handleClaim = async (missionId) => {
    try {
      const res = await axios.post('/missions/claim', {
        userid,
        missionId,
      });
      setMessage(res.data.message);

      // Refresh missions after claim
      const updated = await axios.get(`/missions/status/${userid}`);
      setMissions(updated.data);
    } catch (err) {
      console.error('Error claiming reward:', err);
      setMessage('Lỗi khi nhận thưởng.');
    }
  };

  if (loading) return <p>Đang tải nhiệm vụ...</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Nhiệm vụ hôm nay</h2>

      {message && (
        <div className="mb-4 text-green-600 font-medium">{message}</div>
      )}

      {missions.length === 0 ? (
        <p>Không có nhiệm vụ khả dụng.</p>
      ) : (
        <ul className="space-y-3">
          {missions.map((m) => (
            <li key={m.id} className="p-4 border rounded-xl flex justify-between items-center shadow-sm">
              <div>
                <p className="font-semibold">{m.name}</p>
                <p className="text-sm text-gray-600">{m.description}</p>
                <p className="text-sm mt-1">Điểm thưởng: <strong>{m.reward_points}</strong></p>
              </div>
              <div>
                {m.completed ? (
                  <button
                    className="bg-green-500 text-white px-3 py-1 rounded-lg cursor-not-allowed"
                    disabled
                  >
                    Đã nhận
                  </button>
                ) : (
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
                    onClick={() => handleClaim(m.id)}
                  >
                    Nhận thưởng
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Missions;