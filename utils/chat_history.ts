interface Content {
  role: "user" | "model";
  parts: {
    text: string;
  }[];
}

interface ChatHistory {
  id: string;
  contents: Content[];
}

export async function storeChatHistory(chatHistory: ChatHistory) {
  const chatHistoryRef = firestore.collection('chat_history').doc(chatHistory.id);
  await chatHistoryRef.set(chatHistory);
}
