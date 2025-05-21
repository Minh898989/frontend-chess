// src/pages/Friends.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Friends.css";

const API_BASE = "https://backend-chess-fjr7.onrender.com/api";

function Friends() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [friends, setFriends] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState("");

  // Lấy danh sách bạn bè
  useEffect(() => {
    if (!user?.userid) return;

    axios
      .post(`${API_BASE}/friends/${user.userid}`)
      .then((res) => setFriends(res.data.friends || []))
      .catch((err) => setError("Không thể tải danh sách bạn bè."));
  }, [user]);

  const handleSearch = () => {
    if (!searchText.trim()) return;
    setError("");
    axios
      .get(`${API_BASE}/users/search/${searchText}`)
      .then((res) => {
        setSearchResults(res.data.results || []);
      })
      .catch(() => {
        setError("Không tìm thấy người dùng.");
        setSearchResults([]);
      });
  };

  const handleAddFriend = (friendId) => {
    axios
      .post(`${API_BASE}/friends/add`, {
        userId: user.userid,
        friendId,
      })
      .then(() => {
        setFriends([...friends, { userid: friendId }]);
        setSearchResults([]);
        setSearchText("");
      })
      .catch(() => setError("Không thể thêm bạn."));
  };

  return (
    <div className="friends-page">
      <h2>👥 Danh sách bạn bè</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Nhập ID người dùng..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button onClick={handleSearch}>Tìm kiếm</button>
      </div>

      {searchResults.length > 0 && (
        <div className="search-results">
          <h3>Kết quả tìm kiếm:</h3>
          <ul>
            {searchResults.map((result) => (
              <li key={result.userid}>
                {result.userid}{" "}
                <button onClick={() => handleAddFriend(result.userid)}>Thêm bạn</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="friends-list">
        <ul>
          {friends.length > 0 ? (
            friends.map((friend) => <li key={friend.userid}>{friend.userid}</li>)
          ) : (
            <p>Chưa có bạn bè nào.</p>
          )}
        </ul>
      </div>
    </div>
  );
}

export default Friends;
