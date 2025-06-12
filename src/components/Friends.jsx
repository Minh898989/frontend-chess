import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = 'https://backend-chess-va97.onrender.com/api/friends';

const Friends = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const userid = user?.userid;

  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    if (!userid) return;
    fetchFriends();
    fetchPendingRequests();
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
      console.error('Error fetching requests:', err);
    }
  };

  const handleSearch = async () => {
    try {
      const res = await axios.get(`${API_BASE}/search/${searchId}`);
      setSearchResult(res.data);
    } catch (err) {
      setSearchResult(null);
      alert('User not found');
    }
  };

  const sendFriendRequest = async () => {
    try {
      await axios.post(`${API_BASE}/request`, {
        from_user: userid,
        to_user: searchResult.userid,
      });
      alert('Friend request sent!');
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending request');
    }
  };

  const acceptRequest = async (from_user) => {
    try {
      await axios.post(`${API_BASE}/accept`, { from_user, to_user: userid });
      fetchFriends();
      fetchPendingRequests();
    } catch (err) {
      alert('Error accepting request');
    }
  };

  const rejectRequest = async (from_user) => {
    try {
      await axios.post(`${API_BASE}/reject`, { from_user, to_user: userid });
      fetchPendingRequests();
    } catch (err) {
      alert('Error rejecting request');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Friends Page</h2>

      <div>
        <h3>Search User</h3>
        <input
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          placeholder="Enter userid"
        />
        <button onClick={handleSearch}>Search</button>

        {searchResult && (
          <div>
            <p>Found: {searchResult.userid}</p>
            <img src={searchResult.avatar} alt="avatar" width={50} />
            <button onClick={sendFriendRequest}>Send Friend Request</button>
          </div>
        )}
      </div>

      <hr />

      <div>
        <h3>Your Friends</h3>
        {friends.map((f) => (
          <div key={f.friendid}>
            <p>{f.friendid}</p>
            <img src={f.avatar} alt="avatar" width={40} />
          </div>
        ))}
      </div>

      <hr />

      <div>
        <h3>Pending Friend Requests</h3>
        {pendingRequests.map((req) => (
          <div key={req.from_user}>
            <p>{req.from_user}</p>
            <button onClick={() => acceptRequest(req.from_user)}>Accept</button>
            <button onClick={() => rejectRequest(req.from_user)}>Reject</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Friends;
