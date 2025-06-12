import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = 'https://backend-chess-va97.onrender.com/api/friends';

const Friend = () => {
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [search, setSearch] = useState('');
  const { userid } = JSON.parse(localStorage.getItem('user')) || {};

  useEffect(() => {
    if (userid) {
      fetchPendingRequests();
      fetchFriends();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userid]);

  const fetchPendingRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE}/requests/${userid}`);
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFriends = async () => {
    try {
      const res = await axios.get(`${API_BASE}/list/${userid}`);
      setFriends(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async () => {
    try {
      const res = await axios.get(`${API_BASE}/search/${search}`);
      if (res.data.userid !== userid) {
        setUsers([res.data]);
      } else {
        setUsers([]);
        alert("Can't add yourself");
      }
    } catch (err) {
      alert('User not found');
      setUsers([]);
    }
  };

  const sendFriendRequest = async (to_user) => {
    if (!userid || !to_user || userid === to_user) {
      alert("Invalid request");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/request`, {
        from_user: userid,
        to_user
      });
      alert(res.data.message);
    } catch (err) {
      const msg = err.response?.data?.message || 'Error sending request';
      alert(msg);
      console.error(err);
    }
  };

  const acceptRequest = async (from_user) => {
    try {
      const res = await axios.post(`${API_BASE}/accept`, {
        from_user,
        to_user: userid
      });
      alert(res.data.message);
      fetchPendingRequests();
      fetchFriends();
    } catch (err) {
      console.error(err);
    }
  };

  const rejectRequest = async (from_user) => {
    try {
      const res = await axios.post(`${API_BASE}/reject`, {
        from_user,
        to_user: userid
      });
      alert(res.data.message);
      fetchPendingRequests();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Friend System</h2>
      <input
        placeholder="Enter user ID"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>

      <h3>Search Result</h3>
      {users.map((user) => (
        <div key={user.userid}>
          {user.userid} - {user.username}
          <button onClick={() => sendFriendRequest(user.userid)}>Add Friend</button>
        </div>
      ))}

      <h3>Pending Requests</h3>
      {requests.map((req) => (
        <div key={req.from_user}>
          {req.from_user}
          <button onClick={() => acceptRequest(req.from_user)}>Accept</button>
          <button onClick={() => rejectRequest(req.from_user)}>Reject</button>
        </div>
      ))}

      <h3>Friends</h3>
      {friends.map((friend) => (
        <div key={friend.userid}>
          {friend.userid} - {friend.username}
        </div>
      ))}
    </div>
  );
};

export default Friend;
