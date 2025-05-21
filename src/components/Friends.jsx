import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Friends.css";

const API_BASE = "https://backend-chess-fjr7.onrender.com/api";

function Friends() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
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

  // Lấy danh sách lời mời kết bạn
  useEffect(() => {
    if (!user?.userid) return;
    axios
      .get(`${API_BASE}/requests/${user.userid}`)
      .then((res) => setRequests(res.data || []))
      .catch(() => setError("Không thể tải lời mời kết bạn."));
  }, [user]);

  // Tìm kiếm người dùng theo ID
  const handleSearch = async () => {
    setError("");
    setSuccess("");
    setSearchResult(null);

    if (!searchText.trim()) return;

    try {
      const res = await axios.post(`${API_BASE}/search`, {
        userid: searchText.trim(),
      });

      if (res.data.userid === user.userid) {
        setError("Không thể thêm chính bạn.");
      } else {
        setSearchResult(res.data);
      }
    } catch {
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
    } catch {
      setError("Không thể gửi lời mời kết bạn.");
    }
  };

  // Chấp nhận hoặc từ chối lời mời
  const handleRespond = async (requestId, action) => {
    try {
      await axios.post(`${API_BASE}/respond`, { requestId, action });

      setRequests((prev) => prev.filter((r) => r.id !== requestId));

      if (action === "accept") {
        const res = await axios.get(`${API_BASE}/friends/${user.userid}`);
        setFriends(res.data || []);
      }

      setSuccess(`Đã ${action === "accept" ? "chấp nhận" : "từ chối"} lời mời.`);
    } catch {
      setError("Không thể xử lý lời mời.");
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

      <div className="friend-requests">
        <h3>Lời mời kết bạn:</h3>
        {requests.length > 0 ? (
          <ul>
            {requests.map((req) => (
              <li key={req.id}>
                {req.from_user} gửi lời mời lúc{" "}
                {new Date(req.created_at).toLocaleString()}
                <div style={{ marginTop: "5px" }}>
                  <button onClick={() => handleRespond(req.id, "accept")}>
                    ✅ Chấp nhận
                  </button>
                  <button
                    onClick={() => handleRespond(req.id, "reject")}
                    style={{ marginLeft: "8px" }}
                  >
                    ❌ Từ chối
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>Không có lời mời nào.</p>
        )}
      </div>
    </div>
  );
}

export default Friends;
