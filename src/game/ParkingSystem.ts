import { CarState, ParkingSpot, ParkingResult, PARKING_SPOT_WIDTH, PARKING_SPOT_HEIGHT, GAME_WIDTH } from './types';
import { getCarCorners, isFullyInRect, calculateOverhangDistance, normalizeAngle } from './Physics';

export class ParkingSystem {
  private spots: ParkingSpot[] = [];
  private targetSpotIndex: number = 0;

  constructor() {
    this.initializeParkingSpots();
  }

  private initializeParkingSpots(): void {
    const spotX = GAME_WIDTH - 80;
    const startY = 150;
    const spacing = 85;

    this.spots = [];
    for (let i = 0; i < 4; i++) {
      this.spots.push({
        x: spotX,
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
      angle: targetSpot.angle,
    });

    const overhangDistance = calculateOverhangDistance(carCorners, {
      x: targetSpot.x,
      y: targetSpot.y,
      width: targetSpot.width,
      height: targetSpot.height,
      angle: targetSpot.angle,
    });

    const angleDeviation = Math.abs(normalizeAngle(car.angle - targetSpot.angle)) * (180 / Math.PI);
    const normalizedAngle = Math.min(angleDeviation, 180 - angleDeviation);

    const dx = car.x - targetSpot.x;
    const dy = car.y - targetSpot.y;
    const cos = Math.cos(-targetSpot.angle);
    const sin = Math.sin(-targetSpot.angle);
    const localX = dx * cos - dy * sin;
    const localY = dx * sin + dy * cos;
    const centerOffset = Math.sqrt(localX * localX + localY * localY);

    const isParked = isInBounds && Math.abs(car.speed) < 0.1;

    let score = 0;

    if (isInBounds) {
      score += 40;
    } else {
      score += Math.max(0, 40 - overhangDistance * 2);
    }

    if (normalizedAngle < 5) {
      score += 20;
    } else if (normalizedAngle < 15) {
      score += 10;
    } else if (normalizedAngle < 30) {
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
      angleDeviation: normalizedAngle,
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
