async function handler({ bundleSize = 10 }) {
  const session = getSession();

  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const [user] = await sql`
      SELECT * FROM users 
      WHERE id = ${session.user.id}
    `;

    if (!user) {
      return { error: "User not found" };
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${bundleSize} Call Bundle`,
              description: `Bundle of ${bundleSize} AI-powered calls`,
            },
            unit_amount: bundleSize * 500, // $5 per call
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
      metadata: {
        userId: session.user.id,
        bundleSize: bundleSize,
      },
    });

    return {
      success: true,
      url: checkoutSession.url,
    };
  } catch (error) {
    return {
      error: "Failed to create checkout session",
      details: error.message,
    };
  }
}
export async function POST(request) {
  return handler(await request.json());
}