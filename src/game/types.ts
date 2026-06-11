export interface CarState {
  x: number;
  y: number;
  angle: number;
  speed: number;
  maxSpeed: number;
  acceleration: number;
  brakeForce: number;
  friction: number;
  turnRate: number;
  width: number;
  height: number;
  leftSignal: boolean;
  rightSignal: boolean;
  wiperLevel: number;
  brakeLight: boolean;
  handbrake: boolean;
}

export interface InputState {
  accelerate: boolean;
  brake: boolean;
  left: boolean;
  right: boolean;
  handbrake: boolean;
}

export type GameMode = 'menu' | 'practice' | 'exam';

export type ViolationType = 'red_light' | 'collision' | 'speeding' | 'lane_violation' | 'no_signal' | 'parking_out';

export interface Violation {
  type: ViolationType;
  message: string;
  points: number;
  timestamp: number;
}

export type TrafficLightState = 'red' | 'yellow' | 'green';

export interface TrafficLight {
  x: number;
  y: number;
  state: TrafficLightState;
  timer: number;
  redDuration: number;
  yellowDuration: number;
  greenDuration: number;
}

export interface Pedestrian {
  x: number;
  y: number;
  speed: number;
  direction: number;
  onCrosswalk: boolean;
  width: number;
  height: number;
}

export interface NPCVehicle {
  x: number;
  y: number;
  angle: number;
  speed: number;
  maxSpeed: number;
  width: number;
  height: number;
  lane: number;
}

export interface ParkingSpot {
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  isTarget: boolean;
  isOccupied: boolean;
}

export interface ParkingResult {
  isParked: boolean;
  isInBounds: boolean;
  overhangDistance: number;
  angleDeviation: number;
  centerOffset: number;
  timeTaken: number;
  score: number;
  stars: 0 | 1 | 2 | 3;
}

export interface GameState {
  mode: GameMode;
  score: number;
  violations: Violation[];
  isPaused: boolean;
  isGameOver: boolean;
  timeElapsed: number;
  parkingStartTime: number;
  parkingResult: ParkingResult | null;
  showResult: boolean;
}

export interface RoadSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  hasCrosswalk: boolean;
  crosswalkX?: number;
}

export interface LaneMarker {
  x: number;
  y: number;
  angle: number;
  length: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
}

export const GAME_WIDTH = 900;
export const GAME_HEIGHT = 600;
export const ROAD_WIDTH = 200;
export const CAR_WIDTH = 30;
export const CAR_HEIGHT = 60;
export const PARKING_SPOT_WIDTH = 40;
export const PARKING_SPOT_HEIGHT = 75;
export const MAX_SPEED = 5;
export const ACCELERATION = 0.15;
export const BRAKE_FORCE = 0.3;
export const FRICTION = 0.98;
export const TURN_RATE = 0.05;
export const SPEED_LIMIT = 3;
