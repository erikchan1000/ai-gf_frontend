import { GoogleGenerativeAI } from "@google/generative-ai";

const genAPI = process.env.GENERATIVE_API_KEY || '';

const genAI = new GoogleGenerativeAI(genAPI);
const model = genAI.getGenerativeModel({model: 'gemini-prop'});


async function* streamIterator(stream: AsyncGenerator<any>){
  for await (const chunk of stream) {
    yield chunk.text;
  }
}

function iteratorToStream(iterator: AsyncIterator<string>) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();
      if (done) {
        controller.close();
      }
      else {
        controller.enqueue(value)
      }
    }
  });
}

export async function POST(request: Request) {
  const req = await request.json();

  try {
    const result = await model.generateContentStream(req);
    const stream = iteratorToStream(streamIterator(result.stream));

    const response = await fetch('/api/eleven_labs', {
      method: "POST",
      body: stream, 
    })


    return new Response(stream, { status: 200 });
  }
  catch (error) {
    console.log(error);
    return new Response("Error", {status: 500});
  }
}
