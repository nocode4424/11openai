async function handler() {
  const session = getSession();

  if (!session?.user?.email) {
    return {
      status: "unauthenticated",
      message: "User not logged in",
    };
  }

  const results = await sql`
    SELECT subscription_status, stripe_id 
    FROM auth_users 
    WHERE email = ${session.user.email}
  `;

  if (!results.length) {
    return {
      status: "not_found",
      message: "User not found",
    };
  }

  const { subscription_status, stripe_id } = results[0];

  // If we have a stripe ID but no status, double check with Stripe
  if (stripe_id && !subscription_status) {
    try {
      const subscription = await stripe.customers.retrieve(stripe_id, {
        expand: ["subscriptions"],
      });

      if (subscription?.subscriptions?.data[0]?.status) {
        // Update our database with latest status from Stripe
        await sql`
          UPDATE auth_users 
          SET subscription_status = ${subscription.subscriptions.data[0].status}
          WHERE email = ${session.user.email}
        `;
        return {
          status: subscription.subscriptions.data[0].status,
          stripeId: stripe_id,
        };
      }
    } catch (error) {
      console.error("Error fetching from Stripe:", error);
    }
  }

  return {
    status: subscription_status || "none",
    stripeId: stripe_id,
  };
}
export async function POST(request) {
  return handler(await request.json());
}