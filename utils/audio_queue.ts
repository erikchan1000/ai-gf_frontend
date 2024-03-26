//Audio class that takes in a stream and plays it as it is streaming

export interface StreamPlayerType {
  playBufferArray: () => void;
  addBufferArray: (base64Data: string) => void;
  updateAudioQueue: (base64Data: string) => void;
}

export class StreamPlayer implements StreamPlayerType {
  private audioContext: AudioContext;
  private sourceNode: AudioBufferSourceNode | null;
  private audioQueue: Buffer[];
  private bufferArray: Buffer[];
  private finishedStreaming: boolean;


  constructor() {
    this.audioContext = new AudioContext()
    this.sourceNode = null;
    this.audioQueue = [];
    this.bufferArray = [];
    this.finishedStreaming = false;
    this.checkEnded();
  }

  private async checkEnded() {
    setInterval(() => {

      if (this.finishedStreaming && this.audioContext.currentTime > this.sourceNode!.buffer!.duration ) {
        console.log("Audio context ended");
        this.audioContext.close();
        this.audioContext = new AudioContext();
        this.finishedStreaming = false;
        this.audioQueue = [];
        this.bufferArray = [];
      }
    }, 1000);
  }


  public async playBufferArray() {
    if (!this.bufferArray.length) {
      return;
    }

    const concateBuffer = Buffer.concat(this.bufferArray);
    const audioBuffer =  await this.audioContext.decodeAudioData(concateBuffer.buffer);
    this.sourceNode = this.audioContext.createBufferSource();
    this.sourceNode.buffer = audioBuffer;
    this.sourceNode.connect(this.audioContext.destination);
    this.sourceNode.start(0);

    this.sourceNode!.onended = () => {
      this.bufferArray = []
      this.sourceNode!.disconnect();
      this.audioContext.close();
      this.audioContext = new AudioContext();
    }
  }

  public async addBufferArray(base64Data: string) {
    const decodedData = Buffer.from(base64Data, 'base64');
    this.bufferArray.push(decodedData);
  }


  //Logic:
  //Append new received audio chunks to audioQueue
  //this.currentTime is the pointer to the current time of the audioContext
  //every time a new audio chunk is added, we get rid of the current
  //source Node and create a new one with the updated audioQueue
  //in the new source node, skip to the currentTime
  //if the audioQueue is empty, stop the audioContext and wait for new audio chunks
  public async updateAudioQueue(base64Data: string) {
    console.log("Updated audio queue", this.audioQueue);
    console.log(this.finishedStreaming);

    if (base64Data === 'done') {
      this.finishedStreaming = true;  
  }

    const decodedData = Buffer.from(base64Data, 'base64'); 
    this.audioQueue.push(decodedData);
    const concateBuffer = Buffer.concat(this.audioQueue);
    const audioBuffer = await this.audioContext.decodeAudioData(concateBuffer.buffer);

    const newSourceNode = this.audioContext.createBufferSource();
    newSourceNode.buffer = audioBuffer;
    newSourceNode.connect(this.audioContext.destination);

    if (this.sourceNode) {
      this.sourceNode.stop();
      this.sourceNode.disconnect();
    }

    console.log("Audio context time: ", this.audioContext.currentTime);
    newSourceNode.start(0, this.audioContext.currentTime);


    this.sourceNode = newSourceNode;
  }

  
}
