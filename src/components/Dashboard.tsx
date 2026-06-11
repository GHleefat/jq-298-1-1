import React from 'react';
import { CarState, GameState, SPEED_LIMIT } from '@/game/types';
import { Gauge, AlertTriangle, Timer, Trophy, Droplets } from 'lucide-react';

interface DashboardProps {
  carState: CarState;
  gameState: GameState;
}

const Dashboard: React.FC<DashboardProps> = ({ carState, gameState }) => {
  const speedKmh = Math.abs(Math.round(carState.speed * 20));
  const speedLimitKmh = SPEED_LIMIT * 20;
  const isSpeeding = speedKmh > speedLimitKmh;
  const timeSeconds = Math.floor(gameState.timeElapsed / 1000);
  const minutes = Math.floor(timeSeconds / 60);
  const seconds = timeSeconds % 60;

  const speedPercentage = Math.min(100, (speedKmh / (speedLimitKmh * 2)) * 100);
  const speedAngle = (speedPercentage / 100) * 180 - 90;

  return (
    <div className="absolute top-0 left-0 right-0 p-4 pointer-events-none">
      <div className="flex justify-between items-start">
        <div className="bg-night-card/90 backdrop-blur-sm rounded-xl p-4 border border-night-border border-glow">
          <div className="flex items-center gap-3 mb-3">
            <Gauge className="w-5 h-5 text-neon-green" />
            <span className="text-sm text-gray-400 font-jetbrains">车速</span>
          </div>
          
          <div className="relative w-32 h-16">
            <svg className="w-full h-full" viewBox="0 0 120 60">
              <path
                d="M 10 55 A 50 50 0 0 1 110 55"
                fill="none"
                stroke="#1e3a5f"
                strokeWidth="8"
              />
              <path
                d="M 10 55 A 50 50 0 0 1 110 55"
                fill="none"
                stroke={isSpeeding ? '#ff3b30' : '#00ff88'}
                strokeWidth="8"
                strokeDasharray={`${speedPercentage * 1.57} 157`}
                strokeLinecap="round"
              />
              <line
                x1="60"
                y1="55"
                x2={60 + 35 * Math.cos((speedAngle * Math.PI) / 180)}
                y2={55 + 35 * Math.sin((speedAngle * Math.PI) / 180)}
                stroke={isSpeeding ? '#ff3b30' : '#ffffff'}
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="60" cy="55" r="4" fill="#1e3a5f" />
              <circle cx="60" cy="55" r="2" fill={isSpeeding ? '#ff3b30' : '#00ff88'} />
            </svg>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
              <span className={`text-2xl font-bold font-orbitron ${isSpeeding ? 'text-traffic-red text-shadow-red' : 'text-neon-green text-shadow-neon'}`}>
                {speedKmh}
              </span>
              <span className="text-xs text-gray-500 ml-1">km/h</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 mt-2 text-center font-jetbrains">
            限速 {speedLimitKmh} km/h
          </div>
        </div>

        <div className="bg-night-card/90 backdrop-blur-sm rounded-xl p-4 border border-night-border">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-5 h-5 text-neon-green" />
            <span className="text-sm text-gray-400 font-jetbrains">得分</span>
          </div>
          <div className={`text-3xl font-bold font-orbitron ${
            gameState.score >= 80 ? 'text-neon-green text-shadow-neon' :
            gameState.score >= 60 ? 'text-traffic-yellow' :
            'text-traffic-red text-shadow-red'
          }`}>
            {gameState.score}
          </div>
          <div className="text-xs text-gray-500 mt-1 font-jetbrains">
            满分 100 分
          </div>
        </div>

        <div className="bg-night-card/90 backdrop-blur-sm rounded-xl p-4 border border-night-border">
          <div className="flex items-center gap-3 mb-2">
            <Timer className="w-5 h-5 text-neon-green" />
            <span className="text-sm text-gray-400 font-jetbrains">时间</span>
          </div>
          <div className="text-2xl font-bold font-jetbrains text-white">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          {gameState.mode === 'exam' && (
            <div className="text-xs text-neon-green mt-1 font-jetbrains">
              考核进行中
            </div>
          )}
        </div>

        <div className="bg-night-card/90 backdrop-blur-sm rounded-xl p-4 border border-night-border">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm text-gray-400 font-jetbrains">转向灯</span>
          </div>
          <div className="flex gap-4">
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
              carState.leftSignal 
                ? 'bg-traffic-yellow/30 border-traffic-yellow animate-blink' 
                : 'bg-gray-800 border-gray-700'
            }`}>
              <span className={`text-lg ${carState.leftSignal ? 'text-traffic-yellow' : 'text-gray-600'}`}>◀</span>
            </div>
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
              carState.rightSignal 
                ? 'bg-traffic-yellow/30 border-traffic-yellow animate-blink' 
                : 'bg-gray-800 border-gray-700'
            }`}>
              <span className={`text-lg ${carState.rightSignal ? 'text-traffic-yellow' : 'text-gray-600'}`}>▶</span>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2 text-center font-jetbrains">
            Q / E 切换
          </div>
        </div>

        <div className="bg-night-card/90 backdrop-blur-sm rounded-xl p-4 border border-night-border">
          <div className="flex items-center gap-3 mb-3">
            <Droplets className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-400 font-jetbrains">雨刷</span>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map(level => (
              <div
                key={level}
                className={`w-6 h-6 rounded border-2 flex items-center justify-center text-xs font-bold transition-all ${
                  carState.wiperLevel >= level
                    ? 'bg-blue-500/30 border-blue-400 text-blue-400'
                    : 'bg-gray-800 border-gray-700 text-gray-600'
                }`}
              >
                {level === 0 ? '关' : level === 1 ? '慢' : '快'}
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-2 text-center font-jetbrains">
            R 切换
          </div>
        </div>
      </div>

      {gameState.violations.length > 0 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 mt-24">
          <div className="bg-night-card/90 backdrop-blur-sm rounded-xl p-3 border border-traffic-red/50 border-glow-red max-w-md">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-traffic-red" />
              <span className="text-sm text-traffic-red font-jetbrains">违规记录</span>
            </div>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {gameState.violations.slice(-3).map((violation, index) => (
                <div key={index} className="text-xs text-gray-400 font-jetbrains flex justify-between">
                  <span>{violation.message}</span>
                  <span className="text-traffic-red">-{violation.points}分</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {gameState.isPaused && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
          <div className="bg-night-card/95 backdrop-blur-md rounded-2xl p-8 border border-night-border border-glow text-center">
            <h2 className="text-4xl font-bold font-orbitron text-neon-green text-shadow-neon mb-4">
              游戏暂停
            </h2>
            <p className="text-gray-400 font-jetbrains">
              按 ESC 键继续游戏
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
