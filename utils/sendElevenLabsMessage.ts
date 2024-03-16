const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY; 
const voiceId = "XrsGlhubmxHmYqon43Je"; // replace with your voice_id
const model = 'eleven_monolingual_v1';
const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${model}`;

export async function* readElevenLabsMessage(stream: ReadableStream): AsyncGenerator<any> { 
  const reader = stream.getReader();
  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }
    value as Buffer;

    yield value

  }
}

export function createSocket(): WebSocket {
  return new WebSocket(wsUrl);
}

export async function sendElevenLabsMessage(stream: ReadableStream, socket: WebSocket): Promise<ReadableStream> {
    
  const eosMessage = {
    "text": "",
  }

  return new Promise<ReadableStream>((resolve, reject) => {
    
    const audioStream = new ReadableStream({
      start(controller) {
        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log(data);
          if (data.audio) {
            controller.enqueue(data.audio);
          }
          if (data.isFinal) {
            controller.close();
          }
        };
      }
    });

    // Send BOS message when the WebSocket connection is opened
    socket.onopen = () => {
      console.log('WebSocket connection opened');
      const bosMessage = {
        "text": " ",
        "voice_settings": {
          "stability": 0.5,
          "similarity_boost": 0.8
        },
        "xi_api_key": ELEVENLABS_API_KEY,
      };

      socket.send(JSON.stringify(bosMessage));
      stream.pipeTo(
        new WritableStream({
          write(chunk) {
            const message = {
              "text": new TextDecoder().decode(chunk),
              "xi_api_key": ELEVENLABS_API_KEY,
            };
            console.log('Sending message:', message)
            socket.send(JSON.stringify(message));
          },
          close() {
            socket.send(JSON.stringify(eosMessage));
          }
        })
      )

    };
    
    // Handle WebSocket connection closure
    socket.onclose = () => {
      console.log('WebSocket connection closed');
    };
    
    // Handle WebSocket errors
    socket.onerror = (error) => {
      // If there's an error with the WebSocket connection, reject the promise
      console.error('WebSocket error:', error);
      reject(error);
    };
    
    resolve(audioStream);
  })
}

