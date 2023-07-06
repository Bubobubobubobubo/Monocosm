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
        const characterWidth = testElement.offsetWidth+0.05;
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

    drawCharacter = (char: string) => {
        return `<span class="cell">${char}</span>`
    }

    drawReversedCharacter = (char: string) => {
        return `<span class="reversed-cell">${char}</span>`
    }

    drawCursor = (): string => {
        return `<span class="cell">█</span>`
    }

    startRow = (row: number): string => {
        return `<span class="row" id="row_${row}">`;
    }

    endRow = (): string => {
        return '</span>';
    }

    loadTheme = (theme: string) => {
        document.documentElement.className = "theme-"+theme;
    }

    setTheme = (theme: string) => {
        this.app.context.tables[this.app.context.current_table].theme = theme;
        this.app.interface?.loadTheme(theme);
    }

    drawGrid = (context: Context): string => {
        if (!this.app.redraw) { return this.app.last_grid; }
        let visible_zone = context.camera.getVisibleZone();
        let grid = [];
        let row = 0;
        for (let y = visible_zone.from_y; y < visible_zone.to_y; y++) {
            grid.push(this.startRow(row++));
            for (let x = visible_zone.from_x; x < visible_zone.to_x; x++) {
                if(context.tables[context.current_table].existsAt(x,y)) {
                    // If the cursor is on the cell, draw it in reverse
                    if (context.cursor.isUnder(y,x)) {
                        grid.push(this.drawReversedCharacter(context.tables[context.current_table].getCell(x,y)));
                    } else {
                        grid.push(this.drawCharacter(context.tables[context.current_table].getCell(x,y)));
                    }
                } else if(context.cursor.isUnder(y,x)) {
                    grid.push(this.drawCursor());
                } 
                else {
                    if (y % 5 == 0 && x % 5 == 0) {
                        grid.push(this.drawCharacter('·'));
                    } else {
                        grid.push(this.drawCharacter(' '));
                    }
                }
            }
            grid.push(this.endRow());
        }
        this.app.last_grid = grid.join("");
        this.app.redraw = false;
        return this.app.last_grid;
    }

}