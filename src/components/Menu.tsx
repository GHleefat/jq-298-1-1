import React from 'react';
import { Car, Play, Target, HelpCircle, Settings, Gamepad2 } from 'lucide-react';

interface MenuProps {
  onStartPractice: () => void;
  onStartExam: () => void;
  onShowControls: () => void;
}

const Menu: React.FC<MenuProps> = ({ onStartPractice, onStartExam, onShowControls }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-noise pointer-events-none" />
      
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-green to-transparent animate-pulse-slow" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-green to-transparent animate-pulse-slow" />
      
      <div className="relative z-10 text-center mb-16">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-night-card border-2 border-neon-green border-glow flex items-center justify-center animate-glow">
            <Car className="w-10 h-10 text-neon-green" />
          </div>
        </div>
        
        <h1 className="text-6xl font-black font-orbitron text-neon-green text-shadow-neon mb-4 tracking-wider">
          驾驶模拟器
        </h1>
        <p className="text-xl text-gray-400 font-jetbrains max-w-lg mx-auto">
          新手驾驶员的虚拟训练平台<br />
          <span className="text-neon-green/60">无需真车上路，安全练习驾驶技能</span>
        </p>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full mb-12">
        <button
          onClick={onStartPractice}
          className="group relative bg-night-card border-2 border-night-border hover:border-neon-green rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:border-glow"
        >
          <div className="absolute inset-0 bg-neon-green/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-xl bg-neon-green/10 border border-neon-green/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Play className="w-7 h-7 text-neon-green" />
            </div>
            <h2 className="text-2xl font-bold font-orbitron text-white mb-2">
              自由练习
            </h2>
            <p className="text-gray-400 font-jetbrains text-sm">
              无压力练习驾驶操作<br />
              熟悉油门、刹车、转向感觉
            </p>
          </div>
        </button>

        <button
          onClick={onStartExam}
          className="group relative bg-night-card border-2 border-night-border hover:border-neon-green rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:border-glow"
        >
          <div className="absolute inset-0 bg-neon-green/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="w-14 h-14 rounded-xl bg-traffic-yellow/10 border border-traffic-yellow/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Target className="w-7 h-7 text-traffic-yellow" />
            </div>
            <h2 className="text-2xl font-bold font-orbitron text-white mb-2">
              侧方停车考核
            </h2>
            <p className="text-gray-400 font-jetbrains text-sm">
              标准侧方停车考试<br />
              检测停车精度并评分
            </p>
          </div>
        </button>
      </div>

      <div className="relative z-10 flex gap-4">
        <button
          onClick={onShowControls}
          className="flex items-center gap-3 bg-night-card/50 border border-night-border hover:border-neon-green/50 rounded-xl px-6 py-3 text-gray-300 hover:text-neon-green transition-all font-jetbrains"
        >
          <HelpCircle className="w-5 h-5" />
          操作说明
        </button>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-2 text-gray-600 text-sm font-jetbrains">
        <Settings className="w-4 h-4" />
        <span>键盘操作 · 支持 WASD 和方向键</span>
      </div>

      <div className="absolute top-1/4 left-10 w-32 h-32 border border-neon-green/10 rounded-full animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-10 w-24 h-24 border border-neon-green/10 rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-neon-green/30 rounded-full animate-pulse" />
      <div className="absolute bottom-1/3 left-1/4 w-2 h-2 bg-neon-green/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
    </div>
  );
};

export default Menu;
