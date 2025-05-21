import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Friends.css";

const API_BASE = "https://backend-chess-fjr7.onrender.com/api";

function Friends() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [friends, setFriends] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Lấy danh sách bạn bè
  useEffect(() => {
    if (!user?.userid) return;

    axios
      .get(`${API_BASE}/friends/${user.userid}`)
      .then((res) => setFriends(res.data || []))
      .catch(() => setError("Không thể tải danh sách bạn bè."));
  }, [user]);

  // Tìm kiếm người dùng
  const handleSearch = async () => {
    setError("");
    setSuccess("");
    setSearchResult(null);

    if (!searchText.trim()) return;

    try {
      const res = await axios.post(`${API_BASE}/search`, {
        userid: searchText.trim(),
      });

      // Nếu tìm thấy chính mình
      if (res.data.userid === user.userid) {
        setError("Không thể thêm chính bạn.");
      } else {
        setSearchResult(res.data);
      }
    } catch (err) {
      setError("Không tìm thấy người dùng.");
    }
  };

  // Gửi lời mời kết bạn
  const handleAddFriend = async () => {
    if (!searchResult) return;

    try {
      await axios.post(`${API_BASE}/send-request`, {
        senderId: user.userid,
        receiverId: searchResult.userid,
      });
      setSuccess("Đã gửi lời mời kết bạn.");
      setSearchResult(null);
      setSearchText("");
    } catch (err) {
      setError("Không thể gửi lời mời kết bạn.");
    }
  };

  return (
    <div className="friends-page">
      <h2>👥 Danh sách bạn bè</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Nhập ID người dùng..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button onClick={handleSearch}>Tìm kiếm</button>
      </div>

      {searchResult && (
        <div className="search-results">
          <h3>Kết quả tìm kiếm:</h3>
          <p>{searchResult.userid}</p>
          <button onClick={handleAddFriend}>Thêm bạn</button>
        </div>
      )}

      <div className="friends-list">
        <h3>Danh sách bạn bè:</h3>
        {friends.length > 0 ? (
          <ul>
            {friends.map((friend) => (
              <li key={friend.userid}>
                {friend.userid} - {friend.days_friends} ngày làm bạn
              </li>
            ))}
          </ul>
        ) : (
          <p>Bạn chưa có bạn bè nào.</p>
        )}
      </div>
    </div>
  );
}

export default Friends;
