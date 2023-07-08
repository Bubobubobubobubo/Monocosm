import type { Application } from './Application';
import type { Context } from './Types.js';
import { EditorView } from "codemirror"
import { editorSetup } from './EditorSetup.js';

export class TextInterface {

    editor: EditorView
    editorElement: DocumentFragment | null = null
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
        this.editor = new EditorView({
            extensions: [
                editorSetup,
                EditorView.updateListener.of((e) => {
                    this.app.getCurrentTable().script = e.state.doc.toString();
                })
            ],
            parent: undefined
        })
        this.scaleBackgroundGrid();
    }

    loadScript = (script: string) => {
        this.editor.dispatch({
            changes: {
                from: 0,
                to: this.editor.state.doc.length,
                insert: script
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
        // TODO: Test translate instead of absolute positioning
        // cell.style.transform = 'translate(' + (x * this.characterWidth) + 'px,' + (y * this.characterHeight) + 'px)';
        cell.style.top = (y * this.characterHeight) + 'px';
        cell.style.left = (x * this.characterWidth) + 'px';
        return cell;
    }

    createInvertedCell = (char: string, x: number, y: number): HTMLElement => {
        let cell = document.createElement('span');
        cell.className = 'inverted-cell';
        cell.innerText = char;
        // TODO: Test translate instead of absolute positioning
        // cell.style.transform = 'translate(' + (x * this.characterWidth) + 'px,' + (y * this.characterHeight) + 'px)';
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
                    if (cursor.isUnder(vx,vy)) {
                        grid.appendChild(this.createInvertedCell(currentTable.getCell(vx,vy),x,y));
                    } else {
                        grid.appendChild(this.createCell(currentTable.getCell(vx,vy),x,y));
                    }
                } else if(cursor.isUnder(vx,vy)) {
                    grid.appendChild(this.createCell('█',x,y));
                }
            }
        }
        document.body.style.backgroundPositionX = -cursor.x*this.characterWidth + "px";
        document.body.style.backgroundPositionY = -cursor.y*this.characterHeight + "px";
        this.app.last_grid = grid;
        this.app.redraw = false;
        return grid;
    }

    createEditor = (): DocumentFragment | null => {
        this.app.input.isCapturingInput = false;
        let zone = document.getElementById('zone');

        // Check if the zone first element is an HTML span
        if (zone?.firstElementChild?.tagName === 'SPAN') {
            let editor = document.createDocumentFragment();
            editor.appendChild(this.editor.dom);
            // Focus on class cm-editor
            const timer = setInterval(() => {
                this.editor.focus();
                if(this.editor.hasFocus) clearInterval(timer);
            }, 1);
            return editor;
        } else {
            return this.editorElement;
        }
    }
}