/**
 * API to fetch call details, including live transcript.
 */
export async function GET(request, { params }) {
  const { callId } = params;
  if (!callId) {
    return new Response('Missing callId', { status: 400 });
  }
  const [call] = await sql`
    SELECT id, status, transcript
    FROM calls
    WHERE id = ${callId}
  `;
  if (!call) {
    return new Response('Call not found', { status: 404 });
  }
  return new Response(JSON.stringify({
    id: call.id,
    status: call.status,
    transcript: call.transcript,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
}