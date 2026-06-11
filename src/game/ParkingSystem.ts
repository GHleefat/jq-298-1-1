import { CarState, ParkingSpot, ParkingResult, PARKING_SPOT_WIDTH, PARKING_SPOT_HEIGHT, GAME_WIDTH, ROAD_WIDTH } from './types';
import { getCarCorners, isFullyInRect, calculateOverhangDistance, normalizeAngle } from './Physics';

const ROAD_CENTER_X = GAME_WIDTH / 2;
const SPOT_X = ROAD_CENTER_X + ROAD_WIDTH / 2 + PARKING_SPOT_WIDTH / 2 + 4;
const PARKED_ANGLE_UP = -Math.PI / 2;
const PARKED_ANGLE_DOWN = Math.PI / 2;

export class ParkingSystem {
  private spots: ParkingSpot[] = [];
  private targetSpotIndex: number = 0;

  constructor() {
    this.initializeParkingSpots();
  }

  private initializeParkingSpots(): void {
    const startY = 120;
    const spacing = PARKING_SPOT_HEIGHT + 10;

    this.spots = [];
    for (let i = 0; i < 4; i++) {
      this.spots.push({
        x: SPOT_X,
        y: startY + i * spacing,
        width: PARKING_SPOT_WIDTH,
        height: PARKING_SPOT_HEIGHT,
        angle: 0,
        isTarget: i === 1,
        isOccupied: i === 0 || i === 2,
      });
    }
    this.targetSpotIndex = 1;
  }

  getParkingSpots(): ParkingSpot[] {
    return this.spots;
  }

  getTargetSpot(): ParkingSpot {
    return this.spots[this.targetSpotIndex];
  }

  checkParking(car: CarState, timeTaken: number, violationPoints: number): ParkingResult {
    const targetSpot = this.getTargetSpot();
    const carCorners = getCarCorners(car);

    const isInBounds = isFullyInRect(carCorners, {
      x: targetSpot.x,
      y: targetSpot.y,
      width: targetSpot.width,
      height: targetSpot.height,
      angle: 0,
    });

    const overhangDistance = calculateOverhangDistance(carCorners, {
      x: targetSpot.x,
      y: targetSpot.y,
      width: targetSpot.width,
      height: targetSpot.height,
      angle: 0,
    });

    const dev1 = Math.abs(normalizeAngle(car.angle - PARKED_ANGLE_UP)) * (180 / Math.PI);
    const dev2 = Math.abs(normalizeAngle(car.angle - PARKED_ANGLE_DOWN)) * (180 / Math.PI);
    const angleDeviation = Math.min(
      Math.min(dev1, 180 - dev1),
      Math.min(dev2, 180 - dev2)
    );

    const dx = car.x - targetSpot.x;
    const dy = car.y - targetSpot.y;
    const centerOffset = Math.sqrt(dx * dx + dy * dy);

    const isParked = isInBounds && Math.abs(car.speed) < 0.1;

    let score = 0;

    if (isInBounds) {
      score += 40;
    } else {
      score += Math.max(0, 40 - overhangDistance * 2);
    }

    if (angleDeviation < 5) {
      score += 20;
    } else if (angleDeviation < 15) {
      score += 10;
    } else if (angleDeviation < 30) {
      score += 5;
    }

    if (centerOffset < 10) {
      score += 20;
    } else if (centerOffset < 30) {
      score += 10;
    } else if (centerOffset < 50) {
      score += 5;
    }

    const timeSeconds = timeTaken / 1000;
    if (timeSeconds < 30) {
      score += 20;
    } else if (timeSeconds < 60) {
      score += 10;
    } else if (timeSeconds < 90) {
      score += 5;
    }

    score = Math.max(0, score - violationPoints);

    let stars: 0 | 1 | 2 | 3 = 0;
    if (score >= 90) stars = 3;
    else if (score >= 70) stars = 2;
    else if (score >= 60) stars = 1;

    return {
      isParked,
      isInBounds,
      overhangDistance,
      angleDeviation,
      centerOffset,
      timeTaken: timeSeconds,
      score,
      stars,
    };
  }

  isNearParkingArea(car: CarState): boolean {
    const targetSpot = this.getTargetSpot();
    const distance = Math.sqrt(
      Math.pow(car.x - targetSpot.x, 2) +
      Math.pow(car.y - targetSpot.y, 2)
    );
    return distance < 150;
  }

  reset(): void {
    this.initializeParkingSpots();
  }
}
