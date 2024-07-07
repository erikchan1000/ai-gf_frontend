class AudioStreamProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.audioQueue = [];
    this.isPlaying = false;
    this.port.onmessage = this.handleMessage.bind(this);
  }

  handleMessage(event) {
    const { type, data } = event.data;

    if (type === 'bufferStream') {
      const { sampleRate, channelData, length } = data;

      const audioBuffer = this.createAudioBuffer(channelData, length, sampleRate);
      this.audioQueue.push(audioBuffer);

      if (!this.isPlaying) {
        this.isPlaying = true;
        this.processAudio();
      }
    } else if (type === 'done') {
      this.audioQueue = [];
      this.isPlaying = false;
    }
  }

  createAudioBuffer(channelData, length, sampleRate) {
    const audioBuffer = this.audioContext.createBuffer(channelData.length, length, sampleRate);

    for (let i = 0; i < channelData.length; i++) {
      audioBuffer.getChannelData(i).set(channelData[i]);
    }

    return audioBuffer;
  }

  processAudio() {
    if (this.audioQueue.length === 0) {
      return;
    }

    const audioBuffer = this.audioQueue.shift();
    const numberOfChannels = audioBuffer.numberOfChannels;
    const outputChannelData = new Array(numberOfChannels);

    for (let channel = 0; channel < numberOfChannels; channel++) {
      outputChannelData[channel] = audioBuffer.getChannelData(channel);
    }

    const inputChannelData = outputChannelData.slice();
    const outputBuffer = this.process(inputChannelData, outputChannelData);

    if (outputBuffer) {
      this.port.postMessage({ type: 'audioBuffer', data: outputBuffer }, [outputBuffer.buffer]);
    }

    this.processAudio();
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];

    for (let i = 0; i < input.length; i++) {
      output[i] = input[i];
    }

    return true;
  }
}

registerProcessor('audio-processor', AudioStreamProcessor);
