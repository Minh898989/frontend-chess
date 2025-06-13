import React, { useState, useEffect } from "react";
import axios from "axios";
import '../styles/Friends.css';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  }, [userid]);

  const fetchFriends = async () => {
    try {
      const res = await axios.get(`${API_BASE}/list/${userid}`);
      setFriends(res.data);
    } catch (err) {
      toast.error("Lỗi khi lấy danh sách bạn bè");
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE}/requests/${userid}`);
      setPendingRequests(res.data);
    } catch (err) {
      toast.error("Lỗi khi lấy lời mời");
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
      toast.error("Lỗi tìm người dùng");
    }
  };

  const sendRequest = async (receiver_id) => {
    try {
      await axios.post(`${API_BASE}/request`, {
        sender_id: userid,
        receiver_id,
      });
      toast.success("Đã gửi lời mời kết bạn!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Lỗi gửi lời mời");
    }
  };

  const respondRequest = async (sender_id, action) => {
    try {
      await axios.post(`${API_BASE}/respond`, {
        sender_id,
        receiver_id: userid,
        action,
      });
      toast.success(
        `Đã ${action === "accept" ? "chấp nhận" : "từ chối"} lời mời.`
      );
      fetchFriends();
      fetchPendingRequests();
    } catch (err) {
      toast.error(err.response?.data?.error || "Lỗi xử lý lời mời");
    }
  };

  return (
    <div className="friend-container">
      <h2 className="friend-title">📋 Quản lý bạn bè</h2>

      <div className="friend-wrapper">
        {/* Tìm kiếm người dùng */}
        <div className="friend-card">
          <h3>🔍 Tìm người dùng</h3>
          <input
            type="text"
            className="friend-input"
            placeholder="Nhập ID người dùng..."
            value={searchTerm}
            onChange={handleSearch}
          />
          {searchResults.map((user) => (
            <div key={user.userid} className="user-item">
              <img src={user.avatar} alt="avatar" className="avatar" />
              <div className="user-info">
                <span>{user.userid}</span>
              </div>
              <div className="friend-actions">
                <button
                  className="add-btn"
                  onClick={() => sendRequest(user.userid)}
                >
                  Kết bạn
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Lời mời kết bạn */}
        <div className="friend-card">
          <h3>📨 Lời mời kết bạn</h3>
          {pendingRequests.length === 0 ? (
            <p>Không có lời mời nào.</p>
          ) : (
            pendingRequests.map((req) => (
              <div key={req.userid} className="user-item">
                <img src={req.avatar} alt="avatar" className="avatar" />
                <span>{req.userid}</span>
                <div className="friend-actions">
                  <button
                    className="accept-btn"
                    onClick={() => respondRequest(req.userid, "accept")}
                  >
                    ✔
                  </button>
                  <button
                    className="decline-btn"
                    onClick={() => respondRequest(req.userid, "decline")}
                  >
                    ✖
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Danh sách bạn bè */}
        <div className="friend-card">
          <h3>👥 Danh sách bạn bè</h3>
          {friends.length === 0 ? (
            <p>Bạn chưa có bạn nào.</p>
          ) : (
            friends.map((friend) => (
              <div key={friend.userid} className="user-item">
                <img src={friend.avatar} alt="avatar" className="avatar" />
                <div className="user-info">
                  <span>{friend.userid}</span>
                  <small>Bạn bè được {friend.days_friends} ngày</small>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Toast container */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default Friend;
