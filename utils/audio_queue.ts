//Audio class that takes in a stream and plays it as it is streaming
import { resolve } from "path";
import { readElevenLabsMessage } from "./sendElevenLabsMessage";

export interface StreamPlayerType {
  playAudioChunk: (base64Data: string) => void;
  playBufferArray: () => void;
  addBufferArray: (base64Data: string) => void;
}

export class StreamPlayer implements StreamPlayerType {
  private audioContext: AudioContext;
  private sourceNode: AudioBufferSourceNode | null;
  private isPlaying: boolean;
  private audioQueue: string[];
  private isQueuePlaying: boolean;
  private playedCount: number;
  private bufferArray: Buffer[];

  constructor() {
    this.audioContext = new AudioContext()
    this.sourceNode = null;
    this.isPlaying = false;
    this.audioQueue = [];
    this.isQueuePlaying = false;
    this.playedCount = 0;
    this.bufferArray = [];
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
    }
  }

  public async addBufferArray(base64Data: string) {
    const decodedData = Buffer.from(base64Data, 'base64');
    this.bufferArray.push(decodedData);
  }


  public async playAudioChunk(base64Data: string) {
    if (!this.audioContext) {
      return;
    }
    this.audioQueue.push(base64Data);
    console.log("Audio Data", base64Data, this.playedCount)
    console.log(this.isQueuePlaying, this.playedCount)
    
    if (!this.isQueuePlaying) {
      this.isQueuePlaying = true;
      await this.playNextAudioChunk();
    }
  }

  private async playNextAudioChunk() {
    this.isQueuePlaying = true;
    if (this.audioQueue.length === 0) {
      return
    }

    console.log("Audio Queue", this.audioQueue)
    const base64Data = this.audioQueue.shift()!;
    const decodedData = await this.decodeBase64Data(base64Data);

    if (!decodedData) {
      console.error("Error decoding audio data");
      console.log(base64Data)
      this.playNextAudioChunk();
    }

    this.sourceNode = this.audioContext.createBufferSource();
    this.sourceNode.buffer = decodedData;
    this.sourceNode.connect(this.audioContext.destination);
    this.sourceNode.start(0);
    this.playedCount++;
    this.isPlaying = true;
    
    const duration = this.sourceNode.buffer!.duration * 1000;
    const triggerTime = duration;

    const timeId = setTimeout(() => {
      this.playNextAudioChunk();
    }, triggerTime);
    
  
    this.sourceNode!.onended = () => {
      this.isPlaying = false
    }
  }

  private async decodeBase64Data(base64Data: string): Promise<AudioBuffer | null> {
    let audioData;
    try {
      audioData = atob(base64Data);
    }
    catch (error) {
      return null;
    }

    const arrayBuffer = new ArrayBuffer(audioData.length);
    const bufferView = new Uint8Array(arrayBuffer);

    for (let i = 0; i < audioData.length; i++) {
      bufferView[i] = audioData.charCodeAt(i);
    }

    return new Promise((resolve, reject) => {
      this.audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
        resolve(audioBuffer);
      }, (error) => {
        console.error("Error decoding audio data: ", error);
        reject(error);
      })}
    )
  }
}