export class DynamicAudioPlayer {
  private currentTick: number;
  private bufferArray: Buffer[];

  constructor(bufferArray: Buffer[]) {
    this.currentTick = 0;
    this.bufferArray = bufferArray;
  }

  public updateAudioQueue(audioQueue: Buffer) {
    this.bufferArray.push(audioQueue);
  }

  public playAudioQueue() {
    const audioBlob = new Blob(this.bufferArray, { type: 'audio/wav' });
    const audioUrl = URL.createObjectURL(audioBlob);
    const audioElement = document.createElement('audio');
    audioElement.src = audioUrl;
    
  }

  
}