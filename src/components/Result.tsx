import React from 'react';
import { ParkingResult, GameState } from '@/game/types';
import { Trophy, Star, Clock, Target, AlertTriangle, RotateCcw, Home, CheckCircle, XCircle } from 'lucide-react';

interface ResultProps {
  parkingResult: ParkingResult;
  gameState: GameState;
  onRetry: () => void;
  onMenu: () => void;
}

const Result: React.FC<ResultProps> = ({ parkingResult, gameState, onRetry, onMenu }) => {
  const { score, stars, isInBounds, angleDeviation, centerOffset, timeTaken, overhangDistance } = parkingResult;
  const totalViolationPoints = gameState.violations.reduce((sum, v) => sum + v.points, 0);

  const getResultMessage = () => {
    if (stars === 3) return { text: '完美！', color: 'text-neon-green' };
    if (stars === 2) return { text: '优秀！', color: 'text-traffic-green' };
    if (stars === 1) return { text: '及格', color: 'text-traffic-yellow' };
    return { text: '需要练习', color: 'text-traffic-red' };
  };

  const resultMessage = getResultMessage();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-night-card border-2 border-night-border rounded-3xl p-8 max-w-lg w-full shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-night-bg border-4 border-neon-green flex items-center justify-center border-glow">
            <Trophy className="w-10 h-10 text-neon-green" />
          </div>
          
          <h2 className="text-4xl font-black font-orbitron text-white mb-2">
            考核完成
          </h2>
          
          <p className={`text-2xl font-bold font-orbitron ${resultMessage.color}`}>
            {resultMessage.text}
          </p>
        </div>

        <div className="bg-night-bg/50 rounded-2xl p-6 mb-6">
          <div className="text-center mb-6">
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3].map(i => (
                <Star
                  key={i}
                  className={`w-10 h-10 ${
                    i <= stars
                      ? 'text-traffic-yellow fill-traffic-yellow'
                      : 'text-gray-700'
                  }`}
                />
              ))}
            </div>
            <div className={`text-6xl font-black font-orbitron ${
              score >= 80 ? 'text-neon-green text-shadow-neon' :
              score >= 60 ? 'text-traffic-yellow' :
              'text-traffic-red text-shadow-red'
            }`}>
              {score}
            </div>
            <div className="text-gray-500 font-jetbrains text-sm mt-1">
              总分 100 分
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-night-card rounded-xl p-3 border border-night-border">
              <div className="flex items-center gap-2 text-gray-400 text-sm font-jetbrains mb-1">
                <CheckCircle className={`w-4 h-4 ${isInBounds ? 'text-traffic-green' : 'text-traffic-red'}`} />
                车辆入库
              </div>
              <div className="text-white font-bold font-jetbrains">
                {isInBounds ? '成功' : '失败'}
              </div>
            </div>

            <div className="bg-night-card rounded-xl p-3 border border-night-border">
              <div className="flex items-center gap-2 text-gray-400 text-sm font-jetbrains mb-1">
                <Clock className="w-4 h-4 text-neon-green" />
                用时
              </div>
              <div className="text-white font-bold font-jetbrains">
                {timeTaken.toFixed(1)} 秒
              </div>
            </div>

            <div className="bg-night-card rounded-xl p-3 border border-night-border">
              <div className="flex items-center gap-2 text-gray-400 text-sm font-jetbrains mb-1">
                <Target className="w-4 h-4 text-blue-400" />
                角度偏差
              </div>
              <div className={`font-bold font-jetbrains ${
                angleDeviation < 5 ? 'text-traffic-green' :
                angleDeviation < 15 ? 'text-traffic-yellow' :
                'text-traffic-red'
              }`}>
                {angleDeviation.toFixed(1)}°
              </div>
            </div>

            <div className="bg-night-card rounded-xl p-3 border border-night-border">
              <div className="flex items-center gap-2 text-gray-400 text-sm font-jetbrains mb-1">
                <Target className="w-4 h-4 text-purple-400" />
                中心偏移
              </div>
              <div className={`font-bold font-jetbrains ${
                centerOffset < 10 ? 'text-traffic-green' :
                centerOffset < 30 ? 'text-traffic-yellow' :
                'text-traffic-red'
              }`}>
                {centerOffset.toFixed(1)} px
              </div>
            </div>

            {overhangDistance > 0 && (
              <div className="bg-night-card rounded-xl p-3 border border-night-border">
                <div className="flex items-center gap-2 text-gray-400 text-sm font-jetbrains mb-1">
                  <XCircle className="w-4 h-4 text-traffic-red" />
                  出线距离
                </div>
                <div className="text-traffic-red font-bold font-jetbrains">
                  {overhangDistance.toFixed(1)} px
                </div>
              </div>
            )}

            {totalViolationPoints > 0 && (
              <div className="bg-night-card rounded-xl p-3 border border-night-border">
                <div className="flex items-center gap-2 text-gray-400 text-sm font-jetbrains mb-1">
                  <AlertTriangle className="w-4 h-4 text-traffic-red" />
                  违规扣分
                </div>
                <div className="text-traffic-red font-bold font-jetbrains">
                  -{totalViolationPoints} 分
                </div>
              </div>
            )}
          </div>
        </div>

        {gameState.violations.length > 0 && (
          <div className="bg-night-bg/50 rounded-xl p-4 mb-6 border border-traffic-red/30">
            <h4 className="text-traffic-red font-jetbrains font-bold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              违规记录
            </h4>
            <div className="space-y-2 max-h-24 overflow-y-auto">
              {gameState.violations.map((v, i) => (
                <div key={i} className="flex justify-between text-sm font-jetbrains">
                  <span className="text-gray-400">{v.message}</span>
                  <span className="text-traffic-red">-{v.points}分</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={onMenu}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-night-card border-2 border-night-border hover:border-neon-green/50 rounded-xl text-gray-300 hover:text-neon-green font-jetbrains font-bold transition-all"
          >
            <Home className="w-5 h-5" />
            返回菜单
          </button>
          <button
            onClick={onRetry}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-neon-green/10 border-2 border-neon-green text-neon-green rounded-xl font-jetbrains font-bold hover:bg-neon-green/20 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            再来一次
          </button>
        </div>
      </div>
    </div>
  );
};

export default Result;
