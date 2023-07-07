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

    createCell = (char: string): HTMLElement => {
        let cell = document.createElement('span');
        cell.className = 'cell';
        cell.innerText = char;
        return cell;
    }

    createInvertedCell = (char: string): HTMLElement => {
        let cell = document.createElement('span');
        cell.className = 'reversed-cell';
        cell.innerText = char;
        return cell;
    }

    createEmptyCell = (): HTMLElement => {
        let cell = document.createElement('span')
        cell.className = 'cell'
        cell.innerText = ' '
        return cell
    }

    createCursor = (): HTMLElement => {
        let cell = document.createElement('span');
        cell.className = 'cell';
        cell.innerText = '█';
        return cell;
    }

    createRow = (rowNumber: number): HTMLElement => {
        let row = document.createElement('span');
        row.className = 'row';
        row.id = 'row_'+rowNumber;
        return row;
    }

    loadTheme = (theme: string) => {
        document.documentElement.className = "theme-"+theme;
    }

    setTheme = (theme: string) => {
        this.app.context.tables[this.app.context.current_table].theme = theme;
        this.app.interface?.loadTheme(theme);
    }

    createGrid = (): DocumentFragment | null => {
        if (!this.app.redraw) { return this.app.last_grid; }
        const currentTable = this.app.getCurrentTable();
        const cursor = this.app.getCursor();
        const visible_zone = this.app.getVisibleZone();
        let emptyCell = this.createEmptyCell();
        let row = 0;
        let grid = document.createDocumentFragment();
        for (let y = visible_zone.from_y; y < visible_zone.to_y; y++) {
            let rowElement = this.createRow(row++);
            for (let x = visible_zone.from_x; x < visible_zone.to_x; x++) {
                if(currentTable.existsAt(x,y)) {
                    // If the cursor is on the cell, draw it in reverse
                    if (cursor.isUnder(y,x)) {
                        rowElement.appendChild(this.createInvertedCell(currentTable.getCell(x,y)));
                    } else {
                        rowElement.appendChild(this.createCell(currentTable.getCell(x,y)));
                    }
                } else if(cursor.isUnder(y,x)) {
                    rowElement.appendChild(this.createCursor());
                } 
                else {
                    if (y % 5 == 0 && x % 5 == 0) {
                        rowElement.appendChild(this.createCell('·'));
                    } else {
                        rowElement.appendChild(emptyCell.cloneNode(true));
                    }
                }
            }
            grid.appendChild(rowElement);
        }
        this.app.last_grid = grid;
        this.app.redraw = false;
        return grid;
    }

}