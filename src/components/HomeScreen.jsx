import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomeScreen.css";

function HomeScreen() {
  const [showModes, setShowModes] = useState(false);
  const [showAIDifficulty, setShowAIDifficulty] = useState(false);
  const [user, setUser] = useState(null); 

  const navigate = useNavigate();
  useEffect(() => {
    try {
      if (!window.Telegram) {
        console.warn("❌ window.Telegram không tồn tại");
        return;
      }
  
      if (!window.Telegram.WebApp) {
        console.warn("❌ window.Telegram.WebApp không tồn tại");
        return;
      }
  
      window.Telegram.WebApp.ready();
      console.log("✅ Telegram WebApp đã sẵn sàng");
  
      const initDataUnsafe = window.Telegram.WebApp.initDataUnsafe;
      console.log("📦 initDataUnsafe:", initDataUnsafe);
  
      if (!initDataUnsafe || !initDataUnsafe.user) {
        console.warn("⚠️ Không tìm thấy user trong initDataUnsafe");
        return;
      }
  
      const userInfo = initDataUnsafe.user;
      console.log("👤 Thông tin người dùng:", userInfo);
      setUser(userInfo);
    } catch (error) {
      console.error("❗ Lỗi khi khởi tạo Telegram WebApp:", error);
    }
  }, []);
  
  
  
  const handleModeSelection = (selectedMode) => {
    navigate(`/game/${selectedMode}`);
  };
  const goToQuests = () => {
  navigate("/missions");
};



  return (
    <div className="home">
       
       {user && (
  <div className="user-info">
    <img
      src={user.photo_url}
      alt="avatar"
      className="avatar"
    />
    <div className="username-display">
      👤 @{user.username || user.first_name}
    </div>
  </div>
)}

      <h1>♟️ Game Cờ Vua</h1>

      {!showModes ? (
        <button onClick={() => setShowModes(true)}>Vào chơi</button>
      ) : showAIDifficulty ? (
        <div className="mode-selection">
          <h2>🤖 Chọn độ khó:</h2>
          <button onClick={() => handleModeSelection("easy")}>🟢 Dễ</button>
          <button onClick={() => handleModeSelection("medium")}>🟡 Trung bình</button>
          <button onClick={() => handleModeSelection("hard")}>🔴 Khó</button>
        </div>
      ) : (
        <div className="mode-selection">
          <h2>Chọn chế độ chơi:</h2>
          <button onClick={() => handleModeSelection("2players")}>👥 Chơi 2 người</button>
          <button onClick={() => setShowAIDifficulty(true)}>🤖 Chơi với máy</button>
        </div>
      )}
       <div className="extra-buttons">
        <button onClick={goToQuests}>📝 Nhiệm vụ & phần thưởng </button>
        
      </div>
    </div>
  );
}

export default HomeScreen;
