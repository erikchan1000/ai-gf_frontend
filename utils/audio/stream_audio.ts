export class StreamAudioSource {
  audioContext: AudioContext;
  audioWorkletNode: AudioWorkletNode;
  isPlaying: boolean;

  constructor(audioContext: AudioContext, audioWorkletNode: AudioWorkletNode) {
    this.audioContext = audioContext;
    this.audioWorkletNode = audioWorkletNode;
    this.isPlaying = false;
  }

  start() {
    this.isPlaying = true;
  }

  stop() {
    this.isPlaying = false;
    this.audioWorkletNode.port.postMessage({ type: 'done' });
  }

  feed(audioBuffer: Buffer) {
    if (!this.isPlaying) {
      return;
    }

    this.audioWorkletNode.port.postMessage({ type: 'bufferStream', data: audioBuffer }, [audioBuffer.buffer]);
  }
}
