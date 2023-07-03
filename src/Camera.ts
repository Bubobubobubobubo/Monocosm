import type { VisibleZone, Application } from './Application.js';

export class Camera {
    constructor(public app: Application, public y: number = 50, public x: number = 50) {
        this.y = y;
        this.x = x;
    }

    // Resize the camera
    resize = (y: number, x: number) => {
        this.y = y;
        this.x = x;
    }

    getVisibleZone = (): VisibleZone => {
        let y = this.app.context.cursor.y; let x = this.app.context.cursor.x; 
        return {
            'from_x': x - this.x / 2, 'to_x': x + this.x / 2,
            'from_y': y - this.y / 2, 'to_y': y + this.y / 2,
        }
    }

    getVisibleZoneToString = (): string => {
        let zone = this.getVisibleZone();
        return `${zone.from_x},${zone.to_x},${zone.from_y},${zone.to_y}`;
    }
}