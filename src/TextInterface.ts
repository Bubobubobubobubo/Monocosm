import type { Application } from './Application';
import type { Context, Script } from './Types.js';
import { EditorView } from "codemirror"
import { editorSetup } from './EditorSetup.js';

export class TextInterface {

    editor: EditorView
    globalEditor: EditorView
    editorElement: DocumentFragment | null = null
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
        this.editor = new EditorView({
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
        const selectedEditor = editor == 'local' ? this.editor : this.globalEditor;
        selectedEditor.dispatch({
            changes: {
                from: 0,
                to: selectedEditor.state.doc.length,
                insert: script.committed_code
            }
        })
    }

    clearEditor = (editor: string = 'local') => {
        const selectedEditor = editor == 'local' ? this.editor : this.globalEditor;
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
    }

    scaleBackgroundGrid = (): void => {
        document.body.style.backgroundSize = this.characterWidth*5 + 'px' + ' ' + this.characterHeight*5 + 'px';
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
        cell.id = x + "," + y;
        const offset_x = x * this.characterWidth + this.charactersForWidth/2 * this.characterWidth;
        const offset_y = y * this.characterHeight + this.charactersForHeight/2 * this.characterHeight;
        cell.style.transform = 'translate(' + offset_x + 'px,' + offset_y + 'px)';
        return cell;
    }

    createInvertedCell = (char: string, x: number, y: number): HTMLElement => {
        let cell = document.createElement('span');
        cell.className = 'inverted-cell';
        cell.innerText = char;
        const offset_x = x * this.characterWidth + this.charactersForWidth/2 * this.characterWidth;
        const offset_y = y * this.characterHeight + this.charactersForHeight/2 * this.characterHeight;
        cell.style.transform = 'translate(' + offset_x + 'px,' + offset_y + 'px)';
        return cell;
    }

    createActionAreaCell = (char: string, x: number, y: number): HTMLElement => {
        let cell = document.createElement('span');
        cell.className = 'action-area-cell';
        cell.innerText = char;
        const offset_x = x * this.characterWidth + this.charactersForWidth/2 * this.characterWidth;
        const offset_y = y * this.characterHeight + this.charactersForHeight/2 * this.characterHeight;
        cell.style.transform = 'translate(' + offset_x + 'px,' + offset_y + 'px)';
        return cell;
    }

    createCursor = (): HTMLElement => {
        let cell = document.createElement('div');
        cell.contentEditable = 'true';
        cell.id = 'cursor';
        cell.innerText = ' ';

        // transform always center of the screen calc(50vh) and calc(50vw)
        // cell.style.transform = 'translate(calc(50vw - ' + this.characterWidth/6 + 'px), calc(50vh - ' + this.characterHeight/6 + 'px))';

        const offset_x = this.charactersForWidth/2 * this.characterWidth;
        const offset_y = this.charactersForHeight/2 * this.characterHeight;
        cell.style.transform = 'translate(' + offset_x + 'px,' + offset_y + 'px)';

        // Add a listener for pasting
        cell.addEventListener('paste', (e) => {
            this.pasteFromClipboard = e.clipboardData?.getData('text/plain');
            this.app.getCurrentTable().paste();
            e.preventDefault();
            //this.app.redraw = true;
        });
        return cell;
    }

    appendCell = (content: string, x: number, y: number): void => {
        let cell = this.createCell(content, x, y);
        // If span with the same id exists replace it else append it
        let existingCell = document.getElementById(cell.id);
        if (existingCell) {
            existingCell.replaceWith(cell);
        }
        else {
            this.app.grid.appendChild(cell);
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

        // Loop all items in object
        for (let key in cells) {
            const coord = key.split(',');
            let cell = this.createCell(cells[key], parseInt(coord[0]), parseInt(coord[1]));
            // TODO: UNDER SELECTION?
            // TODO: ACTION AREA?
            grid.appendChild(cell);
        }

        this.app.replaceGrid = false
        return grid;

    }

    moveGrid = () => {
        const cursor = this.app.getCursor();
        // Offset cursor x and y with window.innerWidth and window.innerHeight

        const x = -cursor.getX() * this.characterWidth;
        const y = -cursor.getY() * this.characterHeight;

        this.app.grid.style.transform = 'translate(' + x + 'px,' + y + 'px)';
        document.body.style.backgroundPositionX = x + "px";
        document.body.style.backgroundPositionY = y + "px";
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
                        grid.appendChild(this.createInvertedCell(currentTable.getCell(vx,vy),x,y));
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

    createEditor = (type: string = 'local'): DocumentFragment | null => {

        let selectedEditor = type === 'local' ? this.editor : this.globalEditor;

        this.app.input.isCapturingInput = false;

        // Check if the zone first element is an HTML span
        if (this.app.grid.firstElementChild?.tagName === 'SPAN') {
            let editor = document.createDocumentFragment();
            editor.appendChild(selectedEditor.dom);

            const timer = setInterval(() => {
                selectedEditor.focus();
                if(selectedEditor.hasFocus) clearInterval(timer);
            }, 1);

            return editor;
        } else {
            return this.editorElement;
        }
    }
}