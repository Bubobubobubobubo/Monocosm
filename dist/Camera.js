export class Camera {
    constructor(app, y = 50, x = 50) {
        this.app = app;
        this.y = y;
        this.x = x;
        // Resize the camera
        this.resize = (y, x) => {
            this.y = y;
            this.x = x;
        };
        this.getVisibleZone = () => {
            let y = this.app.context.cursor.y;
            let x = this.app.context.cursor.x;
            return {
                'from_x': x - this.x / 2, 'to_x': x + this.x / 2,
                'from_y': y - this.y / 2, 'to_y': y + this.y / 2,
            };
        };
        this.getVisibleZoneToString = () => {
            let zone = this.getVisibleZone();
            return `${zone.from_x},${zone.to_x},${zone.from_y},${zone.to_y}`;
        };
        this.y = y;
        this.x = x;
    }
}
