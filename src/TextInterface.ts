import type { Application, Context } from './Application';

export class TextInterface {
    context: Context
    characterWidth: number
    characterHeight: number
    charactersForWidth: number
    charactersForHeight: number

    constructor(public app: Application) {
        this.context = this.app.context;
        const characterHeightAndWidth = this.calculateCharacterWidth();
        this.characterWidth = characterHeightAndWidth[0];
        this.characterHeight = characterHeightAndWidth[1];
        this.charactersForWidth = this.howManyCharactersFitWidth();
        this.charactersForHeight = this.howManyCharactersFitHeight();
    }

    calculateCharacterWidth = () => {
        const testElement = document.createElement('span');
        testElement.innerText = ' ';
        testElement.className = 'cell';
        testElement.style.whiteSpace = 'pre';
        testElement.style.visibility = 'hidden';
        testElement.style.position = 'absolute';
        document.body.appendChild(testElement);
        const characterWidth = testElement.offsetWidth;
        const characterHeight = testElement.offsetHeight;
        document.body.removeChild(testElement);
        return [characterWidth, characterHeight]
    }

    resizeGrid = (): void => {
        const characterHeightAndWidth = this.calculateCharacterWidth();
        const charWidth = characterHeightAndWidth[0];
        const charHeight = characterHeightAndWidth[1];
        this.characterWidth = charWidth;
        this.characterHeight = charHeight;
        const charsForWidth = Math.floor(window.innerWidth/charWidth);
        const charsForHeight = Math.floor(window.innerHeight/charHeight);
        this.charactersForHeight = charsForHeight;
        this.charactersForWidth = charsForWidth;
        this.app.context.camera.resize(charsForHeight, charsForWidth);
        this.app.redraw = true;
    }

    howManyCharactersFitWidth = (): number => {
        const viewportWidth = window.innerWidth;
        return Math.floor(viewportWidth / this.characterWidth);
    }

    howManyCharactersFitHeight = (): number => {
        const viewportHeight = window.innerHeight;
        return Math.floor(viewportHeight / this.characterHeight);
    }

    createCell = (char: string, x: number, y: number): HTMLElement => {
        let cell = document.createElement('span');
        cell.className = 'cell';
        cell.innerText = char;
        cell.style.top = (y * this.characterHeight) + 'px';
        cell.style.left = (x * this.characterWidth) + 'px';
        return cell;
    }

    createInvertedCell = (char: string, x: number, y: number): HTMLElement => {
        let cell = document.createElement('span');
        cell.className = 'inverted-cell';
        cell.innerText = char;
        cell.style.top = (y * this.characterHeight) + 'px';
        cell.style.left = (x * this.characterWidth) + 'px';
        return cell;
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
        let grid = document.createDocumentFragment();
        for (let y = 0; y < this.charactersForHeight; y++) {
            for (let x = 0; x < this.charactersForWidth; x++) {

                // Calculate offsets for coordinates
                let vx = x + visible_zone.from_x;
                let vy = y + visible_zone.from_y;

                if(currentTable.existsAt(vx,vy)) {
                    // If the cursor is on the cell, draw it in reverse
                    if (cursor.isUnder(vy,vx)) {
                        grid.appendChild(this.createInvertedCell(currentTable.getCell(vx,vy),x,y));
                    } else {
                        grid.appendChild(this.createCell(currentTable.getCell(vx,vy),x,y));
                    }
                } else if(cursor.isUnder(vy,vx)) {
                    grid.appendChild(this.createCell('█',x,y));
                }
            }
        }
        this.app.last_grid = grid;
        this.app.redraw = false;
        return grid;
    }

}