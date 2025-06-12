import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'https://backend-chess-va97.onrender.com/api/friends';

const Friend = ({ currentUser }) => {
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');

  // Lấy danh sách bạn bè
  const fetchFriends = async () => {
    try {
      const res = await axios.get(`${API}/friends/${currentUser}`);
      setFriends(res.data);
    } catch (err) {
      console.error('Lỗi khi tải danh sách bạn bè:', err);
    }
  };

  // Lấy danh sách lời mời kết bạn đến (chưa có API, nên ta cần bạn tạo thêm ở backend nếu cần)
  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API}/requests/${currentUser}`);
      setRequests(res.data);
    } catch (err) {
      console.warn('Không thể lấy lời mời đang chờ (có thể chưa có API)');
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchRequests();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // Tìm người dùng
  const handleSearch = async () => {
    try {
      const res = await axios.get(`${API}/search/${searchId}`);
      setSearchResult(res.data);
      setMessage('');
    } catch (err) {
      setSearchResult(null);
      setMessage('Không tìm thấy người dùng.');
    }
  };

  // Gửi lời mời kết bạn
  const handleSendRequest = async () => {
    try {
      await axios.post(`${API}/request`, {
        from_user: currentUser,
        to_user: searchResult.userid,
      });
      setMessage('Đã gửi lời mời kết bạn!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Lỗi khi gửi lời mời.');
    }
  };

  // Chấp nhận lời mời
  const handleAccept = async (from_user) => {
    try {
      await axios.post(`${API}/accept`, {
        from_user,
        to_user: currentUser,
      });
      setMessage('Đã chấp nhận lời mời.');
      fetchFriends();
      fetchRequests();
    } catch (err) {
      setMessage('Lỗi khi chấp nhận lời mời.');
    }
  };

  // Từ chối lời mời
  const handleReject = async (from_user) => {
    try {
      await axios.post(`${API}/reject`, {
        from_user,
        to_user: currentUser,
      });
      setMessage('Đã từ chối lời mời.');
      fetchRequests();
    } catch (err) {
      setMessage('Lỗi khi từ chối lời mời.');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Quản lý bạn bè</h2>

      {/* Tìm kiếm */}
      <div>
        <input
          type="text"
          placeholder="Nhập userid cần tìm"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
        <button onClick={handleSearch}>Tìm</button>
      </div>

      {/* Kết quả tìm kiếm */}
      {searchResult && (
        <div style={{ marginTop: 10 }}>
          <p><b>{searchResult.userid}</b></p>
          <img
            src={searchResult.avatar}
            alt="avatar"
            style={{ width: 60, height: 60, borderRadius: '50%' }}
          />
          <div>
            <button onClick={handleSendRequest}>Gửi lời mời kết bạn</button>
          </div>
        </div>
      )}

      {/* Thông báo */}
      {message && <p>{message}</p>}

      {/* Lời mời kết bạn đến */}
      {requests.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>Lời mời kết bạn</h3>
          {requests.map((r) => (
            <div key={r.from_user} style={{ marginBottom: 10 }}>
              <b>{r.from_user}</b> muốn kết bạn.
              <div>
                <button onClick={() => handleAccept(r.from_user)}>Chấp nhận</button>
                <button onClick={() => handleReject(r.from_user)} style={{ marginLeft: 10 }}>Từ chối</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Danh sách bạn bè */}
      <div style={{ marginTop: 30 }}>
        <h3>Danh sách bạn bè</h3>
        {friends.length === 0 ? (
          <p>Chưa có bạn nào.</p>
        ) : (
          <ul>
            {friends.map((f) => (
              <li key={f.friendid}>
                <img
                  src={f.avatar}
                  alt="avatar"
                  style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 10 }}
                />
                {f.friendid} - Là bạn từ {new Date(f.friendship_date).toLocaleDateString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Friend;
