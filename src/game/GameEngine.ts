import { CarState, InputState, GameState, GameMode, Violation, ViolationType, GAME_WIDTH, GAME_HEIGHT, ROAD_WIDTH, SPEED_LIMIT, MAX_SPEED } from './types';
import { Renderer } from './Renderer';
import { TrafficSystem } from './TrafficSystem';
import { ParkingSystem } from './ParkingSystem';
import { createInitialCarState, updateCarPhysics, getCarCorners, checkSATCollision, checkRoadBounds, wrapPosition, getRectCorners } from './Physics';

export class GameEngine {
  private renderer: Renderer;
  private trafficSystem: TrafficSystem;
  private parkingSystem: ParkingSystem;
  private car: CarState;
  private input: InputState;
  private gameState: GameState;
  private roadCenterX: number;
  private violationFlashTimer: number = 0;
  private lastViolationTime: number = 0;
  private lastRedLightCheck: number = 0;
  private lastSpeedingCheck: number = 0;
  private lastLaneCheck: number = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.renderer = new Renderer(ctx, GAME_WIDTH, GAME_HEIGHT);
    this.roadCenterX = this.renderer.getRoadCenterX();
    this.trafficSystem = new TrafficSystem(this.roadCenterX);
    this.parkingSystem = new ParkingSystem();
    
    this.car = createInitialCarState(
      this.roadCenterX - ROAD_WIDTH / 4,
      GAME_HEIGHT - 80,
      -Math.PI / 2
    );

    this.input = {
      accelerate: false,
      brake: false,
      left: false,
      right: false,
      handbrake: false,
    };

