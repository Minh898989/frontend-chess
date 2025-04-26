import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/HomeScreen.css";

function HomeScreen() {
  const [showModes, setShowModes] = useState(false);
  const [showAIDifficulty, setShowAIDifficulty] = useState(false);
  const [telegramUser, setTelegramUser] = useState(null); 
  const navigate = useNavigate();

  const handleModeSelection = (selectedMode) => {
    navigate(`/game/${selectedMode}`);
  };
  const goToQuests = () => {
  navigate("/missions");
};
useEffect(() => {
  if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
    setTelegramUser(window.Telegram.WebApp.initDataUnsafe.user);
  }
}, []);



  return (
    <div className="home">
         {telegramUser && (
        <div className="account-info">
          <img 
            src={telegramUser.photo_url} 
            alt="avatar" 
            className="avatar" 
          />
          <span className="username">{telegramUser.first_name}</span>
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
