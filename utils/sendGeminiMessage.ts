import { MessageHistoryProps } from '@/components/nia_interface/interface';

interface ChatMessage {
  role: "user";
  parts: { text: string }[];
}

export async function sendGeminiMessage(chatHistory: MessageHistoryProps, message: string): Promise<ReadableStream> {
  const endpoint = '/api/test';
  
  const newMessage = {
    role: "user",
    parts: [{ text: message }],
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
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
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
