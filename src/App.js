import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomeScreen from "./components/HomeScreen";
import GameScreen from "./components/GameScreen";
import Missions from "./components/Missions";
import ChessGuide from './components/ChessGuide';
import AuthForm from './components/AuthForm';
import PrivateRoute from './components/PrivateRoute';
import TwoPlayer from './components/TwoPlayer';

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/auth" element={<AuthForm />} />
          
          {/* Các route cần đăng nhập */}
          <Route path="/" element={
            <PrivateRoute>
              <HomeScreen />
            </PrivateRoute>
          } />
          <Route path="/game/:mode" element={
            <PrivateRoute>
              <GameScreen />
            </PrivateRoute>
          } />
          <Route path="/missions" element={
            <PrivateRoute>
              <Missions />
            </PrivateRoute>
          } />
          <Route path="/guide" element={
            <PrivateRoute>
              <ChessGuide />
            </PrivateRoute>
          } />
           <Route path="/newgame" element={
  <PrivateRoute>
    <TwoPlayer />
  </PrivateRoute>
} />
          
        </Routes>
      </div>
    </Router>
  );
}

export default App;
