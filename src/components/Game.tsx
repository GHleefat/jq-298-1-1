import React, { useRef, useEffect, useCallback, useState } from 'react';
import { GameEngine } from '@/game/GameEngine';
import { useGameLoop } from '@/hooks/useGameLoop';
import { CarState, GameState, GameMode, GAME_WIDTH, GAME_HEIGHT } from '@/game/types';
import Dashboard from './Dashboard';
import Result from './Result';
import { ArrowLeft } from 'lucide-react';

interface GameProps {
  mode: GameMode;
  onBack: () => void;
}

const Game: React.FC<GameProps> = ({ mode, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [carState, setCarState] = useState<CarState | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const keysPressed = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const engine = new GameEngine(ctx);
    engine.setMode(mode);
    engineRef.current = engine;

    setCarState(engine.getCarState());
    setGameState(engine.getGameState());

    return () => {
      engineRef.current = null;
    };
  }, [mode]);

  const update = useCallback((deltaTime: number) => {
    if (!engineRef.current) return;

    const engine = engineRef.current;
    
    engine.setInput({
      accelerate: keysPressed.current.has('w') || keysPressed.current.has('arrowup'),
      brake: keysPressed.current.has('s') || keysPressed.current.has('arrowdown'),
      left: keysPressed.current.has('a') || keysPressed.current.has('arrowleft'),
      right: keysPressed.current.has('d') || keysPressed.current.has('arrowright'),
      handbrake: keysPressed.current.has(' '),
    });

    engine.update(deltaTime);
    
    setCarState(engine.getCarState());
    setGameState(engine.getGameState());
  }, []);

  const render = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.render();
  }, []);

  useGameLoop(true, update, render);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current.add(key);

      if (key === 'q') {
        engineRef.current?.toggleLeftSignal();
      } else if (key === 'e') {
        engineRef.current?.toggleRightSignal();
      } else if (key === 'r') {
        engineRef.current?.cycleWiper();
      } else if (key === 'escape') {
        if (engineRef.current?.getGameState().isGameOver) {
          onBack();
        } else {
          engineRef.current?.togglePause();
        }
      } else if (key === 'enter') {
        if (engineRef.current?.getGameState().mode === 'exam') {
          engineRef.current?.finishParkingExam();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current.delete(key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onBack]);

  const handleRetry = () => {
    if (engineRef.current) {
      engineRef.current.reset();
      setCarState(engineRef.current.getCarState());
      setGameState(engineRef.current.getGameState());
    }
  };

  if (!carState || !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-neon-green font-orbitron text-2xl animate-pulse">
          加载中...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-night-card/80 backdrop-blur-sm border border-night-border hover:border-neon-green/50 rounded-xl text-gray-300 hover:text-neon-green transition-all font-jetbrains"
        >
          <ArrowLeft className="w-5 h-5" />
          返回菜单
        </button>
      </div>

      <div className="relative" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="rounded-2xl border-2 border-night-border shadow-2xl"
          style={{ boxShadow: '0 0 30px rgba(0, 255, 136, 0.2)' }}
        />
        
        <Dashboard carState={carState} gameState={gameState} />
        
        {gameState.mode === 'exam' && !gameState.showResult && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-night-card/80 backdrop-blur-sm rounded-xl px-6 py-3 border border-neon-green/50">
            <p className="text-neon-green font-jetbrains text-sm text-center">
              将车辆停入绿色标记的车位，停车后按 <span className="font-bold text-white">Enter</span> 提交
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl w-full">
        <div className="bg-night-card/50 rounded-xl p-3 border border-night-border text-center">
          <div className="text-xs text-gray-500 font-jetbrains mb-1">前进</div>
          <div className="flex justify-center gap-1">
            <kbd className="px-3 py-1 bg-night-bg rounded text-white font-jetbrains text-sm">W</kbd>
            <span className="text-gray-600">/</span>
            <kbd className="px-3 py-1 bg-night-bg rounded text-white font-jetbrains text-sm">↑</kbd>
          </div>
        </div>
        <div className="bg-night-card/50 rounded-xl p-3 border border-night-border text-center">
          <div className="text-xs text-gray-500 font-jetbrains mb-1">刹车</div>
          <div className="flex justify-center gap-1">
            <kbd className="px-3 py-1 bg-night-bg rounded text-white font-jetbrains text-sm">S</kbd>
            <span className="text-gray-600">/</span>
            <kbd className="px-3 py-1 bg-night-bg rounded text-white font-jetbrains text-sm">↓</kbd>
          </div>
        </div>
        <div className="bg-night-card/50 rounded-xl p-3 border border-night-border text-center">
          <div className="text-xs text-gray-500 font-jetbrains mb-1">转向</div>
          <div className="flex justify-center gap-1">
            <kbd className="px-3 py-1 bg-night-bg rounded text-white font-jetbrains text-sm">A/D</kbd>
            <span className="text-gray-600">/</span>
            <kbd className="px-3 py-1 bg-night-bg rounded text-white font-jetbrains text-sm">←/→</kbd>
          </div>
        </div>
        <div className="bg-night-card/50 rounded-xl p-3 border border-night-border text-center">
          <div className="text-xs text-gray-500 font-jetbrains mb-1">手刹</div>
          <kbd className="px-4 py-1 bg-night-bg rounded text-white font-jetbrains text-sm">空格</kbd>
        </div>
      </div>

      {gameState.showResult && gameState.parkingResult && (
        <Result
          parkingResult={gameState.parkingResult}
          gameState={gameState}
          onRetry={handleRetry}
          onMenu={onBack}
        />
      )}
    </div>
  );
};

export default Game;
