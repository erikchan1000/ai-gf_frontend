import { StreamAudioSource } from "./stream_audio";

class StreamPlayer {
  audioContext: AudioContext | null;
  audioWorkletNode: AudioWorkletNode | null;
  streamAudioSource: StreamAudioSource | null;

  constructor() {
    this.audioContext = null;
    this.audioWorkletNode = null;
    this.streamAudioSource = null;
  }

  async test() {
    this.audioContext = new AudioContext();
    console.log("Context created", this.audioContext)
    await this.audioContext.audioWorklet.addModule('audio_worklet.js').then(() => {
      console.log("Worklet added", this.audioContext!.audioWorklet)
    }).catch((e) => {
      console.error("Error adding worklet", e)
      return new Promise((resolve, reject) => {
        reject(e)
      })
    });

    this.audioWorkletNode = new AudioWorkletNode(this.audioContext, 'custom-audio-worklet-processor');
    console.log("Worklet node created")
    console.log("Worklet node connected")
    this.streamAudioSource = new StreamAudioSource(this.audioContext, this.audioWorkletNode);
    console.log("Stream audio source created")
    this.audioWorkletNode.connect(this.audioContext.destination);
  }

  async start() {
    if (!this.streamAudioSource) {
      console.log("Initializing")
      try {
      await this.test();
      }
      catch (e) {
        console.error("Error initializing", e)
        return 
      }
      console.log("Initialized")
    }

    console.log(this.streamAudioSource)

    try {
      this.streamAudioSource!.start();
    }
    catch (e) {
      console.error("Error starting", e)
    }
  }

  stop() {
    console.log(this.streamAudioSource)
    if (!this.streamAudioSource) {
      return;
    }

    this.streamAudioSource!.stop();
  }

  async feed(audioBuffer: Uint8Array) {
    console.log("Feeding audio buffer", audioBuffer.buffer)
    if (this.streamAudioSource) {
      const data = await this.audioContext!.decodeAudioData(audioBuffer.buffer);
      console.log("Decoded audio data", data)
      this.streamAudioSource.feed(data);
    }
  }
  
}

export { StreamPlayer };
