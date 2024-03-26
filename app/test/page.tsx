'use client'

import React, { useEffect, useState } from 'react';
import Aud from '@/components/nia_interface/test.json';
import { createAudioBufferFromBase64 } from '@/utils/audio/audio_function';
import { StreamPlayer } from '@/utils/audio_queue';

const createTestStream = () => {
  return new ReadableStream({
    async start(controller) {
      for (const audioData of Aud.blobQueue) {
        controller.enqueue(audioData.audio);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      controller.close();
    }
  });
}

async function* readStream(stream: ReadableStream<string>) {
  const reader = stream.getReader(); 
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
    yield value;
  }
}


const Test = () => {
  const [audioQueue, setAudioQueue] = useState<string[]>([]);
  const [audioContext, setAudioContext] = useState<AudioContext>(new AudioContext());
  const [ mediaStreamNode, setMediaStreamNode ] = useState<MediaStreamAudioSourceNode>();

  const api_key = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
  const voiceId = "XrsGlhubmxHmYqon43Je"; // replace with your voice_id
  const model = 'eleven_monolingual_v1';
  const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${model}`;
  
  useEffect(() => {
    let queue: any = [];

    for (const audioData of Aud.blobQueue) {
      const decodedData = audioData.audio; 
      queue.push(decodedData);
    }
    setAudioQueue(queue);
  }, [])
  
  const read = async (stream: ReadableStream<string>) => {
    const reader = readStream(stream)
    for await (const chunk of reader) {
      console.log(chunk)
    }
  }

  const playAudio = async () => {
    const audioQueue = Aud.blobQueue;
    const newStreamPlayer = new StreamPlayer()
    
    console.log(newStreamPlayer)
    const streamChunks = async () => {
      for (const audioData of audioQueue) {
        await sendChunkWithDelay(audioData.audio);
      }

    };

    const sendChunkWithDelay = async (audioChunk: string) => {
      return new Promise<void>((resolve) => {
        setTimeout(async () => {
          newStreamPlayer.updateAudioQueue(audioChunk);
          resolve();
        }, 100);
      });
    };

    streamChunks().then(() => {
      newStreamPlayer.updateAudioQueue('done');
    });

  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <button onClick={() => playAudio()}>Play</button>
      <button onClick={() => {
        const audio = new Audio();
        const url = URL.createObjectURL(new Blob(audioQueue));

        audio.src = url;
        audio.play();
      }}>Play Audio Buffer</button>
    </div>
  );
};

export default Test;

