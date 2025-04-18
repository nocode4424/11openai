async function handler() {
  const session = getSession();

  if (!session?.user?.id) {
    return {
      error: "Unauthorized",
      message: "User not logged in",
    };
  }

  try {
    const [user] = await sql`
      SELECT credits, verified 
      FROM users 
      WHERE id = ${session.user.id}
    `;

    if (!user) {
      return {
        error: "Not found",
        message: "User not found",
      };
    }

    const [subscription] = await sql`
      SELECT SUM(bundle_size) as total_purchased
      FROM subscriptions
      WHERE user_id = ${session.user.id}
    `;

    return {
      success: true,
      credits: user.credits || 0,
      verified: user.verified || false,
      totalPurchased: subscription?.total_purchased || 0,
    };
  } catch (error) {
    return {
      error: "Database error",
      message: error.message,
    };
  }
}
export async function POST(request) {
  return handler(await request.json());
}