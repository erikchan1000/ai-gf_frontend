
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAPI = process.env.GENERATIVE_API_KEY;
const { VertexAI } = require('@google-cloud/vertexai');

const vertexAI = new VertexAI({project: 'breakinghits-22ab7', location: 'us-central1'});
const model = vertexAI.getGenerativeModel({model: 'gemini-1.0-pro'});


async function* streamIterator(stream) {

  for await (const chunk of stream) {
    for (const candidate of chunk["candidates"]) {
        console.log("Candidates", candidate)
      }
    yield chunk["candidates"][0]["content"]["parts"][0]["text"];
  }
}

function iteratorToStream(iterator) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();
      console.log("Text", value);
      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    }
  });
}


export async function POST(request) {
  console.log("Request Body")
  let req = await request.json();
  console.log(req);

  try {
    console.log("Generating Content Stream")
    const result = await model.generateContentStream( req, {stream: true, max_tokens: 100, temperature: 0.5, top_p: 1, frequency_penalty: 0, presence_penalty: 0, stop: ["\n"]})

    console.log("Result")
    const stream = iteratorToStream(streamIterator(result.stream));
    
    return new Response(stream, { status: 200 });
  } 

  catch (error) {
    console.log(error);
    return new Response('No response body', { status: 500 });

  }
}


