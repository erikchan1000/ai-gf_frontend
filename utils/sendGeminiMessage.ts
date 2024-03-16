
import { MessageHistoryProps } from '@/components/nia_interface/interface';
import prompts from '@/utils/prompt.json'

interface ChatMessage {
  role: "user";
  parts: { text: string }[];
}

const prompt = `This is background information on Breaking hits:\n${prompts["information_prompt"]}\n
  Answer following inputs based on the information provided above.\n
  If asked about things not pertaining to music or breaking hits, please respond with "I don't know".\n
  This is your personality: ${prompts["personality_prompt"]}\n

  User Input:\n
`

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
    const response = new TextDecoder().decode(value);
    yield response;
  }
}
