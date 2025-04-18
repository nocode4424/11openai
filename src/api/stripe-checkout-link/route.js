async function handler({ redirectURL }) {
  const session = getSession();
  const email = session.user?.email;

  if (email) {
    const customerData = await stripe.customers.list({ email, limit: 1 });
    let [customer] = customerData?.data || [];

    if (!customer) {
      customer = await stripe.customers.create({ email });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${redirectURL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: redirectURL,
    });
    return { url: session.url };
  }
}
export async function POST(request) {
  return handler(await request.json());
}