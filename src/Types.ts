import type { Camera } from './Camera.js';
import type { Cursor } from './Cursor.js';
import type { Table } from './Table.js';

export interface Commands {
    [key: string]: Function;
}

export type OutputType = 'text' | 'canvas';

export interface CursorData {
    x: number
    y: number
    y_size: number
    x_size: number
}

export interface Context {
    camera: Camera;
    cursor: Cursor;
    tables: Tables;
    current_table: string;
};

// Content saved to localstorage
export interface SavedContext {
    cursor: CursorData;
    tables: object;
    current_table: string;
}

// Visible zone is the part of the grid that is visible to the user
export interface VisibleZone {
    from_x: number; to_x: number;
    from_y: number; to_y: number;
}

// Tables are the main data structure of the application
interface Tables { [key: string]: Table }
