
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || '2205ea32673cd5d883378ecb82b8ff17';
const voiceId = "TWUKKXAylkYxxlPe4gx0"; // replace with your voice_id
const model = 'eleven_monolingual_v1';
const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${model}`;

export async function sendElevenLabsMessage(stream: ReadableStream<any>): Promise<Buffer> {
  
  const socket = new WebSocket(wsUrl);
  const eosMessage = {
    "text": " ",
  }

  return new Promise<Buffer>((resolve, reject) => {
    const audioChunks: Buffer[] = [];
    console.log("API Key: ", ELEVENLABS_API_KEY);
    
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

      console.log("Sending BOS message: ", bosMessage);
      socket.send(JSON.stringify(bosMessage));
      const customWritableStream = new WritableStream({
      write(chunk) {
        console.log("WebSocket readyState: ", socket.readyState);
        if (socket.readyState === WebSocket.OPEN) {
          const text = new TextDecoder().decode(chunk);
          const message = {
            "text": text,
            "try_trigger_generation": true,
          };
          console.log("Sending message to ElevenLabs: ", message);

          socket.send(JSON.stringify(message));
          }
        }
      });

      // Pipe the input stream to the customWritableStream
      stream.pipeTo(customWritableStream)
      .then(() => {
        // Do nothing here; the resolve will be called when the WebSocket connection is closed
      })
      .catch((error) => {
        // If there's an error piping the stream, reject the promise
        reject(error);
      });
    };

    // Handle incoming messages from the WebSocket server
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // If the message contains audio data, push it to the audioChunks array
      console.log("Received message from ElevenLabs: ", data)
      if (data.audio) {
        const audioChunk = Buffer.from(data.audio, 'base64');
        audioChunks.push(audioChunk);
      }
      
      // Check if the message indicates the end of the audio stream
      if (data.isFinal) {
        // Concatenate all audio chunks into a single Buffer
        const audioBuffer = Buffer.concat(audioChunks);
        resolve(audioBuffer);
      }
    };
    
    // Handle WebSocket connection closure
    socket.onclose = () => {
      // If the WebSocket connection is closed, reject the promise
      reject(new Error('WebSocket connection closed'));
    };
    
    // Handle WebSocket errors
    socket.onerror = (error) => {
      // If there's an error with the WebSocket connection, reject the promise
      console.error('WebSocket error:', error);
      reject(error);
    };

  })
}

