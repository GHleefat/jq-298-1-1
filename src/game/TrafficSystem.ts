import { TrafficLight, Pedestrian, NPCVehicle, GAME_WIDTH, GAME_HEIGHT, ROAD_WIDTH, CAR_WIDTH, CAR_HEIGHT } from './types';

export class TrafficSystem {
  private trafficLights: TrafficLight[] = [];
  private pedestrians: Pedestrian[] = [];
  private npcs: NPCVehicle[] = [];
  private roadCenterX: number;
  private crosswalkPositions: number[];
  private lastPedestrianSpawn: number = 0;
  private lastNPCSpawn: number = 0;

  constructor(roadCenterX: number, crosswalkPositions: number[]) {
    this.roadCenterX = roadCenterX;
    this.crosswalkPositions = crosswalkPositions;
    this.initializeTrafficLights();
    this.initializeNPCs();
  }

  private initializeTrafficLights(): void {
    const halfRoad = ROAD_WIDTH / 2;
    const leftSide = this.roadCenterX - halfRoad - 30;
    const rightSide = this.roadCenterX + halfRoad + 30;
    
    const lightCount = 2 + Math.floor(Math.random() * 2);
    const usedY: number[] = [];
    
    this.trafficLights = [];
    
    for (let i = 0; i < lightCount; i++) {
      let y: number;
      let attempts = 0;
      do {
        y = 150 + Math.random() * 350;
        attempts++;
      } while (usedY.some(uy => Math.abs(uy - y) < 150) && attempts < 10);
      usedY.push(y);
      
      const side = i % 2 === 0 ? leftSide : rightSide;
      const states: ('red' | 'yellow' | 'green')[] = ['red', 'yellow', 'green'];
      const initialState = states[Math.floor(Math.random() * 3)];
      
      this.trafficLights.push({
        x: side,
        y,
        state: initialState,
        timer: Math.random() * 200,
        redDuration: 240 + Math.random() * 180,
        yellowDuration: 50 + Math.random() * 40,
        greenDuration: 240 + Math.random() * 180,
      });
    }
  }

  private initializeNPCs(): void {
    const halfRoad = ROAD_WIDTH / 2;
    const leftLaneX = this.roadCenterX - halfRoad / 2;
    const rightLaneX = this.roadCenterX + halfRoad / 2;

    const npcCount = 2 + Math.floor(Math.random() * 2);
    this.npcs = [];

    for (let i = 0; i < npcCount; i++) {
      const isLeftLane = i % 2 === 0;
      const laneX = isLeftLane ? leftLaneX : rightLaneX;
      const angle = isLeftLane ? -Math.PI / 2 : Math.PI / 2;
      const maxSpeed = 1.2 + Math.random() * 1.5;
      
      this.npcs.push({
        x: laneX + (Math.random() - 0.5) * 30,
        y: Math.random() * GAME_HEIGHT,
        angle,
        speed: maxSpeed * (0.6 + Math.random() * 0.4),
        maxSpeed,
        width: CAR_WIDTH,
        height: CAR_HEIGHT,
        lane: isLeftLane ? 0 : 1,
      });
    }
  }

  update(deltaTime: number): void {
    const dt = deltaTime / 16.67;

    this.trafficLights.forEach(light => {
      light.timer += dt;
      
      if (light.state === 'green' && light.timer >= light.greenDuration) {
        light.state = 'yellow';
        light.timer = 0;
      } else if (light.state === 'yellow' && light.timer >= light.yellowDuration) {
        light.state = 'red';
        light.timer = 0;
      } else if (light.state === 'red' && light.timer >= light.redDuration) {
        light.state = 'green';
        light.timer = 0;
      }
    });

    this.npcs.forEach(npc => {
      npc.y += Math.sin(npc.angle) * npc.speed * dt;
      npc.x += Math.cos(npc.angle) * npc.speed * dt;

      if (npc.y < -50) {
        npc.y = GAME_HEIGHT + 50;
      } else if (npc.y > GAME_HEIGHT + 50) {
        npc.y = -50;
      }

      if (Math.random() < 0.002) {
        npc.speed = npc.maxSpeed * (0.5 + Math.random() * 0.5);
      }
    });

    this.updatePedestrians(dt);
  }

  private updatePedestrians(dt: number): void {
    const now = Date.now();
    
    if (now - this.lastPedestrianSpawn > 5000 && Math.random() < 0.02) {
      this.spawnPedestrian();
      this.lastPedestrianSpawn = now;
    }

    this.pedestrians = this.pedestrians.filter(ped => {
      ped.x += Math.cos(ped.direction) * ped.speed * dt;
      ped.y += Math.sin(ped.direction) * ped.speed * dt;

      return ped.x > -50 && ped.x < GAME_WIDTH + 50 &&
             ped.y > -50 && ped.y < GAME_HEIGHT + 50;
    });
  }

  private spawnPedestrian(): void {
    const crosswalkY = this.crosswalkPositions[Math.floor(Math.random() * this.crosswalkPositions.length)];
    const halfRoad = ROAD_WIDTH / 2;
    
    const fromLeft = Math.random() < 0.5;
    const startX = fromLeft ? this.roadCenterX - halfRoad - 30 : this.roadCenterX + halfRoad + 30;
    const direction = fromLeft ? 0 : Math.PI;

    this.pedestrians.push({
      x: startX,
      y: crosswalkY + (Math.random() - 0.5) * 20,
      speed: 0.8 + Math.random() * 0.5,
      direction,
      onCrosswalk: true,
      width: 12,
      height: 25,
    });
  }

  getTrafficLights(): TrafficLight[] {
    return this.trafficLights;
  }

  getPedestrians(): Pedestrian[] {
    return this.pedestrians;
  }

  getNPCs(): NPCVehicle[] {
    return this.npcs;
  }

  isRedLightAtPosition(y: number): boolean {
    for (const light of this.trafficLights) {
      if (light.state === 'red' || light.state === 'yellow') {
        const distance = Math.abs(y - light.y);
        if (distance < 50) {
          return true;
        }
      }
    }
    return false;
  }

  getLightStateAtPosition(y: number): 'red' | 'yellow' | 'green' | null {
    for (const light of this.trafficLights) {
      const distance = Math.abs(y - light.y);
      if (distance < 50) {
        return light.state;
      }
    }
    return null;
  }

  reset(): void {
    this.initializeTrafficLights();
    this.initializeNPCs();
    this.pedestrians = [];
    this.lastPedestrianSpawn = 0;
  }
}
