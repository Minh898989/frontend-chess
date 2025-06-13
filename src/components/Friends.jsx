import React, { useState, useEffect } from "react";
import axios from "axios";
import '../styles/Friends.css';
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
    <div className="friend-container">
      <h2 className="friend-title">📋 Quản lý bạn bè</h2>

      <div className="friend-grid">
        {/* Tìm kiếm */}
        <div className="friend-card">
          <h3>🔍 Tìm người dùng</h3>
          <input
            type="text"
            className="friend-input"
            placeholder="Nhập ID người dùng..."
            value={searchTerm}
            onChange={handleSearch}
          />
          {searchResults.length > 0 &&
            searchResults.map((user) => (
              <div key={user.userid} className="search-result">
                <div className="flex items-center">
                  <img src={user.avatar} alt="avatar" className="search-avatar" />
                  <span>{user.userid}</span>
                </div>
                <button
                  onClick={() => sendRequest(user.userid)}
                  className="friend-actions add-btn"
                >
                  Kết bạn
                </button>
              </div>
            ))}
        </div>

        {/* Bạn bè */}
        <div className="friend-card">
          <h3>👥 Bạn bè</h3>
          {friends.length === 0 ? (
            <p>Chưa có bạn bè nào.</p>
          ) : (
            friends.map((friend) => (
              <div key={friend.userid} className="friend-item">
                <div className="flex items-center">
                  <img src={friend.avatar} alt="avatar" className="friend-avatar" />
                  <div className="friend-info">
                    <span>{friend.userid}</span>
                    <small>Bạn bè được {friend.days_friends} ngày</small>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Lời mời kết bạn */}
        <div className="friend-card">
          <h3>📨 Lời mời kết bạn</h3>
          {pendingRequests.length === 0 ? (
            <p>Không có lời mời nào.</p>
          ) : (
            pendingRequests.map((req) => (
              <div key={req.userid} className="request-item">
                <div className="flex items-center">
                  <img src={req.avatar} alt="avatar" className="request-avatar" />
                  <span>{req.userid}</span>
                </div>
                <div className="friend-actions">
                  <button
                    onClick={() => respondRequest(req.userid, "accept")}
                    className="accept-btn"
                  >
                    ✔
                  </button>
                  <button
                    onClick={() => respondRequest(req.userid, "decline")}
                    className="decline-btn"
                  >
                    ✖
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Friend;
