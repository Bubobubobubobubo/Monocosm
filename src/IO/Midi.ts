export class MidiOut {

    output: MIDIOutput | undefined;

    constructor() {
        navigator.requestMIDIAccess().then(
            this.onMIDISuccess, 
            this.onMIDIFailure
        );
    }

    onMIDISuccess = (midiAccess: MIDIAccess): void => {
        this.output = midiAccess.outputs.values().next().value;
    }

    chooseMidiOuptut = (output_name: string): void => {
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