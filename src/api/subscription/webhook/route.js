async function handler(event, request) {
  function verifyStripeWebhook(secret, body, signature) {
    const sigHeader = signature.split(",");
    const timestamp = sigHeader.find((x) => x.startsWith("t=")).split("=")[1];
    const actualSig = sigHeader.find((x) => x.startsWith("v1=")).split("=")[1];
    const signedPayload = `${timestamp}.${body}`;

    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(signedPayload, "utf8")
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(expectedSig),
      Buffer.from(actualSig)
    );
  }

  const isVerified = verifyStripeWebhook(
    process.env.STRIPE_WEBHOOK_SECRET,
    request["body"],
    request["headers"]["stripe-signature"]
  );

  if (!isVerified) {
    return { error: "Invalid signature" };
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      await sql.transaction(async (sql) => {
        const [user] = await sql`
          SELECT id, credits FROM users WHERE id = ${session.metadata.userId}
        `;

        if (!user) {
          throw new Error("User not found");
        }

        await sql`
          INSERT INTO subscriptions (
            user_id,
            bundle_size,
            amount_paid
          ) VALUES (
            ${session.metadata.userId},
            ${session.metadata.bundleSize},
            ${session.amount_total / 100}
          )
        `;

        await sql`
          UPDATE users 
          SET credits = credits + ${session.metadata.bundleSize}
          WHERE id = ${session.metadata.userId}
        `;
      });

      return { success: true };
    } catch (error) {
      return {
        error: "Failed to process payment",
        details: error.message,
      };
    }
  }

  return { success: true };
}
export async function POST(request) {
  return handler(await request.json());
}