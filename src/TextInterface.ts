import type { Application } from './Application';
import type { Context, Script } from './Types.js';
import { EditorView } from "codemirror"
import { editorSetup } from './EditorSetup.js';
import { ActionArea } from './Crawler.js';

export class TextInterface {

    localEditor: EditorView
    globalEditor: EditorView
    context: Context
    characterWidth: number
    characterHeight: number
    charactersForWidth: number
    charactersForHeight: number
    pasteFromClipboard: string | undefined = undefined

    constructor(public app: Application) {
        this.context = this.app.context;
        const characterHeightAndWidth = this.calculateCharacterWidth();
        this.characterWidth = characterHeightAndWidth[0];
        this.characterHeight = characterHeightAndWidth[1];
        this.charactersForWidth = this.howManyCharactersFitWidth();
        this.charactersForHeight = this.howManyCharactersFitHeight();
        this.localEditor = new EditorView({
            extensions: [
                editorSetup,
                EditorView.updateListener.of((e) => {
                    this.app.getCurrentTable().script.temporary_code = e.state.doc.toString();
                })
            ],
            parent: undefined
        })

        // TODO: use a different style for the mainScript editor!
        this.globalEditor = new EditorView({
            extensions: [
                editorSetup,
                EditorView.updateListener.of((e) => {
                    this.app.context.mainScript.temporary_code = e.state.doc.toString();
                })
            ],
            parent: undefined
        })

        this.scaleBackgroundGrid();
    }

    loadScript = (script: Script, editor: string = 'local') => {
        const selectedEditor = editor == 'local' ? this.localEditor : this.globalEditor;
        selectedEditor.dispatch({
            changes: {
                from: 0,
                to: selectedEditor.state.doc.length,
                insert: script.committed_code
            }
        })
    }

    clearEditor = (editor: string = 'local') => {
        const selectedEditor = editor == 'local' ? this.localEditor : this.globalEditor;
        selectedEditor.dispatch({
            changes: {
                from: 0,
                to: selectedEditor.state.doc.length,
                insert: ''
            }
        })
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
        this.app.context.camera.resize(charsForWidth, charsForHeight);
        this.app.redraw = true;
        this.scaleBackgroundGrid();
        this.reTransformGrid();
    }

    scaleBackgroundGrid = (): void => {
        document.body.style.backgroundSize = Math.floor(this.characterWidth*5) + 'px' + ' ' + Math.floor(this.characterHeight*5) + 'px';
    }

    howManyCharactersFitWidth = (): number => {
        const viewportWidth = window.innerWidth;
        return Math.floor(viewportWidth / this.characterWidth);
    }

    howManyCharactersFitHeight = (): number => {
        const viewportHeight = window.innerHeight;
        return Math.floor(viewportHeight / this.characterHeight);
    }

    createCell = (char: string, x: number, y: number, className: string = 'cell'): HTMLElement => {
        let cell = document.createElement('span');
        cell.className = className;
        cell.innerText = char;
        cell.id = x + "," + y;
        const offset_x = x * this.characterWidth + Math.floor(this.charactersForWidth/2) * this.characterWidth;
        const offset_y = y * this.characterHeight + Math.floor(this.charactersForHeight/2) * this.characterHeight;
        cell.style.transform = 'translate(' + offset_x + 'px,' + offset_y + 'px)';
        return cell;
    }

    createActionAreaCell = (char: string, x: number, y: number): HTMLElement => {
        let cell = document.createElement('span');
        cell.className = 'action-area-cell';
        cell.innerText = char;
        const offset_x = x * this.characterWidth + Math.floor(this.charactersForWidth/2) * this.characterWidth;
        const offset_y = y * this.characterHeight + Math.floor(this.charactersForHeight/2) * this.characterHeight;
        cell.style.transform = 'translate(' + offset_x + 'px,' + offset_y + 'px)';
        return cell;
    }

    createCursor = (): HTMLElement => {
        let cell = this.app.cursorElement;
        const offset_x = Math.floor(this.charactersForWidth/2) * this.characterWidth;
        const offset_y = Math.floor(this.charactersForHeight/2) * this.characterHeight;
        cell.style.transform = 'translate(' + offset_x + 'px,' + offset_y + 'px)';

        cell.style.width = this.characterWidth + 'px';
        cell.style.height = this.characterHeight + 'px';

        // Add a listener for pasting
        cell.addEventListener('paste', (e) => {
            this.pasteFromClipboard = e.clipboardData?.getData('text/plain');
            this.app.getCurrentTable().paste();
            e.preventDefault();
            //this.app.redraw = true;
        });

        // Prevent other input to cursor
        cell.addEventListener('keypress', (e) => {
            e.preventDefault();
        })

        cell.focus();
        return cell;
    }

