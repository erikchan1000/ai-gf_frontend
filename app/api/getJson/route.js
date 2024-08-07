import Nia from '../../../utils/nia.json';

export async function GET() {
  return Response.json(Nia);
}
