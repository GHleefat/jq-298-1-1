import { TrafficLight, Pedestrian, NPCVehicle, GAME_WIDTH, GAME_HEIGHT, ROAD_WIDTH, CAR_WIDTH, CAR_HEIGHT } from './types';

export class TrafficSystem {
  private trafficLights: TrafficLight[] = [];
  private pedestrians: Pedestrian[] = [];
  private npcs: NPCVehicle[] = [];
  private roadCenterX: number;
  private lastPedestrianSpawn: number = 0;
  private lastNPCSpawn: number = 0;

  constructor(roadCenterX: number) {
    this.roadCenterX = roadCenterX;
    this.initializeTrafficLights();
    this.initializeNPCs();
  }

  private initializeTrafficLights(): void {
    this.trafficLights = [
      {
        x: this.roadCenterX - ROAD_WIDTH / 2 - 30,
        y: 300,
        state: 'green',
        timer: 0,
        redDuration: 300,
        yellowDuration: 60,
        greenDuration: 300,
      },
      {
        x: this.roadCenterX + ROAD_WIDTH / 2 + 30,
        y: 550,
        state: 'red',
        timer: 0,
        redDuration: 300,
        yellowDuration: 60,
        greenDuration: 300,
      },
    ];
  }

  private initializeNPCs(): void {
    const halfRoad = ROAD_WIDTH / 2;
    const leftLaneX = this.roadCenterX - halfRoad / 2;
    const rightLaneX = this.roadCenterX + halfRoad / 2;

    this.npcs = [
      {
        x: leftLaneX,
        y: 200,
        angle: -Math.PI / 2,
        speed: 1.5,
        maxSpeed: 2,
        width: CAR_WIDTH,
        height: CAR_HEIGHT,
        lane: 0,
      },
      {
        x: rightLaneX,
        y: 450,
        angle: Math.PI / 2,
        speed: 1.8,
        maxSpeed: 2.5,
        width: CAR_WIDTH,
        height: CAR_HEIGHT,
        lane: 1,
      },
    ];
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
    const crosswalks = [300, 550];
    const crosswalkY = crosswalks[Math.floor(Math.random() * crosswalks.length)];
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
