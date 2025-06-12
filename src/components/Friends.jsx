import React, { useEffect, useState } from "react";
import axios from "axios";

const API = axios.create({
  baseURL: "https://backend-chess-va97.onrender.com/api/friends",
  withCredentials: true,
});

const FriendsPage = () => {
  const { userid } = JSON.parse(localStorage.getItem("user"));
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      setLoading(true);
      const res = await API.get(`/search?userid=${searchQuery}`);
      setSearchResults(res.data);
    } catch (err) {
      alert("Lỗi tìm kiếm");
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (receiver_id) => {
    try {
      await API.post("/request", { sender_id: userid, receiver_id });
      alert("Đã gửi lời mời kết bạn");
    } catch (err) {
      alert(err.response?.data?.error || "Lỗi gửi lời mời");
    }
  };

  const handleRespond = async (sender_id, action) => {
    try {
      await API.post("/respond", { sender_id, receiver_id: userid, action });
      alert(`Đã ${action === "accept" ? "chấp nhận" : "từ chối"} lời mời`);
      fetchRequests();
      fetchFriends();
    } catch (err) {
      alert("Lỗi khi phản hồi lời mời");
    }
  };

  const fetchFriends = async () => {
    try {
      const res = await API.get(`/list/${userid}`);
      setFriends(res.data);
    } catch (err) {
      alert("Lỗi tải danh sách bạn bè");
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        `https://backend-chess-va97.onrender.com/requests/${userid}`,
        { withCredentials: true }
      );
      setRequests(res.data);
    } catch (err) {
      console.error(err);
      alert("Lỗi tải lời mời kết bạn");
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchRequests();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "700px", margin: "auto" }}>
      <h2>Kết bạn</h2>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Tìm kiếm userid..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: "8px", width: "70%" }}
        />
        <button onClick={handleSearch} style={{ padding: "8px 12px", marginLeft: "8px" }}>
          {loading ? "Đang tìm..." : "Tìm"}
        </button>
      </div>

      <div>
        <h4>Kết quả tìm kiếm:</h4>
        <ul>
          {searchResults.length === 0 && <li>Không có kết quả</li>}
          {searchResults.map((user) => (
            <li key={user.userid} style={{ marginBottom: "10px" }}>
              <img
                src={user.avatar}
                alt=""
                width="30"
                height="30"
                style={{ borderRadius: "50%", marginRight: "10px" }}
              />
              {user.name} ({user.userid})
              {user.userid !== userid && (
                <button
                  onClick={() => handleSendRequest(user.userid)}
                  style={{ marginLeft: "10px" }}
                >
                  Kết bạn
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <hr />

      <div>
        <h4>🧾 Lời mời kết bạn đến bạn:</h4>
        <ul>
          {requests.length === 0 && <li>Không có lời mời</li>}
          {requests.map((r) => (
            <li key={r.userid} style={{ marginBottom: "10px" }}>
              <img
                src={r.avatar}
                alt=""
                width="30"
                height="30"
                style={{ borderRadius: "50%", marginRight: "10px" }}
              />
              {r.name} ({r.userid})
              <button
                onClick={() => handleRespond(r.userid, "accept")}
                style={{ marginLeft: "10px" }}
              >
                ✔️ Chấp nhận
              </button>
              <button
                onClick={() => handleRespond(r.userid, "decline")}
                style={{ marginLeft: "5px" }}
              >
                ❌ Từ chối
              </button>
            </li>
          ))}
        </ul>
      </div>

      <hr />

      <div>
        <h4>👥 Danh sách bạn bè:</h4>
        <ul>
          {friends.length === 0 && <li>Chưa có bạn bè</li>}
          {friends.map((f) => (
            <li key={f.userid} style={{ marginBottom: "10px" }}>
              <img
                src={f.avatar}
                alt=""
                width="30"
                height="30"
                style={{ borderRadius: "50%", marginRight: "10px" }}
              />
              {f.name} ({f.userid})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FriendsPage;