    this.gameState = {
      mode: 'practice',
      score: 100,
      violations: [],
      isPaused: false,
      isGameOver: false,
      timeElapsed: 0,
      parkingStartTime: 0,
      parkingResult: null,
      showResult: false,
    };
  }

  setMode(mode: GameMode): void {
    this.gameState.mode = mode;
    this.reset();
  }

  reset(): void {
    this.car = createInitialCarState(
      this.roadCenterX - ROAD_WIDTH / 4,
      GAME_HEIGHT - 80,
      -Math.PI / 2
    );
    this.input = {
      accelerate: false,
      brake: false,
      left: false,
      right: false,
      handbrake: false,
    };
    this.gameState = {
      ...this.gameState,
      score: 100,
      violations: [],
      isPaused: false,
      isGameOver: false,
      timeElapsed: 0,
      parkingStartTime: Date.now(),
      parkingResult: null,
      showResult: false,
    };
    this.trafficSystem.reset();
    this.parkingSystem.reset();
    this.violationFlashTimer = 0;
    this.lastViolationTime = 0;
  }

  setInput(input: Partial<InputState>): void {
    this.input = { ...this.input, ...input };
  }

  toggleLeftSignal(): void {
    this.car.leftSignal = !this.car.leftSignal;
    if (this.car.leftSignal) this.car.rightSignal = false;
  }

  toggleRightSignal(): void {
    this.car.rightSignal = !this.car.rightSignal;
    if (this.car.rightSignal) this.car.leftSignal = false;
  }

  cycleWiper(): void {
    this.car.wiperLevel = (this.car.wiperLevel + 1) % 3;
  }

  togglePause(): void {
    this.gameState.isPaused = !this.gameState.isPaused;
  }

  update(deltaTime: number): void {
    if (this.gameState.isPaused || this.gameState.isGameOver) return;

    this.gameState.timeElapsed += deltaTime;

    this.car = updateCarPhysics(this.car, this.input, deltaTime);
    this.car = wrapPosition(this.car);

    this.trafficSystem.update(deltaTime);
    this.renderer.updateSignalTimer();

    this.checkCollisions();
    this.checkViolations();

    if (this.violationFlashTimer > 0) {
      this.violationFlashTimer -= deltaTime;
    }

    if (this.gameState.mode === 'exam') {
      this.checkParkingCompletion();
    }
  }

  private checkCollisions(): void {
    const carCorners = getCarCorners(this.car);

    for (const npc of this.trafficSystem.getNPCs()) {
      const npcCorners = getRectCorners({
        x: npc.x,
        y: npc.y,
        width: npc.width,
        height: npc.height,
        angle: npc.angle,
      });

      if (checkSATCollision(carCorners, npcCorners)) {
        this.addViolation('collision', '与其他车辆发生碰撞', 20);
        this.car.speed *= 0.3;
      }
    }

    for (const pedestrian of this.trafficSystem.getPedestrians()) {
      const pedCorners = getRectCorners({
        x: pedestrian.x,
        y: pedestrian.y + 5,
        width: pedestrian.width,
        height: pedestrian.height,
        angle: 0,
      });

      if (checkSATCollision(carCorners, pedCorners)) {
        this.addViolation('collision', '撞到行人', 20);
        this.car.speed *= 0.1;
      }
    }
  }

  private checkViolations(): void {
    const now = Date.now();

    const roadBounds = checkRoadBounds(this.car, this.roadCenterX);
    if (roadBounds.violation && now - this.lastLaneCheck > 2000) {
      this.addViolation('lane_violation', '车辆偏离车道', 10);
      this.lastLaneCheck = now;
    }

    const lightState = this.trafficSystem.getLightStateAtPosition(this.car.y);
    if ((lightState === 'red' || lightState === 'yellow') && 
        Math.abs(this.car.speed) > 0.5 && 
        now - this.lastRedLightCheck > 3000) {
      this.addViolation('red_light', '闯红灯', 15);
      this.lastRedLightCheck = now;
    }

    const speedKmh = Math.abs(this.car.speed) * 20;
    const speedLimitKmh = SPEED_LIMIT * 20;
    if (speedKmh > speedLimitKmh && now - this.lastSpeedingCheck > 2000) {
      this.addViolation('speeding', `超速行驶 (${Math.round(speedKmh)}km/h)`, 10);
      this.lastSpeedingCheck = now;
    }
  }

  private checkParkingCompletion(): void {
    if (this.gameState.showResult) return;

    const isNearParking = this.parkingSystem.isNearParkingArea(this.car);
    
    if (isNearParking && Math.abs(this.car.speed) < 0.1) {
      const timeTaken = Date.now() - this.gameState.parkingStartTime;
      const totalViolationPoints = this.gameState.violations.reduce((sum, v) => sum + v.points, 0);
      
      const result = this.parkingSystem.checkParking(this.car, timeTaken, totalViolationPoints);
      
      if (result.isParked || timeTaken > 120000) {
        this.gameState.parkingResult = result;
        this.gameState.showResult = true;
        this.gameState.isGameOver = true;
      }
    }
  }

  private addViolation(type: ViolationType, message: string, points: number): void {
    const now = Date.now();
    if (now - this.lastViolationTime < 1000) return;

    this.lastViolationTime = now;
    this.violationFlashTimer = 500;

    this.gameState.violations.push({
      type,
      message,
      points,
      timestamp: now,
    });

    this.gameState.score = Math.max(0, this.gameState.score - points);
  }

  render(): void {
    this.renderer.clear();
    this.renderer.drawRoad();

    if (this.gameState.mode === 'exam') {
      this.renderer.drawParkingSpots(this.parkingSystem.getParkingSpots());
    }

    for (const light of this.trafficSystem.getTrafficLights()) {
      this.renderer.drawTrafficLight(light);
    }

    for (const pedestrian of this.trafficSystem.getPedestrians()) {
      this.renderer.drawPedestrian(pedestrian);
    }

    for (const npc of this.trafficSystem.getNPCs()) {
      this.renderer.drawNPCVehicle(npc);
    }

    this.renderer.drawCar(this.car, true);
    this.renderer.drawWiper(this.car.wiperLevel);
    this.renderer.drawViolationFlash(this.violationFlashTimer > 0);
  }

  getCarState(): CarState {
    return { ...this.car };
  }

  getGameState(): GameState {
    return { ...this.gameState };
  }

  getTrafficSystem(): TrafficSystem {
    return this.trafficSystem;
  }

  getParkingSystem(): ParkingSystem {
    return this.parkingSystem;
  }

  getRoadCenterX(): number {
    return this.roadCenterX;
  }

  finishParkingExam(): void {
    if (this.gameState.mode !== 'exam' || this.gameState.showResult) return;

    const timeTaken = Date.now() - this.gameState.parkingStartTime;
    const totalViolationPoints = this.gameState.violations.reduce((sum, v) => sum + v.points, 0);
    const result = this.parkingSystem.checkParking(this.car, timeTaken, totalViolationPoints);
    
    this.gameState.parkingResult = result;
    this.gameState.showResult = true;
    this.gameState.isGameOver = true;
  }
}
