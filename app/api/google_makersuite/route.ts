import {convertGooglePrompt} from "@/middleware/googlePromptConverter";
import { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream';
import fetch from 'node-fetch';
import prompts from '@/utils/prompt.json';

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



async function sendMakerSuiteRequest(request: GoogleRequest, res: NextApiResponse) {
  const apiKey = process.env.MAKER_SUITE_API_KEY;
  console.log(prompts);

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
    const generateResponse = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    
    if (generateResponse.body === null) {
      return new Response('No response body', { status: 500 });
    }


    try {
      let partialData = '';
      generateResponse.body.on('data', (data: any) => {
       const chunk = data.toString();

       if (chunk.startsWith(',') || chunk.endsWith(',') || chunk.startsWith('[') || chunk.endsWith(']')) {
         partialData = chunk.slick(1);
       }
       else {
         partialData += chunk;
       }

       while (true) {
         let json;
         try {
           json = JSON.parse(partialData);
         } catch (e) {
           break;
         }
         res.write(JSON.stringify(json));
         console.log(JSON.stringify(json));
         partialData = '';
       }

      });

      request.socket.on('close', () => {
        if (generateResponse.body instanceof Readable) {
          generateResponse.body.destroy();
        };
        res.end();
      });

      generateResponse.body.on('end', () => {
        console.log('Streaming Request finished');
        res.end();
      })
    }
    catch (error) {
      console.log(error);
    }
  }

  catch (error) {
    console.log('Error communicating with the MakerSuite API', error);

    if (!res.headersSent) {
      res.status(500).send('Internal Server Error');
    }
  }
}

export async function POST(request: NextApiRequest) {
  return Response.error();
}
