export class MidiOut {

    output: MIDIOutput | undefined;

    constructor() {
        navigator.requestMIDIAccess().then(
            this.onMIDISuccess, 
            this.onMIDIFailure
        );
    }

    onMIDISuccess = (midiAccess: MIDIAccess): void => {
        console.log('MIDI Access Object', midiAccess);
        // Connect this.output to the first available MIDI port
        this.output = midiAccess.outputs.values().next().value;
        console.log('MIDI Output Object', this.output)
    }

    onMIDIFailure = (): void => {
        console.log('Could not access your MIDI devices.');
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