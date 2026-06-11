import React, { useState } from 'react';
import { GameMode } from '@/game/types';
import Menu from '@/components/Menu';
import Game from '@/components/Game';
import Controls from '@/components/Controls';

export default function Home() {
  const [currentView, setCurrentView] = useState<'menu' | 'game'>('menu');
  const [gameMode, setGameMode] = useState<GameMode>('practice');
  const [showControls, setShowControls] = useState(false);

  const handleStartPractice = () => {
    setGameMode('practice');
    setCurrentView('game');
  };

  const handleStartExam = () => {
    setGameMode('exam');
    setCurrentView('game');
  };

  const handleBackToMenu = () => {
    setCurrentView('menu');
  };

  return (
    <div className="min-h-screen bg-night-bg">
      {currentView === 'menu' && (
        <Menu
          onStartPractice={handleStartPractice}
          onStartExam={handleStartExam}
          onShowControls={() => setShowControls(true)}
        />
      )}
      
      {currentView === 'game' && (
        <Game mode={gameMode} onBack={handleBackToMenu} />
      )}
      
      {showControls && (
        <Controls onClose={() => setShowControls(false)} />
      )}
    </div>
  );
}
