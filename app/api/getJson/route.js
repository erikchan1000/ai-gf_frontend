import Nia from '../../../utils/nia.json';
import Garth from '../../../utils/garth.json';

export async function POST(req) {
  const model = await req.json();
  console.log("Request Body", model.model)

  switch (model.model) {
    case 'nia':
      return new Response(JSON.stringify(Nia), { status: 200 });
    case 'garth':
      return new Response(JSON.stringify(Garth), { status: 200 });
    default:
      return new Response(JSON.stringify({
        prompt: ""
      }), { status: 200 });
  }
}
