interface Walker {
    readonly x: number;
    readonly y: number;
    readonly x_size?: number;
    readonly y_zize?: number;
    iterator: number;

    read: () => object;
    reset: () => void;
    stop: () => void;
}

class LineReader implements Walker {
    constructor(public x=0, public y=0, public iterator=0) {
    }
    read = ():object => { return {} }
    reset = () => { }
    stop = () => { }
}

class PointReader implements Walker {
    constructor(public x=0, public y=0, public iterator=0) {
    }
    read = ():object => { return {} }
    reset = () => { }
    stop = () => { }
}

class BounceReader implements Walker {
    constructor(public x=0, public y=0, public iterator=0) {
    }
    read = ():object => { return {} }
    reset = () => { }
    stop = () => { }
}

class ScannerReader implements Walker {
    constructor(public x=0, public y=0, public iterator=0) {
    }
    read = ():object => { return {} }
    reset = () => { }
    stop = () => { }
}