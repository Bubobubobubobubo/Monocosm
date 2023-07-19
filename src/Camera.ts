import type { Application } from './Application.js';
import { VisibleZone } from './Types.js';

export class Camera {

    public x: number = 50
    public y: number = 50

    constructor(public app: Application, x: number = 50, y: number = 50) {
        this.app = app;
        this.y = y;
        this.x = x;
    }

    // Resize the camera
    resize = (x: number, y: number): void => {
        this.y = y;
        this.x = x;
    }

    getVisibleZone = (): VisibleZone => {
        let x = this.app.context.cursor.getX();
        let y = this.app.context.cursor.getY(); 
        return {
            'from_x': x - Math.floor(this.x / 2), 'to_x': x + Math.floor(this.x / 2),
            'from_y': y - Math.floor(this.y / 2), 'to_y': y + Math.floor(this.y / 2),
        }
    }

    getVisibleZoneToString = (): string => {
        let zone = this.getVisibleZone();
        return `${zone.from_x},${zone.to_x},${zone.from_y},${zone.to_y}`;
    }
}