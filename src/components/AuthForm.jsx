import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AuthForm.css';

const AuthForm = () => {
  const [mode, setMode] = useState('login');
  const [userid, setUserid] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear any previous message

    const endpoint = mode === 'login' ? 'login' : 'register';

    try {
      const res = await axios.post(
        `https://backend-chess-fjr7.onrender.com/api/auth/${endpoint}`,
        { userid, password },
        {
          withCredentials: true, // Ensure cookies are sent/received (if necessary)
        }
      );

      console.log('Response:', res.data); // Log the response for debugging
      setMessage(res.data.message);

      if (mode === 'login' && res.data.message === 'Đăng nhập thành công') {
        console.log('Đăng nhập với userId:', userid);
        localStorage.setItem('user', JSON.stringify({ userid }));
        navigate('/'); // Navigate to the home page after login
      } else if (mode === 'register' && res.data.message === 'Đăng ký thành công') {
        console.log('Đăng ký thành công, chuyển sang đăng nhập');
        setMode('login'); // Switch to login mode after successful registration
      }

      // Clear input fields after successful action
      setUserid('');
      setPassword('');
    } catch (err) {
      const errorMessage = err.response
        ? err.response.data?.message || 'Đã xảy ra lỗi từ server. Vui lòng thử lại.'
        : 'Lỗi kết nối mạng. Vui lòng kiểm tra lại.';

      setMessage(errorMessage);
      console.error('Error details:', err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="auth-title">♟️ Game Cờ Vua</h1>
        <div className="tab-buttons">
          <button
            className={mode === 'login' ? 'active' : ''}
            onClick={() => setMode('login')}
          >
            Đăng nhập
          </button>
          <button
            className={mode === 'register' ? 'active' : ''}
            onClick={() => setMode('register')}
          >
            Đăng ký
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <label>Tên:</label>
          <input
            type="text"
            value={userid}
            onChange={(e) => setUserid(e.target.value)}
            required
          />

          <label>Mật khẩu:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">
            {mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
          </button>

          {message && <p className="message">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default AuthForm;
