import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "https://backend-chess-va97.onrender.com/api/friends";

const Friend = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const userid = user?.userid;

  useEffect(() => {
    if (userid) {
      fetchFriends();
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

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setSearchResults([]);
      return;
    }

    try {
      const res = await axios.get(`${API_BASE}/search`, {
        params: { userid: value }
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
        receiver_id
      });
      alert("Đã gửi lời mời kết bạn!");
    } catch (err) {
      alert(err.response?.data?.error || "Lỗi gửi lời mời");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Quản lý bạn bè</h2>

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
                <img src={user.avatar} alt="avatar" width="30" height="30" />
                {user.name} ({user.userid})
                <button onClick={() => sendRequest(user.userid)}>Kết bạn</button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <hr />

      <div>
        <h3>Danh sách bạn bè</h3>
        {friends.length === 0 ? (
          <p>Chưa có bạn bè nào.</p>
        ) : (
          <ul>
            {friends.map((friend) => (
              <li key={friend.userid}>
                <img src={friend.avatar} alt="avatar" width="30" height="30" />
                {friend.name} ({friend.userid})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Friend;
