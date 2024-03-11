
const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY; 
const voiceId = "TWUKKXAylkYxxlPe4gx0"; // replace with your voice_id
const model = 'eleven_monolingual_v1';
const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${model}`;


export async function sendElevenLabsMessage(value: string ): Promise<Buffer> {
    
  const socket = new WebSocket(wsUrl);
  const eosMessage = {
    "text": "",
  }

  return new Promise<Buffer>((resolve, reject) => {
    const audioChunks: Buffer[] = [];
    
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

      socket.send(JSON.stringify({
        "text": value,
        "xi_api_key": ELEVENLABS_API_KEY,
      }))
      socket.send(JSON.stringify(eosMessage));
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
      console.log('WebSocket connection closed');
      resolve(Buffer.concat(audioChunks));
    };
    
    // Handle WebSocket errors
    socket.onerror = (error) => {
      // If there's an error with the WebSocket connection, reject the promise
      console.error('WebSocket error:', error);
      reject(error);
    };

  })
}

