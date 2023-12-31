export class MidiOut {

    output: MIDIOutput | undefined;
    triggered_notes: number[];
    

    constructor() {
        navigator.requestMIDIAccess().then(
            this.onMIDISuccess, 
            this.onMIDIFailure
        );
        this.triggered_notes = [];
    }

    onMIDISuccess = (midiAccess: MIDIAccess): void => {
        this.output = midiAccess.outputs.values().next().value;
    }

    chooseMidiOutput = (output_name: string): void => {
        navigator.requestMIDIAccess().then(
            (midiAccess: MIDIAccess) => {
                for (let output of midiAccess.outputs.values()) {
                    if (output.name === output_name) {
                        this.output = output;
                    }
                }
            },
            this.onMIDIFailure
        );
    }

    note = (note: number=60, velocity: number=120, channel: number=1): void => {
        if (this.triggered_notes.includes(note)) {
            this._noteOff(note, channel);
            this.triggered_notes.splice(this.triggered_notes.indexOf(note), 1);
            return;
        } else {
            this._noteOn(note, velocity, channel);
            this.triggered_notes.push(note);
        }
    }

    onMIDIFailure = (): void => {
    }

    _noteOn(note: number, velocity: number, channel: number) {
        if (!this.output) return;
        this.output.send([0x90 + channel, note, velocity]);
    }

    _noteOff(note: number, channel: number) {
        if (!this.output) return;
        this.output.send([0x80 + channel, note, 0]);
    }

    _controlChange(control: number, value: number, channel: number) {
        if (!this.output) return;
        this.output.send([0xB0 + channel, control, value]);
    }
    
    _programChange(program: number, channel: number) {
        if (!this.output) return;
        this.output.send([0xC0 + channel, program]);
    }
}