    reTransformGrid = () => {
        // Calculate new center position for cursor
        this.updateCursorPosition();
        // Calculate new positions for the cells
        this.updateCellPositions();
    }

    updateCursorPosition = () => {
        let cursor = this.app.getCursor();
        let cell = this.app.cursorElement;
        const x = Math.floor(this.charactersForWidth/2) ;
        const y = Math.floor(this.charactersForHeight/2);
        const offset_x = x * this.characterWidth;
        const offset_y = y * this.characterHeight;
        cursor.setXY(x,y);
        cell.style.transform = 'translate(' + offset_x + 'px,' + offset_y + 'px)';
    }

    updateCellPositions = () => {
        let allElements = this.app.gridElement.getElementsByTagName('span');
        for(let elem of allElements) {
            let [x, y] = elem.id.split(",");
            const offset_x = parseInt(x) * this.characterWidth + Math.floor(this.charactersForWidth/2) * this.characterWidth;
            const offset_y = parseInt(y) * this.characterHeight + Math.floor(this.charactersForHeight/2) * this.characterHeight;
            elem.style.transform = 'translate(' + offset_x + 'px,' + offset_y + 'px)';
        }
    }

    setCursorXSize  = (xSize: number) => {
        this.app.cursorElement.style.width = xSize * this.characterWidth + "px";
        this.invertCellsUnderCursor();
        this.normalizeCells(undefined,undefined)
    }

    setCursorYSize = (ySize: number) => {
        this.app.cursorElement.style.height = ySize * this.characterHeight + "px";
        this.invertCellsUnderCursor();
        this.normalizeCells(undefined,undefined)
    }

    setCursorSize = (xSize: number, ySize: number) => {
        this.app.cursorElement.style.width = xSize * this.characterWidth + "px";
        this.app.cursorElement.style.height = ySize * this.characterHeight + "px";
        this.invertCellsUnderCursor();
        this.normalizeCells(undefined,undefined)
    }

    updateCursorSize = () => {
        const cursor = this.app.getCursor();
        this.app.cursorElement.style.width = cursor.getXSize() * this.characterWidth + "px";
        this.app.cursorElement.style.height = cursor.getYSize() * this.characterHeight + "px";
    }

    createActionArea = (area: ActionArea) => {
        const from_x = area.x;
        const from_y = area.y;
        const to_x = from_x + area.x_size-1;
        const to_y = from_y + area.y_size-1;   
        for(let y=from_y;y<=to_y; y++) {
            for(let x=from_x;x<=to_x;x++) {
                let cell = document.getElementById(x+","+y);
                if(cell) {
                    cell.className = "action-area-cell";
                } else {
                    this.appendCell(' ',x,y,'action-area-cell')
                }
            }
        }
    }

    invertCellsUnderCursor = () => {
        const cursor = this.app.getCursor();
        const from_x = cursor.getX();
        const from_y = cursor.getY();
        const to_x = from_x + cursor.getXSize()-1;
        const to_y = from_y + cursor.getYSize()-1;
        for(let y=from_y; y <= to_y; y++) {
            for(let x=from_x; x <= to_x; x++) {
                let cell = document.getElementById(x+","+y);
                if(cell && cell.className!='action-area-cell') {
                    cell.className = "inverted-cell";
                }
            }
        }
    }

    normalizeCells = (from_x: number|undefined, from_y: number|undefined, to_x: number|undefined = undefined, to_y: number|undefined = undefined) => {
        const cursor = this.app.getCursor();
        if(from_x==undefined) { from_x = cursor.getX() }
        if(from_y==undefined) { from_y = cursor.getY() }
        if(to_x==undefined) { to_x = cursor.getXSize() }
        if(to_y==undefined) { to_y = cursor.getYSize() }
        to_x = from_x + to_x;
        to_y = from_y + to_y;
        for(let y=from_y; y <= to_y; y++) {
            for(let x=from_x; x <= to_x; x++) {
                let cell = document.getElementById(x+","+y);
                if(cell && cell.className!='action-area-cell' && !cursor.isUnder(x,y)) {
                    cell.className = "cell";
                }
            }
        }
    }

    appendCell = (content: string, x: number, y: number, className: string = 'cell'): void => {
        let cell = this.createCell(content, x, y, className);
        // If span with the same id exists replace it else append it
        let existingCell = document.getElementById(cell.id);
        if (existingCell) {
            existingCell.replaceWith(cell);
        }
        else {
            this.app.gridElement.appendChild(cell);
        }
    }

