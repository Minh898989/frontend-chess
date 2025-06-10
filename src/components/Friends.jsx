import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = 'https://backend-chess-va97.onrender.com';

const Friend = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [friends, setFriends] = useState([]);

  // Gọi dữ liệu lời mời & bạn bè khi load
  useEffect(() => {
    fetchPendingRequests();
    fetchFriends();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const res = await axios.get(`${API}/requests`);
      setPendingRequests(res.data);
    } catch (err) {
      console.error('Pending error:', err);
    }
  };

  const fetchFriends = async () => {
    try {
      const res = await axios.get(`${API}/friends`);
      setFriends(res.data);
    } catch (err) {
      console.error('Friends error:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) return;
    try {
      const res = await axios.get(`${API}/search?keyword=${searchKeyword}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error('Search error:', err);
    }
  };

  const handleSendRequest = async (receiverId) => {
    try {
      await axios.post(`${API}/request`, { receiverId });
      alert('Đã gửi lời mời!');
    } catch (err) {
      alert('Gửi thất bại hoặc đã có lời mời');
    }
  };

  const handleRespond = async (requestId, status) => {
    try {
      await axios.post(`${API}/respond`, { requestId, status });
      fetchPendingRequests();
      fetchFriends();
    } catch (err) {
      alert('Xử lý thất bại');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-center">💬 Quản lý bạn bè</h1>

      {/* Tìm bạn */}
      <div className="bg-white shadow-md rounded-xl p-4">
        <h2 className="font-semibold mb-2">🔍 Tìm bạn</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="flex-1 border rounded p-2"
            placeholder="Nhập tên người dùng..."
          />
          <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded">
            Tìm
          </button>
        </div>
        <ul className="mt-4 space-y-2">
          {searchResults.map((user) => (
            <li key={user.userid} className="flex justify-between items-center border-b pb-1">
              <span>{user.userid}</span>
              <button
                onClick={() => handleSendRequest(user.userid)}
                className="text-sm bg-green-500 text-white px-3 py-1 rounded"
              >
                Kết bạn
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Lời mời */}
      <div className="bg-white shadow-md rounded-xl p-4">
        <h2 className="font-semibold mb-2">📥 Lời mời kết bạn</h2>
        {pendingRequests.length === 0 ? (
          <p className="text-gray-500">Không có lời mời nào.</p>
        ) : (
          <ul className="space-y-2">
            {pendingRequests.map((r) => (
              <li key={r.id} className="flex justify-between items-center border-b pb-1">
                <span>{r.sender}</span>
                <div className="space-x-2">
                  <button
                    onClick={() => handleRespond(r.id, 'accepted')}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    Chấp nhận
                  </button>
                  <button
                    onClick={() => handleRespond(r.id, 'declined')}
                    className="bg-gray-400 text-white px-3 py-1 rounded"
                  >
                    Từ chối
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Bạn bè */}
      <div className="bg-white shadow-md rounded-xl p-4">
        <h2 className="font-semibold mb-2">👥 Bạn bè</h2>
        {friends.length === 0 ? (
          <p className="text-gray-500">Chưa có bạn nào.</p>
        ) : (
          <ul className="space-y-2">
            {friends.map((f) => (
              <li key={f.friend_id} className="flex justify-between border-b pb-1">
                <span>{f.friend_id}</span>
                <span className="text-sm text-gray-600">
                  {f.days_of_friendship} ngày làm bạn
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Friend;
