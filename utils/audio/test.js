export class AudioStreamPlayer {
  constructor() {
    this.audioContext = new AudioContext()
    this.scriptNode = null;
    this.audioBuffer = null;
    this.sourceNode = null;
    this.isPlaying = false;
    this.start();
  }

  async start() {
    try {
      await this.audioContext.audioWorklet.addModule('audio-processor.js').then(() => {
        console.log('Audio processor added');
      }).catch(error => {
        console.error('Error adding audio processor:', error);
      });

      this.scriptNode = new AudioWorkletNode(this.audioContext, 'audio-processor');
      this.scriptNode.connect(this.audioContext.destination);
    }
    catch (error) {
      console.error('Error adding audio processor:', error);
    }
  }

  handleChunk(chunk) {
    const binaryString = window.atob(chunk);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    this.audioContext.decodeAudioData(bytes.buffer)
      .then(decodedData => {
        if (!this.audioBuffer) {
          this.audioBuffer = decodedData;
        } else {
          const newBuffer = this.audioContext.createBuffer(
            this.audioBuffer.numberOfChannels,
            this.audioBuffer.length + decodedData.length,
            this.audioBuffer.sampleRate
          );

          for (let channel = 0; channel < this.audioBuffer.numberOfChannels; channel++) {
            const newData = newBuffer.getChannelData(channel);
            newData.set(this.audioBuffer.getChannelData(channel), 0);
            newData.set(decodedData.getChannelData(channel), this.audioBuffer.length);
          }

          this.audioBuffer = newBuffer;
        }

        if (!this.isPlaying) {
          this.playAudioBuffer();
        }
      })
      .catch(error => {
        console.error('Error decoding audio data:', error);
      });
  }

  playAudioBuffer() {
    if (this.sourceNode) {
      this.sourceNode.stop();
    }

    this.sourceNode = this.audioContext.createBufferSource();
    this.sourceNode.buffer = this.audioBuffer;
    this.sourceNode.start();
    this.sourceNode.connect(this.audioContext.destination);

    this.isPlaying = true;
  }

  handleStream(stream) {
    const reader = stream.getReader();

    const readChunk = ({ done, value }) => {
      console.log('Read chunk:', value);
      if (done) {
        return;
      }

      this.handleChunk(value);
      reader.read().then(readChunk);
    };

    reader.read().then(readChunk);
  }
}
