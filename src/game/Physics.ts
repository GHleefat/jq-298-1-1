import { CarState, InputState, Rect, GAME_WIDTH, GAME_HEIGHT, ROAD_WIDTH, MAX_SPEED, ACCELERATION, BRAKE_FORCE, FRICTION, TURN_RATE } from './types';

export function createInitialCarState(x: number, y: number, angle: number): CarState {
  return {
    x,
    y,
    angle,
    speed: 0,
    maxSpeed: MAX_SPEED,
    acceleration: ACCELERATION,
    brakeForce: BRAKE_FORCE,
    friction: FRICTION,
    turnRate: TURN_RATE,
    width: 30,
    height: 60,
    leftSignal: false,
    rightSignal: false,
    wiperLevel: 0,
    brakeLight: false,
    handbrake: false,
  };
}

export function updateCarPhysics(
  car: CarState,
  input: InputState,
  deltaTime: number
): CarState {
  const dt = deltaTime / 16.67;
  let { speed, angle, x, y, brakeLight } = car;

  if (input.handbrake) {
    speed *= 0.9;
    brakeLight = true;
  } else {
    if (input.accelerate) {
      speed += car.acceleration * dt;
    }
    if (input.brake) {
      if (speed > 0) {
        speed -= car.brakeForce * dt;
      } else if (speed < 0) {
        speed += car.brakeForce * dt;
      } else {
        speed -= car.acceleration * 0.5 * dt;
      }
      brakeLight = true;
    } else {
      brakeLight = false;
    }

    speed *= car.friction;
  }

  speed = Math.max(-car.maxSpeed * 0.5, Math.min(car.maxSpeed, speed));

  if (Math.abs(speed) > 0.05) {
    const steerDirection = input.left ? -1 : input.right ? 1 : 0;
    const steerAmount = car.turnRate * steerDirection * (speed > 0 ? 1 : -1) * dt;
    angle += steerAmount;
  }

  x += Math.cos(angle) * speed * dt;
  y += Math.sin(angle) * speed * dt;

  return {
    ...car,
    x,
    y,
    angle,
    speed,
    brakeLight,
    handbrake: input.handbrake,
  };
}

export function getCarCorners(car: CarState): { x: number; y: number }[] {
  const halfW = car.width / 2;
  const halfH = car.height / 2;
  const rotatedAngle = car.angle + Math.PI / 2;
  const cos = Math.cos(rotatedAngle);
  const sin = Math.sin(rotatedAngle);

  const corners = [
    { x: -halfW, y: -halfH },
    { x: halfW, y: -halfH },
    { x: halfW, y: halfH },
    { x: -halfW, y: halfH },
  ];

  return corners.map(c => ({
    x: car.x + c.x * cos - c.y * sin,
    y: car.y + c.x * sin + c.y * cos,
  }));
}

export function getRectCorners(rect: Rect): { x: number; y: number }[] {
  const halfW = rect.width / 2;
  const halfH = rect.height / 2;
  const cos = Math.cos(rect.angle);
  const sin = Math.sin(rect.angle);

  const corners = [
    { x: -halfW, y: -halfH },
    { x: halfW, y: -halfH },
    { x: halfW, y: halfH },
    { x: -halfW, y: halfH },
  ];

  return corners.map(c => ({
    x: rect.x + c.x * cos - c.y * sin,
    y: rect.y + c.x * sin + c.y * cos,
  }));
}

function getAxes(corners: { x: number; y: number }[]): { x: number; y: number }[] {
  const axes = [];
  for (let i = 0; i < corners.length; i++) {
    const p1 = corners[i];
    const p2 = corners[(i + 1) % corners.length];
    const edge = { x: p2.x - p1.x, y: p2.y - p1.y };
    const length = Math.sqrt(edge.x * edge.x + edge.y * edge.y);
    axes.push({ x: -edge.y / length, y: edge.x / length });
  }
  return axes;
}

function projectCorners(
  corners: { x: number; y: number }[],
  axis: { x: number; y: number }
): { min: number; max: number } {
  let min = Infinity;
  let max = -Infinity;
  for (const corner of corners) {
    const projection = corner.x * axis.x + corner.y * axis.y;
    min = Math.min(min, projection);
    max = Math.max(max, projection);
  }
  return { min, max };
}

export function checkSATCollision(
  corners1: { x: number; y: number }[],
  corners2: { x: number; y: number }[]
): boolean {
  const axes1 = getAxes(corners1);
  const axes2 = getAxes(corners2);
  const allAxes = [...axes1, ...axes2];

  for (const axis of allAxes) {
    const proj1 = projectCorners(corners1, axis);
    const proj2 = projectCorners(corners2, axis);
    if (proj1.max < proj2.min || proj2.max < proj1.min) {
      return false;
    }
  }
  return true;
}

export function checkRoadBounds(
  car: CarState,
  roadCenterX: number
): { inBounds: boolean; violation: boolean } {
  const halfRoad = ROAD_WIDTH / 2;
  const halfCar = car.width / 2;
  const carLeft = car.x - halfCar;
  const carRight = car.x + halfCar;
  const roadLeft = roadCenterX - halfRoad;
  const roadRight = roadCenterX + halfRoad;

  const inBounds = carLeft >= roadLeft && carRight <= roadRight;
  const violation = carLeft < roadLeft - 5 || carRight > roadRight + 5;

  return { inBounds, violation };
}

export function isPointInRect(
  px: number,
  py: number,
  rect: Rect
): boolean {
  const cos = Math.cos(-rect.angle);
  const sin = Math.sin(-rect.angle);
  const dx = px - rect.x;
  const dy = py - rect.y;
  const localX = dx * cos - dy * sin;
  const localY = dx * sin + dy * cos;

  return (
    Math.abs(localX) <= rect.width / 2 &&
    Math.abs(localY) <= rect.height / 2
  );
}

export function isFullyInRect(
  carCorners: { x: number; y: number }[],
  rect: Rect
): boolean {
  return carCorners.every(corner => isPointInRect(corner.x, corner.y, rect));
}

export function calculateOverhangDistance(
  carCorners: { x: number; y: number }[],
  rect: Rect
): number {
  let maxDistance = 0;
  const cos = Math.cos(-rect.angle);
  const sin = Math.sin(-rect.angle);

  for (const corner of carCorners) {
    const dx = corner.x - rect.x;
    const dy = corner.y - rect.y;
    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;

    const halfW = rect.width / 2;
    const halfH = rect.height / 2;

    if (Math.abs(localX) > halfW) {
      maxDistance = Math.max(maxDistance, Math.abs(localX) - halfW);
    }
    if (Math.abs(localY) > halfH) {
      maxDistance = Math.max(maxDistance, Math.abs(localY) - halfH);
    }
  }
  return maxDistance;
}

export function normalizeAngle(angle: number): number {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
}

export function wrapPosition(car: CarState): CarState {
  let { x, y } = car;
  
  if (y < -50) y = GAME_HEIGHT + 50;
  if (y > GAME_HEIGHT + 50) y = -50;
  if (x < -50) x = GAME_WIDTH + 50;
  if (x > GAME_WIDTH + 50) x = -50;

  return { ...car, x, y };
}
