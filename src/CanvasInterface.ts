import type { Application } from './Application.js';
import type { Script, Context } from './Types.js';
import { EditorView } from "codemirror";
import { editorSetup } from './EditorSetup.js';

export class CanvasInterface {

    canvas: HTMLCanvasElement
    ctx: CanvasRenderingContext2D
    context: Context
    characterWidth: number
    characterHeight: number
    charactersForWidth: number
    charactersForHeight: number
    editor: EditorView
    globalEditor: EditorView

    constructor(public app: Application){
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.context = this.app.context;
        [
            this.characterHeight, 
            this.characterWidth
        ] = this.calculateCharacterWidth();
        [
            this.charactersForWidth,
            this.charactersForHeight
        ] = [this.howManyCharactersFitWidth(), 
            this.howManyCharactersFitHeight()];
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

    calculateCharacterWidth = (): [number, number] => {
        let characterWidth = this.ctx.measureText('M').width;
        let characterHeight = this.ctx.measureText('M').actualBoundingBoxAscent;
        return [characterWidth, characterHeight];
    }

    howManyCharactersFitWidth = (): number => {
        let width = this.canvas.width;
        let characterWidth = this.characterWidth;
        let charactersForWidth = Math.floor(width / characterWidth);
        return charactersForWidth;
    }

    howManyCharactersFitHeight = (): number => {
        let height = this.canvas.height;
        let characterHeight = this.characterHeight;
        let charactersForHeight = Math.floor(height / characterHeight);
        return charactersForHeight;
    }

    resizeGrid = (): void => {
        [
            this.characterWidth,
            this.characterHeight
        ]  = this.calculateCharacterWidth()
        this.charactersForHeight = Math.floor(this.canvas.height / this.characterHeight);
        this.charactersForWidth = Math.floor(this.canvas.width / this.characterWidth);
        this.app.redraw = true;
    }

    createCell = (char: string, x: number, y: number, color: string): void => {
        this.ctx.fillStyle = color;
        this.ctx.fillText(char, x * this.characterWidth, y * this.characterHeight);
    }

    createInverseCell = (char: string, x: number, y: number, color: string): void => {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x * this.characterWidth, y * this.characterHeight, this.characterWidth, this.characterHeight);
        this.ctx.fillStyle = 'black';
        this.ctx.fillText(char, x * this.characterWidth, y * this.characterHeight);
    }
}