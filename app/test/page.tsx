'use client'

import React, { useEffect, useState } from 'react';
import Aud from '@/components/nia_interface/test.json';
import { StreamPlayer } from '@/utils/audio/stream_player';
import { createAudioBufferFromBase64 } from '@/utils/audio/audio_function';

const Test = () => {
  const [audioQueue, setAudioQueue] = useState<Buffer[]>([]);

  useEffect(() => {
    let queue: any = [];

    for (const audioData of Aud.blobQueue) {
      const decodedData = Buffer.from(audioData.audio, 'base64');
      queue.push(decodedData);
    }
    setAudioQueue(queue);
  }, [])

  const playAudio = async () => {
    const audioQueue = Aud.blobQueue;
    const newStreamPlayer = new StreamPlayer()
    newStreamPlayer.start()
    
    console.log(newStreamPlayer)
    const streamChunks = async () => {
      for (const audioData of audioQueue) {
        await sendChunkWithDelay(audioData.audio);
      }
    };

    const sendChunkWithDelay = async (audioChunk: string) => {

      return new Promise<void>((resolve) => {
        setTimeout(async () => {
          const audio = await createAudioBufferFromBase64(audioChunk);
          newStreamPlayer.feed(audio);
          resolve();
        }, 500);
      });
    };

    await streamChunks().then(() => {
      newStreamPlayer.stop();
    }
    );
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

