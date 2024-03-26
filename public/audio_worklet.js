class CustomAudioWorkletProcessor extends AudioWorkletProcessor {
  constructor() {
    console.log("Constructing AudioWorkletProcessor");
    super();
    this.port.onmessage = this.handleMessage.bind(this);
    this.audioQueue = [];
    this.isPlaying = false;
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  handleMessage(event) {
    const { type, data } = event.data;
    const { sampleRate, channelData, length } = data;

    if (type === 'bufferStream') {
      const audioBuffer = this.audioContext.createBuffer(channelData.length, length, sampleRate);

      for (let i = 0; i < channelData.length; i++) {
        audioBuffer.getChannelData(i).set(channelData[i]);
      }

      this.audioQueue.push(audioBuffer);

      if (!this.isPlaying) {
        this.isPlaying = true;
      }

      this.processAudio();
    } else if (type === 'done') {
      this.audioQueue = [];
      this.isPlaying = false;
    }
  }

  processAudio() {
    if (this.audioQueue.length === 0) {
      this.port.postMessage({ type: 'log', data: "No audio to process" });
      return;
    }

    const audioBuffer = this.audioQueue.shift();
    const leftChannel = audioBuffer.getChannelData(0);
    const rightChannel = audioBuffer.getChannelData(1);
    const input = [leftChannel, rightChannel];
    const output = [[], []];
    this.process(input, output);

    const outputBuffer = this.audioContext.createBuffer(2, output[0].length, audioBuffer.sampleRate);
    outputBuffer.getChannelData(0).set(output[0]);
    outputBuffer.getChannelData(1).set(output[1]);

    this.port.postMessage({ type: 'audioBuffer', data: outputBuffer }, [outputBuffer.buffer]);
  }

  process(inputs, outputs) {
    const leftInput = inputs[0];
    const rightInput = inputs[1];
    for (let i = 0; i < leftInput.length; i++) {
      outputs[0][i] = Math.max(-1, Math.min(1, leftInput[i]));
      outputs[1][i] = Math.max(-1, Math.min(1, rightInput[i]));
    }
    return true;
  }
}

registerProcessor('custom-audio-worklet-processor', CustomAudioWorkletProcessor);
