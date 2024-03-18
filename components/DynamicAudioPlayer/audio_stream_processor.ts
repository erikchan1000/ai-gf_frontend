
class AudioStreamProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
  }

  process(inputs, outputs, parameters) {
    const inputBuffer = inputs[0];
    const outputBuffer = outputs[0];

    const 
  } 
}

registerProcessor('audio-stream-processor', AudioStreamProcessor);