import { CarState, TrafficLight, Pedestrian, NPCVehicle, ParkingSpot, GAME_WIDTH, GAME_HEIGHT, ROAD_WIDTH } from './types';
import { getCarCorners } from './Physics';

interface NoiseParticle {
  x: number;
  y: number;
  size: number;
}

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private roadCenterX: number;
  private signalBlinkTimer: number = 0;
  private wiperAngle: number = 0;
  private grassNoise: NoiseParticle[] = [];
  private roadNoise: NoiseParticle[] = [];
  private crosswalkPositions: number[] = [];

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.roadCenterX = width / 2;
    this.generateNoise();
    this.generateCrosswalks();
  }

  private generateNoise(): void {
    this.grassNoise = [];
    for (let i = 0; i < 200; i++) {
      this.grassNoise.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: 2,
      });
    }

    this.roadNoise = [];
    const halfRoad = ROAD_WIDTH / 2;
    const roadX = this.roadCenterX - halfRoad;
    for (let i = 0; i < 50; i++) {
      this.roadNoise.push({
        x: roadX + 8 + Math.random() * (ROAD_WIDTH - 16),
        y: Math.random() * this.height,
        size: 1 + Math.random() * 2,
      });
    }
  }

  private generateCrosswalks(): void {
    const crosswalkCount = 2;
    this.crosswalkPositions = [];
    const spacing = this.height / (crosswalkCount + 1);
    for (let i = 0; i < crosswalkCount; i++) {
      this.crosswalkPositions.push(spacing * (i + 1) + (Math.random() - 0.5) * 50);
    }
  }

  clear(): void {
    this.ctx.fillStyle = '#0a1628';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.drawGrass();
  }

  private drawGrass(): void {
    const gradient = this.ctx.createLinearGradient(0, 0, this.width, 0);
    gradient.addColorStop(0, '#1a3a1a');
    gradient.addColorStop(1, '#1a3a1a');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    for (const particle of this.grassNoise) {
      this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
    }
  }

  drawRoad(): void {
    const halfRoad = ROAD_WIDTH / 2;
    const roadX = this.roadCenterX - halfRoad;

    this.ctx.fillStyle = '#2d3748';
    this.ctx.fillRect(roadX, 0, ROAD_WIDTH, this.height);

    this.ctx.fillStyle = '#1a202c';
    this.ctx.fillRect(roadX, 0, 4, this.height);
    this.ctx.fillRect(roadX + ROAD_WIDTH - 4, 0, 4, this.height);

    this.ctx.strokeStyle = '#d69e2e';
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([20, 15]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.roadCenterX, 0);
    this.ctx.lineTo(this.roadCenterX, this.height);
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([]);
    this.ctx.beginPath();
    this.ctx.moveTo(roadX + 4, 0);
    this.ctx.lineTo(roadX + 4, this.height);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(roadX + ROAD_WIDTH - 4, 0);
    this.ctx.lineTo(roadX + ROAD_WIDTH - 4, this.height);
    this.ctx.stroke();

    for (const y of this.crosswalkPositions) {
      this.drawCrosswalk(y);
    }

    this.ctx.fillStyle = 'rgba(45, 55, 72, 0.5)';
    for (const particle of this.roadNoise) {
      this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
    }
  }

  private drawCrosswalk(y: number): void {
    const halfRoad = ROAD_WIDTH / 2;
    const stripeWidth = 8;
    const stripeHeight = 30;
    const gap = 6;
    const startX = this.roadCenterX - halfRoad + 20;
    const endX = this.roadCenterX + halfRoad - 20;

    this.ctx.fillStyle = '#ffffff';
    for (let x = startX; x < endX; x += stripeWidth + gap) {
      this.ctx.fillRect(x, y - stripeHeight / 2, stripeWidth, stripeHeight);
    }
  }

  drawCar(car: CarState, isPlayer: boolean = true): void {
    const ctx = this.ctx;
    const corners = getCarCorners(car);

    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.angle + Math.PI / 2);

    const bodyColor = isPlayer ? '#3b82f6' : '#6b7280';
    const wheelColor = '#1f2937';
    const windowColor = 'rgba(147, 197, 253, 0.6)';

    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.moveTo(-car.width / 2, -car.height / 2 + 8);
    ctx.lineTo(-car.width / 2, car.height / 2 - 8);
    ctx.quadraticCurveTo(-car.width / 2, car.height / 2, -car.width / 2 + 5, car.height / 2);
    ctx.lineTo(car.width / 2 - 5, car.height / 2);
    ctx.quadraticCurveTo(car.width / 2, car.height / 2, car.width / 2, car.height / 2 - 8);
    ctx.lineTo(car.width / 2, -car.height / 2 + 8);
    ctx.quadraticCurveTo(car.width / 2, -car.height / 2, car.width / 2 - 5, -car.height / 2);
    ctx.lineTo(-car.width / 2 + 5, -car.height / 2);
    ctx.quadraticCurveTo(-car.width / 2, -car.height / 2, -car.width / 2, -car.height / 2 + 8);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = isPlayer ? '#60a5fa' : '#9ca3af';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = windowColor;
    ctx.fillRect(-car.width / 2 + 4, -car.height / 4, car.width - 8, car.height / 2);

    ctx.fillStyle = wheelColor;
    ctx.fillRect(-car.width / 2 - 2, -car.height / 2 + 5, 4, 12);
    ctx.fillRect(car.width / 2 - 2, -car.height / 2 + 5, 4, 12);
    ctx.fillRect(-car.width / 2 - 2, car.height / 2 - 17, 4, 12);
    ctx.fillRect(car.width / 2 - 2, car.height / 2 - 17, 4, 12);

    if (car.brakeLight) {
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10;
      ctx.fillRect(-car.width / 2 + 3, car.height / 2 - 5, 6, 4);
      ctx.fillRect(car.width / 2 - 9, car.height / 2 - 5, 6, 4);
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-car.width / 2 + 3, -car.height / 2 + 2, 6, 4);
    ctx.fillRect(car.width / 2 - 9, -car.height / 2 + 2, 6, 4);

    const blinkOn = Math.floor(this.signalBlinkTimer / 30) % 2 === 0;

    if (car.leftSignal && blinkOn) {
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 8;
      ctx.fillRect(-car.width / 2 - 4, -car.height / 2 + 10, 4, 8);
      ctx.fillRect(-car.width / 2 - 4, car.height / 2 - 18, 4, 8);
      ctx.shadowBlur = 0;
    }

    if (car.rightSignal && blinkOn) {
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 8;
      ctx.fillRect(car.width / 2, -car.height / 2 + 10, 4, 8);
      ctx.fillRect(car.width / 2, car.height / 2 - 18, 4, 8);
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  drawTrafficLight(light: TrafficLight): void {
    const ctx = this.ctx;
    const boxWidth = 30;
    const boxHeight = 70;

    ctx.fillStyle = '#1f2937';
    ctx.fillRect(light.x - boxWidth / 2, light.y - boxHeight / 2, boxWidth, boxHeight);
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    ctx.strokeRect(light.x - boxWidth / 2, light.y - boxHeight / 2, boxWidth, boxHeight);

    const lightY = [light.y - 22, light.y, light.y + 22];
    const colors = ['#ef4444', '#f59e0b', '#22c55e'];
    const states = ['red', 'yellow', 'green'];

    states.forEach((state, i) => {
      const isOn = light.state === state;
      ctx.beginPath();
      ctx.arc(light.x, lightY[i], 8, 0, Math.PI * 2);
      
      if (isOn) {
        ctx.fillStyle = colors[i];
        ctx.shadowColor = colors[i];
        ctx.shadowBlur = 15;
      } else {
        ctx.fillStyle = '#374151';
        ctx.shadowBlur = 0;
      }
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  drawPedestrian(pedestrian: Pedestrian): void {
    const ctx = this.ctx;

    ctx.fillStyle = '#f87171';
    ctx.beginPath();
    ctx.arc(pedestrian.x, pedestrian.y - 5, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(pedestrian.x - 5, pedestrian.y, 10, 15);

    ctx.fillStyle = '#1e40af';
    ctx.fillRect(pedestrian.x - 5, pedestrian.y + 15, 4, 8);
    ctx.fillRect(pedestrian.x + 1, pedestrian.y + 15, 4, 8);

    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pedestrian.x - 5, pedestrian.y + 2);
    ctx.lineTo(pedestrian.x - 10, pedestrian.y + 10);
    ctx.moveTo(pedestrian.x + 5, pedestrian.y + 2);
    ctx.lineTo(pedestrian.x + 10, pedestrian.y + 10);
    ctx.stroke();
  }

  drawNPCVehicle(vehicle: NPCVehicle): void {
    const car: CarState = {
      x: vehicle.x,
      y: vehicle.y,
      angle: vehicle.angle,
      speed: vehicle.speed,
      maxSpeed: vehicle.maxSpeed,
      acceleration: 0,
      brakeForce: 0,
      friction: 0,
      turnRate: 0,
      width: vehicle.width,
      height: vehicle.height,
      leftSignal: false,
      rightSignal: false,
      wiperLevel: 0,
      brakeLight: vehicle.speed < 0.5,
      handbrake: false,
    };
    this.drawCar(car, false);
  }

  drawParkingSpots(spots: ParkingSpot[]): void {
    const ctx = this.ctx;

    spots.forEach(spot => {
      ctx.save();
      ctx.translate(spot.x, spot.y);
      ctx.rotate(spot.angle);

      if (spot.isTarget) {
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 10;
      } else {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 0;
      }

      ctx.setLineDash([8, 4]);
      ctx.strokeRect(-spot.width / 2, -spot.height / 2, spot.width, spot.height);
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;

      if (spot.isTarget) {
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 14px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText('P', 0, 5);
      }

      ctx.restore();
    });
  }

  drawWiper(wiperLevel: number): void {
    if (wiperLevel === 0) return;

    const ctx = this.ctx;
    const speed = wiperLevel === 1 ? 0.05 : 0.15;
    this.wiperAngle = Math.sin(Date.now() * speed) * 0.8;

    ctx.save();
    ctx.translate(this.width / 2, this.height - 100);
    ctx.rotate(this.wiperAngle);

    ctx.strokeStyle = 'rgba(100, 100, 100, 0.5)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -120);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-30, -100);
    ctx.lineTo(30, -100);
    ctx.stroke();

    ctx.restore();
  }

  drawViolationFlash(active: boolean): void {
    if (active) {
      this.ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      this.ctx.fillRect(0, 0, this.width, this.height);
    }
  }

  updateSignalTimer(): void {
    this.signalBlinkTimer++;
    if (this.signalBlinkTimer >= 60) {
      this.signalBlinkTimer = 0;
    }
  }

  getRoadCenterX(): number {
    return this.roadCenterX;
  }

  getCrosswalkPositions(): number[] {
    return [...this.crosswalkPositions];
  }
}
