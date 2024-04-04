
import prompts from '@/utils/prompt.json';
const { VertexAI, HarmCategory, HarmBlockThreshold } = require('@google-cloud/vertexai');

const prompt = `You are a support bot for a music company called breaking hits.\n
  This is background information on Breaking hits:\n${prompts["information_prompt"]}\n
  If asked about irrelevant information, respond with "I'm sorry, I don't have that information".\n
  This is your personality: ${prompts["personality_prompt"]}\n
`


const vertexAI = new VertexAI({project: 'breakinghits-22ab7', location: 'us-central1'});
const model = vertexAI.getGenerativeModel({model: 'gemini-1.0-pro', 
  safety_settings: [{
    category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
    threshold: 'BLOCK_ONLY_HIGH'
  }, {
    category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
    threshold: 'BLOCK_ONLY_HIGH'

  }, {
    category: 'HARM_CATEGORY_HATE_SPEECH',
    threshold: 'BLOCK_ONLY_HIGH'
  }, {
    category: 'HARM_CATEGORY_HARASSMENT',
    threshold: 'BLOCK_ONLY_HIGH'
  }]
}
);
const chat = model.startChat({});
await chat.sendMessage(prompt);
console.log("Reinitializing")


async function* streamIterator(stream) {

  for await (const chunk of stream) {
    for (const candidate of chunk["candidates"]) {
        console.log("Candidates", candidate)
    }
    
    if (!("content" in chunk["candidates"][0])) {
      yield "Error: I'm sorry, I don't have that information.";
    }

    else {
      yield chunk["candidates"][0]["content"]["parts"][0]["text"];
    }

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
    const result = await chat.sendMessageStream( req.chatMessage )

    console.log("Result")
    const stream = iteratorToStream(streamIterator(result.stream));
    
    return new Response(stream, { status: 200 });
  } 

  catch (error) {
    console.log(error);
    return new Response('No response body', { status: 500 });

  }
}


