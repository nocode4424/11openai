async function handler({ phoneNumber, code }) {
  if (!phoneNumber || !code) {
    return { error: "Phone number and verification code are required" };
  }

  const cleanedPhone = phoneNumber.replace(/\D/g, "");
  if (cleanedPhone.length !== 10) {
    return { error: "Invalid phone number format" };
  }

  try {
    const response = await fetch(
      `https://verify.twilio.com/v2/Services/${process.env.TWILIO_SERVICE_ID}/VerificationCheck`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
          ).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: `+1${cleanedPhone}`,
          Code: code,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        error: "Verification failed",
        details: result.message,
      };
    }

    if (result.status === "approved") {
      const [user] = await sql`
        UPDATE users 
        SET verified = true 
        WHERE phone_number = ${cleanedPhone}
        RETURNING *
      `;

      return {
        success: true,
        verified: true,
        user,
      };
    }

    return {
      success: false,
      verified: false,
      message: "Invalid verification code",
    };
  } catch (error) {
    return {
      error: "Failed to verify phone number",
      details: error.message,
    };
  }
}
export async function POST(request) {
  return handler(await request.json());
}