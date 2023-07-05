import type { Application, Context } from './Application';

export class TextInterface {
    context: Context

    constructor(public app: Application) {
        this.context = this.app.context;
    }

    resizeGrid = (): void => {
        this.app.context.camera.resize(
            this.howManyCharactersFitHeight(), 
            this.howManyCharactersFitWidth()
        );
        this.app.redraw = true;
    }

    howManyCharactersFitWidth = (): number => {
        const testElement = document.createElement('span');
        testElement.innerText = 'X';
        testElement.className = 'cell';
        testElement.style.visibility = 'hidden';
        testElement.style.position = 'absolute';
        document.body.appendChild(testElement);
        const characterWidth = testElement.offsetWidth;
        const viewportWidth = window.innerWidth;
        document.body.removeChild(testElement);
        return Math.floor(viewportWidth / characterWidth);
    }

    howManyCharactersFitHeight = (): number => {
        const testElement = document.createElement('span');
        testElement.innerText = 'X';
        testElement.className = 'cell';
        testElement.style.visibility = 'hidden';
        testElement.style.position = 'absolute';
        document.body.appendChild(testElement);
        const characterHeight = testElement.offsetHeight;
        const viewportHeight = window.innerHeight;
        document.body.removeChild(testElement);
        return Math.floor(viewportHeight / characterHeight);
    }

    drawCharacter = (char: string, color: string, background: string) => {
        return `<span class="cell" style="color:${color};background:${background}">${char}</span>`
    }

    drawCursor = (color: string, background: string): string => {
        return `<span class="cell" style="color:${color};background:${background}">█</span>`
    }

    drawGrid = (context: Context): string => {
        if (!this.app.redraw) { return this.app.last_grid; }
        let visible_zone = context.camera.getVisibleZone();
        let grid = [];
        for (let y = visible_zone.from_y; y < visible_zone.to_y; y++) {
            for (let x = visible_zone.from_x; x < visible_zone.to_x; x++) {
                if(context.tables[context.current_table].existsAt(x,y)) {
                    // If the cursor is on the cell, draw it in reverse
                    if (context.cursor.isUnder(y,x)) {
                        grid.push(this.drawCharacter(context.tables[context.current_table]
                            .getCell(x,y), 'black', 'white'));
                    } else {
                        grid.push(this.drawCharacter(context.tables[context.current_table]
                            .getCell(x,y), 'white', 'black'));
                    }
                } else if(context.cursor.isUnder(y,x)) {
                    grid.push(this.drawCursor('white', 'black'));
                } 
                else {
                    grid.push(this.drawCharacter('.', 'grey', 'black'));
                }
            }
            grid.push('<br>');
        }
        this.app.last_grid = grid.join("");
        this.app.redraw = false;
        return this.app.last_grid;
    }

}