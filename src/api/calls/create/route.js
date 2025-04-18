async function handler({ callType, goal, targetContext, instructions, toneDescription }) {
  const session = getSession();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  if (!callType || !goal || !targetContext || !instructions || !toneDescription) {
    return { error: "Missing required fields" };
  }

  if (!["clone", "self", "assistant"].includes(callType)) {
    return { error: "Invalid call type" };
  }

  try {
    // Extract 10-digit phone number from the targetContext input
    const cleanedPhone = (targetContext || "").replace(/\D/g, "");
    if (cleanedPhone.length !== 10) {
      return { error: "Invalid phone number format" };
    }

    // Initialize an empty transcript
    const transcript = [];
    // Insert new call and return the row
    const [call] = await sql`
      INSERT INTO calls (
        user_id,
        call_type,
        goal,
        target_number,
        target_context,
        instructions,
        tone_description,
        transcript,
        status
      )
      VALUES (
        ${session.user.id},
        ${callType},
        ${goal},
        ${cleanedPhone},
        ${targetContext},
        ${instructions},
        ${toneDescription},
        ${transcript},
        'pending'
      )
      RETURNING *
    `;

    // Initiate outbound call via Twilio REST API
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioFrom = process.env.TWILIO_PHONE_NUMBER;
    const connectUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/calls/connect?callId=${call.id}`;
    await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${accountSid}:${authToken}`
          ).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: `+1${cleanedPhone}`,
          From: twilioFrom,
          Url: connectUrl,
        }),
      }
    );
    return { success: true, call };
  } catch (error) {
    return {
      error: "Failed to create call",
      details: error.message,
    };
  }
}
export async function POST(request) {
  return handler(await request.json());
}