export class StreamAudioSource {
  audioContext: AudioContext;
  audioWorkletNode: AudioWorkletNode;
  isPlaying: boolean;

  constructor(audioContext: AudioContext, audioWorkletNode: AudioWorkletNode) {
    this.audioContext = audioContext;
    this.audioWorkletNode = audioWorkletNode;
    this.isPlaying = false;

    this.audioWorkletNode.port.onmessage = this.handleMessages.bind(this);
  }

  start() {
    this.isPlaying = true;
  }

  stop() {
    this.isPlaying = false;
    this.audioWorkletNode.port.postMessage({ type: 'done' });
  }

  feed(audioBuffer: AudioBuffer) {
    if (!this.isPlaying) {
      return;
    }
    console.log("Feed: ", audioBuffer)
    const channelData = [];

    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      channelData.push(audioBuffer.getChannelData(i));
    }
    
    const arrayBuffer = audioBuffer.getChannelData(0).buffer;
    console.log("Channel Data: ", channelData)
    console.log("Array Buffer: ", arrayBuffer)

    this.audioWorkletNode.port.postMessage({ type: 'bufferStream', data: {
      sampleRate: audioBuffer.sampleRate,
      channelData,
    } }, [arrayBuffer]);
  }
    
  handleMessages(event: MessageEvent) {
    const { type, data } = event.data;
    console.log("Handling message", type, data)
  }

}