    focusCursor = () => {
        const cursor = document.getElementById('cursor');
        cursor?.focus();
    }

    clearPasteFromBrowser = () => {
        this.pasteFromClipboard = undefined;
    }

    setPasteFromBrowser = (text: string) => {
        this.pasteFromClipboard = text;
    }

    loadTheme = (theme: string) => {
        document.documentElement.className = "theme-"+theme;
    }
    
    loadUniverse = (name: string) => {
        if (name in this.app.context.tables) { 
            this.app.context.current_table = name;
            this.app.interface?.loadTheme(this.app.context.tables[name].theme);
            this.app.interface?.loadScript(this.app.context.tables[name].script)
            this.app.replaceGrid = true;
        }
    }

    setTheme = (theme: string) => {
        this.app.context.tables[this.app.context.current_table].theme = theme;
        this.app.interface?.loadTheme(theme);
    }

    createWholeGrid = (): DocumentFragment => {
        // Get all cells
        const currentTable = this.app.getCurrentTable();
        let grid = document.createDocumentFragment();
        const cells = currentTable.cells;
        const actionAreas = currentTable.actionAreas;

        // Loop all items in object
        for (let key in cells) {
            const coord = key.split(',');
            let cell = this.createCell(cells[key], parseInt(coord[0]), parseInt(coord[1]));
            grid.appendChild(cell);
        }

        for (let area in actionAreas) {
            this.createActionArea(actionAreas[area]);
        }

        this.app.replaceGrid = false
        return grid;
    }

    moveGrid = (oldX: number|undefined = undefined, oldY: number|undefined = undefined, oldXSize: number|undefined = undefined, oldYSize: number|undefined = undefined) => {
        const cursor = this.app.getCursor();
        // Offset cursor x and y with window.innerWidth and window.innerHeight
        const x = cursor.getX();
        const y = cursor.getY();
        const xp = -x * this.characterWidth - (cursor.getXSize()*this.characterWidth)/2
        const yp = -y * this.characterHeight - (cursor.getYSize()*this.characterHeight)/2

        // Move grid
        this.app.gridElement.style.transform = 'translate(' + xp + 'px,' + yp + 'px)';

        // Move background
        document.body.style.backgroundPositionX = xp + "px";
        document.body.style.backgroundPositionY = yp + "px";

        this.offsetCursor();

        this.normalizeCells(oldX, oldY, oldXSize, oldYSize);
        this.invertCellsUnderCursor();
    }

    offsetCursor = () => {
        let cursor = this.app.getCursor();
        let cell = this.app.cursorElement;
        const x = Math.floor(this.charactersForWidth/2);
        const y = Math.floor(this.charactersForHeight/2);
        const offset_x = x * this.characterWidth-(cursor.getXSize()*this.characterWidth)/2;
        const offset_y = y * this.characterHeight-(cursor.getYSize()*this.characterHeight)/2;
        cell.style.transform = 'translate(' + offset_x + 'px,' + offset_y + 'px)';
    }

    removeCellFromGrid = (id: string) => {
        let cell = document.getElementById(id)
        if(cell) {
            cell.remove();
        }
    }

    // TODO: Remove this (Not in use)
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
                    if (cursor.isUnder(vx,vy)) {
                        grid.appendChild(this.createCell(currentTable.getCell(vx,vy),x,y, "inverted-cell"));
                    } else {
                        grid.appendChild(this.createCell(currentTable.getCell(vx,vy),x,y));
                    }
                } /* else if(cursor.isUnder(vx,vy)) {
                    grid.appendChild(this.createCursor(x,y));
                } */

                // Drawing zones
                if(currentTable.actionAreaAt(vx, vy)) {
                    let cell = currentTable.getCell(vx,vy)
                    if (cell == "") {
                        grid.appendChild(this.createActionAreaCell(" ",x,y));
                    } else {
                        grid.appendChild(this.createActionAreaCell(cell,x,y));
                    }
                }
            }
        }

        // Add the cursor
        grid.appendChild(this.createCursor());

        document.body.style.backgroundPositionX = -cursor.getX()*this.characterWidth + "px";
        document.body.style.backgroundPositionY = -cursor.getY()*this.characterHeight + "px";
        this.app.last_grid = grid;
        this.app.redraw = false;
        return grid;
    }

    createEditor = (type: string = 'local'): void => {

        let selectedEditor = type === 'local' ? this.localEditor : this.globalEditor;
        let editor = document.getElementById(type);
        if (editor) {
            editor.appendChild(selectedEditor.dom);
            editor.style.visibility = "hidden";
        } 
    }
}