import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "https://backend-chess-va97.onrender.com/api/friends";

const Friend = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));
  const userid = user?.userid;

  useEffect(() => {
    if (userid) {
      fetchFriends();
      fetchPendingRequests();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userid]);

  const fetchFriends = async () => {
    try {
      const res = await axios.get(`${API_BASE}/list/${userid}`);
      setFriends(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách bạn bè", err);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE}/requests/${userid}`);
      setPendingRequests(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy lời mời", err);
    }
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.trim() === "") return setSearchResults([]);

    try {
      const res = await axios.get(`${API_BASE}/search`, {
        params: { userid: value },
      });
      const filtered = res.data.filter((u) => u.userid !== userid);
      setSearchResults(filtered);
    } catch (err) {
      console.error("Lỗi tìm người dùng", err);
    }
  };

  const sendRequest = async (receiver_id) => {
    try {
      await axios.post(`${API_BASE}/request`, {
        sender_id: userid,
        receiver_id,
      });
      alert("Đã gửi lời mời kết bạn!");
    } catch (err) {
      alert(err.response?.data?.error || "Lỗi gửi lời mời");
    }
  };

  const respondRequest = async (sender_id, action) => {
    try {
      await axios.post(`${API_BASE}/respond`, {
        sender_id,
        receiver_id: userid,
        action,
      });
      alert(`Đã ${action === "accept" ? "chấp nhận" : "từ chối"} lời mời.`);
      fetchFriends();
      fetchPendingRequests();
    } catch (err) {
      alert(err.response?.data?.error || "Lỗi xử lý lời mời");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold text-center">📋 Quản lý bạn bè</h2>

      {/* Tìm kiếm */}
      <div className="bg-white p-4 rounded-xl shadow space-y-4">
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="🔍 Tìm người dùng..."
          value={searchTerm}
          onChange={handleSearch}
        />
        {searchResults.length > 0 && (
          <ul className="space-y-2">
            {searchResults.map((user) => (
              <li
                key={user.userid}
                className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="font-medium">{user.userid}</span>
                </div>
                <button
                  onClick={() => sendRequest(user.userid)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Kết bạn
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Danh sách bạn bè */}
      <div className="bg-white p-4 rounded-xl shadow space-y-3">
        <h3 className="text-lg font-semibold">👥 Bạn bè</h3>
        {friends.length === 0 ? (
          <p className="text-gray-500">Chưa có bạn bè nào.</p>
        ) : (
          <ul className="space-y-2">
            {friends.map((friend) => (
              <li
                key={friend.userid}
                className="flex items-center justify-between border p-2 rounded"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={friend.avatar}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-medium">{friend.userid}</div>
                    <div className="text-sm text-gray-500">
                      Bạn bè được {friend.days_friends} ngày
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Lời mời kết bạn */}
      <div className="bg-white p-4 rounded-xl shadow space-y-3">
        <h3 className="text-lg font-semibold">📨 Lời mời kết bạn</h3>
        {pendingRequests.length === 0 ? (
          <p className="text-gray-500">Không có lời mời nào.</p>
        ) : (
          <ul className="space-y-2">
            {pendingRequests.map((req) => (
              <li
                key={req.userid}
                className="flex items-center justify-between border p-2 rounded"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={req.avatar}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="font-medium">{req.userid}</span>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => respondRequest(req.userid, "accept")}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    Chấp nhận
                  </button>
                  <button
                    onClick={() => respondRequest(req.userid, "decline")}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Từ chối
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Friend;
