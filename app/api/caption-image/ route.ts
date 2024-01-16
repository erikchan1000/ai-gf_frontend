import {convertGooglePrompt} from "@/middleware/googlePromptConverter";
import { NextResponse } from "next/server";

type GoogleRequest = {
  body: {
    prompt: string;
    max_tokens: number;
    temperature: number;
    top_p: number;
    top_k: number;
    stop: string[];
    model: string;
  },
  socket: {
    removeAllListeners: () => void;
    on: (event: string, callback: () => void) => void;
  }
}


async function sendMakerSuiteRequest(request: GoogleRequest) {
  const apiKey = process.env.MAKER_SUITE_API_KEY;

  const model = String (request.body.model);
  
  const generationConfig = {
    stopSequences: request.body.stop,
    candidateCount: 1,
    maxOutputTokens: request.body.max_tokens,
    temperature: request.body.temperature,
    topP: request.body.top_p,
    topK: request.body.top_k || undefined,
  }

  function getGeminiBody() {
    return {
      contents: convertGooglePrompt(request.body.prompt),
      safetySettings: undefined,
      generationConfig: generationConfig,
    }
  }
  
  const body = getGeminiBody();

  try {
    const controller = new AbortController();
    request.socket.removeAllListeners()
    request.socket.on('close', () => controller.abort());
    const apiVersion = 'v1beta';
    const responseType = 'streamGenerateContent';
    const url = `https://api.makersuite.org/${apiVersion}/models/${model}/${responseType}`;
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    try {
      let partialdata = '';
      generateResponse.body.on('data', (data) => {
        const chunk = data.toString();

        if (chunk.startsWith(',') || chunk.endsWith(',') || chunk.startsWith('[') || chunk.endsWith(']')) {
          partialData = chunk.slice(1);
        }
        else {
          partialData += chunk;
        }
      })
    }
  }

  catch (error) {
    console.error(error);
  }
}
