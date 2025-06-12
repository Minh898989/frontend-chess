import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Friend = () => {
  const [searchInput, setSearchInput] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [friends, setFriends] = useState([]);

  const user = JSON.parse(localStorage.getItem('user'));
  const userid = user?.userid;
  const API_BASE = 'https://backend-chess-va97.onrender.com/api/friends';

  // Lấy danh sách bạn bè và lời mời đang chờ khi mở component
  useEffect(() => {
    if (userid) {
      fetchFriends();
      fetchPendingRequests();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userid]);

  const fetchFriends = async () => {
    try {
      const res = await axios.get(`${API_BASE}/friends/${userid}`);
      setFriends(res.data);
    } catch (err) {
      console.error('Error fetching friends:', err);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE}/requests/${userid}`);
      setPendingRequests(res.data);
    } catch (err) {
      console.error('Error fetching pending requests:', err);
    }
  };

  const handleSearch = async () => {
    try {
      const res = await axios.get(`${API_BASE}/search/${searchInput}`);
      setSearchResult(res.data);
    } catch (err) {
      setSearchResult(null);
      alert('User not found');
    }
  };

  const sendFriendRequest = async (to_user) => {
    try {
      const res = await axios.post(`${API_BASE}/request`, {
        from_user: userid,
        to_user
      });
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending request');
    }
  };

  const acceptFriend = async (from_user) => {
    try {
      await axios.post(`${API_BASE}/accept`, {
        from_user,
        to_user: userid
      });
      fetchFriends();
      fetchPendingRequests();
    } catch (err) {
      alert('Error accepting request');
    }
  };

  const rejectFriend = async (from_user) => {
    try {
      await axios.post(`${API_BASE}/reject`, {
        from_user,
        to_user: userid
      });
      fetchPendingRequests();
    } catch (err) {
      alert('Error rejecting request');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>👥 Friend System</h2>

      {/* 🔍 Search */}
      <div>
        <input
          type="text"
          placeholder="Enter user ID"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* ✅ Search Result */}
      {searchResult && (
        <div style={{ marginTop: '10px' }}>
          <p>Found: {searchResult.userid}</p>
          <img src={searchResult.avatar} alt="avatar" width="50" />
          <br />
          <button onClick={() => sendFriendRequest(searchResult.userid)}>Send Request</button>
        </div>
      )}

      {/* 📬 Pending Requests */}
      <div style={{ marginTop: '30px' }}>
        <h3>Pending Friend Requests</h3>
        {pendingRequests.length === 0 ? (
          <p>No pending requests</p>
        ) : (
          pendingRequests.map((req) => (
            <div key={req.from_user}>
              <p>{req.from_user}</p>
              <button onClick={() => acceptFriend(req.from_user)}>Accept</button>
              <button onClick={() => rejectFriend(req.from_user)}>Reject</button>
            </div>
          ))
        )}
      </div>

      {/* 👨‍👩‍👧 Friends List */}
      <div style={{ marginTop: '30px' }}>
        <h3>Your Friends</h3>
        {friends.length === 0 ? (
          <p>You have no friends yet</p>
        ) : (
          friends.map((friend) => (
            <div key={friend.friendid}>
              <p>{friend.friendid}</p>
              <img src={friend.avatar} alt="avatar" width="50" />
              <p>Friends since: {new Date(friend.friendship_date).toLocaleDateString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Friend;
