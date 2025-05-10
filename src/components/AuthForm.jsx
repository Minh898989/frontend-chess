import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/AuthForm.css';

const AuthForm = () => {
  const [mode, setMode] = useState('login');
  const [userid, setUserid] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isReadonlyUser, setIsReadonlyUser] = useState(false); // để khóa input nếu từ Telegram
  const navigate = useNavigate();

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    const tgUser = tg?.initDataUnsafe?.user;

    if (tgUser?.username) {
      setUserid(tgUser.username);
      setIsReadonlyUser(true);
    } else {
      // Nếu không mở từ Telegram → thử lấy từ URL (?uid=abc)
      const query = new URLSearchParams(window.location.search);
      const uidFromUrl = query.get("uid");

      if (uidFromUrl) {
        setUserid(uidFromUrl);
        setIsReadonlyUser(true);
      } else {
        // Dữ liệu test khi debug trong trình duyệt
        setUserid("test_user");
        setIsReadonlyUser(false); // cho phép sửa khi test
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const endpoint = mode === 'login' ? 'login' : 'register';

    try {
      const res = await axios.post(
        `https://backend-chess-fjr7.onrender.com/api/auth/${endpoint}`,
        { userid, password },
        {
          withCredentials: true,
        }
      );

      setMessage(res.data.message);

      if (mode === 'login' && res.data.message === 'Đăng nhập thành công') {
        localStorage.setItem('user', JSON.stringify({ userid }));
        navigate('/');
      } else if (mode === 'register' && res.data.message === 'Đăng ký thành công') {
        setMode('login');
      }

      setPassword('');
    } catch (err) {
      const errorMessage = err.response
        ? err.response.data?.message || 'Đã xảy ra lỗi từ server. Vui lòng thử lại.'
        : 'Lỗi kết nối mạng. Vui lòng kiểm tra lại.';

      setMessage(errorMessage);
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
            readOnly={isReadonlyUser}
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
