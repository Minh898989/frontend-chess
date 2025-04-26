import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomeScreen from "./components/HomeScreen";
import GameScreen from "./components/GameScreen";
import Missions from "./components/Missions";

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/game/:mode" element={<GameScreen />} />
          <Route path="/missions" element={<Missions />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
