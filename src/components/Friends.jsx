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

    if (value.trim() === "") {
      setSearchResults([]);
      return;
    }

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
      alert(
        `Đã ${action === "accept" ? "chấp nhận" : "từ chối"} lời mời kết bạn.`
      );
      fetchFriends();
      fetchPendingRequests();
    } catch (err) {
      alert(err.response?.data?.error || "Lỗi xử lý lời mời");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Quản lý bạn bè</h2>

      {/* Tìm kiếm người dùng */}
      <div>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Tìm người dùng..."
        />
        {searchResults.length > 0 && (
          <ul>
            {searchResults.map((user) => (
              <li key={user.userid}>
                <img
                  src={user.avatar}
                  alt="avatar"
                  width="30"
                  height="30"
                  style={{ borderRadius: "50%" }}
                />
                { user.userid} ({user.userid})
                <button onClick={() => sendRequest(user.userid)}>Kết bạn</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <hr />

      {/* Danh sách bạn bè */}
      <div>
        <h3>Danh sách bạn bè</h3>
        {friends.length === 0 ? (
          <p>Chưa có bạn bè nào.</p>
        ) : (
          <ul>
            {friends.map((friend) => (
              <li key={friend.userid}>
                <img
                  src={friend.avatar}
                  alt="avatar"
                  width="30"
                  height="30"
                  style={{ borderRadius: "50%" }}
                />
                { friend.userid} ({friend.userid})
              </li>
            ))}
          </ul>
        )}
      </div>

      <hr />

      {/* Lời mời kết bạn */}
      <div>
        <h3>Lời mời kết bạn</h3>
        {pendingRequests.length === 0 ? (
          <p>Không có lời mời nào.</p>
        ) : (
          <ul>
            {pendingRequests.map((req) => (
              <li key={req.userid}>
                <img
                  src={req.avatar}
                  alt="avatar"
                  width="30"
                  height="30"
                  style={{ borderRadius: "50%" }}
                />
                { req.userid} ({req.userid})
                <button onClick={() => respondRequest(req.userid, "accept")}>
                  Chấp nhận
                </button>
                <button onClick={() => respondRequest(req.userid, "decline")}>
                  Từ chối
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Friend;
