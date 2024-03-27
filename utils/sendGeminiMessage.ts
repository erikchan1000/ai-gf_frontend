
import { MessageHistoryProps } from '@/components/nia_interface/interface';
import prompts from '@/utils/prompt.json'

interface ChatMessage {
  role: "user";
  parts: { text: string }[];
}

const prompt = `Reply concisely and restrict long winded responses. 
  Maximum of 3 sentences per response.\n
  Do not repeat yourself in generating text.\n
  You are a support bot for a music company called breaking hits.\n
  This is background information on Breaking hits:\n${prompts["information_prompt"]}\n
  Answer following inputs based on the information provided above.\n
  If asked about irrelevant information, respond with "I'm sorry, I don't have that information".\n
  This is your personality: ${prompts["personality_prompt"]}\n

  This is the message you need to respond to: \n
`

const testPrompt = ""

export async function sendGeminiMessage(chatHistory: MessageHistoryProps, message: string): Promise<ReadableStream> {
  const endpoint = '/api/test';
  
  const newMessage = {
    role: "user",
    parts: [{ text: prompt + message }],
  };

  const newChatHistory = {
    contents: [...chatHistory.contents, newMessage],
  };


  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newChatHistory),
  }).catch((error) => {
    console.error('Error:', error);
    console.log(JSON.stringify(newChatHistory));
    throw new Error('Error sending message');
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status} `);
  }

  const stream = response.body as ReadableStream;
  return stream
}

export async function* readGeminiMessage(stream: ReadableStream): AsyncGenerator<string> {
  const reader = stream.getReader();
  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    const data = new TextDecoder().decode(value);
    console.log("Data: ", data)
    yield data;
  }
}
