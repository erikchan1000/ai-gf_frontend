import { updateModelAndChat } from '../../test/route.js';

export async function POST(request) {
  const data = await request.json();
  console.log("Request Body", data.prompt)
  try {
    await updateModelAndChat(data.prompt); 
    return new Response('model updated', { status: 200 });
  }
  catch (error) {
    return new Response(error, { status: 500, error});
  }
}
