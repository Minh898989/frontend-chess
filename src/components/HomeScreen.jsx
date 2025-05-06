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
  
    const saveUser = (userData, source = "unknown") => {
      console.log(`👤 Đã lấy user từ ${source}:`, userData);
      setUser(userData);
      localStorage.setItem("chessUser", JSON.stringify(userData));
    };
  
    const loadFromLocalStorage = () => {
      const stored = localStorage.getItem("chessUser");
      if (stored) {
        const parsedUser = JSON.parse(stored);
        console.log("📦 User từ localStorage:", parsedUser);
        setUser(parsedUser);
      } else {
        console.warn("❌ Không tìm thấy user trong localStorage");
      }
    };
  
    try {
      if (!tg) {
        console.warn("⚠️ Không phải Telegram WebApp — fallback URL hoặc localStorage");
  
        const params = new URLSearchParams(window.location.search);
        const uid = params.get("uid");
        const un = params.get("un");
  
        if (uid || un) {
          saveUser({ id: uid || "unknown", username: un || null }, "URL Params");
        } else {
          loadFromLocalStorage();
        }
        return;
      }
  
      tg.ready();
      tg.expand();
      console.log("✅ Telegram WebApp đã sẵn sàng");
  
      console.log("📦 Dữ liệu initDataUnsafe:", tg.initDataUnsafe);
  
      const userInfo = tg.initDataUnsafe?.user;
  
      if (userInfo) {
        saveUser(userInfo, "Telegram SDK");
      } else {
        console.warn("⚠️ Không có user trong initDataUnsafe");
  
        const params = new URLSearchParams(window.location.search);
        const uid = params.get("uid");
        const un = params.get("un");
  
        if (uid || un) {
          saveUser({ id: uid || "unknown", username: un || null }, "URL Params");
        } else {
          loadFromLocalStorage();
        }
      }
    } catch (err) {
      console.error("❌ Lỗi trong useEffect:", err);
      loadFromLocalStorage();
    }
  }, []);
  
  
  
  
  
  
  const handleModeSelection = (selectedMode) => {
    navigate(`/game/${selectedMode}`);
  };
  const goToQuests = () => {
  navigate("/missions");
};
const goToGuide = () => {
  navigate("/guide");
};



  return (
    <div className="home">
      {user && (
  <div className="user-top-right">
    👤 {user.username ? `@${user.username}` : user.first_name || "Người chơi"}
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
      <div className="extra-buttons">
      <button onClick={goToGuide}>📖 Hướng dẫn chơi</button>
      </div>
    </div>
  );
}

export default HomeScreen;
