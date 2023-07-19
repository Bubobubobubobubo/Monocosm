import type { Camera } from './Camera.js';
import type { Cursor } from './Cursor.js';
import type { Table } from './Table.js';
import { ActionArea } from "./Crawler";

export interface Crawler {
    parent: Zone;
    x: number;
    y: number;
}

export interface Zone {
    parent: Table;
    x: number;
    y: number;
    y_size: number;
    x_size: number;
    iterator: number;
    unique_id: string;
    children: Crawler[]
}

export interface Script {
    'temporary_code': string;
    'committed_code': string;
    evaluations: number;
}

export interface TableData {
    variables: { [key: string]: number | string | boolean }
    cells: Cells
    script: Script 
    theme: string
    actionAreas: ActionAreas
}

export interface PasteBuffer { [key: string]: string }
export interface Cells { [key: string]: string }
export interface ActionAreas { [key: string]: Zone }

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
    mainScript: Script;
    camera: Camera;
    cursor: Cursor;
    tables: Tables;
    current_table: string;
};

// Content saved to localstorage
export interface SavedContext {
    mainScript: Script;
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
