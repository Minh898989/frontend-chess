import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomeScreen.css";

function HomeScreen() {
  const [showModes, setShowModes] = useState(false);
  const [showAIDifficulty, setShowAIDifficulty] = useState(false);
  const [user, setUser] = useState(null); 

  const navigate = useNavigate();
  
  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    if (tg) {
      try {
        tg.ready();
        console.log("✅ Telegram WebApp đã sẵn sàng");

        const userInfo = tg.initDataUnsafe?.user;
        if (userInfo) {
          setUser(userInfo);
        } else {
          console.warn("⚠️ Không tìm thấy thông tin người dùng từ Telegram");
        }
      } catch (err) {
        console.error("❌ Lỗi khởi tạo Telegram WebApp:", err);
      }
    } else {
      console.warn("⚠️ Không chạy trong Telegram WebApp — thử lấy từ URL");
      const params = new URLSearchParams(window.location.search);
      const uid = params.get("uid");
      const un = params.get("un");

      if (uid && un) {
        setUser({ id: uid, username: un });
      }
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
  <div className="user-top-right">
    👤 @{user.username || user.first_name}
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
