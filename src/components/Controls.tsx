import React from 'react';
import { X, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Hand, Droplets, Pause } from 'lucide-react';

interface ControlsProps {
  onClose: () => void;
}

const Controls: React.FC<ControlsProps> = ({ onClose }) => {
  const controlItems = [
    { key: 'W / ↑', label: '加速', icon: ArrowUp, color: 'text-traffic-green' },
    { key: 'S / ↓', label: '刹车 / 倒车', icon: ArrowDown, color: 'text-traffic-red' },
    { key: 'A / ←', label: '向左转向', icon: ArrowLeft, color: 'text-neon-green' },
    { key: 'D / →', label: '向右转向', icon: ArrowRight, color: 'text-neon-green' },
    { key: 'Q', label: '左转向灯', icon: ArrowLeft, color: 'text-traffic-yellow' },
    { key: 'E', label: '右转向灯', icon: ArrowRight, color: 'text-traffic-yellow' },
    { key: 'R', label: '雨刷开关', icon: Droplets, color: 'text-blue-400' },
    { key: '空格', label: '手刹', icon: Hand, color: 'text-orange-400' },
    { key: 'ESC', label: '暂停 / 菜单', icon: Pause, color: 'text-gray-400' },
    { key: 'Enter', label: '完成停车（考核）', icon: ArrowUp, color: 'text-neon-green' },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-night-card border-2 border-night-border rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold font-orbitron text-neon-green text-shadow-neon">
            操作说明
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-night-bg border border-night-border hover:border-traffic-red flex items-center justify-center text-gray-400 hover:text-traffic-red transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {controlItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 bg-night-bg/50 rounded-xl p-4 border border-night-border"
            >
              <div className={`w-10 h-10 rounded-lg bg-night-card flex items-center justify-center ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-jetbrains font-bold text-white">{item.key}</div>
                <div className="text-sm text-gray-400 font-jetbrains">{item.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-night-bg/50 rounded-xl p-6 border border-night-border">
          <h3 className="text-xl font-bold font-orbitron text-neon-green mb-4">
            游戏规则
          </h3>
          <ul className="space-y-3 text-gray-300 font-jetbrains text-sm">
            <li className="flex items-start gap-2">
              <span className="text-neon-green">•</span>
              <span>遵守交通信号灯，红灯时停车等待</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neon-green">•</span>
              <span>注意避让行人和其他车辆，发生碰撞会扣分</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neon-green">•</span>
              <span>保持在车道内行驶，压线或驶出车道会扣分</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neon-green">•</span>
              <span>注意限速，超速行驶会扣分</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neon-green">•</span>
              <span>侧方停车考核：将车完整停入绿色标注的车位</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neon-green">•</span>
              <span>停车后按 Enter 键提交考核结果</span>
            </li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="px-8 py-3 bg-neon-green/10 border-2 border-neon-green text-neon-green rounded-xl font-jetbrains font-bold hover:bg-neon-green/20 transition-all"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  );
};

export default Controls;
