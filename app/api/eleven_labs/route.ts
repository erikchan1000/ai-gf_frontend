import WebSocket from 'ws';
import { Readable } from 'stream';
import { readGeminiMessage } from '@/utils/sendGeminiMessage';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '';

const ws = new WebSocket('wss://ws.eleven-labs.com', {
  headers: {
  'Authorization': `Basic ${Buffer.from(`:${ELEVENLABS_API_KEY}`).toString('base64')}`,
  'Content-Type': 'audio/mpeg',
  'Transfer-Encoding': 'chunked',
  },
});

ws.on('open', () => {
  console.log('connected');
});

ws.on('message', (data) => {
  const message = JSON.parse(data.toString())
  console.log("Received message: ", message);
});

ws.on('error', (error) => {
  console.error('Error:', error);
});


async function sendAudioStream(textStream: ReadableStream) {
  return new Promise<Buffer>((resolve, reject) => {
    const audioChunks: Buffer[] = [];
    ws.on('message', (data) => {
      const chunk = Buffer.from(data.toString());
      console.log("ElevenLabs message: ", chunk.toString());
      audioChunks.push(chunk);
    });

    ws.on('close', () => {
      const audioBuffer = Buffer.concat(audioChunks);
      resolve(audioBuffer);
    });

    const customWritableStream = new WritableStream({
      write(chunk) {
        if (ws.readyState == WebSocket.OPEN) {
          ws.send(chunk);
        }
      }
  });
  textStream.pipeTo(customWritableStream).then(() => {
  }).catch((error) => {
    console.error('Error:', error);
  });
});
}


export async function POST(request: Request) {
  try {
    ws.send(JSON.stringify({
      text:'',
      voice: 'Rachel',
      stream: true,
    }))

    const stream = await request.json();
    const audioStream = await sendAudioStream(stream);

    return new Response(audioStream, { status: 200 }); 

  } 
  catch (error) {
    return new Response('Error sending stream to Eleven Labs', { status: 500 });
  }
}
