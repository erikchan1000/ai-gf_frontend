class CustomAudioWorkletProcessor extends AudioWorkletProcessor {
  audioQueue: Float32Array[];
  isPlaying: boolean;

  constructor() {
    super();
    this.port.onmessage = this.handleMessage.bind(this);
    this.audioQueue = [];
    this.isPlaying = false;
  }

  handleMessage(event: MessageEvent) {
    const { type, data } = event.data;
    if (type === 'bufferStream') {
      this.audioQueue.push(data);
      if (!this.isPlaying) {
        this.isPlaying = true;
        this.processAudio();
      }
    } else if (type === 'done') {
      this.audioQueue = [];
      this.isPlaying = false;
    }
  }

  processAudio() {
    if (this.audioQueue.length === 0) {
      return;
    }

    const audioBuffer = this.audioQueue.shift();
    const input = [audioBuffer];
    const output: any = [];
    this.process(input, output);

    const outputBuffer = output[0];
    this.port.postMessage({ type: 'audioBuffer', data: outputBuffer }, [outputBuffer.buffer]);

    if (this.isPlaying) {
      this.processAudio();
    }
  }

  process(inputs: any, outputs: any) {
    const input = inputs[0];
    outputs[0] = input;

    return true;
  }
}

registerProcessor('custom-audio-worklet-processor', CustomAudioWorkletProcessor);

