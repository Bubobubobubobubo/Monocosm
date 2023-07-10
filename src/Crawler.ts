import { Zone, Crawler } from './Types';
import type { Table } from './Table';

export class ActionArea {

    parent: Table
    unique_id: string

    constructor(
        parent: Table,
        public x: number=0, 
        public y: number=0,
        public y_size: number=1,
        public x_size: number=1,
        public iterator: number=0,
        public children: Crawler[]=[],
    ) {
        this.parent = parent;
        this.unique_id = (this.parent.action_areas.length + 1).toString();
    }
}


class LineReader implements Crawler {
    constructor(public x=0, public y=0, public parent: Zone) {
        this.parent = parent;
    }
}

class PointReader implements Crawler {
    constructor(public x=0, public y=0, public parent: Zone) {
        this.parent = parent;
    }
}

class BounceReader implements Crawler {
    constructor(public x=0, public y=0, public parent: Zone) {
        this.parent = parent;
    }
}

class ScannerReader implements Crawler {
    constructor(public x=0, public y=0, public parent: Zone) {
        this.parent = parent;
    }
}
